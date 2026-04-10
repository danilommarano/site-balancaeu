# Pulso — Planejamento Completo do Sistema

> Plataforma white-label de gestão para escolas de dança, estúdios e centros culturais  
> Documento de arquitetura, modelagem, custos e plano de execução

---

## Sumário

1. [Visão Geral](#1-visão-geral)
2. [Stack Tecnológica](#2-stack-tecnológica)
3. [Módulos do Sistema](#3-módulos-do-sistema)
4. [Estrutura de Rotas](#4-estrutura-de-rotas)
5. [Modelo de Dados](#5-modelo-de-dados)
6. [Estimativa de Custos de Infraestrutura](#6-estimativa-de-custos-de-infraestrutura)
7. [Plano de Execução (17 Fases)](#7-plano-de-execução-17-fases)
8. [Sugestões Extras](#8-sugestões-extras)

---

## 1. Visão Geral

**Pulso** é uma plataforma SaaS white-label para gestão completa de escolas de dança, estúdios e centros culturais. Cada cliente (escola) recebe sua própria instância personalizada com nome, logo, cores e domínio próprio.

O primeiro cliente será a **Balança Eu — Escola de Dança e Centro Cultural**.

### Conceito White-Label

```
┌─────────────────────────────────────────────────┐
│                 PULSO (plataforma)               │
│                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────┐  │
│  │ Balança Eu  │  │ Studio ABC  │  │ Escola X│  │
│  │ (cliente 1) │  │ (cliente 2) │  │(cliente) │  │
│  │ balancaeu.  │  │ studioabc.  │  │ escolax. │  │
│  │ pulso.app   │  │ pulso.app   │  │ pulso.app│  │
│  └─────────────┘  └─────────────┘  └─────────┘  │
└─────────────────────────────────────────────────┘
```

Cada instância tem:
- **Subdomínio próprio** (ex: `balancaeu.pulso.app`) ou domínio customizado
- **Tema visual** configurável (cores, logo, fontes)
- **Dados isolados** (multi-tenant com tenant_id por registro)
- **Funcionalidades idênticas**, mesma base de código

### Objetivos principais

- **Site público** com conteúdo dinâmico gerenciado por CMS (personalizável por tenant)
- **Área do aluno** com login, inscrições, agendamento e extrato financeiro
- **Painel administrativo** para gestão de conteúdo, turmas, alunos e financeiro
- **Controle de acesso e presença** na escola e nas aulas
- **Pagamentos integrados** via Stripe (assinaturas recorrentes e cobranças avulsas)

### Estado atual

O projeto possui uma **landing page estática** (cliente Balança Eu) construída com HTML5, Tailwind CSS (CDN) e Vanilla JavaScript, servida pelo Vite. A migração para SvelteKit permitirá adicionar todas as funcionalidades dinâmicas mantendo a identidade visual existente.

---

## 2. Stack Tecnológica

| Camada              | Tecnologia                     | Motivo                                                        |
| ------------------- | ------------------------------ | ------------------------------------------------------------- |
| **Framework**       | SvelteKit                      | Fullstack (SSR, routing, API routes), performance excelente   |
| **Estilização**     | Tailwind CSS                   | Já em uso no projeto, mantém a identidade visual              |
| **ORM**             | Prisma                         | Type-safe, migrations automáticas, excelente DX               |
| **Banco de Dados**  | PostgreSQL                     | Robusto para dados relacionais, suporte a multi-tenant        |
| **Autenticação**    | Lucia Auth                     | Integração nativa com SvelteKit, leve e flexível              |
| **Pagamentos**      | Stripe                         | Assinaturas recorrentes, checkout, webhooks, padrão global    |
| **Storage**         | Cloudflare R2                  | Compatível com S3, custo muito baixo, sem taxa de egress      |
| **Email**           | Resend                         | API moderna, 3.000 emails/mês grátis, integração simples      |
| **Deploy**          | Ver seção de custos            | Comparativo entre Railway, Fly.io e Render                    |

### Dependências complementares

- **@prisma/client** — Cliente do banco de dados
- **stripe** — SDK oficial do Stripe para pagamentos e assinaturas
- **zod** — Validação de schemas de entrada
- **jspdf** / **pdfmake** — Geração de PDF para extratos
- **qrcode** — Geração de QR codes para check-in
- **date-fns** — Manipulação de datas (pt-BR)
- **lucide-svelte** — Ícones consistentes
- **bits-ui** — Componentes acessíveis para Svelte (modais, menus, tooltips)
- **resend** — SDK para envio de emails transacionais

---

## 3. Módulos do Sistema

### 3.1 Site Público (Landing Page)

Migração do HTML atual para componentes Svelte com conteúdo dinâmico vindo do banco de dados.

**Seções:**

- Hero principal (título, subtítulo, CTA, imagem)
- Sobre a escola (textos institucionais)
- Preços / Planos (cards de modalidades com valores)
- Professores (fotos, bio, especialidades)
- Horários / Grade de aulas (por dia da semana e sala)
- Próximos eventos (cards com data, imagem, descrição)
- Contato (formulário, mapa, redes sociais)

---

### 3.2 CMS Administrativo (`/admin`)

Painel protegido por login de administrador para gerenciar todo o conteúdo exibido no site público.

**Funcionalidades:**

- CRUD de textos e imagens de cada seção da home
- CRUD de professores (nome, bio, foto, especialidades)
- CRUD de modalidades (nome, descrição, imagem)
- CRUD de planos e preços
- CRUD de turmas / grade de horários
- CRUD de eventos
- Upload e gerenciamento de imagens
- Preview em tempo real das alterações

---

### 3.3 Área do Aluno (`/aluno`)

Espaço autenticado onde o aluno gerencia sua vida na escola.

**Funcionalidades:**

- **Dashboard** — Resumo do plano, próximas aulas, notificações
- **Perfil** — Editar dados pessoais, foto, alterar senha
- **Plano / Assinatura** — Visualizar plano atual, upgrade, downgrade, cancelamento
- **Inscrições em turmas** — Inscrever-se ou cancelar inscrição em turmas regulares
- **Aulas particulares** — Agendar aula com professor (calendário de disponibilidade)
- **Extrato financeiro** — Histórico de transações com filtros e download em PDF

---

### 3.4 Controle de Acesso e Presença

Sistema para registrar a entrada do aluno na escola e a presença nas aulas.

**Funcionalidades:**

- **Check-in na escola** — QR code pessoal do aluno, lido por terminal na recepção ou pelo celular
- **Chamada por aula** — Professor marca presença/falta de cada aluno inscrito
- **Relatórios** — Frequência por aluno, por turma, por período
- **Alertas** — Notificação de faltas excessivas, aluno sem check-in

---

### 3.5 Painel do Professor (`/professor`)

Área exclusiva para professores gerenciarem suas turmas e agenda.

**Funcionalidades:**

- Visão das turmas que leciona
- Chamada de presença por aula
- Agenda de aulas particulares (confirmar, recusar, remarcar)
- Edição de perfil e disponibilidade

---

## 4. Estrutura de Rotas

```
Rotas Públicas
──────────────────────────────────
/                        → Landing page (conteúdo dinâmico do CMS)
/login                   → Login (aluno, professor, admin)
/cadastro                → Cadastro de novo aluno

Rotas do Admin (/admin)
──────────────────────────────────
/admin                   → Dashboard administrativo
/admin/cms               → Gerenciar conteúdos da home
/admin/modalidades       → Gerenciar modalidades de dança
/admin/turmas            → Gerenciar turmas e horários
/admin/alunos            → Gerenciar alunos
/admin/professores       → Gerenciar professores
/admin/planos            → Gerenciar planos e preços
/admin/eventos           → Gerenciar eventos
/admin/presenca          → Controle de presença e check-in
/admin/financeiro        → Relatórios financeiros

Rotas do Aluno (/aluno)
──────────────────────────────────
/aluno                   → Dashboard do aluno
/aluno/perfil            → Editar perfil
/aluno/plano             → Gerenciar plano / assinatura
/aluno/inscricoes        → Inscrições em turmas regulares
/aluno/particular        → Agendar aula particular
/aluno/extrato           → Extrato financeiro + download PDF

Rotas do Professor (/professor)
──────────────────────────────────
/professor               → Dashboard do professor
/professor/chamada       → Fazer chamada de presença
/professor/agenda        → Agenda de aulas particulares
/professor/perfil        → Editar perfil e disponibilidade
```

---

## 5. Modelo de Dados

### Diagrama de Entidades

```
                    ┌──────────┐
                    │  Tenant  │  ◀── Raiz multi-tenant (cada escola)
                    └──────────┘
                         │
          ┌──────────────┼──────────────────────────┐
          ▼              ▼                           ▼
     ┌──────────┐  ┌───────────┐  ┌──────────────┐  ┌──────────┐
     │   User   │  │   Plan    │  │  CmsContent  │  │  Event   │
     └──────────┘  └───────────┘  └──────────────┘  └──────────┘
          │              │
          │         ┌────┘
          ▼         ▼
     ┌──────────────┐
     │ Subscription │
     └──────────────┘
          
     ┌──────────┐
     │   User   │
     └──────────┘
          │
          │  ┌──────────────┐     ┌────────────┐     ┌──────────────┐
          ├─▸│  Enrollment  │◂────│ ClassGroup │◂────│   Modality   │
          │  └──────────────┘     └────────────┘     └──────────────┘
          │                             │
          │  ┌──────────────┐           │
          ├─▸│  Attendance  │───────────┘
          │  └──────────────┘
          │
          │  ┌──────────────┐     ┌──────────┐
          ├─▸│PrivateLesson │◂────│ Teacher  │
          │  └──────────────┘     └──────────┘
          │
          │  ┌──────────────┐
          ├─▸│  Transaction │
          │  └──────────────┘
          │
          │  ┌──────────────┐
          └─▸│   CheckIn    │
             └──────────────┘

Todas as entidades possuem tenant_id (FK) para isolamento de dados.
```

### Definição das Entidades

#### `Tenant` (Escola / Cliente)

| Campo                  | Tipo         | Descrição                                          |
| ---------------------- | ------------ | -------------------------------------------------- |
| id                     | UUID (PK)    | Identificador único                                |
| nome                   | String       | Nome da escola (ex: "Balança Eu")                  |
| slug                   | String (UQ)  | Subdomínio (ex: "balancaeu" → balancaeu.pulso.app) |
| dominio_customizado    | String?      | Domínio próprio (ex: "balancaeu.com.br")           |
| logo_url               | String?      | Logo da escola                                     |
| cores                  | JSON         | Paleta de cores do tema (primary, secondary, etc)  |
| email_contato          | String       | Email principal da escola                          |
| telefone               | String?      | Telefone da escola                                 |
| endereco               | String?      | Endereço físico                                    |
| stripe_account_id      | String?      | Stripe Connect account (para receber pagamentos)   |
| ativo                  | Boolean      | Tenant ativo                                       |
| created_at             | DateTime     | Data de criação                                    |

#### `User`

| Campo              | Tipo         | Descrição                                |
| ------------------ | ------------ | ---------------------------------------- |
| id                 | UUID (PK)    | Identificador único                      |
| tenant_id          | UUID (FK)    | Escola à qual pertence                   |
| nome               | String       | Nome completo                            |
| email              | String (UQ)  | Email de login                           |
| senha_hash         | String       | Senha criptografada                      |
| role               | Enum         | `ADMIN`, `PROFESSOR`, `ALUNO`            |
| avatar_url         | String?      | URL da foto de perfil                    |
| telefone           | String?      | Telefone de contato                      |
| data_nasc          | DateTime?    | Data de nascimento                       |
| stripe_customer_id | String?      | ID do cliente no Stripe                  |
| ativo              | Boolean      | Conta ativa/inativa                      |
| created_at         | DateTime     | Data de criação                          |
| updated_at         | DateTime     | Última atualização                       |

#### `Plan`

| Campo              | Tipo      | Descrição                                     |
| ------------------ | --------- | --------------------------------------------- |
| id                 | UUID (PK) | Identificador único                           |
| tenant_id          | UUID (FK) | Escola dona do plano                          |
| nome               | String    | Ex: "Forró Roots", "Combo Full"               |
| descricao          | String    | Descrição do plano                            |
| preco              | Decimal   | Valor mensal em R$                            |
| max_aulas_semana   | Int       | Limite de aulas por semana                    |
| permite_particular | Boolean   | Se inclui aulas particulares                  |
| stripe_price_id    | String?   | ID do Price no Stripe (para cobrança)         |
| ativo              | Boolean   | Plano disponível para contratação             |
| created_at         | DateTime  | Data de criação                               |

#### `Subscription`

| Campo                   | Tipo      | Descrição                                       |
| ----------------------- | --------- | ----------------------------------------------- |
| id                      | UUID (PK) | Identificador único                             |
| tenant_id               | UUID (FK) | Escola                                          |
| user_id                 | UUID (FK) | Referência ao aluno                             |
| plan_id                 | UUID (FK) | Referência ao plano                             |
| status                  | Enum      | `ATIVA`, `CANCELADA`, `PAUSADA`, `EXPIRADA`     |
| stripe_subscription_id  | String?   | ID da Subscription no Stripe                    |
| inicio                  | DateTime  | Data de início da assinatura                    |
| fim                     | DateTime? | Data de término (null = ativa indefinidamente)  |
| created_at              | DateTime  | Data de criação                                 |

#### `Modality`

| Campo      | Tipo      | Descrição                            |
| ---------- | --------- | ------------------------------------ |
| id         | UUID (PK) | Identificador único                  |
| tenant_id  | UUID (FK) | Escola                               |
| nome       | String    | Ex: "Forró", "Samba", "Zumba", "Yoga" |
| descricao  | String    | Descrição da modalidade              |
| imagem_url | String?   | Imagem representativa                |
| ativo      | Boolean   | Modalidade ativa                     |

#### `ClassGroup` (Turma)

| Campo           | Tipo      | Descrição                             |
| --------------- | --------- | ------------------------------------- |
| id              | UUID (PK) | Identificador único                   |
| tenant_id       | UUID (FK) | Escola                                |
| modality_id     | UUID (FK) | Modalidade da turma                   |
| professor_id    | UUID (FK) | Professor responsável                 |
| nivel           | String    | "Iniciante", "Intermediário", "Avançado" |
| dia_semana      | Enum      | `SEG`, `TER`, `QUA`, `QUI`, `SEX`, `SAB` |
| horario_inicio  | String    | Ex: "19:00"                           |
| horario_fim     | String    | Ex: "20:00"                           |
| sala            | String    | Ex: "Sala 1"                          |
| max_alunos      | Int       | Capacidade máxima                     |
| ativo           | Boolean   | Turma ativa                           |

#### `Enrollment` (Inscrição em Turma)

| Campo           | Tipo      | Descrição                            |
| --------------- | --------- | ------------------------------------ |
| id              | UUID (PK) | Identificador único                  |
| tenant_id       | UUID (FK) | Escola                               |
| user_id         | UUID (FK) | Aluno inscrito                       |
| class_group_id  | UUID (FK) | Turma                                |
| status          | Enum      | `ATIVA`, `CANCELADA`, `LISTA_ESPERA` |
| data_inscricao  | DateTime  | Data da inscrição                    |

#### `Attendance` (Presença)

| Campo           | Tipo      | Descrição                            |
| --------------- | --------- | ------------------------------------ |
| id              | UUID (PK) | Identificador único                  |
| tenant_id       | UUID (FK) | Escola                               |
| user_id         | UUID (FK) | Aluno                                |
| class_group_id  | UUID (FK) | Turma                                |
| data            | DateTime  | Data da aula                         |
| presente        | Boolean   | Presente ou falta                    |
| observacao      | String?   | Justificativa ou nota                |

#### `CheckIn` (Controle de Acesso)

| Campo      | Tipo      | Descrição                            |
| ---------- | --------- | ------------------------------------ |
| id         | UUID (PK) | Identificador único                  |
| tenant_id  | UUID (FK) | Escola                               |
| user_id    | UUID (FK) | Aluno                                |
| timestamp  | DateTime  | Horário do check-in                  |
| metodo     | Enum      | `QR_CODE`, `MANUAL`                  |

#### `PrivateLesson` (Aula Particular)

| Campo         | Tipo      | Descrição                                     |
| ------------- | --------- | --------------------------------------------- |
| id            | UUID (PK) | Identificador único                           |
| tenant_id     | UUID (FK) | Escola                                        |
| user_id       | UUID (FK) | Aluno que solicitou                           |
| professor_id  | UUID (FK) | Professor responsável                         |
| modality_id   | UUID (FK) | Modalidade da aula                            |
| data_hora     | DateTime  | Data e horário agendado                       |
| duracao       | Int       | Duração em minutos                            |
| status        | Enum      | `AGENDADA`, `CONFIRMADA`, `CONCLUIDA`, `CANCELADA` |
| observacao    | String?   | Notas sobre a aula                            |
| created_at    | DateTime  | Data de criação                               |

#### `Transaction` (Transação Financeira)

| Campo                    | Tipo      | Descrição                            |
| ------------------------ | --------- | ------------------------------------ |
| id                       | UUID (PK) | Identificador único                  |
| tenant_id                | UUID (FK) | Escola                               |
| user_id                  | UUID (FK) | Aluno                                |
| tipo                     | Enum      | `MENSALIDADE`, `PARTICULAR`, `EVENTO`, `OUTRO` |
| valor                    | Decimal   | Valor da transação em R$             |
| descricao                | String    | Descrição legível                    |
| data                     | DateTime  | Data da transação                    |
| stripe_payment_intent_id | String?   | ID do PaymentIntent no Stripe        |
| status                   | Enum      | `PAGO`, `PENDENTE`, `CANCELADO`      |

#### `CmsContent` (Conteúdo do CMS)

| Campo           | Tipo      | Descrição                            |
| --------------- | --------- | ------------------------------------ |
| id              | UUID (PK) | Identificador único                  |
| tenant_id       | UUID (FK) | Escola                               |
| secao           | String    | Seção da página: "hero", "escola", "contato"... |
| chave           | String    | Chave do conteúdo: "titulo", "subtitulo", "imagem"... |
| valor_texto     | String?   | Conteúdo de texto                    |
| valor_imagem_url| String?   | URL da imagem                        |
| ordem           | Int       | Ordem de exibição                    |
| ativo           | Boolean   | Conteúdo visível                     |
| updated_at      | DateTime  | Última atualização                   |

#### `Event` (Evento)

| Campo       | Tipo      | Descrição                            |
| ----------- | --------- | ------------------------------------ |
| id          | UUID (PK) | Identificador único                  |
| tenant_id   | UUID (FK) | Escola                               |
| titulo      | String    | Nome do evento                       |
| descricao   | String    | Descrição completa                   |
| data        | DateTime  | Data do evento                       |
| horario     | String    | Horário formatado                    |
| imagem_url  | String?   | Imagem do evento                     |
| local       | String    | Local do evento                      |
| preco       | Decimal?  | Preço (null = gratuito)              |
| ativo       | Boolean   | Evento publicado                     |
| created_at  | DateTime  | Data de criação                      |

#### `Teacher` (Dados do Professor)

| Campo          | Tipo      | Descrição                            |
| -------------- | --------- | ------------------------------------ |
| id             | UUID (PK) | Identificador único                  |
| tenant_id      | UUID (FK) | Escola                               |
| user_id        | UUID (FK) | Referência ao User com role PROFESSOR|
| bio            | String    | Biografia pública                    |
| especialidades | String[]  | Lista de especialidades              |
| imagem_url     | String?   | Foto do professor                    |

---

## 6. Estimativa de Custos de Infraestrutura

Cenário base: **1 tenant (Balança Eu)**, ~200 alunos ativos, ~5 professores, tráfego moderado (~10k visitas/mês).

### 6.1 Comparativo de Provedores de Cloud

Os três provedores abaixo foram escolhidos pelo equilíbrio entre **qualidade, simplicidade e custo baixo** para aplicações SvelteKit + PostgreSQL.

#### Opção A — Railway

| Recurso                  | Especificação              | Custo/mês (USD) |
| ------------------------ | -------------------------- | --------------- |
| **App SvelteKit**        | 1 vCPU, 512 MB RAM         | ~5.00           |
| **PostgreSQL**           | 1 GB storage, shared CPU   | ~5.00           |
| **Bandwidth**            | 100 GB incluído             | 0.00            |
| **Total estimado**       |                            | **~10.00**      |

- **Prós:** Deploy por Git push, PostgreSQL integrado, DX excelente, escala fácil
- **Contras:** Sem free tier permanente (trial de $5), preço sobe com uso

#### Opção B — Render

| Recurso                  | Especificação              | Custo/mês (USD) |
| ------------------------ | -------------------------- | --------------- |
| **App SvelteKit**        | Starter (512 MB RAM)       | 7.00            |
| **PostgreSQL**           | Starter (1 GB, 256 MB RAM) | 7.00            |
| **Bandwidth**            | 100 GB incluído             | 0.00            |
| **Total estimado**       |                            | **~14.00**      |

- **Prós:** Free tier para app web (com sleep), PostgreSQL gerenciado, SSL automático
- **Contras:** Free tier PostgreSQL expira em 90 dias, cold starts no free tier

#### Opção C — Fly.io

| Recurso                  | Especificação              | Custo/mês (USD) |
| ------------------------ | -------------------------- | --------------- |
| **App SvelteKit**        | shared-cpu-1x, 256 MB RAM  | ~3.00           |
| **PostgreSQL (Supabase)**| Free tier ou Fly Postgres   | 0.00 – 7.00    |
| **Bandwidth**            | 100 GB incluído (free)      | 0.00            |
| **Total estimado**       |                            | **~3.00–10.00** |

- **Prós:** Free allowances generosas, deploy global (edge), Fly Postgres incluso
- **Contras:** Mais complexo de configurar, CLI obrigatório, menos intuitivo

#### Tabela Resumo — Cloud

| Provedor     | Custo mínimo/mês | Facilidade | PostgreSQL incluso | Melhor para            |
| ------------ | ----------------- | ---------- | ------------------ | ---------------------- |
| **Railway**  | ~$10              | ⭐⭐⭐⭐⭐     | ✅ Sim             | DX + simplicidade      |
| **Render**   | ~$14              | ⭐⭐⭐⭐      | ✅ Sim             | Estabilidade + preço fixo |
| **Fly.io**   | ~$3–10            | ⭐⭐⭐       | ✅ Sim             | Custo mínimo + edge    |

> **Recomendação para iniciar:** **Railway** — melhor equilíbrio entre facilidade e custo. Migração futura para Fly.io é simples se precisar otimizar custos.

---

### 6.2 Serviços Complementares

| Serviço                | Plano           | Custo/mês (USD) | Notas                                              |
| ---------------------- | --------------- | --------------- | -------------------------------------------------- |
| **Stripe**             | Pay-as-you-go   | 0.00 fixo       | 2.9% + R$0.39 por transação bem-sucedida           |
| **Cloudflare R2**      | Free tier       | 0.00            | 10 GB storage + 10M leituras grátis/mês            |
| **Resend (email)**     | Free            | 0.00            | 3.000 emails/mês grátis                            |
| **Domínio .app**       | Anual           | ~1.50           | ~$18/ano ÷ 12                                      |
| **Total complementar** |                 | **~1.50**       |                                                    |

---

### 6.3 Stripe — Detalhamento

O Stripe será usado para:

- **Assinaturas recorrentes** (mensalidades dos planos)
- **Cobranças avulsas** (aulas particulares, eventos pagos)
- **Stripe Checkout** (página de pagamento hospedada, sem PCI compliance)
- **Webhooks** (sincronizar status de pagamento → `Transaction` e `Subscription`)
- **Stripe Connect** (futuro: cada escola recebe no próprio Stripe, plataforma cobra taxa)

**Fluxo de pagamento:**

```
Aluno escolhe plano → Stripe Checkout → Pagamento processado
    ↓                                        ↓
Subscription criada                    Webhook recebido
no banco local                         ↓
                                   Transaction registrada
                                   Subscription.status = ATIVA
```

**Custos por volume (estimativa com 200 alunos, mensalidade média R$150):**

| Métrica                   | Valor                     |
| ------------------------- | ------------------------- |
| Receita bruta mensal      | R$ 30.000                 |
| Taxa Stripe (3.49% + R$0.39) | ~R$ 1.125              |
| Receita líquida           | ~R$ 28.875                |
| % retido pelo Stripe      | ~3.75%                    |

> A taxa do Stripe no Brasil é **3.49% + R$0.39** por transação com cartão doméstico.

---

### 6.4 Custo Total Mensal Estimado

| Item                          | Custo/mês (USD) | Custo/mês (BRL)* |
| ----------------------------- | --------------- | ----------------- |
| Cloud (Railway)               | $10.00          | R$ 55             |
| Cloudflare R2                 | $0.00           | R$ 0              |
| Resend (email)                | $0.00           | R$ 0              |
| Domínio                       | $1.50           | R$ 8              |
| Stripe                        | variável        | ~R$ 1.125         |
| **Total fixo (infraestrutura)** | **$11.50**    | **~R$ 63**        |
| **Total com Stripe**          | variável        | **~R$ 1.188**     |

\* *Câmbio estimado: 1 USD = 5.50 BRL*

> **Conclusão:** O custo fixo de infraestrutura é muito baixo (~R$63/mês). O custo relevante é a taxa do Stripe, que é proporcional à receita e não representa custo fixo.

---

### 6.5 Projeção de Escala (múltiplos tenants)

| Tenants | Alunos totais | Infra/mês (USD) | Stripe/mês (BRL) | Observação                 |
| ------- | ------------- | ---------------- | ----------------- | -------------------------- |
| 1       | 200           | ~$11             | ~R$ 1.125         | Railway starter             |
| 5       | 1.000         | ~$25             | ~R$ 5.625         | Upgrade para 1 GB RAM      |
| 20      | 4.000         | ~$50             | ~R$ 22.500        | Dedicated DB, 2 GB RAM     |
| 50+     | 10.000+       | ~$100–200        | ~R$ 56.250+       | Cluster DB, múltiplas réplicas |

---

## 7. Plano de Execução (17 Fases)

Cada fase é **independentemente testável**. Não pule etapas.

### Fase 1 — Fundação do Projeto

> **Prioridade:** Alta  
> **Objetivo:** Criar o projeto SvelteKit e configurar toda a base técnica.

- [ ] Inicializar projeto SvelteKit (`npx sv create`)
- [ ] Instalar e configurar Tailwind CSS
- [ ] Instalar Prisma e configurar conexão com PostgreSQL
- [ ] Criar arquivo `.env` com variáveis de ambiente
- [ ] Configurar estrutura de pastas (`lib/`, `components/`, `server/`)
- [ ] Rodar `npm run dev` e confirmar que o projeto sobe sem erros

**Teste:** Página padrão do SvelteKit renderiza com Tailwind funcionando.

---

### Fase 2 — Modelagem do Banco de Dados

> **Prioridade:** Alta  
> **Objetivo:** Definir o schema completo e popular com dados de exemplo.

- [ ] Escrever schema Prisma com todas as entidades listadas na seção 5
- [ ] Rodar `npx prisma migrate dev` para criar as tabelas
- [ ] Criar arquivo `prisma/seed.ts` com dados fictícios (modalidades, planos, turmas, admin)
- [ ] Rodar `npx prisma db seed` e validar no Prisma Studio

**Teste:** `npx prisma studio` abre e mostra todas as tabelas com dados de seed.

---

### Fase 3 — Autenticação

> **Prioridade:** Alta  
> **Objetivo:** Sistema de login funcional com controle de acesso por role.

- [ ] Instalar e configurar Lucia Auth
- [ ] Implementar página de cadastro (`/cadastro`)
- [ ] Implementar página de login (`/login`)
- [ ] Implementar logout
- [ ] Criar middleware/hook de proteção de rotas por role
- [ ] Implementar recuperação de senha (fluxo por email)
- [ ] Criar usuário admin padrão no seed

**Teste:** Login como admin redireciona para `/admin`. Login como aluno redireciona para `/aluno`. Acessar rota protegida sem login redireciona para `/login`.

---

### Fase 4 — Landing Page Dinâmica

> **Prioridade:** Alta  
> **Objetivo:** Migrar a landing page HTML para Svelte com conteúdo vindo do banco.

- [ ] Criar layout principal (`+layout.svelte`) com header e footer
- [ ] Decompor o HTML em componentes: `Hero`, `SobreEscola`, `Precos`, `Professores`, `Horarios`, `Eventos`, `Contato`
- [ ] Criar `+page.server.ts` que busca dados de `CmsContent`, `Plan`, `Teacher`, `ClassGroup`, `Event`
- [ ] Renderizar cada seção com dados dinâmicos
- [ ] Manter toda a estilização e identidade visual existente

**Teste:** A landing page renderiza idêntica à versão estática, porém com dados vindos do banco.

---

### Fase 5 — CMS Admin (Básico)

> **Prioridade:** Alta  
> **Objetivo:** Admin consegue editar os conteúdos que aparecem na landing page.

- [ ] Criar layout do painel admin (`/admin/+layout.svelte`) com sidebar de navegação
- [ ] Dashboard admin com métricas resumidas
- [ ] CRUD de conteúdos CMS (textos e imagens por seção)
- [ ] CRUD de professores
- [ ] CRUD de modalidades
- [ ] CRUD de horários/turmas
- [ ] Implementar upload de imagens (storage local ou S3/R2)

**Teste:** Editar um texto no CMS e recarregar a landing page — o novo texto aparece.

---

### Fase 6 — CMS Admin (Avançado)

> **Prioridade:** Média  
> **Objetivo:** Gerenciamento completo de eventos, planos e turmas.

- [ ] CRUD de eventos
- [ ] CRUD de planos/preços
- [ ] Gerenciamento avançado de turmas (`ClassGroup`) com vínculo a professor e modalidade
- [ ] Preview em tempo real das alterações do CMS (split view)
- [ ] Validações e feedback visual nos formulários

**Teste:** Criar um evento no admin, ele aparece na seção de eventos da landing page.

---

### Fase 7 — Área do Aluno (Dashboard + Perfil)

> **Prioridade:** Média  
> **Objetivo:** Aluno logado vê seu painel e edita seu perfil.

- [ ] Layout da área do aluno (`/aluno/+layout.svelte`) com navegação lateral/top
- [ ] Dashboard com: plano atual, próximas aulas, resumo financeiro
- [ ] Página de perfil com edição de dados e upload de avatar
- [ ] Alteração de senha
- [ ] Visualização do plano/assinatura atual

**Teste:** Aluno loga, vê seu dashboard com dados corretos, edita seu nome e a mudança persiste.

---

### Fase 8 — Inscrições em Turmas

> **Prioridade:** Média  
> **Objetivo:** Aluno se inscreve e cancela inscrição em turmas regulares.

- [ ] Listagem de turmas disponíveis com filtros (modalidade, dia, nível)
- [ ] Botão de inscrição com verificação de: vagas, compatibilidade com plano, conflito de horário
- [ ] Cancelamento de inscrição
- [ ] Lista de espera quando turma está lotada
- [ ] Histórico de inscrições do aluno

**Teste:** Aluno se inscreve em uma turma com vagas → status `ATIVA`. Tenta inscrever em turma lotada → entra em `LISTA_ESPERA`.

---

### Fase 9 — Agendamento de Aulas Particulares

> **Prioridade:** Média  
> **Objetivo:** Aluno agenda aula particular com professor.

- [ ] Configuração de disponibilidade do professor (dias/horários)
- [ ] Calendário visual de horários disponíveis
- [ ] Aluno seleciona professor, modalidade, data/hora e solicita
- [ ] Professor confirma ou recusa (via painel professor)
- [ ] Validação: plano permite particular? Créditos disponíveis?
- [ ] Cancelamento com antecedência mínima

**Teste:** Aluno agenda particular → status `AGENDADA`. Professor confirma → `CONFIRMADA`. Aluno cancela com menos de 24h → bloqueado.

---

### Fase 10 — Gestão de Planos e Assinaturas

> **Prioridade:** Média  
> **Objetivo:** Aluno gerencia seu plano com upgrade/downgrade.

- [ ] Página comparativa de planos disponíveis
- [ ] Solicitar upgrade de plano (efeito imediato ou no próximo ciclo)
- [ ] Solicitar downgrade (efeito no próximo ciclo)
- [ ] Cancelamento de assinatura com confirmação
- [ ] Lógica de pro-rata para mudanças no meio do ciclo
- [ ] Registro automático de transação ao mudar de plano

**Teste:** Aluno com plano "Básico" faz upgrade para "Combo" → nova Subscription criada, Transaction registrada.

---

### Fase 11 — Extrato Financeiro

> **Prioridade:** Média  
> **Objetivo:** Aluno visualiza e baixa seu histórico de pagamentos.

- [ ] Listagem de transações com filtros (período, tipo, status)
- [ ] Detalhamento de cada transação
- [ ] Geração de PDF do extrato (com logo e dados da escola)
- [ ] Download do PDF
- [ ] Resumo financeiro (total pago, pendente)

**Teste:** Aluno com transações filtradas por mês → lista correta. Clica em "Baixar PDF" → arquivo baixa com layout profissional.

---

### Fase 12 — Controle de Acesso (Check-in)

> **Prioridade:** Média  
> **Objetivo:** Registrar entrada do aluno na escola.

- [ ] Gerar QR code único por aluno (exibido na área do aluno)
- [ ] Tela de check-in para recepção (`/admin/checkin`) — lê QR via câmera
- [ ] Registro do check-in com timestamp e método
- [ ] Validação: assinatura ativa? Aluno bloqueado?
- [ ] Histórico de check-ins por aluno

**Teste:** Aluno mostra QR na tela do terminal → check-in registrado com horário correto. Aluno com assinatura cancelada → check-in recusado.

---

### Fase 13 — Controle de Presença

> **Prioridade:** Média  
> **Objetivo:** Professor faz chamada de presença por aula.

- [ ] Interface de chamada: lista alunos inscritos na turma do dia
- [ ] Marcar presente/ausente com um toque
- [ ] Salvar chamada com data e turma
- [ ] Visualização do histórico de presença por turma
- [ ] Contagem automática de faltas por aluno

**Teste:** Professor abre chamada da turma de segunda 19h → vê 15 alunos. Marca 12 presentes, 3 ausentes → dados salvos.

---

### Fase 14 — Relatórios e Alertas

> **Prioridade:** Baixa  
> **Objetivo:** Dashboards analíticos para a administração.

- [ ] Dashboard admin com gráficos: alunos ativos, receita mensal, taxa de ocupação
- [ ] Relatório de frequência por aluno (com percentual)
- [ ] Relatório de frequência por turma
- [ ] Alertas automáticos: aluno com >3 faltas consecutivas
- [ ] Métricas de ocupação por sala/horário
- [ ] Exportação de relatórios em CSV

**Teste:** Admin abre dashboard → vê gráfico de alunos ativos nos últimos 6 meses com dados reais.

---

### Fase 15 — Painel do Professor

> **Prioridade:** Baixa  
> **Objetivo:** Professor tem sua área dedicada.

- [ ] Dashboard do professor: turmas do dia, próximas particulares
- [ ] Acesso rápido à chamada de presença
- [ ] Gerenciamento de agenda de particulares (confirmar, recusar, remarcar)
- [ ] Edição de perfil e disponibilidade
- [ ] Visualização de histórico das suas turmas

**Teste:** Professor loga → vê suas 3 turmas do dia. Clica em "Chamada" → abre lista de alunos.

---

### Fase 16 — Notificações

> **Prioridade:** Baixa  
> **Objetivo:** Comunicação automática com alunos e professores.

- [ ] Email de boas-vindas ao se cadastrar
- [ ] Email de confirmação de agendamento de particular
- [ ] Lembrete de aula particular (24h antes)
- [ ] Alerta de faltas excessivas (email para aluno e admin)
- [ ] Aviso de vencimento de plano (7 dias antes)
- [ ] Notificação de novo evento publicado

**Teste:** Aluno agenda particular → recebe email de confirmação. 24h antes → recebe lembrete.

---

### Fase 17 — Reconhecimento Facial (Check-in)

> **Prioridade:** Média
> **Objetivo:** Substituir QR Code por reconhecimento facial para agilizar o check-in.

- [ ] Integração com face-api.js (TensorFlow.js) para detecção e reconhecimento facial client-side
- [ ] Tela de cadastro facial na área do aluno (captura 3-5 fotos via webcam)
- [ ] Armazenamento dos descritores faciais no banco (modelo FaceDescriptor)
- [ ] Tela de check-in por câmera: detecta rosto → identifica aluno → registra entrada
- [ ] Fallback para QR Code e check-in manual quando reconhecimento não é possível
- [ ] Tela de configuração do admin (ativar/desativar reconhecimento facial)
- [ ] Política de privacidade e consentimento do aluno para uso de dados biométricos

**Teste:** Aluno cadastra rosto → vai à escola → câmera reconhece automaticamente → check-in registrado em <3 segundos. Aluno não cadastrado → fallback para QR.

---

### Fase 18 — Polimento e Deploy

> **Prioridade:** Baixa  
> **Objetivo:** Sistema pronto para produção.

- [ ] Responsividade completa (mobile, tablet, desktop) em todas as telas
- [ ] Testes end-to-end (Playwright) nos fluxos principais
- [ ] SEO: meta tags, Open Graph, sitemap, robots.txt
- [ ] Performance: lazy loading de imagens, code splitting
- [ ] Acessibilidade: ARIA labels, contraste, navegação por teclado
- [ ] Configurar variáveis de ambiente de produção
- [ ] Configurar domínio e SSL
- [ ] Deploy em Vercel/Netlify
- [ ] Monitoramento de erros (Sentry ou similar)

**Teste:** Lighthouse score > 90 em todas as categorias. Fluxo completo de aluno (cadastro → login → inscrição → check-in) funciona sem erros.

---

## 8. Sugestões Extras

Funcionalidades opcionais que agregam valor e podem ser adicionadas após as 18 fases principais:

| Sugestão                          | Descrição                                                                 |
| --------------------------------- | ------------------------------------------------------------------------- |
| **Lista de espera inteligente**   | Quando turma lota, aluno entra em fila e é notificado quando abre vaga   |
| **Avaliação de nível**            | Formulário ou avaliação do professor para indicar turma adequada          |
| **Galeria de fotos/vídeos**       | Seção no site com mídias dos eventos e aulas                             |
| **App PWA**                       | Transformar em Progressive Web App para acesso mobile nativo             |
| **Sistema de avaliação**          | Alunos avaliam aulas e professores                                       |
| **Programa de indicação**         | Aluno indica amigo e ganha desconto via Stripe Coupons                   |
| **Certificados**                  | Emissão de certificado digital ao completar níveis                       |
| **Chat interno**                  | Comunicação direta entre aluno e professor                               |
| **Calendário integrado**          | Exportar aulas para Google Calendar / Apple Calendar (.ics)              |
| **Portal do super-admin**         | Painel para gerenciar todos os tenants, métricas globais da plataforma   |
| **Stripe Connect marketplace**    | Cada escola recebe direto no próprio Stripe, plataforma cobra % de taxa  |

---

> **Próximo passo:** Iniciar a **Fase 1** — criação do projeto SvelteKit com Tailwind, Prisma e PostgreSQL.

---

*Documento de planejamento da plataforma **Pulso** — SaaS white-label para escolas de dança e centros culturais.*  
*Primeiro cliente: Balança Eu — Escola de Dança e Centro Cultural.*
