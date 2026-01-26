import { Body, Controller, Delete, Get, Param, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@UseGuards(GetTenantGuard)
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Post()
    create(@GetTenantId() tenantId: string, @Body() dto: CreateProductDto) {
        return this.productsService.create(tenantId, dto);
    }

    @Get()
    findAll(@GetTenantId() tenantId: string) {
        return this.productsService.findAllWithTotalStock(tenantId);
    }

    @Get('by-barcode')
    findByBarcode(@GetTenantId() tenantId: string, @Query('barcode') barcode: string) {
        return this.productsService.findByBarcode(tenantId, barcode);
    }

    @Get(':id')
    findOne(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.productsService.findOne(tenantId, id);
    }

    @Patch(':id')
    update(@GetTenantId() tenantId: string, @Param('id') id: string, @Body() dto: UpdateProductDto) {
        return this.productsService.update(tenantId, id, dto);
    }

    @Delete(':id')
    remove(@GetTenantId() tenantId: string, @Param('id') id: string) {
        return this.productsService.remove(tenantId, id);
    }
}
