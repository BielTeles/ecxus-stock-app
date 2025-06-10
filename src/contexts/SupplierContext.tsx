'use client'

import React, { createContext, useContext, ReactNode, useCallback, useMemo } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { useProducts } from '@/contexts/ProductContextV3'
import { 
  Supplier, 
  SupplierFormData, 
  SupplierContextType, 
  PurchaseOrder, 
  PurchaseOrderItem,
  Quote,
  PriceHistory,
  StockAlert,
  SupplierPerformance,
  PurchaseSuggestion
} from '@/types/supplier'
import { APP_CONFIG } from '@/constants/app'

interface ExtendedSupplierContextType extends SupplierContextType {
  isLoading: boolean
  error: string | null
  clearError: () => void
}

const SupplierContext = createContext<ExtendedSupplierContextType | undefined>(undefined)

// Arrays iniciais vazios
const initialSuppliers: Supplier[] = []
const initialPurchaseOrders: PurchaseOrder[] = []
const initialQuotes: Quote[] = []
const initialPriceHistory: PriceHistory[] = []
const initialStockAlerts: StockAlert[] = []

export function SupplierProvider({ children }: { children: ReactNode }) {
  const { products, updateProduct } = useProducts()
  
  const { 
    value: suppliers, 
    setValue: setSuppliers, 
    isInitialized: isLoadingSuppliers, 
    error: suppliersError, 
    clearError: clearSuppliersError 
  } = useLocalStorage<Supplier[]>(APP_CONFIG.localStorage.keys.suppliers, initialSuppliers)

  const { 
    value: purchaseOrders, 
    setValue: setPurchaseOrders,
    error: ordersError
  } = useLocalStorage<PurchaseOrder[]>(APP_CONFIG.localStorage.keys.purchaseOrders, initialPurchaseOrders)

  const { 
    value: quotes, 
    setValue: setQuotes,
    error: quotesError
  } = useLocalStorage<Quote[]>(APP_CONFIG.localStorage.keys.quotes, initialQuotes)

  const { 
    value: priceHistory, 
    setValue: setPriceHistory
  } = useLocalStorage<PriceHistory[]>(APP_CONFIG.localStorage.keys.priceHistory, initialPriceHistory)

  const { 
    value: stockAlerts, 
    setValue: setStockAlerts
  } = useLocalStorage<StockAlert[]>(APP_CONFIG.localStorage.keys.stockAlerts, initialStockAlerts)

  // Supplier Management
  const addSupplier = useCallback((supplierData: SupplierFormData) => {
    const newSupplier: Supplier = {
      ...supplierData,
      id: Math.max(...suppliers.map(s => s.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setSuppliers(prev => [...prev, newSupplier])
  }, [suppliers, setSuppliers])

  const updateSupplier = useCallback((id: number, supplierData: Partial<Supplier>) => {
    const exists = suppliers.some(s => s.id === id)
    if (!exists) {
      throw new Error(`Fornecedor com ID ${id} não encontrado`)
    }

    setSuppliers(prev => prev.map(supplier =>
      supplier.id === id
        ? { ...supplier, ...supplierData, updatedAt: new Date().toISOString() }
        : supplier
    ))
  }, [suppliers, setSuppliers])

  const deleteSupplier = useCallback((id: number) => {
    const exists = suppliers.some(s => s.id === id)
    if (!exists) {
      throw new Error(`Fornecedor com ID ${id} não encontrado`)
    }

    // Verificar se há pedidos ativos para este fornecedor
    const activeOrders = purchaseOrders.filter(po => 
      po.supplierId === id && 
      !['COMPLETED', 'CANCELLED'].includes(po.status)
    )

    if (activeOrders.length > 0) {
      throw new Error(`Não é possível excluir fornecedor com pedidos ativos`)
    }

    setSuppliers(prev => prev.filter(supplier => supplier.id !== id))
  }, [suppliers, purchaseOrders, setSuppliers])

  const getSupplierById = useCallback((id: number) => {
    return suppliers.find(supplier => supplier.id === id)
  }, [suppliers])

  // Purchase Orders
  const createPurchaseOrder = useCallback((orderData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => {
    const orderNumber = `PO${Date.now().toString().slice(-6).padStart(6, '0')}`
    
    const newOrder: PurchaseOrder = {
      ...orderData,
      id: Math.max(...purchaseOrders.map(po => po.id), 0) + 1,
      orderNumber,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setPurchaseOrders(prev => [...prev, newOrder])

    // Adicionar entradas ao histórico de preços
    orderData.items.forEach(item => {
      const priceEntry: PriceHistory = {
        id: Math.max(...priceHistory.map(ph => ph.id), 0) + 1,
        productId: item.productId,
        supplierId: orderData.supplierId,
        price: item.unitPrice,
        quantity: item.quantity,
        date: new Date().toISOString(),
        source: 'PURCHASE_ORDER'
      }
      setPriceHistory(prev => [...prev, priceEntry])
    })
  }, [purchaseOrders, priceHistory, setPurchaseOrders, setPriceHistory])

  const updatePurchaseOrder = useCallback((id: number, orderData: Partial<PurchaseOrder>) => {
    setPurchaseOrders(prev => prev.map(order =>
      order.id === id
        ? { ...order, ...orderData, updatedAt: new Date().toISOString() }
        : order
    ))
  }, [setPurchaseOrders])

  const cancelPurchaseOrder = useCallback((id: number) => {
    updatePurchaseOrder(id, { status: 'CANCELLED' })
  }, [updatePurchaseOrder])

  const receivePurchaseOrderItem = useCallback((orderId: number, itemId: number, receivedQuantity: number) => {
    const order = purchaseOrders.find(po => po.id === orderId)
    if (!order) {
      throw new Error(`Pedido de compra com ID ${orderId} não encontrado`)
    }

    const item = order.items.find(i => i.id === itemId)
    if (!item) {
      throw new Error(`Item com ID ${itemId} não encontrado no pedido`)
    }

    // Atualizar item do pedido
    const updatedItems = order.items.map(i => 
      i.id === itemId 
        ? { 
            ...i, 
            receivedQuantity: i.receivedQuantity + receivedQuantity,
            status: (i.receivedQuantity + receivedQuantity >= i.quantity) ? 'RECEIVED' : 'PARTIALLY_RECEIVED'
          }
        : i
    )

    // Verificar se pedido está completo
    const allItemsReceived = updatedItems.every(i => i.status === 'RECEIVED')
    const someItemsReceived = updatedItems.some(i => i.receivedQuantity > 0)

    const newOrderStatus = allItemsReceived ? 'COMPLETED' : 
                          someItemsReceived ? 'PARTIALLY_RECEIVED' : 'CONFIRMED'

    // Atualizar pedido
    updatePurchaseOrder(orderId, { 
      items: updatedItems, 
      status: newOrderStatus,
      actualDeliveryDate: allItemsReceived ? new Date().toISOString() : undefined
    })

    // Atualizar estoque do produto
    const product = products.find(p => p.id === item.productId)
    if (product) {
      updateProduct(item.productId, { 
        quantity: product.quantity + receivedQuantity 
      })
    }

    // Verificar se resolve algum alerta de estoque
    setStockAlerts(prev => prev.map(alert => 
      alert.productId === item.productId && product && 
      (product.quantity + receivedQuantity) > product.minStock
        ? { ...alert, status: 'RESOLVED', resolvedAt: new Date().toISOString() }
        : alert
    ))
  }, [purchaseOrders, products, updatePurchaseOrder, updateProduct, setStockAlerts])

  // Quotes
  const createQuote = useCallback((quoteData: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newQuote: Quote = {
      ...quoteData,
      id: Math.max(...quotes.map(q => q.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setQuotes(prev => [...prev, newQuote])
  }, [quotes, setQuotes])

  const updateQuote = useCallback((id: number, quoteData: Partial<Quote>) => {
    setQuotes(prev => prev.map(quote =>
      quote.id === id
        ? { ...quote, ...quoteData, updatedAt: new Date().toISOString() }
        : quote
    ))
  }, [setQuotes])

  const acceptQuote = useCallback((id: number): PurchaseOrder => {
    const quote = quotes.find(q => q.id === id)
    if (!quote) {
      throw new Error(`Cotação com ID ${id} não encontrada`)
    }

    // Converter cotação em pedido de compra
    const orderItems: PurchaseOrderItem[] = quote.items.map((item, index) => ({
      id: index + 1,
      productId: item.productId,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      receivedQuantity: 0,
      status: 'PENDING',
      notes: item.notes
    }))

    const orderData: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'> = {
      supplierId: quote.supplierId,
      status: 'DRAFT',
      priority: 'MEDIUM',
      items: orderItems,
      subtotal: quote.items.reduce((sum, item) => sum + item.totalPrice, 0),
      shippingCost: 0,
      taxes: 0,
      total: quote.items.reduce((sum, item) => sum + item.totalPrice, 0),
      requestedDeliveryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      notes: `Criado a partir da cotação ${quote.quoteNumber}`,
      createdBy: 'Sistema'
    }

    createPurchaseOrder(orderData)

    // Atualizar status da cotação
    updateQuote(id, { status: 'ACCEPTED' })

    // Retornar o pedido criado
    return purchaseOrders[purchaseOrders.length - 1] || orderData as PurchaseOrder
  }, [quotes, createPurchaseOrder, updateQuote, purchaseOrders])

  // Analytics
  const getSupplierPerformance = useCallback((supplierId: number): SupplierPerformance => {
    const supplierOrders = purchaseOrders.filter(po => po.supplierId === supplierId)
    const completedOrders = supplierOrders.filter(po => po.status === 'COMPLETED')
    
    const onTimeDeliveries = completedOrders.filter(po => 
      po.actualDeliveryDate && po.expectedDeliveryDate &&
      new Date(po.actualDeliveryDate) <= new Date(po.expectedDeliveryDate)
    ).length

    const totalValue = completedOrders.reduce((sum, po) => sum + po.total, 0)
    
    const supplier = getSupplierById(supplierId)
    const averageLeadTime = completedOrders.length > 0 
      ? completedOrders.reduce((sum, po) => {
          if (po.actualDeliveryDate) {
            const orderDate = new Date(po.createdAt)
            const deliveryDate = new Date(po.actualDeliveryDate)
            return sum + (deliveryDate.getTime() - orderDate.getTime()) / (1000 * 60 * 60 * 24)
          }
          return sum
        }, 0) / completedOrders.length
      : 0

    return {
      supplierId,
      totalOrders: supplierOrders.length,
      onTimeDeliveries,
      onTimePercentage: completedOrders.length > 0 ? (onTimeDeliveries / completedOrders.length) * 100 : 0,
      averageLeadTime,
      averageRating: supplier?.rating || 0,
      totalValue,
      lastOrderDate: supplierOrders.length > 0 
        ? supplierOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0].createdAt
        : ''
    }
  }, [purchaseOrders, getSupplierById])

  const getPriceHistory = useCallback((productId: number) => {
    return priceHistory
      .filter(ph => ph.productId === productId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  }, [priceHistory])

  const getStockAlerts = useCallback(() => {
    // Gerar alertas automáticos para produtos com estoque baixo
    const newAlerts: StockAlert[] = []
    
    products.forEach(product => {
      if (product.quantity <= product.minStock) {
        const existingAlert = stockAlerts.find(alert => 
          alert.productId === product.id && alert.status === 'ACTIVE'
        )
        
        if (!existingAlert) {
          const alertType = product.quantity === 0 ? 'OUT_OF_STOCK' : 'LOW_STOCK'
          const suggestedOrderQuantity = Math.max(product.minStock * 2, 10)
          
          // Encontrar fornecedor preferido (último fornecedor usado ou o com melhor rating)
          const productHistory = priceHistory.filter(ph => ph.productId === product.id)
          const preferredSupplierId = productHistory.length > 0
            ? productHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].supplierId
            : undefined

          newAlerts.push({
            id: Math.max(...stockAlerts.map(sa => sa.id), 0) + newAlerts.length + 1,
            productId: product.id,
            alertType,
            currentStock: product.quantity,
            minStock: product.minStock,
            suggestedOrderQuantity,
            preferredSupplierId,
            status: 'ACTIVE',
            createdAt: new Date().toISOString()
          })
        }
      }
    })

    if (newAlerts.length > 0) {
      setStockAlerts(prev => [...prev, ...newAlerts])
    }

    return [...stockAlerts, ...newAlerts].filter(alert => alert.status === 'ACTIVE')
  }, [products, stockAlerts, priceHistory, setStockAlerts])

  const generatePurchaseSuggestions = useCallback((): PurchaseSuggestion[] => {
    return products
      .filter(product => product.quantity <= product.minStock)
      .map(product => {
        const suggestedQuantity = Math.max(product.minStock * 2 - product.quantity, 10)
        
        // Encontrar fornecedor preferido
        const productHistory = priceHistory.filter(ph => ph.productId === product.id)
        const recentPrice = productHistory.length > 0
          ? productHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
          : null

        const preferredSupplier = recentPrice 
          ? suppliers.find(s => s.id === recentPrice.supplierId)
          : suppliers.find(s => s.status === 'ACTIVE')

        const estimatedCost = recentPrice 
          ? recentPrice.price * suggestedQuantity
          : 0

        const urgency = product.quantity === 0 ? 'CRITICAL' :
                      product.quantity < product.minStock * 0.5 ? 'HIGH' :
                      product.quantity < product.minStock * 0.8 ? 'MEDIUM' : 'LOW'

        return {
          productId: product.id,
          currentStock: product.quantity,
          minStock: product.minStock,
          suggestedQuantity,
          preferredSupplier: preferredSupplier!,
          estimatedCost,
          urgency
        }
      })
      .filter(suggestion => suggestion.preferredSupplier)
      .sort((a, b) => {
        const urgencyOrder = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 }
        return urgencyOrder[b.urgency] - urgencyOrder[a.urgency]
      })
  }, [products, priceHistory, suppliers])

  // Utilities
  const exportSupplierData = useCallback((): string => {
    const exportData = {
      suppliers,
      purchaseOrders,
      quotes,
      priceHistory,
      stockAlerts,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    return JSON.stringify(exportData, null, 2)
  }, [suppliers, purchaseOrders, quotes, priceHistory, stockAlerts])

  const importSupplierData = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(data)
      
      if (parsed.suppliers && Array.isArray(parsed.suppliers)) {
        setSuppliers(parsed.suppliers)
      }
      if (parsed.purchaseOrders && Array.isArray(parsed.purchaseOrders)) {
        setPurchaseOrders(parsed.purchaseOrders)
      }
      if (parsed.quotes && Array.isArray(parsed.quotes)) {
        setQuotes(parsed.quotes)
      }
      if (parsed.priceHistory && Array.isArray(parsed.priceHistory)) {
        setPriceHistory(parsed.priceHistory)
      }
      if (parsed.stockAlerts && Array.isArray(parsed.stockAlerts)) {
        setStockAlerts(parsed.stockAlerts)
      }

      return true
    } catch (error) {
      console.error('Erro ao importar dados de fornecedores:', error)
      return false
    }
  }, [setSuppliers, setPurchaseOrders, setQuotes, setPriceHistory, setStockAlerts])

  const clearError = useCallback(() => {
    clearSuppliersError()
  }, [clearSuppliersError])

  const value: ExtendedSupplierContextType = useMemo(() => ({
    suppliers,
    purchaseOrders,
    quotes,
    priceHistory,
    stockAlerts,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    createPurchaseOrder,
    updatePurchaseOrder,
    cancelPurchaseOrder,
    receivePurchaseOrderItem,
    createQuote,
    updateQuote,
    acceptQuote,
    getSupplierPerformance,
    getPriceHistory,
    getStockAlerts,
    generatePurchaseSuggestions,
    exportSupplierData,
    importSupplierData,
    isLoading: !isLoadingSuppliers,
    error: suppliersError || ordersError || quotesError,
    clearError
  }), [
    suppliers,
    purchaseOrders,
    quotes,
    priceHistory,
    stockAlerts,
    addSupplier,
    updateSupplier,
    deleteSupplier,
    getSupplierById,
    createPurchaseOrder,
    updatePurchaseOrder,
    cancelPurchaseOrder,
    receivePurchaseOrderItem,
    createQuote,
    updateQuote,
    acceptQuote,
    getSupplierPerformance,
    getPriceHistory,
    getStockAlerts,
    generatePurchaseSuggestions,
    exportSupplierData,
    importSupplierData,
    isLoadingSuppliers,
    suppliersError,
    ordersError,
    quotesError,
    clearError
  ])

  return (
    <SupplierContext.Provider value={value}>
      {children}
    </SupplierContext.Provider>
  )
}

export function useSuppliers() {
  const context = useContext(SupplierContext)
  if (context === undefined) {
    throw new Error('useSuppliers deve ser usado dentro de um SupplierProvider')
  }
  return context
}