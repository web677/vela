import { Injectable, NotFoundException } from '@nestjs/common';
import { SupabaseService } from '../database/supabase.service';
import { CreateCategoryDto } from './dto/create-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private supabaseService: SupabaseService) {}

  async findAll() {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .eq('is_active', true)
      .order('sort_order', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }

  async findOne(id: string) {
    const { data, error } = await this.supabaseService
      .getClient()
      .from('categories')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Category not found');
    }

    return data;
  }

  async create(createCategoryDto: CreateCategoryDto) {
    const { data, error } = await this.supabaseService
      .getAdminClient()
      .from('categories')
      .insert(createCategoryDto)
      .select()
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data;
  }
}
