# 🏭 Ecxus Stock App

Sistema avançado de gerenciamento de estoque para componentes eletrônicos, com funcionalidades completas de produção, fornecedores e relatórios.

## ✨ Funcionalidades Principais

### 📦 **Gerenciamento de Produtos**
- ✅ CRUD completo de produtos eletrônicos
- ✅ Categorização automática (Resistores, Capacitores, LEDs, etc.)
- ✅ Controle de estoque com alertas inteligentes
- ✅ Sistema de localização (posições físicas)
- ✅ Busca e filtros avançados
- ✅ Importação/exportação de dados (JSON/CSV)

### 🏭 **Sistema de Produção**
- ✅ Cadastro de produtos acabados
- ✅ BOM (Bill of Materials) integrado e visual
- ✅ Cálculo automático de custos de produção
- ✅ Simulação de produção em tempo real
- ✅ Análise de viabilidade e lucratividade

### 📋 **Ordens de Produção**
- ✅ Criação e gestão de ordens de produção
- ✅ Controle de status (Planejado → Em Progresso → Concluído)
- ✅ Sistema de priorização
- ✅ Rastreamento de datas e prazos
- ✅ Relatórios de performance

### 🤝 **Gestão de Fornecedores**
- ✅ Cadastro completo de fornecedores
- ✅ Sistema de cotações e ordens de compra
- ✅ Alertas de estoque e sugestões de compra
- ✅ Análise de performance de fornecedores
- ✅ Histórico de transações

### 🚨 **Sistema de Alertas Inteligente**
- ✅ Alertas automáticos de estoque baixo
- ✅ Notificações de ordens atrasadas
- ✅ Alertas de produtos caros em falta
- ✅ Sistema de notificações configurável
- ✅ Histórico completo de alertas

### 📊 **Dashboard e Relatórios**
- ✅ Dashboard em tempo real com métricas
- ✅ Gráficos e estatísticas avançadas
- ✅ Relatórios de produção e estoque
- ✅ Análise de tendências e performance
- ✅ Exportação de relatórios

## 🚀 Tecnologias e Arquitetura

### **Stack Principal**
- **Frontend**: Next.js 15.3.3 + React 19 + TypeScript
- **Styling**: Tailwind CSS 4.0
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Icons**: Lucide React
- **Build**: Turbopack (dev) + Next.js (prod)

### **Arquitetura Otimizada**
```
src/
├── app/                    # 📱 App Router (Next.js 13+)
├── components/             # 🧩 Componentes React (20 essenciais)
│   ├── suppliers/          # 🤝 Módulo de fornecedores
│   └── [Component].tsx     # React.memo otimizado
├── contexts/               # 🔄 Estado global (6 contextos)
├── hooks/                  # 🎣 Hooks personalizados (2 essenciais)
├── lib/                    # 📚 Configurações e APIs
├── types/                  # 📝 Tipos TypeScript centralizados
├── utils/                  # 🛠️ Utilitários e validações
└── constants/              # 📋 Constantes da aplicação
```

### **Otimizações de Performance**
- ✅ **Code Splitting**: Lazy loading automático
- ✅ **React.memo**: Prevenção de re-renders
- ✅ **Bundle Optimization**: -76% no tamanho (45kB → 10.9kB)
- ✅ **Dynamic Imports**: Carregamento sob demanda
- ✅ **Memoization**: useCallback e useMemo estratégicos

## 📱 Como Usar

### **1. Dashboard Principal**
- Acesse métricas em tempo real
- Visualize alertas críticos
- Monitore performance geral

### **2. Gestão de Produtos**
- **Adicionar**: Botão "Novo Produto" no header
- **Editar**: Clique no ícone de edição na lista
- **Filtrar**: Use os filtros por categoria, estoque, preço
- **Exportar**: Botão de download (JSON/CSV)

### **3. Sistema de Produção**
- **BOM**: Configure lista de materiais para cada produto
- **Simulação**: Analyze viabilidade antes de produzir
- **Ordens**: Crie e gerencie ordens de produção

### **4. Fornecedores**
- **Cadastro**: Informações completas + contato
- **Cotações**: Sistema de solicitação de preços
- **Análise**: Performance e histórico

### **5. Alertas**
- **Automáticos**: Estoque baixo, ordens atrasadas
- **Personalizados**: Crie alertas específicos
- **Configuração**: Canais e frequência de notificação

## 🔧 Configuração Avançada

### **Banco de Dados (Supabase)**
O sistema usa PostgreSQL via Supabase com as seguintes tabelas:
- `products` - Produtos e componentes
- `finished_products` - Produtos acabados
- `bom_items` - Itens da lista de materiais
- `production_orders` - Ordens de produção

### **Personalização**
- **Moedas**: Configurável no módulo Settings
- **Categorias**: Editáveis em `src/constants/categories.ts`
- **Processos**: Configuráveis em `src/constants/production.ts`

## 📊 Métricas de Performance

### **Bundle Size**
- **Página principal**: 10.9 kB (otimizado)
- **First Load JS**: 156 kB
- **Chunks compartilhados**: 101 kB

### **Lighthouse Score** (típico)
- **Performance**: 95+
- **Accessibility**: 100
- **Best Practices**: 100
- **SEO**: 90+

## 🔒 Segurança

- ✅ Validação de dados client/server-side
- ✅ Sanitização de inputs
- ✅ Row Level Security (RLS) no Supabase
- ✅ Environment variables protegidas
- ✅ HTTPS obrigatório em produção

## 📈 Roadmap

### **V2.0 - Planejado**
- [ ] PWA (Progressive Web App)
- [ ] Modo offline com sincronização
- [ ] Relatórios PDF automáticos
- [ ] Integração com APIs de fornecedores
- [ ] Sistema de backup automático
- [ ] Multi-tenancy (múltiplas empresas)

### **V2.1 - Futuro**
- [ ] Mobile app (React Native)
- [ ] IA para previsão de demanda
- [ ] Integração com sistemas ERP
- [ ] API pública para integrações

## 💡 Dicas e Truques

### **Atalhos de Teclado**
- `Ctrl + K`: Busca rápida de produtos
- `Alt + N`: Novo produto
- `Alt + P`: Ir para produção
- `Alt + S`: Ir para fornecedor

*Versão atual: 0.0.5 | Última atualização: Junho 2025*
