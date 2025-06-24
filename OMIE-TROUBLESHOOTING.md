# Guia de Solução de Problemas - Integração OMIE

## Problema: Erro 500 (Internal Server Error)

### 🔍 Diagnóstico

Se você está recebendo erros 500, isso indica problemas na API route ou na estrutura dos parâmetros enviados para o OMIE.

### 📋 Passos para Resolver

#### 1. Verificar Logs do Servidor

1. **Abra o terminal** onde o servidor está rodando
2. **Verifique os logs** para erros específicos
3. **Procure por mensagens** como:
   - "Parâmetros obrigatórios ausentes"
   - "Erro HTTP da API OMIE"
   - "Erro da API OMIE"

#### 2. Testar API Route

Execute o **teste simples** no console do navegador:

```javascript
// Copie e cole no console (F12 → Console)
// Conteúdo do arquivo: simple-omie-test.js
```

#### 3. Verificar Estrutura dos Parâmetros

A API do OMIE espera uma estrutura específica:

```javascript
// ✅ Estrutura CORRETA
{
  call: 'ListarProdutos',
  app_key: 'sua_app_key',
  app_secret: 'sua_app_secret',
  param: [{
    pagina: 1,
    registros_por_pagina: 10
  }]
}

// ❌ Estrutura INCORRETA
{
  call: 'ListarProdutos',
  app_key: 'sua_app_key',
  app_secret: 'sua_app_secret',
  param: {
    pagina: 1,
    registros_por_pagina: 10
  }
}
```

#### 4. Parâmetros Válidos da API OMIE

**Parâmetros suportados**:
- ✅ `pagina` (número)
- ✅ `registros_por_pagina` (número)
- ✅ `descricao` (string)
- ✅ `codigo_familia` (string)
- ✅ `codigo_subfamilia` (string)

**Parâmetros NÃO suportados**:
- ❌ `tipo` (P/S)
- ❌ `situacao` (A/I)
- ❌ `apenas_importado_api`

### 🧪 Testes de Diagnóstico

#### Teste Simples
```javascript
// Execute no console do navegador
const testSimple = async () => {
  const credentials = JSON.parse(localStorage.getItem('omie_credentials'))
  const response = await fetch('/api/omie', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      call: 'ListarProdutos',
      app_key: credentials.appKey,
      app_secret: credentials.appSecret,
      param: [{
        pagina: 1,
        registros_por_pagina: 1
      }]
    })
  })
  const data = await response.json()
  console.log('Resultado:', data)
}
testSimple()
```

#### Teste Corrigido
Execute o arquivo `corrected-omie-test.js` no console para testar diferentes parâmetros válidos.

### 🔧 Soluções Comuns

#### Solução 1: Reiniciar Servidor
1. **Pare o servidor** (Ctrl+C)
2. **Limpe o cache**: `npm run build && npm run dev`
3. **Reinicie o servidor**: `npm run dev`

#### Solução 2: Verificar Credenciais
1. **Confirme App Key/Secret** estão corretos
2. **Teste credenciais** no OMIE
3. **Reconfigure se necessário**

#### Solução 3: Verificar Estrutura
1. **Confirme que `param` é um array**
2. **Remova parâmetros inválidos**
3. **Use apenas parâmetros suportados**

### 📊 Interpretação dos Resultados

#### Se erro 500 persiste:
- ❌ **Problema na API route**
- ❌ **Estrutura de parâmetros incorreta**
- ❌ **Credenciais inválidas**

#### Se erro 400:
- ❌ **Parâmetros obrigatórios ausentes**
- ❌ **Estrutura incorreta**

#### Se erro 403:
- ❌ **Credenciais inválidas**
- ❌ **Aplicação desabilitada**

### 🆘 Suporte

Se o problema persistir:

1. **Execute o teste simples** no console
2. **Verifique logs do servidor**
3. **Confirme estrutura dos parâmetros**
4. **Teste credenciais no OMIE**

### 📝 Checklist de Verificação

- [ ] Servidor rodando corretamente
- [ ] Credenciais válidas
- [ ] Estrutura de parâmetros correta
- [ ] Parâmetros suportados apenas
- [ ] Teste simples executado
- [ ] Logs analisados

---

**Última Atualização**: Janeiro 2024  
**Versão**: 1.1.0 