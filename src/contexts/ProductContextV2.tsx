'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ProductService } from '@/services/productService'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import type { Product } from '@/types/product'

// ==========================================
// TIPOS E INTERFACES
// ==========================================
interface ProductContextType {
  // Estado
  products: Product[]
  loading: boolean
  error: string | null
  isOnline: boolean
  
  // Operações CRUD
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateProduct: (id: number, product: Partial<Product>) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  getProductById: (id: number) => Product | undefined
  
  // Operações de estoque
  updateStock: (id: number, quantity: number) => Promise<void>
  consumeStock: (id: number, quantity: number) => Promise<void>
  
  // Operações avançadas
  searchProducts: (term: string) => Promise<Product[]>
  getLowStockProducts: () => Promise<Product[]>
  getProductsByCategory: (category: string) => Product[]
  
  // Utilidades
  refreshProducts: () => Promise<void>
  clearError: () => void
  syncWithCloud: () => Promise<void>
  
  // Estatísticas
  getTotalValue: () => number
  getLowStockCount: () => number
}

// ==========================================
// CONTEXTO
// ==========================================
const ProductContext = createContext<ProductContextType | undefined>(undefined)

// ==========================================
// PROVIDER
// ==========================================
interface ProductProviderProps {
  children: React.ReactNode
  forceOffline?: boolean // Para testes ou modo offline forçado
}

