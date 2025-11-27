import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateProductDto } from './dto/create-product.dto';
import { QueryProductDto } from './dto/query-product.dto';

@Injectable()
export class ProductsService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll(query: QueryProductDto) {
    const { category, search, page = 1, limit = 20, sort = 'created_at', order = 'desc', gender } = query;
    
    let queryBuilder = this.supabaseService
      .getClient()
      .from('products')
      .select(`
        *, 
        category:categories(id, name, target_gender),
        series:product_series(id, name, target_gender)
      `, { count: 'exact' })
      .eq('is_active', true);

    // 按分类过滤
    if (category) {
      queryBuilder = queryBuilder.eq('category_id', category);
    }

    // 搜索
    if (search) {
      queryBuilder = queryBuilder.ilike('name', `%${search}%`);
    }

    // 排序
    queryBuilder = queryBuilder.order(sort, { ascending: order === 'asc' });

    // 分页
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    queryBuilder = queryBuilder.range(from, to);

    const { data, error, count } = await queryBuilder;

    if (error) {
      throw new Error(error.message);
    }

    // 前端过滤：根据性别筛选（因为Supabase不支持关联表的OR条件）
    let filteredData = data;
    if (gender && data) {
      filteredData = data.filter(product => {
        const seriesMatch = !product.series || 
                          product.series.target_gender === 'all' || 
                          product.series.target_gender === gender;
        const categoryMatch = !product.category || 
                            product.category.target_gender === 'all' || 
                            product.category.target_gender === gender;
        return seriesMatch && categoryMatch;
      });
    }

    return {
      data: filteredData,
      total: filteredData?.length || 0,
      page,
      limit,
      totalPages: Math.ceil((filteredData?.length || 0) / limit),
    };
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('products')
      .select('*, category:categories(id, name)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Product not found');
    }

    // 增加浏览次数
    await this.supabaseService
      .getAdminClient()
      .from('products')
      .update({ view_count: data.view_count + 1 })
      .eq('id', id);

    return data;
  }

  async create(createProductDto: CreateProductDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('products')
      .insert(createProductDto)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async update(id: string, updateProductDto: Partial<CreateProductDto>) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('products')
      .update(updateProductDto)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new NotFoundException('Product not found');
    }

    return data;
  }

  async delete(id: string) {
    const { error } = await this.supabaseService
      .getAdminClient()
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      throw new NotFoundException('Product not found');
    }

    return { message: 'Product deleted successfully' };
  }
}
