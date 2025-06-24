import { NextRequest, NextResponse } from 'next/server'

interface OmieApiRequest {
  call: string
  app_key: string
  app_secret: string
  param: any[]
}

interface OmieError {
  faultstring: string
  faultcode: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { call, app_key, app_secret, param, baseUrl = 'https://app.omie.com.br/api/v1' } = body

    console.log('🔍 API Route - Chamada para OMIE:', {
      call,
      appKey: app_key ? '***' + app_key.slice(-4) : 'não definida',
      appSecret: app_secret ? '***' + app_secret.slice(-4) : 'não definida',
      url: `${baseUrl}/geral/produtos/`,
      param: param
    })

    // Validar parâmetros obrigatórios
    if (!call || !app_key || !app_secret) {
      console.error('❌ API Route - Parâmetros obrigatórios ausentes')
      return NextResponse.json(
        { error: 'Parâmetros obrigatórios ausentes: call, app_key, app_secret' },
        { status: 400 }
      )
    }

    const requestBody: OmieApiRequest = {
      call,
      app_key,
      app_secret,
      param: Array.isArray(param) ? param : []
    }

    console.log('📤 API Route - Request body:', JSON.stringify(requestBody, null, 2))

    const response = await fetch(`${baseUrl}/geral/produtos/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'Ecxus-Stock-App/1.0'
      },
      body: JSON.stringify(requestBody),
      signal: AbortSignal.timeout(30000) // 30 segundos
    })

    console.log('📡 API Route - Resposta da API OMIE:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Route - Erro HTTP da API OMIE:', {
        status: response.status,
        statusText: response.statusText,
        body: errorText
      })
      
      return NextResponse.json(
        { 
          error: `HTTP Error: ${response.status} - ${response.statusText}`,
          details: errorText
        },
        { status: response.status }
      )
    }

    const data = await response.json()
    console.log('✅ API Route - Dados recebidos da API OMIE:', data)

    // Verificar se há erro na resposta do Omie
    if (data.faultstring) {
      const error = data as OmieError
      console.error('❌ API Route - Erro da API OMIE:', error)
      
      return NextResponse.json(
        { 
          error: `Omie API Error: ${error.faultstring}`,
          code: error.faultcode
        },
        { status: 400 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('❌ API Route - Erro na chamada à API do Omie:', {
      error: error instanceof Error ? error.message : error,
      stack: error instanceof Error ? error.stack : undefined,
      type: error instanceof TypeError ? 'TypeError' : error?.constructor?.name
    })

    let errorMessage = 'Erro desconhecido'
    let statusCode = 500

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      errorMessage = 'Erro de conectividade: Verifique sua conexão com a internet e se a URL da API está correta'
      statusCode = 503
    } else if (error instanceof Error && error.name === 'AbortError') {
      errorMessage = 'Timeout: A requisição demorou muito para responder (mais de 30 segundos)'
      statusCode = 408
    } else if (error instanceof Error) {
      errorMessage = error.message
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  }
} 