'use client'

import { useEffect, useState } from 'react'
import { useProducts } from '@/contexts/ProductContext'

export default function DebugProducts() {
  const { products, isLoading, error } = useProducts()
  const [localStorageData, setLocalStorageData] = useState<unknown>(null)
  const [devFlag, setDevFlag] = useState<string | null>(null)

  useEffect(() => {
    // Verificar dados no localStorage - só no browser
    if (typeof window !== 'undefined') {
      const storedProducts = localStorage.getItem('ecxus-stock-products')
      setLocalStorageData(storedProducts ? JSON.parse(storedProducts) : null)
      
      const devFlagValue = localStorage.getItem('dev-data-initialized')
      setDevFlag(devFlagValue)
    }
  }, [])

  return (
    <div className="fixed top-4 left-4 bg-black bg-opacity-80 text-white p-3 rounded-lg shadow-lg max-w-sm text-xs z-50">
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
          <div>Key ecxus-stock-products: {localStorageData ? (localStorageData as unknown[]).length + ' items' : 'null'}</div>
        </div>

        <div>
          <strong>First Product:</strong>
          <div>{products[0] ? JSON.stringify(products[0], null, 2).substring(0, 100) + '...' : 'None'}</div>
        </div>

        <div>
          <strong>Dev Flag:</strong>
          <div>{devFlag || 'not set'}</div>
        </div>
      </div>
    </div>
  )
} 