'use client'

import { createContext, useContext, useCallback, useMemo } from 'react'
import { ProductionOrder, ProductionOrderItem, ProductionMetrics } from '@/types/production'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useProduction } from './ProductionContext'
import { useProducts } from './ProductContextV3'

interface ProductionOrderContextData {
  // State
  productionOrders: ProductionOrder[]
  orderItems: ProductionOrderItem[]
  loading: boolean
  error: string | null

  // Actions
  createProductionOrder: (order: Omit<ProductionOrder, 'id' | 'createdAt' | 'updatedAt'>) => Promise<ProductionOrder>
  updateProductionOrder: (id: number, updates: Partial<ProductionOrder>) => Promise<void>
  deleteProductionOrder: (id: number) => Promise<void>
  startProductionOrder: (id: number) => Promise<void>
  completeProductionOrder: (id: number) => Promise<void>
  cancelProductionOrder: (id: number) => Promise<void>

  // Queries
  getProductionOrderById: (id: number) => ProductionOrder | undefined
  getOrdersByStatus: (status: ProductionOrder['status']) => ProductionOrder[]
  getOrdersByFinishedProduct: (finishedProductId: number) => ProductionOrder[]
  getActiveOrders: () => ProductionOrder[]
  
  // Analytics
  getProductionMetrics: () => ProductionMetrics
  calculateOrderDuration: (finishedProductId: number, quantity: number) => number
  checkComponentAvailability: (orderId: number) => { available: boolean; missing: { componentId: number; needed: number; available: number }[] }
}

const ProductionOrderContext = createContext<ProductionOrderContextData | undefined>(undefined)

export function ProductionOrderProvider({ children }: { children: React.ReactNode }) {
  const { 
    value: productionOrders, 
    setValue: setProductionOrders, 
    loading: ordersLoading 
  } = useLocalStorage<ProductionOrder[]>('production-orders', [])
  
  const { 
    value: orderItems, 
    setValue: setOrderItems, 
    loading: itemsLoading 
  } = useLocalStorage<ProductionOrderItem[]>('production-order-items', [])

  const { getFinishedProductById } = useProduction()
  const { products, updateProduct } = useProducts()

  const loading = ordersLoading || itemsLoading
  const error = null

  // Generate unique ID
  const generateId = useCallback(() => {
    return Math.max(0, ...productionOrders.map(o => o.id)) + 1
  }, [productionOrders])

  const generateItemId = useCallback(() => {
    return Math.max(0, ...orderItems.map(i => i.id)) + 1
  }, [orderItems])

  // Create Production Order
  const createProductionOrder = useCallback(async (orderData: Omit<ProductionOrder, 'id' | 'createdAt' | 'updatedAt'>) => {
    const finishedProduct = getFinishedProductById(orderData.finishedProductId)
    if (!finishedProduct) {
      throw new Error('Produto acabado não encontrado')
    }

    const now = new Date()
    const newOrder: ProductionOrder = {
      ...orderData,
      id: generateId(),
      createdAt: now,
      updatedAt: now
    }

    // Create order items based on BOM
    const newOrderItems: ProductionOrderItem[] = finishedProduct.bom.map(bomItem => ({
      id: generateItemId() + bomItem.id,
      orderId: newOrder.id,
      componentId: bomItem.componentId,
      requiredQuantity: bomItem.quantity * orderData.quantity,
      allocatedQuantity: 0,
      consumedQuantity: 0,
      status: 'PENDING' as const
    }))

    setProductionOrders(prev => [...prev, newOrder])
    setOrderItems(prev => [...prev, ...newOrderItems])

    return newOrder
  }, [generateId, generateItemId, getFinishedProductById, setProductionOrders, setOrderItems])

  // Update Production Order
  const updateProductionOrder = useCallback(async (id: number, updates: Partial<ProductionOrder>) => {
    setProductionOrders(prev => 
      prev.map(order => 
        order.id === id 
          ? { ...order, ...updates, updatedAt: new Date() }
          : order
      )
    )
  }, [setProductionOrders])

  // Delete Production Order
  const deleteProductionOrder = useCallback(async (id: number) => {
    setProductionOrders(prev => prev.filter(order => order.id !== id))
    setOrderItems(prev => prev.filter(item => item.orderId !== id))
  }, [setProductionOrders, setOrderItems])

  // Start Production Order
  const startProductionOrder = useCallback(async (id: number) => {
    const order = productionOrders.find(o => o.id === id)
    if (!order || order.status !== 'PLANNED') {
      throw new Error('Ordem de produção não pode ser iniciada')
    }

    await updateProductionOrder(id, {
      status: 'IN_PROGRESS',
      actualStartDate: new Date()
    })
  }, [productionOrders, updateProductionOrder])

  // Complete Production Order
  const completeProductionOrder = useCallback(async (id: number) => {
    const order = productionOrders.find(o => o.id === id)
    if (!order || order.status !== 'IN_PROGRESS') {
      throw new Error('Ordem de produção não pode ser finalizada')
    }

    const finishedProduct = getFinishedProductById(order.finishedProductId)
    if (!finishedProduct) {
      throw new Error('Produto acabado não encontrado')
    }

    // Consume components from inventory
    const orderItemsForOrder = orderItems.filter(item => item.orderId === id)
    
    for (const orderItem of orderItemsForOrder) {
      const component = products.find(p => p.id === orderItem.componentId)
      if (component) {
        const newQuantity = component.quantity - orderItem.requiredQuantity
        await updateProduct(component.id, { quantity: Math.max(0, newQuantity) })
      }
    }

    // Update order items status
    setOrderItems(prev => 
      prev.map(item => 
        item.orderId === id 
          ? { ...item, status: 'CONSUMED' as const, consumedQuantity: item.requiredQuantity }
          : item
      )
    )

    await updateProductionOrder(id, {
      status: 'COMPLETED',
      actualEndDate: new Date()
    })
  }, [productionOrders, orderItems, getFinishedProductById, products, updateProduct, setOrderItems, updateProductionOrder])

  // Cancel Production Order
  const cancelProductionOrder = useCallback(async (id: number) => {
    await updateProductionOrder(id, {
      status: 'CANCELLED'
    })
  }, [updateProductionOrder])

  // Queries
  const getProductionOrderById = useCallback((id: number) => {
    return productionOrders.find(order => order.id === id)
  }, [productionOrders])

  const getOrdersByStatus = useCallback((status: ProductionOrder['status']) => {
    return productionOrders.filter(order => order.status === status)
  }, [productionOrders])

  const getOrdersByFinishedProduct = useCallback((finishedProductId: number) => {
    return productionOrders.filter(order => order.finishedProductId === finishedProductId)
  }, [productionOrders])

  const getActiveOrders = useCallback(() => {
    return productionOrders.filter(order => 
      order.status === 'PLANNED' || order.status === 'IN_PROGRESS'
    )
  }, [productionOrders])

  // Calculate order duration
  const calculateOrderDuration = useCallback((finishedProductId: number, quantity: number) => {
    const finishedProduct = getFinishedProductById(finishedProductId)
    if (!finishedProduct) return 0
    
    // Base time per unit + setup time
    const setupTime = 30 // 30 minutes setup
    const unitTime = finishedProduct.estimatedTime || 10
    
    return setupTime + (unitTime * quantity)
  }, [getFinishedProductById])

  // Check component availability
  const checkComponentAvailability = useCallback((orderId: number) => {
    const orderItemsForOrder = orderItems.filter(item => item.orderId === orderId)
    const missing: { componentId: number; needed: number; available: number }[] = []
    
    for (const orderItem of orderItemsForOrder) {
      const component = products.find(p => p.id === orderItem.componentId)
      if (!component || component.quantity < orderItem.requiredQuantity) {
        missing.push({
          componentId: orderItem.componentId,
          needed: orderItem.requiredQuantity,
          available: component?.quantity || 0
        })
      }
    }
    
    return {
      available: missing.length === 0,
      missing
    }
  }, [orderItems, products])

  // Production Metrics
  const getProductionMetrics = useCallback((): ProductionMetrics => {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    
    const totalOrders = productionOrders.length
    const activeOrders = productionOrders.filter(o => o.status === 'IN_PROGRESS').length
    const pendingOrders = productionOrders.filter(o => o.status === 'PLANNED').length
    const completedToday = productionOrders.filter(o => 
      o.status === 'COMPLETED' && 
      o.actualEndDate && 
      new Date(o.actualEndDate) >= today
    ).length

    const completedOrders = productionOrders.filter(o => 
      o.status === 'COMPLETED' && 
      o.actualStartDate && 
      o.actualEndDate
    )

    const averageCompletionTime = completedOrders.length > 0
      ? completedOrders.reduce((sum, order) => {
          const start = new Date(order.actualStartDate!).getTime()
          const end = new Date(order.actualEndDate!).getTime()
          return sum + (end - start)
        }, 0) / completedOrders.length / 1000 / 60 // in minutes
      : 0

    const onTimeOrders = completedOrders.filter(order => {
      if (!order.actualEndDate || !order.plannedEndDate) return false
      return new Date(order.actualEndDate) <= new Date(order.plannedEndDate)
    }).length

    const onTimeDelivery = completedOrders.length > 0 
      ? (onTimeOrders / completedOrders.length) * 100 
      : 0

    const efficiency = completedOrders.length > 0
      ? completedOrders.reduce((sum, order) => {
          const planned = order.estimatedDuration
          const actual = order.actualStartDate && order.actualEndDate
            ? (new Date(order.actualEndDate).getTime() - new Date(order.actualStartDate).getTime()) / 1000 / 60
            : planned
          return sum + (planned / actual) * 100
        }, 0) / completedOrders.length
      : 0

    return {
      totalOrders,
      activeOrders,
      completedToday,
      pendingOrders,
      averageCompletionTime,
      efficiency: Math.min(100, efficiency),
      onTimeDelivery
    }
  }, [productionOrders])

  const contextValue = useMemo(() => ({
    // State
    productionOrders,
    orderItems,
    loading,
    error,

    // Actions
    createProductionOrder,
    updateProductionOrder,
    deleteProductionOrder,
    startProductionOrder,
    completeProductionOrder,
    cancelProductionOrder,

    // Queries
    getProductionOrderById,
    getOrdersByStatus,
    getOrdersByFinishedProduct,
    getActiveOrders,

    // Analytics
    getProductionMetrics,
    calculateOrderDuration,
    checkComponentAvailability
  }), [
    productionOrders,
    orderItems,
    loading,
    error,
    createProductionOrder,
    updateProductionOrder,
    deleteProductionOrder,
    startProductionOrder,
    completeProductionOrder,
    cancelProductionOrder,
    getProductionOrderById,
    getOrdersByStatus,
    getOrdersByFinishedProduct,
    getActiveOrders,
    getProductionMetrics,
    calculateOrderDuration,
    checkComponentAvailability
  ])

  return (
    <ProductionOrderContext.Provider value={contextValue}>
      {children}
    </ProductionOrderContext.Provider>
  )
}

export function useProductionOrders() {
  const context = useContext(ProductionOrderContext)
  if (context === undefined) {
    throw new Error('useProductionOrders must be used within a ProductionOrderProvider')
  }
  return context
} 