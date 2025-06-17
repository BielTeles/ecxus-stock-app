'use client'

import { useState, useMemo, useCallback, memo, useRef } from 'react'
import { Edit, Trash2, MapPin, Package, Filter, Eye, Copy, Grid3X3, List, TrendingUp, TrendingDown, Minus, DollarSign, Calendar, Search, X, SlidersHorizontal, Download, Upload, ArrowUpCircle, ArrowDownCircle, History, Plus, Check, AlertCircle, Zap, RotateCcw } from 'lucide-react'
import { useProducts } from '@/contexts/ProductContextV3'
import type { Database } from '@/lib/supabase'

type Product = Database['public']['Tables']['products']['Row']
import { useSettings } from '@/contexts/SettingsContext'
import { useCurrency } from '@/hooks/useCurrency'
import EditProductModal from './EditProductModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import ProductDetailsModal from './ProductDetailsModal'

interface ProductListProps {
  searchTerm: string
}

type ViewMode = 'grid' | 'list'
type SortOption = 'name' | 'quantity' | 'price' | 'updated' | 'category'
type StockFilter = 'all' | 'low' | 'adequate' | 'critical'

// Tipos para movimentação
interface StockMovement {
  id: string
  productId: number
  type: 'entrada' | 'saida'
  quantity: number
  reason: string
  date: string
  previousQuantity: number
  newQuantity: number
}

