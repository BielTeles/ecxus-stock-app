export interface Supplier {
  id: number
  name: string
  code: string
  email: string
  phone: string
  website?: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
  contact: {
    name: string
    email: string
    phone: string
    department?: string
  }
  commercialTerms: {
    paymentTerms: string // Ex: "30 dias", "À vista", "30/60 dias"
    minOrderValue: number
    shippingCost: number
    leadTimeDays: number
    currency: string
  }
  rating: number // 1-5 estrelas
  status: 'ACTIVE' | 'INACTIVE' | 'BLOCKED'
  notes?: string
  createdAt: string
  updatedAt: string
}

export type SupplierFormData = Omit<Supplier, 'id' | 'createdAt' | 'updatedAt'>

export interface PurchaseOrder {
  id: number
  orderNumber: string
  supplierId: number
  status: 'DRAFT' | 'SENT' | 'CONFIRMED' | 'PARTIALLY_RECEIVED' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  items: PurchaseOrderItem[]
  subtotal: number
  shippingCost: number
  taxes: number
  total: number
  requestedDeliveryDate: string
  expectedDeliveryDate?: string
  actualDeliveryDate?: string
  notes?: string
  createdBy: string
  approvedBy?: string
  createdAt: string
  updatedAt: string
}

export interface PurchaseOrderItem {
  id: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  receivedQuantity: number
  status: 'PENDING' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED'
  notes?: string
}

export interface Quote {
  id: number
  supplierId: number
  quoteNumber: string
  status: 'PENDING' | 'RECEIVED' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED'
  items: QuoteItem[]
  validUntil: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface QuoteItem {
  id: number
  productId: number
  quantity: number
  unitPrice: number
  totalPrice: number
  leadTimeDays: number
  minOrderQuantity?: number
  notes?: string
}

export interface PriceHistory {
  id: number
  productId: number
  supplierId: number
  price: number
  quantity: number
  date: string
  source: 'QUOTE' | 'PURCHASE_ORDER' | 'MANUAL'
}

export interface StockAlert {
  id: number
  productId: number
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'REORDER_POINT'
  currentStock: number
  minStock: number
  suggestedOrderQuantity: number
  preferredSupplierId?: number
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED'
  createdAt: string
  resolvedAt?: string
}

export interface SupplierContextType {
  suppliers: Supplier[]
  purchaseOrders: PurchaseOrder[]
  quotes: Quote[]
  priceHistory: PriceHistory[]
  stockAlerts: StockAlert[]
  
  // Supplier management
  addSupplier: (supplier: SupplierFormData) => void
  updateSupplier: (id: number, supplier: Partial<Supplier>) => void
  deleteSupplier: (id: number) => void
  getSupplierById: (id: number) => Supplier | undefined
  
  // Purchase Orders
  createPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => void
  updatePurchaseOrder: (id: number, order: Partial<PurchaseOrder>) => void
  cancelPurchaseOrder: (id: number) => void
  receivePurchaseOrderItem: (orderId: number, itemId: number, receivedQuantity: number) => void
  
  // Quotes
  createQuote: (quote: Omit<Quote, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateQuote: (id: number, quote: Partial<Quote>) => void
  acceptQuote: (id: number) => PurchaseOrder
  
  // Analytics
  getSupplierPerformance: (supplierId: number) => SupplierPerformance
  getPriceHistory: (productId: number) => PriceHistory[]
  getStockAlerts: () => StockAlert[]
  generatePurchaseSuggestions: () => PurchaseSuggestion[]
  
  // Utilities
  exportSupplierData: () => string
  importSupplierData: (data: string) => boolean
}

export interface SupplierPerformance {
  supplierId: number
  totalOrders: number
  onTimeDeliveries: number
  onTimePercentage: number
  averageLeadTime: number
  averageRating: number
  totalValue: number
  lastOrderDate: string
}

export interface PurchaseSuggestion {
  productId: number
  currentStock: number
  minStock: number
  suggestedQuantity: number
  preferredSupplier: Supplier
  estimatedCost: number
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
} 