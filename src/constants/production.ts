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

// Ordens de Produção - Status
export const ORDER_STATUS = {
  PLANNED: 'PLANNED',
  IN_PROGRESS: 'IN_PROGRESS', 
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED'
} as const

export const ORDER_STATUS_LABELS = {
  PLANNED: 'Planejada',
  IN_PROGRESS: 'Em Produção',
  COMPLETED: 'Finalizada',
  CANCELLED: 'Cancelada'
} as const

export const ORDER_STATUS_COLORS = {
  PLANNED: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-green-100 text-green-800',
  CANCELLED: 'bg-red-100 text-red-800'
} as const

// Prioridades
export const ORDER_PRIORITY = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const

export const ORDER_PRIORITY_LABELS = {
  LOW: 'Baixa',
  MEDIUM: 'Média',
  HIGH: 'Alta',
  URGENT: 'Urgente'
} as const

export const ORDER_PRIORITY_COLORS = {
  LOW: 'bg-gray-100 text-gray-800',
  MEDIUM: 'bg-blue-100 text-blue-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
} as const

// Estações de Trabalho
export const WORK_STATIONS = [
  'Estação SMD 1',
  'Estação SMD 2', 
  'Estação PTH 1',
  'Estação PTH 2',
  'Estação Mista',
  'Estação de Teste',
  'Estação de Acabamento'
] as const

// Operadores (exemplo)
export const OPERATORS = [
  'João Silva',
  'Maria Santos',
  'Pedro Costa',
  'Ana Oliveira',
  'Carlos Souza'
] as const 