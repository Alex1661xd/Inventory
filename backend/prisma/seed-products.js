const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

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
    // 1. Intentar conexión DIRECTA (Mejor para scripts)
    const directUrl = process.env.DIRECT_URL;
    if (directUrl) {
        console.log('📡 Intentando conectar vía DIRECT_URL (Puerto 5432)...');
        const prisma = new PrismaClient({ datasources: { db: { url: directUrl } } });
        try {
            await prisma.$connect();
            console.log('✅ Conectado exitosamente al puerto 5432.');
            return prisma;
        } catch (e) {
            console.warn(`⚠️ Falló conexión directa: ${e.message.split('\n')[0]}`);
            await prisma.$disconnect();
        }
    }

    // 2. Intentar conexión POOLER (Fallback)
    const poolerUrl = process.env.DATABASE_URL;
    if (poolerUrl) {
        console.log('📡 Intentando conectar vía DATABASE_URL (Puerto 6543)...');
        const prisma = new PrismaClient({ datasources: { db: { url: poolerUrl } } });
        try {
            await prisma.$connect();
            console.log('✅ Conectado exitosamente al puerto 6543.');
            return prisma;
        } catch (e) {
            console.error(`❌ También falló conexión al pooler: ${e.message.split('\n')[0]}`);
            await prisma.$disconnect();
        }
    }

    throw new Error('No se pudo conectar a la base de datos por ningún método.');
}

async function main() {
    const prisma = await getWorkingPrismaClient();

    const tenantId = '4c557dcf-3667-4e90-b319-096d0afc0b77';
    const categoryId = 'cdb13367-dc46-4ed7-9846-e87bbd984665';

    console.log('\n🚀 Iniciando seeding de 1000 productos (SIN IMÁGENES)...');

    const total = 1000;
    const batchSize = 50; // Bajamos el batch size para asegurar estabilidad

    for (let i = 0; i < total; i += batchSize) {
        const products = [];
        for (let j = 0; j < batchSize; j++) {
            const n = i + j + 1;
            const unique = Math.random().toString(36).substring(7).toUpperCase();

            products.push({
                name: `Producto Demo ${n}`,
                // Descripción opcional
                description: `Ref-${n}`,
                sku: `SKU-${n}-${unique.substring(0, 3)}`,
                barcode: `MUE-LITE-${n}-${unique}`,

                // SIN IMÁGENES
                imageUrl: null,
                images: [],

                costPrice: 100000.0,
                salePrice: 150000.0,
                isPublic: true,
                tenantId,
                categoryId,
            });
        }

        try {
            await prisma.product.createMany({
                data: products,
                skipDuplicates: true
            });
            console.log(`✅ ${Math.min(i + batchSize, total)} / ${total} productos creados.`);
        } catch (e) {
            console.error(`❌ Error en batch ${i}:`, e.message);
        }
    }

    console.log('✨ ¡Seeding finalizado!');
    await prisma.$disconnect();
}

main().catch(e => {
    console.error('💥 Error fatal:', e);
    process.exit(1);
});
