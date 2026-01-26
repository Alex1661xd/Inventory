import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  UseGuards
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { GetTenantGuard } from '../auth/guards/get-tenant.guard';
import { GetTenantId } from '../auth/decorators/get-tenant-id.decorator';

@UseGuards(GetTenantGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll(@GetTenantId() tenantId: string) {
    return this.categoriesService.findAll(tenantId);
  }

  @Get(':id')
  findOne(@GetTenantId() tenantId: string, @Param('id') id: string) {
    return this.categoriesService.findOne(id, tenantId);
  }

  @Post()
  create(@GetTenantId() tenantId: string, @Body() createCategoryDto: { name: string; description?: string }) {
    return this.categoriesService.create(createCategoryDto, tenantId);
  }

  @Patch(':id')
  update(
    @GetTenantId() tenantId: string,
    @Param('id') id: string, 
    @Body() updateCategoryDto: { name?: string; description?: string }
  ) {
    return this.categoriesService.update(id, updateCategoryDto, tenantId);
  }

  @Delete(':id')
  remove(@GetTenantId() tenantId: string, @Param('id') id: string) {
    return this.categoriesService.remove(id, tenantId);
  }
}
