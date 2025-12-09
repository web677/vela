import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

@Injectable()
export class AdminStatisticsService {
  constructor(private supabaseService: SupabaseService) {}

  async getOverview() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayStr = today.toISOString();

    // 今日订单统计
    const { data: todayOrders, count: todayOrdersCount } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('total_amount', { count: 'exact' })
      .gte('created_at', todayStr);

    const todaySales = todayOrders?.reduce((sum, order) => sum + (order.total_amount || 0), 0) || 0;

    // 待发货订单
    const { count: pendingShipment } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .in('status', ['paid', 'pending_shipment']);

    // 商品总数
    const { count: totalProducts } = await this.supabaseService
      .getAdminClient()
      .from('products')
      .select('*', { count: 'exact', head: true });

    // 用户总数
    const { count: totalUsers } = await this.supabaseService
      .getAdminClient()
      .from('user_profiles')
      .select('*', { count: 'exact', head: true });

    return {
      todayOrders: todayOrdersCount || 0,
      todaySales,
      pendingShipment: pendingShipment || 0,
      totalProducts: totalProducts || 0,
      totalUsers: totalUsers || 0,
    };
  }

  async getSalesData(days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('total_amount, created_at')
      .gte('created_at', startDate.toISOString())
      .in('status', ['paid', 'shipped', 'delivered']);

    // 按日期分组
    const salesByDate = {};
    data?.forEach(order => {
      const date = new Date(order.created_at).toISOString().split('T')[0];
      if (!salesByDate[date]) {
        salesByDate[date] = 0;
      }
      salesByDate[date] += order.total_amount || 0;
    });

    return salesByDate;
  }

  async getProductStats() {
    const { data } = await this.supabaseService
      .getAdminClient()
      .from('products')
      .select('name, sales_count')
      .order('sales_count', { ascending: false })
      .limit(10);

    return data;
  }
}
