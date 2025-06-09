import { supabase } from '@/lib/supabase'
import type { Product } from '@/types/product'

export class ProductService {
  // ==========================================
  // CREATE - Criar novo produto
  // ==========================================
  static async createProduct(productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      const { data, error } = await supabase
        .from('products')
        .insert([{
          name: productData.name,
          code: productData.code,
          description: productData.description,
          category: productData.category,
          quantity: productData.quantity,
          unit: productData.unit,
          purchase_price: productData.purchasePrice,
          sell_price: productData.sellPrice,
          min_stock: productData.minStock,
          location: productData.location,
          supplier: productData.supplier
        }])
        .select()
        .single()

      if (error) throw error

      return this.mapFromDatabase(data)
    } catch (error) {
      console.error('Erro ao criar produto:', error)
      throw new Error(`Falha ao criar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // READ - Buscar todos os produtos
  // ==========================================
  static async getAllProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      return data?.map(this.mapFromDatabase) || []
    } catch (error) {
      console.error('Erro ao buscar produtos:', error)
      throw new Error(`Falha ao buscar produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // READ - Buscar produto por ID
  // ==========================================
  static async getProductById(id: number): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Produto não encontrado
        throw error
      }

      return this.mapFromDatabase(data)
    } catch (error) {
      console.error('Erro ao buscar produto:', error)
      throw new Error(`Falha ao buscar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // READ - Buscar produto por código
  // ==========================================
  static async getProductByCode(code: string): Promise<Product | null> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('code', code)
        .single()

      if (error) {
        if (error.code === 'PGRST116') return null // Produto não encontrado
        throw error
      }

      return this.mapFromDatabase(data)
    } catch (error) {
      console.error('Erro ao buscar produto por código:', error)
      throw new Error(`Falha ao buscar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // UPDATE - Atualizar produto
  // ==========================================
  static async updateProduct(id: number, updates: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Product> {
    try {
      const updateData: any = {}
      
      if (updates.name !== undefined) updateData.name = updates.name
      if (updates.code !== undefined) updateData.code = updates.code
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.category !== undefined) updateData.category = updates.category
      if (updates.quantity !== undefined) updateData.quantity = updates.quantity
      if (updates.unit !== undefined) updateData.unit = updates.unit
      if (updates.purchasePrice !== undefined) updateData.purchase_price = updates.purchasePrice
      if (updates.sellPrice !== undefined) updateData.sell_price = updates.sellPrice
      if (updates.minStock !== undefined) updateData.min_stock = updates.minStock
      if (updates.location !== undefined) updateData.location = updates.location
      if (updates.supplier !== undefined) updateData.supplier = updates.supplier

      const { data, error } = await supabase
        .from('products')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapFromDatabase(data)
    } catch (error) {
      console.error('Erro ao atualizar produto:', error)
      throw new Error(`Falha ao atualizar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // DELETE - Deletar produto
  // ==========================================
  static async deleteProduct(id: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', id)

      if (error) throw error
    } catch (error) {
      console.error('Erro ao deletar produto:', error)
      throw new Error(`Falha ao deletar produto: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // UTILITY - Buscar produtos com estoque baixo
  // ==========================================
  static async getLowStockProducts(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .filter('quantity', 'lte', 'min_stock')
        .order('quantity', { ascending: true })

      if (error) throw error

      return data?.map(this.mapFromDatabase) || []
    } catch (error) {
      console.error('Erro ao buscar produtos com estoque baixo:', error)
      throw new Error(`Falha ao buscar produtos com estoque baixo: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // UTILITY - Buscar produtos por categoria
  // ==========================================
  static async getProductsByCategory(category: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('category', category)
        .order('name', { ascending: true })

      if (error) throw error

      return data?.map(this.mapFromDatabase) || []
    } catch (error) {
      console.error('Erro ao buscar produtos por categoria:', error)
      throw new Error(`Falha ao buscar produtos por categoria: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // UTILITY - Atualizar estoque
  // ==========================================
  static async updateStock(id: number, newQuantity: number): Promise<Product> {
    try {
      if (newQuantity < 0) {
        throw new Error('Quantidade não pode ser negativa')
      }

      const { data, error } = await supabase
        .from('products')
        .update({ quantity: newQuantity })
        .eq('id', id)
        .select()
        .single()

      if (error) throw error

      return this.mapFromDatabase(data)
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error)
      throw new Error(`Falha ao atualizar estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // UTILITY - Consumir estoque (para produção)
  // ==========================================
  static async consumeStock(id: number, quantityToConsume: number): Promise<Product> {
    try {
      if (quantityToConsume <= 0) {
        throw new Error('Quantidade a consumir deve ser positiva')
      }

      // Buscar produto atual
      const currentProduct = await this.getProductById(id)
      if (!currentProduct) {
        throw new Error('Produto não encontrado')
      }

      // Verificar se há estoque suficiente
      if (currentProduct.quantity < quantityToConsume) {
        throw new Error(`Estoque insuficiente. Disponível: ${currentProduct.quantity}, Solicitado: ${quantityToConsume}`)
      }

      // Atualizar estoque
      const newQuantity = currentProduct.quantity - quantityToConsume
      return await this.updateStock(id, newQuantity)
    } catch (error) {
      console.error('Erro ao consumir estoque:', error)
      throw new Error(`Falha ao consumir estoque: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // UTILITY - Busca avançada
  // ==========================================
  static async searchProducts(searchTerm: string): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,code.ilike.%${searchTerm}%,description.ilike.%${searchTerm}%,supplier.ilike.%${searchTerm}%`)
        .order('name', { ascending: true })

      if (error) throw error

      return data?.map(this.mapFromDatabase) || []
    } catch (error) {
      console.error('Erro na busca de produtos:', error)
      throw new Error(`Falha na busca de produtos: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // UTILITY - Estatísticas do estoque
  // ==========================================
  static async getStockStatistics() {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('quantity, min_stock, purchase_price, sell_price')

      if (error) throw error

      const stats = {
        totalProducts: data.length,
        totalValue: data.reduce((sum, p) => sum + (p.quantity * p.purchase_price), 0),
        lowStockCount: data.filter(p => p.quantity <= p.min_stock).length,
        averageStock: data.length > 0 ? data.reduce((sum, p) => sum + p.quantity, 0) / data.length : 0
      }

      return stats
    } catch (error) {
      console.error('Erro ao calcular estatísticas:', error)
      throw new Error(`Falha ao calcular estatísticas: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    }
  }

  // ==========================================
  // MAPPER - Converter dados do banco para modelo
  // ==========================================
  private static mapFromDatabase(dbData: any): Product {
    return {
      id: dbData.id,
      name: dbData.name,
      code: dbData.code,
      description: dbData.description,
      category: dbData.category,
      quantity: dbData.quantity,
      unit: dbData.unit,
      purchasePrice: dbData.purchase_price,
      sellPrice: dbData.sell_price,
      minStock: dbData.min_stock,
      location: dbData.location,
      supplier: dbData.supplier,
      createdAt: dbData.created_at,
      updatedAt: dbData.updated_at
    }
  }
}

// ==========================================
// HOOKS PARA REAL-TIME (opcional para Fase 4)
// ==========================================
export const subscribeToProducts = (callback: (products: Product[]) => void) => {
  const subscription = supabase
    .channel('products-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'products' },
      async () => {
        // Recarregar todos os produtos quando houver mudanças
        const products = await ProductService.getAllProducts()
        callback(products)
      }
    )
    .subscribe()

  return subscription
}

export default ProductService 