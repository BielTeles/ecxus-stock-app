'use client'

import { TrendingUp, Users, DollarSign, Clock, Award, Star } from 'lucide-react'
import { useSuppliers } from '@/contexts/SupplierContext'

export default function SupplierAnalytics() {
  const { suppliers, purchaseOrders, getSupplierPerformance } = useSuppliers()

  // Calcular métricas gerais
  const totalSuppliers = suppliers.length
  const activeSuppliers = suppliers.filter(s => s.status === 'ACTIVE').length
  const totalPurchaseValue = purchaseOrders.reduce((sum, po) => sum + po.total, 0)
  const averageRating = suppliers.length > 0 
    ? suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length 
    : 0

  // Top fornecedores por performance
  const topSuppliers = suppliers
    .map(supplier => ({
      ...supplier,
      performance: getSupplierPerformance(supplier.id)
    }))
    .filter(s => s.performance.totalOrders > 0)
    .sort((a, b) => b.performance.onTimePercentage - a.performance.onTimePercentage)
    .slice(0, 5)

  // Fornecedores por valor total
  const suppliersByValue = suppliers
    .map(supplier => ({
      ...supplier,
      performance: getSupplierPerformance(supplier.id)
    }))
    .filter(s => s.performance.totalOrders > 0)
    .sort((a, b) => b.performance.totalValue - a.performance.totalValue)
    .slice(0, 5)

  // Distribuição por rating
  const ratingDistribution = [1, 2, 3, 4, 5].map(rating => ({
    rating,
    count: suppliers.filter(s => Math.floor(s.rating) === rating).length,
    percentage: suppliers.length > 0 
      ? (suppliers.filter(s => Math.floor(s.rating) === rating).length / suppliers.length) * 100 
      : 0
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-semibold text-gray-900">Análises de Fornecedores</h2>
        <p className="text-sm text-gray-600">Relatórios e métricas de performance dos fornecedores</p>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Fornecedores</p>
              <p className="text-2xl font-bold text-gray-900">{totalSuppliers}</p>
              <p className="text-sm text-green-600">{activeSuppliers} ativos</p>
            </div>
            <Users className="h-8 w-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total Compras</p>
              <p className="text-2xl font-bold text-gray-900">R$ {totalPurchaseValue.toFixed(2)}</p>
              <p className="text-sm text-gray-500">{purchaseOrders.length} pedidos</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Rating Médio</p>
              <p className="text-2xl font-bold text-gray-900">{averageRating.toFixed(1)}</p>
              <div className="flex items-center space-x-1">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star
                    key={i}
                    className={`h-3 w-3 ${
                      i < Math.floor(averageRating) ? 'text-yellow-400 fill-current' : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
            <Award className="h-8 w-8 text-yellow-600" />
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Lead Time Médio</p>
              <p className="text-2xl font-bold text-gray-900">
                {suppliers.length > 0 
                  ? Math.round(suppliers.reduce((sum, s) => sum + s.commercialTerms.leadTimeDays, 0) / suppliers.length)
                  : 0} dias
              </p>
              <p className="text-sm text-gray-500">Tempo de entrega</p>
            </div>
            <Clock className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Fornecedores por Performance */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
              Top Performance (Pontualidade)
            </h3>
          </div>
          <div className="p-6">
            {topSuppliers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum dado de performance disponível</p>
            ) : (
              <div className="space-y-4">
                {topSuppliers.map((supplier, index) => (
                  <div key={supplier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                        ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{supplier.name}</p>
                        <p className="text-sm text-gray-600">{supplier.performance.totalOrders} pedidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">{supplier.performance.onTimePercentage.toFixed(1)}%</p>
                      <p className="text-xs text-gray-500">pontualidade</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Top Fornecedores por Valor */}
        <div className="bg-white rounded-lg border border-gray-200">
          <div className="p-6 border-b">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <DollarSign className="h-5 w-5 text-green-600 mr-2" />
              Top Valor de Compras
            </h3>
          </div>
          <div className="p-6">
            {suppliersByValue.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum pedido registrado</p>
            ) : (
              <div className="space-y-4">
                {suppliersByValue.map((supplier, index) => (
                  <div key={supplier.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`
                        w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white
                        ${index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-500' : 'bg-blue-500'}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{supplier.name}</p>
                        <p className="text-sm text-gray-600">{supplier.performance.totalOrders} pedidos</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">R$ {supplier.performance.totalValue.toFixed(2)}</p>
                      <p className="text-xs text-gray-500">valor total</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Distribuição de Ratings */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Star className="h-5 w-5 text-yellow-600 mr-2" />
            Distribuição de Ratings
          </h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {ratingDistribution.reverse().map((item) => (
              <div key={item.rating} className="flex items-center space-x-4">
                <div className="flex items-center space-x-1 w-16">
                  <span className="text-sm font-medium">{item.rating}</span>
                  <Star className="h-4 w-4 text-yellow-400 fill-current" />
                </div>
                <div className="flex-1">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
                <div className="w-16 text-right">
                  <span className="text-sm text-gray-600">{item.count} ({item.percentage.toFixed(1)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Status dos Fornecedores */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">Status dos Fornecedores</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {suppliers.filter(s => s.status === 'ACTIVE').length}
              </div>
              <div className="text-sm text-green-800">Ativos</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-600">
                {suppliers.filter(s => s.status === 'INACTIVE').length}
              </div>
              <div className="text-sm text-gray-800">Inativos</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">
                {suppliers.filter(s => s.status === 'BLOCKED').length}
              </div>
              <div className="text-sm text-red-800">Bloqueados</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 