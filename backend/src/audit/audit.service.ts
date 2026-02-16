import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CacheService } from '../cache/cache.service';

export interface AuditLogEntry {
    action: string;      // CREATE, UPDATE, DELETE, CANCEL, TRANSFER, etc.
    entity: string;      // Product, Invoice, Purchase, etc.
    entityId?: string;
    oldValue?: any;
    newValue?: any;
    metadata?: any;
    userId?: string;
    userName?: string;
    userRole?: string;
    tenantId: string;
}

@Injectable()
export class AuditService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cacheService: CacheService
    ) { }

    /**
     * Registra una entrada de auditoría.
     * Se ejecuta de forma asíncrona (fire-and-forget) para no bloquear la operación principal.
     */
    async log(entry: AuditLogEntry): Promise<void> {
        try {
            await this.prisma.auditLog.create({
                data: {
                    action: entry.action,
                    entity: entry.entity,
                    entityId: entry.entityId || null,
                    oldValue: entry.oldValue || null,
                    newValue: entry.newValue || null,
                    metadata: entry.metadata || null,
                    userId: entry.userId || null,
                    userName: entry.userName || null,
                    userRole: entry.userRole || null,
                    tenantId: entry.tenantId,
                },
            } as any);

            // Invalidate audit list cache
            await this.invalidateAuditCache(entry.tenantId);
        } catch (error) {
            // No lanzar error para no interrumpir la operación principal
            console.error('[AuditService] Error registrando log de auditoría:', error);
        }
    }

    private async invalidateAuditCache(tenantId: string) {
        const cachePattern = this.cacheService.generateKey(tenantId, 'audit', 'list', '*');
        await this.cacheService.invalidatePattern(cachePattern);
    }

    /**
     * Registra multiples entradas en batch
     */
    async logBatch(entries: AuditLogEntry[]): Promise<void> {
        try {
            await this.prisma.auditLog.createMany({
                data: entries.map(entry => ({
                    action: entry.action,
                    entity: entry.entity,
                    entityId: entry.entityId || null,
                    oldValue: entry.oldValue || null,
                    newValue: entry.newValue || null,
                    metadata: entry.metadata || null,
                    userId: entry.userId || null,
                    userName: entry.userName || null,
                    userRole: entry.userRole || null,
                    tenantId: entry.tenantId,
                })),
            } as any);
        } catch (error) {
            console.error('[AuditService] Error registrando logs en batch:', error);
        }
    }

    /**
     * Obtiene los logs de auditoría para un tenant con paginación
     */
    async findAll(tenantId: string, options?: {
        page?: number;
        limit?: number;
        entity?: string;
        action?: string;
        userId?: string;
        from?: string;
        to?: string;
    }) {
        const page = options?.page || 1;
        const limit = Math.min(options?.limit || 50, 100);
        const skip = (page - 1) * limit;

        const where: any = { tenantId };

        if (options?.entity) where.entity = options.entity;
        if (options?.action) where.action = options.action;
        if (options?.userId) where.userId = options.userId;
        if (options?.from || options?.to) {
            where.createdAt = {};
            if (options?.from) where.createdAt.gte = new Date(options.from);
            if (options?.to) where.createdAt.lte = new Date(options.to);
        }

        const cacheKey = this.cacheService.generateKey(tenantId, 'audit', 'list', `p${page}-l${limit}-e${options?.entity || 'all'}-a${options?.action || 'all'}-u${options?.userId || 'all'}-f${options?.from || 'all'}-t${options?.to || 'all'}`);

        try {
            const cached = await this.cacheService.get<any>(cacheKey);
            if (cached) return cached;
        } catch (error) {
            console.error('[AuditService] Error leyendo caché:', error);
        }

        const [data, total] = await Promise.all([
            this.prisma.auditLog.findMany({
                where,
                orderBy: { createdAt: 'desc' },
                skip,
                take: limit,
            } as any),
            this.prisma.auditLog.count({ where } as any),
        ]);

        const result = {
            data,
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        };

        await this.cacheService.set(cacheKey, result, 60);

        return result;
    }

    /**
     * Obtiene logs de auditoría para una entidad específica
     */
    async findByEntity(tenantId: string, entity: string, entityId: string) {
        return this.prisma.auditLog.findMany({
            where: { tenantId, entity, entityId },
            orderBy: { createdAt: 'desc' },
            take: 100,
        } as any);
    }
}
