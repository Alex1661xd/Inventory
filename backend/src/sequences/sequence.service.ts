import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

/**
 * SequenceService: Atomic per-tenant sequence management
 * 
 * Uses Prisma's $queryRaw with PostgreSQL advisory locks
 * to ensure that concurrent requests never get the same number.
 * 
 * Usage:
 *   const nextNumber = await sequenceService.nextVal(tenantId, 'invoice', tx);
 */
@Injectable()
export class SequenceService {
    constructor(private readonly prisma: PrismaService) { }

    /**
     * Gets the next value for a named sequence within a tenant.
     * Uses an atomic UPDATE ... RETURNING pattern for race-condition safety.
     * If the sequence doesn't exist yet, it creates it starting at 1.
     * 
     * @param tenantId - The tenant to scope the sequence to
     * @param sequenceName - Name of the sequence (e.g. 'invoice', 'purchase')
     * @param tx - Optional Prisma transaction client (HIGHLY RECOMMENDED to pass this)
     */
    async nextVal(
        tenantId: string,
        sequenceName: string,
        tx?: any,
    ): Promise<number> {
        const client = tx || this.prisma;

        // Atomic upsert + increment using raw SQL for true atomicity
        // This uses INSERT ... ON CONFLICT ... UPDATE with RETURNING
        const result: Array<{ current_value: number }> = await client.$queryRaw`
            INSERT INTO "TenantSequence" ("id", "tenantId", "sequenceName", "currentValue")
            VALUES (gen_random_uuid(), ${tenantId}, ${sequenceName}, 1)
            ON CONFLICT ("tenantId", "sequenceName")
            DO UPDATE SET "currentValue" = "TenantSequence"."currentValue" + 1
            RETURNING "currentValue" AS current_value
        `;

        return result[0].current_value;
    }

    /**
     * Initializes a sequence to a specific value.
     * Useful for migrating existing data (sets the sequence to the max existing number).
     * 
     * @param tenantId - The tenant to scope the sequence to
     * @param sequenceName - Name of the sequence
     * @param value - The value to set (typically max(existingNumber))
     */
    async initializeSequence(
        tenantId: string,
        sequenceName: string,
        value: number,
    ): Promise<void> {
        await this.prisma.$queryRaw`
            INSERT INTO "TenantSequence" ("id", "tenantId", "sequenceName", "currentValue")
            VALUES (gen_random_uuid(), ${tenantId}, ${sequenceName}, ${value})
            ON CONFLICT ("tenantId", "sequenceName")
            DO UPDATE SET "currentValue" = GREATEST("TenantSequence"."currentValue", ${value})
        `;
    }
}
