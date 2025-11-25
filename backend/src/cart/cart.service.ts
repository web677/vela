import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private supabaseService: SupabaseService) {}

  async getCart(userId: string) {
    const { data: items, error } = await this.supabaseService
      .getAdminClient()
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    const total = items.reduce((sum, item) => {
      return sum + (item.product.price * item.quantity);
    }, 0);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return {
      items: items.map(item => ({
        id: item.id,
        product: item.product,
        quantity: item.quantity,
        subtotal: item.product.price * item.quantity,
      })),
      total,
      total_items: totalItems,
    };
  }

  async addToCart(userId: string, addToCartDto: AddToCartDto) {
    const { product_id, quantity } = addToCartDto;

    // 检查产品是否存在且有库存
    const { data: product, error: productError } = await this.supabaseService
      .getAdminClient()
      .from('products')
      .select('*')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      throw new NotFoundException('Product not found');
    }

    if (product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    // 检查购物车中是否已存在该产品
    const { data: existing } = await this.supabaseService
      .getAdminClient()
      .from('cart_items')
      .select('*')
      .eq('user_id', userId)
      .eq('product_id', product_id)
      .single();

    if (existing) {
      // 更新数量
      const newQuantity = existing.quantity + quantity;
      if (product.stock < newQuantity) {
        throw new BadRequestException('Insufficient stock');
      }

      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('cart_items')
        .update({ quantity: newQuantity })
        .eq('id', existing.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } else {
      // 添加新项
      const { data, error } = await this.supabaseService
        .getAdminClient()
        .from('cart_items')
        .insert({
          user_id: userId,
          product_id,
          quantity,
        })
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    }
  }

  async updateCartItem(userId: string, itemId: string, updateCartItemDto: UpdateCartItemDto) {
    const { quantity } = updateCartItemDto;

    // 检查购物车项是否存在
    const { data: cartItem, error: cartError } = await this.supabaseService
      .getAdminClient()
      .from('cart_items')
      .select('*, product:products(*)')
      .eq('id', itemId)
      .eq('user_id', userId)
      .single();

    if (cartError || !cartItem) {
      throw new NotFoundException('Cart item not found');
    }

    // 检查库存
    if (cartItem.product.stock < quantity) {
      throw new BadRequestException('Insufficient stock');
    }

    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('cart_items')
      .update({ quantity })
      .eq('id', itemId)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async removeCartItem(userId: string, itemId: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('cart_items')
      .delete()
      .eq('id', itemId)
      .eq('user_id', userId);

    if (error) {
      throw new NotFoundException('Cart item not found');
    }

    return { message: 'Item removed from cart' };
  }

  async clearCart(userId: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('cart_items')
      .delete()
      .eq('user_id', userId);

    if (error) {
      throw new Error(error.message);
    }

    return { message: 'Cart cleared' };
  }
}
