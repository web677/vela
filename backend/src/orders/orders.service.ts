import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { LogisticsService } from '../logistics/logistics.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { QueryOrderDto } from './dto/query-order.dto';

@Injectable()
export class OrdersService {
  constructor(
    private supabaseService: SupabaseService,
    private logisticsService: LogisticsService,
  ) {}

  async create(userId: string | null, createOrderDto: CreateOrderDto) {
    const { items, shipping_address, contact_info, payment_method, notes } =
      createOrderDto;

    // 1. 验证所有产品并计算总价


    // 1. 验证所有产品并计算总价
    let totalAmount = 0;
    const productSnapshots = [];

    for (const item of items) {
      const { data: product, error } = await this.supabaseService
        .getAdminClient()
        .from('products')
        .select('*')
        .eq('id', item.product_id)
        .single();

      if (error || !product) {
        throw new NotFoundException(
          `Product ${item.product_id} not found`,
        );
      }

      // 检查库存
      if (product.stock < item.quantity) {
        throw new BadRequestException(
          `Insufficient stock for product: ${product.name}`,
        );
      }

      const subtotal = product.price * item.quantity;
      totalAmount += subtotal;

      productSnapshots.push({
        product_id: product.id,
        product_snapshot: {
          name: product.name,
          image: product.images[0]?.url || '',
          specifications: product.specifications,
        },
        quantity: item.quantity,
        price: product.price,
        subtotal,
      });
    }

    // 2. 生成订单号
    const { data: orderNumberData } = await this.supabaseService
      .getAdminClient()
      .rpc('generate_order_number');

    const orderNumber = orderNumberData;

    // 3. 创建订单
    const orderData: any = {
      order_number: orderNumber,
      user_id: userId,
      guest_email: userId ? null : contact_info.email,
      status: 'pending',
      total_amount: totalAmount,
      shipping_address,
      contact_info,
      payment_method: payment_method || 'alipay',
      payment_status: 'unpaid',
      tracking_number: '464901901949290', // 暂时写死测试物流单号
      notes,
    };

    const { data: order, error: orderError } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .insert(orderData)
      .select()
      .single();

    if (orderError) {
      throw new Error(`Failed to create order: ${orderError.message}`);
    }

    // 4. 创建订单项
    const orderItems = productSnapshots.map((item) => ({
      order_id: order.id,
      ...item,
    }));

    const { error: itemsError } = await this.supabaseService
      .getAdminClient()
      .from('order_items')
      .insert(orderItems);

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    // 5. 减少库存并增加销量
    for (const item of items) {
      const { data: product } = await this.supabaseService
        .getAdminClient()
        .from('products')
        .select('stock, sales_count')
        .eq('id', item.product_id)
        .single();

      await this.supabaseService
        .getAdminClient()
        .from('products')
        .update({
          stock: product.stock - item.quantity,
          sales_count: product.sales_count + item.quantity,
        })
        .eq('id', item.product_id);
    }

    // 6. 如果是登录用户，清空购物车
    if (userId) {
      await this.supabaseService
        .getAdminClient()
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
    }

    return {
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total_amount: order.total_amount,
      created_at: order.created_at,
    };
  }

  async findAll(userId: string, query: QueryOrderDto) {
    const { page = 1, limit = 10 } = query;

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('id, order_number, status, total_amount, created_at', {
        count: 'exact',
      })
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(error.message);
    }

    // 获取每个订单的商品数量
    const ordersWithItemCount = await Promise.all(
      data.map(async (order) => {
        const { count: itemsCount } = await this.supabaseService
          .getAdminClient()
          .from('order_items')
          .select('*', { count: 'exact', head: true })
          .eq('order_id', order.id);

        return {
          ...order,
          items_count: itemsCount || 0,
        };
      }),
    );

    return {
      data: ordersWithItemCount,
      total: count,
      page,
      limit,
    };
  }

  async findOne(userId: string, orderId: string) {
    const { data: order, error } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error || !order) {
      throw new NotFoundException('Order not found');
    }

    // 获取订单项
    const { data: items } = await this.supabaseService
      .getAdminClient()
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    return {
      ...order,
      items,
    };
  }

  async cancel(userId: string, orderId: string) {
    // 检查订单是否存在且属于该用户
    const { data: order, error } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error || !order) {
      throw new NotFoundException('Order not found');
    }

    // 只有 pending 状态的订单可以取消
    if (order.status !== 'pending') {
      throw new BadRequestException(
        'Only pending orders can be cancelled',
      );
    }

    // 更新订单状态
    const { data, error: updateError } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .select()
      .single();

    if (updateError) {
      throw new Error(updateError.message);
    }

    // 恢复库存
    const { data: items } = await this.supabaseService
      .getAdminClient()
      .from('order_items')
      .select('product_id, quantity')
      .eq('order_id', orderId);

    for (const item of items) {
      const { data: product } = await this.supabaseService
        .getAdminClient()
        .from('products')
        .select('stock, sales_count')
        .eq('id', item.product_id)
        .single();

      await this.supabaseService
        .getAdminClient()
        .from('products')
        .update({
          stock: product.stock + item.quantity,
          sales_count: Math.max(0, product.sales_count - item.quantity),
        })
        .eq('id', item.product_id);
    }

    return data;
  }

  async getLogistics(userId: string, orderId: string) {
    // 获取订单信息
    const { data: order, error } = await this.supabaseService
      .getAdminClient()
      .from('orders')
      .select('tracking_number')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (error || !order) {
      throw new NotFoundException('Order not found');
    }

    if (!order.tracking_number) {
      return {
        success: false,
        message: '该订单暂无物流信息',
      };
    }

    // 查询物流信息
    return this.logisticsService.queryTracking(order.tracking_number);
  }
}
