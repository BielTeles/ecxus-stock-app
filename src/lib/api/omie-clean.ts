// API de Integração com ERP Omie - Versão Limpa
export interface OmieCredentials {
  appKey: string
  appSecret: string
  baseUrl?: string
}

export interface OmieProductResponse {
  codigo_produto: string
  codigo_produto_integracao?: string
  descricao: string
  unidade?: string
  ncm?: string
  peso_liq?: number
  peso_bruto?: number
  altura?: number
  largura?: number
  profundidade?: number
  marca?: string
  valor_unitario?: number
  codigo_familia?: string
  descricao_familia?: string
  codigo_subfamilia?: string
  descricao_subfamilia?: string
  inativo?: 'S' | 'N'
  bloqueado?: 'S' | 'N'
  info?: {
    dAlt?: string
    dInc?: string
    hAlt?: string
    hInc?: string
    uAlt?: string
    uInc?: string
  }
}

export interface OmieListResponse {
  produto_servico_cadastro: OmieProductResponse[]
  total_de_registros: number
  total_de_paginas: number
  registros_por_pagina: number
  pagina: number
}

export interface OmieApiRequest {
  call: string
  app_key: string
  app_secret: string
  param: any[]
}

export interface OmieError {
  faultstring: string
  faultcode: string
}

export class OmieAPI {
  private credentials: OmieCredentials
  private baseUrl: string

  constructor(credentials: OmieCredentials) {
    this.credentials = credentials
    this.baseUrl = credentials.baseUrl || 'https://app.omie.com.br/api/v1'
  }

  // Método genérico para fazer chamadas à API do Omie
  private async makeRequest<T>(call: string, params: any[] = []): Promise<T> {
    const requestBody = {
      call,
      app_key: this.credentials.appKey,
      app_secret: this.credentials.appSecret,
      param: params,
      baseUrl: this.baseUrl
    }

    console.log('🔍 Fazendo chamada para API OMIE via API Route:', {
      call,
      appKey: this.credentials.appKey ? '***' + this.credentials.appKey.slice(-4) : 'não definida',
      appSecret: this.credentials.appSecret ? '***' + this.credentials.appSecret.slice(-4) : 'não definida'
    })

    try {
      const response = await fetch('/api/omie', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000) // 30 segundos
      })

