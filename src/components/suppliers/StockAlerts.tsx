'use client'

import { useEffect } from 'react'
import { AlertTriangle, Package, ShoppingCart, Clock, Check } from 'lucide-react'
import { useSuppliers } from '@/contexts/SupplierContext'
import { useProducts } from '@/contexts/ProductContext'

export default function StockAlerts() {
  const { stockAlerts, getStockAlerts, generatePurchaseSuggestions, getSupplierById } = useSuppliers()
  const { products, getProductById } = useProducts()

  // Gerar alertas automaticamente ao carregar
  useEffect(() => {
    getStockAlerts()
  }, [getStockAlerts])

  const activeAlerts = stockAlerts.filter(alert => alert.status === 'ACTIVE')
  const purchaseSuggestions = generatePurchaseSuggestions()

  const getAlertTypeColor = (alertType: string) => {
    switch (alertType) {
      case 'OUT_OF_STOCK':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'LOW_STOCK':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'REORDER_POINT':
        return 'bg-orange-100 text-orange-800 border-orange-200'
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getAlertTypeLabel = (alertType: string) => {
    switch (alertType) {
      case 'OUT_OF_STOCK':
        return 'Sem Estoque'
      case 'LOW_STOCK':
        return 'Estoque Baixo'
      case 'REORDER_POINT':
        return 'Ponto de Reposição'
      default:
        return alertType
    }
  }

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL':
        return 'bg-red-500'
      case 'HIGH':
        return 'bg-orange-500'
      case 'MEDIUM':
        return 'bg-yellow-500'
      case 'LOW':
        return 'bg-green-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Alertas de Estoque</h2>
          <p className="text-sm text-gray-600">
            {activeAlerts.length} alerta(s) ativo(s) • {purchaseSuggestions.length} sugestão(ões) de compra
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Alertas Ativos</p>
              <p className="text-2xl font-bold text-red-600">{activeAlerts.length}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Produtos sem Estoque</p>
              <p className="text-2xl font-bold text-red-600">
                {activeAlerts.filter(alert => alert.alertType === 'OUT_OF_STOCK').length}
              </p>
            </div>
            <Package className="h-8 w-8 text-red-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Sugestões de Compra</p>
              <p className="text-2xl font-bold text-blue-600">{purchaseSuggestions.length}</p>
            </div>
            <ShoppingCart className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Estimado</p>
              <p className="text-2xl font-bold text-green-600">
                R$ {purchaseSuggestions.reduce((sum, s) => sum + s.estimatedCost, 0).toFixed(2)}
              </p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Active Alerts */}
      {activeAlerts.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Alertas Ativos</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {activeAlerts.map((alert) => {
              const product = getProductById(alert.productId)
              const supplier = alert.preferredSupplierId ? getSupplierById(alert.preferredSupplierId) : null
              
              return (
                <div key={alert.id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        <h4 className="font-medium text-gray-900">{product?.name || 'Produto não encontrado'}</h4>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getAlertTypeColor(alert.alertType)}`}>
                          {getAlertTypeLabel(alert.alertType)}
                        </span>
                      </div>
                      
                      <div className="text-sm text-gray-600 space-y-1">
                        <p><strong>Código:</strong> {product?.code}</p>
                        <p><strong>Estoque Atual:</strong> {alert.currentStock} unidades</p>
                        <p><strong>Estoque Mínimo:</strong> {alert.minStock} unidades</p>
                        <p><strong>Sugestão de Compra:</strong> {alert.suggestedOrderQuantity} unidades</p>
                        {supplier && (
                          <p><strong>Fornecedor Sugerido:</strong> {supplier.name}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
                        Criar Pedido
                      </button>
                      <button className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors">
                        Reconhecer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Purchase Suggestions */}
      {purchaseSuggestions.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900">Sugestões de Compra</h3>
            <p className="text-sm text-gray-600">Baseado no histórico de preços e fornecedores</p>
          </div>
          <div className="divide-y divide-gray-200">
            {purchaseSuggestions.map((suggestion) => {
              const product = getProductById(suggestion.productId)
              
              return (
                <div key={suggestion.productId} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <div className={`w-3 h-3 rounded-full ${getUrgencyColor(suggestion.urgency)}`}></div>
                        <h4 className="font-medium text-gray-900">{product?.name || 'Produto não encontrado'}</h4>
                        <span className="text-sm text-gray-500">{suggestion.urgency}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                        <div>
                          <p className="font-medium">Estoque</p>
                          <p>{suggestion.currentStock}/{suggestion.minStock}</p>
                        </div>
                        <div>
                          <p className="font-medium">Sugerido</p>
                          <p>{suggestion.suggestedQuantity} un.</p>
                        </div>
                        <div>
                          <p className="font-medium">Fornecedor</p>
                          <p>{suggestion.preferredSupplier.name}</p>
                        </div>
                        <div>
                          <p className="font-medium">Custo Estimado</p>
                          <p>R$ {suggestion.estimatedCost.toFixed(2)}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <button className="px-3 py-1 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors">
                        Aceitar Sugestão
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Empty State */}
      {activeAlerts.length === 0 && purchaseSuggestions.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Check className="h-12 w-12 text-green-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Tudo em ordem!</h3>
          <p className="text-gray-600">
            Não há alertas de estoque no momento. Todos os produtos estão com níveis adequados.
          </p>
        </div>
      )}
    </div>
  )
} 