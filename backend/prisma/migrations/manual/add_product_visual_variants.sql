-- ============================================
-- PRODUCT VISUAL VARIANTS (SIN IMPACTO INVENTARIO/FIFO)
-- ============================================

CREATE TABLE IF NOT EXISTS "ProductVisualVariant" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "image" TEXT NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductVisualVariant_tenantId_fkey') THEN
        ALTER TABLE "ProductVisualVariant"
        ADD CONSTRAINT "ProductVisualVariant_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ProductVisualVariant_productId_fkey') THEN
        ALTER TABLE "ProductVisualVariant"
        ADD CONSTRAINT "ProductVisualVariant_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "Product"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "ProductVisualVariant_tenantId_productId_idx"
ON "ProductVisualVariant" ("tenantId", "productId");

CREATE INDEX IF NOT EXISTS "ProductVisualVariant_productId_sortOrder_idx"
ON "ProductVisualVariant" ("productId", "sortOrder");