export function ProductProvider({ children, forceOffline = false }: ProductProviderProps) {
  // Estados
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isOnline, setIsOnline] = useState(false)
  
  // Backup local
  const { value: localProducts, setValue: setLocalProducts } = useLocalStorage<Product[]>('ecxus-products-v2', [])

  // ==========================================
  // DETECÇÃO DE CONECTIVIDADE
  // ==========================================
  const checkConnectivity = useCallback(async () => {
    if (forceOffline) {
      setIsOnline(false)
      return false
    }

    try {
      // Tenta uma operação simples no Supabase
      await ProductService.getAllProducts()
      setIsOnline(true)
      return true
    } catch (error) {
      console.warn('Modo offline - usando localStorage:', error)
      setIsOnline(false)
      return false
    }
  }, [forceOffline])

  // ==========================================
  // CARREGAMENTO INICIAL
  // ==========================================
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const online = await checkConnectivity()
      
      if (online) {
        // Modo online - usar Supabase
        const cloudProducts = await ProductService.getAllProducts()
        setProducts(cloudProducts)
        // Fazer backup local
        setLocalProducts(cloudProducts)
      } else {
        // Modo offline - usar localStorage
        setProducts(localProducts)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos'
      setError(errorMessage)
      console.error('Erro ao carregar produtos:', err)
      
      // Fallback para dados locais
      setProducts(localProducts)
      setIsOnline(false)
    } finally {
      setLoading(false)
    }
  }, [checkConnectivity, localProducts, setLocalProducts])

  // Carregar na inicialização
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // ==========================================
  // OPERAÇÕES CRUD
  // ==========================================

  // Adicionar produto
  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      
      if (isOnline) {
        // Modo online
        const newProduct = await ProductService.createProduct(productData)
        setProducts(prev => [newProduct, ...prev])
        // Atualizar backup local
        setLocalProducts(prev => [newProduct, ...prev])
      } else {
        // Modo offline
        const newProduct: Product = {
          ...productData,
          id: Date.now(), // ID temporário
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        
        const updatedProducts = [newProduct, ...products]
        setProducts(updatedProducts)
        setLocalProducts(updatedProducts)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar produto'
      setError(errorMessage)
      throw err
    }
  }, [isOnline, products, setLocalProducts])

  // Atualizar produto
  const updateProduct = useCallback(async (id: number, updates: Partial<Product>) => {
    try {
      setError(null)
      
      if (isOnline) {
        // Modo online
        const updatedProduct = await ProductService.updateProduct(id, updates)
        setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
        setLocalProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      } else {
        // Modo offline
        const updatedProducts = products.map(p => 
          p.id === id 
            ? { ...p, ...updates, updatedAt: new Date().toISOString() }
            : p
        )
        setProducts(updatedProducts)
        setLocalProducts(updatedProducts)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto'
      setError(errorMessage)
      throw err
    }
  }, [isOnline, products, setLocalProducts])

  // Deletar produto
  const deleteProduct = useCallback(async (id: number) => {
    try {
      setError(null)
      
      if (isOnline) {
        // Modo online
        await ProductService.deleteProduct(id)
        setProducts(prev => prev.filter(p => p.id !== id))
        setLocalProducts(prev => prev.filter(p => p.id !== id))
      } else {
        // Modo offline
        const updatedProducts = products.filter(p => p.id !== id)
        setProducts(updatedProducts)
        setLocalProducts(updatedProducts)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar produto'
      setError(errorMessage)
      throw err
    }
  }, [isOnline, products, setLocalProducts])

  // ==========================================
  // OPERAÇÕES DE ESTOQUE
  // ==========================================

  // Atualizar estoque
  const updateStock = useCallback(async (id: number, quantity: number) => {
    await updateProduct(id, { quantity })
  }, [updateProduct])

  // Consumir estoque
  const consumeStock = useCallback(async (id: number, quantityToConsume: number) => {
    const product = products.find(p => p.id === id)
    if (!product) {
      throw new Error('Produto não encontrado')
    }
    
    if (product.quantity < quantityToConsume) {
      throw new Error(`Estoque insuficiente. Disponível: ${product.quantity}, Solicitado: ${quantityToConsume}`)
    }

    const newQuantity = product.quantity - quantityToConsume
    await updateProduct(id, { quantity: newQuantity })
  }, [products, updateProduct])

  // ==========================================
  // OPERAÇÕES DE BUSCA
  // ==========================================

  // Buscar produto por ID
  const getProductById = useCallback((id: number): Product | undefined => {
    return products.find(p => p.id === id)
  }, [products])

  // Buscar produtos
  const searchProducts = useCallback(async (term: string): Promise<Product[]> => {
    try {
      setError(null)
      
      if (isOnline) {
        return await ProductService.searchProducts(term)
      } else {
        // Busca local
        const searchTerm = term.toLowerCase()
        return products.filter(p => 
          p.name.toLowerCase().includes(searchTerm) ||
          p.code.toLowerCase().includes(searchTerm) ||
          p.description.toLowerCase().includes(searchTerm) ||
          p.supplier.toLowerCase().includes(searchTerm)
        )
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na busca'
      setError(errorMessage)
      throw err
    }
  }, [isOnline, products])

  // Produtos com estoque baixo
  const getLowStockProducts = useCallback(async (): Promise<Product[]> => {
    try {
      setError(null)
      
      if (isOnline) {
        return await ProductService.getLowStockProducts()
      } else {
        return products.filter(p => p.quantity <= p.minStock)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar produtos com estoque baixo'
      setError(errorMessage)
      throw err
    }
  }, [isOnline, products])

  // Produtos por categoria
  const getProductsByCategory = useCallback((category: string): Product[] => {
    return products.filter(p => p.category === category)
  }, [products])

  // ==========================================
  // UTILIDADES
  // ==========================================

  // Recarregar produtos
  const refreshProducts = useCallback(async () => {
    await loadProducts()
  }, [loadProducts])

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Sincronizar com nuvem
  const syncWithCloud = useCallback(async () => {
    try {
      setError(null)
      const online = await checkConnectivity()
      
      if (online) {
        // Sincronizar dados locais com a nuvem
        const cloudProducts = await ProductService.getAllProducts()
        setProducts(cloudProducts)
        setLocalProducts(cloudProducts)
        setIsOnline(true)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na sincronização'
      setError(errorMessage)
    }
  }, [checkConnectivity, setLocalProducts])

  // ==========================================
  // ESTATÍSTICAS
  // ==========================================

  // Valor total do estoque
  const getTotalValue = useCallback((): number => {
    return products.reduce((total, p) => total + (p.quantity * p.purchasePrice), 0)
  }, [products])

  // Quantidade de produtos com estoque baixo
  const getLowStockCount = useCallback((): number => {
    return products.filter(p => p.quantity <= p.minStock).length
  }, [products])

  // ==========================================
  // PROVIDER VALUE
  // ==========================================
  const value: ProductContextType = {
    // Estado
    products,
    loading,
    error,
    isOnline,
    
    // Operações CRUD
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    
    // Operações de estoque
    updateStock,
    consumeStock,
    
    // Operações avançadas
    searchProducts,
    getLowStockProducts,
    getProductsByCategory,
    
    // Utilidades
    refreshProducts,
    clearError,
    syncWithCloud,
    
    // Estatísticas
    getTotalValue,
    getLowStockCount
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

// ==========================================
// HOOK CUSTOMIZADO
// ==========================================
export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts deve ser usado dentro de ProductProvider')
  }
  return context
}

export default ProductProvider 