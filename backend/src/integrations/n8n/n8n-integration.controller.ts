import { Controller, Get, Headers, Query, UseGuards } from '@nestjs/common';
import { Public } from '../../auth/decorators/public.decorator';
import { N8nApiKeyGuard } from './guards/n8n-api-key.guard';
import { N8nIntegrationService } from './n8n-integration.service';

@Controller('integrations/n8n')
export class N8nIntegrationController {
  constructor(private readonly n8nIntegrationService: N8nIntegrationService) {}

  @Get('products')
  @Public()
  @UseGuards(N8nApiKeyGuard)
  findProducts(
    @Headers('x-tenant-id') tenantId: string,
    @Query('q') query?: string,
    @Query('barcode') barcode?: string,
    @Query('categoryId') categoryId?: string,
    @Query('onlyAvailable') onlyAvailable?: string,
    @Query('limit') limit?: string,
  ) {
    const shouldFilterAvailable = onlyAvailable === undefined
      ? true
      : onlyAvailable === '1' || onlyAvailable === 'true';

    return this.n8nIntegrationService.findProductsForBot(
      tenantId,
      query,
      barcode,
      categoryId,
      shouldFilterAvailable,
      limit ? parseInt(limit, 10) : 10,
    );
  }
}
