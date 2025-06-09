// import { Product } from './product' // Commented out as it's not directly used in this file

export type ProcessType = 'SMD' | 'PTH' | 'MIXED'
export type ProductionStatus = 'ACTIVE' | 'INACTIVE' | 'DISCONTINUED'

export interface BOMItem {
  id: number
  componentId: number
  quantity: number
  process: 'SMD' | 'PTH'
  position?: string // Ex: R1, C5, U3
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface FinishedProduct {
  id: number
  name: string
  code: string
  description: string
  category: ProcessType
  estimatedProductionTime: number // em minutos
  sellPrice: number
  status: ProductionStatus
  bom: BOMItem[]
  createdAt: string
  updatedAt: string
}

export type FinishedProductFormData = Omit<FinishedProduct, 'id' | 'createdAt' | 'updatedAt' | 'bom'>

export interface ProductionAnalysis {
  finishedProductId: number
  maxProducible: number
  missingComponents: {
    componentId: number
    needed: number
    available: number
    missing: number
  }[]
  totalCost: number
  profitMargin: number
}

export interface ProductionContextType {
  finishedProducts: FinishedProduct[]
  addFinishedProduct: (product: FinishedProductFormData) => void
  updateFinishedProduct: (id: number, product: Partial<FinishedProduct>) => void
  deleteFinishedProduct: (id: number) => void
  getFinishedProductById: (id: number) => FinishedProduct | undefined
  addBOMItem: (finishedProductId: number, bomItem: Omit<BOMItem, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateBOMItem: (finishedProductId: number, bomItemId: number, bomItem: Partial<BOMItem>) => void
  removeBOMItem: (finishedProductId: number, bomItemId: number) => void
  analyzeProduction: (finishedProductId: number) => ProductionAnalysis | null
  exportProductionData: () => string
  importProductionData: (data: string) => boolean
  clearAllProductionData: () => void
}

export interface ProductionDashboardData {
  totalFinishedProducts: number
  activeProducts: number
  totalProductionValue: number
  mostUsedComponents: {
    componentId: number
    usageCount: number
  }[]
  productionCapacity: {
    finishedProductId: number
    maxProducible: number
  }[]
}

export interface ProductionOrder {
  id: number
  finishedProductId: number
  quantity: number
  status: 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  plannedStartDate: Date
  plannedEndDate: Date
  actualStartDate?: Date
  actualEndDate?: Date
  estimatedDuration: number // em minutos
  notes: string
  createdAt: Date
  updatedAt: Date
  assignedOperator?: string
  station?: string
}

export interface ProductionOrderItem {
  id: number
  orderId: number
  componentId: number
  requiredQuantity: number
  allocatedQuantity: number
  consumedQuantity: number
  status: 'PENDING' | 'ALLOCATED' | 'CONSUMED'
}

export interface ProductionSchedule {
  orderId: number
  startTime: Date
  endTime: Date
  station: string
  operator: string
  status: 'SCHEDULED' | 'ACTIVE' | 'COMPLETED'
}

export interface ProductionMetrics {
  totalOrders: number
  activeOrders: number
  completedToday: number
  pendingOrders: number
  averageCompletionTime: number
  efficiency: number
  onTimeDelivery: number
} 