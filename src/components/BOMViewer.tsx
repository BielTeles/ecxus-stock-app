'use client'

import { Package, ArrowRight } from 'lucide-react'
import { useProducts } from '@/contexts/ProductContext'
import { BOMItem } from '@/types/production'

interface BOMViewerProps {
  bomItems: BOMItem[]
  className?: string
}

export default function BOMViewer({ bomItems, className = '' }: BOMViewerProps) {
  const { products } = useProducts()

  const getComponentById = (id: number) => {
    return products.find(p => p.id === id)
  }

  if (bomItems.length === 0) {
    return (
      <div className={`text-center py-4 text-gray-500 ${className}`}>
        <Package className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-sm">BOM vazia</p>
      </div>
    )
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <h4 className="text-sm font-medium text-gray-700 mb-3">
        BOM ({bomItems.length} {bomItems.length === 1 ? 'item' : 'itens'})
      </h4>
      
      {bomItems.slice(0, 5).map((bomItem) => {
        const component = getComponentById(bomItem.componentId)
        if (!component) return null

        return (
          <div key={bomItem.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
            <div className="flex items-center space-x-2">
              <span className={`w-2 h-2 rounded-full ${
                bomItem.process === 'SMD' ? 'bg-blue-500' : 'bg-purple-500'
              }`}></span>
              <span className="font-medium text-gray-900">{component.name}</span>
              {bomItem.position && (
                <span className="text-xs text-gray-500">({bomItem.position})</span>
              )}
            </div>
            <div className="flex items-center space-x-2 text-gray-600">
              <span>{bomItem.quantity}x</span>
              <ArrowRight className="h-3 w-3" />
              <span className="text-xs">{component.quantity} disp.</span>
            </div>
          </div>
        )
      })}
      
      {bomItems.length > 5 && (
        <p className="text-xs text-gray-500 text-center mt-2">
          +{bomItems.length - 5} {bomItems.length - 5 === 1 ? 'item' : 'itens'} adicional(ais)
        </p>
      )}
    </div>
  )
} 