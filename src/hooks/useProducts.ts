import { useState, useEffect, useCallback } from 'react'
import { ProductService } from '@/services/productService'
import type { Product } from '@/types/product'

interface UseProductsReturn {
  products: Product[]
  loading: boolean
  error: string | null
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>
  updateProduct: (id: number, updates: Partial<Product>) => Promise<void>
  deleteProduct: (id: number) => Promise<void>
  getProductById: (id: number) => Product | undefined
  searchProducts: (term: string) => Promise<Product[]>
  getLowStockProducts: () => Promise<Product[]>
  updateStock: (id: number, quantity: number) => Promise<void>
  consumeStock: (id: number, quantity: number) => Promise<void>
  refreshProducts: () => Promise<void>
  clearError: () => void
}

export function useProducts(): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // ==========================================
  // CARREGAMENTO INICIAL
  // ==========================================
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await ProductService.getAllProducts()
      setProducts(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao carregar produtos'
      setError(errorMessage)
      console.error('Erro ao carregar produtos:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  // Carregar produtos na inicialização
  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // ==========================================
  // ADICIONAR PRODUTO
  // ==========================================
  const addProduct = useCallback(async (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      setError(null)
      const newProduct = await ProductService.createProduct(productData)
      setProducts(prev => [newProduct, ...prev])
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar produto'
      setError(errorMessage)
      throw err
    }
  }, [])

  // ==========================================
  // ATUALIZAR PRODUTO
  // ==========================================
  const updateProduct = useCallback(async (id: number, updates: Partial<Product>) => {
    try {
      setError(null)
      const updatedProduct = await ProductService.updateProduct(id, updates)
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar produto'
      setError(errorMessage)
      throw err
    }
  }, [])

  // ==========================================
  // DELETAR PRODUTO
  // ==========================================
  const deleteProduct = useCallback(async (id: number) => {
    try {
      setError(null)
      await ProductService.deleteProduct(id)
      setProducts(prev => prev.filter(product => product.id !== id))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao deletar produto'
      setError(errorMessage)
      throw err
    }
  }, [])

  // ==========================================
  // BUSCAR PRODUTO POR ID
  // ==========================================
  const getProductById = useCallback((id: number): Product | undefined => {
    return products.find(product => product.id === id)
  }, [products])

  // ==========================================
  // BUSCAR PRODUTOS
  // ==========================================
  const searchProducts = useCallback(async (term: string): Promise<Product[]> => {
    try {
      setError(null)
      return await ProductService.searchProducts(term)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro na busca de produtos'
      setError(errorMessage)
      throw err
    }
  }, [])

  // ==========================================
  // PRODUTOS COM ESTOQUE BAIXO
  // ==========================================
  const getLowStockProducts = useCallback(async (): Promise<Product[]> => {
    try {
      setError(null)
      return await ProductService.getLowStockProducts()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao buscar produtos com estoque baixo'
      setError(errorMessage)
      throw err
    }
  }, [])

  // ==========================================
  // ATUALIZAR ESTOQUE
  // ==========================================
  const updateStock = useCallback(async (id: number, quantity: number) => {
    try {
      setError(null)
      const updatedProduct = await ProductService.updateStock(id, quantity)
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar estoque'
      setError(errorMessage)
      throw err
    }
  }, [])

  // ==========================================
  // CONSUMIR ESTOQUE
  // ==========================================
  const consumeStock = useCallback(async (id: number, quantity: number) => {
    try {
      setError(null)
      const updatedProduct = await ProductService.consumeStock(id, quantity)
      setProducts(prev => 
        prev.map(product => 
          product.id === id ? updatedProduct : product
        )
      )
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao consumir estoque'
      setError(errorMessage)
      throw err
    }
  }, [])

  // ==========================================
  // RECARREGAR PRODUTOS
  // ==========================================
  const refreshProducts = useCallback(async () => {
    await loadProducts()
  }, [loadProducts])

  // ==========================================
  // LIMPAR ERRO
  // ==========================================
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  return {
    products,
    loading,
    error,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    searchProducts,
    getLowStockProducts,
    updateStock,
    consumeStock,
    refreshProducts,
    clearError
  }
}

export default useProducts 