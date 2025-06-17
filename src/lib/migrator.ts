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
      if (supabaseProducts.length === 0 && localProducts.length > 0) {
        return true
      }

      // Se há dados em ambos, verificar se são consistentes
      // Se o localStorage tem produtos que não estão no Supabase (e vice-versa), pode precisar de migração
      if (supabaseProducts.length > 0 && localProducts.length > 0) {
        // Verificar se os dados são consistentes (mesmo número de produtos)
        // Se forem muito diferentes, pode ser que o localStorage tenha dados antigos
        const sizeDifference = Math.abs(supabaseProducts.length - localProducts.length)
        const percentageDifference = sizeDifference / Math.max(supabaseProducts.length, localProducts.length)
        
        // Se a diferença for maior que 20%, pode ser que há dados desatualizados
        if (percentageDifference > 0.2) {
          console.log(`⚠️ Diferença significativa entre Supabase (${supabaseProducts.length}) e localStorage (${localProducts.length})`)
          // Neste caso, vamos atualizar o localStorage com os dados do Supabase
          this.syncToLocalStorage()
          return false
        }
      }
      
      return false
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

  // Limpar dados órfãos do localStorage
  static async cleanOrphanedData(): Promise<void> {
    try {
      console.log('🧹 Limpando dados órfãos do localStorage...')
      
      // Buscar dados atuais do Supabase
      const supabaseProducts = await ProductsAPI.getAll()
      
      // Sincronizar localStorage com dados atuais do Supabase
      this.syncToLocalStorage()
      
      console.log(`✅ localStorage sincronizado com ${supabaseProducts.length} produtos do Supabase`)
    } catch (error) {
      console.error('❌ Erro ao limpar dados órfãos:', error)
    }
  }

  // Verificar e corrigir inconsistências
  static async verifyAndFixConsistency(): Promise<{ fixed: boolean; message: string }> {
    try {
      const localData = localStorage.getItem('ecxus-stock-products')
      const supabaseProducts = await ProductsAPI.getAll()

      if (!localData) {
        // Não há dados locais, sincronizar do Supabase
        this.syncToLocalStorage()
        return { fixed: true, message: 'localStorage sincronizado com Supabase' }
      }

      const localProducts = JSON.parse(localData)
      
      if (supabaseProducts.length === 0 && localProducts.length > 0) {
        return { fixed: false, message: 'Dados encontrados apenas no localStorage - migração necessária' }
      }

      if (supabaseProducts.length > 0 && localProducts.length === 0) {
        // Supabase tem dados, localStorage vazio - sincronizar
        this.syncToLocalStorage()
        return { fixed: true, message: 'localStorage vazio sincronizado com Supabase' }
      }

      // Ambos têm dados - verificar consistência
      const sizeDifference = Math.abs(supabaseProducts.length - localProducts.length)
      if (sizeDifference > 0) {
        console.log(`📊 Diferença detectada: Supabase(${supabaseProducts.length}) vs localStorage(${localProducts.length})`)
        // Sincronizar localStorage com Supabase (fonte da verdade)
        this.syncToLocalStorage()
        return { fixed: true, message: `Inconsistência corrigida: ${sizeDifference} produtos ajustados` }
      }

      return { fixed: false, message: 'Dados consistentes - nenhuma ação necessária' }
    } catch (error) {
      console.error('Erro ao verificar consistência:', error)
      return { fixed: false, message: 'Erro ao verificar consistência' }
    }
  }
} 