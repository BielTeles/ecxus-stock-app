'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { ProductsAPI } from '@/lib/api/products'
import type { Database } from '@/lib/supabase'

type Product = Database['public']['Tables']['products']['Row']
type ProductInsert = Database['public']['Tables']['products']['Insert']

interface ProductContextType {
  products: Product[]
  isLoading: boolean
  error: string | null
  addProduct: (productData: Omit<ProductInsert, 'id' | 'created_at' | 'updated_at'>) => Promise<void>
  updateProduct: (id: number, productData: Partial<ProductInsert>) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  getProductById: (id: number) => Product | null
  refreshProducts: () => Promise<void>
  clearError: () => void
  updateStock: (id: number, newQuantity: number) => Promise<void>
  getLowStockProducts: () => Product[]
  getCategories: () => string[]
  getStats: () => { total: number; lowStock: number; zeroStock: number }
  exportData: () => string
  importData: (data: string) => boolean
  clearAllData: () => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Sincronizar produtos para localStorage
  const syncToLocalStorage = useCallback((products: Product[]) => {
    try {
      // Mapear para o formato do localStorage
      const localFormat = products.map(product => ({
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
      console.log(`✅ Sincronizados ${localFormat.length} produtos para localStorage`)
    } catch (error) {
      console.error('❌ Erro ao sincronizar para localStorage:', error)
    }
  }, [])

  // Carregar produtos na inicialização
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await ProductsAPI.getAll()
      setProducts(data)
      // Sincronizar para localStorage após carregar do Supabase
      syncToLocalStorage(data)
    } catch (err) {
      console.error('Erro ao carregar produtos:', err)
      setError(err instanceof Error ? err.message : 'Erro desconhecido')
      // Em caso de erro, carregar dados do localStorage como fallback
      const localData = localStorage.getItem('ecxus-stock-products')
      if (localData) {
        try {
          const parsedData = JSON.parse(localData)
          setProducts(parsedData)
          console.log('Dados carregados do localStorage como fallback')
        } catch (parseErr) {
          console.error('Erro ao carregar fallback do localStorage:', parseErr)
        }
      }
    } finally {
      setIsLoading(false)
    }
  }, [syncToLocalStorage])

  // Carregar produtos na inicialização
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Adicionar produto
  const addProduct = useCallback(async (productData: Omit<ProductInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      const newProduct = await ProductsAPI.create(productData)
      const updatedProducts = [newProduct, ...products]
      setProducts(updatedProducts)
      // Sincronizar para localStorage
      syncToLocalStorage(updatedProducts)
    } catch (err) {
      console.error('Erro ao adicionar produto:', err)
      setError(err instanceof Error ? err.message : 'Erro ao adicionar produto')
      throw err
    }
  }, [products, syncToLocalStorage])

  // Atualizar produto
  const updateProduct = useCallback(async (id: number, productData: Partial<ProductInsert>) => {
    try {
      setError(null)
      const updatedProduct = await ProductsAPI.update(id, productData)
      const updatedProducts = products.map(p => p.id === id ? updatedProduct : p)
      setProducts(updatedProducts)
      // Sincronizar para localStorage
      syncToLocalStorage(updatedProducts)
    } catch (err) {
      console.error('Erro ao atualizar produto:', err)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto')
      throw err
    }
  }, [products, syncToLocalStorage])

  // Deletar produto
  const deleteProduct = useCallback(async (id: number) => {
    try {
      setError(null)
      await ProductsAPI.delete(id)
      const updatedProducts = products.filter(p => p.id !== id)
      setProducts(updatedProducts)
      // Sincronizar para localStorage (removendo o produto deletado)
      syncToLocalStorage(updatedProducts)
      console.log(`🗑️ Produto ${id} removido do Supabase e localStorage`)
    } catch (err) {
      console.error('Erro ao deletar produto:', err)
      setError(err instanceof Error ? err.message : 'Erro ao deletar produto')
      throw err
    }
  }, [products, syncToLocalStorage])

  // Buscar produto por ID
  const getProductById = useCallback((id: number) => {
    return products.find(p => p.id === id) || null
  }, [products])

  // Atualizar estoque
  const updateStock = useCallback(async (id: number, newQuantity: number) => {
    try {
      setError(null)
      const updatedProduct = await ProductsAPI.updateStock(id, newQuantity)
      const updatedProducts = products.map(p => p.id === id ? updatedProduct : p)
      setProducts(updatedProducts)
      // Sincronizar para localStorage
      syncToLocalStorage(updatedProducts)
    } catch (err) {
      console.error('Erro ao atualizar estoque:', err)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar estoque')
      throw err
    }
  }, [products, syncToLocalStorage])

  // Produtos com estoque baixo
  const getLowStockProducts = useCallback(() => {
    return products.filter(p => p.quantity <= p.min_stock)
  }, [products])

  // Obter categorias únicas
  const getCategories = useCallback(() => {
    const categories = products.map(p => p.category)
    return [...new Set(categories)].filter(Boolean)
  }, [products])

  // Obter estatísticas
  const getStats = useCallback(() => {
    return {
      total: products.length,
      lowStock: products.filter(p => p.quantity <= p.min_stock).length,
      zeroStock: products.filter(p => p.quantity === 0).length
    }
  }, [products])

  // Refresh manual
  const refreshProducts = useCallback(async () => {
    await loadProducts()
  }, [loadProducts])

  // Limpar erro
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  // Exportar dados
  const exportData = useCallback(() => {
    const exportObject = {
      products: products,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    return JSON.stringify(exportObject, null, 2)
  }, [products])

  // Importar dados
  const importData = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(data)
      
      if (!parsed.products || !Array.isArray(parsed.products)) {
        throw new Error('Formato de dados inválido: produtos não encontrados')
      }

      setProducts(parsed.products as Product[])
      syncToLocalStorage(parsed.products as Product[])
      return true
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      return false
    }
  }, [syncToLocalStorage])

  // Limpar todos os dados
  const clearAllData = useCallback(() => {
    setProducts([])
    localStorage.removeItem('ecxus-stock-products')
    localStorage.removeItem('ecxus-backup-products')
    console.log('🗑️ Todos os dados de produtos foram limpos')
  }, [])

  const value: ProductContextType = {
    products,
    isLoading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    refreshProducts,
    clearError,
    updateStock,
    getLowStockProducts,
    getCategories,
    getStats,
    exportData,
    importData,
    clearAllData
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts must be used within a ProductProvider')
  }
  return context
} 