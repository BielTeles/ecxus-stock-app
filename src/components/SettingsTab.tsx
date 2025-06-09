'use client'

import { useState, useRef } from 'react'
import { Download, Upload, Trash2, Save, Database } from 'lucide-react'
import { useProducts } from '@/contexts/ProductContext'

export default function SettingsTab() {
  const { products, exportData, importData, clearAllData } = useProducts()
  const [minStockDefault, setMinStockDefault] = useState('10')
  const [currency, setCurrency] = useState('BRL')
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  return (
    <div className="space-y-6">
      {/* Configurações Gerais */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Save className="h-5 w-5 mr-2 text-blue-600" />
          Configurações Gerais
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Estoque Mínimo Padrão
            </label>
            <input
              type="number"
              value={minStockDefault}
              onChange={(e) => setMinStockDefault(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Moeda Padrão
            </label>
            <select 
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="BRL">BRL - Real Brasileiro</option>
              <option value="USD">USD - Dólar Americano</option>
              <option value="EUR">EUR - Euro</option>
            </select>
          </div>
        </div>
      </div>

      {/* Estatísticas do Sistema */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-green-600" />
          Estatísticas do Sistema
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Total de Produtos</p>
            <p className="text-2xl font-bold text-gray-900">{products.length}</p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Categorias Únicas</p>
            <p className="text-2xl font-bold text-gray-900">
              {new Set(products.map(p => p.category)).size}
            </p>
          </div>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600">Produtos com Estoque Baixo</p>
            <p className="text-2xl font-bold text-orange-600">
              {products.filter(p => p.quantity <= p.minStock).length}
            </p>
          </div>
        </div>
      </div>

      {/* Backup e Restauração */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4 flex items-center">
          <Database className="h-5 w-5 mr-2 text-purple-600" />
          Backup e Restauração
        </h2>
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">💾 Fazer Backup</h3>
            <p className="text-sm text-blue-700 mb-3">
              Baixe um arquivo com todos os seus produtos para ter uma cópia de segurança.
            </p>
            <button
              onClick={handleExport}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Download className="h-4 w-4" />
              <span>Baixar Backup</span>
            </button>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-green-800 mb-2">📂 Restaurar Backup</h3>
            <p className="text-sm text-green-700 mb-3">
              Restaure seus dados a partir de um arquivo de backup.
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
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Upload className="h-4 w-4" />
              <span>Importar Backup</span>
            </button>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-red-800 mb-2">🗑️ Limpar Todos os Dados</h3>
            <p className="text-sm text-red-700 mb-3">
              ⚠️ Atenção: Esta ação remove TODOS os produtos permanentemente!
            </p>
            <button
              onClick={handleClearData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <Trash2 className="h-4 w-4" />
              <span>Limpar Tudo</span>
            </button>
          </div>
        </div>
      </div>

      {/* Informações do Sistema */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-4">ℹ️ Informações do Sistema</h2>
        <div className="space-y-2 text-sm">
          <p><strong>Versão:</strong> 1.0.0</p>
          <p><strong>Desenvolvido para:</strong> Ecxus - Gerenciamento de Componentes Eletrônicos</p>
          <p><strong>Armazenamento:</strong> LocalStorage (navegador)</p>
          <p><strong>Última atualização:</strong> {new Date().toLocaleDateString('pt-BR')}</p>
        </div>
      </div>
    </div>
  )
} 