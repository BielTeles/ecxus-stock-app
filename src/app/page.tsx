'use client'

import { useState } from 'react'
import { Plus, Search, Package, AlertTriangle, BarChart3, Settings } from 'lucide-react'
import ProductList from '@/components/ProductList'
import AddProductModal from '@/components/AddProductModal'
import Dashboard from '@/components/Dashboard'
import SettingsTab from '@/components/SettingsTab'
import NoSSR from '@/components/NoSSR'
import DashboardSkeleton from '@/components/DashboardSkeleton'
import ProductListSkeleton from '@/components/ProductListSkeleton'

export default function Home() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'products', label: 'Produtos', icon: Package },
    { id: 'alerts', label: 'Alertas', icon: AlertTriangle },
    { id: 'settings', label: 'Configurações', icon: Settings },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-3">
                <Package className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-gray-900">Ecxus Stock</h1>
                  <p className="text-sm text-gray-500">Gerenciamento de Componentes Eletrônicos</p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar produtos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
              >
                <Plus className="h-4 w-4" />
                <span>Novo Produto</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <NoSSR fallback={<DashboardSkeleton />}>
            <Dashboard 
              onAddProduct={() => setIsAddModalOpen(true)}
              onSwitchToProducts={() => setActiveTab('products')}
            />
          </NoSSR>
        )}
        {activeTab === 'products' && (
          <NoSSR fallback={<ProductListSkeleton />}>
            <ProductList searchTerm={searchTerm} />
          </NoSSR>
        )}
        {activeTab === 'alerts' && (
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Alertas de Estoque</h2>
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="h-12 w-12 mx-auto mb-4 text-orange-400" />
              <p>Nenhum alerta no momento</p>
            </div>
          </div>
        )}
        {activeTab === 'settings' && <SettingsTab />}
      </main>

      {/* Add Product Modal */}
      <AddProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  )
}
