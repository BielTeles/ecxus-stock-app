'use client'

import { useState } from 'react'
import { X, Plus, Trash2, Package, Calculator } from 'lucide-react'
import { useProduction } from '@/contexts/ProductionContext'
import { useProducts } from '@/contexts/ProductContext'

interface BOMManagementProps {
  isOpen: boolean
  onClose: () => void
  finishedProductId: number
}

export default function BOMManagement({ isOpen, onClose, finishedProductId }: BOMManagementProps) {
  const { getFinishedProductById, addBOMItem, removeBOMItem, analyzeProduction } = useProduction()
  const { products } = useProducts()
  
  const [isAdding, setIsAdding] = useState(false)
  const [selectedComponent, setSelectedComponent] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [process, setProcess] = useState<'SMD' | 'PTH'>('SMD')
  const [position, setPosition] = useState('')

  const finishedProduct = getFinishedProductById(finishedProductId)
  const analysis = analyzeProduction(finishedProductId)

  const handleAddItem = async () => {
    if (selectedComponent === 0 || quantity <= 0) return
    
    try {
      await addBOMItem(finishedProductId, {
        componentId: selectedComponent,
        quantity,
        process,
        position: position.trim(),
        notes: ''
      })
      
      setSelectedComponent(0)
      setQuantity(1)
      setPosition('')
      setIsAdding(false)
    } catch (error) {
      console.error('Erro ao adicionar item:', error)
    }
  }

  const handleDeleteItem = async (bomItemId: number) => {
    if (confirm('Remover este item da BOM?')) {
      try {
        await removeBOMItem(finishedProductId, bomItemId)
      } catch (error) {
        console.error('Erro ao remover item:', error)
      }
    }
  }

  const getComponentById = (id: number) => {
    return products.find(p => p.id === id)
  }

  if (!isOpen || !finishedProduct) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
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
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Add Form */}
          {isAdding && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Adicionar Componente à BOM</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Componente *
                  </label>
                  <select
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value={0}>Selecione um componente</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.code}) - R$ {product.price.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade *
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Processo
                  </label>
                  <select
                    value={process}
                    onChange={(e) => setProcess(e.target.value as 'SMD' | 'PTH')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="SMD">SMD</option>
                    <option value="PTH">PTH</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Posição (Referência)
                </label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ex: R1, C5, U3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAddItem}
                  disabled={selectedComponent === 0 || quantity <= 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
                >
                  Adicionar
                </button>
                <button
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}

          {/* Add Button */}
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
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

                          {/* Delete Button */}
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
                  )
                })}
              </div>
            )}
          </div>

          {/* Analysis */}
          {analysis && (
            <div className="mt-6 bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                <Calculator className="h-5 w-5 text-green-600 mr-2" />
                Análise de Produção
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <p className="text-sm text-gray-600">Pode Produzir</p>
                  <p className="text-2xl font-bold text-blue-600">{analysis.maxProducible}</p>
                  <p className="text-xs text-gray-500">unidades</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Custo Total BOM</p>
                  <p className="text-xl font-bold text-gray-900">R$ {analysis.totalCost.toFixed(2)}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Preço de Venda</p>
                  <p className="text-xl font-bold text-gray-900">R$ {finishedProduct.sellPrice.toFixed(2)}</p>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-gray-600">Margem de Lucro</p>
                  <p className={`text-xl font-bold ${
                    analysis.profitMargin > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {analysis.profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>

              {analysis.missingComponents.length > 0 && (
                <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                  <h4 className="text-sm font-medium text-orange-800 mb-2">Componentes em Falta:</h4>
                  <div className="space-y-1">
                    {analysis.missingComponents.map(missing => {
                      const component = getComponentById(missing.componentId)
                      return (
                        <div key={missing.componentId} className="text-xs text-orange-700">
                          {component?.name}: necessário {missing.needed}, disponível {missing.available}, faltam {missing.missing}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 