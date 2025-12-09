import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class AdminOrdersService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: string;
    order_number?: string;
  }) {
    const { page = 1, limit = 10, status, order_number } = query;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let queryBuilder = this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    if (status) {
      queryBuilder = queryBuilder.eq('status', status);
    }

    if (order_number) {
      queryBuilder = queryBuilder.ilike('order_number', `%${order_number}%`);
    }

    const { data, error, count } = await queryBuilder;

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
    const { data: order, error } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(error.message);
    }

    // 获取订单项
    const { data: items } = await this.supabaseService
      .getAdminClient()
      .from('order_items')
      .select('*')
      .eq('order_id', id);

    return {
      ...order,
      items,
    };
  }

  async updateStatus(id: string, status: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .update({ status })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async ship(id: string, trackingNumber: string) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .update({
        tracking_number: trackingNumber,
        status: 'shipped',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
