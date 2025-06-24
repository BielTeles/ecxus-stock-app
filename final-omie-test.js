// Teste final da integração OMIE - Apenas parâmetros básicos
const finalOmieTest = async () => {
  try {
    console.log('🎯 Teste Final da Integração OMIE...')
    
    const stored = localStorage.getItem('omie_credentials')
    if (!stored) {
      console.error('❌ Nenhuma credencial encontrada!')
      return
    }
    
    const credentials = JSON.parse(stored)
    console.log('✅ Credenciais encontradas')

    // Função para fazer requisições básicas
    const makeRequest = async (params) => {
      const response = await fetch('/api/omie', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          call: 'ListarProdutos',
          app_key: credentials.appKey,
          app_secret: credentials.appSecret,
          param: [params]
        })
      })
      
      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP ${response.status}: ${errorText}`)
      }
      
      return await response.json()
    }

    // Teste 1: Busca básica (apenas página e registros)
    console.log('\n📋 Teste 1: Busca básica')
    const basicResult = await makeRequest({
      pagina: 1,
      registros_por_pagina: 10
    })
    console.log('Resultado:', {
      total: basicResult.total_de_registros,
      produtos: basicResult.produto_servico_cadastro?.length || 0,
      paginas: basicResult.total_de_paginas
    })

    // Teste 2: Busca com mais registros
    console.log('\n📋 Teste 2: Busca com mais registros')
    const moreRecordsResult = await makeRequest({
      pagina: 1,
      registros_por_pagina: 50
    })
    console.log('Resultado:', {
      total: moreRecordsResult.total_de_registros,
      produtos: moreRecordsResult.produto_servico_cadastro?.length || 0,
      paginas: moreRecordsResult.total_de_paginas
    })

    // Teste 3: Busca na página 2 (se houver)
    console.log('\n📋 Teste 3: Busca na página 2')
    const page2Result = await makeRequest({
      pagina: 2,
      registros_por_pagina: 10
    })
    console.log('Resultado:', {
      total: page2Result.total_de_registros,
      produtos: page2Result.produto_servico_cadastro?.length || 0,
      paginas: page2Result.total_de_paginas
    })

    // Teste 4: Busca com máximo de registros
    console.log('\n📋 Teste 4: Busca com máximo de registros')
    const maxRecordsResult = await makeRequest({
      pagina: 1,
      registros_por_pagina: 100
    })
    console.log('Resultado:', {
      total: maxRecordsResult.total_de_registros,
      produtos: maxRecordsResult.produto_servico_cadastro?.length || 0,
      paginas: maxRecordsResult.total_de_paginas
    })

    // Resumo final
    console.log('\n📊 RESUMO FINAL:')
    
    const allResults = [
      basicResult, moreRecordsResult, page2Result, maxRecordsResult
    ]
    
    const totalProducts = allResults.reduce((sum, result) => 
      sum + (result.produto_servico_cadastro?.length || 0), 0
    )
    
    const maxTotal = Math.max(...allResults.map(r => r.total_de_registros))
    
    console.log(`📦 Total de produtos no OMIE: ${maxTotal}`)
    console.log(`📄 Total de páginas: ${Math.max(...allResults.map(r => r.total_de_paginas))}`)
    console.log(`🔍 Produtos encontrados nos testes: ${totalProducts}`)
    
    if (maxTotal === 0) {
      console.log('\n⚠️ NENHUM PRODUTO ENCONTRADO NO OMIE!')
      console.log('💡 Isso confirma que:')
      console.log('   1. A API está funcionando corretamente')
      console.log('   2. As credenciais são válidas')
      console.log('   3. Não há produtos cadastrados no OMIE')
      console.log('   4. Ou produtos não estão no escopo da aplicação')
      console.log('\n🔧 PRÓXIMOS PASSOS:')
      console.log('   1. Verifique se há produtos cadastrados no OMIE')
      console.log('   2. Configure permissões da aplicação se necessário')
      console.log('   3. Associe usuário à aplicação se necessário')
    } else {
      console.log('\n✅ PRODUTOS ENCONTRADOS!')
      console.log('🎉 A integração está funcionando perfeitamente!')
      
      // Mostrar detalhes dos produtos
      const firstResult = allResults.find(r => r.produto_servico_cadastro?.length > 0)
      if (firstResult) {
        console.log('\n🔍 Primeiro produto encontrado:')
        const firstProduct = firstResult.produto_servico_cadastro[0]
        console.log({
          codigo: firstProduct.codigo_produto,
          descricao: firstProduct.descricao,
          inativo: firstProduct.inativo,
          bloqueado: firstProduct.bloqueado,
          familia: firstProduct.descricao_familia,
          marca: firstProduct.marca
        })
      }
    }

  } catch (error) {
    console.error('❌ Erro no teste final:', error.message)
  }
}

// Executar o teste
console.log('🚀 Iniciando teste final da integração OMIE...')
finalOmieTest() 