'use client'

import { useState } from 'react'
import { BarChart3, Download, TrendingUp, Package, Factory, Users, AlertTriangle, Calendar, FileText, Eye } from 'lucide-react'
import { useProducts } from '@/contexts/ProductContextV3'
import { useProduction } from '@/contexts/ProductionContext'
import { useProductionOrders } from '@/contexts/ProductionOrderContext'
import { useSuppliers } from '@/contexts/SupplierContext'
import { useAlerts } from '@/contexts/AlertContext'

type ReportType = 'inventory' | 'production' | 'orders' | 'suppliers' | 'alerts' | 'comprehensive'

export default function ReportsCenter() {
  const [selectedReport, setSelectedReport] = useState<ReportType>('comprehensive')
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  const { products } = useProducts()
  const { finishedProducts, getDashboardData } = useProduction()
  const { productionOrders, getProductionMetrics } = useProductionOrders()
  const { suppliers, getSupplierPerformance } = useSuppliers()
  const { alerts } = useAlerts()
  const productionData = getDashboardData()
  const orderMetrics = getProductionMetrics()

  const generateInventoryReport = () => {
    const totalProducts = products.length
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0)
    const lowStockProducts = products.filter(p => p.quantity <= p.minStock).length
    const zeroStockProducts = products.filter(p => p.quantity === 0).length
    
    const categoryBreakdown = products.reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const topValueProducts = products
      .map(p => ({ ...p, totalValue: p.quantity * p.costPrice }))
      .sort((a, b) => b.totalValue - a.totalValue)
      .slice(0, 10)

    return {
      summary: {
        totalProducts,
        totalValue,
        lowStockProducts,
        zeroStockProducts,
        healthyStock: totalProducts - lowStockProducts
      },
      categoryBreakdown,
      topValueProducts,
      alertsCount: {
        critical: zeroStockProducts,
        warning: lowStockProducts - zeroStockProducts,
        healthy: totalProducts - lowStockProducts
      }
    }
  }

  const generateProductionReport = () => {
    const totalFinishedProducts = finishedProducts.length
    const activeProducts = finishedProducts.filter(p => p.status === 'ACTIVE').length
    const totalProductionValue = finishedProducts.reduce((sum, p) => sum + p.sellPrice, 0)

    const productionCapacity = finishedProducts.map(product => {
      const components = product.bom || []
      let maxProducible = Infinity
      
      components.forEach(bomItem => {
        const component = products.find(p => p.id === bomItem.componentId)
        if (component) {
          const possible = Math.floor(component.quantity / bomItem.quantity)
          maxProducible = Math.min(maxProducible, possible)
        }
      })
      
      return {
        ...product,
        maxProducible: maxProducible === Infinity ? 0 : maxProducible,
        potentialRevenue: (maxProducible === Infinity ? 0 : maxProducible) * product.sellPrice
      }
    }).sort((a, b) => b.potentialRevenue - a.potentialRevenue)

    return {
      summary: {
        totalFinishedProducts,
        activeProducts,
        totalProductionValue,
        totalPotentialRevenue: productionCapacity.reduce((sum, p) => sum + p.potentialRevenue, 0)
      },
      productionCapacity: productionCapacity.slice(0, 10),
      profitAnalysis: productionCapacity.map(p => ({
        name: p.name,
        profitMargin: p.sellPrice > 0 ? ((p.sellPrice - p.costPrice) / p.sellPrice * 100).toFixed(1) : '0',
        profit: p.sellPrice - p.costPrice,
        maxProducible: p.maxProducible
      }))
    }
  }

  const generateOrdersReport = () => {
    const totalOrders = productionOrders.length
    const completedOrders = productionOrders.filter(o => o.status === 'COMPLETED')
    const onTimeOrders = completedOrders.filter(o => 
      o.actualEndDate && o.plannedEndDate && 
      new Date(o.actualEndDate) <= new Date(o.plannedEndDate)
    )
    
    const efficiency = completedOrders.length > 0 ? (onTimeOrders.length / completedOrders.length * 100) : 0

    return {
      summary: {
        totalOrders,
        completedOrders: completedOrders.length,
        onTimeDelivery: efficiency,
        averageCompletionTime: orderMetrics.averageCompletionTime || 0
      },
      statusBreakdown: {
        planned: productionOrders.filter(o => o.status === 'PLANNED').length,
        inProgress: productionOrders.filter(o => o.status === 'IN_PROGRESS').length,
        completed: completedOrders.length
      }
    }
  }

  const generateSuppliersReport = () => {
    const totalSuppliers = suppliers.length
    const activeSuppliers = suppliers.filter(s => s.status === 'ACTIVE').length
    const averageRating = suppliers.length > 0 
      ? suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length 
      : 0

    const topSuppliers = suppliers
      .map(supplier => ({
        ...supplier,
        performance: getSupplierPerformance(supplier.id)
      }))
      .sort((a, b) => b.performance.onTimePercentage - a.performance.onTimePercentage)
      .slice(0, 5)

    return {
      summary: {
        totalSuppliers,
        activeSuppliers,
        averageRating: averageRating.toFixed(1)
      },
      topSuppliers,
      ratingDistribution: [1, 2, 3, 4, 5].map(rating => ({
        rating,
        count: suppliers.filter(s => Math.floor(s.rating) === rating).length
      }))
    }
  }

  const generateAlertsReport = () => {
    const totalAlerts = alerts.length
    const activeAlerts = alerts.filter(a => a.isActive).length
    const resolvedAlerts = alerts.filter(a => !a.isActive && a.resolvedAt).length

    const severityBreakdown = alerts.reduce((acc, alert) => {
      acc[alert.severity] = (acc[alert.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const typeBreakdown = alerts.reduce((acc, alert) => {
      acc[alert.type] = (acc[alert.type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return {
      summary: {
        totalAlerts,
        activeAlerts,
        resolvedAlerts,
        resolutionRate: totalAlerts > 0 ? (resolvedAlerts / totalAlerts * 100).toFixed(1) : '0'
      },
      severityBreakdown,
      typeBreakdown,
      recentAlerts: alerts.slice(0, 10)
    }
  }

  const generateComprehensiveReport = () => {
    return {
      inventory: generateInventoryReport(),
      production: generateProductionReport(),
      orders: generateOrdersReport(),
      suppliers: generateSuppliersReport(),
      alerts: generateAlertsReport(),
      generatedAt: new Date().toISOString(),
      dateRange
    }
  }

  const exportReport = (type: ReportType) => {
    let reportData
    
    switch (type) {
      case 'inventory':
        reportData = generateInventoryReport()
        break
      case 'production':
        reportData = generateProductionReport()
        break
      case 'orders':
        reportData = generateOrdersReport()
        break
      case 'suppliers':
        reportData = generateSuppliersReport()
        break
      case 'alerts':
        reportData = generateAlertsReport()
        break
      case 'comprehensive':
        reportData = generateComprehensiveReport()
        break
      default:
        reportData = generateComprehensiveReport()
    }

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `relatorio_${type}_${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const exportToCSV = (type: ReportType) => {
    const data = type === 'inventory' ? products : 
                 type === 'production' ? finishedProducts :
                 type === 'orders' ? productionOrders :
                 type === 'suppliers' ? suppliers :
                 alerts

    const headers = Object.keys(data[0] || {})
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = (row as any)[header]
          return typeof value === 'string' ? `"${value.replace(/"/g, '""')}"` : value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `dados_${type}_${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const reportTypes = [
    { id: 'comprehensive', label: 'Relatório Completo', icon: FileText, color: 'purple' },
    { id: 'inventory', label: 'Estoque', icon: Package, color: 'blue' },
    { id: 'production', label: 'Produção', icon: Factory, color: 'green' },
    { id: 'orders', label: 'Ordens', icon: BarChart3, color: 'yellow' },
    { id: 'suppliers', label: 'Fornecedores', icon: Users, color: 'indigo' },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle, color: 'red' }
  ]

  const getCurrentReport = () => {
    switch (selectedReport) {
      case 'inventory': return generateInventoryReport()
      case 'production': return generateProductionReport()
      case 'orders': return generateOrdersReport()
      case 'suppliers': return generateSuppliersReport()
      case 'alerts': return generateAlertsReport()
      default: return generateComprehensiveReport()
    }
  }

  const currentReport = getCurrentReport()

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <BarChart3 className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Centro de Relatórios</h1>
            <p className="text-gray-600">Análises completas e exportação de dados</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => exportReport(selectedReport)}
            className="flex items-center space-x-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar JSON</span>
          </button>
          <button
            onClick={() => exportToCSV(selectedReport)}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
          >
            <Download className="h-4 w-4" />
            <span>Exportar CSV</span>
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Filtros de Relatório</h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              />
              <span className="text-gray-500">até</span>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                className="border border-gray-300 rounded px-3 py-1 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {reportTypes.map(type => {
            const Icon = type.icon
            return (
              <button
                key={type.id}
                onClick={() => setSelectedReport(type.id as ReportType)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedReport === type.id
                    ? `border-${type.color}-500 bg-${type.color}-50`
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <Icon className={`h-6 w-6 mx-auto mb-2 ${
                  selectedReport === type.id ? `text-${type.color}-600` : 'text-gray-400'
                }`} />
                <p className={`text-sm font-medium ${
                  selectedReport === type.id ? `text-${type.color}-800` : 'text-gray-600'
                }`}>
                  {type.label}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Relatório Atual */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {reportTypes.find(t => t.id === selectedReport)?.label || 'Relatório'}
            </h2>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Eye className="h-4 w-4" />
              <span>Atualizado em {new Date().toLocaleString('pt-BR')}</span>
            </div>
          </div>
        </div>

        <div className="p-6">
          {selectedReport === 'comprehensive' && (
            <div className="space-y-8">
              {/* Resumo Executivo */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumo Executivo</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600">Total Produtos</p>
                        <p className="text-2xl font-bold text-blue-900">{products.length}</p>
                      </div>
                      <Package className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600">Produtos Acabados</p>
                        <p className="text-2xl font-bold text-green-900">{finishedProducts.length}</p>
                      </div>
                      <Factory className="h-8 w-8 text-green-600" />
                    </div>
                  </div>
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-purple-600">Ordens Produção</p>
                        <p className="text-2xl font-bold text-purple-900">{productionOrders.length}</p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600">Alertas Ativos</p>
                        <p className="text-2xl font-bold text-red-900">
                          {alerts.filter(a => a.status === 'ACTIVE').length}
                        </p>
                      </div>
                      <AlertTriangle className="h-8 w-8 text-red-600" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Insights Principais */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Insights Principais</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <h4 className="font-medium text-yellow-800 mb-2">⚠️ Atenção Necessária</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                      <li>• {products.filter(p => p.quantity === 0).length} produtos em falta</li>
                      <li>• {products.filter(p => p.quantity <= p.minStock).length} produtos com estoque baixo</li>
                      <li>• {alerts.filter(a => a.status === 'ACTIVE' && a.priority === 'HIGH').length} alertas de alta prioridade</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-medium text-green-800 mb-2">✅ Pontos Positivos</h4>
                    <ul className="text-sm text-green-700 space-y-1">
                      <li>• {suppliers.filter(s => s.status === 'ACTIVE').length} fornecedores ativos</li>
                      <li>• {productionOrders.filter(o => o.status === 'COMPLETED').length} ordens concluídas</li>
                      <li>• {Math.round(orderMetrics.efficiency)}% eficiência média</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Relatórios Específicos */}
          {selectedReport === 'inventory' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-600">Total de Produtos</p>
                  <p className="text-2xl font-bold text-gray-900">{(currentReport as any).summary.totalProducts}</p>
                </div>
                <div className="bg-green-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-green-600">Valor Total</p>
                  <p className="text-2xl font-bold text-green-900">R$ {(currentReport as any).summary.totalValue.toFixed(2)}</p>
                </div>
                <div className="bg-yellow-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-yellow-600">Estoque Baixo</p>
                  <p className="text-2xl font-bold text-yellow-900">{(currentReport as any).summary.lowStockProducts}</p>
                </div>
                <div className="bg-red-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-red-600">Sem Estoque</p>
                  <p className="text-2xl font-bold text-red-900">{(currentReport as any).summary.zeroStockProducts}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Top 10 Produtos por Valor</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Produto</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantidade</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Unit.</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Valor Total</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {(currentReport as any).topValueProducts.map((product: any, index: number) => (
                        <tr key={product.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500">{product.code}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{product.quantity}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">R$ {product.costPrice.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">R$ {product.totalValue.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Continuar com outros tipos de relatório... */}
        </div>
      </div>
    </div>
  )
}