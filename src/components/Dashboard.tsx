'use client'

import { useState, useEffect } from 'react'
import { Package, TrendingUp, AlertTriangle, DollarSign, BarChart3 } from 'lucide-react'
import { useProducts } from '@/contexts/ProductContext'

interface DashboardProps {
  onAddProduct: () => void
  onSwitchToProducts: () => void
}

export default function Dashboard({ onAddProduct, onSwitchToProducts }: DashboardProps) {
  const { products } = useProducts()
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
      value: `R$ ${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
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

      {/* Recent Activity and Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Low Stock Alert */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
              Produtos com Estoque Baixo
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentProducts.filter(p => p.quantity <= p.minStock).map((product) => (
                <button
                  key={product.id}
                  onClick={onSwitchToProducts}
                  className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.code} • {product.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-orange-600">{product.quantity}</p>
                    <p className="text-xs text-gray-500">Mín: {product.minStock}</p>
                  </div>
                </button>
              ))}
              {recentProducts.filter(p => p.quantity <= p.minStock).length === 0 && (
                <div className="text-center py-4">
                  <p className="text-sm text-gray-500">✅ Todos os produtos estão com estoque adequado!</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <BarChart3 className="h-5 w-5 text-blue-500 mr-2" />
              Produtos Recentes
            </h3>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentProducts.slice(0, 4).map((product) => (
                <button
                  key={product.id}
                  onClick={onSwitchToProducts}
                  className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                >
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.code} • {product.location}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{product.quantity}</p>
                    <p className="text-xs text-gray-500">unidades</p>
                  </div>
                </button>
              ))}
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
              alert('📊 Relatório Mensal\n\n• Total de produtos: 1,234\n• Valor em estoque: R$ 45.678,90\n• Produtos em baixa: 23\n• Movimentações: 156\n\nFuncionalidade completa em breve!')
            }}
            className="p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-center group"
          >
            <BarChart3 className="h-8 w-8 text-gray-400 group-hover:text-purple-500 mx-auto mb-2 transition-colors" />
            <p className="text-sm font-medium text-gray-600 group-hover:text-purple-600 transition-colors">Análise Mensal</p>
          </button>
        </div>
      </div>
    </div>
  )
} 