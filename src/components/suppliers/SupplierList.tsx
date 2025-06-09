'use client'

import { useState } from 'react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  Phone, 
  Mail, 
  MapPin, 
  Star,
  ExternalLink,
  Building2,
  User,
  AlertCircle
} from 'lucide-react'
import { useSuppliers } from '@/contexts/SupplierContext'
import { Supplier } from '@/types/supplier'
import AddSupplierModal from './AddSupplierModal'
import EditSupplierModal from './EditSupplierModal'

interface SupplierListProps {
  searchTerm: string
}

export default function SupplierList({ searchTerm }: SupplierListProps) {
  const { suppliers, deleteSupplier, getSupplierPerformance } = useSuppliers()
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)

  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'INACTIVE':
        return 'bg-gray-100 text-gray-800'
      case 'BLOCKED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'Ativo'
      case 'INACTIVE':
        return 'Inativo'
      case 'BLOCKED':
        return 'Bloqueado'
      default:
        return status
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  const handleDeleteSupplier = (supplier: Supplier) => {
    setSelectedSupplier(supplier)
    setIsDeleteModalOpen(true)
  }

  const confirmDelete = () => {
    if (selectedSupplier) {
      try {
        deleteSupplier(selectedSupplier.id)
        setIsDeleteModalOpen(false)
        setSelectedSupplier(null)
      } catch (error) {
        console.error('Erro ao deletar fornecedor:', error)
        // TODO: Mostrar toast de erro
      }
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Fornecedores</h2>
            <p className="text-sm text-gray-600">
              {filteredSuppliers.length} fornecedor(es) encontrado(s)
            </p>
          </div>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Fornecedor</span>
        </button>
      </div>

      {/* Suppliers Grid */}
      {filteredSuppliers.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum fornecedor encontrado</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Tente ajustar os termos de busca ou limpar os filtros'
              : 'Comece adicionando seu primeiro fornecedor'
            }
          </p>
          {!searchTerm && (
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Adicionar Primeiro Fornecedor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSuppliers.map((supplier) => {
            const performance = getSupplierPerformance(supplier.id)
            
            return (
              <div key={supplier.id} className="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{supplier.name}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(supplier.status)}`}>
                          {getStatusLabel(supplier.status)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600">{supplier.code}</p>
                    </div>
                    <div className="flex items-center space-x-1">
                      {renderStars(supplier.rating)}
                    </div>
                  </div>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{supplier.contact.name}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">{supplier.email}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span>{supplier.phone}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {supplier.address.city}, {supplier.address.state}
                      </span>
                    </div>
                  </div>

                  {/* Commercial Terms */}
                  <div className="bg-gray-50 rounded-lg p-3 mb-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-2">Condições Comerciais</h4>
                    <div className="text-xs text-gray-600 space-y-1">
                      <div>Prazo: {supplier.commercialTerms.paymentTerms}</div>
                      <div>Lead Time: {supplier.commercialTerms.leadTimeDays} dias</div>
                      <div>Pedido Mín: {supplier.commercialTerms.currency} {supplier.commercialTerms.minOrderValue.toFixed(2)}</div>
                    </div>
                  </div>

                  {/* Performance Metrics */}
                  {performance.totalOrders > 0 && (
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">Performance</h4>
                      <div className="text-xs text-gray-600 space-y-1">
                        <div>Pedidos: {performance.totalOrders}</div>
                        <div>Pontualidade: {performance.onTimePercentage.toFixed(1)}%</div>
                        <div>Total: {supplier.commercialTerms.currency} {performance.totalValue.toFixed(2)}</div>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      {supplier.website && (
                        <a
                          href={supplier.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                          title="Visitar website"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      )}
                    </div>
                    <div className="flex items-center space-x-1">
                      <button 
                        onClick={() => {
                          setSelectedSupplier(supplier)
                          setIsEditModalOpen(true)
                        }}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar fornecedor"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteSupplier(supplier)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir fornecedor"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedSupplier && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900">Confirmar Exclusão</h3>
                <p className="text-sm text-gray-600">Esta ação não pode ser desfeita.</p>
              </div>
            </div>
            
            <p className="text-gray-700 mb-6">
              Tem certeza que deseja excluir o fornecedor <strong>{selectedSupplier.name}</strong>?
            </p>
            
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => {
                  setIsDeleteModalOpen(false)
                  setSelectedSupplier(null)
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Modals */}
      <AddSupplierModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
      
      <EditSupplierModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        supplier={selectedSupplier}
      />
    </div>
  )
} 