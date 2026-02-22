import 'dotenv/config';
import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { InventoryModule } from './inventory/inventory.module';
import { CategoriesModule } from './categories/categories.module';
import { CombosModule } from './combos/combos.module';
import { CacheModule } from './cache/cache.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { CashFlowModule } from './cash-flow/cash-flow.module';
import { ExpensesModule } from './expenses/expenses.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { PurchasesModule } from './purchases/purchases.module';
import { CatalogModule } from './catalog/catalog.module';
import { RolesGuard } from './auth/guards/roles.guard';
import { GetTenantGuard } from './auth/guards/get-tenant.guard';

import { SuperAdminModule } from './super-admin/super-admin.module';
import { BackupModule } from './backup/backup.module';
import { AuditModule } from './audit/audit.module';
import { SequenceModule } from './sequences/sequence.module';
import { ScheduleModule } from '@nestjs/schedule';
import { N8nIntegrationModule } from './integrations/n8n/n8n-integration.module';

@Module({
  imports: [ScheduleModule.forRoot(), CacheModule, PrismaModule, SupabaseModule, AuthModule, ProductsModule, WarehousesModule, InventoryModule, CategoriesModule, CombosModule, UsersModule, CustomersModule, InvoicesModule, SuppliersModule, CashFlowModule, ExpensesModule, AnalyticsModule, PurchasesModule, CatalogModule, SuperAdminModule, BackupModule, AuditModule, SequenceModule, N8nIntegrationModule],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: GetTenantGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule { }
