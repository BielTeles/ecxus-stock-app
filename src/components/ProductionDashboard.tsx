'use client'

import { Factory, Package, TrendingUp, AlertTriangle, Plus, Settings, List, X, Trash2, BarChart3 } from 'lucide-react'
import { useState } from 'react'
import { useProduction } from '@/contexts/ProductionContext'
import { useProducts } from '@/contexts/ProductContext'
import { PROCESS_COLORS, STATUS_COLORS } from '@/constants/production'
import ProductionReport from './ProductionReport'

interface ProductionDashboardProps {
  onAddFinishedProduct: () => void
}

interface BOMModalProps {
  isOpen: boolean
  onClose: () => void
  finishedProductId: number
}

// Componente BOM Modal inline
function BOMModal({ isOpen, onClose, finishedProductId }: BOMModalProps) {
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
            <List className="h-6 w-6 text-blue-600" />
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
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Componente *</label>
                  <select
                    value={selectedComponent}
                    onChange={(e) => setSelectedComponent(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value={0}>Selecione um componente</option>
                    {products.map(product => (
                      <option key={product.id} value={product.id}>
                        {product.name} ({product.code})
                      </option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Quantidade *</label>
                  <input
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Processo</label>
                  <select
                    value={process}
                    onChange={(e) => setProcess(e.target.value as 'SMD' | 'PTH')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="SMD">SMD</option>
                    <option value="PTH">PTH</option>
                  </select>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Posição (Referência)</label>
                <input
                  type="text"
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  placeholder="Ex: R1, C5, U3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleAddItem}
                  disabled={selectedComponent === 0 || quantity <= 0}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-lg transition-colors"
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
                              bomItem.process === 'SMD' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'
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
                          <div className="text-right">
                            <p className={`text-sm font-medium ${canProduce >= 1 ? 'text-green-600' : 'text-red-600'}`}>
                              {canProduce >= 1 ? `✓ ${canProduce}x` : '⚠ Insuficiente'}
                            </p>
                            <p className="text-xs text-gray-500">Estoque: {available}</p>
                          </div>
                          <button
                            onClick={() => handleDeleteItem(bomItem.id)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">Análise de Produção</h3>
              
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
                  <p className={`text-xl font-bold ${analysis.profitMargin > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {analysis.profitMargin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function ProductionDashboard({ onAddFinishedProduct }: ProductionDashboardProps) {
  const { finishedProducts, getDashboardData, analyzeProduction } = useProduction()
  const { products } = useProducts()
  
  const [bomModalOpen, setBomModalOpen] = useState(false)
  const [selectedProductId, setSelectedProductId] = useState<number | null>(null)
  const [reportModalOpen, setReportModalOpen] = useState(false)
  
  const dashboardData = getDashboardData()

  const getComponentName = (componentId: number) => {
    const component = products.find(p => p.id === componentId)
    return component?.name || `Componente #${componentId}`
  }

  const getFinishedProductName = (productId: number) => {
    const product = finishedProducts.find(p => p.id === productId)
    return product?.name || `Produto #${productId}`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Factory className="h-8 w-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard de Produção</h1>
            <p className="text-gray-600">Visão geral da capacidade produtiva e BOM</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setReportModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 text-green-600 bg-green-50 hover:bg-green-100 border border-green-200 rounded-lg transition-colors"
          >
            <BarChart3 className="h-5 w-5" />
            <span>Relatório</span>
          </button>
          <button
            onClick={onAddFinishedProduct}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            <Plus className="h-5 w-5" />
            <span>Novo Produto Acabado</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de PAs</p>
              <p className="text-2xl font-bold text-gray-900">{dashboardData.totalFinishedProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">PAs Ativos</p>
              <p className="text-2xl font-bold text-green-600">{dashboardData.activeProducts}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-purple-600">
                R$ {dashboardData.totalProductionValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
            </div>
            <Factory className="h-8 w-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Componentes Únicos</p>
              <p className="text-2xl font-bold text-orange-600">{products.length}</p>
            </div>
            <Package className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Capacidade de Produção */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Factory className="h-5 w-5 text-blue-600 mr-2" />
            Capacidade de Produção
          </h3>
          <div className="space-y-3">
            {dashboardData.productionCapacity.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum produto ativo cadastrado</p>
            ) : (
              dashboardData.productionCapacity.slice(0, 5).map(({ finishedProductId, maxProducible }) => {
                const product = finishedProducts.find(p => p.id === finishedProductId)
                if (!product) return null

                return (
                  <div key={finishedProductId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${PROCESS_COLORS[product.category]}`}>
                          {product.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[product.status]}`}>
                          {product.status}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{maxProducible}</p>
                      <p className="text-sm text-gray-500">unidades</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Componentes Mais Usados */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Package className="h-5 w-5 text-green-600 mr-2" />
            Componentes Mais Usados
          </h3>
          <div className="space-y-3">
            {dashboardData.mostUsedComponents.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhuma BOM cadastrada</p>
            ) : (
              dashboardData.mostUsedComponents.map(({ componentId, usageCount }) => {
                const component = products.find(p => p.id === componentId)
                if (!component) return null

                return (
                  <div key={componentId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{component.name}</p>
                      <p className="text-sm text-gray-500">{component.code}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-gray-900">{usageCount}</p>
                      <p className="text-sm text-gray-500">BOMs</p>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </div>
      </div>

      {/* Lista de Produtos Acabados */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Package className="h-5 w-5 text-purple-600 mr-2" />
          Produtos Acabados
        </h3>
        
        {finishedProducts.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 mb-4">Nenhum produto acabado cadastrado</p>
            <button
              onClick={onAddFinishedProduct}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
            >
              Cadastrar Primeiro PA
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {finishedProducts.map(product => {
              const analysis = analyzeProduction(product.id)
              
              return (
                <div key={product.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${PROCESS_COLORS[product.category]}`}>
                        {product.category}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[product.status]}`}>
                        {product.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{product.code} | {product.bom.length} componentes na BOM</p>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Pode Produzir</p>
                      <p className="text-lg font-bold text-gray-900">{analysis?.maxProducible || 0} un</p>
                    </div>
                    
                    <div className="text-right">
                      <p className="text-sm text-gray-500">Preço</p>
                      <p className="text-lg font-bold text-green-600">
                        R$ {product.sellPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {analysis && analysis.missingComponents.length > 0 && (
                      <div className="text-orange-600">
                        <AlertTriangle className="h-5 w-5" />
                      </div>
                    )}
                    
                    <button
                      onClick={() => {
                        setSelectedProductId(product.id)
                        setBomModalOpen(true)
                      }}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Gerenciar BOM"
                    >
                      <Settings className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* BOM Modal */}
      {selectedProductId && (
        <BOMModal
          isOpen={bomModalOpen}
          onClose={() => {
            setBomModalOpen(false)
            setSelectedProductId(null)
          }}
          finishedProductId={selectedProductId}
        />
      )}

      {/* Production Report Modal */}
      <ProductionReport
        isOpen={reportModalOpen}
        onClose={() => setReportModalOpen(false)}
      />
    </div>
  )
} 