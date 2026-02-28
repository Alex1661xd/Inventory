ALTER TABLE "Customer"
ADD COLUMN "isBanned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "bannedAt" TIMESTAMP(3),
ADD COLUMN "banReason" TEXT;

CREATE INDEX "Customer_tenantId_isBanned_idx" ON "Customer"("tenantId", "isBanned");
