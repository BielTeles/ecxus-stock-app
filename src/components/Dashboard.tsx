'use client'

import { useState, useEffect } from 'react'
import { Package, TrendingUp, AlertTriangle, DollarSign, BarChart3, PieChart, Activity } from 'lucide-react'
import { useProducts } from '@/contexts/ProductContextV3'
import { useCurrency } from '@/hooks/useCurrency'

interface DashboardProps {
  onAddProduct: () => void
  onSwitchToProducts: () => void
}

export default function Dashboard({ onAddProduct, onSwitchToProducts }: DashboardProps) {
  const { products } = useProducts()
  const { formatCurrency } = useCurrency()
  const [isHydrated, setIsHydrated] = useState(false)

  // Evitar erro de hidratação - só calcular estatísticas após hidratação no cliente
  useEffect(() => {
    setIsHydrated(true)
  }, [])

  // Calcular estatísticas em tempo real apenas após hidratação
  const totalProducts = isHydrated ? products.length : 0
  const totalValue = isHydrated ? products.reduce((sum, product) => sum + (product.quantity * product.price), 0) : 0
  const lowStockProducts = isHydrated ? products.filter(p => p.quantity <= p.minStock).length : 0
  const recentProducts = isHydrated ? products.slice(-5).reverse() : [] // Últimos 5 produtos adicionados
  
  // Estatísticas avançadas
  const categoriesData = isHydrated ? (() => {
    const categoryStats = products.reduce((acc, product) => {
      const category = product.category
      if (!acc[category]) {
        acc[category] = { count: 0, value: 0 }
      }
      acc[category].count += 1
      acc[category].value += product.quantity * product.price
      return acc
    }, {} as Record<string, { count: number; value: number }>)
    
    return Object.entries(categoryStats).map(([category, stats]) => ({
      category,
      count: stats.count,
      value: stats.value,
      percentage: (stats.count / products.length) * 100
    }))
  })() : []
  
  const topValueProducts = isHydrated ? products
    .sort((a, b) => (b.quantity * b.price) - (a.quantity * a.price))
    .slice(0, 5) : []
    
  const stockRiskLevel = isHydrated ? {
    critical: products.filter(p => p.quantity === 0).length,
    low: products.filter(p => p.quantity > 0 && p.quantity <= p.minStock).length,
    warning: products.filter(p => p.quantity > p.minStock && p.quantity <= p.minStock * 2).length,
    healthy: products.filter(p => p.quantity > p.minStock * 2).length
  } : { critical: 0, low: 0, warning: 0, healthy: 0 }

  const stats = [
    {
      title: 'Total de Produtos',
      value: totalProducts.toLocaleString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      change: '+12%',
      changeType: 'increase'
    },
    {
      title: 'Valor Total em Estoque',
      value: formatCurrency(totalValue),
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      change: '+8%',
      changeType: 'increase'
    },
    {
      title: 'Produtos em Baixa',
      value: lowStockProducts.toString(),
      icon: AlertTriangle,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      change: lowStockProducts > 0 ? '-5%' : '+100%',
      changeType: lowStockProducts > 0 ? 'decrease' : 'increase'
    },
    {
      title: 'Categorias',
      value: isHydrated ? new Set(products.map(p => p.category)).size.toString() : '0',
      icon: TrendingUp,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      change: '+15%',
      changeType: 'increase'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
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
                <span className={`text-sm font-medium ${
                  stat.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {stat.change}
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
                    <p className="font-bold text-green-600">{formatCurrency(product.quantity * product.price)}</p>
                    <p className="text-xs text-gray-500">{product.quantity} × {formatCurrency(product.price)}</p>
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
              {products.filter(p => p.quantity <= p.minStock).slice(0, 5).map((product) => (
                <button
                  key={product.id}
                  onClick={onSwitchToProducts}
                  className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors text-left ${
                    product.quantity === 0 
                      ? 'bg-red-50 hover:bg-red-100' 
                      : 'bg-orange-50 hover:bg-orange-100'
                  }`}
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.code} • {product.location}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${product.quantity === 0 ? 'text-red-600' : 'text-orange-600'}`}>
                      {product.quantity}
                    </p>
                    <p className="text-xs text-gray-500">Mín: {product.minStock}</p>
                  </div>
                </button>
              ))}
              {products.filter(p => p.quantity <= p.minStock).length === 0 && (
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
            onClick={() => {
              const report = `📊 RELATÓRIO ATUAL DO ESTOQUE\n\n` +
                `📦 PRODUTOS\n` +
                `• Total de produtos: ${totalProducts.toLocaleString()}\n` +
                `• Valor total: ${formatCurrency(totalValue)}\n` +
                `• Categorias: ${categoriesData.length}\n\n` +
                `⚠️ ALERTAS DE ESTOQUE\n` +
                `• Crítico (zerado): ${stockRiskLevel.critical}\n` +
                `• Baixo estoque: ${stockRiskLevel.low}\n` +
                `• Atenção: ${stockRiskLevel.warning}\n` +
                `• Saudável: ${stockRiskLevel.healthy}\n\n` +
                `🏆 TOP CATEGORIAS\n` +
                categoriesData.slice(0, 3).map((cat, idx) => 
                  `${idx + 1}. ${cat.category}: ${cat.count} produtos (${cat.percentage.toFixed(1)}%)`
                ).join('\n') +
                `\n\n📈 Relatório gerado em: ${new Date().toLocaleString('pt-BR')}`
              
              alert(report)
            }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center group"
          >
            <BarChart3 className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">Relatório Detalhado</p>
          </button>
        </div>
      </div>
    </div>
  )
} 