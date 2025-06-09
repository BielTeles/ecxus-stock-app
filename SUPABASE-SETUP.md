# 🗄️ Configuração do Supabase - Ecxus Stock App

Este guia te ajudará a configurar o banco de dados Supabase para a aplicação.

## 📋 Pré-requisitos

- [ ] Conta no [Supabase](https://supabase.com) (gratuita)
- [ ] Projeto Next.js funcionando
- [ ] Dependências instaladas (`@supabase/supabase-js`)

## 🚀 Passo a Passo

### 1. **Criar Projeto no Supabase**

1. Acesse [https://supabase.com](https://supabase.com)
2. Clique em **"New Project"**
3. Escolha uma organização (ou crie uma)
4. Configure o projeto:
   - **Name**: `ecxus-stock-app`
   - **Database Password**: Crie uma senha forte
   - **Region**: Escolha mais próxima (ex: South America - São Paulo)
5. Clique em **"Create new project"**
6. ⏳ Aguarde 1-2 minutos para criação

### 2. **Configurar Banco de Dados**

1. No painel do Supabase, clique em **"SQL Editor"** (menu lateral)
2. Clique em **"New query"**
3. Copie todo o conteúdo do arquivo `src/lib/database-schema.sql`
4. Cole no editor SQL
5. Clique em **"RUN"** (ou Ctrl+Enter)
6. ✅ Verifique se as tabelas foram criadas em **"Table Editor"**

### 3. **Obter Credenciais**

1. Vá em **Settings > API** (menu lateral)
2. Na seção **"Project API keys"**, copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 4. **Configurar Variáveis de Ambiente**

1. Crie o arquivo `.env.local` na raiz do projeto:

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

2. Substitua pelos valores reais copiados do Supabase
3. ⚠️ **Nunca commit este arquivo!** (já está no .gitignore)

### 5. **Testar Conexão**

1. Reinicie a aplicação:
   ```bash
   npm run dev
   ```

2. Abra o console do navegador (F12)
3. Se não houver erros de conexão, está funcionando! ✅

## 📊 Estrutura do Banco

O schema cria 4 tabelas principais:

- **`products`** - Componentes eletrônicos do estoque
- **`finished_products`** - Produtos acabados manufaturados  
- **`bom_items`** - Bill of Materials (lista de componentes)
- **`production_orders`** - Ordens de produção

## 🔧 Recursos Configurados

- ✅ **Triggers** para atualização automática de `updated_at`
- ✅ **Índices** para performance otimizada
- ✅ **Constraints** para integridade dos dados
- ✅ **Views** para relatórios prontos
- ✅ **Funções** para cálculos automatizados

## 🛡️ Segurança

- Por padrão, **RLS está desabilitado** para facilitar desenvolvimento
- Para produção, descomente as linhas de RLS no schema
- Autenticação será implementada na Fase 3

## 🐛 Troubleshooting

### ❌ Erro de conexão
- Verifique se as URLs estão corretas
- Confirme se o projeto está "healthy" no painel Supabase

### ❌ Erro ao executar schema
- Execute comando por comando se houver erros
- Verifique se todas as extensões foram habilitadas

### ❌ Tabelas não aparecem
- Aguarde alguns segundos e recarregue
- Verifique a aba "Table Editor" no Supabase

## 📞 Suporte

- 📖 [Documentação Supabase](https://supabase.com/docs)
- 💬 [Discord Supabase](https://discord.supabase.com)
- 🚨 Em caso de problemas, verifique o console do navegador

---

## 🎯 Próximos Passos

Após configurar o Supabase:

1. **Fase 2**: Migrar contextos para usar API
2. **Fase 3**: Implementar autenticação
3. **Fase 4**: Adicionar sync real-time
4. **Fase 5**: Relatórios avançados

**Status**: ✅ Configuração completa - Pronto para migração! 