'use client'

import { useState } from 'react'
import { X, Calendar, Clock, User, MapPin, AlertCircle, CheckCircle } from 'lucide-react'
import { useProductionOrders } from '@/contexts/ProductionOrderContext'
import { useProduction } from '@/contexts/ProductionContext'
import { useProducts } from '@/contexts/ProductContext'
import { 
  ORDER_PRIORITY, 
  ORDER_PRIORITY_LABELS, 
  WORK_STATIONS, 
  OPERATORS 
} from '@/constants/production'

interface NewProductionOrderModalProps {
  isOpen: boolean
  onClose: () => void
  preSelectedProductId?: number
}

export default function NewProductionOrderModal({ 
  isOpen, 
  onClose, 
  preSelectedProductId 
}: NewProductionOrderModalProps) {
  const { createProductionOrder, calculateOrderDuration } = useProductionOrders()
  const { finishedProducts, analyzeProduction } = useProduction()
  const { products } = useProducts()

  const [formData, setFormData] = useState({
    finishedProductId: preSelectedProductId || 0,
    quantity: 1,
    priority: 'MEDIUM' as keyof typeof ORDER_PRIORITY,
    plannedStartDate: new Date().toISOString().slice(0, 16),
    notes: '',
    assignedOperator: '',
    station: ''
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [validationError, setValidationError] = useState('')

  const selectedProduct = finishedProducts.find(p => p.id === formData.finishedProductId)
  const productAnalysis = selectedProduct ? analyzeProduction(selectedProduct.id) : null

  // Calculate estimated duration when product or quantity changes
  const estimatedDuration = formData.finishedProductId 
    ? calculateOrderDuration(formData.finishedProductId, formData.quantity)
    : 0

  // Check component availability
  const canProduce = selectedProduct 
    ? Math.floor((productAnalysis?.maxProducible || 0) / formData.quantity) >= 1
    : false

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setValidationError('')

    if (!formData.finishedProductId || formData.quantity <= 0) {
      setValidationError('Selecione um produto e quantidade válida')
      return
    }

    if (!canProduce) {
      setValidationError('Não há componentes suficientes para esta quantidade')
      return
    }

    setIsSubmitting(true)

    try {
      const startDate = new Date(formData.plannedStartDate)
      const endDate = new Date(startDate.getTime() + estimatedDuration * 60 * 1000)

      await createProductionOrder({
        finishedProductId: formData.finishedProductId,
        quantity: formData.quantity,
        priority: formData.priority,
        plannedStartDate: startDate,
        plannedEndDate: endDate,
        estimatedDuration,
        notes: formData.notes,
        assignedOperator: formData.assignedOperator || undefined,
        station: formData.station || undefined,
        status: 'PLANNED'
      })

      onClose()
      
      // Reset form
      setFormData({
        finishedProductId: 0,
        quantity: 1,
        priority: 'MEDIUM',
        plannedStartDate: new Date().toISOString().slice(0, 16),
        notes: '',
        assignedOperator: '',
        station: ''
      })
    } catch (error) {
      setValidationError(error instanceof Error ? error.message : 'Erro ao criar ordem de produção')
    } finally {
      setIsSubmitting(false)
    }
  }

  const getComponentById = (id: number) => products.find(p => p.id === id)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">
            Nova Ordem de Produção
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Product Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Produto Acabado *
            </label>
            <select
              value={formData.finishedProductId}
              onChange={(e) => setFormData(prev => ({ ...prev, finishedProductId: Number(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value={0}>Selecione um produto acabado</option>
              {finishedProducts.map(product => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.code}) - {product.bom.length} componentes
                </option>
              ))}
            </select>
          </div>

          {/* Product Info & Analysis */}
          {selectedProduct && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-3">Informações do Produto</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Categoria:</span>
                  <p className="font-medium">{selectedProduct.category}</p>
                </div>
                <div>
                  <span className="text-gray-600">Tempo estimado/un:</span>
                  <p className="font-medium">{selectedProduct.estimatedTime} min</p>
                </div>
                <div>
                  <span className="text-gray-600">Pode produzir:</span>
                  <p className={`font-medium ${canProduce ? 'text-green-600' : 'text-red-600'}`}>
                    {productAnalysis?.maxProducible || 0} unidades
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Quantity & Priority */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quantidade *
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {Object.entries(ORDER_PRIORITY_LABELS).map(([key, label]) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Timing */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Data/Hora de Início
              </label>
              <input
                type="datetime-local"
                value={formData.plannedStartDate}
                onChange={(e) => setFormData(prev => ({ ...prev, plannedStartDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Clock className="h-4 w-4 inline mr-1" />
                Duração Estimada
              </label>
              <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                {estimatedDuration} minutos ({Math.ceil(estimatedDuration / 60)} horas)
              </div>
            </div>
          </div>

          {/* Assignment */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <User className="h-4 w-4 inline mr-1" />
                Operador Responsável
              </label>
              <select
                value={formData.assignedOperator}
                onChange={(e) => setFormData(prev => ({ ...prev, assignedOperator: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecionar depois</option>
                {OPERATORS.map(operator => (
                  <option key={operator} value={operator}>{operator}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MapPin className="h-4 w-4 inline mr-1" />
                Estação de Trabalho
              </label>
              <select
                value={formData.station}
                onChange={(e) => setFormData(prev => ({ ...prev, station: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Selecionar depois</option>
                {WORK_STATIONS.map(station => (
                  <option key={station} value={station}>{station}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Instruções especiais, observações..."
            />
          </div>

          {/* Availability Check */}
          {selectedProduct && formData.quantity > 0 && (
            <div className={`p-4 rounded-lg border ${
              canProduce 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-center space-x-2 mb-2">
                {canProduce ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className={`font-medium ${
                  canProduce ? 'text-green-800' : 'text-red-800'
                }`}>
                  {canProduce ? 'Componentes Disponíveis' : 'Componentes Insuficientes'}
                </span>
              </div>

              {!canProduce && productAnalysis?.missingComponents && (
                <div className="text-sm text-red-700">
                  <p className="mb-2">Componentes em falta:</p>
                  <ul className="space-y-1">
                    {productAnalysis.missingComponents.slice(0, 3).map(missing => {
                      const component = getComponentById(missing.componentId)
                      return (
                        <li key={missing.componentId}>
                          • {component?.name}: necessário {missing.needed * formData.quantity}, disponível {missing.available}
                        </li>
                      )
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Error Message */}
          {validationError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{validationError}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !canProduce || formData.finishedProductId === 0}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
            >
              {isSubmitting ? 'Criando...' : 'Criar Ordem de Produção'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 