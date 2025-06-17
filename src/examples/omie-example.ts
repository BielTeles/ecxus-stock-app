// Exemplo de uso da API do Omie
import { OmieAPI, OmieCredentialsManager } from '@/lib/api/omie'

// Exemplo 1: Configuração básica
async function exemploConfiguracaoBasica() {
  // Configurar credenciais
  const credentials = {
    appKey: 'SEU_APP_KEY_AQUI',
    appSecret: 'SEU_APP_SECRET_AQUI',
    baseUrl: 'https://app.omie.com.br/api/v1' // Opcional
  }

  // Salvar credenciais localmente
  OmieCredentialsManager.save(credentials)

  // Criar instância da API
  const omieApi = new OmieAPI(credentials)

  // Testar conexão
  try {
    const isConnected = await omieApi.testConnection()
    if (isConnected) {
      console.log('✅ Conexão com Omie estabelecida!')
    } else {
      console.log('❌ Falha na conexão')
    }
  } catch (error) {
    console.error('Erro:', error)
  }
}

// Exemplo 2: Buscar produtos ativos
async function exemploBuscarProdutosAtivos() {
  const omieApi = new OmieAPI(OmieCredentialsManager.load()!)

  try {
    console.log('🔍 Buscando produtos ativos...')
    const produtosAtivos = await omieApi.getActiveProducts()
    
    console.log(`✅ ${produtosAtivos.length} produtos ativos encontrados`)

    // Mostrar alguns produtos
    produtosAtivos.slice(0, 5).forEach(produto => {
      console.log(`- ${produto.codigo_produto}: ${produto.descricao}`)
    })

  } catch (error) {
    console.error('Erro ao buscar produtos ativos:', error)
  }
}

// Exemplo 3: Obter estatísticas
async function exemploEstatisticas() {
  const omieApi = new OmieAPI(OmieCredentialsManager.load()!)

  try {
    const stats = await omieApi.getProductStats()
    
    console.log(`📦 Total: ${stats.total}`)
    console.log(`✅ Ativos: ${stats.active}`)
    console.log(`🏷️ Famílias: ${stats.families.length}`)

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error)
  }
}

// Exemplo 4: Buscar produtos paginados
async function exemploBuscarProdutosPaginados() {
  const omieApi = new OmieAPI(OmieCredentialsManager.load()!)

  try {
    // Buscar primeira página (50 produtos)
    const primeiraPage = await omieApi.listProducts(1, 50)
    
    console.log(`Total de produtos: ${primeiraPage.total_de_registros}`)
    console.log(`Total de páginas: ${primeiraPage.total_de_paginas}`)
    console.log(`Produtos na página: ${primeiraPage.produto_servico_cadastro.length}`)

    // Listar produtos da primeira página
    primeiraPage.produto_servico_cadastro.forEach(produto => {
      console.log(`- ${produto.codigo_produto}: ${produto.descricao}`)
    })

  } catch (error) {
    console.error('Erro ao buscar produtos:', error)
  }
}

// Exemplo 5: Buscar todos os produtos ativos
async function exemploBuscarTodosProdutosAtivos() {
  const omieApi = new OmieAPI(OmieCredentialsManager.load()!)

  try {
    console.log('🔍 Buscando todos os produtos ativos...')
    const produtosAtivos = await omieApi.getActiveProducts()
    
    console.log(`✅ ${produtosAtivos.length} produtos ativos encontrados`)

    // Agrupar por família
    const produtosPorFamilia = produtosAtivos.reduce((acc, produto) => {
      const familia = produto.descricao_familia || 'Sem família'
      if (!acc[familia]) acc[familia] = []
      acc[familia].push(produto)
      return acc
    }, {} as Record<string, typeof produtosAtivos>)

    // Mostrar estatísticas
    Object.entries(produtosPorFamilia).forEach(([familia, produtos]) => {
      console.log(`📦 ${familia}: ${produtos.length} produtos`)
    })

  } catch (error) {
    console.error('Erro ao buscar produtos ativos:', error)
  }
}

// Exemplo 6: Buscar produto específico
async function exemploBuscarProdutoEspecifico(codigoProduto: string) {
  const omieApi = new OmieAPI(OmieCredentialsManager.load()!)

  try {
    const produto = await omieApi.getProductByCode(codigoProduto)
    
    console.log('📋 Detalhes do produto:')
    console.log(`Código: ${produto.codigo_produto}`)
    console.log(`Nome: ${produto.descricao}`)
    console.log(`Família: ${produto.descricao_familia}`)
    console.log(`Marca: ${produto.marca}`)
    console.log(`Valor: R$ ${produto.valor_unitario?.toFixed(2) || '0,00'}`)
    console.log(`Unidade: ${produto.unidade}`)
    console.log(`NCM: ${produto.ncm}`)
    console.log(`Status: ${produto.inativo === 'S' ? 'Inativo' : 'Ativo'}`)

  } catch (error) {
    console.error(`Erro ao buscar produto ${codigoProduto}:`, error)
  }
}

