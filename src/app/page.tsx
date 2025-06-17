'use client'

import { useState } from 'react'
import dynamic from 'next/dynamic'
import { Plus, Search, Package, AlertTriangle, BarChart3, Settings, Factory, ClipboardList, Play, CheckCircle, Users, FileText } from 'lucide-react'
import NoSSR from '@/components/NoSSR'
import DashboardSkeleton from '@/components/DashboardSkeleton'
import ProductListSkeleton from '@/components/ProductListSkeleton'
import { useProductionOrders } from '@/contexts/ProductionOrderContext'
import { useProduction } from '@/contexts/ProductionContext'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_PRIORITY_COLORS } from '@/constants/production'

// Lazy Loading dos componentes pesados
const ProductList = dynamic(() => import('@/components/ProductList'), {
  loading: () => <ProductListSkeleton />
})

const Dashboard = dynamic(() => import('@/components/Dashboard'), {
  loading: () => <DashboardSkeleton />
})

const SettingsTab = dynamic(() => import('@/components/SettingsTab'), {
  loading: () => <DashboardSkeleton />
})

const AlertsTab = dynamic(() => import('@/components/AlertsTab'), {
  loading: () => <DashboardSkeleton />
})

const ProductionDashboard = dynamic(() => import('@/components/ProductionDashboard'), {
  loading: () => <DashboardSkeleton />
})

const SupplierManagement = dynamic(() => import('@/components/SupplierManagement'), {
  loading: () => <DashboardSkeleton />
})

const ReportsCenter = dynamic(() => import('@/components/ReportsCenter'), {
  loading: () => <DashboardSkeleton />
})

