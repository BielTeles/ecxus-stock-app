'use client'

import React, { createContext, useContext, ReactNode } from 'react'
import { useLocalStorage } from '@/hooks/useLocalStorage'

export interface Product {
  id: number
  name: string
  code: string
  category: string
  location: string
  quantity: number
  minStock: number
  price: number
  supplier: string
  description: string
  createdAt: string
  updatedAt: string
}

interface ProductContextType {
  products: Product[]
  addProduct: (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => void
  updateProduct: (id: number, product: Partial<Product>) => void
  deleteProduct: (id: number) => void
  getProductById: (id: number) => Product | undefined
  exportData: () => string
  importData: (data: string) => boolean
  clearAllData: () => void
}

const ProductContext = createContext<ProductContextType | undefined>(undefined)

// Produtos iniciais de exemplo
const initialProducts: Product[] = [
  {
    id: 1,
    name: 'Resistor 10kΩ',
    code: 'R001',
    category: 'Resistores',
    location: 'A1-B3',
    quantity: 500,
    minStock: 100,
    price: 0.15,
    supplier: 'Eletrônica Silva',
    description: 'Resistor de carbono 1/4W 5%',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Capacitor 100nF',
    code: 'C001',
    category: 'Capacitores',
    location: 'A2-B1',
    quantity: 25,
    minStock: 50,
    price: 0.25,
    supplier: 'Componentes Tech',
    description: 'Capacitor cerâmico 50V',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 3,
    name: 'LED Azul 5mm',
    code: 'L001',
    category: 'LEDs',
    location: 'B1-C2',
    quantity: 200,
    minStock: 75,
    price: 0.30,
    supplier: 'LED World',
    description: 'LED de alto brilho 3.2V 20mA',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Arduino Uno R3',
    code: 'ARD001',
    category: 'Microcontroladores',
    location: 'C3-A1',
    quantity: 15,
    minStock: 10,
    price: 45.00,
    supplier: 'Arduino Store',
    description: 'Placa de desenvolvimento com ATmega328P',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Sensor PIR',
    code: 'S001',
    category: 'Sensores',
    location: 'D1-B2',
    quantity: 8,
    minStock: 20,
    price: 12.50,
    supplier: 'Sensor Tech',
    description: 'Sensor de movimento passivo infravermelho',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Transistor BC547',
    code: 'T001',
    category: 'Transistores',
    location: 'A3-C1',
    quantity: 300,
    minStock: 50,
    price: 0.20,
    supplier: 'Eletrônica Silva',
    description: 'Transistor NPN uso geral',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
]

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useLocalStorage<Product[]>('ecxus-stock-products', initialProducts)

  const addProduct = (productData: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newProduct: Product = {
      ...productData,
      id: Math.max(...products.map(p => p.id), 0) + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    setProducts(prev => [...prev, newProduct])
  }

  const updateProduct = (id: number, productData: Partial<Product>) => {
    setProducts(prev => prev.map(product => 
      product.id === id 
        ? { ...product, ...productData, updatedAt: new Date().toISOString() }
        : product
    ))
  }

  const deleteProduct = (id: number) => {
    setProducts(prev => prev.filter(product => product.id !== id))
  }

  const getProductById = (id: number) => {
    return products.find(product => product.id === id)
  }

  const exportData = () => {
    const exportData = {
      products,
      exportedAt: new Date().toISOString(),
      version: '1.0'
    }
    return JSON.stringify(exportData, null, 2)
  }

  const importData = (data: string): boolean => {
    try {
      const parsed = JSON.parse(data)
      if (parsed.products && Array.isArray(parsed.products)) {
        setProducts(parsed.products)
        return true
      }
      return false
    } catch (error) {
      console.error('Erro ao importar dados:', error)
      return false
    }
  }

  const clearAllData = () => {
    setProducts([])
  }

  const value: ProductContextType = {
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    exportData,
    importData,
    clearAllData
  }

  return (
    <ProductContext.Provider value={value}>
      {children}
    </ProductContext.Provider>
  )
}

export function useProducts() {
  const context = useContext(ProductContext)
  if (context === undefined) {
    throw new Error('useProducts deve ser usado dentro de um ProductProvider')
  }
  return context
} 