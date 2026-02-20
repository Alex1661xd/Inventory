import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { N8nIntegrationController } from './n8n-integration.controller';
import { N8nIntegrationService } from './n8n-integration.service';

@Module({
  imports: [PrismaModule],
  controllers: [N8nIntegrationController],
  providers: [N8nIntegrationService],
})
export class N8nIntegrationModule {}
