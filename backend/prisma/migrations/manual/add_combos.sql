-- ============================================
-- COMBOS + SNAPSHOT DE COMBOS EN FACTURA
-- ============================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ComboPricingType') THEN
        CREATE TYPE "ComboPricingType" AS ENUM ('FIXED', 'PERCENT_OFF');
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "Combo" (
    "id" TEXT PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "image" TEXT,
    "pricingType" "ComboPricingType" NOT NULL DEFAULT 'FIXED',
    "fixedPrice" DECIMAL NOT NULL DEFAULT 0,
    "discountPercent" DECIMAL NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPublic" BOOLEAN NOT NULL DEFAULT true,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Combo_tenantId_fkey') THEN
        ALTER TABLE "Combo"
        ADD CONSTRAINT "Combo_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "Combo_tenantId_idx" ON "Combo" ("tenantId");
CREATE INDEX IF NOT EXISTS "Combo_isActive_idx" ON "Combo" ("isActive");

CREATE TABLE IF NOT EXISTS "ComboItem" (
    "id" TEXT PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "comboId" TEXT NOT NULL,
    "productId" TEXT NOT NULL
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ComboItem_comboId_fkey') THEN
        ALTER TABLE "ComboItem"
        ADD CONSTRAINT "ComboItem_comboId_fkey"
        FOREIGN KEY ("comboId") REFERENCES "Combo"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'ComboItem_productId_fkey') THEN
        ALTER TABLE "ComboItem"
        ADD CONSTRAINT "ComboItem_productId_fkey"
        FOREIGN KEY ("productId") REFERENCES "Product"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;

CREATE UNIQUE INDEX IF NOT EXISTS "ComboItem_comboId_productId_key" ON "ComboItem" ("comboId", "productId");
CREATE INDEX IF NOT EXISTS "ComboItem_productId_idx" ON "ComboItem" ("productId");

ALTER TABLE "InvoiceItem"
ADD COLUMN IF NOT EXISTS "comboId" TEXT,
ADD COLUMN IF NOT EXISTS "comboName" TEXT;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InvoiceItem_comboId_fkey') THEN
        ALTER TABLE "InvoiceItem"
        ADD CONSTRAINT "InvoiceItem_comboId_fkey"
        FOREIGN KEY ("comboId") REFERENCES "Combo"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END
$$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Invoice_warehouseId_fkey') THEN
        ALTER TABLE "Invoice"
        ADD CONSTRAINT "Invoice_warehouseId_fkey"
        FOREIGN KEY ("warehouseId") REFERENCES "Warehouse"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;
END
$$;

CREATE TABLE IF NOT EXISTS "InvoiceCombo" (
    "id" TEXT PRIMARY KEY,
    "quantity" INTEGER NOT NULL,
    "baseUnitPrice" DECIMAL NOT NULL,
    "finalUnitPrice" DECIMAL NOT NULL,
    "discountPerUnit" DECIMAL NOT NULL DEFAULT 0,
    "comboName" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "comboId" TEXT,
    "tenantId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InvoiceCombo_invoiceId_fkey') THEN
        ALTER TABLE "InvoiceCombo"
        ADD CONSTRAINT "InvoiceCombo_invoiceId_fkey"
        FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InvoiceCombo_comboId_fkey') THEN
        ALTER TABLE "InvoiceCombo"
        ADD CONSTRAINT "InvoiceCombo_comboId_fkey"
        FOREIGN KEY ("comboId") REFERENCES "Combo"("id")
        ON DELETE SET NULL ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InvoiceCombo_tenantId_fkey') THEN
        ALTER TABLE "InvoiceCombo"
        ADD CONSTRAINT "InvoiceCombo_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id")
        ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END
$$;

CREATE INDEX IF NOT EXISTS "InvoiceCombo_tenantId_createdAt_idx" ON "InvoiceCombo" ("tenantId", "createdAt");
CREATE INDEX IF NOT EXISTS "InvoiceCombo_invoiceId_idx" ON "InvoiceCombo" ("invoiceId");
