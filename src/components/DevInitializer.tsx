'use client'

import { useEffect, useState } from 'react'
import { Database, Cpu, Package, AlertCircle, CheckCircle } from 'lucide-react'
import { APP_CONFIG } from '@/constants/app'

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
      estimatedProductionTime: 15,
      sellPrice: 5.00,
      status: 'ACTIVE',
      bom: [
        {
          id: 1,
          componentId: 1, // Resistor 10K
          quantity: 1,
          process: 'SMD',
          position: 'R1',
          notes: 'Resistor limitador de corrente',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          componentId: 3, // LED Verde
          quantity: 1,
          process: 'PTH',
          position: 'D1',
          notes: 'LED indicador principal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Módulo WiFi IoT',
      code: 'IOT-WIFI-001',
      description: 'Módulo IoT com ESP32, sensores e conectividade WiFi',
      category: 'SMD',
      estimatedProductionTime: 45,
      sellPrice: 25.00,
      status: 'ACTIVE',
      bom: [
        {
          id: 3,
          componentId: 4, // ESP32
          quantity: 1,
          process: 'SMD',
          position: 'U1',
          notes: 'Microcontrolador principal',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 4,
          componentId: 2, // Capacitor 100nF
          quantity: 3,
          process: 'SMD',
          position: 'C1,C2,C3',
          notes: 'Capacitores de desacoplamento',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 5,
          componentId: 5, // Conector USB-C
          quantity: 1,
          process: 'SMD',
          position: 'J1',
          notes: 'Conector de alimentação e dados',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  // Fornecedores exemplo
  const sampleSuppliers = [
    {
      id: 1,
      name: 'Mouser Electronics',
      code: 'MOUSER-001',
      email: 'vendas@mouser.com.br',
      phone: '+55 11 3003-6000',
      website: 'https://www.mouser.com.br',
      address: {
        street: 'Rua Verbo Divino, 1356',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04719-002',
        country: 'Brasil'
      },
      contact: {
        name: 'João Silva',
        email: 'joao.silva@mouser.com.br',
        phone: '+55 11 3003-6001',
        department: 'Vendas'
      },
      commercialTerms: {
        paymentTerms: '30 dias',
        minOrderValue: 100.00,
        shippingCost: 15.00,
        leadTimeDays: 5,
        currency: 'R$'
      },
      rating: 5,
      status: 'ACTIVE',
      notes: 'Fornecedor confiável com amplo catálogo de componentes eletrônicos',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 2,
      name: 'Digikey Brasil',
      code: 'DIGIKEY-001',
      email: 'brasil@digikey.com',
      phone: '+55 11 2626-8400',
      website: 'https://www.digikey.com.br',
      address: {
        street: 'Av. das Nações Unidas, 12901',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '04578-000',
        country: 'Brasil'
      },
      contact: {
        name: 'Maria Santos',
        email: 'maria.santos@digikey.com',
        phone: '+55 11 2626-8401',
        department: 'Atendimento ao Cliente'
      },
      commercialTerms: {
        paymentTerms: '45 dias',
        minOrderValue: 150.00,
        shippingCost: 25.00,
        leadTimeDays: 7,
        currency: 'R$'
      },
      rating: 4,
      status: 'ACTIVE',
      notes: 'Excelente para componentes especializados e de alta qualidade',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 3,
      name: 'LCSC Electronics',
      code: 'LCSC-001',
      email: 'vendas@lcsc.com.br',
      phone: '+55 11 4020-8000',
      website: 'https://www.lcsc.com',
      address: {
        street: 'Rua Augusta, 2050',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01305-100',
        country: 'Brasil'
      },
      contact: {
        name: 'Carlos Chen',
        email: 'carlos.chen@lcsc.com.br',
        phone: '+55 11 4020-8001',
        department: 'Vendas Técnicas'
      },
      commercialTerms: {
        paymentTerms: 'À vista',
        minOrderValue: 50.00,
        shippingCost: 12.00,
        leadTimeDays: 10,
        currency: 'R$'
      },
      rating: 3,
      status: 'ACTIVE',
      notes: 'Bons preços para componentes básicos, prazo de entrega mais longo',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]

  // Salvar dados no localStorage (usando as chaves corretas do APP_CONFIG)
  localStorage.setItem(APP_CONFIG.localStorage.keys.products, JSON.stringify(sampleProducts))
  localStorage.setItem(APP_CONFIG.localStorage.keys.finishedProducts, JSON.stringify(sampleFinishedProducts))
  localStorage.setItem(APP_CONFIG.localStorage.keys.suppliers, JSON.stringify(sampleSuppliers))
  localStorage.setItem(APP_CONFIG.localStorage.keys.purchaseOrders, JSON.stringify([]))
  localStorage.setItem(APP_CONFIG.localStorage.keys.quotes, JSON.stringify([]))
  localStorage.setItem(APP_CONFIG.localStorage.keys.priceHistory, JSON.stringify([]))
  localStorage.setItem(APP_CONFIG.localStorage.keys.stockAlerts, JSON.stringify([]))
  localStorage.setItem('production_orders', JSON.stringify([]))
  localStorage.setItem('mock-id-counter', '1010')
  localStorage.setItem('dev-data-initialized', 'true')

  return { 
    products: sampleProducts.length, 
    finishedProducts: sampleFinishedProducts.length, 
    bomItems: sampleFinishedProducts.reduce((sum, p) => sum + p.bom.length, 0),
    suppliers: sampleSuppliers.length 
  }
}

export default function DevInitializer() {
  const [isInitialized, setIsInitialized] = useState(false)
  const [stats, setStats] = useState({ products: 0, finishedProducts: 0, bomItems: 0 })

  useEffect(() => {
    // Só executar no browser
    if (typeof window !== 'undefined') {
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
    }
  }, [])

  const handleResetData = () => {
    if (typeof window !== 'undefined') {
      // Limpar dados existentes
      localStorage.clear()
      
      // Recriar dados de exemplo
      const seedStats = seedDevData()
      setStats(seedStats)
      
      // Recarregar a página para aplicar mudanças
      window.location.reload()
    }
  }

  const handleForceInit = () => {
    if (typeof window !== 'undefined') {
      // Forçar inicialização mesmo se já foi feita
      localStorage.removeItem('dev-data-initialized')
      const seedStats = seedDevData()
      setStats(seedStats)
      window.location.reload()
    }
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
          <span className="font-medium">
            {stats.products || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ecxus-stock-products') || '[]').length : 0)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <Cpu className="h-3 w-3" />
            <span>Produtos:</span>
          </span>
          <span className="font-medium">
            {stats.finishedProducts || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ecxus-stock-finished-products') || '[]').length : 0)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <CheckCircle className="h-3 w-3" />
            <span>BOMs:</span>
          </span>
          <span className="font-medium">
            {stats.bomItems || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ecxus-stock-finished-products') || '[]').reduce((sum, p) => sum + (p.bom ? p.bom.length : 0), 0) : 0)}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="flex items-center space-x-1">
            <span>👥</span>
            <span>Fornecedores:</span>
          </span>
          <span className="font-medium">
            {stats.suppliers || (typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('ecxus-suppliers') || '[]').length : 0)}
          </span>
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