function ProductList({ searchTerm }: ProductListProps) {
  const { products, addProduct, deleteProduct, updateProduct } = useProducts()
  
  // Funções de exportação e importação locais
  const exportData = useCallback(() => {
    const exportData = {
      products,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    return JSON.stringify(exportData, null, 2)
  }, [products])

  const importData = useCallback((data: string): boolean => {
    try {
      const parsed = JSON.parse(data)
      
      if (!parsed.products || !Array.isArray(parsed.products)) {
        throw new Error('Formato de dados inválido: produtos não encontrados')
      }

      // Aqui seria necessário implementar a importação real
      // Por enquanto, apenas retornamos false para indicar que não foi implementado
      console.warn('Importação não implementada no ProductContextV3')
      return false
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      return false
    }
  }, [])
  const { settings } = useSettings()
  const { formatCurrency } = useCurrency()
  
  // Estados de UI
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [stockFilter, setStockFilter] = useState<StockFilter>('all')
  const [sortBy, setSortBy] = useState<SortOption>('name')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000])
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  
  // Estados de modais
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [stockMovementProduct, setStockMovementProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)
  const [isStockMovementModalOpen, setIsStockMovementModalOpen] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)

  // Novos estados para melhorias
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set())
  const [isBulkMode, setIsBulkMode] = useState(false)
  const [editingQuantity, setEditingQuantity] = useState<{ [key: number]: number }>({})
  const [movementHistory, setMovementHistory] = useState<StockMovement[]>([])
  const [quickMovementType, setQuickMovementType] = useState<'entrada' | 'saida'>('entrada')
  const [showMovementHistory, setShowMovementHistory] = useState(false)
  
  // Refs para inputs inline
  const quantityInputRefs = useRef<{ [key: number]: HTMLInputElement | null }>({})

  // Funções de manipulação
  const handleViewProduct = (product: Product) => {
    setViewingProduct(product)
    setIsDetailsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setEditingProduct(product)
    setIsEditModalOpen(true)
  }

  const handleDeleteProduct = (product: Product) => {
    setDeletingProduct(product)
    setIsDeleteModalOpen(true)
  }

  const handleDuplicateProduct = (product: Product) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...productWithoutId } = product
    const duplicatedProduct = {
      ...productWithoutId,
      name: `${product.name} (Cópia)`,
      code: `${product.code}-COPY`,
      quantity: 0,
      min_stock: settings.minStockDefault,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    addProduct(duplicatedProduct)
  }

  const confirmDeleteProduct = () => {
    if (deletingProduct) {
      deleteProduct(deletingProduct.id)
    }
  }

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false)
    setEditingProduct(null)
  }

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setDeletingProduct(null)
  }

  const handleCloseDetailsModal = () => {
    setIsDetailsModalOpen(false)
    setViewingProduct(null)
  }

  // Novas funcionalidades melhoradas
  const handleStockMovement = (product: Product) => {
    setStockMovementProduct(product)
    setIsStockMovementModalOpen(true)
  }

  const handleCloseStockMovementModal = () => {
    setIsStockMovementModalOpen(false)
    setStockMovementProduct(null)
  }

  // Ação rápida de entrada/saída
  const handleQuickStockAction = (product: Product, type: 'entrada' | 'saida', quantity: number = 1) => {
    const newQuantity = type === 'entrada' 
      ? (product.quantity || 0) + quantity
      : Math.max(0, (product.quantity || 0) - quantity)
    
    updateProduct(product.id, { quantity: newQuantity })
    
    // Registrar no histórico
    const movement: StockMovement = {
      id: Date.now().toString(),
      productId: product.id,
      type,
      quantity,
      reason: `Ação rápida - ${type}`,
      date: new Date().toISOString(),
      previousQuantity: product.quantity || 0,
      newQuantity
    }
    
    setMovementHistory(prev => [movement, ...prev.slice(0, 49)]) // Manter apenas os últimos 50
    
    // Feedback visual rápido
    const element = document.getElementById(`product-${product.id}`)
    if (element) {
      element.classList.add('bg-green-50', 'border-green-200')
      setTimeout(() => {
        element.classList.remove('bg-green-50', 'border-green-200')
      }, 1000)
    }
  }

  // Edição inline de quantidade
  const handleInlineQuantityEdit = (productId: number, newQuantity: number) => {
    const product = products.find(p => p.id === productId)
    if (!product) return
    
    updateProduct(productId, { quantity: Math.max(0, newQuantity) })
    
    // Registrar movimento se houve mudança significativa
    const difference = newQuantity - (product.quantity || 0)
    if (difference !== 0) {
      const movement: StockMovement = {
        id: Date.now().toString(),
        productId,
        type: difference > 0 ? 'entrada' : 'saida',
        quantity: Math.abs(difference),
        reason: 'Ajuste manual',
        date: new Date().toISOString(),
        previousQuantity: product.quantity || 0,
        newQuantity
      }
      
      setMovementHistory(prev => [movement, ...prev.slice(0, 49)])
    }
    
    setEditingQuantity(prev => {
      const newState = { ...prev }
      delete newState[productId]
      return newState
    })
  }

  // Seleção múltipla
  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(productId)) {
        newSet.delete(productId)
      } else {
        newSet.add(productId)
      }
      return newSet
    })
  }

  // Ação em lote
  const handleBulkStockAction = (type: 'entrada' | 'saida', quantity: number) => {
    const selectedProductsList = products.filter(p => selectedProducts.has(p.id))
    
    selectedProductsList.forEach(product => {
      handleQuickStockAction(product, type, quantity)
    })
    
    setSelectedProducts(new Set())
    setIsBulkMode(false)
  }

  const handleExportData = () => {
    try {
      const dataStr = exportData()
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ecxus-stock-produtos-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      alert('✅ Dados exportados com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar:', error)
      alert('❌ Erro ao exportar dados')
    }
  }

  const handleExportCSV = () => {
    try {
      const csvContent = [
        ['Nome', 'Código', 'Categoria', 'Quantidade', 'Preço', 'Localização', 'Fornecedor', 'Est. Mínimo'].join(','),
        ...filteredProducts.map(product => [
          `"${product.name}"`,
          `"${product.code}"`,
          `"${product.category}"`,
          product.quantity || 0,
          product.sell_price || 0,
          `"${product.location}"`,
          `"${product.supplier || ''}"`,
          product.min_stock || 0
        ].join(','))
      ].join('\n')

      const dataBlob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(dataBlob)
      const link = document.createElement('a')
      link.href = url
      link.download = `ecxus-stock-produtos-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      alert('✅ CSV exportado com sucesso!')
    } catch (error) {
      console.error('Erro ao exportar CSV:', error)
      alert('❌ Erro ao exportar CSV')
    }
  }

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string
        const success = importData(content)
        if (success) {
          alert('✅ Dados importados com sucesso!')
          setIsImportModalOpen(false)
        } else {
          alert('❌ Erro ao importar dados. Verifique o formato do arquivo.')
        }
      } catch (error) {
        console.error('Erro ao importar:', error)
        alert('❌ Erro ao ler arquivo')
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleSort = (field: SortOption) => {
    if (sortBy === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDirection('asc')
    }
  }

  // Função auxiliar para status do estoque
  const getStockStatus = (quantity: number, minStock: number) => {
    const safeQuantity = quantity || 0
    const safeMinStock = minStock || 1
    if (safeQuantity <= safeMinStock) return { status: 'low', color: 'text-red-600 bg-red-100 border-red-200' }
    if (safeQuantity <= safeMinStock * 1.5) return { status: 'medium', color: 'text-orange-600 bg-orange-100 border-orange-200' }
    return { status: 'good', color: 'text-green-600 bg-green-100 border-green-200' }
  }

  // Computações de dados
  const categories = useMemo(() => ['all', ...Array.from(new Set(products.map(p => p.category)))], [products])
  
  const maxPrice = useMemo(() => Math.max(...products.map(p => p.sell_price || 0), 1000), [products])

  const filteredProducts = useMemo(() => {
    return products
      .filter(product => {
        const matchesSearch = 
          product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
          product.supplier?.toLowerCase().includes(searchTerm.toLowerCase())
        
        const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
        
        const matchesPrice = (product.sell_price || 0) >= priceRange[0] && (product.sell_price || 0) <= priceRange[1]
        
        const stockStatus = getStockStatus(product.quantity || 0, product.min_stock || 1).status
        const matchesStock = stockFilter === 'all' || 
          (stockFilter === 'critical' && stockStatus === 'low') ||
          (stockFilter === 'low' && (stockStatus === 'low' || stockStatus === 'medium')) ||
          (stockFilter === 'adequate' && stockStatus === 'good')
        
        return matchesSearch && matchesCategory && matchesPrice && matchesStock
      })
      .sort((a, b) => {
        let comparison = 0
        
        switch (sortBy) {
          case 'name':
            comparison = a.name.localeCompare(b.name)
            break
          case 'quantity':
            comparison = (a.quantity || 0) - (b.quantity || 0)
            break
          case 'price':
            comparison = (a.sell_price || 0) - (b.sell_price || 0)
            break
          case 'updated':
            comparison = new Date(a.updated_at).getTime() - new Date(b.updated_at).getTime()
            break
          case 'category':
            comparison = a.category.localeCompare(b.category)
            break
        }
        
        return sortDirection === 'asc' ? comparison : -comparison
      })
  }, [products, searchTerm, selectedCategory, stockFilter, priceRange, sortBy, sortDirection])

  // Estatísticas
  const stats = useMemo(() => {
    const totalProducts = products.length
    const lowStockProducts = products.filter(p => (p.quantity || 0) <= (p.min_stock || 1)).length
    const totalValue = products.reduce((sum, p) => sum + (p.quantity || 0) * (p.sell_price || 0), 0)
    const averagePrice = products.length > 0 ? products.reduce((sum, p) => sum + (p.sell_price || 0), 0) / products.length : 0
    
    return {
      totalProducts,
      lowStockProducts,
      totalValue,
      averagePrice,
      adequateStock: totalProducts - lowStockProducts
    }
  }, [products])

  return (
    <div className="space-y-6">
      {/* Statistics Header */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Produtos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
            <Package className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Estoque Baixo</p>
              <p className="text-2xl font-bold text-red-600">{stats.lowStockProducts}</p>
            </div>
            <TrendingDown className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Preço Médio</p>
              <p className="text-2xl font-bold text-purple-600">{formatCurrency(stats.averagePrice)}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col xl:flex-row gap-4 items-start xl:items-center justify-between">
          {/* Left Side - Filters */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as Categorias</option>
                {categories.filter(cat => cat !== 'all').map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
            
            <select
              value={stockFilter}
              onChange={(e) => setStockFilter(e.target.value as StockFilter)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Todos Estoques</option>
              <option value="critical">Crítico</option>
              <option value="low">Baixo</option>
              <option value="adequate">Adequado</option>
            </select>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
                showAdvancedFilters 
                  ? 'border-blue-500 text-blue-600 bg-blue-50' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span>Filtros</span>
            </button>
          </div>

          {/* Right Side - View Controls */}
          <div className="flex items-center space-x-4">
            {/* Modo Lote */}
            <button
              onClick={() => setIsBulkMode(!isBulkMode)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
                isBulkMode 
                  ? 'border-purple-500 text-purple-600 bg-purple-50' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <Zap className="h-4 w-4" />
              <span>Lote</span>
              {selectedProducts.size > 0 && (
                <span className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                  {selectedProducts.size}
                </span>
              )}
            </button>

            {/* Histórico */}
            <button
              onClick={() => setShowMovementHistory(!showMovementHistory)}
              className={`flex items-center space-x-2 px-3 py-2 border rounded-lg transition-colors ${
                showMovementHistory 
                  ? 'border-green-500 text-green-600 bg-green-50' 
                  : 'border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <History className="h-4 w-4" />
              <span>Histórico</span>
              {movementHistory.length > 0 && (
                <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  {movementHistory.length}
                </span>
              )}
            </button>

            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortOption)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="name">Nome</option>
                <option value="quantity">Quantidade</option>
                <option value="price">Preço</option>
                <option value="updated">Atualização</option>
                <option value="category">Categoria</option>
              </select>
              <button
                onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {sortDirection === 'asc' ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              </button>
            </div>

            <div className="flex border border-gray-300 rounded-lg">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 ${viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <Grid3X3 className="h-4 w-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <List className="h-4 w-4" />
              </button>
            </div>

            {/* Export/Import Actions */}
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600 whitespace-nowrap">
                {filteredProducts.length} de {products.length} produtos
              </div>
              
              <div className="flex items-center space-x-2 border-l border-gray-200 pl-4">
                <div className="relative group">
                  <button 
                    className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-gray-200"
                    title="Exportar dados"
                  >
                    <Download className="h-4 w-4" />
                    <span className="text-sm">Exportar</span>
                  </button>
                  <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all">
                    <div className="p-2">
                      <button
                        onClick={handleExportData}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Exportar JSON</span>
                      </button>
                      <button
                        onClick={handleExportCSV}
                        className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md flex items-center space-x-2"
                      >
                        <Download className="h-4 w-4" />
                        <span>Exportar CSV</span>
                      </button>
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => setIsImportModalOpen(true)}
                  className="flex items-center space-x-2 px-3 py-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors border border-gray-200"
                  title="Importar dados"
                >
                  <Upload className="h-4 w-4" />
                  <span className="text-sm">Importar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

      {/* Barra de Ações em Lote */}
      {isBulkMode && selectedProducts.size > 0 && (
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <span className="text-sm font-medium text-purple-900">
                {selectedProducts.size} produto(s) selecionado(s)
              </span>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => {
                    const quantity = prompt('Quantidade para entrada:')
                    if (quantity && !isNaN(Number(quantity))) {
                      handleBulkStockAction('entrada', Number(quantity))
                    }
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                >
                  <Plus className="h-4 w-4" />
                  <span>Entrada</span>
                </button>
                <button
                  onClick={() => {
                    const quantity = prompt('Quantidade para saída:')
                    if (quantity && !isNaN(Number(quantity))) {
                      handleBulkStockAction('saida', Number(quantity))
                    }
                  }}
                  className="flex items-center space-x-1 px-3 py-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                >
                  <Minus className="h-4 w-4" />
                  <span>Saída</span>
                </button>
              </div>
            </div>
            <button
              onClick={() => {
                setSelectedProducts(new Set())
                setIsBulkMode(false)
              }}
              className="text-purple-600 hover:text-purple-800 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Histórico de Movimentações */}
      {showMovementHistory && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <History className="h-5 w-5 text-green-600 mr-2" />
              Histórico de Movimentações
            </h3>
            <button
              onClick={() => setMovementHistory([])}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Limpar histórico"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          </div>
          
          {movementHistory.length === 0 ? (
            <p className="text-gray-500 text-center py-4">Nenhuma movimentação registrada</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {movementHistory.map((movement) => {
                const product = products.find(p => p.id === movement.productId)
                return (
                  <div key={movement.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${
                        movement.type === 'entrada' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {movement.type === 'entrada' ? (
                          <ArrowUpCircle className="h-4 w-4" />
                        ) : (
                          <ArrowDownCircle className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {product?.name || 'Produto não encontrado'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {movement.type === 'entrada' ? 'Entrada' : 'Saída'} de {movement.quantity} unidades
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-900">
                        {movement.previousQuantity} → {movement.newQuantity}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(movement.date).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}

        {/* Advanced Filters */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Faixa de Preço: R$ {priceRange[0]} - R$ {priceRange[1]}
                </label>
                <div className="flex items-center space-x-4">
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[0]}
                    onChange={(e) => setPriceRange([Number(e.target.value), priceRange[1]])}
                    className="flex-1"
                  />
                  <input
                    type="range"
                    min="0"
                    max={maxPrice}
                    value={priceRange[1]}
                    onChange={(e) => setPriceRange([priceRange[0], Number(e.target.value)])}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div className="flex items-center justify-end">
                <button
                  onClick={() => {
                    setSelectedCategory('all')
                    setStockFilter('all')
                    setPriceRange([0, maxPrice])
                    setShowAdvancedFilters(false)
                  }}
                  className="flex items-center space-x-2 px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  <X className="h-4 w-4" />
                  <span>Limpar Filtros</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Products Display */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
                          const stockStatus = getStockStatus(product.quantity || 0, product.min_stock || 1)
            const isSelected = selectedProducts.has(product.id)
            const isEditingQty = editingQuantity.hasOwnProperty(product.id)
            const totalValue = (product.quantity || 0) * (product.sell_price || 0)
            
            return (
              <div key={product.id} className="group" id={`product-${product.id}`}>
                <div className={`bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 border-2 overflow-hidden ${
                  isSelected 
                    ? 'border-purple-300 bg-purple-50' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                {/* Product Image Placeholder */}
                  <div className="h-32 bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center relative">
                  <Package className="h-12 w-12 text-blue-600" />
                    {isBulkMode && (
                      <div className="absolute top-3 left-3">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleProductSelection(product.id)}
                          className="h-5 w-5 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                        />
                      </div>
                    )}
                </div>
                
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-1">{product.name}</h3>
                      <p className="text-sm text-gray-600 font-mono">{product.code}</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${stockStatus.color}`}>
                        {stockStatus.status === 'low' ? 'Crítico' : stockStatus.status === 'medium' ? 'Baixo' : 'Adequado'}
                    </span>
                  </div>
                    
                    {/* Estoque com edição inline e botões rápidos */}
                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-700">Estoque</span>
                        {!isEditingQty && (
                          <div className="flex items-center space-x-1">
                            <button
                              onClick={() => handleQuickStockAction(product, 'saida', 1)}
                              className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                              title="Saída rápida (-1)"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleQuickStockAction(product, 'entrada', 1)}
                              className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                              title="Entrada rápida (+1)"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      {isEditingQty ? (
                        <div className="flex items-center space-x-2">
                          <input
                            ref={(el) => { quantityInputRefs.current[product.id] = el }}
                            type="number"
                            min="0"
                            defaultValue={editingQuantity[product.id]}
                            className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            onBlur={(e) => {
                              handleInlineQuantityEdit(product.id, parseInt(e.target.value) || 0)
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                handleInlineQuantityEdit(product.id, parseInt(e.currentTarget.value) || 0)
                              } else if (e.key === 'Escape') {
                                setEditingQuantity(prev => {
                                  const newState = { ...prev }
                                  delete newState[product.id]
                                  return newState
                                })
                              }
                            }}
                            autoFocus
                          />
                          <button
                            onClick={() => {
                              const input = quantityInputRefs.current[product.id]
                              if (input) {
                                handleInlineQuantityEdit(product.id, parseInt(input.value) || 0)
                              }
                            }}
                            className="p-2 text-green-600 hover:bg-green-100 rounded-lg"
                          >
                            <Check className="h-4 w-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between">
                          <button
                            onClick={() => setEditingQuantity(prev => ({ ...prev, [product.id]: product.quantity || 0 }))}
                            className="text-2xl font-bold text-gray-900 hover:text-blue-600 transition-colors cursor-pointer"
                            title="Clique para editar"
                          >
                            {product.quantity || 0}
                          </button>
                          <span className="text-sm text-gray-500">/ mín {product.min_stock || 0}</span>
                        </div>
                      )}
                      
                      {/* Barra de progresso do estoque */}
                      <div className="mt-3">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${
                              stockStatus.status === 'low' ? 'bg-red-500' :
                              stockStatus.status === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min((((product.quantity || 0) / ((product.min_stock || 1) * 2)) * 100), 100)}%` }}
                          ></div>
                        </div>
                      </div>
                  </div>
                  
                  <div className="space-y-3 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Package className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="truncate">{product.category}</span>
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                      <span className="font-mono">{product.location}</span>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-500">Preço unitário</p>
                        <p className="font-semibold text-gray-900">{formatCurrency(product.sell_price || 0)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Valor total</p>
                        <p className="font-semibold text-green-600">{formatCurrency(totalValue)}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <p className="text-xs text-gray-500 truncate flex-1 mr-2">
                        {product.supplier || 'Sem fornecedor'}
                      </p>
                      <div className="flex space-x-1 opacity-70 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleViewProduct(product)}
                          className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                          title="Ver detalhes"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleStockMovement(product)}
                          className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-all"
                          title="Movimentar estoque"
                        >
                          <ArrowUpCircle className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDuplicateProduct(product)}
                          className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-all"
                          title="Duplicar produto"
                        >
                          <Copy className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleEditProduct(product)}
                          className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          title="Editar produto"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteProduct(product)}
                          className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          title="Excluir produto"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        /* List View */
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th 
                    onClick={() => handleSort('name')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Produto</span>
                      {sortBy === 'name' && (
                        sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('category')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Categoria</span>
                      {sortBy === 'category' && (
                        sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('quantity')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Estoque</span>
                      {sortBy === 'quantity' && (
                        sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th 
                    onClick={() => handleSort('price')}
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                  >
                    <div className="flex items-center space-x-1">
                      <span>Preço</span>
                      {sortBy === 'price' && (
                        sortDirection === 'asc' ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Localização
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredProducts.map((product) => {
                  const stockStatus = getStockStatus(product.quantity || 0, product.min_stock || 1)
                  
                  return (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                              <Package className="h-5 w-5 text-blue-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{product.name}</div>
                            <div className="text-sm text-gray-500 font-mono">{product.code}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {product.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{product.quantity} un.</div>
                        <div className="text-xs text-gray-500">Mín: {product.min_stock}</div>
                      </td>
                                             <td className="px-6 py-4 whitespace-nowrap">
                                         <div className="text-sm font-medium text-gray-900">{formatCurrency(product.sell_price || 0)}</div>
                <div className="text-xs text-gray-500">
                  Total: {formatCurrency((product.quantity || 0) * (product.sell_price || 0))}
                         </div>
                       </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-mono">
                        {product.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${stockStatus.color}`}>
                          {stockStatus.status === 'low' ? 'Crítico' : stockStatus.status === 'medium' ? 'Baixo' : 'Adequado'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => handleViewProduct(product)}
                            className="text-indigo-600 hover:text-indigo-900 transition-colors"
                            title="Ver detalhes"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleStockMovement(product)}
                            className="text-purple-600 hover:text-purple-900 transition-colors"
                            title="Movimentar estoque"
                          >
                            <ArrowUpCircle className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDuplicateProduct(product)}
                            className="text-green-600 hover:text-green-900 transition-colors"
                            title="Duplicar"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleEditProduct(product)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button 
                            onClick={() => handleDeleteProduct(product)}
                            className="text-red-600 hover:text-red-900 transition-colors"
                            title="Excluir"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredProducts.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg">
          <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum produto encontrado</h3>
          <p className="text-gray-500 mb-4">Tente ajustar os filtros ou termo de busca</p>
          <button
            onClick={() => {
              setSelectedCategory('all')
              setStockFilter('all')
              setPriceRange([0, maxPrice])
              setShowAdvancedFilters(false)
            }}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <X className="h-4 w-4 mr-2" />
            Limpar todos os filtros
          </button>
        </div>
      )}

      {/* Modais */}
      <EditProductModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        product={editingProduct}
      />
      
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={confirmDeleteProduct}
        product={deletingProduct}
      />

      <ProductDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={handleCloseDetailsModal}
        product={viewingProduct}
      />

      {/* Stock Movement Modal - Melhorado */}
      {isStockMovementModalOpen && stockMovementProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <ArrowUpCircle className="h-6 w-6 text-purple-600 mr-3" />
              Movimentar Estoque - {stockMovementProduct.name}
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const type = formData.get('type') as string
              const quantity = parseInt(formData.get('quantity') as string)
              const reason = formData.get('reason') as string
              
              if (!quantity || quantity <= 0) {
                alert('Digite uma quantidade válida')
                return
              }
              
              const newQuantity = type === 'entrada' 
                ? (stockMovementProduct.quantity || 0) + quantity
                : Math.max(0, (stockMovementProduct.quantity || 0) - quantity)
              
              updateProduct(stockMovementProduct.id, { quantity: newQuantity })
              
              // Registrar no histórico
              const movement: StockMovement = {
                id: Date.now().toString(),
                productId: stockMovementProduct.id,
                type: type as 'entrada' | 'saida',
                quantity,
                reason,
                date: new Date().toISOString(),
                previousQuantity: stockMovementProduct.quantity || 0,
                newQuantity
              }
              
              setMovementHistory(prev => [movement, ...prev.slice(0, 49)])
              
              alert(`✅ Movimentação registrada!\n${type === 'entrada' ? 'Entrada' : 'Saída'} de ${quantity} unidades\nEstoque atual: ${newQuantity}`)
              handleCloseStockMovementModal()
            }}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Lado esquerdo - Formulário */}
              <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">
                    Tipo de Movimentação
                  </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-green-50 hover:border-green-300 transition-colors">
                        <input
                          type="radio"
                          name="type"
                          value="entrada"
                          defaultChecked
                          className="text-green-600 focus:ring-green-500"
                        />
                        <div className="flex items-center space-x-2">
                          <ArrowUpCircle className="h-5 w-5 text-green-600" />
                          <span className="font-medium text-gray-900">Entrada</span>
                        </div>
                      </label>
                      <label className="flex items-center space-x-3 p-4 border-2 border-gray-200 rounded-lg cursor-pointer hover:bg-red-50 hover:border-red-300 transition-colors">
                        <input
                          type="radio"
                          name="type"
                          value="saida"
                          className="text-red-600 focus:ring-red-500"
                        />
                        <div className="flex items-center space-x-2">
                          <ArrowDownCircle className="h-5 w-5 text-red-600" />
                          <span className="font-medium text-gray-900">Saída</span>
                        </div>
                      </label>
                    </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quantidade
                  </label>
                    <div className="relative">
                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    required
                        className="w-full border border-gray-300 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Digite a quantidade"
                        autoFocus
                  />
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement
                            if (input) input.value = '1'
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                        >
                          1
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement
                            if (input) input.value = '5'
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                        >
                          5
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            const input = e.currentTarget.parentElement?.previousElementSibling as HTMLInputElement
                            if (input) input.value = '10'
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                        >
                          10
                        </button>
                      </div>
                    </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motivo/Observação
                  </label>
                  <textarea
                    name="reason"
                      rows={4}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Recebimento de compra, Uso em produção, Ajuste de inventário..."
                  />
                    
                    {/* Sugestões de motivos */}
                    <div className="mt-2 flex flex-wrap gap-2">
                      {[
                        'Recebimento de compra',
                        'Uso em produção',
                        'Ajuste de inventário',
                        'Venda',
                        'Devolução',
                        'Perda/Avaria'
                      ].map(suggestion => (
                        <button
                          key={suggestion}
                          type="button"
                          onClick={(e) => {
                            const textarea = e.currentTarget.parentElement?.previousElementSibling as HTMLTextAreaElement
                            if (textarea) textarea.value = suggestion
                          }}
                          className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded hover:bg-gray-200 transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Lado direito - Informações do produto */}
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">Informações do Produto</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Código:</span>
                        <span className="font-mono text-gray-900">{stockMovementProduct.code}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Categoria:</span>
                        <span className="text-gray-900">{stockMovementProduct.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Localização:</span>
                        <span className="font-mono text-gray-900">{stockMovementProduct.location}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Fornecedor:</span>
                        <span className="text-gray-900">{stockMovementProduct.supplier || 'Não informado'}</span>
                      </div>
                </div>
              </div>
              
                  <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
                    <h4 className="font-medium text-blue-900 mb-3 flex items-center">
                      <Package className="h-4 w-4 mr-2" />
                      Status do Estoque
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-blue-700">Estoque atual:</span>
                        <span className="font-bold text-blue-900">{stockMovementProduct.quantity || 0} unidades</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Estoque mínimo:</span>
                        <span className="font-bold text-blue-900">{stockMovementProduct.min_stock || 0} unidades</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-700">Status:</span>
                        <span className={`font-medium ${
                          (stockMovementProduct.quantity || 0) <= (stockMovementProduct.min_stock || 1)
                            ? 'text-red-600'
                            : (stockMovementProduct.quantity || 0) <= (stockMovementProduct.min_stock || 1) * 1.5
                            ? 'text-orange-600'
                            : 'text-green-600'
                        }`}>
                          {(stockMovementProduct.quantity || 0) <= (stockMovementProduct.min_stock || 1)
                            ? 'Crítico'
                            : (stockMovementProduct.quantity || 0) <= (stockMovementProduct.min_stock || 1) * 1.5
                            ? 'Baixo'
                            : 'Adequado'
                          }
                        </span>
                      </div>
                    </div>
                    
                    {/* Barra de progresso */}
                    <div className="mt-3">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-300 ${
                            (stockMovementProduct.quantity || 0) <= (stockMovementProduct.min_stock || 1)
                              ? 'bg-red-500'
                              : (stockMovementProduct.quantity || 0) <= (stockMovementProduct.min_stock || 1) * 1.5
                              ? 'bg-orange-500'
                              : 'bg-green-500'
                          }`}
                          style={{ 
                            width: `${Math.min((((stockMovementProduct.quantity || 0) / ((stockMovementProduct.min_stock || 1) * 2)) * 100), 100)}%` 
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Movimentações recentes */}
                  {movementHistory.filter(m => m.productId === stockMovementProduct.id).length > 0 && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <History className="h-4 w-4 mr-2" />
                        Movimentações Recentes
                      </h4>
                      <div className="space-y-2 max-h-32 overflow-y-auto">
                        {movementHistory
                          .filter(m => m.productId === stockMovementProduct.id)
                          .slice(0, 3)
                          .map(movement => (
                            <div key={movement.id} className="flex items-center justify-between text-xs">
                              <div className="flex items-center space-x-2">
                                <div className={`w-2 h-2 rounded-full ${
                                  movement.type === 'entrada' ? 'bg-green-500' : 'bg-red-500'
                                }`}></div>
                                <span className="text-gray-600">
                                  {movement.type === 'entrada' ? '+' : '-'}{movement.quantity}
                                </span>
                              </div>
                              <span className="text-gray-500">
                                {new Date(movement.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseStockMovementModal}
                  className="px-6 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
                >
                  <Check className="h-4 w-4" />
                  <span>Registrar Movimentação</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Import Modal */}
      {isImportModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 text-green-600 mr-2" />
              Importar Produtos
            </h3>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-4">
                  Selecione um arquivo JSON exportado anteriormente
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                  id="import-file"
                />
                <label
                  htmlFor="import-file"
                  className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 cursor-pointer transition-colors"
                >
                  Escolher Arquivo
                </label>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Atenção:</strong> A importação irá substituir todos os produtos existentes. 
                  Recomendamos fazer um backup antes.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 

export default memo(ProductList) 