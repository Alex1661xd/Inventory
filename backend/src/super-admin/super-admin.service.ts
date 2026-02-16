import { Injectable, BadRequestException, ForbiddenException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SupabaseService } from '../supabase/supabase.service';
import * as crypto from 'crypto';

@Injectable()
export class SuperAdminService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly supabaseService: SupabaseService,
    ) { }

    // Generate unique registration codes
    async generateCodes(count: number = 1, expiresInDays?: number) {
        const codes: string[] = [];
        const createdCodes: any[] = [];

        for (let i = 0; i < count; i++) {
            // Generate unique code like: INV-XXXX-XXXX
            const code = `INV-${crypto.randomBytes(2).toString('hex').toUpperCase()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
            codes.push(code);
        }

        for (const code of codes) {
            const expiresAt = expiresInDays
                ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
                : null;

            const created = await this.prisma.registrationCode.create({
                data: {
                    code,
                    expiresAt,
                },
            });
            createdCodes.push(created);
        }

        return createdCodes;
    }

    // List all registration codes
    async listCodes() {
        return this.prisma.registrationCode.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                tenants: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
            },
        });
    }

    // Validate a registration code (used during registration)
    async validateCode(code: string) {
        const registrationCode = await this.prisma.registrationCode.findUnique({
            where: { code },
        });

        if (!registrationCode) {
            throw new BadRequestException('Código de registro inválido');
        }

        if (registrationCode.isUsed) {
            throw new BadRequestException('Este código ya fue utilizado');
        }

        if (registrationCode.expiresAt && registrationCode.expiresAt < new Date()) {
            throw new BadRequestException('Este código ha expirado');
        }

        return registrationCode;
    }

    // Mark code as used
    async markCodeAsUsed(codeId: string, tenantId: string) {
        return this.prisma.registrationCode.update({
            where: { id: codeId },
            data: {
                isUsed: true,
                usedAt: new Date(),
            },
        });
    }

    // List all tenants with stats
    async listTenants() {
        const tenants = await this.prisma.tenant.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                _count: {
                    select: {
                        users: true,
                        products: true,
                        warehouses: true,
                        suppliers: true,
                        customers: true,
                        invoices: true,
                        purchases: true,
                        categories: true,
                    },
                },
                registrationCode: {
                    select: {
                        code: true,
                    },
                },
            },
        });

        return tenants.map(t => ({
            id: t.id,
            name: t.name,
            slug: t.slug,
            createdAt: t.createdAt,
            isBanned: t.isBanned,
            bannedAt: t.bannedAt,
            registrationCode: t.registrationCode?.code || null,
            stats: {
                users: t._count.users,
                products: t._count.products,
                warehouses: t._count.warehouses,
                suppliers: t._count.suppliers,
                customers: t._count.customers,
                invoices: t._count.invoices,
                purchases: t._count.purchases,
                categories: t._count.categories,
            },
        }));
    }

    // Ban a tenant
    async banTenant(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new NotFoundException('Negocio no encontrado');
        }

        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                isBanned: true,
                bannedAt: new Date(),
            },
        });
    }

    // Unban a tenant
    async unbanTenant(tenantId: string) {
        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new NotFoundException('Negocio no encontrado');
        }

        return this.prisma.tenant.update({
            where: { id: tenantId },
            data: {
                isBanned: false,
                bannedAt: null,
            },
        });
    }

    // Delete all tenant data (DANGEROUS - requires password verification)
    async deleteAllTenantData(tenantId: string, superAdminPassword: string, confirmation: string) {
        // Verify confirmation word
        if (confirmation !== 'confirmar') {
            throw new BadRequestException('Debes escribir "confirmar" para proceder');
        }

        // Verify super admin password via Supabase Auth
        const superAdminUser = await this.prisma.user.findFirst({
            where: { role: 'SUPER_ADMIN' },
        });

        if (!superAdminUser) {
            throw new ForbiddenException('No se encontró el Super Admin');
        }

        // Try to login with Supabase to verify password
        const { data, error } = await this.supabaseService.getClient().auth.signInWithPassword({
            email: superAdminUser.email,
            password: superAdminPassword,
        });

        if (error || !data.user) {
            throw new ForbiddenException('Contraseña incorrecta');
        }

        const tenant = await this.prisma.tenant.findUnique({
            where: { id: tenantId },
        });

        if (!tenant) {
            throw new NotFoundException('Negocio no encontrado');
        }

        // 1. Get all products to collect image URLs before they are deleted
        const products = await this.prisma.product.findMany({
            where: { tenantId },
            select: { images: true }
        });

        const imagesToDelete: string[] = [];
        products.forEach(p => {
            if (p.images && p.images.length > 0) {
                imagesToDelete.push(...p.images);
            }
        });

        // 2. Get users for Supabase Auth deletion
        const usersToDelete = await this.prisma.user.findMany({
            where: { tenantId },
            select: { id: true },
        });

        // Delete all related data in transaction
        // Increased timeout to 30s to handle large datasets
        await this.prisma.$transaction(async (tx) => {
            // Delete in order of dependencies (Child to Parent)

            // 1. Invoice Items (child of Invoice)
            await tx.invoiceItem.deleteMany({
                where: { invoice: { tenantId } },
            });

            // 2. Invoices (child of Tenant/Customer/User)
            await tx.invoice.deleteMany({
                where: { tenantId },
            });

            // 3. Cash Transactions (child of CashShift)
            await tx.cashTransaction.deleteMany({
                where: { shift: { tenantId } },
            });

            // 4. Cash Shifts (child of Tenant/User)
            await tx.cashShift.deleteMany({
                where: { tenantId },
            });

            // 5. Stock Batches (child of Tenant/Product/Warehouse/PurchaseItem)
            await tx.stockBatch.deleteMany({
                where: { tenantId },
            });

            // 6. Stock Movements (child of Product/Warehouse/User)
            await tx.stockMovement.deleteMany({
                where: { product: { tenantId } },
            });

            // 7. Stock (child of Product/Warehouse)
            await tx.stock.deleteMany({
                where: { product: { tenantId } },
            });

            // 8. Purchase Items (child of Purchase)
            await tx.purchaseItem.deleteMany({
                where: { purchase: { tenantId } },
            });

            // 9. Purchase Payments (child of Purchase/User)
            await tx.purchasePayment.deleteMany({
                where: { tenantId },
            });

            // 10. Purchases (child of Tenant/Supplier/User)
            await tx.purchase.deleteMany({
                where: { tenantId },
            });

            // 11. Expenses (child of Tenant/Supplier/User)
            await tx.expense.deleteMany({
                where: { tenantId },
            });

            // 12. Products (child of Tenant/Category)
            await tx.product.deleteMany({
                where: { tenantId },
            });

            // 13. Categories (child of Tenant)
            await tx.category.deleteMany({
                where: { tenantId },
            });

            // 14. Suppliers (child of Tenant)
            await tx.supplier.deleteMany({
                where: { tenantId },
            });

            // 15. Customers (child of Tenant)
            await tx.customer.deleteMany({
                where: { tenantId },
            });

            // 16. Warehouses (child of Tenant)
            await tx.warehouse.deleteMany({
                where: { tenantId },
            });

            // 17. Users (last database dependency)
            await tx.user.deleteMany({
                where: { tenantId },
            });

            // 18. Finally, update tenant to show it's been wiped
            await tx.tenant.update({
                where: { id: tenantId },
                data: {
                    name: `[ELIMINADO] ${tenant.name}`,
                    isBanned: true,
                    bannedAt: new Date(),
                },
            });
        }, {
            timeout: 30000, // 30 seconds
        });

        // 3. AFTER transaction succeeds, delete users from Supabase Auth
        for (const user of usersToDelete) {
            try {
                await this.supabaseService.getClient().auth.admin.deleteUser(user.id);
            } catch (e) {
                console.error(`Error deleting user ${user.id} from Supabase:`, e);
            }
        }

        // 4. Clean up images from Storage
        if (imagesToDelete.length > 0) {
            try {
                const supabase = this.supabaseService.getClient();
                // Extract relative paths from URLs
                const paths = imagesToDelete
                    .filter(url => url && url.includes('supabase'))
                    .map(url => {
                        try {
                            const urlObj = new URL(url);
                            const parts = urlObj.pathname.split('/product-images/');
                            return parts.length > 1 ? parts[1] : null;
                        } catch (e) { return null; }
                    })
                    .filter(p => p !== null) as string[];

                if (paths.length > 0) {
                    console.log(`🧹 [SuperAdmin] Eliminando ${paths.length} imágenes del storage para negocio wipeado`);
                    await supabase.storage.from('product-images').remove(paths);
                }
            } catch (error) {
                console.error('⚠️ [SuperAdmin] Error al limpiar storage de imágenes:', error.message);
            }
        }

        return { success: true, message: 'Todos los datos del negocio han sido eliminados' };
    }

    // Delete a registration code
    async deleteCode(codeId: string) {
        const code = await this.prisma.registrationCode.findUnique({
            where: { id: codeId },
        });

        if (!code) {
            throw new NotFoundException('Código no encontrado');
        }

        if (code.isUsed) {
            throw new BadRequestException('No se puede eliminar un código que ya fue utilizado');
        }

        return this.prisma.registrationCode.delete({
            where: { id: codeId },
        });
    }
}
