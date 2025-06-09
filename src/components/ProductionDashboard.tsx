'use client'

import { Factory, Package, TrendingUp, AlertTriangle, Plus } from 'lucide-react'
import { useProduction } from '@/contexts/ProductionContext'
import { useProducts } from '@/contexts/ProductContext'
import { PROCESS_COLORS, STATUS_COLORS } from '@/constants/production'

interface ProductionDashboardProps {
  onAddFinishedProduct: () => void
}

export default function ProductionDashboard({ onAddFinishedProduct }: ProductionDashboardProps) {
  const { finishedProducts, getDashboardData, analyzeProduction } = useProduction()
  const { products } = useProducts()
  
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
        <button
          onClick={onAddFinishedProduct}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          <Plus className="h-5 w-5" />
          <span>Novo Produto Acabado</span>
        </button>
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
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
} 