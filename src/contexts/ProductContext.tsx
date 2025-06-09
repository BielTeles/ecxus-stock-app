'use client'

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { Product, ProductContextType, ProductFormData, ExportData } from '@/types/product'
import { validateProduct, sanitizeProductData } from '@/utils/validation'
import { APP_CONFIG } from '@/constants/app'

interface ExtendedProductContextType extends ProductContextType {
  isLoading: boolean
  error: string | null
  clearError: () => void
}

const ProductContext = createContext<ExtendedProductContextType | undefined>(undefined)

// Array de produtos iniciais vazio
const initialProducts: Product[] = []

export function ProductProvider({ children }: { children: ReactNode }) {
  const { 
    value: products, 
    setValue: setProducts, 
    isInitialized: isLoading, 
    error: storageError, 
    clearError: clearStorageError 
  } = useLocalStorage<Product[]>(APP_CONFIG.localStorage.keys.products, initialProducts)

  const addProduct = useCallback((productData: ProductFormData) => {
    // Sanitizar e validar dados de entrada
    const sanitizedData = sanitizeProductData(productData)
    const validation = validateProduct(sanitizedData)
    
    if (!validation.isValid) {
      const errorMessage = validation.errors.map(e => e.message).join(', ')
      throw new Error(`Dados inválidos: ${errorMessage}`)
    }

    const newProduct: Product = {
      ...sanitizedData as ProductFormData,
      id: Math.max(...products.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setProducts(prev => [...prev, newProduct])
  }, [products, setProducts])

  const updateProduct = useCallback((id: number, productData: Partial<Product>) => {
    const existingProduct = products.find(p => p.id === id)
    if (!existingProduct) {
      throw new Error(`Produto com ID ${id} não encontrado`)
    }

    // Criar dados completos para validação
    const completeData = { ...existingProduct, ...productData }
    const sanitizedData = sanitizeProductData(completeData)
    const validation = validateProduct(sanitizedData)
    
    if (!validation.isValid) {
      const errorMessage = validation.errors.map(e => e.message).join(', ')
      throw new Error(`Dados inválidos: ${errorMessage}`)
    }

    setProducts(prev => prev.map(product => 
      product.id === id 
        ? { ...product, ...sanitizedData, updatedAt: new Date().toISOString() }
        : product
    ))
  }, [products, setProducts])

  const deleteProduct = useCallback((id: number) => {
    const exists = products.some(p => p.id === id)
    if (!exists) {
      throw new Error(`Produto com ID ${id} não encontrado`)
    }
    
    setProducts(prev => prev.filter(product => product.id !== id))
  }, [products, setProducts])

  const getProductById = useCallback((id: number) => {
    return products.find(product => product.id === id)
  }, [products])

  const exportData = useCallback((): string => {
    const exportData: ExportData = {
      products,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    return JSON.stringify(exportData, null, 2)
  }, [products])

  const importData = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(data) as Partial<ExportData>
      
      if (!parsed.products || !Array.isArray(parsed.products)) {
        throw new Error('Formato de dados inválido: produtos não encontrados')
      }

      // Validar cada produto importado
      for (const product of parsed.products) {
        const validation = validateProduct(product)
        if (!validation.isValid) {
          throw new Error(`Produto inválido: ${validation.errors.map(e => e.message).join(', ')}`)
        }
      }

      setProducts(parsed.products as Product[])
      return true
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      return false
    }
  }, [setProducts])

  const clearAllData = useCallback(() => {
    setProducts([])
  }, [setProducts])

  const value: ExtendedProductContextType = useMemo(() => ({
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    exportData,
    importData,
    clearAllData,
    isLoading: !isLoading, // isInitialized -> isLoading (invertido)
    error: storageError,
    clearError: clearStorageError
  }), [
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    exportData,
    importData,
    clearAllData,
    isLoading,
    storageError,
    clearStorageError
  ])

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts deve ser usado dentro de um ProductProvider')
  }
  return context
} 