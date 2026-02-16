import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { Roles } from '../auth/decorators/roles.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';
import { GetUser } from '../auth/decorators/get-user.decorator';

@UseGuards(GetTenantGuard)
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    @Roles('ADMIN', 'SUPER_ADMIN')
    create(
        @GetTenantId() tenantId: string,
        @Body() dto: CreateProductDto,
        @GetUser('id') userId: string
    ) {
        return this.productsService.create(tenantId, dto, userId);
    }

    @Get()
    findAll(
        @GetTenantId() tenantId: string,
        @Query('page') page?: string,
        @Query('limit') limit?: string,
        @Query('search') search?: string,
        @Query('categoryId') categoryId?: string,
        @Query('minPrice') minPrice?: string,
        @Query('maxPrice') maxPrice?: string,
        @Query('stockStatus') stockStatus?: string,
    ) {
        return this.productsService.findAllWithTotalStock(
            tenantId,
            page ? parseInt(page, 10) : 1,
            limit ? parseInt(limit, 10) : 50,
            search,
            {
                categoryId,
                minPrice: minPrice ? parseFloat(minPrice) : undefined,
                maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
                stockStatus,
            }
        );
    }

    @Get('by-barcode')
    findByBarcode(@GetTenantId() tenantId: string, @Query('barcode') barcode: string) {
        return this.productsService.findByBarcode(tenantId, barcode);
    }

    @Get(':id')
    findOne(
        @GetTenantId() tenantId: string,
        @Param('id') id: string,
        @Query('refresh') refresh?: string
    ) {
        return this.productsService.findOne(tenantId, id, !!refresh);
    }

    @Patch(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    update(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(tenantId, id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN', 'SUPER_ADMIN')
    remove(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.productsService.remove(tenantId, id);
    }
}
