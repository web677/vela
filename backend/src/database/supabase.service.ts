import { createClient } from '@supabase/supabase-js';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class SupabaseService {
  private client;
  private adminClient;

  constructor(private configService: ConfigService) {
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const supabaseKey = this.configService.get<string>('SUPABASE_ANON_KEY');
    const supabaseServiceKey = this.configService.get<string>('SUPABASE_SERVICE_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase URL and ANON KEY must be provided');
    }

    // Client with regular anon key
    this.client = createClient(supabaseUrl, supabaseKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: false,
      },
      global: {
        headers: {
          'x-application-name': 'vela-backend',
        },
        fetch: (...args) => {
          // Add timeout to fetch
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

          return fetch(args[0], {
            ...args[1],
            signal: controller.signal,
          }).finally(() => clearTimeout(timeout));
        },
      },
    });

    // Admin client with service role key
    if (supabaseServiceKey) {
      this.adminClient = createClient(supabaseUrl, supabaseServiceKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
        global: {
          headers: {
            'x-application-name': 'vela-backend-admin',
          },
          fetch: (...args) => {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 10000);

            return fetch(args[0], {
              ...args[1],
              signal: controller.signal,
            }).finally(() => clearTimeout(timeout));
          },
        },
      });
    }
  }

  getClient() {
    return this.client;
  }

  getAdminClient() {
    return this.adminClient || this.client;
  }
}
