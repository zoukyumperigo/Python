# ❄️ FrostWMS — Sistema de Gestão de Armazém Frigorífico

WMS SaaS moderno para distribuidoras de produtos congelados. Next.js 16, TypeScript, Tailwind CSS v4, Prisma + PostgreSQL.

## 🌟 Módulos

| Módulo | Descrição |
|--------|-----------|
| 📊 Dashboard | KPIs, alertas de validade, produtividade, gráficos |
| 📦 Produtos | Catálogo com categorias, barcodes, temperatura, stock mínimo |
| 🗄️ Stock | Controlo por lote/validade (FEFO), estados, movimentos |
| 🗺️ Armazém | Mapa: Zonas → Corredores → Estantes → Posições |
| 📥 Receção | Fluxo completo: criação → conferência → aprovação |
| 📤 Expedição | Pedidos de saída, agrupamento por rota |
| 🧺 Picking | Lista otimizada FEFO, leitura de barcode |
| 📋 Inventário | Contagens total/parcial/cíclica, aprovação |
| ⚠️ Divergências | Painel de alertas, prioridades, ações corretivas |
| ✅ Tarefas WES | Sistema de execução operacional |
| 🤖 Copiloto IA | Chat em linguagem natural, relatórios automáticos |
| 📈 Relatórios | KPIs, gráficos, exportação CSV/Excel |
| ⚙️ Definições | Utilizadores, permissões, integrações |

## 🚀 Instalação

### Pré-requisitos
- Node.js 20+
- PostgreSQL 14+

### Passos

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.example .env
# Editar DATABASE_URL com as credenciais PostgreSQL

# 3. Base de dados
createdb wms_frozen
npm run db:migrate
npm run db:seed

# 4. Iniciar
npm run dev
```

Abrir [http://localhost:3000](http://localhost:3000)

## 🔑 Credenciais Demo

| Email | Password | Perfil |
|-------|----------|--------|
| admin@wmsfrozen.pt | admin123 | Administrador |
| joao@wmsfrozen.pt | admin123 | Gestor de Armazém |
| carlos@wmsfrozen.pt | admin123 | Operador |
| ana@wmsfrozen.pt | admin123 | Compras |
| miguel@wmsfrozen.pt | admin123 | Expedição |

## 📁 Estrutura

```
src/
├── app/
│   ├── (auth)/login/       # Login
│   ├── (dashboard)/        # Todas as páginas
│   │   ├── dashboard/
│   │   ├── products/
│   │   ├── stock/
│   │   ├── warehouse/
│   │   ├── receiving/
│   │   ├── shipping/
│   │   ├── picking/
│   │   ├── inventory/
│   │   ├── divergences/
│   │   ├── tasks/
│   │   ├── copilot/
│   │   ├── reports/
│   │   └── settings/
│   └── api/                # API Routes
├── components/
│   ├── layout/             # Sidebar, Header
│   └── ui/                 # Componentes reutilizáveis
├── lib/
│   ├── mockData.ts         # Dados mock MVP
│   ├── prisma.ts
│   └── utils.ts
└── types/index.ts
```

## 🌡️ Regras Congelados

- FEFO obrigatório (First Expired First Out)
- Alertas: <7 dias (crítico), <30 dias (aviso)
- Bloqueio automático de lotes vencidos
- Temperatura por zona
- Rastreabilidade completa por lote
- Quarentena de produtos suspeitos

## 🔌 Integrações Futuras

API preparada para: ERP / Sage / Bettertech / WhatsApp / Power BI / Etiquetas ZPL

## Scripts

```bash
npm run dev          # Desenvolvimento
npm run build        # Build produção
npm run db:migrate   # Aplicar migrações
npm run db:seed      # Popular base de dados
npm run db:studio    # Prisma Studio
```
