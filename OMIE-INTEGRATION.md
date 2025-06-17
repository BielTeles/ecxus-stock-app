# Integração ERP Omie

## Visão Geral

A integração com o ERP Omie permite sincronizar automaticamente os produtos cadastrados no seu sistema Omie com o sistema de estoque da Ecxus. Esta funcionalidade facilita a gestão de produtos, eliminando a necessidade de cadastro manual duplo.

## Funcionalidades

### ✅ Recursos Implementados

- **Configuração de Credenciais**: Interface segura para configurar App Key e App Secret
- **Teste de Conexão**: Validação automática das credenciais configuradas
- **Sincronização de Produtos**: Importação de produtos ativos do Omie
- **Mapeamento Inteligente**: Conversão automática dos dados do Omie para o formato interno
- **Sincronização Seletiva**: Escolha quais produtos importar
- **Sincronização Completa**: Importação de todos os produtos ativos
- **Histórico de Sincronização**: Log detalhado de todas as operações
- **Preservação de Estoque**: Mantém quantidades atuais ao atualizar produtos existentes
- **Tratamento de Erros**: Gestão robusta de falhas durante a sincronização

### 📋 Dados Sincronizados

- **Nome do Produto**: Descrição do produto no Omie
- **Código**: Código único do produto
- **Categoria**: Família/Subfamília do produto
- **Preço de Venda**: Valor unitário configurado no Omie
- **Unidade**: Unidade de medida (UN, KG, M, etc.)
- **NCM**: Nomenclatura Comum do Mercosul
- **Marca**: Marca do produto
- **Status**: Produtos ativos/inativos

## Como Configurar

### 1. Obter Credenciais do Omie

1. Acesse sua conta no **Omie ERP**
2. Vá em **Configurações** → **Usuários e Permissões** → **Aplicações**
3. Crie uma nova aplicação ou use uma existente
4. Copie o **App Key** e **App Secret**

### 2. Configurar no Sistema

1. Acesse a aba **Configurações** no sistema
2. Clique em **Integrações** no menu lateral
3. Localize a seção **ERP Omie**
4. Clique em **Configurar**
5. Preencha os campos:
   - **App Key**: Cole o App Key obtido do Omie
   - **App Secret**: Cole o App Secret obtido do Omie
   - **URL Base**: Deixe o padrão (https://app.omie.com.br/api/v1)
6. Clique em **Salvar Credenciais**
7. Clique em **Testar Conexão** para validar

### 3. Sincronizar Produtos

#### Opção 1: Sincronização Seletiva
1. Clique em **Visualizar Produtos**
2. Aguarde o carregamento da lista de produtos do Omie
3. Selecione os produtos desejados
4. Clique em **Sincronizar Selecionados**

#### Opção 2: Sincronização Completa
1. Clique em **Sincronizar Todos**
2. Confirme a operação (pode demorar alguns minutos)
3. Acompanhe o progresso no log

## Mapeamento de Dados

### Do Omie para o Sistema Interno

| Campo Omie | Campo Interno | Observações |
|------------|---------------|-------------|
| `descricao` | `name` | Nome do produto |
| `codigo_produto` | `code` | Código único |
| `descricao_familia` | `category` | Categoria principal |
| `valor_unitario` | `sell_price` | Preço de venda |
| `marca` | `supplier` | Fornecedor/Marca |
| `unidade` | `description` | Incluído na descrição |
| `ncm` | `description` | Incluído na descrição |
| - | `location` | Definido como "OMIE-SYNC" |
| - | `min_stock` | Padrão: 1 |
| - | `quantity` | Padrão: 0 (preservado se existir) |

## Comportamento da Sincronização

### Produtos Novos
- São criados com os dados do Omie
- Quantidade inicial: 0
- Estoque mínimo: 1
- Localização: "OMIE-SYNC"

### Produtos Existentes
- Dados são atualizados com informações do Omie
- **Quantidade em estoque é preservada**
- Identificação por código ou nome

### Tratamento de Erros
- Produtos com erro são registrados no log
- Sincronização continua para os demais produtos
- Estatísticas finais mostram sucessos e falhas

## Logs e Monitoramento

### Informações Registradas
- ✅ **Sucessos**: Produtos importados/atualizados
- ❌ **Erros**: Falhas com detalhes
- 🔄 **Atualizações**: Produtos modificados
- 📊 **Estatísticas**: Resumo da operação

### Exemplo de Log
```
[14:30:25] 🔍 Buscando produtos do Omie...
[14:30:27] ✅ 156 produtos encontrados no Omie
[14:30:28] 🚀 Iniciando sincronização...
[14:30:29] ➕ Importado: Resistor 10kΩ 1/4W
[14:30:30] 🔄 Atualizado: Capacitor 100µF 16V
[14:30:31] ❌ Erro em LED RGB: Código duplicado
[14:30:35] ✅ Sincronização concluída!
```

## Segurança

### Armazenamento de Credenciais
- Credenciais são armazenadas localmente no navegador
- Não são enviadas para servidores externos
- App Secret é mascarado na interface

### Comunicação com Omie
- Todas as chamadas usam HTTPS
- Autenticação via App Key/Secret oficial do Omie
- Respeita limites de rate limiting da API

## Solução de Problemas

### Erro de Conexão
- Verifique App Key e App Secret
- Confirme se a aplicação está ativa no Omie
- Teste a conectividade com a internet

### Produtos Não Sincronizados
- Verifique se os produtos estão ativos no Omie
- Confirme se não há bloqueios no produto
- Verifique logs para erros específicos

### Performance Lenta
- Sincronização de muitos produtos pode demorar
- Use sincronização seletiva para lotes menores
- Aguarde conclusão antes de nova sincronização

## Limitações Atuais

- Não sincroniza estoque (apenas cadastro)
- Não atualiza preços automaticamente
- Não suporta sincronização bidirecional
- Limitado a produtos ativos no Omie

## Roadmap Futuro

- [ ] Sincronização automática programada
- [ ] Sincronização de estoque em tempo real
- [ ] Sincronização bidirecional
- [ ] Webhook para atualizações instantâneas
- [ ] Sincronização de clientes e fornecedores
- [ ] Relatórios de sincronização avançados

## Suporte

Para dúvidas ou problemas com a integração:

1. Verifique este documento
2. Consulte os logs de sincronização
3. Entre em contato com o suporte técnico
4. Documente erros específicos para análise

---

**Versão**: 1.0.0  
**Última Atualização**: Janeiro 2024  
**Compatibilidade**: Omie API v1 