// Exemplo 7: Mapear produto do Omie para formato interno
async function exemploMapeamentoProduto(codigoProduto: string) {
  const omieApi = new OmieAPI(OmieCredentialsManager.load()!)

  try {
    // Buscar produto no Omie
    const produtoOmie = await omieApi.getProductByCode(codigoProduto)
    
    // Mapear para formato interno
    const produtoInterno = OmieAPI.mapOmieToInternalProduct(produtoOmie)
    
    console.log('🔄 Mapeamento de produto:')
    console.log('\n📥 Dados do Omie:')
    console.log(`  Código: ${produtoOmie.codigo_produto}`)
    console.log(`  Descrição: ${produtoOmie.descricao}`)
    console.log(`  Família: ${produtoOmie.descricao_familia}`)
    console.log(`  Valor: ${produtoOmie.valor_unitario}`)
    
    console.log('\n📤 Dados mapeados:')
    console.log(`  Nome: ${produtoInterno.name}`)
    console.log(`  Código: ${produtoInterno.code}`)
    console.log(`  Categoria: ${produtoInterno.category}`)
    console.log(`  Preço: ${produtoInterno.sell_price}`)
    console.log(`  Fornecedor: ${produtoInterno.supplier}`)
    console.log(`  Localização: ${produtoInterno.location}`)
    console.log(`  Descrição: ${produtoInterno.description}`)

  } catch (error) {
    console.error('Erro no mapeamento:', error)
  }
}

// Exemplo 8: Sincronização completa com tratamento de erros
async function exemploSincronizacaoCompleta() {
  const omieApi = new OmieAPI(OmieCredentialsManager.load()!)

  try {
    console.log('🚀 Iniciando sincronização completa...')
    
    // Buscar todos os produtos ativos
    const produtosOmie = await omieApi.getActiveProducts()
    console.log(`📦 ${produtosOmie.length} produtos encontrados`)

    const stats = {
      total: produtosOmie.length,
      processados: 0,
      sucessos: 0,
      erros: 0,
      errosDetalhes: [] as string[]
    }

    // Processar cada produto
    for (const [index, produtoOmie] of produtosOmie.entries()) {
      try {
        // Mapear produto
        const produtoInterno = OmieAPI.mapOmieToInternalProduct(produtoOmie)
        
        // Aqui você faria a inserção/atualização no seu sistema
        // await salvarProdutoNoSistema(produtoInterno)
        
        stats.sucessos++
        
        // Log de progresso a cada 10 produtos
        if ((index + 1) % 10 === 0) {
          const progresso = ((index + 1) / produtosOmie.length * 100).toFixed(1)
          console.log(`⏳ Progresso: ${progresso}% (${index + 1}/${produtosOmie.length})`)
        }

      } catch (error) {
        stats.erros++
        const errorMsg = `Erro em ${produtoOmie.descricao}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
        stats.errosDetalhes.push(errorMsg)
        console.error(errorMsg)
      }
      
      stats.processados++
      
      // Delay para não sobrecarregar a API
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Relatório final
    console.log('\n📊 Relatório de Sincronização:')
    console.log(`✅ Total processados: ${stats.processados}`)
    console.log(`✅ Sucessos: ${stats.sucessos}`)
    console.log(`❌ Erros: ${stats.erros}`)
    
    if (stats.errosDetalhes.length > 0) {
      console.log('\n❌ Detalhes dos erros:')
      stats.errosDetalhes.forEach(erro => {
        console.log(`  - ${erro}`)
      })
    }

  } catch (error) {
    console.error('Erro na sincronização:', error)
  }
}

// Exemplo 9: Verificar se credenciais estão configuradas
function exemploVerificarCredenciais() {
  const isConfigured = OmieCredentialsManager.isConfigured()
  
  if (isConfigured) {
    const credentials = OmieCredentialsManager.load()
    console.log('✅ Credenciais configuradas')
    console.log(`App Key: ${credentials?.appKey.substring(0, 8)}...`)
    console.log(`Base URL: ${credentials?.baseUrl}`)
  } else {
    console.log('❌ Credenciais não configuradas')
    console.log('Configure as credenciais primeiro:')
    console.log('OmieCredentialsManager.save({ appKey: "...", appSecret: "..." })')
  }
}

// Exemplo 10: Limpar credenciais
function exemploLimparCredenciais() {
  OmieCredentialsManager.clear()
  console.log('🗑️ Credenciais removidas')
}

// Exemplo de uso com hook React
function exemploComHook() {
  // Em um componente React:
  /*
  import { useOmieAPI } from '@/lib/api/omie'
  
  function MeuComponente() {
    const omieApi = useOmieAPI()
    
    useEffect(() => {
      if (omieApi) {
        omieApi.getActiveProducts().then(produtos => {
          console.log('Produtos:', produtos)
        })
      } else {
        console.log('Omie não configurado')
      }
    }, [omieApi])
    
    return <div>...</div>
  }
  */
}

// Exportar exemplos para uso
export {
  exemploConfiguracaoBasica,
  exemploBuscarProdutosAtivos,
  exemploEstatisticas,
  exemploBuscarProdutosPaginados,
  exemploBuscarTodosProdutosAtivos,
  exemploBuscarProdutoEspecifico,
  exemploMapeamentoProduto,
  exemploSincronizacaoCompleta,
  exemploVerificarCredenciais,
  exemploLimparCredenciais,
  exemploComHook
}

// Exemplo de uso completo
async function exemploCompleto() {
  console.log('🚀 Exemplo completo de uso da API Omie\n')
  
  // 1. Verificar credenciais
  exemploVerificarCredenciais()
  
  if (!OmieCredentialsManager.isConfigured()) {
    console.log('⚠️ Configure as credenciais primeiro!')
    return
  }
  
  // 2. Testar conexão
  await exemploConfiguracaoBasica()
  
  // 3. Obter estatísticas
  await exemploEstatisticas()
  
  // 4. Buscar alguns produtos
  await exemploBuscarProdutosPaginados()
  
  console.log('\n✅ Exemplo completo finalizado!')
}

// Executar exemplo se chamado diretamente
if (typeof window === 'undefined') {
  // Node.js environment
  exemploCompleto().catch(console.error)
} 