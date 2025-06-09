'use client'

import { useState } from 'react'
import { 
  Users, 
  ShoppingCart, 
  FileText, 
  TrendingUp, 
  AlertTriangle,
  Search,
  Filter
} from 'lucide-react'
import { useSuppliers } from '@/contexts/SupplierContext'
import SupplierList from './suppliers/SupplierList'
import PurchaseOrderList from './suppliers/PurchaseOrderList'
import QuotesList from './suppliers/QuotesList'
import SupplierAnalytics from './suppliers/SupplierAnalytics'
import StockAlerts from './suppliers/StockAlerts'

type SupplierTab = 'suppliers' | 'orders' | 'quotes' | 'analytics' | 'alerts'

export default function SupplierManagement() {
  const [activeTab, setActiveTab] = useState<SupplierTab>('suppliers')
  const [searchTerm, setSearchTerm] = useState('')
  const { suppliers, purchaseOrders, quotes, stockAlerts } = useSuppliers()

  const tabs = [
    {
      id: 'suppliers' as SupplierTab,
      label: 'Fornecedores',
      icon: Users,
      count: suppliers.length,
      color: 'blue'
    },
    {
      id: 'orders' as SupplierTab,
      label: 'Pedidos de Compra',
      icon: ShoppingCart,
      count: purchaseOrders.filter(po => !['COMPLETED', 'CANCELLED'].includes(po.status)).length,
      color: 'green'
    },
    {
      id: 'quotes' as SupplierTab,
      label: 'Cotações',
      icon: FileText,
      count: quotes.filter(q => q.status === 'PENDING').length,
      color: 'purple'
    },
    {
      id: 'analytics' as SupplierTab,
      label: 'Análises',
      icon: TrendingUp,
      count: 0,
      color: 'indigo'
    },
    {
      id: 'alerts' as SupplierTab,
      label: 'Alertas',
      icon: AlertTriangle,
      count: stockAlerts.filter(alert => alert.status === 'ACTIVE').length,
      color: 'red'
    }
  ]

  const getTabColorClasses = (color: string, isActive: boolean) => {
    const colors = {
      blue: isActive ? 'bg-blue-100 text-blue-800 border-blue-200' : 'text-blue-600 hover:bg-blue-50',
      green: isActive ? 'bg-green-100 text-green-800 border-green-200' : 'text-green-600 hover:bg-green-50',
      purple: isActive ? 'bg-purple-100 text-purple-800 border-purple-200' : 'text-purple-600 hover:bg-purple-50',
      indigo: isActive ? 'bg-indigo-100 text-indigo-800 border-indigo-200' : 'text-indigo-600 hover:bg-indigo-50',
      red: isActive ? 'bg-red-100 text-red-800 border-red-200' : 'text-red-600 hover:bg-red-50'
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Fornecedores e Compras</h1>
          <p className="text-gray-600">Gestão completa de fornecedores, pedidos e cotações</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                  isActive
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTabColorClasses(tab.color, false)}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Search and Filter Bar */}
      {(activeTab === 'suppliers' || activeTab === 'orders' || activeTab === 'quotes') && (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex items-center space-x-4 flex-1">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder={`Buscar ${activeTab === 'suppliers' ? 'fornecedores' : 
                                       activeTab === 'orders' ? 'pedidos' : 'cotações'}...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <Filter className="h-5 w-5 text-gray-400" />
                <span className="text-gray-600">Filtros</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="min-h-96">
        {activeTab === 'suppliers' && (
          <SupplierList searchTerm={searchTerm} />
        )}
        {activeTab === 'orders' && (
          <PurchaseOrderList searchTerm={searchTerm} />
        )}
        {activeTab === 'quotes' && (
          <QuotesList searchTerm={searchTerm} />
        )}
        {activeTab === 'analytics' && (
          <SupplierAnalytics />
        )}
        {activeTab === 'alerts' && (
          <StockAlerts />
        )}
      </div>
    </div>
  )
} 