import { ProductFormData } from '@/types/product'
import { PRODUCT_CATEGORIES } from '@/constants/categories'
import { APP_CONFIG, VALIDATION_MESSAGES } from '@/constants/app'

export interface ValidationError {
  field: string
  message: string
}

export interface ValidationResult {
  isValid: boolean
  errors: ValidationError[]
}

export const validateProduct = (data: Partial<ProductFormData>): ValidationResult => {
  const errors: ValidationError[] = []

  // Validação do nome
  if (!data.name?.trim()) {
    errors.push({ field: 'name', message: VALIDATION_MESSAGES.required })
  } else if (data.name.trim().length < 2) {
    errors.push({ field: 'name', message: VALIDATION_MESSAGES.minLength(2) })
  } else if (data.name.trim().length > APP_CONFIG.limits.maxProductNameLength) {
    errors.push({ field: 'name', message: VALIDATION_MESSAGES.maxLength(APP_CONFIG.limits.maxProductNameLength) })
  }

  // Validação do código
  if (!data.code?.trim()) {
    errors.push({ field: 'code', message: 'Código do produto é obrigatório' })
  } else if (data.code.trim().length < 2) {
    errors.push({ field: 'code', message: 'Código deve ter pelo menos 2 caracteres' })
  } else if (data.code.trim().length > 20) {
    errors.push({ field: 'code', message: 'Código deve ter no máximo 20 caracteres' })
  }

  // Validação da categoria
  if (!data.category) {
    errors.push({ field: 'category', message: 'Categoria é obrigatória' })
  } else if (!PRODUCT_CATEGORIES.includes(data.category as any)) {
    errors.push({ field: 'category', message: 'Categoria inválida' })
  }

  // Validação da localização
  if (!data.location?.trim()) {
    errors.push({ field: 'location', message: 'Localização é obrigatória' })
  } else if (data.location.trim().length > 50) {
    errors.push({ field: 'location', message: 'Localização deve ter no máximo 50 caracteres' })
  }

  // Validação da quantidade
  if (data.quantity === undefined || data.quantity === null) {
    errors.push({ field: 'quantity', message: 'Quantidade é obrigatória' })
  } else if (data.quantity < 0) {
    errors.push({ field: 'quantity', message: 'Quantidade não pode ser negativa' })
  } else if (!Number.isInteger(data.quantity)) {
    errors.push({ field: 'quantity', message: 'Quantidade deve ser um número inteiro' })
  }

  // Validação do estoque mínimo
  if (data.minStock === undefined || data.minStock === null) {
    errors.push({ field: 'minStock', message: 'Estoque mínimo é obrigatório' })
  } else if (data.minStock < 0) {
    errors.push({ field: 'minStock', message: 'Estoque mínimo não pode ser negativo' })
  } else if (!Number.isInteger(data.minStock)) {
    errors.push({ field: 'minStock', message: 'Estoque mínimo deve ser um número inteiro' })
  }

  // Validação do preço
  if (data.price === undefined || data.price === null) {
    errors.push({ field: 'price', message: 'Preço é obrigatório' })
  } else if (data.price < 0) {
    errors.push({ field: 'price', message: 'Preço não pode ser negativo' })
  } else if (data.price > 999999.99) {
    errors.push({ field: 'price', message: 'Preço muito alto (máximo: R$ 999.999,99)' })
  }

  // Validação do fornecedor (opcional, mas se preenchido deve ter pelo menos 2 caracteres)
  if (data.supplier && data.supplier.trim().length > 0 && data.supplier.trim().length < 2) {
    errors.push({ field: 'supplier', message: 'Fornecedor deve ter pelo menos 2 caracteres' })
  } else if (data.supplier && data.supplier.trim().length > 100) {
    errors.push({ field: 'supplier', message: 'Fornecedor deve ter no máximo 100 caracteres' })
  }

  // Validação da descrição (opcional, mas se preenchida deve ter pelo menos 5 caracteres)
  if (data.description && data.description.trim().length > 0 && data.description.trim().length < 5) {
    errors.push({ field: 'description', message: 'Descrição deve ter pelo menos 5 caracteres' })
  } else if (data.description && data.description.trim().length > 500) {
    errors.push({ field: 'description', message: 'Descrição deve ter no máximo 500 caracteres' })
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}

export const sanitizeProductData = (data: any): Partial<ProductFormData> => {
  return {
    name: typeof data.name === 'string' ? data.name.trim() : '',
    code: typeof data.code === 'string' ? data.code.trim().toUpperCase() : '',
    category: typeof data.category === 'string' ? data.category.trim() : '',
    location: typeof data.location === 'string' ? data.location.trim().toUpperCase() : '',
    quantity: Number(data.quantity) || 0,
    minStock: Number(data.minStock) || 0,
    price: Number(data.price) || 0,
    supplier: typeof data.supplier === 'string' ? data.supplier.trim() : '',
    description: typeof data.description === 'string' ? data.description.trim() : ''
  }
} 