'use client'

import { useState, useRef, useEffect } from 'react'
import { 
  Download, Upload, Trash2, Save, Database, Settings, Users, Shield, 
  Monitor, AlertTriangle, Activity, Clock, HardDrive, Cpu, BarChart3,
  Bell, Mail, Palette, Globe, Lock, Key, RefreshCw, FileText, Zap,
  Server, Calendar, TrendingUp, Eye, EyeOff, ChevronRight, Check, X
} from 'lucide-react'
import { useProducts } from '@/contexts/ProductContextV3'
import { useSuppliers } from '@/contexts/SupplierContext'
import { useProduction } from '@/contexts/ProductionContext'
import { useSettings } from '@/contexts/SettingsContext'
import { useCurrency } from '@/hooks/useCurrency'

type SettingsSection = 'general' | 'system' | 'users' | 'security' | 'backup' | 'monitoring' | 'notifications' | 'logs' | 'integrations' | 'performance'

interface SystemMetrics {
  uptime: string
  memoryUsage: number
  storageUsed: number
  totalStorage: number
  lastBackup: string
  activeUsers: number
}

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  action: string
  user: string
  details: string
}

export default function SettingsTab() {
  const { products, exportData, importData, clearAllData } = useProducts()
  const { suppliers } = useSuppliers()
  const { finishedProducts } = useProduction()
  const { settings, notifications, updateSettings, updateNotifications, exportSettings, importSettings, resetSettings } = useSettings()
  const { formatCurrency } = useCurrency()
  
  const [activeSection, setActiveSection] = useState<SettingsSection>('general')
  const [showPasswords, setShowPasswords] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  // Simular métricas do sistema
  const [systemMetrics] = useState<SystemMetrics>({
    uptime: '7d 14h 23m',
    memoryUsage: 65,
    storageUsed: 2.3,
    totalStorage: 5,
    lastBackup: '2024-01-15 10:30:00',
    activeUsers: 3
  })

  // Logs simulados
  const [logs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: '2024-01-15 14:30:25',
      level: 'success',
      action: 'LOGIN',
      user: 'admin@ecxus.com',
      details: 'Login realizado com sucesso'
    },
    {
      id: '2',
      timestamp: '2024-01-15 14:25:12',
      level: 'info',
      action: 'PRODUCT_CREATE',
      user: 'gabriel@ecxus.com',
      details: 'Produto "Resistor 10kΩ" criado'
    },
    {
      id: '3',
      timestamp: '2024-01-15 14:20:45',
      level: 'warning',
      action: 'LOW_STOCK',
      user: 'system',
      details: 'Estoque baixo detectado em 5 produtos'
    },
    {
      id: '4',
      timestamp: '2024-01-15 14:15:30',
      level: 'error',
      action: 'IMPORT_FAILED',
      user: 'user@ecxus.com',
      details: 'Falha ao importar arquivo de produtos'
    }
  ])

  // Funções de backup
  const handleExport = () => {
    const data = exportData()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ecxus-backup-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const success = importData(content)
        if (success) {
          alert('✅ Dados importados com sucesso!')
        } else {
          alert('❌ Erro ao importar dados. Verifique se o arquivo está correto.')
        }
      }
      reader.readAsText(file)
    }
  }

  const handleClearData = () => {
    if (window.confirm('⚠️ Tem certeza que deseja apagar TODOS os dados? Esta ação não pode ser desfeita!')) {
      clearAllData()
      alert('🗑️ Todos os dados foram removidos.')
    }
  }

  const handleSaveSettings = () => {
    // As configurações já são salvas automaticamente pelo contexto
    alert('✅ Configurações salvas com sucesso!')
  }

  const handleExportSettings = () => {
    const data = exportSettings()
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `ecxus-settings-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const handleImportSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const content = e.target?.result as string
        const success = importSettings(content)
        if (success) {
          alert('✅ Configurações importadas com sucesso!')
        } else {
          alert('❌ Erro ao importar configurações. Verifique se o arquivo está correto.')
        }
      }
      reader.readAsText(file)
    }
  }

  // Estatísticas avançadas
  const totalProducts = products.length
  const totalSuppliers = suppliers.length
  const totalFinishedProducts = finishedProducts.length
  const lowStockCount = products.filter(p => (p.quantity || 0) <= (p.minStock || 0)).length
  const totalValue = products.reduce((sum, p) => sum + (p.quantity || 0) * (p.price || 0), 0)

  const menuItems = [
    { id: 'general', label: 'Geral', icon: Settings },
    { id: 'system', label: 'Sistema', icon: Monitor },
    { id: 'users', label: 'Usuários', icon: Users },
    { id: 'security', label: 'Segurança', icon: Shield },
    { id: 'backup', label: 'Backup', icon: Database },
    { id: 'monitoring', label: 'Monitoramento', icon: Activity },
    { id: 'notifications', label: 'Notificações', icon: Bell },
    { id: 'integrations', label: 'Integrações', icon: Globe },
    { id: 'performance', label: 'Performance', icon: Zap },
    { id: 'logs', label: 'Logs', icon: FileText }
  ]

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-blue-600" />
          Configurações da Empresa
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Nome da Empresa</label>
            <input
              type="text"
              value={settings.companyName}
              onChange={(e) => updateSettings({companyName: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Estoque Mínimo Padrão</label>
            <input
              type="number"
              value={settings.minStockDefault}
              onChange={(e) => updateSettings({minStockDefault: Number(e.target.value)})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Moeda</label>
            <select 
              value={settings.currency}
              onChange={(e) => updateSettings({currency: e.target.value as 'BRL' | 'USD' | 'EUR'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="BRL">BRL - Real Brasileiro</option>
              <option value="USD">USD - Dólar Americano</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Idioma</label>
            <select 
              value={settings.language}
              onChange={(e) => updateSettings({language: e.target.value as 'pt-BR' | 'en-US' | 'es-ES'})}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="pt-BR">Português (Brasil)</option>
              <option value="en-US">English (US)</option>
              <option value="es-ES">Español</option>
            </select>
          </div>
        </div>
        
        <div className="mt-6 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.autoSave}
                onChange={(e) => updateSettings({autoSave: e.target.checked})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Salvamento automático</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.theme === 'dark'}
                onChange={(e) => updateSettings({theme: e.target.checked ? 'dark' : 'light'})}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Modo escuro</span>
            </label>
          </div>
          <button
            onClick={handleSaveSettings}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Salvar</span>
          </button>
        </div>
      </div>

      {/* Preview das Configurações */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Eye className="h-5 w-5 mr-2 text-indigo-600" />
          Prévia das Configurações
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-indigo-50 p-4 rounded-lg border border-indigo-200">
            <h4 className="text-sm font-medium text-indigo-800 mb-2">Formatação de Moeda</h4>
            <p className="text-sm text-indigo-700">
              Exemplo: {formatCurrency(1234.56)}
            </p>
            <p className="text-xs text-indigo-600 mt-1">
              Moeda atual: {settings.currency}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h4 className="text-sm font-medium text-green-800 mb-2">Estoque Mínimo Padrão</h4>
            <p className="text-sm text-green-700">
              Novos produtos: {settings.minStockDefault} unidades
            </p>
            <p className="text-xs text-green-600 mt-1">
              Aplicado automaticamente
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <h4 className="text-sm font-medium text-purple-800 mb-2">Idioma do Sistema</h4>
            <p className="text-sm text-purple-700">
              {settings.language === 'pt-BR' ? 'Português (Brasil)' : 
               settings.language === 'en-US' ? 'English (US)' : 'Español'}
            </p>
            <p className="text-xs text-purple-600 mt-1">
              Interface e formatações
            </p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h4 className="text-sm font-medium text-orange-800 mb-2">Tema da Interface</h4>
            <p className="text-sm text-orange-700">
              {settings.theme === 'light' ? '☀️ Modo Claro' : 
               settings.theme === 'dark' ? '🌙 Modo Escuro' : '🔄 Automático'}
            </p>
            <p className="text-xs text-orange-600 mt-1">
              {settings.autoSave ? 'Salvamento automático ativo' : 'Salvamento manual'}
            </p>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="text-sm font-medium text-blue-800 mb-2">💡 Como as configurações afetam o sistema:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>Moeda:</strong> Todos os preços e valores são formatados automaticamente</li>
            <li>• <strong>Estoque mínimo:</strong> Usado como padrão ao criar novos produtos</li>
            <li>• <strong>Idioma:</strong> Afeta formatação de números e datas</li>
            <li>• <strong>Tema:</strong> Altera aparência da interface (em desenvolvimento)</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderSystemMetrics = () => (
    <div className="space-y-6">
      {/* Métricas do Sistema */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tempo Online</p>
              <p className="text-lg font-bold text-green-600">{systemMetrics.uptime}</p>
            </div>
            <Clock className="h-8 w-8 text-green-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Uso de Memória</p>
              <p className="text-lg font-bold text-blue-600">{systemMetrics.memoryUsage}%</p>
            </div>
            <Cpu className="h-8 w-8 text-blue-600" />
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full" style={{width: `${systemMetrics.memoryUsage}%`}}></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Armazenamento</p>
              <p className="text-lg font-bold text-purple-600">{systemMetrics.storageUsed}GB / {systemMetrics.totalStorage}GB</p>
            </div>
            <HardDrive className="h-8 w-8 text-purple-600" />
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div className="bg-purple-600 h-2 rounded-full" style={{width: `${(systemMetrics.storageUsed / systemMetrics.totalStorage) * 100}%`}}></div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Usuários Ativos</p>
              <p className="text-lg font-bold text-orange-600">{systemMetrics.activeUsers}</p>
            </div>
            <Users className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Estatísticas do Banco de Dados */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-green-600" />
          Estatísticas do Banco de Dados
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-600 font-medium">Produtos</p>
            <p className="text-2xl font-bold text-blue-700">{totalProducts}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <p className="text-sm text-green-600 font-medium">Fornecedores</p>
            <p className="text-2xl font-bold text-green-700">{totalSuppliers}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
            <p className="text-sm text-purple-600 font-medium">Prod. Acabados</p>
            <p className="text-2xl font-bold text-purple-700">{totalFinishedProducts}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <p className="text-sm text-red-600 font-medium">Estoque Baixo</p>
            <p className="text-2xl font-bold text-red-700">{lowStockCount}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <p className="text-sm text-yellow-600 font-medium">Valor Total</p>
            <p className="text-lg font-bold text-yellow-700">{formatCurrency(totalValue)}</p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBackupSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-purple-600" />
          Backup e Restauração
        </h3>
        
        <div className="mb-6">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={settings.autoBackup}
              onChange={(e) => updateSettings({autoBackup: e.target.checked})}
              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            <span className="ml-2 text-sm text-gray-700">Backup automático diário às {settings.backupTime}</span>
          </label>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-800 mb-2 flex items-center">
              <Download className="h-4 w-4 mr-2" />
              Backup Completo
            </h4>
            <p className="text-sm text-blue-700 mb-3">
              Baixe todos os dados do sistema
            </p>
            <button
              onClick={handleExport}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Baixar Backup
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-green-800 mb-2 flex items-center">
              <Upload className="h-4 w-4 mr-2" />
              Restaurar Dados
            </h4>
            <p className="text-sm text-green-700 mb-3">
              Restaure de um arquivo de backup
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImport}
              accept=".json"
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Importar Backup
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-red-800 mb-2 flex items-center">
              <Trash2 className="h-4 w-4 mr-2" />
              Resetar Sistema
            </h4>
            <p className="text-sm text-red-700 mb-3">
              Remove todos os dados
            </p>
            <button
              onClick={handleClearData}
              className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Limpar Tudo
            </button>
          </div>
        </div>

        <div className="mt-6 bg-gray-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-800 mb-2">Último Backup</h4>
          <p className="text-sm text-gray-600">{systemMetrics.lastBackup}</p>
        </div>
      </div>
    </div>
  )

  const renderLogsSection = () => (
    <div className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <FileText className="h-5 w-5 mr-2 text-gray-600" />
            Logs do Sistema
          </h3>
          <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </button>
        </div>
        
        <div className="space-y-2">
          {logs.map((log) => (
            <div
              key={log.id}
              className={`p-3 rounded-lg border-l-4 ${
                log.level === 'success' ? 'bg-green-50 border-green-400' :
                log.level === 'warning' ? 'bg-yellow-50 border-yellow-400' :
                log.level === 'error' ? 'bg-red-50 border-red-400' :
                'bg-blue-50 border-blue-400'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className={`text-xs font-medium px-2 py-1 rounded ${
                    log.level === 'success' ? 'bg-green-100 text-green-800' :
                    log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                    log.level === 'error' ? 'bg-red-100 text-red-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.level.toUpperCase()}
                  </span>
                  <span className="font-medium text-gray-900">{log.action}</span>
                  <span className="text-sm text-gray-600">{log.user}</span>
                </div>
                <span className="text-xs text-gray-500">{log.timestamp}</span>
              </div>
              <p className="text-sm text-gray-700 mt-1">{log.details}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'general': return renderGeneralSettings()
      case 'system': return renderSystemMetrics()
      case 'backup': return renderBackupSection()
      case 'logs': return renderLogsSection()
      case 'users':
        return <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Gerenciamento de Usuários</h3>
          <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
        </div>
      case 'security':
        return <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Configurações de Segurança</h3>
          <p className="text-gray-600">Funcionalidade em desenvolvimento...</p>
        </div>
      default:
        return <div>Seção não encontrada</div>
    }
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-blue-600" />
          Painel Admin
        </h2>
        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id as SettingsSection)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-left transition-colors ${
                  activeSection === item.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-200'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <div className="flex items-center">
                  <Icon className="h-4 w-4 mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <ChevronRight className="h-4 w-4" />
              </button>
            )
          })}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 bg-gray-50 overflow-y-auto">
        {renderSection()}
      </div>
    </div>
  )
} 