      console.log('📡 Resposta da API Route:', {
        status: response.status,
        statusText: response.statusText
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('❌ Erro da API Route:', errorData)
        throw new Error(errorData.error || `HTTP Error: ${response.status} - ${response.statusText}`)
      }

      const data = await response.json()
      console.log('✅ Dados recebidos via API Route:', data)

      return data as T
    } catch (error) {
      console.error('❌ Erro na chamada à API Route:', {
        error: error instanceof Error ? error.message : error,
        stack: error instanceof Error ? error.stack : undefined,
        type: error instanceof TypeError ? 'TypeError' : error?.constructor?.name
      })
      
      // Tratamento específico para diferentes tipos de erro
      if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        throw new Error('Erro de conectividade: Verifique sua conexão com a internet e se o servidor está rodando')
      }
      
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error('Timeout: A requisição demorou muito para responder (mais de 30 segundos)')
      }
      
      throw error
    }
  }

  // Testar conexão com a API
  async testConnection(): Promise<boolean> {
    try {
      await this.listProducts(1, 1) // Buscar apenas 1 produto para testar
      return true
    } catch (error) {
      console.error('Erro ao testar conexão com Omie:', error)
      return false
    }
  }

  // Listar produtos do Omie (apenas parâmetros básicos que funcionam)
  async listProducts(page: number = 1, recordsPerPage: number = 50): Promise<OmieListResponse> {
    const params = [{
      pagina: page,
      registros_por_pagina: recordsPerPage
    }]

    return this.makeRequest<OmieListResponse>('ListarProdutos', params)
  }

  // Buscar produto específico por código
  async getProductByCode(codigo: string): Promise<OmieProductResponse> {
    const params = [{
      codigo_produto: codigo
    }]

    return this.makeRequest<OmieProductResponse>('ConsultarProduto', params)
  }

  // Buscar todos os produtos (com paginação automática)
  async getAllProducts(): Promise<OmieProductResponse[]> {
    const allProducts: OmieProductResponse[] = []
    let page = 1
    let hasMorePages = true

    while (hasMorePages) {
      try {
        const response = await this.listProducts(page, 100)
        
        if (response.produto_servico_cadastro) {
          allProducts.push(...response.produto_servico_cadastro)
        }

        hasMorePages = page < response.total_de_paginas
        page++

        // Delay para evitar rate limiting
        if (hasMorePages) {
          await new Promise(resolve => setTimeout(resolve, 500))
        }
      } catch (error) {
        console.error(`Erro ao buscar página ${page}:`, error)
        hasMorePages = false
      }
    }

    return allProducts
  }

  // Buscar produtos ativos apenas
  async getActiveProducts(): Promise<OmieProductResponse[]> {
    const allProducts = await this.getAllProducts()
    return allProducts.filter(product => product.inativo !== 'S' && product.bloqueado !== 'S')
  }

  // Mapear produto do Omie para o formato interno
  static mapOmieToInternalProduct(omieProduct: OmieProductResponse): {
    name: string
    code: string
    description?: string
    category: string
    quantity: number
    unit: string
    purchase_price: number
    sell_price: number
    min_stock: number
    location?: string
    supplier?: string
  } {
    return {
      name: omieProduct.descricao || 'Produto sem nome',
      code: omieProduct.codigo_produto || omieProduct.codigo_produto_integracao || '',
      description: `NCM: ${omieProduct.ncm || 'N/A'} | Unidade: ${omieProduct.unidade || 'UN'}`,
      category: omieProduct.descricao_familia || omieProduct.descricao_subfamilia || 'Sem categoria',
      quantity: 0, // Omie não fornece estoque por padrão
      unit: omieProduct.unidade || 'pcs',
      purchase_price: 0, // Omie não fornece preço de compra por padrão
      sell_price: omieProduct.valor_unitario || 0,
      min_stock: 1, // Valor padrão
      location: 'OMIE-SYNC', // Identificador de sincronização
      supplier: omieProduct.marca || 'Omie'
    }
  }

  // Buscar estatísticas dos produtos
  async getProductStats(): Promise<{
    total: number
    active: number
    inactive: number
    families: string[]
    brands: string[]
  }> {
    const products = await this.getAllProducts()
    
    const active = products.filter(p => p.inativo !== 'S' && p.bloqueado !== 'S').length
    const inactive = products.length - active
    
    const families = [...new Set(products
      .map(p => p.descricao_familia)
      .filter(f => f && f.trim() !== '')
    )]
    
    const brands = [...new Set(products
      .map(p => p.marca)
      .filter(b => b && b.trim() !== '')
    )]

    return {
      total: products.length,
      active,
      inactive,
      families,
      brands
    }
  }
}

// Utilitários para gerenciar credenciais
export class OmieCredentialsManager {
  private static readonly STORAGE_KEY = 'omie_credentials'

  static save(credentials: OmieCredentials): void {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(credentials))
  }

  static load(): OmieCredentials | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : null
    } catch (error) {
      console.error('Erro ao carregar credenciais do Omie:', error)
      return null
    }
  }

  static clear(): void {
    localStorage.removeItem(this.STORAGE_KEY)
  }

  static isConfigured(): boolean {
    const credentials = this.load()
    return !!(credentials?.appKey && credentials?.appSecret)
  }
}

// Hook para facilitar o uso da API
export function useOmieAPI() {
  const credentials = OmieCredentialsManager.load()
  
  if (!credentials) {
    return null
  }

  return new OmieAPI(credentials)
} 