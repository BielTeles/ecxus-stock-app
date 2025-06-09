'use client'

import { useState } from 'react'
import { FileText, Plus, Eye, Star, Clock, CheckCircle, X, DollarSign, TrendingUp } from 'lucide-react'
import { useSuppliers } from '@/contexts/SupplierContext'
import { useProducts } from '@/contexts/ProductContext'
import { useCurrency } from '@/hooks/useCurrency'

interface QuotesListProps {
  searchTerm: string
}

interface Quote {
  id: number
  quoteNumber: string
  supplierId: number
  status: 'PENDING' | 'RECEIVED' | 'ANALYZING' | 'APPROVED' | 'REJECTED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  requestDate: string
  responseDate?: string
  expiryDate: string
  totalValue: number
  requestedBy: string
  comparisonScore?: number
}

const STATUS_COLORS = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  RECEIVED: 'bg-blue-100 text-blue-800',
  ANALYZING: 'bg-purple-100 text-purple-800',
  APPROVED: 'bg-green-100 text-green-800',
  REJECTED: 'bg-red-100 text-red-800'
}

const STATUS_LABELS = {
  PENDING: 'Pendente',
  RECEIVED: 'Recebida',
  ANALYZING: 'Em Análise',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada'
}

export default function QuotesList({ searchTerm }: QuotesListProps) {
  const { suppliers } = useSuppliers()
  const { formatCurrency } = useCurrency()
  
  const [selectedQuote, setSelectedQuote] = useState<Quote | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const [quotes] = useState<Quote[]>([
    {
      id: 1,
      quoteNumber: 'QT-2024-001',
      supplierId: 1,
      status: 'RECEIVED',
      priority: 'HIGH',
      requestDate: '2024-01-10T09:00:00Z',
      responseDate: '2024-01-12T14:30:00Z',
      expiryDate: '2024-02-10T23:59:59Z',
      totalValue: 245,
      requestedBy: 'João Silva',
      comparisonScore: 85
    },
    {
      id: 2,
      quoteNumber: 'QT-2024-002',
      supplierId: 2,
      status: 'ANALYZING',
      priority: 'MEDIUM',
      requestDate: '2024-01-15T11:00:00Z',
      responseDate: '2024-01-17T16:00:00Z',
      expiryDate: '2024-02-15T23:59:59Z',
      totalValue: 342.5,
      requestedBy: 'Ana Costa',
      comparisonScore: 72
    }
  ])

  const filteredQuotes = quotes.filter(quote => {
    const supplier = suppliers.find(s => s.id === quote.supplierId)
    const matchesSearch = searchTerm === '' || 
      quote.quoteNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      supplier?.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || quote.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const stats = {
    total: quotes.length,
    pending: quotes.filter(q => ['PENDING', 'RECEIVED'].includes(q.status)).length,
    analyzing: quotes.filter(q => q.status === 'ANALYZING').length,
    totalValue: quotes.reduce((sum, q) => sum + q.totalValue, 0)
  }

  const getSupplierName = (supplierId: number) => {
    return suppliers.find(s => s.id === supplierId)?.name || 'Fornecedor não encontrado'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR')
  }

  const isExpired = (expiryDate: string) => {
    return new Date(expiryDate) < new Date()
  }

  return (
    <div className="space-y-6">
      {/* Header com Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total de Cotações</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <FileText className="h-8 w-8 text-blue-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Pendentes</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
            </div>
            <Clock className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Em Análise</p>
              <p className="text-2xl font-bold text-purple-600">{stats.analyzing}</p>
            </div>
            <TrendingUp className="h-8 w-8 text-purple-600" />
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Valor Total</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalValue)}</p>
            </div>
            <DollarSign className="h-8 w-8 text-green-600" />
          </div>
        </div>
      </div>

      {/* Filtros e Controles */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <label className="text-sm font-medium text-gray-700">Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-1 text-sm focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Todos</option>
                {Object.entries(STATUS_LABELS).map(([key, value]) => (
                  <option key={key} value={key}>{value}</option>
                ))}
              </select>
            </div>
          </div>
          
          <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors">
            <Plus className="h-4 w-4" />
            <span>Nova Cotação</span>
          </button>
        </div>
      </div>

      {/* Lista de Cotações */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Cotações ({filteredQuotes.length})
          </h3>
        </div>

        {filteredQuotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma cotação encontrada</h3>
            <p className="text-gray-600">Solicite cotações para comparar preços e condições.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredQuotes.map(quote => (
              <div key={quote.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h4 className="font-semibold text-gray-900 text-lg">{quote.quoteNumber}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[quote.status]}`}>
                        {STATUS_LABELS[quote.status]}
                      </span>
                      {quote.comparisonScore && (
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm font-medium text-gray-600">{quote.comparisonScore}/100</span>
                        </div>
                      )}
                      {isExpired(quote.expiryDate) && (
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Expirada
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div className="space-y-1">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Fornecedor:</span> {getSupplierName(quote.supplierId)}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Solicitado por:</span> {quote.requestedBy}
                        </p>
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Data Solicitação:</span> {formatDate(quote.requestDate)}
                        </p>
                      </div>
                      <div className="space-y-1">
                        {quote.responseDate && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Data Resposta:</span> {formatDate(quote.responseDate)}
                          </p>
                        )}
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Vencimento:</span> {formatDate(quote.expiryDate)}
                        </p>
                        <p className="text-sm font-medium text-gray-900">
                          <span className="font-medium">Valor:</span> {formatCurrency(quote.totalValue)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => setSelectedQuote(quote)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Ver detalhes"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal de Detalhes */}
      {selectedQuote && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{selectedQuote.quoteNumber}</h2>
                <p className="text-sm text-gray-500">Cotação - {getSupplierName(selectedQuote.supplierId)}</p>
              </div>
              <button 
                onClick={() => setSelectedQuote(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${STATUS_COLORS[selectedQuote.status]}`}>
                      {STATUS_LABELS[selectedQuote.status]}
                    </span>
                    {selectedQuote.comparisonScore && (
                      <div className="flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium">Score: {selectedQuote.comparisonScore}/100</span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><span className="font-medium text-gray-700">Solicitado por:</span> {selectedQuote.requestedBy}</p>
                    <p><span className="font-medium text-gray-700">Data da Solicitação:</span> {formatDate(selectedQuote.requestDate)}</p>
                    {selectedQuote.responseDate && (
                      <p><span className="font-medium text-gray-700">Data da Resposta:</span> {formatDate(selectedQuote.responseDate)}</p>
                    )}
                  </div>
                </div>
                
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium text-gray-700">Vencimento:</span> {formatDate(selectedQuote.expiryDate)}</p>
                  <p><span className="font-medium text-gray-700">Valor Total:</span> {formatCurrency(selectedQuote.totalValue)}</p>
                  {isExpired(selectedQuote.expiryDate) && (
                    <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      <Clock className="h-3 w-3 mr-1" />
                      Cotação Expirada
                    </div>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Detalhes da Cotação</h3>
                <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Prazo de Entrega:</span>
                    <span className="text-sm text-gray-900">5-7 dias úteis</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Condições de Pagamento:</span>
                    <span className="text-sm text-gray-900">30 dias</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Validade da Oferta:</span>
                    <span className="text-sm text-gray-900">15 dias</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">Frete:</span>
                    <span className="text-sm text-gray-900">Incluso</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Observações:</h4>
                <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                  Cotação válida conforme especificações técnicas fornecidas. Produtos com garantia de 12 meses.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 