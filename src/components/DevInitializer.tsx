'use client'

import { useEffect, useState } from 'react'
import { Database, Cpu, Package, AlertCircle, CheckCircle } from 'lucide-react'

// Dados de exemplo para desenvolvimento
const seedDevData = () => {
  // Produtos exemplo
  const sampleProducts = [
    {
      id: 1,
      name: 'Resistor 10K 0805',
      code: 'R-10K-0805',
      description: 'Resistor SMD 10K ohm 0805 1% ±0.1ppm/°C',
      category: 'Resistores',
      quantity: 1000,
      unit: 'pcs',
      purchase_price: 0.01,
      sell_price: 0.02,
      min_stock: 100,
      location: 'A1-01',
      supplier: 'Mouser Electronics',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Capacitor 100nF 0603',
      code: 'C-100N-0603',
      description: 'Capacitor cerâmico X7R 100nF 50V 0603 ±10%',
      category: 'Capacitores',
      quantity: 500,
      unit: 'pcs',
      purchase_price: 0.03,
      sell_price: 0.05,
      min_stock: 50,
      location: 'A1-02',
      supplier: 'Digikey',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 3,
      name: 'LED Verde 3mm',
      code: 'LED-G-3MM',
      description: 'LED verde 3mm THT alto brilho 20mA 2.1V',
      category: 'LEDs',
      quantity: 15, // Estoque baixo para teste de alertas
      unit: 'pcs',
      purchase_price: 0.10,
      sell_price: 0.20,
      min_stock: 20,
      location: 'B2-01',
      supplier: 'Farnell',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      name: 'Microcontrolador ESP32',
      code: 'MCU-ESP32-WROOM',
      description: 'ESP32-WROOM-32D WiFi+BT dual-core 240MHz',
      category: 'Microcontroladores',
      quantity: 25,
      unit: 'pcs',
      purchase_price: 4.50,
      sell_price: 8.00,
      min_stock: 10,
      location: 'C3-05',
      supplier: 'Mouser Electronics',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      name: 'Conector USB-C',
      code: 'CONN-USBC-16P',
      description: 'Conector USB-C 16 pinos SMD para PCB',
      category: 'Conectores',
      quantity: 75,
      unit: 'pcs',
      purchase_price: 0.85,
      sell_price: 1.50,
      min_stock: 20,
      location: 'D1-03',
      supplier: 'LCSC Electronics',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Produtos acabados exemplo
  const sampleFinishedProducts = [
    {
      id: 1,
      name: 'Circuito LED Simples',
      code: 'CIRCUIT-LED-001',
      description: 'Circuito básico com LED e resistor limitador',
      category: 'MIXED',
      estimated_time: 15,
      sell_price: 5.00,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Módulo WiFi IoT',
      code: 'IOT-WIFI-001',
      description: 'Módulo IoT com ESP32, sensores e conectividade WiFi',
      category: 'SMD',
      estimated_time: 45,
      sell_price: 25.00,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // BOM (Bill of Materials) exemplo
  const sampleBomItems = [
    // Para Circuito LED Simples
    {
      id: 1,
      finished_product_id: 1,
      component_id: 1, // Resistor 10K
      quantity: 1,
      process: 'SMD',
      position: 'R1',
      notes: 'Resistor limitador de corrente',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 2,
      finished_product_id: 1,
      component_id: 3, // LED Verde
      quantity: 1,
      process: 'PTH',
      position: 'D1',
      notes: 'LED indicador principal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    // Para Módulo WiFi IoT
    {
      id: 3,
      finished_product_id: 2,
      component_id: 4, // ESP32
      quantity: 1,
      process: 'SMD',
      position: 'U1',
      notes: 'Microcontrolador principal',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 4,
      finished_product_id: 2,
      component_id: 2, // Capacitor 100nF
      quantity: 3,
      process: 'SMD',
      position: 'C1,C2,C3',
      notes: 'Capacitores de desacoplamento',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    },
    {
      id: 5,
      finished_product_id: 2,
      component_id: 5, // Conector USB-C
      quantity: 1,
      process: 'SMD',
      position: 'J1',
      notes: 'Conector de alimentação e dados',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  ]

  // Salvar dados no localStorage (usando as chaves corretas do APP_CONFIG)
  localStorage.setItem('ecxus-stock-products', JSON.stringify(sampleProducts))
  localStorage.setItem('ecxus-stock-finished-products', JSON.stringify(sampleFinishedProducts))
  localStorage.setItem('bom_items', JSON.stringify(sampleBomItems))
  localStorage.setItem('production_orders', JSON.stringify([]))
  localStorage.setItem('mock-id-counter', '1010')
  localStorage.setItem('dev-data-initialized', 'true')

  return { products: sampleProducts.length, finishedProducts: sampleFinishedProducts.length, bomItems: sampleBomItems.length }
}

export default function DevInitializer() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [stats, setStats] = useState({ products: 0, finishedProducts: 0, bomItems: 0 })

  useEffect(() => {
    // Verificar se já foi inicializado
    const wasInitialized = localStorage.getItem('dev-data-initialized')
    
    if (!wasInitialized) {
      // Inicializar dados de exemplo
      const seedStats = seedDevData()
      setStats(seedStats)
      setIsInitialized(true)
      console.log('🎯 Banco de dados de desenvolvimento inicializado!')
    } else {
      setIsInitialized(true)
    }
  }, [])

  const handleResetData = () => {
    // Limpar dados existentes
    localStorage.clear()
    
    // Recriar dados de exemplo
    const seedStats = seedDevData()
    setStats(seedStats)
    
    // Recarregar a página para aplicar mudanças
    window.location.reload()
  }

  const handleForceInit = () => {
    // Forçar inicialização mesmo se já foi feita
    localStorage.removeItem('dev-data-initialized')
    const seedStats = seedDevData()
    setStats(seedStats)
    window.location.reload()
  }

  if (!isInitialized) {
    return (
      <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
        <div className="flex items-center space-x-2">
          <Database className="h-5 w-5 animate-pulse" />
          <span>Inicializando banco de desenvolvimento...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 p-4 rounded-lg shadow-lg max-w-sm">
      <div className="flex items-center space-x-2 mb-3">
        <div className="flex items-center space-x-1">
          <Database className="h-4 w-4 text-blue-600" />
          <span className="font-medium text-sm">Modo Desenvolvimento</span>
        </div>
        <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" title="Sistema ativo"></div>
      </div>

      <div className="text-xs text-gray-600 space-y-1 mb-3">
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Package className="h-3 w-3" />
            <span>Componentes:</span>
          </span>
          <span className="font-medium">{stats.products || JSON.parse(localStorage.getItem('ecxus-stock-products') || '[]').length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Cpu className="h-3 w-3" />
            <span>Produtos:</span>
          </span>
          <span className="font-medium">{stats.finishedProducts || JSON.parse(localStorage.getItem('ecxus-stock-finished-products') || '[]').length}</span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>BOMs:</span>
          </span>
          <span className="font-medium">{stats.bomItems || JSON.parse(localStorage.getItem('bom_items') || '[]').length}</span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1 text-orange-600">
          <AlertCircle className="h-3 w-3" />
          <span>Dados locais</span>
        </div>
        <div className="space-x-2">
          <button
            onClick={handleForceInit}
            className="text-green-600 hover:text-green-800 underline"
          >
            Inicializar
          </button>
          <button
            onClick={handleResetData}
            className="text-blue-600 hover:text-blue-800 underline"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-2 text-xs text-gray-500">
        💡 Configure o Supabase para modo online
      </div>
    </div>
  )
} 