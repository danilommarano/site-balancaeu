# Pulso

> Plataforma SaaS white-label para gestão de escolas de dança e centros culturais.

## Sobre

**Pulso** é um sistema completo para escolas de dança que inclui:

- **Site público** com CMS para gerenciar conteúdo
- **Área do aluno** com inscrições, agendamento e extrato financeiro
- **Painel administrativo** para gestão de turmas, alunos e financeiro
- **Controle de presença** com check-in por QR code
- **Pagamentos** integrados via Stripe

Primeiro cliente: **Balança Eu — Escola de Dança e Centro Cultural**.

## Stack

- **SvelteKit** — Framework fullstack
- **Tailwind CSS** — Estilização
- **Prisma + PostgreSQL** — Banco de dados
- **Lucia Auth** — Autenticação
- **Stripe** — Pagamentos e assinaturas
- **Cloudflare R2** — Storage de imagens
- **Resend** — Emails transacionais

## Início rápido

### Com Docker (recomendado)

```bash
# 1. Configurar variáveis de ambiente
cp .env.example .env

# 2. Subir banco + app em modo dev (hot-reload)
npm run docker:dev

# 3. Acompanhar logs
npm run docker:dev:logs

# 4. Popular banco com dados de exemplo
npm run docker:seed

# 5. Acessar http://localhost:5173
```

### Sem Docker

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais (precisa de PostgreSQL local)

# 3. Rodar migrations do banco
npm run db:migrate

# 4. Popular banco com dados de exemplo
npm run db:seed

# 5. Iniciar servidor de desenvolvimento
npm run dev
```

## Docker

O projeto inclui configuração Docker completa para desenvolvimento e produção.

### Desenvolvimento

```bash
npm run docker:dev          # Sobe banco + app dev (hot-reload na porta 5173)
npm run docker:dev:logs     # Acompanha logs do app dev
npm run docker:dev:down     # Para todos os containers dev
npm run docker:db           # Sobe apenas o PostgreSQL (para dev local sem Docker)
```

### Produção

```bash
npm run docker:prod         # Build + sobe app (porta 3000) + banco
npm run docker:prod:logs    # Acompanha logs do app produção
npm run docker:prod:down    # Para containers de produção
```

### Serviços

| Serviço   | Porta | Descrição                          |
|-----------|-------|------------------------------------|
| `db`      | 5432  | PostgreSQL 16                      |
| `app`     | 3000  | App produção (adapter-node)        |
| `app-dev` | 5173  | App dev (vite dev + hot-reload)    |

## Estrutura do projeto

```
src/
├── lib/
│   ├── components/        # Componentes Svelte reutilizáveis
│   │   ├── ui/            # Componentes base (botão, input, modal...)
│   │   ├── landing/       # Componentes da landing page
│   │   ├── admin/         # Componentes do painel admin
│   │   ├── aluno/         # Componentes da área do aluno
│   │   └── professor/     # Componentes da área do professor
│   ├── server/            # Código server-only
│   │   ├── db/            # Prisma client
│   │   ├── auth/          # Lucia Auth
│   │   ├── stripe/        # Integração Stripe
│   │   ├── email/         # Resend
│   │   └── storage/       # Cloudflare R2
│   ├── stores/            # Svelte stores globais
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Funções utilitárias
├── routes/
│   ├── (public)/          # Landing page pública
│   ├── (auth)/            # Login, cadastro, recuperar senha
│   ├── admin/             # Painel administrativo
│   ├── aluno/             # Área do aluno
│   ├── professor/         # Área do professor
│   └── api/               # API routes (webhooks, etc.)
├── hooks.server.ts        # Middleware (auth, tenant resolution)
├── app.css                # Estilos globais + Tailwind
├── app.html               # Template HTML base
└── app.d.ts               # Tipos globais do SvelteKit

prisma/
├── schema.prisma          # Modelo de dados
└── seed.ts                # Dados de exemplo

legacy/                    # Landing page original (referência)
static/                    # Arquivos estáticos (favicon, imagens)
tests/                     # Testes unitários e E2E
```

## Documentação

Consulte o [PLANEJAMENTO.md](./PLANEJAMENTO.md) para:
- Arquitetura e modelo de dados completo
- Estimativa de custos de infraestrutura
- Plano de execução em 17 fases

---

*Projeto desenvolvido com foco em ritmo, movimento e conexão.*
