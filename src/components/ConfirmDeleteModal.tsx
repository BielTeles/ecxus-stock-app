'use client'

import { AlertTriangle, Trash2, X } from 'lucide-react'
import { Product } from '@/contexts/ProductContext'

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  product: Product | null
}

export default function ConfirmDeleteModal({ isOpen, onClose, onConfirm, product }: ConfirmDeleteModalProps) {
  if (!isOpen || !product) return null

  const handleConfirm = () => {
    onConfirm()
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
            Confirmar Exclusão
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
              <div>
                <h3 className="text-sm font-medium text-red-800 mb-1">
                  ⚠️ Atenção: Esta ação não pode ser desfeita!
                </h3>
                <p className="text-sm text-red-700">
                  Você está prestes a excluir permanentemente este produto do sistema.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-medium text-gray-900">Produto a ser excluído:</h3>
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Nome:</span>
                  <p className="text-gray-900">{product.name}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Código:</span>
                  <p className="text-gray-900">{product.code}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Categoria:</span>
                  <p className="text-gray-900">{product.category}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Localização:</span>
                  <p className="text-gray-900">{product.location}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Quantidade:</span>
                  <p className="text-gray-900">{product.quantity} unidades</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Valor Total:</span>
                  <p className="text-gray-900">R$ {(product.quantity * product.price).toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t">
            <p className="text-sm text-gray-600 mb-4">
              💡 <strong>Dica:</strong> Se você não tem certeza, pode editar o produto em vez de excluí-lo, 
              ou fazer um backup antes de continuar.
            </p>
            
            <div className="flex items-center justify-end space-x-4">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center space-x-2"
              >
                <Trash2 className="h-4 w-4" />
                <span>Sim, Excluir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 