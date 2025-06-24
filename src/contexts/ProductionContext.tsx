'use client'

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useProducts } from './ProductContextV3'
import { 
  FinishedProduct, 
  ProductionContextType, 
  FinishedProductFormData,
  BOMItem,
  ProductionAnalysis,
  ProductionDashboardData
} from '@/types/production'
import { APP_CONFIG } from '@/constants/app'

interface ExtendedProductionContextType extends ProductionContextType {
  isLoading: boolean
  error: string | null
  clearError: () => void
  getDashboardData: () => ProductionDashboardData
}

const ProductionContext = createContext<ExtendedProductionContextType | undefined>(undefined)

// Array de produtos acabados iniciais vazio
const initialFinishedProducts: FinishedProduct[] = []

export function ProductionProvider({ children }: { children: ReactNode }) {
  const { products } = useProducts()
  
  const {
    value: finishedProducts,
    setValue: setFinishedProducts,
    isInitialized: isLoading,
    error: storageError,
    clearError: clearStorageError
  } = useLocalStorage<FinishedProduct[]>(APP_CONFIG.localStorage.keys.finishedProducts, initialFinishedProducts)

  const addFinishedProduct = useCallback((productData: FinishedProductFormData) => {
    const newProduct: FinishedProduct = {
      ...productData,
      id: Math.max(...finishedProducts.map(p => p.id), 0) + 1,
      bom: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setFinishedProducts(prev => [...prev, newProduct])
  }, [finishedProducts, setFinishedProducts])

  const updateFinishedProduct = useCallback((id: number, productData: Partial<FinishedProduct>) => {
    const exists = finishedProducts.some(p => p.id === id)
    if (!exists) {
      throw new Error(`Produto acabado com ID ${id} não encontrado`)
    }

    setFinishedProducts(prev => prev.map(product =>
      product.id === id
        ? { ...product, ...productData, updatedAt: new Date().toISOString() }
        : product
    ))
  }, [finishedProducts, setFinishedProducts])

  const deleteFinishedProduct = useCallback((id: number) => {
    const exists = finishedProducts.some(p => p.id === id)
    if (!exists) {
      throw new Error(`Produto acabado com ID ${id} não encontrado`)
    }

    setFinishedProducts(prev => prev.filter(product => product.id !== id))
  }, [finishedProducts, setFinishedProducts])

  const getFinishedProductById = useCallback((id: number) => {
    return finishedProducts.find(product => product.id === id)
  }, [finishedProducts])

  const addBOMItem = useCallback((finishedProductId: number, bomItemData: Omit<BOMItem, 'id' | 'createdAt' | 'updatedAt'>) => {
    const product = finishedProducts.find(p => p.id === finishedProductId)
    if (!product) {
      throw new Error(`Produto acabado com ID ${finishedProductId} não encontrado`)
    }

    // Verificar se o componente existe no estoque
    const component = products.find(c => c.id === bomItemData.componentId)
    if (!component) {
      throw new Error(`Componente com ID ${bomItemData.componentId} não encontrado no estoque`)
    }

    const newBOMItem: BOMItem = {
      ...bomItemData,
      id: Math.max(...(product.bom || []).map(b => b.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    setFinishedProducts(prev => prev.map(p =>
      p.id === finishedProductId
        ? { ...p, bom: [...(p.bom || []), newBOMItem], updatedAt: new Date().toISOString() }
        : p
    ))
  }, [finishedProducts, products, setFinishedProducts])

  const updateBOMItem = useCallback((finishedProductId: number, bomItemId: number, bomItemData: Partial<BOMItem>) => {
    const product = finishedProducts.find(p => p.id === finishedProductId)
    if (!product) {
      throw new Error(`Produto acabado com ID ${finishedProductId} não encontrado`)
    }

    const bomItemExists = (product.bom || []).some(b => b.id === bomItemId)
    if (!bomItemExists) {
      throw new Error(`Item BOM com ID ${bomItemId} não encontrado`)
    }

    setFinishedProducts(prev => prev.map(p =>
      p.id === finishedProductId
        ? {
            ...p,
            bom: (p.bom || []).map(b =>
              b.id === bomItemId
                ? { ...b, ...bomItemData, updatedAt: new Date().toISOString() }
                : b
            ),
            updatedAt: new Date().toISOString()
          }
        : p
    ))
  }, [finishedProducts, setFinishedProducts])

  const removeBOMItem = useCallback((finishedProductId: number, bomItemId: number) => {
    const product = finishedProducts.find(p => p.id === finishedProductId)
    if (!product) {
      throw new Error(`Produto acabado com ID ${finishedProductId} não encontrado`)
    }

    setFinishedProducts(prev => prev.map(p =>
      p.id === finishedProductId
        ? {
            ...p,
            bom: (p.bom || []).filter(b => b.id !== bomItemId),
            updatedAt: new Date().toISOString()
          }
        : p
    ))
  }, [finishedProducts, setFinishedProducts])

  const analyzeProduction = useCallback((finishedProductId: number): ProductionAnalysis | null => {
    const product = finishedProducts.find(p => p.id === finishedProductId)
    if (!product) return null

    const missingComponents = []
    let maxProducible = Infinity
    let totalCost = 0

    if (product.bom && Array.isArray(product.bom) && product.bom.length > 0) {
      for (const bomItem of product.bom) {
        const component = products.find(c => c.id === bomItem.componentId)
        if (!component) {
          console.warn(`Componente com ID ${bomItem.componentId} não encontrado`)
          continue
        }

        const available = component.quantity || 0
        const needed = bomItem.quantity
        const canProduce = Math.floor(available / needed)

        maxProducible = Math.min(maxProducible, canProduce)
        totalCost += (component.sell_price || 0) * needed

        if (canProduce === 0) {
          missingComponents.push({
            componentId: bomItem.componentId,
            needed,
            available,
            missing: needed - available
          })
        }
      }
    }

    // Se não há componentes na BOM, não pode produzir nada
    if (!product.bom || product.bom.length === 0) {
      maxProducible = 0
    }

    const profitMargin = product.sellPrice > 0 ? ((product.sellPrice - totalCost) / product.sellPrice) * 100 : 0

    return {
      finishedProductId,
      maxProducible: maxProducible === Infinity ? 0 : maxProducible,
      missingComponents,
      totalCost,
      profitMargin
    }
  }, [finishedProducts, products])

  const getDashboardData = useCallback((): ProductionDashboardData => {
    const totalFinishedProducts = finishedProducts.length
    const activeProducts = finishedProducts.filter(p => p.status === 'ACTIVE').length
    const totalProductionValue = finishedProducts.reduce((sum, p) => sum + p.sellPrice, 0)

    // Componentes mais usados
    const componentUsage = new Map<number, number>()
    finishedProducts.forEach(product => {
      if (!product.bom || !Array.isArray(product.bom)) return
      
        product.bom.forEach(bomItem => {
          const current = componentUsage.get(bomItem.componentId) || 0
          componentUsage.set(bomItem.componentId, current + 1)
        })
    })

    const mostUsedComponents = Array.from(componentUsage.entries())
      .map(([componentId, usageCount]) => ({ componentId, usageCount }))
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, 5)

    // Capacidade de produção
    const productionCapacity = finishedProducts
      .filter(p => p.status === 'ACTIVE')
      .map(product => {
        const analysis = analyzeProduction(product.id)
        return {
          finishedProductId: product.id,
          maxProducible: analysis?.maxProducible || 0
        }
      })
      .sort((a, b) => b.maxProducible - a.maxProducible)

    return {
      totalFinishedProducts,
      activeProducts,
      totalProductionValue,
      mostUsedComponents,
      productionCapacity
    }
  }, [finishedProducts, analyzeProduction])

  const exportProductionData = useCallback((): string => {
    const exportData = {
      finishedProducts,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    return JSON.stringify(exportData, null, 2)
  }, [finishedProducts])

  const importProductionData = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(data)
      
      if (!parsed.finishedProducts || !Array.isArray(parsed.finishedProducts)) {
        throw new Error('Formato de dados inválido: produtos acabados não encontrados')
      }

      setFinishedProducts(parsed.finishedProducts as FinishedProduct[])
      return true
    } catch (error) {
      console.error('Erro ao importar dados de produção:', error)
      return false
    }
  }, [setFinishedProducts])

  const clearAllProductionData = useCallback(() => {
    setFinishedProducts([])
  }, [setFinishedProducts])

  const value: ExtendedProductionContextType = useMemo(() => ({
    finishedProducts,
    addFinishedProduct,
    updateFinishedProduct,
    deleteFinishedProduct,
    getFinishedProductById,
    addBOMItem,
    updateBOMItem,
    removeBOMItem,
    analyzeProduction,
    exportProductionData,
    importProductionData,
    clearAllProductionData,
    getDashboardData,
    isLoading: !isLoading,
    error: storageError,
    clearError: clearStorageError
  }), [
    finishedProducts,
    addFinishedProduct,
    updateFinishedProduct,
    deleteFinishedProduct,
    getFinishedProductById,
    addBOMItem,
    updateBOMItem,
    removeBOMItem,
    analyzeProduction,
    exportProductionData,
    importProductionData,
    clearAllProductionData,
    getDashboardData,
    isLoading,
    storageError,
    clearStorageError
  ])

  return (
    <ProductionContext.Provider value={value}>
      {children}
    </ProductionContext.Provider>
  )
}

export function useProduction() {
  const context = useContext(ProductionContext)
  if (context === undefined) {
    throw new Error('useProduction deve ser usado dentro de um ProductionProvider')
  }
  return context
} 