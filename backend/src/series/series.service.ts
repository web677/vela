import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateSeriesDto } from './dto/create-series.dto';

@Injectable()
export class SeriesService {
  constructor(private supabase: SupabaseService) {}

  async findAll(includeInactive = false, gender?: string) {
    let query = this.supabase.getClient()
      .from('product_series')
      .select('*')
      .order('sort_order', { ascending: true });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    // Filter by gender if provided
    if (gender) {
      query = query.or(`target_gender.eq.${gender},target_gender.eq.all`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to fetch series: ${error.message}`);
    }

    return data;
  }

  async findBySlug(slug: string) {
    const { data, error } = await this.supabase.getClient()
      .from('product_series')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Series with slug "${slug}" not found`);
    }

    return data;
  }

  async findById(id: string) {
    const { data, error } = await this.supabase.getClient()
      .from('product_series')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException(`Series with id "${id}" not found`);
    }

    return data;
  }

  async getSeriesProducts(seriesId: string, page = 1, limit = 20) {
    const offset = (page - 1) * limit;

    const { data, error, count } = await this.supabase.getClient()
      .from('products')
      .select('*', { count: 'exact' })
      .eq('series_id', seriesId)
      .eq('is_active', true)
      .order('series_sort_order', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Failed to fetch series products: ${error.message}`);
    }

    return {
      data,
      total: count,
      page,
      limit,
      totalPages: Math.ceil(count / limit),
    };
  }

  async create(createSeriesDto: CreateSeriesDto) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('product_series')
      .insert(createSeriesDto)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create series: ${error.message}`);
    }

    return data;
  }

  async update(id: string, updateData: Partial<CreateSeriesDto>) {
    const { data, error } = await this.supabase.getAdminClient()
      .from('product_series')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error || !data) {
      throw new NotFoundException(`Failed to update series with id "${id}"`);
    }

    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabase.getAdminClient()
      .from('product_series')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete series: ${error.message}`);
    }

    return { success: true };
  }
}

