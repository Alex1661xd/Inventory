import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        const url = process.env.SUPABASE_URL;
        const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

        if (!url || !key) {
            console.error('❌ [SupabaseService] ERROR: SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están definidas en el entorno.');
            console.log('Ambiente detectado:', {
                URL: url ? '✅ Configurada' : '❌ Falta',
                KEY: key ? '✅ Configurada' : '❌ Falta'
            });
            return;
        }

        this.supabase = createClient(url, key, {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        });
        console.log('✅ [SupabaseService] Cliente inicializado correctamente');
    }

    getClient(): SupabaseClient {
        if (!this.supabase) {
            throw new Error('Supabase client was not initialized due to missing environment variables.');
        }
        return this.supabase;
    }
}