// Modais mais leves podem ser importados normalmente
import AddProductModal from '@/components/AddProductModal'
import AddFinishedProductModal from '@/components/AddFinishedProductModal'
import ProductionOrderModal from '@/components/ProductionOrderModal'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isAddFinishedProductModalOpen, setIsAddFinishedProductModalOpen] = useState(false)
  const [isCreateOrderModalOpen, setIsCreateOrderModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [orderFilter, setOrderFilter] = useState<'all' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'>('all')

  type OrderStatus = 'all' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'

  // Production Orders hooks
  const { 
    productionOrders, 
    getProductionMetrics,
    startProductionOrder,
    completeProductionOrder,
    cancelProductionOrder
  } = useProductionOrders()
  const { getFinishedProductById } = useProduction()

  const orderMetrics = getProductionMetrics()
  const filteredOrders = productionOrders.filter(order => 
    orderFilter === 'all' || order.status === orderFilter
  )

  const handleOrderStatusChange = async (orderId: number, newStatus: string) => {
    try {
      switch (newStatus) {
        case 'IN_PROGRESS':
          await startProductionOrder(orderId)
          break
        case 'COMPLETED':
          await completeProductionOrder(orderId)
          break
        case 'CANCELLED':
          await cancelProductionOrder(orderId)
          break
      }
    } catch (error) {
      console.error('Erro ao alterar status:', error)
      alert(error instanceof Error ? error.message : 'Erro desconhecido')
    }
  }

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'production', label: 'Produção', icon: Factory },
    { id: 'orders', label: 'Ordens', icon: ClipboardList },
    { id: 'suppliers', label: 'Fornecedores', icon: Users },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
    { id: 'reports', label: 'Relatórios', icon: FileText },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Ecxus Stock</h1>
                  <p className="text-sm text-gray-500">Gerenciamento de Componentes Eletrônicos</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Produto</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <Dashboard 
            onAddProduct={() => setIsAddModalOpen(true)}
            onSwitchToProducts={() => setActiveTab('products')}
          />
        )}
        {activeTab === 'products' && (
          <ProductList searchTerm={searchTerm} />
        )}
        {activeTab === 'production' && (
          <ProductionDashboard 
            onAddFinishedProduct={() => setIsAddFinishedProductModalOpen(true)}
          />
        )}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <ClipboardList className="h-8 w-8 text-purple-600" />
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Ordens de Produção</h1>
                  <p className="text-gray-600">Planejamento e controle de produção</p>
                </div>
              </div>
              <button 
                onClick={() => setIsCreateOrderModalOpen(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>Nova Ordem</span>
              </button>
            </div>

            {/* Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total de Ordens</p>
                    <p className="text-2xl font-bold text-gray-900">{orderMetrics.totalOrders}</p>
                  </div>
                  <ClipboardList className="h-8 w-8 text-purple-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Em Produção</p>
                    <p className="text-2xl font-bold text-yellow-600">{orderMetrics.activeOrders}</p>
                  </div>
                  <Play className="h-8 w-8 text-yellow-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Finalizadas Hoje</p>
                    <p className="text-2xl font-bold text-green-600">{orderMetrics.completedToday}</p>
                  </div>
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Eficiência</p>
                    <p className="text-2xl font-bold text-blue-600">{orderMetrics.efficiency.toFixed(0)}%</p>
                  </div>
                  <BarChart3 className="h-8 w-8 text-blue-600" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-gray-700">Filtrar:</span>
              {[
                { key: 'all', label: 'Todas' },
                { key: 'PLANNED', label: 'Planejadas' },
                { key: 'IN_PROGRESS', label: 'Em Produção' },
                { key: 'COMPLETED', label: 'Finalizadas' }
              ].map(filter => (
                <button
                  key={filter.key}
                  onClick={() => setOrderFilter(filter.key as OrderStatus)}
                  className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    orderFilter === filter.key
                      ? 'bg-purple-100 text-purple-800'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>

            {/* Orders List */}
            <div className="bg-white rounded-lg border border-gray-200">
              <div className="p-6 border-b">
                <h3 className="text-lg font-semibold text-gray-900">
                  Lista de Ordens ({filteredOrders.length})
                </h3>
              </div>

              {filteredOrders.length === 0 ? (
                <div className="text-center py-12">
                  <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">
                    {orderFilter === 'all' 
                      ? 'Nenhuma ordem de produção cadastrada'
                      : `Nenhuma ordem ${ORDER_STATUS_LABELS[orderFilter as keyof typeof ORDER_STATUS_LABELS]?.toLowerCase()}`
                    }
                  </p>
                  <p className="text-sm text-gray-400 mb-4">
                    As ordens de produção controlam o planejamento e execução da manufatura dos produtos acabados.
                  </p>
                  <button 
                    onClick={() => setIsCreateOrderModalOpen(true)}
                    className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
                  >
                    Criar Primeira Ordem
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-gray-200">
                  {filteredOrders.map(order => {
                    const finishedProduct = getFinishedProductById(order.finishedProductId)
                    
                    return (
                      <div key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <h4 className="font-medium text-gray-900">
                                OP #{order.id.toString().padStart(4, '0')}
                              </h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${ORDER_STATUS_COLORS[order.status]}`}>
                                {ORDER_STATUS_LABELS[order.status]}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${ORDER_PRIORITY_COLORS[order.priority]}`}>
                                {order.priority}
                              </span>
                            </div>

                            <div className="text-sm text-gray-600 space-y-1">
                              <p><strong>Produto:</strong> {finishedProduct?.name || 'Produto não encontrado'}</p>
                              <p><strong>Quantidade:</strong> {order.quantity} unidades</p>
                              <p><strong>Início planejado:</strong> {new Date(order.plannedStartDate).toLocaleString('pt-BR')}</p>
                              <p><strong>Duração estimada:</strong> {order.estimatedDuration} min ({Math.ceil(order.estimatedDuration / 60)}h)</p>
                              {order.assignedOperator && (
                                <p><strong>Operador:</strong> {order.assignedOperator}</p>
                              )}
                              {order.station && (
                                <p><strong>Estação:</strong> {order.station}</p>
                              )}
                            </div>

                            {order.notes && (
                              <p className="mt-2 text-sm text-gray-500 italic">{order.notes}</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-2">
                            {order.status === 'PLANNED' && (
                              <button
                                onClick={() => handleOrderStatusChange(order.id, 'IN_PROGRESS')}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Iniciar Produção"
                              >
                                <Play className="h-5 w-5" />
                              </button>
                            )}
                            
                            {order.status === 'IN_PROGRESS' && (
                              <button
                                onClick={() => handleOrderStatusChange(order.id, 'COMPLETED')}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Finalizar Produção"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        )}
        {activeTab === 'suppliers' && <SupplierManagement />}
        {activeTab === 'alerts' && <AlertsTab />}
        {activeTab === 'reports' && <ReportsCenter />}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {/* Add Finished Product Modal */}
      <AddFinishedProductModal
        isOpen={isAddFinishedProductModalOpen}
        onClose={() => setIsAddFinishedProductModalOpen(false)}
      />

      {/* Create Production Order Modal */}
      <ProductionOrderModal
        isOpen={isCreateOrderModalOpen}
        onClose={() => setIsCreateOrderModalOpen(false)}
      />
    </div>
  )
}
