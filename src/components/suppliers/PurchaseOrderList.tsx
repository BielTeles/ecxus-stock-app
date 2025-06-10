'use client'

import { useState } from 'react'
import { ShoppingCart, Plus, Eye, DollarSign, Clock, CheckCircle, X } from 'lucide-react'
import { useSuppliers } from '@/contexts/SupplierContext'
import { useProducts } from '@/contexts/ProductContextV3'
import { useCurrency } from '@/hooks/useCurrency'

interface PurchaseOrderListProps {
  searchTerm: string
}

interface PurchaseOrder {
  id: number
  poNumber: string
  supplierId: number
  status: 'DRAFT' | 'PENDING' | 'APPROVED' | 'SENT' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  createdDate: string
  requestedDeliveryDate: string
  items: Array<{
    id: number
    productId: number
    quantity: number
    unitPrice: number
    subtotal: number
  }>
  total: number
  createdBy: string
  notes?: string
}

const STATUS_COLORS = {
  DRAFT: 'bg-gray-100 text-gray-800',
  PENDING: 'bg-yellow-100 text-yellow-800',
  APPROVED: 'bg-blue-100 text-blue-800',
  SENT: 'bg-indigo-100 text-indigo-800',
  CONFIRMED: 'bg-purple-100 text-purple-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const STATUS_LABELS = {
  DRAFT: 'Rascunho',
  PENDING: 'Pendente',
  APPROVED: 'Aprovado',
  SENT: 'Enviado',
  CONFIRMED: 'Confirmado',
  COMPLETED: 'Concluído',
  CANCELLED: 'Cancelado'
}

export default function PurchaseOrderList({ searchTerm }: PurchaseOrderListProps) {
  const { suppliers } = useSuppliers()
  const { products } = useProducts()
  const { formatCurrency } = useCurrency()
  
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [purchaseOrders] = useState<PurchaseOrder[]>([
    {
      id: 1,
      poNumber: 'PO-2024-001',
      supplierId: 1,
      status: 'CONFIRMED',
      priority: 'MEDIUM',
      createdDate: '2024-01-15T10:00:00Z',
      requestedDeliveryDate: '2024-01-25T00:00:00Z',
      items: [
        { id: 1, productId: 1, quantity: 100, unitPrice: 0.25, subtotal: 25 },
        { id: 2, productId: 2, quantity: 50, unitPrice: 0.50, subtotal: 25 }
      ],
      total: 65,
      createdBy: 'João Silva',
      notes: 'Pedido urgente para reposição de estoque'
    },
    {
      id: 2,
      poNumber: 'PO-2024-002',
      supplierId: 2,
      status: 'PENDING',
      priority: 'HIGH',
      createdDate: '2024-01-18T09:15:00Z',
      requestedDeliveryDate: '2024-01-30T00:00:00Z',
      items: [
        { id: 3, productId: 3, quantity: 200, unitPrice: 1.25, subtotal: 250 }
      ],
      total: 277.5,
      createdBy: 'Ana Costa'
    }
  ])

  const filteredOrders = purchaseOrders.filter(po => {
    const supplier = suppliers.find(s => s.id === po.supplierId)
    const matchesSearch = searchTerm === '' || 
      po.poNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || po.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: purchaseOrders.length,
    pending: purchaseOrders.filter(po => ['DRAFT', 'PENDING'].includes(po.status)).length,
    active: purchaseOrders.filter(po => ['APPROVED', 'SENT', 'CONFIRMED'].includes(po.status)).length,
    totalValue: purchaseOrders.reduce((sum, po) => sum + po.total, 0)
  }

  const getSupplierName = (supplierId: number) => {
    return suppliers.find(s => s.id === supplierId)?.name || 'Fornecedor não encontrado'
  }

  const getProductName = (productId: number) => {
    return products.find(p => p.id === productId)?.name || 'Produto não encontrado'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Pedidos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ativos</p>
              <p className="text-2xl font-bold text-green-600">{stats.active}</p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-indigo-600">{formatCurrency(stats.totalValue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-indigo-600" />
          </div>
        </div>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                {Object.entries(STATUS_LABELS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            <span>Novo Pedido</span>
          </button>
        </div>
      </div>

      {/* Lista de Pedidos */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Pedidos de Compra ({filteredOrders.length})
          </h3>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum pedido encontrado</h3>
            <p className="text-gray-600">Crie seu primeiro pedido de compra para começar.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredOrders.map(po => (
              <div key={po.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg">{po.poNumber}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[po.status]}`}>
                        {STATUS_LABELS[po.status]}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Fornecedor:</span> {getSupplierName(po.supplierId)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Criado por:</span> {po.createdBy}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Data:</span> {formatDate(po.createdDate)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Entrega:</span> {formatDate(po.requestedDeliveryDate)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Itens:</span> {po.items.length}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          <span className="font-medium">Total:</span> {formatCurrency(po.total)}
                        </p>
                      </div>
                    </div>

                    {po.notes && (
                      <p className="text-sm text-gray-600 italic">"{po.notes}"</p>
                    )}
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedPO(po)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedPO && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedPO.poNumber}</h2>
                <p className="text-sm text-gray-500">Pedido de Compra - {getSupplierName(selectedPO.supplierId)}</p>
              </div>
              <button 
                onClick={() => setSelectedPO(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedPO.status]}`}>
                      {STATUS_LABELS[selectedPO.status]}
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-700">Criado por:</span> {selectedPO.createdBy}</p>
                    <p><span className="font-medium text-gray-700">Data:</span> {formatDate(selectedPO.createdDate)}</p>
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-700">Entrega:</span> {formatDate(selectedPO.requestedDeliveryDate)}</p>
                  <p><span className="font-medium text-gray-700">Total:</span> {formatCurrency(selectedPO.total)}</p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Itens do Pedido</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Produto</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Qtd</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Preço Unit.</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Subtotal</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {selectedPO.items.map(item => (
                        <tr key={item.id}>
                          <td className="px-4 py-3 text-sm text-gray-900">{getProductName(item.productId)}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{item.quantity}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(item.unitPrice)}</td>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900 text-right">{formatCurrency(item.subtotal)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {selectedPO.notes && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Observações:</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3 italic">
                    {selectedPO.notes}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 