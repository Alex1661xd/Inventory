import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SupabaseModule } from './supabase/supabase.module';
import { AuthModule } from './auth/auth.module';
import { ProductsModule } from './products/products.module';
import { WarehousesModule } from './warehouses/warehouses.module';
import { InventoryModule } from './inventory/inventory.module';
import { CategoriesModule } from './categories/categories.module';
import { CacheModule } from './cache/cache.module';
import { UsersModule } from './users/users.module';
import { CustomersModule } from './customers/customers.module';
import { InvoicesModule } from './invoices/invoices.module';

@Module({
  imports: [CacheModule, PrismaModule, SupabaseModule, AuthModule, ProductsModule, WarehousesModule, InventoryModule, CategoriesModule, UsersModule, CustomersModule, InvoicesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
