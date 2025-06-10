import { supabase } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']
type ProductUpdate = Database['public']['Tables']['products']['Update']

export class ProductsAPI {
  // Buscar todos os produtos
  static async getAll(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Erro ao buscar produtos:', error)
      throw new Error(`Erro ao buscar produtos: ${error.message}`)
    }

    return data || []
  }

  // Buscar produto por ID
  static async getById(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return null // Produto não encontrado
      }
      console.error('Erro ao buscar produto:', error)
      throw new Error(`Erro ao buscar produto: ${error.message}`)
    }

    return data
  }

  // Criar novo produto
  static async create(productData: ProductInsert): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar produto:', error)
      throw new Error(`Erro ao criar produto: ${error.message}`)
    }

    return data
  }

  // Atualizar produto
  static async update(id: number, productData: ProductUpdate): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar produto:', error)
      throw new Error(`Erro ao atualizar produto: ${error.message}`)
    }

    return data
  }

  // Deletar produto
  static async delete(id: number): Promise<void> {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao deletar produto:', error)
      throw new Error(`Erro ao deletar produto: ${error.message}`)
    }
  }

  // Buscar produtos com estoque baixo
  static async getLowStock(): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .lte('quantity', supabase.raw('min_stock'))
      .order('quantity', { ascending: true })

    if (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error)
      throw new Error(`Erro ao buscar produtos com estoque baixo: ${error.message}`)
    }

    return data || []
  }

  // Buscar produtos por categoria
  static async getByCategory(category: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('category', category)
      .order('name')

    if (error) {
      console.error('Erro ao buscar produtos por categoria:', error)
      throw new Error(`Erro ao buscar produtos por categoria: ${error.message}`)
    }

    return data || []
  }

  // Atualizar estoque de um produto
  static async updateStock(id: number, newQuantity: number): Promise<Product> {
    const { data, error } = await supabase
      .from('products')
      .update({ quantity: newQuantity })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar estoque:', error)
      throw new Error(`Erro ao atualizar estoque: ${error.message}`)
    }

    return data
  }

  // Buscar estatísticas dos produtos
  static async getStats() {
    const { data: totalCount, error: countError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })

    const { data: lowStockCount, error: lowStockError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .lte('quantity', supabase.raw('min_stock'))

    const { data: zeroStockCount, error: zeroStockError } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('quantity', 0)

    if (countError || lowStockError || zeroStockError) {
      const error = countError || lowStockError || zeroStockError
      console.error('Erro ao buscar estatísticas:', error)
      throw new Error(`Erro ao buscar estatísticas: ${error?.message}`)
    }

    return {
      total: totalCount?.length || 0,
      lowStock: lowStockCount?.length || 0,
      zeroStock: zeroStockCount?.length || 0
    }
  }

  // Buscar categorias únicas
  static async getCategories(): Promise<string[]> {
    const { data, error } = await supabase
      .from('products')
      .select('category')
      .order('category')

    if (error) {
      console.error('Erro ao buscar categorias:', error)
      throw new Error(`Erro ao buscar categorias: ${error.message}`)
    }

    // Extrair categorias únicas
    const uniqueCategories = [...new Set(data?.map(item => item.category) || [])]
    return uniqueCategories
  }
} 