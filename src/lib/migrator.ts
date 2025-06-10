import { ProductsAPI } from '@/lib/api/products'

export class DataMigrator {
  // Migrar produtos do localStorage para Supabase
  static async migrateProducts(): Promise<{ success: boolean; migrated: number; errors: string[] }> {
    const errors: string[] = []
    let migrated = 0

    try {
      // Buscar dados do localStorage
      const localData = localStorage.getItem('ecxus-stock-products')
      if (!localData) {
        return { success: true, migrated: 0, errors: ['Nenhum dado encontrado no localStorage'] }
      }

      const localProducts = JSON.parse(localData)
      console.log(`Encontrados ${localProducts.length} produtos no localStorage`)

      // Verificar se já existem produtos no Supabase
      const existingProducts = await ProductsAPI.getAll()
      if (existingProducts.length > 0) {
        return { 
          success: false, 
          migrated: 0, 
          errors: [`Já existem ${existingProducts.length} produtos no Supabase. Migração cancelada para evitar duplicatas.`] 
        }
      }

      // Migrar cada produto
      for (const localProduct of localProducts) {
        try {
          // Mapear campos do localStorage para o schema do Supabase
          const supabaseProduct = {
            name: localProduct.name,
            code: localProduct.code,
            description: localProduct.description || '',
            category: localProduct.category,
            quantity: localProduct.quantity || 0,
            unit: localProduct.unit || 'pcs',
            purchase_price: localProduct.costPrice || localProduct.purchase_price || 0,
            sell_price: localProduct.price || localProduct.sell_price || 0,
            min_stock: localProduct.minStock || localProduct.min_stock || 0,
            location: localProduct.location || '',
            supplier: localProduct.supplier || ''
          }

          await ProductsAPI.create(supabaseProduct)
          migrated++
          console.log(`Produto migrado: ${supabaseProduct.name}`)
        } catch (error) {
          const errorMsg = `Erro ao migrar produto ${localProduct.name}: ${error}`
          errors.push(errorMsg)
          console.error(errorMsg)
        }
      }

      // Criar backup dos dados locais
      const backup = {
        timestamp: new Date().toISOString(),
        data: localProducts
      }
      localStorage.setItem('ecxus-backup-products', JSON.stringify(backup))

      return {
        success: errors.length === 0,
        migrated,
        errors
      }
    } catch (error) {
      console.error('Erro na migração:', error)
      return {
        success: false,
        migrated,
        errors: [error instanceof Error ? error.message : 'Erro desconhecido']
      }
    }
  }

  // Verificar se a migração é necessária
  static async needsMigration(): Promise<boolean> {
    try {
      // Verificar se há dados no localStorage
      const localData = localStorage.getItem('ecxus-stock-products')
      if (!localData) return false

      const localProducts = JSON.parse(localData)
      if (localProducts.length === 0) return false

      // Verificar se há dados no Supabase
      const supabaseProducts = await ProductsAPI.getAll()
      
      // Se não há dados no Supabase mas há no localStorage, precisamos migrar
      return supabaseProducts.length === 0 && localProducts.length > 0
    } catch (error) {
      console.error('Erro ao verificar migração:', error)
      return false
    }
  }

  // Sincronizar dados do Supabase de volta para localStorage (backup)
  static async syncToLocalStorage(): Promise<void> {
    try {
      const supabaseProducts = await ProductsAPI.getAll()
      
      // Mapear de volta para o formato do localStorage
      const localFormat = supabaseProducts.map(product => ({
        id: product.id,
        name: product.name,
        code: product.code,
        description: product.description,
        category: product.category,
        quantity: product.quantity,
        unit: product.unit,
        costPrice: product.purchase_price,
        price: product.sell_price,
        minStock: product.min_stock,
        location: product.location,
        supplier: product.supplier,
        createdAt: product.created_at,
        updatedAt: product.updated_at
      }))

      localStorage.setItem('ecxus-stock-products', JSON.stringify(localFormat))
      console.log(`Sincronizados ${localFormat.length} produtos para localStorage`)
    } catch (error) {
      console.error('Erro ao sincronizar para localStorage:', error)
    }
  }

  // Restaurar dados do backup local
  static restoreFromBackup(): boolean {
    try {
      const backup = localStorage.getItem('ecxus-backup-products')
      if (!backup) return false

      const backupData = JSON.parse(backup)
      localStorage.setItem('ecxus-stock-products', JSON.stringify(backupData.data))
      console.log('Dados restaurados do backup local')
      return true
    } catch (error) {
      console.error('Erro ao restaurar backup:', error)
      return false
    }
  }
} 