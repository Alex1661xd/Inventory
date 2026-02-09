-- Migración: Agregar configuración del catálogo al modelo Tenant
-- Ejecutar esta migración manualmente en la base de datos Supabase

-- Agregar columnas de configuración del catálogo
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "catalogDescription" TEXT;
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "catalogBgColor" TEXT DEFAULT '#f5f5f4';
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "catalogAccentColor" TEXT DEFAULT '#292524';
ALTER TABLE "Tenant" ADD COLUMN IF NOT EXISTS "catalogEnabled" BOOLEAN DEFAULT true;

-- Verificar que las columnas fueron agregadas
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'Tenant' 
AND column_name IN ('catalogDescription', 'catalogBgColor', 'catalogAccentColor', 'catalogEnabled');
