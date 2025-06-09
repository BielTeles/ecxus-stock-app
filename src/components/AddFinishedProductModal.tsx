'use client'

import { useState } from 'react'
import { X, Factory, Hash, DollarSign, Clock, FileText, AlertCircle } from 'lucide-react'
import { useProduction } from '@/contexts/ProductionContext'
import { PROCESS_TYPES, PRODUCTION_STATUS, PROCESS_LABELS, STATUS_LABELS } from '@/constants/production'
import { FinishedProductFormData } from '@/types/production'

interface AddFinishedProductModalProps {
  isOpen: boolean
  onClose: () => void
}

interface FormErrors {
  [key: string]: string
}

export default function AddFinishedProductModal({ isOpen, onClose }: AddFinishedProductModalProps) {
  const { addFinishedProduct } = useProduction()
  const [formData, setFormData] = useState<Partial<FinishedProductFormData>>({
    name: '',
    code: '',
    description: '',
    category: 'SMD',
    estimatedProductionTime: 60,
    sellPrice: 0,
    status: 'ACTIVE'
  })
  
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})
    
    try {
      // Validação básica
      const newErrors: FormErrors = {}
      
      if (!formData.name?.trim()) {
        newErrors.name = 'Nome é obrigatório'
      }
      
      if (!formData.code?.trim()) {
        newErrors.code = 'Código é obrigatório'
      }
      
      if (!formData.category) {
        newErrors.category = 'Tipo de processo é obrigatório'
      }
      
      if (!formData.sellPrice || formData.sellPrice <= 0) {
        newErrors.sellPrice = 'Preço deve ser maior que zero'
      }
      
      if (!formData.estimatedProductionTime || formData.estimatedProductionTime <= 0) {
        newErrors.estimatedProductionTime = 'Tempo de produção deve ser maior que zero'
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      await addFinishedProduct(formData as FinishedProductFormData)
      
      // Reset form e fecha modal
      setFormData({
        name: '',
        code: '',
        description: '',
        category: 'SMD',
        estimatedProductionTime: 60,
        sellPrice: 0,
        status: 'ACTIVE'
      })
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message })
      } else {
        setErrors({ general: 'Erro inesperado ao adicionar produto acabado' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    // Limpar erro específico do campo quando o usuário começar a digitar
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }))
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Factory className="h-6 w-6 text-blue-600 mr-2" />
            Adicionar Produto Acabado (PA)
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Basic Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Factory className="h-4 w-4 inline mr-1" />
                  Nome do Produto Acabado *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name || ''}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Placa Controladora LED"
                />
                {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="h-4 w-4 inline mr-1" />
                  Código do PA *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code || ''}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.code ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: PA001"
                />
                {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code}</p>}
              </div>
            </div>
          </div>

          {/* Process and Status */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Processo e Status</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Processo *
                </label>
                <select
                  name="category"
                  value={formData.category || ''}
                  onChange={handleChange}
                  required
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.category ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  {PROCESS_TYPES.map(type => (
                    <option key={type} value={type}>
                      {PROCESS_LABELS[type]}
                    </option>
                  ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status || ''}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {PRODUCTION_STATUS.map(status => (
                    <option key={status} value={status}>
                      {STATUS_LABELS[status]}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Production Details */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes de Produção</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Tempo Estimado (minutos) *
                </label>
                <input
                  type="number"
                  name="estimatedProductionTime"
                  value={formData.estimatedProductionTime || ''}
                  onChange={handleChange}
                  required
                  min="1"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.estimatedProductionTime ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="60"
                />
                {errors.estimatedProductionTime && (
                  <p className="text-red-500 text-sm mt-1">{errors.estimatedProductionTime}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  name="sellPrice"
                  value={formData.sellPrice || ''}
                  onChange={handleChange}
                  required
                  min="0"
                  step="0.01"
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.sellPrice ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.00"
                />
                {errors.sellPrice && <p className="text-red-500 text-sm mt-1">{errors.sellPrice}</p>}
              </div>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <FileText className="h-4 w-4 inline mr-1" />
              Descrição
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Descrição detalhada do produto acabado..."
            />
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-2">
              <Factory className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium">Próximo passo:</p>
                <p>Após criar o produto acabado, você poderá adicionar os componentes da BOM (Bill of Materials) para definir quais itens do estoque são necessários para a produção.</p>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <Factory className="h-4 w-4" />
              <span>{isSubmitting ? 'Adicionando...' : 'Adicionar PA'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 