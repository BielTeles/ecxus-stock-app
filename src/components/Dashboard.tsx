'use client'

import { useState, useEffect, useMemo } from 'react'
import { Package, TrendingUp, AlertTriangle, DollarSign, BarChart3, PieChart, Activity, Calendar, FileText, X } from 'lucide-react'
import { useProducts } from '@/contexts/ProductContextV3'
import { useCurrency } from '@/hooks/useCurrency'
import { useLocalStorage } from '@/hooks/useLocalStorage'

interface DashboardProps {
  onAddProduct: () => void
  onSwitchToProducts: () => void
}

interface HistoricalData {
  date: string
  totalProducts: number
  totalValue: number
  lowStockProducts: number
  categories: number
}

export default function Dashboard({ onAddProduct, onSwitchToProducts }: DashboardProps) {
  const { products } = useProducts()
  const { formatCurrency } = useCurrency()
  const [isHydrated, setIsHydrated] = useState(false)
  const [showReportModal, setShowReportModal] = useState(false)
  
  // Histórico para cálculo de mudanças reais
  const { value: historicalData, setValue: setHistoricalData } = useLocalStorage<HistoricalData[]>('dashboard-historical', [])

  // Evitar erro de hidratação - só calcular estatísticas após hidratação no cliente
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Salvar dados históricos mensalmente para cálculo de mudanças
  useEffect(() => {
    if (!isHydrated || products.length === 0) return

    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    
    // Usar um timeout para evitar loops e permitir que outros estados se estabilizem
    const timeoutId = setTimeout(() => {
      const currentData: HistoricalData = {
        date: currentMonth,
        totalProducts: products.length,
        totalValue: products.reduce((sum, product) => sum + ((product.quantity || 0) * (product.sell_price || 0)), 0),
        lowStockProducts: products.filter(p => (p.quantity || 0) <= (p.min_stock || 0)).length,
        categories: new Set(products.map(p => p.category)).size
      }

      // Verificar se dados já existem para o mês atual
      const existingIndex = historicalData.findIndex(h => h.date === currentMonth)
      
      // Só atualizar se não existem dados para o mês atual
      if (existingIndex === -1) {
        setHistoricalData(prev => [...prev, currentData])
      }
    }, 1000) // Aguardar 1 segundo para estabilizar

    return () => clearTimeout(timeoutId)
  }, [isHydrated]) // Apenas isHydrated como dependência

  // Calcular estatísticas em tempo real apenas após hidratação
  const stats = useMemo(() => {
    if (!isHydrated) {
      return {
        totalProducts: 0,
        totalValue: 0,
        lowStockProducts: 0,
        categories: 0,
        changes: { totalProducts: 0, totalValue: 0, lowStockProducts: 0, categories: 0 }
      }
    }

    const current = {
      totalProducts: products.length,
      totalValue: products.reduce((sum, product) => sum + ((product.quantity || 0) * (product.sell_price || 0)), 0),
      lowStockProducts: products.filter(p => (p.quantity || 0) <= (p.min_stock || 0)).length,
      categories: new Set(products.map(p => p.category)).size
    }

    // Calcular mudanças reais baseadas no histórico
    const lastMonth = historicalData[historicalData.length - 2] // Penúltimo registro
    const changes = lastMonth ? {
      totalProducts: lastMonth.totalProducts > 0 ? ((current.totalProducts - lastMonth.totalProducts) / lastMonth.totalProducts) * 100 : 0,
      totalValue: lastMonth.totalValue > 0 ? ((current.totalValue - lastMonth.totalValue) / lastMonth.totalValue) * 100 : 0,
      lowStockProducts: lastMonth.lowStockProducts > 0 ? ((current.lowStockProducts - lastMonth.lowStockProducts) / lastMonth.lowStockProducts) * 100 : 0,
      categories: lastMonth.categories > 0 ? ((current.categories - lastMonth.categories) / lastMonth.categories) * 100 : 0
    } : { totalProducts: 0, totalValue: 0, lowStockProducts: 0, categories: 0 }

    return { ...current, changes }
  }, [isHydrated, products, historicalData])
  
  // Estatísticas avançadas
  const categoriesData = useMemo(() => {
    if (!isHydrated) return []
    
    const categoryStats = products.reduce((acc, product) => {
      const category = product.category
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0 }
      }
      acc[category].count += 1
      acc[category].value += (product.quantity || 0) * (product.sell_price || 0)
      return acc
    }, {} as Record<string, { count: number; value: number }>)
    
    return Object.entries(categoryStats).map(([category, data]) => ({
      category,
      count: data.count,
      value: data.value,
      percentage: products.length > 0 ? (data.count / products.length) * 100 : 0
    })).sort((a, b) => b.count - a.count)
  }, [isHydrated, products])
  
  const topValueProducts = useMemo(() => {
    if (!isHydrated) return []
    return products
      .sort((a, b) => ((b.quantity || 0) * (b.sell_price || 0)) - ((a.quantity || 0) * (a.sell_price || 0)))
      .slice(0, 5)
  }, [isHydrated, products])
    
  const stockRiskLevel = useMemo(() => {
    if (!isHydrated) return { critical: 0, low: 0, warning: 0, healthy: 0 }
    
    return {
      critical: products.filter(p => (p.quantity || 0) === 0).length,
      low: products.filter(p => (p.quantity || 0) > 0 && (p.quantity || 0) <= (p.min_stock || 0)).length,
      warning: products.filter(p => (p.quantity || 0) > (p.min_stock || 0) && (p.quantity || 0) <= (p.min_stock || 0) * 2).length,
      healthy: products.filter(p => (p.quantity || 0) > (p.min_stock || 0) * 2).length
    }
  }, [isHydrated, products])

  const formatChange = (change: number) => {
    if (change === 0) return { text: 'Sem dados', color: 'text-gray-500' }
    const sign = change > 0 ? '+' : ''
    const color = change > 0 ? 'text-green-600' : 'text-red-600'
    return { text: `${sign}${change.toFixed(1)}%`, color }
  }

  const generateDetailedReport = () => {
    const now = new Date()
    const report = {
      timestamp: now.toLocaleString('pt-BR'),
      summary: {
        totalProducts: stats.totalProducts,
        totalValue: stats.totalValue,
        categories: stats.categories,
        stockRisk: stockRiskLevel
      },
      topProducts: topValueProducts.slice(0, 10),
      categories: categoriesData,
      criticalStock: products.filter(p => (p.quantity || 0) <= (p.min_stock || 0)),
      trends: historicalData.slice(-6) // Últimos 6 meses
    }
    return report
  }

  const dashboardStats = [
    {
      title: 'Total de Produtos',
      value: stats.totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: formatChange(stats.changes.totalProducts),
    },
    {
      title: 'Valor Total em Estoque',
      value: formatCurrency(stats.totalValue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: formatChange(stats.changes.totalValue),
    },
    {
      title: 'Produtos em Baixa',
      value: stats.lowStockProducts.toString(),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: formatChange(stats.changes.lowStockProducts),
    },
    {
      title: 'Categorias',
      value: stats.categories.toString(),
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: formatChange(stats.changes.categories),
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {dashboardStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <div key={index} className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <div className="mt-4 flex items-center">
                <span className={`text-sm font-medium ${stat.change.color}`}>
                  {stat.change.text}
                </span>
                <span className="text-sm text-gray-500 ml-2">vs mês anterior</span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Stock Risk Analysis */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Activity className="h-5 w-5 text-purple-500 mr-2" />
          Análise de Risco de Estoque
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-red-50 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stockRiskLevel.critical}</div>
            <div className="text-sm text-red-700">Crítico (Zerado)</div>
          </div>
          <div className="text-center p-4 bg-orange-50 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">{stockRiskLevel.low}</div>
            <div className="text-sm text-orange-700">Baixo</div>
          </div>
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">{stockRiskLevel.warning}</div>
            <div className="text-sm text-yellow-700">Atenção</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">{stockRiskLevel.healthy}</div>
            <div className="text-sm text-green-700">Saudável</div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Value Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-500 mr-2" />
              Produtos de Maior Valor
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topValueProducts.map((product, index) => (
                <button
                  key={product.id}
                  onClick={onSwitchToProducts}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                      #{index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-sm text-gray-600">{product.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-green-600">{formatCurrency((product.quantity || 0) * (product.sell_price || 0))}</p>
                    <p className="text-xs text-gray-500">{product.quantity || 0} × {formatCurrency(product.sell_price || 0)}</p>
                  </div>
                </button>
              ))}
              {topValueProducts.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Nenhum produto cadastrado</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Categories Distribution */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <PieChart className="h-5 w-5 text-purple-500 mr-2" />
              Distribuição por Categoria
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {categoriesData.slice(0, 5).map((category, index) => {
                const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500']
                return (
                  <div key={category.category} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${colors[index % colors.length]}`}></div>
                      <div>
                        <p className="font-medium text-gray-900">{category.category}</p>
                        <p className="text-sm text-gray-600">{category.count} produtos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">{category.percentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">{formatCurrency(category.value)}</p>
                    </div>
                  </div>
                )
              })}
              {categoriesData.length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">Nenhuma categoria disponível</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Critical Stock Alert */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
              Estoque Crítico
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {products.filter(p => (p.quantity || 0) <= (p.min_stock || 0)).slice(0, 5).map((product) => (
                <button
                  key={product.id}
                  onClick={onSwitchToProducts}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                    (product.quantity || 0) === 0 
                      ? 'bg-red-50 hover:bg-red-100' 
                      : 'bg-orange-50 hover:bg-orange-100'
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.code} • {product.location}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${(product.quantity || 0) === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {product.quantity || 0}
                    </p>
                    <p className="text-xs text-gray-500">Mín: {product.min_stock || 0}</p>
                  </div>
                </button>
              ))}
              {products.filter(p => (p.quantity || 0) <= (p.min_stock || 0)).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">✅ Todos os produtos estão com estoque adequado!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Ações Rápidas</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button 
            onClick={onAddProduct}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-center group"
          >
            <Package className="h-8 w-8 text-gray-400 group-hover:text-blue-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-blue-600 transition-colors">Adicionar Produto</p>
          </button>
          <button 
            onClick={onSwitchToProducts}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-center group"
          >
            <TrendingUp className="h-8 w-8 text-gray-400 group-hover:text-green-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-green-600 transition-colors">Ver Todos os Produtos</p>
          </button>
          <button 
            onClick={() => setShowReportModal(true)}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center group"
          >
            <BarChart3 className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">Relatório Detalhado</p>
          </button>
        </div>
      </div>

      {/* Modal de Relatório Detalhado */}
      {showReportModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <FileText className="h-6 w-6 text-blue-600" />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Relatório Detalhado do Dashboard</h2>
                  <p className="text-sm text-gray-500">Gerado em {new Date().toLocaleString('pt-BR')}</p>
                </div>
              </div>
              <button 
                onClick={() => setShowReportModal(false)} 
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Resumo Executivo */}
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Resumo Executivo</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{stats.totalProducts.toLocaleString()}</div>
                    <div className="text-sm text-gray-600">Produtos Cadastrados</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</div>
                    <div className="text-sm text-gray-600">Valor Total</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{stats.categories}</div>
                    <div className="text-sm text-gray-600">Categorias</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</div>
                    <div className="text-sm text-gray-600">Alertas Ativos</div>
                  </div>
                </div>
              </div>

              {/* Análise de Risco */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">⚠️ Análise de Risco de Estoque</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-red-600">{stockRiskLevel.critical}</div>
                    <div className="text-sm text-red-700">Crítico (Zerado)</div>
                    <div className="text-xs text-red-600 mt-1">Ação imediata necessária</div>
                  </div>
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-orange-600">{stockRiskLevel.low}</div>
                    <div className="text-sm text-orange-700">Baixo Estoque</div>
                    <div className="text-xs text-orange-600 mt-1">Reabastecer em breve</div>
                  </div>
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-yellow-600">{stockRiskLevel.warning}</div>
                    <div className="text-sm text-yellow-700">Atenção</div>
                    <div className="text-xs text-yellow-600 mt-1">Monitorar proximamente</div>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-xl font-bold text-green-600">{stockRiskLevel.healthy}</div>
                    <div className="text-sm text-green-700">Saudável</div>
                    <div className="text-xs text-green-600 mt-1">Estoque adequado</div>
                  </div>
                </div>
              </div>

              {/* Top Produtos por Valor */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">🏆 Top 10 Produtos por Valor</h3>
                <div className="bg-gray-50 rounded-lg overflow-hidden">
                  <table className="w-full">
                    <thead className="bg-gray-100">
                      <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">#</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Produto</th>
                        <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Categoria</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Qtd</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Valor Unit.</th>
                        <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {topValueProducts.slice(0, 10).map((product, index) => (
                        <tr key={product.id} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm text-gray-900">#{index + 1}</td>
                          <td className="px-4 py-3">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.code}</div>
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-700">{product.category}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{product.quantity || 0}</td>
                          <td className="px-4 py-3 text-sm text-gray-900 text-right">{formatCurrency(product.sell_price || 0)}</td>
                          <td className="px-4 py-3 text-sm font-bold text-green-600 text-right">
                            {formatCurrency((product.quantity || 0) * (product.sell_price || 0))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Distribuição por Categoria */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">📈 Distribuição por Categoria</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {categoriesData.map((category, index) => {
                    const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-pink-500', 'bg-indigo-500', 'bg-yellow-500', 'bg-red-500']
                    return (
                      <div key={category.category} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full ${colors[index % colors.length]}`}></div>
                            <span className="font-medium text-gray-900">{category.category}</span>
                          </div>
                          <span className="text-sm font-bold text-gray-900">{category.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          {category.count} produtos • {formatCurrency(category.value)}
                        </div>
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${colors[index % colors.length]}`}
                            style={{ width: `${category.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* Histórico de Tendências */}
              {historicalData.length > 1 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">📊 Tendências Históricas</h3>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {historicalData.slice(-6).map((data, index) => (
                        <div key={data.date} className="bg-white rounded-lg p-3 border">
                          <div className="text-sm font-medium text-gray-600 mb-2">{data.date}</div>
                          <div className="space-y-1 text-xs">
                            <div>Produtos: {data.totalProducts}</div>
                            <div>Valor: {formatCurrency(data.totalValue)}</div>
                            <div>Alertas: {data.lowStockProducts}</div>
                            <div>Categorias: {data.categories}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between p-6 border-t bg-gray-50">
              <div className="text-sm text-gray-500">
                Relatório gerado automaticamente pelo sistema Ecxus Stock
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    const report = generateDetailedReport()
                    const dataStr = JSON.stringify(report, null, 2)
                    const dataBlob = new Blob([dataStr], { type: 'application/json' })
                    const url = URL.createObjectURL(dataBlob)
                    const link = document.createElement('a')
                    link.href = url
                    link.download = `dashboard-report-${new Date().toISOString().split('T')[0]}.json`
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                    URL.revokeObjectURL(url)
                  }}
                  className="px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  📥 Exportar JSON
                </button>
                <button
                  onClick={() => setShowReportModal(false)}
                  className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 