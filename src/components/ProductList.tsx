'use client'

import { useState } from 'react'
import { Edit, Trash2, MapPin, Package, Filter, Eye, Copy } from 'lucide-react'
import { useProducts, Product } from '@/contexts/ProductContext'
import EditProductModal from './EditProductModal'
import ConfirmDeleteModal from './ConfirmDeleteModal'
import ProductDetailsModal from './ProductDetailsModal'

interface ProductListProps {
  searchTerm: string
}

export default function ProductList({ searchTerm }: ProductListProps) {
  const { products, addProduct, deleteProduct } = useProducts()
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [sortBy, setSortBy] = useState('name')
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null)
  const [viewingProduct, setViewingProduct] = useState<Product | null>(null)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false)

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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
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

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))]

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name)
      if (sortBy === 'quantity') return b.quantity - a.quantity
      if (sortBy === 'price') return a.price - b.price
      return 0
    })

  const getStockStatus = (quantity: number, minStock: number) => {
    if (quantity <= minStock) return { status: 'low', color: 'text-red-600 bg-red-100' }
    if (quantity <= minStock * 1.5) return { status: 'medium', color: 'text-orange-600 bg-orange-100' }
    return { status: 'good', color: 'text-green-600 bg-green-100' }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
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
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="name">Ordenar por Nome</option>
              <option value="quantity">Ordenar por Quantidade</option>
              <option value="price">Ordenar por Preço</option>
            </select>
          </div>
          <div className="text-sm text-gray-600">
            {filteredProducts.length} produto(s) encontrado(s)
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const stockStatus = getStockStatus(product.quantity, product.minStock)
          
          return (
            <div key={product.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">{product.name}</h3>
                    <p className="text-sm text-gray-600">{product.code}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${stockStatus.color}`}>
                    {product.quantity} un.
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <Package className="h-4 w-4 mr-2" />
                    {product.category}
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <MapPin className="h-4 w-4 mr-2" />
                    {product.location}
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2">{product.description}</p>
                </div>

                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm text-gray-600">Preço unitário</p>
                      <p className="font-semibold text-gray-900">R$ {product.price.toFixed(2)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-600">Estoque mín.</p>
                      <p className="font-semibold text-gray-900">{product.minStock}</p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Estoque</span>
                      <span>{((product.quantity / (product.minStock * 2)) * 100).toFixed(0)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          stockStatus.status === 'low' ? 'bg-red-500' :
                          stockStatus.status === 'medium' ? 'bg-orange-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(((product.quantity / (product.minStock * 2)) * 100), 100)}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <p className="text-xs text-gray-500">{product.supplier}</p>
                    <div className="flex space-x-1">
                      <button 
                        onClick={() => handleViewProduct(product)}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Ver detalhes"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDuplicateProduct(product)}
                        className="p-2 text-gray-400 hover:text-green-600 transition-colors"
                        title="Duplicar produto"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleEditProduct(product)}
                        className="p-2 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar produto"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteProduct(product)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Excluir produto"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-12">
          <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">Nenhum produto encontrado</p>
          <p className="text-sm text-gray-400 mt-1">Tente ajustar os filtros ou termo de busca</p>
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
    </div>
  )
} 