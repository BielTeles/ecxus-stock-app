'use client'

import { useEffect, useState } from 'react'
import { useProducts } from '@/contexts/ProductContext'

export default function DebugProducts() {
  const { products, isLoading, error } = useProducts()
  const [localStorageData, setLocalStorageData] = useState<any>(null)

  useEffect(() => {
    // Verificar dados no localStorage
    const storedProducts = localStorage.getItem('ecxus-stock-products')
    setLocalStorageData(storedProducts ? JSON.parse(storedProducts) : null)
  }, [])

  return (
    <div className="fixed top-4 left-4 bg-black text-white p-4 rounded-lg shadow-lg max-w-md text-xs">
      <h3 className="font-bold mb-2">🐛 Debug - Produtos</h3>
      
      <div className="space-y-2">
        <div>
          <strong>Context:</strong>
          <div>Loading: {isLoading ? 'true' : 'false'}</div>
          <div>Error: {error || 'none'}</div>
          <div>Products count: {products.length}</div>
        </div>

        <div>
          <strong>LocalStorage:</strong>
          <div>Key 'ecxus-stock-products': {localStorageData ? localStorageData.length + ' items' : 'null'}</div>
        </div>

        <div>
          <strong>First Product:</strong>
          <div>{products[0] ? JSON.stringify(products[0], null, 2).substring(0, 100) + '...' : 'None'}</div>
        </div>

        <div>
          <strong>Dev Flag:</strong>
          <div>{localStorage.getItem('dev-data-initialized') || 'not set'}</div>
        </div>
      </div>
    </div>
  )
} 