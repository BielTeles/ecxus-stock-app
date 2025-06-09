'use client'

import { useState, useMemo } from 'react'
import { X, Plus, Trash2, Edit3, Package, Calculator, AlertCircle, Search } from 'lucide-react'
import { useProduction } from '@/contexts/ProductionContext'
import { useProducts } from '@/contexts/ProductContext'
import { BOMItem } from '@/types/production'

interface BOMModalProps {
  isOpen: boolean
  onClose: () => void
  finishedProductId: number
}

interface BOMFormData {
  componentId: number
  quantity: number
  process: 'SMD' | 'PTH'
  position: string
  notes: string
}

export default function BOMModal({ isOpen, onClose, finishedProductId }: BOMModalProps) {
  const { 
    getFinishedProductById, 
    addBOMItem, 
    updateBOMItem, 
    removeBOMItem,
    analyzeProduction 
  } = useProduction()
  const { products } = useProducts()
  
  const [isAddingItem, setIsAddingItem] = useState(false)
  const [editingItem, setEditingItem] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  const [formData, setFormData] = useState<BOMFormData>({
    componentId: 0,
    quantity: 1,
    process: 'SMD',
    position: '',
    notes: ''
  })

  const finishedProduct = getFinishedProductById(finishedProductId)
  const analysis = useMemo(() => analyzeProduction(finishedProductId), [finishedProductId, analyzeProduction])

  // Filtrar componentes disponíveis
  const availableComponents = useMemo(() => {
    return products.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.code.toLowerCase().includes(searchTerm.toLowerCase())
    )
  }, [products, searchTerm])

  const handleAddItem = async () => {
    if (formData.componentId === 0 || formData.quantity <= 0) return
    
    try {
      await addBOMItem(finishedProductId, {
        componentId: formData.componentId,
        quantity: formData.quantity,
        process: formData.process,
        position: formData.position.trim(),
        notes: formData.notes.trim()
      })
      
      // Reset form
      setFormData({
        componentId: 0,
        quantity: 1,
        process: 'SMD',
        position: '',
        notes: ''
      })
      setIsAddingItem(false)
      setSearchTerm('')
    } catch (error) {
      console.error('Erro ao adicionar item à BOM:', error)
    }
  }

  const handleEditItem = (bomItem: BOMItem) => {
    setFormData({
      componentId: bomItem.componentId,
      quantity: bomItem.quantity,
      process: bomItem.process,
      position: bomItem.position || '',
      notes: bomItem.notes || ''
    })
    setEditingItem(bomItem.id)
    setIsAddingItem(true)
  }

  const handleUpdateItem = async () => {
    if (editingItem === null || formData.quantity <= 0) return
    
    try {
      await updateBOMItem(finishedProductId, editingItem, {
        quantity: formData.quantity,
        process: formData.process,
        position: formData.position.trim(),
        notes: formData.notes.trim()
      })
      
      // Reset form
      setFormData({
        componentId: 0,
        quantity: 1,
        process: 'SMD',
        position: '',
        notes: ''
      })
      setIsAddingItem(false)
      setEditingItem(null)
    } catch (error) {
      console.error('Erro ao atualizar item da BOM:', error)
    }
  }

  const handleDeleteItem = async (bomItemId: number) => {
    if (confirm('Tem certeza que deseja remover este item da BOM?')) {
      try {
        await removeBOMItem(finishedProductId, bomItemId)
      } catch (error) {
        console.error('Erro ao remover item da BOM:', error)
      }
    }
  }

  const cancelEdit = () => {
    setFormData({
      componentId: 0,
      quantity: 1,
      process: 'SMD',
      position: '',
      notes: ''
    })
    setIsAddingItem(false)
    setEditingItem(null)
    setSearchTerm('')
  }

  const getComponentById = (id: number) => {
    return products.find(p => p.id === id)
  }

  const calculateTotalCost = () => {
    if (!finishedProduct) return 0
    return finishedProduct.bom.reduce((total, bomItem) => {
      const component = getComponentById(bomItem.componentId)
      return total + (component ? component.price * bomItem.quantity : 0)
    }, 0)
  }

  if (!isOpen || !finishedProduct) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Package className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                BOM - {finishedProduct.name}
              </h2>
              <p className="text-sm text-gray-500">{finishedProduct.code}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {/* Add/Edit Form */}
            {isAddingItem && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {editingItem ? 'Editar Item da BOM' : 'Adicionar Item à BOM'}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  {/* Component Selection */}
                  {!editingItem && (
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Componente *
                      </label>
                      <div className="space-y-2">
                        <div className="relative">
                          <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Buscar componente..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <select
                          value={formData.componentId}
                          onChange={(e) => setFormData(prev => ({ ...prev, componentId: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          required
                        >
                          <option value={0}>Selecione um componente</option>
                          {availableComponents.map(component => (
                            <option key={component.id} value={component.id}>
                              {component.name} ({component.code}) - R$ {component.price.toFixed(2)}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}

                  {editingItem && (
                    <div className="lg:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Componente
                      </label>
                      <div className="px-3 py-2 bg-gray-100 border border-gray-300 rounded-lg">
                        {getComponentById(formData.componentId)?.name} ({getComponentById(formData.componentId)?.code})
                      </div>
                    </div>
                  )}

                  {/* Quantity */}
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

                  {/* Process */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Processo
                    </label>
                    <select
                      value={formData.process}
                      onChange={(e) => setFormData(prev => ({ ...prev, process: e.target.value as 'SMD' | 'PTH' }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="SMD">SMD</option>
                      <option value="PTH">PTH</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Position */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Posição (Referência)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: R1, C5, U3"
                      value={formData.position}
                      onChange={(e) => setFormData(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  {/* Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Observações
                    </label>
                    <input
                      type="text"
                      placeholder="Observações adicionais"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={editingItem ? handleUpdateItem : handleAddItem}
                    disabled={formData.componentId === 0 || formData.quantity <= 0}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                  >
                    {editingItem ? 'Atualizar' : 'Adicionar'}
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}

            {/* Add Button */}
            {!isAddingItem && (
              <button
                onClick={() => setIsAddingItem(true)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors mb-6"
              >
                <Plus className="h-4 w-4" />
                <span>Adicionar Componente</span>
              </button>
            )}

            {/* BOM List */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">
                Lista de Materiais ({finishedProduct.bom.length} {finishedProduct.bom.length === 1 ? 'item' : 'itens'})
              </h3>

              {finishedProduct.bom.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <p>Nenhum componente adicionado à BOM</p>
                  <p className="text-sm">Clique em "Adicionar Componente" para começar</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {finishedProduct.bom.map((bomItem) => {
                    const component = getComponentById(bomItem.componentId)
                    if (!component) return null

                    const subtotal = component.price * bomItem.quantity
                    const available = component.quantity
                    const needed = bomItem.quantity
                    const canProduce = Math.floor(available / needed)

                    return (
                      <div key={bomItem.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h4 className="font-medium text-gray-900">{component.name}</h4>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                bomItem.process === 'SMD' 
                                  ? 'bg-blue-100 text-blue-800' 
                                  : 'bg-purple-100 text-purple-800'
                              }`}>
                                {bomItem.process}
                              </span>
                              {bomItem.position && (
                                <span className="px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs">
                                  {bomItem.position}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                              <span>Código: {component.code}</span>
                              <span>Qtd: {bomItem.quantity}</span>
                              <span>Unit: R$ {component.price.toFixed(2)}</span>
                              <span className="font-medium">Subtotal: R$ {subtotal.toFixed(2)}</span>
                            </div>
                            {bomItem.notes && (
                              <p className="mt-1 text-sm text-gray-600">{bomItem.notes}</p>
                            )}
                          </div>

                          <div className="flex items-center space-x-4">
                            {/* Stock Status */}
                            <div className="text-right">
                              <p className={`text-sm font-medium ${
                                canProduce >= 1 ? 'text-green-600' : 'text-red-600'
                              }`}>
                                {canProduce >= 1 ? `✓ ${canProduce}x` : '⚠ Insuficiente'}
                              </p>
                              <p className="text-xs text-gray-500">
                                Estoque: {available}
                              </p>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handleEditItem(bomItem)}
                                className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                title="Editar item"
                              >
                                <Edit3 className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteItem(bomItem.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Remover item"
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
            </div>
          </div>

          {/* Sidebar - Analysis */}
          <div className="w-80 border-l bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Cost Analysis */}
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Calculator className="h-5 w-5 text-green-600 mr-2" />
                  Análise de Custos
                </h3>
                
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Custo Total BOM:</span>
                    <span className="font-medium text-gray-900">
                      R$ {calculateTotalCost().toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Preço de Venda:</span>
                    <span className="font-medium text-gray-900">
                      R$ {finishedProduct.sellPrice.toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-sm text-gray-600">Margem Bruta:</span>
                    <span className={`font-medium ${
                      (finishedProduct.sellPrice - calculateTotalCost()) > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      R$ {(finishedProduct.sellPrice - calculateTotalCost()).toFixed(2)}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Margem %:</span>
                    <span className={`font-medium ${
                      analysis && analysis.profitMargin > 0 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {analysis ? analysis.profitMargin.toFixed(1) : '0.0'}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Production Analysis */}
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Package className="h-5 w-5 text-blue-600 mr-2" />
                  Capacidade de Produção
                </h3>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {analysis?.maxProducible || 0}
                  </div>
                  <p className="text-sm text-gray-600">unidades disponíveis</p>
                </div>

                {analysis && analysis.missingComponents.length > 0 && (
                  <div className="mt-4">
                    <div className="flex items-center space-x-2 text-orange-600 mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <span className="text-sm font-medium">Componentes em Falta</span>
                    </div>
                    <div className="space-y-1">
                      {analysis.missingComponents.map(missing => {
                        const component = getComponentById(missing.componentId)
                        return (
                          <div key={missing.componentId} className="text-xs text-gray-600">
                            {component?.name}: faltam {missing.missing}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Process Summary */}
              <div className="bg-white rounded-lg p-4 border">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  Resumo de Processos
                </h3>
                
                <div className="space-y-2">
                  {['SMD', 'PTH'].map(process => {
                    const count = finishedProduct.bom.filter(item => item.process === process).length
                    if (count === 0) return null
                    
                    return (
                      <div key={process} className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          process === 'SMD' 
                            ? 'bg-blue-100 text-blue-800' 
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {process}
                        </span>
                        <span className="text-sm text-gray-600">{count} {count === 1 ? 'item' : 'itens'}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 