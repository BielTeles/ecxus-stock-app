export const APP_CONFIG = {
  name: 'Ecxus Stock',
  version: '1.0.0',
  description: 'Sistema de gerenciamento de estoque para componentes eletrônicos',
  localStorage: {
    keys: {
      products: 'ecxus-stock-products',
      finishedProducts: 'ecxus-stock-finished-products',
      suppliers: 'ecxus-suppliers',
      purchaseOrders: 'ecxus-purchase-orders',
      quotes: 'ecxus-quotes',
      priceHistory: 'ecxus-price-history',
      stockAlerts: 'ecxus-stock-alerts',
      settings: 'ecxus-stock-settings',
      theme: 'ecxus-stock-theme'
    }
  },
  limits: {
    maxProductNameLength: 100,
    maxProductCodeLength: 20,
    maxLocationLength: 50,
    maxSupplierLength: 100,
    maxDescriptionLength: 500,
    maxPrice: 999999.99,
    minQuantity: 0,
    minStock: 0
  }
} as const

export const VALIDATION_MESSAGES = {
  required: 'Este campo é obrigatório',
  minLength: (min: number) => `Deve ter pelo menos ${min} caracteres`,
  maxLength: (max: number) => `Deve ter no máximo ${max} caracteres`,
  invalidFormat: 'Formato inválido',
  negativeNumber: 'Não pode ser negativo',
  tooHigh: (max: number) => `Valor muito alto (máximo: ${max})`,
  mustBeInteger: 'Deve ser um número inteiro',
  invalidCategory: 'Categoria inválida'
} as const 