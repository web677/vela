import { Injectable } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';

export interface ShippingRule {
  id?: string;
  name: string;
  provinces: string[];
  base_fee: number;
  free_threshold: number | null;
  additional_fee: number;
  priority: number;
  is_active: boolean;
}

@Injectable()
export class AdminShippingService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('shipping_rules')
      .select('*')
      .order('priority', { ascending: false });

    if (error) {
      // 如果表不存在，返回空数组
      console.log('Shipping rules table may not exist:', error.message);
      return [];
    }

    return data;
  }

  async create(rule: ShippingRule) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('shipping_rules')
      .insert(rule)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, rule: Partial<ShippingRule>) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('shipping_rules')
      .update(rule)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('shipping_rules')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(error.message);
    }

    return { success: true };
  }

  // 计算运费
  async calculateShipping(province: string, orderAmount: number) {
    const { data: rules } = await this.supabaseService
      .getAdminClient()
      .from('shipping_rules')
      .select('*')
      .eq('is_active', true)
      .order('priority', { ascending: false });

    // 查找匹配的规则
    const matchedRule = rules?.find(rule => 
      rule.provinces?.includes(province)
    );

    if (!matchedRule) {
      // 默认运费规则
      return {
        fee: orderAmount >= 99 ? 0 : 10,
        freeThreshold: 99,
        gap: orderAmount >= 99 ? 0 : 99 - orderAmount,
        canDeliver: true
      };
    }

    // 如果规则未启用，表示不可配送
    if (!matchedRule.is_active) {
      return {
        fee: 0,
        freeThreshold: null,
        gap: 0,
        canDeliver: false
      };
    }

    const baseFee = matchedRule.base_fee || 0;
    const additionalFee = matchedRule.additional_fee || 0;
    const freeThreshold = matchedRule.free_threshold;

    let fee = baseFee + additionalFee;
    let gap = 0;

    if (freeThreshold && orderAmount >= freeThreshold) {
      fee = 0;
    } else if (freeThreshold) {
      gap = freeThreshold - orderAmount;
    }

    return {
      fee,
      freeThreshold,
      gap: gap > 0 ? gap : 0,
      canDeliver: true
    };
  }
}
