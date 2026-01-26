import { Injectable } from '@nestjs/common';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService {
    private supabase: SupabaseClient;

    constructor() {
        this.supabase = createClient(
            process.env.SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!, // Usamos Service Role para admin
            {
                auth: {
                    autoRefreshToken: false,
                    persistSession: false,
                },
            },
        );
    }

    getClient(): SupabaseClient {
        return this.supabase;
    }
}
