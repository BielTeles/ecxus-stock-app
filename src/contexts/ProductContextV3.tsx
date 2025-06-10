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
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Carregar produtos na inicialização
  const loadProducts = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await ProductsAPI.getAll()
      setProducts(data)
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
  }, [])

  // Carregar produtos na inicialização
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Adicionar produto
  const addProduct = useCallback(async (productData: Omit<ProductInsert, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      setError(null)
      const newProduct = await ProductsAPI.create(productData)
      setProducts(prev => [newProduct, ...prev])
    } catch (err) {
      console.error('Erro ao adicionar produto:', err)
      setError(err instanceof Error ? err.message : 'Erro ao adicionar produto')
      throw err
    }
  }, [])

  // Atualizar produto
  const updateProduct = useCallback(async (id: number, productData: Partial<ProductInsert>) => {
    try {
      setError(null)
      const updatedProduct = await ProductsAPI.update(id, productData)
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
    } catch (err) {
      console.error('Erro ao atualizar produto:', err)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar produto')
      throw err
    }
  }, [])

  // Deletar produto
  const deleteProduct = useCallback(async (id: number) => {
    try {
      setError(null)
      await ProductsAPI.delete(id)
      setProducts(prev => prev.filter(p => p.id !== id))
    } catch (err) {
      console.error('Erro ao deletar produto:', err)
      setError(err instanceof Error ? err.message : 'Erro ao deletar produto')
      throw err
    }
  }, [])

  // Buscar produto por ID
  const getProductById = useCallback((id: number) => {
    return products.find(p => p.id === id) || null
  }, [products])

  // Atualizar estoque
  const updateStock = useCallback(async (id: number, newQuantity: number) => {
    try {
      setError(null)
      const updatedProduct = await ProductsAPI.updateStock(id, newQuantity)
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
    } catch (err) {
      console.error('Erro ao atualizar estoque:', err)
      setError(err instanceof Error ? err.message : 'Erro ao atualizar estoque')
      throw err
    }
  }, [])

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
    getStats
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