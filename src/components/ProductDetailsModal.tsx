'use client'

import { X, Package, MapPin, DollarSign, Hash, Building, FileText, Calendar, TrendingUp, AlertTriangle } from 'lucide-react'
import { Product } from '@/contexts/ProductContext'
import { useCurrency } from '@/hooks/useCurrency'

interface ProductDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  product: Product | null
}

export default function ProductDetailsModal({ isOpen, onClose, product }: ProductDetailsModalProps) {
  const { formatCurrency } = useCurrency()
  
  if (!isOpen || !product) return null

  const stockStatus = (() => {
    if (product.quantity <= product.minStock) return { 
      status: 'Crítico', 
      color: 'text-red-600 bg-red-100 border-red-200',
      icon: AlertTriangle 
    }
    if (product.quantity <= product.minStock * 1.5) return { 
      status: 'Baixo', 
      color: 'text-orange-600 bg-orange-100 border-orange-200',
      icon: TrendingUp 
    }
    return { 
      status: 'Adequado', 
      color: 'text-green-600 bg-green-100 border-green-200',
      icon: TrendingUp 
    }
  })()

  const totalValue = product.quantity * product.price

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Package className="h-6 w-6 text-blue-600 mr-2" />
            Detalhes do Produto
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Header do Produto */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{product.name}</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Hash className="h-4 w-4 mr-1" />
                    {product.code}
                  </span>
                  <span className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    ID: {product.id}
                  </span>
                </div>
              </div>
              <div className={`flex items-center px-3 py-2 rounded-lg border ${stockStatus.color}`}>
                <stockStatus.icon className="h-4 w-4 mr-2" />
                <span className="font-medium text-sm">{stockStatus.status}</span>
              </div>
            </div>
          </div>

          {/* Informações Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Categorização */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="h-5 w-5 mr-2 text-indigo-600" />
                Categorização
              </h4>
              <div className="space-y-3">
                <div>
                  <span className="text-sm font-medium text-gray-600">Categoria:</span>
                  <p className="text-gray-900">{product.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600 flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    Localização:
                  </span>
                  <p className="text-gray-900 font-mono">{product.location}</p>
                </div>
              </div>
            </div>

            {/* Informações de Estoque */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                Estoque
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Quantidade atual:</span>
                  <span className="font-bold text-lg text-gray-900">{product.quantity} un.</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium text-gray-600">Estoque mínimo:</span>
                  <span className="font-medium text-gray-900">{product.minStock} un.</span>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Nível do estoque</span>
                    <span>{((product.quantity / (product.minStock * 2)) * 100).toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        stockStatus.status === 'Crítico' ? 'bg-red-500' :
                        stockStatus.status === 'Baixo' ? 'bg-orange-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(((product.quantity / (product.minStock * 2)) * 100), 100)}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informações Financeiras */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <DollarSign className="h-5 w-5 mr-2 text-green-600" />
              Informações Financeiras
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <p className="text-sm text-gray-600">Preço Unitário</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(product.price)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Valor Total em Estoque</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(totalValue)}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Valor Estoque Mínimo</p>
                <p className="text-lg font-semibold text-gray-700">{formatCurrency(product.minStock * product.price)}</p>
              </div>
            </div>
          </div>

          {/* Fornecedor */}
          {product.supplier && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <Building className="h-5 w-5 mr-2 text-blue-600" />
                Fornecedor
              </h4>
              <p className="text-gray-900">{product.supplier}</p>
            </div>
          )}

          {/* Descrição */}
          {product.description && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-gray-600" />
                Descrição
              </h4>
              <p className="text-gray-700 leading-relaxed">{product.description}</p>
            </div>
          )}

          {/* Informações do Sistema */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-3 flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-600" />
              Informações do Sistema
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Criado em:</span>
                <p className="text-gray-900">{new Date(product.createdAt).toLocaleString('pt-BR')}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Última atualização:</span>
                <p className="text-gray-900">{new Date(product.updatedAt).toLocaleString('pt-BR')}</p>
              </div>
            </div>
          </div>

          {/* Alertas */}
          {product.quantity <= product.minStock && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div>
                  <h4 className="font-medium text-red-800 mb-1">⚠️ Alerta de estoque baixo!</h4>
                  <p className="text-sm text-red-700">
                    Este produto está com estoque abaixo do nível mínimo recomendado. 
                    Considere fazer uma nova encomenda ao fornecedor.
                  </p>
                  <div className="mt-2 text-sm">
                    <span className="font-medium text-red-800">Sugestão de pedido:</span>
                    <span className="text-red-700 ml-1">
                      {Math.max(product.minStock * 2 - product.quantity, 0)} unidades
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ações */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
            >
              Fechar
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 