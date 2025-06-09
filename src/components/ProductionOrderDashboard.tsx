'use client'

import { useState } from 'react'
import { ClipboardList, Play, Square, CheckCircle, Clock, Plus } from 'lucide-react'
import { useProductionOrders } from '@/contexts/ProductionOrderContext'
import { useProduction } from '@/contexts/ProductionContext'
import { ORDER_STATUS_LABELS, ORDER_STATUS_COLORS, ORDER_PRIORITY_COLORS } from '@/constants/production'

export default function ProductionOrderDashboard() {
  const { 
    productionOrders, 
    getProductionMetrics,
    startProductionOrder,
    completeProductionOrder,
    cancelProductionOrder
  } = useProductionOrders()
  const { getFinishedProductById } = useProduction()

  const [selectedFilter, setSelectedFilter] = useState<'all' | 'PLANNED' | 'IN_PROGRESS' | 'COMPLETED'>('all')

  const metrics = getProductionMetrics()

  const filteredOrders = productionOrders.filter(order => 
    selectedFilter === 'all' || order.status === selectedFilter
  )

  const handleStatusChange = async (orderId: number, newStatus: string) => {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <ClipboardList className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ordens de Produção</h1>
            <p className="text-gray-600">Planejamento e controle de produção</p>
          </div>
        </div>
        <button className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
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
              <p className="text-2xl font-bold text-gray-900">{metrics.totalOrders}</p>
            </div>
            <ClipboardList className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Produção</p>
              <p className="text-2xl font-bold text-yellow-600">{metrics.activeOrders}</p>
            </div>
            <Play className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Finalizadas Hoje</p>
              <p className="text-2xl font-bold text-green-600">{metrics.completedToday}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Eficiência</p>
              <p className="text-2xl font-bold text-blue-600">{metrics.efficiency.toFixed(0)}%</p>
            </div>
            <Clock className="h-8 w-8 text-blue-600" />
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
            onClick={() => setSelectedFilter(filter.key as any)}
            className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              selectedFilter === filter.key
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
            <p className="text-gray-500 mb-4">Nenhuma ordem de produção encontrada</p>
            <button className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors">
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
                        {order.assignedOperator && (
                          <p><strong>Operador:</strong> {order.assignedOperator}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      {order.status === 'PLANNED' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'IN_PROGRESS')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Iniciar"
                        >
                          <Play className="h-5 w-5" />
                        </button>
                      )}
                      
                      {order.status === 'IN_PROGRESS' && (
                        <button
                          onClick={() => handleStatusChange(order.id, 'COMPLETED')}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Finalizar"
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
  )
} 