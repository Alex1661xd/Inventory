const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

/**
 * MODO DE USO:
 * 
 * 1. Desde la carpeta 'backend', ejecutar:
 *    node prisma/seed-products.js <cantidad_o_comando>
 * 
 * EJEMPLOS:
 *    node prisma/seed-products.js 20      -> Crea 20 productos de prueba
 *    node prisma/seed-products.js delete  -> Borra los productos de prueba creados
 *    node prisma/seed-products.js         -> Crea 100 productos (valor por defecto)
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

    // Intentar conexión directa primero
    if (directUrl) {
        const prisma = new PrismaClient({ datasources: { db: { url: directUrl } } });
        try {
            await prisma.$connect();
            return prisma;
        } catch (e) {
            await prisma.$disconnect();
        }
    }

    // Fallback al pooler
    if (poolerUrl) {
        const prisma = new PrismaClient({ datasources: { db: { url: poolerUrl } } });
        try {
            await prisma.$connect();
            return prisma;
        } catch (e) {
            await prisma.$disconnect();
        }
    }

    throw new Error('No se pudo conectar a la base de datos.');
}

async function deleteTestData(prisma, tenantId) {
    console.log(`🧹 Eliminando productos de prueba para el tenant ${tenantId}...`);

    const result = await prisma.product.deleteMany({
        where: {
            tenantId,
            OR: [
                { name: { startsWith: 'Producto Demo' } },
                { name: { startsWith: 'Producto Ligero' } },
                { barcode: { startsWith: 'MUE-LITE' } },
                { barcode: { startsWith: 'MUE-SEED' } }
            ]
        }
    });

    console.log(`✅ Se eliminaron ${result.count} productos de prueba.`);
}

async function createTestData(prisma, tenantId, categoryId, total = 100) {
    console.log(`🚀 Iniciando seeding de ${total} productos para el Tenant: ${tenantId}...`);

    const batchSize = Math.min(100, total);

    for (let i = 0; i < total; i += batchSize) {
        const products = [];
        const currentBatchSize = Math.min(batchSize, total - i);

        for (let j = 0; j < currentBatchSize; j++) {
            const n = i + j + 1;
            const unique = Math.random().toString(36).substring(7).toUpperCase();

            products.push({
                name: `Producto Demo ${n}`,
                description: `Mueble de prueba #${n}`,
                sku: `SKU-${n}-${unique.substring(0, 3)}`,
                barcode: `MUE-LITE-${n}-${unique}`,
                imageUrl: null,
                images: [],
                costPrice: 100000.0,
                salePrice: 150000.0,
                isPublic: true,
                tenantId,
                categoryId,
            });
        }

        await prisma.product.createMany({
            data: products,
            skipDuplicates: true
        });
        console.log(`✅ ${i + currentBatchSize} / ${total} productos creados.`);
    }
    console.log('✨ ¡Seeding finalizado!');
}

async function main() {
    const prisma = await getWorkingPrismaClient();
    const command = process.argv[2]; // Capturamos el argumento de consola
    const tenantId = '4c557dcf-3667-4e90-b319-096d0afc0b77';
    const categoryId = 'cdb13367-dc46-4ed7-9846-e87bbd984665';

    try {
        if (command === 'delete') {
            await deleteTestData(prisma, tenantId);
        } else {
            const count = parseInt(command) || 100; // Por defecto 100 si no se especifica
            await createTestData(prisma, tenantId, categoryId, count);
        }
    } finally {
        await prisma.$disconnect();
    }
}

main().catch(e => {
    console.error('💥 Error fatal:', e);
    process.exit(1);
});
