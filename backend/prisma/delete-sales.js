const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

/**
 * MODO DE USO:
 * 
 * 1. Desde la carpeta 'backend', ejecutar:
 *    node prisma/delete-sales.js
 * 
 * Este script elimina todas las facturas, sus detalles y los movimientos 
 * de inventario asociados a ventas de TODA la base de datos.
 */

// --- CARGA DE VARIABLES DE ENTORNO ---
function loadEnv() {
    const envPath = path.resolve(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const content = fs.readFileSync(envPath, 'utf8');
        content.split(/\r?\n/).forEach(line => {
            const matches = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
            if (matches) {
                let val = (matches[2] || '').trim();
                val = val.replace(/^['"]|['"]$/g, '');
                process.env[matches[1]] = val;
            }
        });
    }
}
loadEnv();

// --- LÓGICA DE CONEXIÓN ROBUSTA ---
async function getWorkingPrismaClient() {
    const directUrl = process.env.DIRECT_URL;
    const poolerUrl = process.env.DATABASE_URL;

    if (directUrl) {
        const prisma = new PrismaClient({ datasources: { db: { url: directUrl } } });
        try {
            await prisma.$connect();
            return prisma;
        } catch (e) {
            await prisma.$disconnect();
        }
    }

    if (poolerUrl) {
        const prisma = new PrismaClient({ datasources: { db: { url: poolerUrl } } });
        try {
            await prisma.$connect();
            return prisma;
        } catch (e) {
            await prisma.$disconnect();
        }
    }

    throw new Error('No se pudo conectar a la base de datos. Verifica tu archivo .env');
}

async function main() {
    const prisma = await getWorkingPrismaClient();

    console.log('⚠️ Iniciando proceso de eliminación de TODAS las ventas...');

    try {
        // 1. Eliminar Items de Facturas (Hijos)
        console.log('1/4: Eliminando detalles de facturas (InvoiceItem)...');
        const itemsResult = await prisma.invoiceItem.deleteMany({});
        console.log(`✅ Items eliminados: ${itemsResult.count}`);

        // 2. Eliminar Movimientos de Stock de tipo SALE (Kardex)
        console.log('2/4: Eliminando movimientos de inventario de tipo SALE...');
        const movementResult = await prisma.stockMovement.deleteMany({
            where: {
                type: 'SALE'
            }
        });
        console.log(`✅ Movimientos de stock eliminados: ${movementResult.count}`);

        // 3. Eliminar Facturas (Padres)
        console.log('3/4: Eliminando facturas (Invoice)...');
        const invoiceResult = await prisma.invoice.deleteMany({});
        console.log(`✅ Facturas eliminadas: ${invoiceResult.count}`);

        // 4. Reiniciar el contador (secuencia) de facturas
        console.log('4/4: Reiniciando contador de facturas...');
        try {
            await prisma.$executeRawUnsafe('ALTER SEQUENCE "Invoice_invoiceNumber_seq" RESTART WITH 1;');
            console.log('✅ Contador reiniciado a 1.');
        } catch (seqError) {
            console.warn('⚠️ No se pudo reiniciar la secuencia (puede que no exista en este entorno):', seqError.message);
        }

        console.log('\n✨ ¡Proceso completado satisfactoriamente!');
        console.log('Nota: El stock físico no se ha modificado automáticamente. Si deseas restaurar el stock, deberás ajustarlo manualmente o re-importar productos.');

    } catch (error) {
        console.error('💥 Error durante la eliminación:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(e => {
    console.error('💥 Error fatal:', e);
    process.exit(1);
});
