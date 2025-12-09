import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class AdminUsersService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(query: { page?: number; limit?: number }) {
    const { page = 1, limit = 10 } = query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabaseService
      .getAdminClient()
      .from('user_profiles')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    return {
      data,
      total: count,
      page,
      limit,
    };
  }

  async findOne(id: string) {
    const { data: user, error } = await this.supabaseService
      .getAdminClient()
      .from('user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // 获取用户订单
    const { data: orders } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('id, order_number, status, total_amount, created_at')
      .eq('user_id', id)
      .order('created_at', { ascending: false })
      .limit(10);

    return {
      ...user,
      recent_orders: orders,
    };
  }
}
