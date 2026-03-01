ALTER TABLE "Product"
ADD COLUMN IF NOT EXISTS "creditPrice" DECIMAL(65,30) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS "allowCreditSale" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "Invoice"
ADD COLUMN IF NOT EXISTS "isCreditSale" BOOLEAN NOT NULL DEFAULT false;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_type t
        JOIN pg_namespace n ON n.oid = t.typnamespace
        WHERE t.typname = 'CreditSaleStatus'
    ) THEN
        CREATE TYPE "CreditSaleStatus" AS ENUM ('PENDING', 'PARTIAL', 'PAID', 'OVERDUE', 'CANCELLED');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS "CreditSale" (
    "id" TEXT NOT NULL,
    "invoiceId" TEXT NOT NULL,
    "customerId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "totalAmount" DECIMAL(65,30) NOT NULL,
    "downPayment" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "paidAmount" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "balance" DECIMAL(65,30) NOT NULL,
    "installmentsCount" INTEGER NOT NULL,
    "installmentAmount" DECIMAL(65,30) NOT NULL,
    "nextDueDate" TIMESTAMP(3),
    "status" "CreditSaleStatus" NOT NULL DEFAULT 'PENDING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "CreditSale_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "CreditPayment" (
    "id" TEXT NOT NULL,
    "creditSaleId" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paymentMethod" "PaymentMethod" NOT NULL,
    "notes" TEXT,
    "paidAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CreditPayment_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CreditSale_invoiceId_key'
    ) THEN
        ALTER TABLE "CreditSale" ADD CONSTRAINT "CreditSale_invoiceId_key" UNIQUE ("invoiceId");
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CreditSale_invoiceId_fkey'
    ) THEN
        ALTER TABLE "CreditSale" ADD CONSTRAINT "CreditSale_invoiceId_fkey"
        FOREIGN KEY ("invoiceId") REFERENCES "Invoice"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CreditSale_customerId_fkey'
    ) THEN
        ALTER TABLE "CreditSale" ADD CONSTRAINT "CreditSale_customerId_fkey"
        FOREIGN KEY ("customerId") REFERENCES "Customer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CreditSale_tenantId_fkey'
    ) THEN
        ALTER TABLE "CreditSale" ADD CONSTRAINT "CreditSale_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CreditPayment_creditSaleId_fkey'
    ) THEN
        ALTER TABLE "CreditPayment" ADD CONSTRAINT "CreditPayment_creditSaleId_fkey"
        FOREIGN KEY ("creditSaleId") REFERENCES "CreditSale"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CreditPayment_tenantId_fkey'
    ) THEN
        ALTER TABLE "CreditPayment" ADD CONSTRAINT "CreditPayment_tenantId_fkey"
        FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'CreditPayment_createdById_fkey'
    ) THEN
        ALTER TABLE "CreditPayment" ADD CONSTRAINT "CreditPayment_createdById_fkey"
        FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS "CreditSale_tenantId_status_idx" ON "CreditSale"("tenantId", "status");
CREATE INDEX IF NOT EXISTS "CreditSale_tenantId_customerId_idx" ON "CreditSale"("tenantId", "customerId");
CREATE INDEX IF NOT EXISTS "CreditSale_tenantId_nextDueDate_idx" ON "CreditSale"("tenantId", "nextDueDate");
CREATE INDEX IF NOT EXISTS "CreditPayment_tenantId_paidAt_idx" ON "CreditPayment"("tenantId", "paidAt");
CREATE INDEX IF NOT EXISTS "CreditPayment_tenantId_createdById_idx" ON "CreditPayment"("tenantId", "createdById");
