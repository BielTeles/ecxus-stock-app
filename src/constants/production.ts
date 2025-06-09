export const PROCESS_TYPES = [
  'SMD',
  'PTH', 
  'MIXED'
] as const

export const PRODUCTION_STATUS = [
  'ACTIVE',
  'INACTIVE', 
  'DISCONTINUED'
] as const

export const PROCESS_LABELS = {
  SMD: 'Surface Mount Device',
  PTH: 'Pin Through Hole',
  MIXED: 'SMD + PTH'
} as const

export const STATUS_LABELS = {
  ACTIVE: 'Ativo',
  INACTIVE: 'Inativo',
  DISCONTINUED: 'Descontinuado'
} as const

export const STATUS_COLORS = {
  ACTIVE: 'bg-green-100 text-green-800',
  INACTIVE: 'bg-yellow-100 text-yellow-800',
  DISCONTINUED: 'bg-red-100 text-red-800'
} as const

export const PROCESS_COLORS = {
  SMD: 'bg-blue-100 text-blue-800',
  PTH: 'bg-purple-100 text-purple-800',
  MIXED: 'bg-orange-100 text-orange-800'
} as const 