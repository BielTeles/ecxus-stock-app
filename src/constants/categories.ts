export const PRODUCT_CATEGORIES = [
  'Resistores',
  'Capacitores',
  'LEDs',
  'Microcontroladores',
  'Sensores',
  'Transistores',
  'Diodos',
  'Circuitos Integrados',
  'Conectores',
  'Outros'
] as const

export type ProductCategory = typeof PRODUCT_CATEGORIES[number] 