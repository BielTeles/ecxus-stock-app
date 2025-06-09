'use client'

import { useState, useEffect } from 'react'
import { X, Building2, User, Mail, Phone, MapPin, Globe, DollarSign, Calendar, AlertCircle, Star } from 'lucide-react'
import { useSuppliers } from '@/contexts/SupplierContext'
import { Supplier } from '@/types/supplier'

interface EditSupplierModalProps {
  isOpen: boolean
  onClose: () => void
  supplier: Supplier | null
}

interface FormErrors {
  [key: string]: string
}

export default function EditSupplierModal({ isOpen, onClose, supplier }: EditSupplierModalProps) {
  const { updateSupplier } = useSuppliers()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})
  const [formData, setFormData] = useState<Supplier>({
    id: 0,
    name: '',
    code: '',
    email: '',
    phone: '',
    website: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'Brasil'
    },
    contact: {
      name: '',
      email: '',
      phone: '',
      department: ''
    },
    commercialTerms: {
      paymentTerms: '',
      minOrderValue: 0,
      shippingCost: 0,
      leadTimeDays: 7,
      currency: 'BRL'
    },
    status: 'ACTIVE',
    rating: 5,
    notes: '',
    createdAt: '',
    updatedAt: ''
  })

  // Carregar dados do fornecedor quando o modal abrir
  useEffect(() => {
    if (supplier && isOpen) {
      setFormData(supplier)
    }
  }, [supplier, isOpen])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validação básica
      const newErrors: FormErrors = {}
      
      if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório'
      if (!formData.code.trim()) newErrors.code = 'Código é obrigatório'
      if (!formData.email.trim()) newErrors.email = 'Email é obrigatório'
      if (!formData.phone.trim()) newErrors.phone = 'Telefone é obrigatório'
      if (!formData.address.city.trim()) newErrors.city = 'Cidade é obrigatória'
      if (!formData.address.state.trim()) newErrors.state = 'Estado é obrigatório'
      if (!formData.contact.name.trim()) newErrors.contactName = 'Nome do contato é obrigatório'

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors)
        return
      }

      updateSupplier(formData.id, formData)
      onClose()
    } catch (error) {
      if (error instanceof Error) {
        setErrors({ general: error.message })
      } else {
        setErrors({ general: 'Erro inesperado ao atualizar fornecedor' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    
    // Limpar erro específico do campo
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev }
        delete newErrors[name]
        return newErrors
      })
    }

    // Atualizar dados do formulário
    if (name.includes('.')) {
      const [section, field] = name.split('.')
      setFormData(prev => ({
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: type === 'number' ? Number(value) : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? Number(value) : value
      }))
    }
  }

  const renderStars = (rating: number, onChange: (rating: number) => void) => {
    return (
      <div className="flex space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onChange(i + 1)}
            className="focus:outline-none"
          >
            <Star
              className={`h-5 w-5 ${
                i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
              } hover:text-yellow-400 transition-colors`}
            />
          </button>
        ))}
      </div>
    )
  }

  if (!isOpen || !supplier) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <Building2 className="h-6 w-6 text-blue-600 mr-2" />
            Editar Fornecedor
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Error Message */}
          {errors.general && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <span className="text-red-700 text-sm">{errors.general}</span>
            </div>
          )}

          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="h-4 w-4 inline mr-1" />
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Mouser Electronics"
                />
                {errors.name && <p className="text-red-600 text-xs mt-1">{errors.name}</p>}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Código do Fornecedor *
                </label>
                <input
                  type="text"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.code ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="Ex: MOUSER-001"
                />
                {errors.code && <p className="text-red-600 text-xs mt-1">{errors.code}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Mail className="h-4 w-4 inline mr-1" />
                  Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.email ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="vendas@empresa.com"
                />
                {errors.email && <p className="text-red-600 text-xs mt-1">{errors.email}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Phone className="h-4 w-4 inline mr-1" />
                  Telefone *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.phone ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="+55 11 3000-0000"
                />
                {errors.phone && <p className="text-red-600 text-xs mt-1">{errors.phone}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Globe className="h-4 w-4 inline mr-1" />
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://www.empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="ACTIVE">Ativo</option>
                  <option value="INACTIVE">Inativo</option>
                  <option value="BLOCKED">Bloqueado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Star className="h-4 w-4 inline mr-1" />
                  Avaliação do Fornecedor
                </label>
                {renderStars(formData.rating, (rating) => setFormData(prev => ({ ...prev, rating })))}
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="h-4 w-4 inline mr-1" />
                  Logradouro
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Rua, Av, etc..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cidade *
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.city ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="São Paulo"
                />
                {errors.city && <p className="text-red-600 text-xs mt-1">{errors.city}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Estado *
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.state ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="SP"
                />
                {errors.state && <p className="text-red-600 text-xs mt-1">{errors.state}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  CEP
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="01234-567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  País
                </label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contato */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pessoa de Contato</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <User className="h-4 w-4 inline mr-1" />
                  Nome *
                </label>
                <input
                  type="text"
                  name="contact.name"
                  value={formData.contact.name}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    errors.contactName ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="João Silva"
                />
                {errors.contactName && <p className="text-red-600 text-xs mt-1">{errors.contactName}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Departamento
                </label>
                <input
                  type="text"
                  name="contact.department"
                  value={formData.contact.department}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Vendas"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email do Contato
                </label>
                <input
                  type="email"
                  name="contact.email"
                  value={formData.contact.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="joao@empresa.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Telefone do Contato
                </label>
                <input
                  type="tel"
                  name="contact.phone"
                  value={formData.contact.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+55 11 9999-9999"
                />
              </div>
            </div>
          </div>

          {/* Condições Comerciais */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Condições Comerciais</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prazo de Pagamento
                </label>
                <input
                  type="text"
                  name="commercialTerms.paymentTerms"
                  value={formData.commercialTerms.paymentTerms}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="30 dias"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="h-4 w-4 inline mr-1" />
                  Lead Time (dias)
                </label>
                <input
                  type="number"
                  name="commercialTerms.leadTimeDays"
                  value={formData.commercialTerms.leadTimeDays}
                  onChange={handleChange}
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <DollarSign className="h-4 w-4 inline mr-1" />
                  Pedido Mínimo
                </label>
                <input
                  type="number"
                  name="commercialTerms.minOrderValue"
                  value={formData.commercialTerms.minOrderValue}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custo de Frete
                </label>
                <input
                  type="number"
                  name="commercialTerms.shippingCost"
                  value={formData.commercialTerms.shippingCost}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Observações
            </label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Informações adicionais sobre o fornecedor..."
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end space-x-3 pt-6 border-t">
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
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 