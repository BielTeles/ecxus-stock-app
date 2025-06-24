'use client'

import { useState, useEffect, useCallback } from 'react'
import { 
  Settings, 
  Download, 
  Upload, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw, 
  Eye, 
  EyeOff,
  Zap,
  Database,
  Package,
  TrendingUp,
  Clock,
  X,
  Save,
  TestTube
} from 'lucide-react'
import { 
  OmieAPI, 
  OmieCredentialsManager, 
  OmieCredentials,
  OmieProductResponse 
} from '@/lib/api/omie'
import { useProducts } from '@/contexts/ProductContextV3'

interface OmieIntegrationProps {
  isOpen: boolean
  onClose: () => void
}

interface SyncStats {
  total: number
  imported: number
  updated: number
  errors: number
  skipped: number
}

export default function OmieIntegration({ isOpen, onClose }: OmieIntegrationProps) {
  const { products, addProduct, updateProduct } = useProducts()
  
  // Estados de configuração
  const [credentials, setCredentials] = useState<OmieCredentials>({
    appKey: '',
    appSecret: '',
    baseUrl: 'https://app.omie.com.br/api/v1'
  })
  const [showSecret, setShowSecret] = useState(false)
  const [isConfigured, setIsConfigured] = useState(false)
  
  // Estados de conexão e sincronização
  const [isTestingConnection, setIsTestingConnection] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [connectionError, setConnectionError] = useState<string>('')
  
  // Estados de sincronização
  const [isSyncing, setIsSyncing] = useState(false)
  const [syncProgress, setSyncProgress] = useState(0)
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null)
  const [syncLog, setSyncLog] = useState<string[]>([])
  
  // Estados de visualização
  const [omieProducts, setOmieProducts] = useState<OmieProductResponse[]>([])
  const [omieStats, setOmieStats] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set())

  // Carregar configurações salvas
  useEffect(() => {
    const savedCredentials = OmieCredentialsManager.load()
    if (savedCredentials) {
      setCredentials(savedCredentials)
      setIsConfigured(true)
      setConnectionStatus('success')
    }
  }, [])

  // Salvar credenciais
  const handleSaveCredentials = useCallback(() => {
    if (!credentials.appKey || !credentials.appSecret) {
      alert('⚠️ Por favor, preencha App Key e App Secret')
      return
    }

    OmieCredentialsManager.save(credentials)
    setIsConfigured(true)
    alert('✅ Credenciais salvas com sucesso!')
  }, [credentials])

  // Testar conexão
  const handleTestConnection = useCallback(async () => {
    if (!credentials.appKey || !credentials.appSecret) {
      alert('⚠️ Configure as credenciais primeiro')
      return
    }

    setIsTestingConnection(true)
    setConnectionError('')

    try {
      const api = new OmieAPI(credentials)
      const isConnected = await api.testConnection()
      
      if (isConnected) {
        setConnectionStatus('success')
        
        // Buscar estatísticas básicas
        const stats = await api.getProductStats()
        setOmieStats(stats)
        
        alert('✅ Conexão com Omie estabelecida com sucesso!')
      } else {
        setConnectionStatus('error')
        setConnectionError('Falha na conexão')
      }
    } catch (error) {
      setConnectionStatus('error')
      setConnectionError(error instanceof Error ? error.message : 'Erro desconhecido')
      alert(`❌ Erro na conexão: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsTestingConnection(false)
    }
  }, [credentials])

  // Visualizar produtos do Omie
  const handlePreviewProducts = useCallback(async () => {
    if (!isConfigured) {
      alert('⚠️ Configure a integração primeiro')
      return
    }

    setIsSyncing(true)
    setSyncLog(['🔍 Buscando produtos do Omie...'])

    try {
      const api = new OmieAPI(credentials)
      
      // Tentar diferentes abordagens de busca
      setSyncLog(prev => [...prev, '🔍 Tentativa 1: Busca básica...'])
      let products = await api.getActiveProducts()
      
      if (products.length === 0) {
        setSyncLog(prev => [...prev, '⚠️ Nenhum produto encontrado na busca básica'])
        setSyncLog(prev => [...prev, '�� Tentativa 2: Busca sem filtros...'])
        
        try {
          const noFilterResponse = await api.listProducts(1, 50)
          if (noFilterResponse.produto_servico_cadastro) {
            products = noFilterResponse.produto_servico_cadastro
          }
        } catch (error) {
          setSyncLog(prev => [...prev, `❌ Erro na busca sem filtros: ${error instanceof Error ? error.message : 'Erro desconhecido'}`])
        }
      }
      
      if (products.length === 0) {
        setSyncLog(prev => [...prev, '⚠️ Nenhum produto encontrado na busca sem filtros'])
        setSyncLog(prev => [...prev, '🔍 Tentativa 3: Busca por descrição...'])
        
        try {
          const searchResponse = await api.searchProductsByDescription('produto', 1, 50)
          if (searchResponse.produto_servico_cadastro) {
            products = searchResponse.produto_servico_cadastro
          }
        } catch (error) {
          setSyncLog(prev => [...prev, `❌ Erro na busca por descrição: ${error instanceof Error ? error.message : 'Erro desconhecido'}`])
        }
      }
      
      console.log('🔍 Debug - Produtos encontrados:', {
        total: products.length,
        sample: products.slice(0, 3).map(p => ({
          codigo: p.codigo_produto,
          descricao: p.descricao,
          inativo: p.inativo,
          bloqueado: p.bloqueado
        }))
      })
      
      setOmieProducts(products)
      setShowPreview(true)
      
      if (products.length === 0) {
        setSyncLog(prev => [
          ...prev, 
          '⚠️ Nenhum produto encontrado após todas as tentativas',
          '💡 Possíveis causas:',
          '   - Problema de permissões da aplicação no OMIE',
          '   - Produtos não estão no escopo da aplicação',
          '   - Configuração incorreta da API',
          '   - Necessário configurar permissões específicas',
          '🔍 Execute o teste avançado no console para mais detalhes'
        ])
      } else {
        setSyncLog(prev => [...prev, `✅ ${products.length} produtos encontrados no Omie`])
      }
    } catch (error) {
      console.error('❌ Erro ao buscar produtos:', error)
      setSyncLog(prev => [
        ...prev, 
        `❌ Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        '🔍 Verifique o console do navegador para mais detalhes'
      ])
    } finally {
      setIsSyncing(false)
    }
  }, [isConfigured, credentials])

  // Sincronizar produtos selecionados
  const handleSyncSelectedProducts = useCallback(async () => {
    if (selectedProducts.size === 0) {
      alert('⚠️ Selecione pelo menos um produto para sincronizar')
      return
    }

    setIsSyncing(true)
    setSyncProgress(0)
    setSyncLog(['🚀 Iniciando sincronização...'])
    
    const stats: SyncStats = {
      total: selectedProducts.size,
      imported: 0,
      updated: 0,
      errors: 0,
      skipped: 0
    }

    const selectedOmieProducts = omieProducts.filter(p => 
      selectedProducts.has(p.codigo_produto)
    )

    for (let i = 0; i < selectedOmieProducts.length; i++) {
      const omieProduct = selectedOmieProducts[i]
      const progress = ((i + 1) / selectedOmieProducts.length) * 100
      setSyncProgress(progress)

      try {
        const internalProduct = OmieAPI.mapOmieToInternalProduct(omieProduct)
        
        // Verificar se produto já existe
        const existingProduct = products.find(p => 
          p.code === internalProduct.code || 
          p.name === internalProduct.name
        )

        if (existingProduct) {
          // Atualizar produto existente
          await updateProduct(existingProduct.id, {
            ...internalProduct,
            quantity: existingProduct.quantity // Preservar estoque atual
          })
          stats.updated++
          setSyncLog(prev => [...prev, `🔄 Atualizado: ${internalProduct.name}`])
        } else {
          // Criar novo produto
          await addProduct(internalProduct)
          stats.imported++
          setSyncLog(prev => [...prev, `➕ Importado: ${internalProduct.name}`])
        }

        // Delay para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 100))

      } catch (error) {
        stats.errors++
        setSyncLog(prev => [...prev, `❌ Erro em ${omieProduct.descricao}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`])
      }
    }

    setSyncStats(stats)
    setSyncLog(prev => [...prev, '✅ Sincronização concluída!'])
    setIsSyncing(false)
    setSyncProgress(100)

    alert(`✅ Sincronização concluída!\n\n` +
      `📦 Total: ${stats.total}\n` +
      `➕ Importados: ${stats.imported}\n` +
      `🔄 Atualizados: ${stats.updated}\n` +
      `❌ Erros: ${stats.errors}`)
  }, [selectedProducts, omieProducts, products, updateProduct, addProduct])

  // Sincronizar todos os produtos
  const handleSyncAllProducts = useCallback(async () => {
    if (!isConfigured) {
      alert('⚠️ Configure a integração primeiro')
      return
    }

    const confirmSync = confirm(
      '⚠️ ATENÇÃO!\n\n' +
      'Esta operação irá sincronizar TODOS os produtos ativos do Omie.\n' +
      'Isso pode demorar alguns minutos e alterar muitos produtos.\n\n' +
      'Deseja continuar?'
    )

    if (!confirmSync) return

    setIsSyncing(true)
    setSyncProgress(0)
    setSyncLog(['🚀 Iniciando sincronização completa...'])

    try {
      const api = new OmieAPI(credentials)
      const omieProducts = await api.getActiveProducts()
      
      setSyncLog(prev => [...prev, `📦 ${omieProducts.length} produtos encontrados no Omie`])

      const stats: SyncStats = {
        total: omieProducts.length,
        imported: 0,
        updated: 0,
        errors: 0,
        skipped: 0
      }

      for (let i = 0; i < omieProducts.length; i++) {
        const omieProduct = omieProducts[i]
        const progress = ((i + 1) / omieProducts.length) * 100
        setSyncProgress(progress)

        try {
          const internalProduct = OmieAPI.mapOmieToInternalProduct(omieProduct)
          
          // Verificar se produto já existe
          const existingProduct = products.find(p => 
            p.code === internalProduct.code || 
            p.name === internalProduct.name
          )

          if (existingProduct) {
            // Atualizar produto existente
            await updateProduct(existingProduct.id, {
              ...internalProduct,
              quantity: existingProduct.quantity // Preservar estoque atual
            })
            stats.updated++
            
            if (i % 10 === 0) { // Log a cada 10 produtos
              setSyncLog(prev => [...prev, `🔄 Atualizados: ${stats.updated}/${stats.total}`])
            }
          } else {
            // Criar novo produto
            await addProduct(internalProduct)
            stats.imported++
            
            if (i % 10 === 0) { // Log a cada 10 produtos
              setSyncLog(prev => [...prev, `➕ Importados: ${stats.imported}/${stats.total}`])
            }
          }

          // Delay para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 50))

        } catch (error) {
          stats.errors++
          setSyncLog(prev => [...prev, `❌ Erro em ${omieProduct.descricao}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`])
        }
      }

      setSyncStats(stats)
      setSyncLog(prev => [...prev, '✅ Sincronização completa concluída!'])
      
      alert(`✅ Sincronização completa concluída!\n\n` +
        `📦 Total: ${stats.total}\n` +
        `➕ Importados: ${stats.imported}\n` +
        `🔄 Atualizados: ${stats.updated}\n` +
        `❌ Erros: ${stats.errors}`)

    } catch (error) {
      setSyncLog(prev => [...prev, `❌ Erro na sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`])
      alert(`❌ Erro na sincronização: ${error instanceof Error ? error.message : 'Erro desconhecido'}`)
    } finally {
      setIsSyncing(false)
      setSyncProgress(100)
    }
  }, [isConfigured, credentials, products, updateProduct, addProduct])

  // Toggle seleção de produto
  const toggleProductSelection = (codigo: string) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(codigo)) {
        newSet.delete(codigo)
      } else {
        newSet.add(codigo)
      }
      return newSet
    })
  }

  // Selecionar todos os produtos
  const selectAllProducts = () => {
    setSelectedProducts(new Set(omieProducts.map(p => p.codigo_produto)))
  }

  // Limpar seleção
  const clearSelection = () => {
    setSelectedProducts(new Set())
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[95vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <Database className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-xl font-semibold text-gray-900">
                Integração ERP Omie
              </h2>
              <p className="text-sm text-gray-500">
                Sincronize produtos do seu ERP Omie
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6">
          {!showPreview ? (
            /* Configuração e Dashboard */
            <div className="space-y-6">
              {/* Status da Conexão */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-medium text-gray-900">Status da Integração</h3>
                  <div className="flex items-center space-x-2">
                    {connectionStatus === 'success' && (
                      <span className="flex items-center text-green-600">
                        <CheckCircle className="h-5 w-5 mr-2" />
                        Conectado
                      </span>
                    )}
                    {connectionStatus === 'error' && (
                      <span className="flex items-center text-red-600">
                        <XCircle className="h-5 w-5 mr-2" />
                        Erro na conexão
                      </span>
                    )}
                    {connectionStatus === 'idle' && (
                      <span className="flex items-center text-gray-600">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        Não testado
                      </span>
                    )}
                  </div>
                </div>

                {/* Estatísticas do Omie */}
                {omieStats && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-blue-600">{omieStats.total}</p>
                      <p className="text-sm text-gray-600">Total de Produtos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600">{omieStats.active}</p>
                      <p className="text-sm text-gray-600">Produtos Ativos</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">{omieStats.families.length}</p>
                      <p className="text-sm text-gray-600">Famílias</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-orange-600">{omieStats.brands.length}</p>
                      <p className="text-sm text-gray-600">Marcas</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Configuração de Credenciais */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                  <Settings className="h-5 w-5 text-gray-600 mr-2" />
                  Configuração da API
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Key *
                    </label>
                    <input
                      type="text"
                      value={credentials.appKey}
                      onChange={(e) => setCredentials(prev => ({ ...prev, appKey: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Digite seu App Key do Omie"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      App Secret *
                    </label>
                    <div className="relative">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        value={credentials.appSecret}
                        onChange={(e) => setCredentials(prev => ({ ...prev, appSecret: e.target.value }))}
                        className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Digite seu App Secret do Omie"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showSecret ? (
                          <EyeOff className="h-4 w-4 text-gray-400" />
                        ) : (
                          <Eye className="h-4 w-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    URL Base da API (opcional)
                  </label>
                  <input
                    type="url"
                    value={credentials.baseUrl}
                    onChange={(e) => setCredentials(prev => ({ ...prev, baseUrl: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://app.omie.com.br/api/v1"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    onClick={handleSaveCredentials}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Save className="h-4 w-4" />
                    <span>Salvar Credenciais</span>
                  </button>

                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConnection || !credentials.appKey || !credentials.appSecret}
                    className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                  >
                    {isTestingConnection ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <TestTube className="h-4 w-4" />
                    )}
                    <span>Testar Conexão</span>
                  </button>
                </div>

                {connectionError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-700">
                      <strong>Erro:</strong> {connectionError}
                    </p>
                  </div>
                )}
              </div>

              {/* Ações de Sincronização */}
              {isConfigured && connectionStatus === 'success' && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Zap className="h-5 w-5 text-yellow-600 mr-2" />
                    Sincronização de Produtos
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={handlePreviewProducts}
                      disabled={isSyncing}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Package className="h-5 w-5" />
                      <span>Visualizar Produtos</span>
                    </button>

                    <button
                      onClick={handleSyncAllProducts}
                      disabled={isSyncing}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400 transition-colors"
                    >
                      <Download className="h-5 w-5" />
                      <span>Sincronizar Todos</span>
                    </button>

                    <button
                      onClick={() => {
                        OmieCredentialsManager.clear()
                        setIsConfigured(false)
                        setConnectionStatus('idle')
                        setOmieStats(null)
                        alert('✅ Configuração limpa com sucesso!')
                      }}
                      className="flex items-center justify-center space-x-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      <XCircle className="h-5 w-5" />
                      <span>Limpar Config</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Log de Sincronização */}
              {syncLog.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
                    <Clock className="h-5 w-5 text-blue-600 mr-2" />
                    Log de Sincronização
                  </h3>

                  {isSyncing && (
                    <div className="mb-4">
                      <div className="flex justify-between text-sm text-gray-600 mb-2">
                        <span>Progresso</span>
                        <span>{syncProgress.toFixed(1)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${syncProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
                    <div className="space-y-1 font-mono text-sm">
                      {syncLog.map((log, index) => (
                        <div key={index} className="text-gray-700">
                          <span className="text-gray-500">[{new Date().toLocaleTimeString()}]</span> {log}
                        </div>
                      ))}
                    </div>
                  </div>

                  {syncStats && (
                    <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <p className="text-lg font-bold text-blue-600">{syncStats.total}</p>
                        <p className="text-xs text-gray-600">Total</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-green-600">{syncStats.imported}</p>
                        <p className="text-xs text-gray-600">Importados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-orange-600">{syncStats.updated}</p>
                        <p className="text-xs text-gray-600">Atualizados</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-bold text-red-600">{syncStats.errors}</p>
                        <p className="text-xs text-gray-600">Erros</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            /* Preview e Seleção de Produtos */
            <div className="space-y-6">
              {/* Header do Preview */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    Produtos do Omie ({omieProducts.length})
                  </h3>
                  <p className="text-sm text-gray-500">
                    Selecione os produtos que deseja sincronizar
                  </p>
                </div>
                <div className="flex items-center space-x-3">
                  <span className="text-sm text-gray-600">
                    {selectedProducts.size} selecionados
                  </span>
                  <button
                    onClick={selectAllProducts}
                    className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    Selecionar Todos
                  </button>
                  <button
                    onClick={clearSelection}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Limpar
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
                  >
                    Voltar
                  </button>
                </div>
              </div>

              {/* Ações de Sincronização */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleSyncSelectedProducts}
                  disabled={isSyncing || selectedProducts.size === 0}
                  className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  <span>Sincronizar Selecionados ({selectedProducts.size})</span>
                </button>

                {isSyncing && (
                  <div className="flex items-center space-x-2 text-blue-600">
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Sincronizando... {syncProgress.toFixed(1)}%</span>
                  </div>
                )}
              </div>

              {/* Lista de Produtos */}
              <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                <div className="max-h-96 overflow-y-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50 sticky top-0">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          <input
                            type="checkbox"
                            checked={selectedProducts.size === omieProducts.length && omieProducts.length > 0}
                            onChange={() => {
                              if (selectedProducts.size === omieProducts.length) {
                                clearSelection()
                              } else {
                                selectAllProducts()
                              }
                            }}
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Código
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Produto
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Família
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Marca
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {omieProducts.map((product) => (
                        <tr 
                          key={product.codigo_produto}
                          className={`hover:bg-gray-50 ${
                            selectedProducts.has(product.codigo_produto) ? 'bg-blue-50' : ''
                          }`}
                        >
                          <td className="px-6 py-4 whitespace-nowrap">
                            <input
                              type="checkbox"
                              checked={selectedProducts.has(product.codigo_produto)}
                              onChange={() => toggleProductSelection(product.codigo_produto)}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                            {product.codigo_produto}
                          </td>
                          <td className="px-6 py-4 text-sm text-gray-900">
                            <div>
                              <div className="font-medium">{product.descricao}</div>
                              <div className="text-gray-500">{product.unidade}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.descricao_familia || 'Sem família'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            R$ {(product.valor_unitario || 0).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {product.marca || 'Sem marca'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 