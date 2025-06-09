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

export type ProductFormData = Omit<Product, 'id' | 'createdAt' | 'updatedAt'>

export type ProductUpdate = Partial<Product>

export interface ProductContextType {
  products: Product[]
  addProduct: (product: ProductFormData) => void
  updateProduct: (id: number, product: ProductUpdate) => void
  deleteProduct: (id: number) => void
  getProductById: (id: number) => Product | undefined
  exportData: () => string
  importData: (data: string) => boolean
  clearAllData: () => void
}

export interface ExportData {
  products: Product[]
  exportedAt: string
  version: string
} 