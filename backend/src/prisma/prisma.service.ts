import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
    constructor() {
        super({
            log: ['query', 'info', 'warn', 'error'],
        });
    }

    async onModuleInit() {
        try {
            const dbUrl = process.env.DATABASE_URL;
            if (dbUrl) {
                // Mask the password for safety in logs
                const maskedUrl = dbUrl.replace(/:([^@]+)@/, ':****@');
                console.log(`[PrismaService] Connecting to DB at: ${maskedUrl}`);
            } else {
                console.error('[PrismaService] DATABASE_URL is not defined in environment variables');
            }

            await this.$connect();
            console.log('[PrismaService] Database connection established successfully');
        } catch (error) {
            console.error('[PrismaService] Failed to connect to database:', error);
            throw error;
        }
    }
}
