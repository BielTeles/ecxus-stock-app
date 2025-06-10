'use client'

import { useState, useMemo } from 'react'
import { 
  AlertTriangle, Package, Clock, User, TrendingDown, Calendar,
  Bell, BellOff, Eye, EyeOff, Filter, CheckCircle, X, ArrowRight,
  ExternalLink, RefreshCw, Settings as SettingsIcon, Mail, MessageSquare,
  History, Plus, Zap, Star
} from 'lucide-react'
import { useProducts } from '@/contexts/ProductContextV3'
import { useSuppliers } from '@/contexts/SupplierContext'
import { useProductionOrders } from '@/contexts/ProductionOrderContext'
import { useCurrency } from '@/hooks/useCurrency'

type AlertType = 'critical' | 'warning' | 'info'
type AlertCategory = 'all' | 'stock' | 'orders' | 'suppliers' | 'system'

interface Alert {
  id: string
  type: AlertType
  category: AlertCategory
  title: string
  description: string
  relatedItem?: {
    id: string | number
    name: string
    type: 'product' | 'supplier' | 'order'
  }
  timestamp: Date
  isRead: boolean
  actionRequired: boolean
  actions?: Array<{
    label: string
    onClick: () => void
    type: 'primary' | 'secondary'
  }>
}

export default function AlertsTab() {
  const { products } = useProducts()
  const { suppliers } = useSuppliers()
  const { productionOrders } = useProductionOrders()
  const { formatCurrency } = useCurrency()
  
  const [selectedCategory, setSelectedCategory] = useState<AlertCategory>('all')
  const [showOnlyUnread, setShowOnlyUnread] = useState(false)
  const [readAlerts, setReadAlerts] = useState<Set<string>>(new Set())
  const [showHistory, setShowHistory] = useState(false)
  const [showNotificationSettings, setShowNotificationSettings] = useState(false)
  const [showCustomAlert, setShowCustomAlert] = useState(false)

  // Gerar alertas dinamicamente baseado nos dados
  const generatedAlerts = useMemo((): Alert[] => {
    const alerts: Alert[] = []
    const now = new Date()

    // 1. ALERTAS DE ESTOQUE BAIXO
    products.forEach(product => {
      if ((product.quantity || 0) <= (product.minStock || 0)) {
        const isCritico = (product.quantity || 0) === 0
        alerts.push({
          id: `stock-${product.id}`,
          type: isCritico ? 'critical' : 'warning',
          category: 'stock',
          title: isCritico ? '🚨 Produto em falta' : '⚠️ Estoque baixo',
          description: `${product.name} está ${isCritico ? 'zerado' : 'com estoque baixo'}: ${product.quantity || 0} unidades (mín: ${product.minStock || 0})`,
          relatedItem: {
            id: product.id,
            name: product.name,
            type: 'product'
          },
          timestamp: now,
          isRead: readAlerts.has(`stock-${product.id}`),
          actionRequired: true,
          actions: [
            {
              label: 'Ver Produto',
              onClick: () => {/* Navegar para produto */},
              type: 'primary'
            },
            {
              label: 'Solicitar Compra',
              onClick: () => {/* Abrir modal de compra */},
              type: 'secondary'
            }
          ]
        })
      }
    })

    // 2. ALERTAS DE PRODUTOS CAROS SEM ESTOQUE
    products.forEach(product => {
      const value = (product.quantity || 0) * (product.price || 0)
      if ((product.quantity || 0) <= (product.minStock || 0) && (product.price || 0) > 100) {
        alerts.push({
          id: `expensive-${product.id}`,
          type: 'warning',
          category: 'stock',
          title: '💰 Produto caro em falta',
          description: `${product.name} (${formatCurrency(product.price || 0)}) está com estoque baixo`,
          relatedItem: {
            id: product.id,
            name: product.name,
            type: 'product'
          },
          timestamp: now,
          isRead: readAlerts.has(`expensive-${product.id}`),
          actionRequired: true
        })
      }
    })

    // 3. ALERTAS DE ORDENS ATRASADAS
    productionOrders.forEach(order => {
      const plannedDate = new Date(order.plannedStartDate)
      const daysDiff = Math.floor((now.getTime() - plannedDate.getTime()) / (1000 * 60 * 60 * 24))
      
      if (order.status === 'PLANNED' && daysDiff > 0) {
        alerts.push({
          id: `order-delayed-${order.id}`,
          type: 'critical',
          category: 'orders',
          title: '🚨 Ordem atrasada',
          description: `Ordem #${order.id} está ${daysDiff} dia(s) atrasada para iniciar`,
          relatedItem: {
            id: order.id,
            name: `Ordem #${order.id}`,
            type: 'order'
          },
          timestamp: now,
          isRead: readAlerts.has(`order-delayed-${order.id}`),
          actionRequired: true,
          actions: [
            {
              label: 'Iniciar Ordem',
              onClick: () => {/* Iniciar ordem */},
              type: 'primary'
            }
          ]
        })
      }

      if (order.status === 'IN_PROGRESS') {
        const estimatedEnd = new Date(plannedDate.getTime() + order.estimatedDuration * 60 * 1000)
        const progressDays = Math.floor((now.getTime() - estimatedEnd.getTime()) / (1000 * 60 * 60 * 24))
        
        if (progressDays > 0) {
          alerts.push({
            id: `order-overdue-${order.id}`,
            type: 'critical',
            category: 'orders',
            title: '⏰ Ordem ultrapassou prazo',
            description: `Ordem #${order.id} está ${progressDays} dia(s) além do prazo estimado`,
            relatedItem: {
              id: order.id,
              name: `Ordem #${order.id}`,
              type: 'order'
            },
            timestamp: now,
            isRead: readAlerts.has(`order-overdue-${order.id}`),
            actionRequired: true
          })
        }
      }
    })

    // 4. ALERTAS DE FORNECEDORES
    suppliers.forEach(supplier => {
      // Fornecedores sem contato há muito tempo
      if (!supplier.lastContact) {
        alerts.push({
          id: `supplier-nocontact-${supplier.id}`,
          type: 'info',
          category: 'suppliers',
          title: '📞 Fornecedor sem contato',
          description: `${supplier.name} não tem registro de último contato`,
          relatedItem: {
            id: supplier.id,
            name: supplier.name,
            type: 'supplier'
          },
          timestamp: now,
          isRead: readAlerts.has(`supplier-nocontact-${supplier.id}`),
          actionRequired: false
        })
      }

      // Fornecedores com rating baixo
      if ((supplier.rating || 0) < 3) {
        alerts.push({
          id: `supplier-lowrating-${supplier.id}`,
          type: 'warning',
          category: 'suppliers',
          title: '⭐ Fornecedor com rating baixo',
          description: `${supplier.name} tem rating de ${supplier.rating || 0} estrelas`,
          relatedItem: {
            id: supplier.id,
            name: supplier.name,
            type: 'supplier'
          },
          timestamp: now,
          isRead: readAlerts.has(`supplier-lowrating-${supplier.id}`),
          actionRequired: false
        })
      }
    })

    // 5. ALERTAS DO SISTEMA
    const totalValue = products.reduce((sum, p) => sum + (p.quantity || 0) * (p.price || 0), 0)
    if (totalValue > 100000) {
      alerts.push({
        id: 'system-highvalue',
        type: 'info',
        category: 'system',
        title: '💎 Alto valor em estoque',
        description: `Valor total em estoque: ${formatCurrency(totalValue)} - considere revisar estratégias`,
        timestamp: now,
        isRead: readAlerts.has('system-highvalue'),
        actionRequired: false
      })
    }

    // Categorias vazias
    const categoriesWithProducts = new Set(products.map(p => p.category))
    if (categoriesWithProducts.size < 3) {
      alerts.push({
        id: 'system-categories',
        type: 'info',
        category: 'system',
        title: '📂 Poucas categorias de produtos',
        description: `Apenas ${categoriesWithProducts.size} categorias em uso - considere organizar melhor`,
        timestamp: now,
        isRead: readAlerts.has('system-categories'),
        actionRequired: false
      })
    }

    return alerts.sort((a, b) => {
      // Ordenar por: não lidos primeiro, depois por tipo (crítico primeiro), depois por data
      if (a.isRead !== b.isRead) return a.isRead ? 1 : -1
      if (a.type !== b.type) {
        const typeOrder = { critical: 0, warning: 1, info: 2 }
        return typeOrder[a.type] - typeOrder[b.type]
      }
      return b.timestamp.getTime() - a.timestamp.getTime()
    })
  }, [products, suppliers, productionOrders, formatCurrency, readAlerts])

  // Filtrar alertas
  const filteredAlerts = useMemo(() => {
    return generatedAlerts.filter(alert => {
      const matchesCategory = selectedCategory === 'all' || alert.category === selectedCategory
      const matchesReadFilter = !showOnlyUnread || !alert.isRead
      return matchesCategory && matchesReadFilter
    })
  }, [generatedAlerts, selectedCategory, showOnlyUnread])

  // Estatísticas
  const stats = useMemo(() => {
    const total = generatedAlerts.length
    const unread = generatedAlerts.filter(a => !a.isRead).length
    const critical = generatedAlerts.filter(a => a.type === 'critical').length
    const actionRequired = generatedAlerts.filter(a => a.actionRequired).length
    
    return { total, unread, critical, actionRequired }
  }, [generatedAlerts])

  const markAsRead = (alertId: string) => {
    setReadAlerts(prev => new Set([...prev, alertId]))
  }

  const markAllAsRead = () => {
    setReadAlerts(new Set(generatedAlerts.map(a => a.id)))
  }

  const getAlertIcon = (type: AlertType) => {
    switch (type) {
      case 'critical': return <AlertTriangle className="h-5 w-5 text-red-500" />
      case 'warning': return <AlertTriangle className="h-5 w-5 text-orange-500" />
      case 'info': return <Bell className="h-5 w-5 text-blue-500" />
    }
  }

  const getAlertColors = (type: AlertType) => {
    switch (type) {
      case 'critical': return 'border-red-200 bg-red-50'
      case 'warning': return 'border-orange-200 bg-orange-50'
      case 'info': return 'border-blue-200 bg-blue-50'
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-8 w-8 text-orange-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Central de Alertas</h1>
            <p className="text-gray-600">Monitore problemas e oportunidades em tempo real</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowCustomAlert(true)}
            className="flex items-center space-x-2 px-3 py-2 text-purple-600 bg-purple-50 border border-purple-200 rounded-lg hover:bg-purple-100"
          >
            <Plus className="h-4 w-4" />
            <span>Alerta Personalizado</span>
          </button>
          <button 
            onClick={() => setShowHistory(true)}
            className="flex items-center space-x-2 px-3 py-2 text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100"
          >
            <History className="h-4 w-4" />
            <span>Histórico</span>
          </button>
          <button 
            onClick={() => setShowNotificationSettings(true)}
            className="flex items-center space-x-2 px-3 py-2 text-orange-600 bg-orange-50 border border-orange-200 rounded-lg hover:bg-orange-100"
          >
            <Bell className="h-4 w-4" />
            <span>Notificações</span>
          </button>
          <button 
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizar</span>
          </button>
          {stats.unread > 0 && (
            <button 
              onClick={markAllAsRead}
              className="flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <CheckCircle className="h-4 w-4" />
              <span>Marcar Todos Lidos</span>
            </button>
          )}
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Alertas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <Bell className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Não Lidos</p>
              <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
            </div>
            <BellOff className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Críticos</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Ação Necessária</p>
              <p className="text-2xl font-bold text-orange-600">{stats.actionRequired}</p>
            </div>
            <Clock className="h-8 w-8 text-orange-600" />
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as AlertCategory)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Todas as Categorias</option>
                <option value="stock">Estoque</option>
                <option value="orders">Ordens</option>
                <option value="suppliers">Fornecedores</option>
                <option value="system">Sistema</option>
              </select>
            </div>
            
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={showOnlyUnread}
                onChange={(e) => setShowOnlyUnread(e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-700">Apenas não lidos</span>
            </label>
          </div>
          
          <div className="text-sm text-gray-600">
            {filteredAlerts.length} alerta(s) encontrado(s)
          </div>
        </div>
      </div>

      {/* Lista de Alertas */}
      <div className="space-y-4">
        {filteredAlerts.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">🎉 Tudo sob controle!</h3>
            <p className="text-gray-600 mb-4">
              {selectedCategory === 'all' 
                ? 'Não há alertas no momento. O sistema está funcionando perfeitamente!'
                : `Não há alertas na categoria "${selectedCategory}" no momento.`
              }
            </p>
            <p className="text-sm text-gray-500">
              O sistema monitora automaticamente: estoque baixo, ordens atrasadas, fornecedores e métricas do sistema.
            </p>
          </div>
        ) : (
          filteredAlerts.map(alert => (
            <div
              key={alert.id}
              className={`bg-white rounded-lg border-l-4 p-6 shadow-sm hover:shadow-md transition-shadow ${
                alert.isRead ? 'opacity-75' : ''
              } ${getAlertColors(alert.type)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3 flex-1">
                  {getAlertIcon(alert.type)}
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h3 className="font-medium text-gray-900">{alert.title}</h3>
                      {!alert.isRead && (
                        <span className="w-2 h-2 bg-blue-600 rounded-full"></span>
                      )}
                      {alert.actionRequired && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-800 text-xs font-medium rounded-full">
                          Ação Necessária
                        </span>
                      )}
                    </div>
                    <p className="text-gray-700 mb-2">{alert.description}</p>
                    
                    {alert.relatedItem && (
                      <div className="flex items-center text-sm text-gray-500 mb-3">
                        <span className="font-medium">{alert.relatedItem.type === 'product' ? '📦' : alert.relatedItem.type === 'supplier' ? '🏢' : '📋'}</span>
                        <span className="ml-1">{alert.relatedItem.name}</span>
                      </div>
                    )}
                    
                    {alert.actions && (
                      <div className="flex items-center space-x-2">
                        {alert.actions.map((action, index) => (
                          <button
                            key={index}
                            onClick={action.onClick}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              action.type === 'primary'
                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                            }`}
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 ml-4">
                  <span className="text-xs text-gray-500">
                    {alert.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {!alert.isRead && (
                    <button
                      onClick={() => markAsRead(alert.id)}
                      className="p-1 text-gray-400 hover:text-blue-600 transition-colors"
                      title="Marcar como lido"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Configurações de Alertas */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <SettingsIcon className="h-5 w-5 mr-2 text-gray-600" />
          Configurações de Alertas
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm text-gray-700">Alertas de estoque baixo</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm text-gray-700">Alertas de ordens atrasadas</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm text-gray-700">Alertas de fornecedores</span>
          </label>
          <label className="flex items-center">
            <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
            <span className="ml-2 text-sm text-gray-700">Alertas do sistema</span>
          </label>
        </div>
      </div>

      {/* Custom Alert Modal */}
      {showCustomAlert && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Plus className="h-5 w-5 text-purple-600 mr-2" />
              Criar Alerta Personalizado
            </h3>
            
            <form onSubmit={(e) => {
              e.preventDefault()
              const formData = new FormData(e.currentTarget)
              const title = formData.get('title') as string
              const description = formData.get('description') as string
              const type = formData.get('type') as AlertType
              
              alert(`✅ Alerta personalizado criado!\n\nTítulo: ${title}\nDescrição: ${description}\nTipo: ${type}\n\nEsta funcionalidade seria integrada ao sistema de alertas.`)
              setShowCustomAlert(false)
            }}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Título do Alerta
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Ex: Revisar fornecedor X"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descrição
                  </label>
                  <textarea
                    name="description"
                    rows={3}
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Descreva o que precisa ser feito..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Prioridade
                  </label>
                  <select
                    name="type"
                    required
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  >
                    <option value="info">Informativo</option>
                    <option value="warning">Atenção</option>
                    <option value="critical">Crítico</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCustomAlert(false)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  Criar Alerta
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Notification Settings Modal */}
      {showNotificationSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Bell className="h-5 w-5 text-orange-600 mr-2" />
              Configurações de Notificações
            </h3>
            
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Canais de Notificação</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail className="h-5 w-5 text-blue-600 mr-2" />
                      <span className="text-sm text-gray-700">Email</span>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <MessageSquare className="h-5 w-5 text-green-600 mr-2" />
                      <span className="text-sm text-gray-700">SMS</span>
                    </div>
                    <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                  <label className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Bell className="h-5 w-5 text-purple-600 mr-2" />
                      <span className="text-sm text-gray-700">Push Notifications</span>
                    </div>
                    <input type="checkbox" defaultChecked className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                  </label>
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Frequência de Notificações</h4>
                <select className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500 focus:border-transparent">
                  <option value="immediate">Imediata</option>
                  <option value="hourly">A cada hora</option>
                  <option value="daily">Diária (resumo)</option>
                  <option value="weekly">Semanal</option>
                </select>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Horário de Funcionamento</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Das</label>
                    <input type="time" defaultValue="08:00" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-600 mb-1">Até</label>
                    <input type="time" defaultValue="18:00" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
                  </div>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-sm text-blue-800">
                  💡 <strong>Dica:</strong> Configure notificações para receber alertas importantes mesmo quando não estiver no sistema.
                </p>
              </div>
            </div>
            
            <div className="mt-6 flex justify-end space-x-3">
              <button
                onClick={() => setShowNotificationSettings(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => {
                  alert('✅ Configurações de notificação salvas!\n\nAs notificações serão enviadas conforme configurado.')
                  setShowNotificationSettings(false)
                }}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Salvar Configurações
              </button>
            </div>
          </div>
        </div>
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <History className="h-5 w-5 text-gray-600 mr-2" />
              Histórico de Alertas
            </h3>
            
            <div className="space-y-4">
              {/* Simulação de histórico */}
              {[
                {
                  date: '2024-01-15 14:30',
                  type: 'critical',
                  title: 'Produto em falta resolvido',
                  description: 'Resistor 10kΩ foi reabastecido - estoque atual: 150 unidades',
                  action: 'Reabastecimento realizado'
                },
                {
                  date: '2024-01-15 10:15',
                  type: 'warning',
                  title: 'Ordem de produção iniciada',
                  description: 'Ordem #1234 foi iniciada com 2 horas de atraso',
                  action: 'Ordem iniciada manualmente'
                },
                {
                  date: '2024-01-14 16:45',
                  type: 'info',
                  title: 'Novo fornecedor cadastrado',
                  description: 'Fornecedor TechComponents foi adicionado ao sistema',
                  action: 'Cadastro aprovado'
                },
                {
                  date: '2024-01-14 09:20',
                  type: 'critical',
                  title: 'Estoque crítico detectado',
                  description: 'Capacitor 100µF atingiu estoque zero',
                  action: 'Pedido de compra criado'
                },
                {
                  date: '2024-01-13 15:30',
                  type: 'warning',
                  title: 'Fornecedor com atraso',
                  description: 'Entrega da ElectroSupply está 3 dias atrasada',
                  action: 'Fornecedor contatado'
                }
              ].map((item, index) => (
                <div key={index} className={`border-l-4 p-4 rounded-lg ${getAlertColors(item.type as AlertType)}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getAlertIcon(item.type as AlertType)}
                      <div>
                        <h4 className="font-medium text-gray-900">{item.title}</h4>
                        <p className="text-gray-700 text-sm mt-1">{item.description}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>📅 {item.date}</span>
                          <span>✅ {item.action}</span>
                        </div>
                      </div>
                    </div>
                    <Star className="h-4 w-4 text-yellow-500" />
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 flex justify-between">
              <button
                onClick={() => alert('📊 Relatório de alertas seria exportado em formato PDF/Excel')}
                className="flex items-center space-x-2 px-4 py-2 text-blue-600 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100"
              >
                <ExternalLink className="h-4 w-4" />
                <span>Exportar Relatório</span>
              </button>
              <button
                onClick={() => setShowHistory(false)}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 