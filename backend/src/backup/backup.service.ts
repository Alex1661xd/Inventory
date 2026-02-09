import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { google } from 'googleapis';
import * as ExcelJS from 'exceljs';
import { Stream } from 'stream';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class BackupService {
    private oauth2Client;

    constructor(private prisma: PrismaService) {
        this.oauth2Client = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            process.env.GOOGLE_CALLBACK_URL
        );
    }

    // Tarea automática: Todos los días a las 2 AM
    @Cron('0 2 * * *')
    async handleCron() {
        console.log('🚀 Iniciando proceso de backups automáticos...');
        const configs = await this.prisma.backupConfig.findMany({
            where: { isEnabled: true, autoBackupEnabled: true }
        });

        for (const config of configs) {
            try {
                console.log(`📦 Respaldando negocio: ${config.tenantId}`);
                await this.runBackup(config.tenantId);
            } catch (error) {
                console.error(`❌ Error en backup automático para ${config.tenantId}:`, error.message);
            }
        }
        console.log('✅ Proceso de backups automáticos finalizado.');
    }

    async getStatus(tenantId: string) {
        const config = await this.prisma.backupConfig.findUnique({
            where: { tenantId }
        });

        if (!config || !config.refreshToken) {
            return { connected: false };
        }

        return {
            connected: true,
            email: config.googleEmail,
            lastBackupAt: config.lastBackupAt
        };
    }

    async getAuthUrl(tenantId: string) {
        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline', // Importante para obtener el Refresh Token
            scope: [
                'https://www.googleapis.com/auth/drive.file',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            state: tenantId, // Pasamos el tenantId para saber de quién es el token al volver
            prompt: 'consent' // Forzar a mostrar la pantalla de consentimiento para asegurar el refresh token
        });
    }

    async saveTokens(tenantId: string, code: string) {
        try {
            const { tokens } = await this.oauth2Client.getToken(code);

            // Necesitamos el email para guardarlo en la config
            this.oauth2Client.setCredentials(tokens);
            const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
            const userInfo = await oauth2.userinfo.get();

            await this.prisma.backupConfig.upsert({
                where: { tenantId },
                update: {
                    refreshToken: tokens.refresh_token,
                    googleEmail: userInfo.data.email,
                    isEnabled: true,
                },
                create: {
                    tenantId,
                    refreshToken: tokens.refresh_token,
                    googleEmail: userInfo.data.email,
                    isEnabled: true,
                }
            });

            return { success: true, email: userInfo.data.email };
        } catch (error) {
            console.error('Error saving Google tokens:', error);
            throw new BadRequestException('No se pudo conectar con Google Drive');
        }
    }

    async runBackup(tenantId: string) {
        const config = await this.prisma.backupConfig.findUnique({
            where: { tenantId }
        });

        if (!config || !config.refreshToken) {
            throw new NotFoundException('Google Drive no está conectado para este negocio');
        }

        // 1. Obtener datos del negocio
        const data = await this.collectTenantData(tenantId);

        // 2. Generar Excel
        const workbook = await this.createExcelWorkbook(data);

        // 3. Subir a Google Drive
        await this.uploadToDrive(config, workbook);

        // 4. Actualizar fecha de último backup
        await this.prisma.backupConfig.update({
            where: { tenantId },
            data: { lastBackupAt: new Date() }
        });

        return { success: true, date: new Date() };
    }

    private async collectTenantData(tenantId: string) {
        // Obtenemos todo lo relevante para un respaldo total
        const [
            products,
            customers,
            invoices,
            expenses,
            suppliers,
            stockMovements,
            warehouses,
            categories,
            stocks,
            cashShifts,
            purchases
        ] = await Promise.all([
            this.prisma.product.findMany({ where: { tenantId }, include: { category: true } }),
            this.prisma.customer.findMany({ where: { tenantId } }),
            this.prisma.invoice.findMany({ where: { tenantId }, include: { items: { include: { product: true } }, customer: true } }),
            this.prisma.expense.findMany({ where: { tenantId }, include: { supplier: true } }),
            this.prisma.supplier.findMany({ where: { tenantId } }),
            this.prisma.stockMovement.findMany({
                where: { product: { tenantId } },
                include: { product: true, warehouse: true }
            }),
            this.prisma.warehouse.findMany({ where: { tenantId } }),
            this.prisma.category.findMany({ where: { tenantId } }),
            this.prisma.stock.findMany({ where: { product: { tenantId } }, include: { product: true, warehouse: true } }),
            this.prisma.cashShift.findMany({ where: { tenantId }, include: { seller: true } }),
            this.prisma.purchase.findMany({ where: { tenantId }, include: { supplier: true, items: { include: { product: true } } } }),
        ]);

        return {
            products,
            customers,
            invoices,
            expenses,
            suppliers,
            stockMovements,
            warehouses,
            categories,
            stocks,
            cashShifts,
            purchases
        };
    }

    private async createExcelWorkbook(data: any) {
        const workbook = new ExcelJS.Workbook();

        // 1. Hoja de Productos
        const prodSheet = workbook.addWorksheet('Productos');
        prodSheet.columns = [
            { header: 'ID', key: 'id' },
            { header: 'Nombre', key: 'name' },
            { header: 'Categoría', key: 'categoryName' },
            { header: 'SKU', key: 'sku' },
            { header: 'Código de Barras', key: 'barcode' },
            { header: 'Precio Costo', key: 'costPrice' },
            { header: 'Precio Venta', key: 'salePrice' },
            { header: 'Estado', key: 'active' },
        ];
        prodSheet.addRows(data.products.map(p => ({
            ...p,
            categoryName: p.category?.name || 'N/A',
            active: p.active ? 'Activo' : 'Inactivo'
        })));

        // 2. Hoja de Inventario Actual (Por Bodega)
        const invSheet = workbook.addWorksheet('Stock por Almacén');
        invSheet.columns = [
            { header: 'Producto', key: 'productName' },
            { header: 'SKU', key: 'sku' },
            { header: 'Almacén', key: 'warehouseName' },
            { header: 'Cantidad', key: 'quantity' },
        ];
        invSheet.addRows(data.stocks.map(s => ({
            productName: s.product.name,
            sku: s.product.sku,
            warehouseName: s.warehouse.name,
            quantity: s.quantity
        })));

        // 3. Hoja de Ventas
        const salesSheet = workbook.addWorksheet('Ventas');
        salesSheet.columns = [
            { header: 'ID Factura', key: 'invoiceNumber' },
            { header: 'Fecha', key: 'createdAt' },
            { header: 'Cliente', key: 'customerName' },
            { header: 'Subtotal', key: 'total' }, // Simplificado, podrías calcular subtotal real si guardas IVA
            { header: 'Descuento', key: 'discount' },
            { header: 'Total', key: 'netTotal' },
            { header: 'Método Pago', key: 'paymentMethod' },
            { header: 'Estado', key: 'status' },
        ];
        salesSheet.addRows(data.invoices.map(i => ({
            ...i,
            customerName: i.customer?.name || 'Cliente General',
            netTotal: Number(i.total) - Number(i.discount)
        })));

        // 4. Hoja de Gastos
        const expSheet = workbook.addWorksheet('Gastos');
        expSheet.columns = [
            { header: 'Fecha', key: 'date' },
            { header: 'Categoría', key: 'category' },
            { header: 'Descripción', key: 'description' },
            { header: 'Monto', key: 'amount' },
            { header: 'Proveedor', key: 'supplierName' },
        ];
        expSheet.addRows(data.expenses.map(e => ({
            ...e,
            supplierName: e.supplier?.name || 'N/A'
        })));

        // 5. Hoja de Compras
        const purSheet = workbook.addWorksheet('Compras a Proveedores');
        purSheet.columns = [
            { header: 'Nº Compra', key: 'purchaseNumber' },
            { header: 'Fecha', key: 'date' },
            { header: 'Proveedor', key: 'supplierName' },
            { header: 'Total', key: 'total' },
            { header: 'Pagado', key: 'amountPaid' },
            { header: 'Estado', key: 'status' },
        ];
        purSheet.addRows(data.purchases.map(p => ({
            ...p,
            supplierName: p.supplier?.name || 'Desconocido'
        })));

        // 6. Hoja de Clientes
        const custSheet = workbook.addWorksheet('Clientes');
        custSheet.columns = [
            { header: 'Nombre', key: 'name' },
            { header: 'Email', key: 'email' },
            { header: 'Teléfono', key: 'phone' },
            { header: 'Documento', key: 'docNumber' },
            { header: 'Dirección', key: 'address' },
        ];
        custSheet.addRows(data.customers);

        // 7. Hoja de Kardex (Movimientos)
        const kardexSheet = workbook.addWorksheet('Kardex de Inventario');
        kardexSheet.columns = [
            { header: 'Fecha', key: 'createdAt' },
            { header: 'Producto', key: 'productName' },
            { header: 'Almacén', key: 'warehouseName' },
            { header: 'Tipo', key: 'type' },
            { header: 'Cantidad', key: 'quantity' },
            { header: 'Saldo Después', key: 'balanceAfter' },
            { header: 'Referencia', key: 'reference' },
        ];
        kardexSheet.addRows(data.stockMovements.map(m => ({
            ...m,
            productName: m.product.name,
            warehouseName: m.warehouse.name
        })));

        // 8. Hoja de Arqueos de Caja
        const cashSheet = workbook.addWorksheet('Cierres de Caja');
        cashSheet.columns = [
            { header: 'Apertura', key: 'openingTime' },
            { header: 'Cierre', key: 'closingTime' },
            { header: 'Cajero', key: 'sellerName' },
            { header: 'Base Inicial', key: 'initialAmount' },
            { header: 'Monto Sistema', key: 'systemAmount' },
            { header: 'Monto Real', key: 'finalAmount' },
            { header: 'Diferencia', key: 'difference' },
            { header: 'Estado', key: 'status' },
        ];
        cashSheet.addRows(data.cashShifts.map(s => ({
            ...s,
            sellerName: s.seller.name
        })));

        return workbook;
    }

    private async uploadToDrive(config: any, workbook: ExcelJS.Workbook) {
        this.oauth2Client.setCredentials({ refresh_token: config.refreshToken });
        const drive = google.drive({ version: 'v3', auth: this.oauth2Client });

        // 1. Asegurar que existe la carpeta "InventoryPro Backups"
        let folderId = config.targetFolderId;
        if (!folderId) {
            const folderMetadata = {
                name: 'InventoryPro Backups',
                mimeType: 'application/vnd.google-apps.folder',
            };
            const response = await drive.files.create({
                requestBody: folderMetadata,
                fields: 'id',
            } as any);
            folderId = response.data.id;

            // Guardar el ID de la carpeta para la próxima vez
            await this.prisma.backupConfig.update({
                where: { id: config.id },
                data: { targetFolderId: folderId }
            });
        }

        // 2. Preparar el archivo para subir
        const buffer = await workbook.xlsx.writeBuffer();
        const stream = new Stream.PassThrough();
        stream.end(buffer);

        const fileName = `Backup_InventoryPro_${new Date().toISOString().split('T')[0]}.xlsx`;

        // 3. Subir archivo
        await drive.files.create({
            requestBody: {
                name: fileName,
                parents: [folderId],
            },
            media: {
                mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                body: stream,
            },
        } as any);
    }
}
