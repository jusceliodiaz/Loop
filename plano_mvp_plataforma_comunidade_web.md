# LOOP — Plataforma de Comunidades em Tempo Real

> *Stay in the Loop.*
>
> **Versão do documento:** 2.0
> **Data:** 22/08/2026
> **Status:** Especificação ativa — Fase 1 em execução
> **Substitui:** v1.0 (Plataforma de Comunidade em Tempo Real — Especificação Técnica)
> **Escopo:** Do MVP web para 5 pessoas à arquitetura alvo completa, com marca, produto, técnica e execução num único documento.

---

## Como ler este documento

Ele tem quatro partes, e **elas não são para consumir na mesma velocidade**.

| Parte | Seções | Quando importa |
|-------|--------|----------------|
| **I — Produto e marca** | 1–4 | Agora. Define o que é LOOP e o vocabulário de tudo o que vem depois. |
| **II — MVP (Fase 1)** | 5–16 | Agora. É o que se constrói nas próximas 8 semanas. Instruções executáveis. |
| **III — Checkpoint** | 17–18 | Ao aprovar o MVP. Define quando migrar cada peça, com gatilho numérico. |
| **IV — Arquitetura alvo** | 19–45 | Fases 2 a 4. Referência de destino, **não** backlog imediato. |

**A armadilha central deste projeto** é ler a Parte IV e começar a construí-la. Ela existe para que as decisões da Parte II não fechem portas — não para ser implementada agora. Enquanto o MVP não for aprovado por 5 pessoas reais, a Parte IV é literatura.

---

## Sumário

**Parte I — Produto e marca**
1. [Visão e decisão atual](#1-visão-e-decisão-atual) · 2. [LOOP — marca e identidade](#2-loop--marca-e-identidade) · 3. [Escopo por fase](#3-escopo-por-fase) · 4. [Glossário e modelo de domínio](#4-glossário-e-modelo-de-domínio)

**Parte II — MVP (Fase 1)**
5. [Stack e arquitetura do MVP](#5-stack-e-arquitetura-do-mvp) · 6. [Estrutura do projeto](#6-estrutura-do-projeto) · 7. [Banco de dados do MVP](#7-banco-de-dados-do-mvp) · 8. [Row Level Security](#8-row-level-security) · 9. [Autenticação](#9-autenticação) · 10. [Fluxo de mensagens](#10-fluxo-de-mensagens) · 11. [Camada de tempo real](#11-camada-de-tempo-real) · 12. [Interface do MVP](#12-interface-do-mvp) · 13. [Ordem de desenvolvimento](#13-ordem-de-desenvolvimento) · 14. [Segurança mínima](#14-segurança-mínima-para-lançamento) · 15. [Deploy e ambientes](#15-deploy-e-ambientes) · 16. [Critérios de aprovação](#16-critérios-de-aprovação-do-mvp)

**Parte III — Checkpoint**
17. [Revisão pós-MVP](#17-revisão-pós-mvp) · 18. [Gatilhos de migração](#18-gatilhos-de-migração)

**Parte IV — Arquitetura alvo**
19. [Arquitetura de sistema](#19-arquitetura-de-sistema) · 20. [ADRs](#20-decisões-de-arquitetura-adrs) · 21. [Repositório](#21-estrutura-do-repositório) · 22. [Modelo de dados](#22-modelo-de-dados) · 23. [Identificadores](#23-identificadores-e-ordenação) · 24. [Permissões](#24-sistema-de-permissões) · 25. [API REST](#25-api-rest) · 26. [Gateway](#26-gateway-de-tempo-real) · 27. [Ciclo da mensagem](#27-ciclo-de-vida-da-mensagem) · 28. [Presença](#28-presença-e-estado-de-leitura) · 29. [Live Rooms](#29-voz-vídeo-e-screen-sharing) · 30. [Mídia](#30-upload-e-pipeline-de-mídia) · 31. [Notificações](#31-notificações) · 32. [Busca](#32-busca) · 33. [Moderação](#33-moderação-e-audit-log) · 34. [Segurança](#34-segurança) · 35. [Frontend](#35-arquitetura-de-frontend) · 36. [Design system](#36-design-system-loop) · 37. [Apps em Room](#37-plataforma-de-aplicações-em-room) · 38. [Observabilidade](#38-observabilidade-e-slos) · 39. [Testes](#39-estratégia-de-testes) · 40. [Infra e CI/CD](#40-infraestrutura-deploy-e-cicd) · 41. [Custos](#41-custos-e-projeção-de-escala) · 42. [Desktop](#42-desktop--windows-e-macos) · 43. [Roadmap](#43-roadmap-consolidado) · 44. [Riscos](#44-riscos-e-mitigações) · 45. [Anexos](#45-anexos)

---
---

# PARTE I — PRODUTO E MARCA

## 1. Visão e decisão atual

### 1.1 O que é LOOP

> **LOOP é uma plataforma web de comunidades e comunicação em tempo real, baseada em Spaces, Rooms e People.**

Não é um clone do Discord. A lógica de comunidade é inspirada nele — o objetivo, o vocabulário, a estética e a direção de produto são próprios.

### 1.2 Decisão atual

**Construir primeiro uma versão web extremamente simples para 5 pessoas, com Next.js + Supabase: autenticação, um Space, Rooms de texto e mensagens em tempo real.**

O primeiro objetivo técnico é único e verificável:

```
Pessoa A                              Pessoa B
   ↓                                     ↓
entra no Space                     está no mesmo Room
   ↓                                     ↓
abre um Room                              │
   ↓                                     │
envia "Olá"  ──────► SUPABASE ──────►  recebe "Olá" imediatamente
                     REALTIME              (sem refresh)
```

Todo recurso que não contribua diretamente para atingir e validar esse objetivo fica para depois. Isso inclui recursos que estão especificados em detalhe na Parte IV deste documento.

### 1.3 O problema que justifica existir

Times criativos e técnicos operam fragmentados entre quatro ferramentas: Discord (comunicação informal e voz), Slack (trabalho), Notion (documentação) e Teams/Meet (reuniões). O custo não é a assinatura — é o **contexto perdido**: a decisão foi tomada na call, registrada em lugar nenhum, referenciada num arquivo no Drive, e a task que saiu dela vive num board que ninguém abre.

A aposta de longo prazo do LOOP é que o **Room seja a unidade de contexto**, não a conversa: conversa, arquivos, tarefas e reunião no mesmo espaço, com a mesma lista de pessoas e as mesmas permissões (§37).

**Isso não está no MVP.** Está aqui porque as decisões de schema e de permissão da Fase 1 precisam não fechar essa porta.

### 1.4 Personas

| Persona | Perfil | Necessidade central | No MVP? |
|---------|--------|--------------------|---------|
| **Juscelio** — Technical Artist | Lidera estúdio pequeno | Conversar e revisar trabalho sem trocar de ferramenta | ✅ é um dos 5 |
| **Pedro** — Dev | Membro do time | Chat rápido, histórico confiável | ✅ é um dos 5 |
| **Maria** — Designer | Membro do time | Interface agradável de usar todo dia | ✅ é um dos 5 |
| **Ana** — Product Owner | Coordena squads | Rastrear decisões até a task | Fase 3 |
| **Carlos** — Comunidade pública | Comunidade de milhares | Achar informação sem se perder | Fase 3 |
| **Marcos** — Moderador | Modera comunidade grande | Agir rápido com trilha auditável | Fase 2 |

O MVP é validado pelas três primeiras. As outras três definem a arquitetura, não o backlog atual.

### 1.5 Princípios

1. **Tempo real por padrão.** Nenhuma tela exige refresh.
2. **Permissão é uma coisa só.** Um único modelo governa chat, arquivos, voz e apps. Nada de ACL paralela por feature.
3. **O frontend nunca é a única camada de permissão.** No MVP isso significa RLS; depois, o motor de permissões no servidor. Esconder o botão não é controle de acesso.
4. **Otimismo na UI, verdade no servidor.** A ação aparece instantânea; o servidor reconcilia e, se recusar, a UI reverte de forma visível.
5. **Simples e vivo antes de completo.** Cinco pessoas gostando de conversar vale mais que quarenta recursos.
6. **Extensível sem fork.** Quando a plataforma de apps existir, os apps nativos usarão o mesmo SDK público que terceiros.

---

## 2. LOOP — marca e identidade

### 2.1 Conceito

O nome parte da ideia de um ciclo contínuo entre pessoas:

```
Conectar → Conversar → Compartilhar → Voltar → LOOP
```

A marca deve transmitir: conexão, comunidade, continuidade, presença, comunicação, simplicidade, tecnologia.

Deve **evitar**: estética gamer, cópia visual do Discord, tom corporativo de ferramenta de RH.

Direção: `Minimal + Premium + Social + Contemporânea + Tecnológica`.

### 2.2 Tagline

> **Stay in the Loop.**

Funciona em dois níveis: permanecer conectado e informado, e estar dentro da plataforma. É a assinatura de referência — outras podem ser exploradas depois, nenhuma substitui esta sem motivo.

### 2.3 Vocabulário do produto

| Conceito tradicional | LOOP | Nome técnico (banco/API/código) |
|---------------------|------|--------------------------------|
| Server / Guild | **Space** | `servers` |
| Category | **Group** | `categories` |
| Channel | **Room** | `channels` |
| Voice channel | **Live Room** | `channels` (type `voice`) |
| Members | **People** | `server_members` |
| Direct Messages | **Messages** | `dm_channels` |
| Invite | **Invite to Space** | `invites` |
| Thread | **Side** | `channels` (type `thread`) |
| Role | **Tag** | `roles` |

Por ADR-010, o banco e o código permanecem com a nomenclatura técnica. Apenas a interface fala LOOP, através de um único arquivo:

```ts
// lib/vocabulary.ts — ÚNICA fonte do vocabulário de UI.
// O banco usa server/channel/member. Aqui é onde vira Space/Room/People.
export const V = {
  space: 'Space',  spaces: 'Spaces',
  room:  'Room',   rooms:  'Rooms',
  liveRoom: 'Live Room',
  people: 'People',
  group: 'Group',
  tag: 'Tag',
  messages: 'Messages',
  inviteToSpace: 'Invite to Space',
} as const;
```

Nenhuma string dessas pode ser escrita à mão dentro de um componente. Se aparecer `"Space"` literal num JSX, é bug de convenção.

### 2.4 Hierarquia conceitual

```
LOOP
 ├── SPACE
 │     ├── ROOM
 │     ├── ROOM
 │     └── PEOPLE
 ├── SPACE
 └── MESSAGES

Futuro:
SPACE
 ├── ROOMS
 ├── LIVE
 ├── PEOPLE
 ├── FILES
 └── APPS
```

A estrutura deixa espaço explícito para LOOP evoluir além de chat — `FILES` e `APPS` são o gancho para §37.

Exemplo de navegação renderizada:

```
LOOP

YOUR SPACES
● Factory
● Friends
● Unreal Artists

FACTORY

ROOMS
# general
# projects
# inspiration

LIVE
◉ Lounge
◉ Meeting

PEOPLE
● Juscelio
● Pedro
● Maria
```

### 2.5 Direção visual

```
Dark interface
Off-white typography
Neutral surfaces
One strong accent color
```

Base de superfícies definida:

| Token | Hex | Uso |
|-------|-----|-----|
| Background | `#0D0D10` | Fundo da aplicação, rail de Spaces |
| Surface | `#151519` | Sidebar de Rooms |
| Elevated Surface | `#1D1D23` | Cards, hover, composer |
| Primary Text | `#F5F5F7` | Texto principal |
| Secondary Text | `#98989F` | Metadados, timestamps |

Evitar: excesso de bordas, gradientes, glow, elementos gamer, muita informação simultânea, menus complexos.

Priorizar: hierarquia, espaço negativo, tipografia, microinterações, feedback imediato, animações sutis.

### 2.6 Cor proprietária — decisão pendente

A cor de acento ainda não está definida. Restrições que ela precisa satisfazer:

1. **Contraste ≥ 4,5:1 sobre `#0D0D10`** para texto, ≥ 3:1 para elementos gráficos (WCAG AA).
2. **Não competir com avatares e cores de Tag** dos usuários — por isso, nada de saturação máxima.
3. **Distinguível dos estados semânticos** (verde de online, amarelo de idle, vermelho de erro). Isso elimina de saída o verde-lima como acento principal: ele colide com `online`.
4. **Legível em daltonismo** — testar em deuteranopia e protanopia.
5. **Não roxo, não azul-índigo.** Território do Discord.

Candidatas concretas para teste:

| Direção | Hex sugerido | Contraste sobre `#0D0D10` | Observação |
|---------|-------------|--------------------------|------------|
| **Cyan elétrico** | `#22D3EE` | 9,8:1 | Muito legível, tecnológico, longe do Discord. Risco: comum em produtos dev/IA. |
| **Coral** | `#FF6B5A` | 5,4:1 | Quente e social, raro em ferramentas de comunicação. Risco: proximidade do vermelho de erro — exige que `danger` mude para um vermelho mais frio. |
| **Amarelo-âmbar** | `#F5C542` | 12,1:1 | Máxima legibilidade, muito distinto. Risco: colide com `idle`. |
| **Verde-menta frio** | `#3DDC97` | 10,2:1 | Fresco, premium. Risco: colide com `online`. |

Recomendação de processo: escolher **coral** ou **cyan** e ajustar o estado semântico que colidir, em vez do contrário. O acento aparece em toda a interface; o estado semântico aparece num ponto de 8px. Quem cede é o menor.

### 2.7 Logo

Deve funcionar como wordmark (`LOOP`) e como símbolo independente.

Direção conceitual:

> Um traço contínuo formando um loop, criando simultaneamente uma referência sutil a conexão e conversa.

Vocabulário explorável: loop contínuo, infinito abstrato, dois elementos conectados, letra L, balão de conversa, nós. **Não usar todos literalmente ao mesmo tempo** — o objetivo é um símbolo extremamente simples e reconhecível.

Precisa funcionar em: favicon 16px, web app, avatar, ícone de app, Windows, macOS, mobile (futuro), tray icon (futuro), redes sociais.

Teste de validação: se o símbolo não é reconhecível a 16×16 em monocromático, ele ainda não está pronto.

### 2.8 Motion branding

```
ponto → linha é desenhada → forma o símbolo → o traço fecha o circuito → LOOP
```

O fechamento representa visualmente completar um loop. Uso futuro: loading, splash, homepage, transições, app desktop, vídeos de marca.

**Não é requisito do MVP.** No MVP, o loading é um esqueleto estático — animação de marca antes de ter produto é sinal invertido de prioridade.

### 2.9 Personalidade da interface

> Um espaço digital moderno onde grupos permanecem conectados.

A interface deve transmitir: rápida, simples, social, organizada, viva, premium.

Não deve parecer ferramenta corporativa nem produto gamer.

---

## 3. Escopo por fase

### 3.1 Fase 1 — MVP web para 5 pessoas

**Obrigatório:**

cadastro · login · logout · perfil básico · avatar · um Space · People · Rooms de texto · trocar de Room · enviar mensagem · receber em tempo real · histórico · horário da mensagem · editar a própria mensagem · excluir a própria mensagem · estados de carregamento · tratamento de erros · responsivo para desktop/browser.

**Desejável, só se o núcleo estiver estável:**

reactions · reply · upload de imagem · indicador "digitando…" · presença online · criar Room pela interface · convite por link.

Nenhum item desta segunda lista pode atrasar a validação do chat principal. Se a semana 6 chegar com o núcleo instável, os desejáveis são cortados sem discussão.

### 3.2 Fora do MVP

| Item | Fase |
|------|------|
| App Windows / macOS | 4 |
| App mobile | 4+ |
| Voz, vídeo, screen share | 3 |
| Bots, marketplace | 4 |
| Moderação complexa, audit log | 2 |
| Múltiplos Spaces, Tags, permissões avançadas | 2 |
| DMs, threads, busca, notificações | 2 |
| Infraestrutura própria, microserviços, Redis, filas | 3 |
| Federação, E2E encryption, monetização, compliance formal | Não planejado |

### 3.3 Restrições assumidas

- Time: 1 a 3 desenvolvedores.
- Orçamento de infra no MVP: **tiers gratuitos**, migrando para pago antes de qualquer abertura pública.
- Prazo alvo do MVP: **8 semanas** até o teste com 5 pessoas.
- Latência de mensagem percebida no MVP: **< 1 s** ponta a ponta (a meta de 250 ms p95 é da arquitetura alvo, não do MVP).
- Somente web. Navegadores alvo: Chrome, Edge, Firefox, Safari — desktop, versões atuais.

---

## 4. Glossário e modelo de domínio

### 4.1 Glossário

| Termo | Definição |
|-------|-----------|
| **Space** (`servers`) | Comunidade isolada; unidade de tenancy lógica. Contém Rooms, Tags e People. |
| **Group** (`categories`) | Agrupador de Rooms; carrega overrides de permissão herdados pelos filhos. *(Fase 2)* |
| **Room** (`channels`) | Espaço de conversa. Tipos: `text`, `voice`, `announcement`, `forum`, `thread`, `stage`. |
| **Live Room** | Room de tipo `voice`. *(Fase 3)* |
| **People / membro** (`server_members`) | Relação entre usuário e Space. Carrega apelido, Tags e data de entrada. |
| **Tag** (`roles`) | Conjunto nomeado de permissões, com cor e posição hierárquica. *(Fase 2)* |
| **Override** | Allow/deny aplicado a uma Tag ou pessoa num Room ou Group específico. *(Fase 2)* |
| **Side** (`thread`) | Conversa paralela derivada de uma mensagem. *(Fase 2)* |
| **Presença** | Estado volátil de conexão: `online`, `idle`, `busy`, `offline`. |
| **Sessão** | Uma conexão de tempo real ativa. Um usuário pode ter N sessões. |
| **App de Room** | Extensão que renderiza uma aba dentro de um Room, em sandbox. *(Fase 3)* |
| **Snowflake** | ID de 64 bits ordenável por tempo, usado como PK de entidades de alto volume. |

### 4.2 Diagrama de entidades — alvo

```
                    ┌──────────┐
                    │  users   │  (MVP: profiles + auth.users)
                    └────┬─────┘
        ┌────────────────┼──────────────────┬──────────────┐
        │                │                  │              │
 ┌──────▼────────┐ ┌─────▼──────┐  ┌────────▼──────┐ ┌─────▼──────┐
 │ server_members│ │ friendships│  │ dm_participants│ │  sessions  │
 └──────┬────────┘ └────────────┘  └────────┬──────┘ └────────────┘
        │                                    │
        │ N:M via member_roles          ┌────▼────────┐
        │                               │dm_channels  │
 ┌──────▼─────┐      ┌──────────┐       └─────────────┘
 │  servers   │──1:N─│  roles   │
 └──────┬─────┘      └────┬─────┘
        │                 │
        │ 1:N             │ N:M
 ┌──────▼─────┐    ┌──────▼──────────────┐
 │ categories │    │ permission_overrides│
 └──────┬─────┘    └─────────▲───────────┘
        │ 1:N                │
 ┌──────▼─────┐──────────────┘
 │  channels  │
 └──────┬─────┘
        │ 1:N
 ┌──────▼─────┐      ┌───────────────────┐
 │  messages  │─1:N──│ message_reactions │
 └──────┬─────┘      └───────────────────┘
        │ 1:N
 ┌──────▼──────┐
 │ attachments │
 └─────────────┘
```

**No MVP existem apenas cinco caixas:** `profiles`, `servers`, `server_members`, `channels`, `messages`. O resto é o destino (§22).

### 4.3 Invariantes de domínio

Regras que o sistema **nunca** pode violar, verificadas por constraint de banco sempre que possível.

Válidas desde o MVP:

1. Todo Space tem exatamente um `owner_id` válido e ao menos um Room de texto.
2. Uma mensagem não pode ter `reply_to` apontando para outro Room.
3. `deleted_at` preenchido implica `content` apagado (o tombstone preserva apenas metadados).
4. Ninguém edita mensagem de outra pessoa — nem via API, nem via banco.

A partir da Fase 2:

5. Todo Space tem uma Tag `@everyone` com `position = 0`, não deletável e não removível de ninguém.
6. Ninguém pode receber Tag de posição ≥ à sua posição mais alta (exceto o owner).
7. Pessoa banida não pode existir em `server_members` do mesmo Space.
8. `member_roles` só referencia Tags do mesmo `server_id` do membro.

---
---

# PARTE II — MVP (FASE 1)

*Esta parte é executável. O que está aqui se constrói; o que está na Parte IV, não.*

## 5. Stack e arquitetura do MVP

### 5.1 Stack

| Camada | Escolha |
|--------|---------|
| Frontend | Next.js 15 (App Router), React, TypeScript, Tailwind CSS |
| Auth | Supabase Auth (e-mail + senha) |
| Banco | Supabase PostgreSQL |
| Autorização | Row Level Security (RLS) |
| Tempo real | Supabase Realtime (Postgres Changes) |
| Arquivos | Supabase Storage |
| Hospedagem | Vercel |
| Versionamento | Git, desde o primeiro commit |

Domínio inicial aponta para a Vercel. Cloudflare (DNS, WAF, rate limiting) entra antes de qualquer abertura pública, não agora.

### 5.2 Arquitetura

```
              USUÁRIO
                 │
                 ▼
             NAVEGADOR
                 │
                 ▼
        NEXT.JS / REACT  (Vercel)
                 │
    ┌────────────┼────────────┬─────────────────┐
    ▼            ▼            ▼                 ▼
SUPABASE     POSTGRES     SUPABASE          SUPABASE
  AUTH       (+ RLS)      REALTIME          STORAGE
```

Não há backend próprio. Não há Redis, filas, workers, gateway ou microserviços. **Isso é a decisão, não uma omissão.**

### 5.3 Onde mora cada responsabilidade

| Responsabilidade | Onde | Por quê |
|-----------------|------|---------|
| Quem é o usuário | Supabase Auth | JWT gerenciado, sessão, refresh |
| Quem pode ver o quê | **RLS no Postgres** | Única camada confiável; o cliente é território hostil |
| Validação de formato | Cliente + `CHECK` no banco | UX rápida no cliente, verdade no banco |
| Entrega em tempo real | Supabase Realtime | Postgres Changes por Room |
| Arquivos | Supabase Storage + policy | Mesmo modelo de RLS, aplicado a buckets |
| Server Actions / Route Handlers | Next.js | Só onde precisar de `service_role` — e o mínimo possível |

**Regra que não se negocia:** o cliente do navegador usa exclusivamente a chave `anon`. A chave `service_role` ignora RLS por completo e só pode existir em variável de ambiente de servidor, nunca prefixada com `NEXT_PUBLIC_`. Um `service_role` vazado é acesso total e irrestrito ao banco.

---

## 6. Estrutura do projeto

```
loop/
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx
│   │   └── register/page.tsx
│   ├── (app)/
│   │   ├── layout.tsx                  # AppShell: rail + sidebar + members
│   │   ├── s/[spaceId]/
│   │   │   ├── page.tsx                # redireciona ao primeiro Room
│   │   │   └── r/[roomId]/page.tsx     # Room ativo
│   │   └── settings/profile/page.tsx
│   ├── auth/callback/route.ts
│   ├── layout.tsx
│   └── globals.css
├── components/
│   ├── shell/       # SpaceRail, RoomSidebar, PeopleList, TopBar
│   ├── chat/        # MessageList, MessageGroup, MessageItem, Composer
│   └── ui/          # Button, Input, Avatar, Skeleton, Toast, Modal
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # browser client (anon)
│   │   ├── server.ts               # server client (cookies)
│   │   └── middleware.ts           # refresh de sessão
│   ├── data/                       # ÚNICO acesso a dados (ADR-008)
│   │   ├── messages.ts
│   │   ├── rooms.ts
│   │   ├── spaces.ts
│   │   └── people.ts
│   ├── realtime/
│   │   ├── transport.ts            # interface RealtimeTransport
│   │   ├── supabase-transport.ts   # implementação Fase 1
│   │   └── events.ts               # tipos de evento de domínio
│   ├── store/chat.ts               # Zustand
│   ├── vocabulary.ts               # Space / Room / People (§2.3)
│   └── format.ts
├── types/
│   ├── database.ts                 # gerado: supabase gen types
│   └── domain.ts                   # tipos de domínio (não os do banco)
├── supabase/
│   ├── migrations/                 # SQL versionado, sempre
│   └── seed.sql
└── middleware.ts
```

**Duas regras estruturais que valem o documento inteiro:**

1. Nenhum componente importa `@supabase/supabase-js` diretamente. Tudo passa por `lib/data/` ou `lib/realtime/` (ADR-008, com a regra de ESLint que torna isso executável).
2. Todo SQL vive em `supabase/migrations/`, versionado no Git. Mudança feita no painel do Supabase e não replicada em migration é dívida invisível — na hora de criar o ambiente de produção, ninguém sabe reconstruir o schema.

---

## 7. Banco de dados do MVP

Cinco tabelas. Nada além disso.

### 7.1 Decisões que valem para o futuro

Três escolhas do MVP existem para não travar a Fase 2:

| Decisão | Alternativa mais simples | Por que a mais simples é pior |
|---------|-------------------------|------------------------------|
| `messages.id` como snowflake `BIGINT` | `uuid` ou `bigserial` | Trocar a PK de mensagens depois é a migração mais cara do projeto. A função `plpgsql` custa 20 linhas hoje. |
| `role` como texto livre em `server_members` | — | É proposital que seja simples: vira `member_roles` na Fase 2. Não modelar cargos agora. |
| `deleted_at` desde o início | `DELETE` físico | Exclusão física quebra `reply_to` e o histórico de moderação futuro. |

`profiles.id` é `UUID` porque **precisa** espelhar `auth.users.id`. Essa é a única exceção ao snowflake.

### 7.2 Gerador de snowflake em Postgres

```sql
-- supabase/migrations/0001_snowflake.sql
CREATE SEQUENCE IF NOT EXISTS loop_snowflake_seq;

CREATE OR REPLACE FUNCTION loop_snowflake()
RETURNS BIGINT
LANGUAGE plpgsql
AS $$
DECLARE
  epoch    BIGINT := 1767225600000;  -- 2026-01-01T00:00:00Z
  now_ms   BIGINT;
  seq_id   BIGINT;
  shard_id INT := 1;                 -- fixo no MVP; vira por-processo depois
BEGIN
  now_ms := (EXTRACT(EPOCH FROM clock_timestamp()) * 1000)::BIGINT;
  seq_id := nextval('loop_snowflake_seq') % 4096;
  RETURN ((now_ms - epoch) << 22) | (shard_id << 12) | seq_id;
END;
$$;
```

**Atenção crítica no cliente.** `Number.MAX_SAFE_INTEGER` é 2⁵³−1; um snowflake tem até 63 bits significativos. Se o JavaScript ler esse ID como `number`, ele corrompe silenciosamente — sem erro, sem aviso, apenas um ID errado.

```sql
-- Solução: a API expõe o ID como texto.
ALTER TABLE messages ADD COLUMN id_text TEXT GENERATED ALWAYS AS (id::text) STORED;
```

E no TypeScript, `Message.id` é `string`. Sempre. Sem exceção.

### 7.3 Schema

```sql
-- supabase/migrations/0002_core.sql

-- ─────────────── profiles ───────────────
CREATE TABLE profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username     VARCHAR(32) NOT NULL,
  display_name VARCHAR(64),
  avatar_url   TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_.]{3,32}$')
);
CREATE UNIQUE INDEX profiles_username_uniq ON profiles (lower(username));

-- Cria o profile automaticamente no signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    lower(split_part(NEW.email, '@', 1)) || '_' || substr(NEW.id::text, 1, 4),
    COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ─────────────── servers (Space) ───────────────
CREATE TABLE servers (
  id         BIGINT PRIMARY KEY DEFAULT loop_snowflake(),
  name       VARCHAR(100) NOT NULL,
  icon_url   TEXT,
  owner_id   UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────── server_members (People) ───────────────
CREATE TABLE server_members (
  server_id BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id   UUID   NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role      TEXT   NOT NULL DEFAULT 'member',   -- owner | admin | member
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (server_id, user_id),
  CONSTRAINT role_values CHECK (role IN ('owner','admin','member'))
);
CREATE INDEX server_members_user_idx ON server_members (user_id);

-- ─────────────── channels (Room) ───────────────
CREATE TABLE channels (
  id         BIGINT PRIMARY KEY DEFAULT loop_snowflake(),
  server_id  BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  topic      VARCHAR(1024),
  type       TEXT NOT NULL DEFAULT 'text',
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT channel_type_values CHECK (type IN ('text')),   -- só text no MVP
  CONSTRAINT channel_name_format CHECK (name ~ '^[a-z0-9-]{1,100}$')
);
CREATE INDEX channels_server_idx ON channels (server_id, position);

-- ─────────────── messages ───────────────
CREATE TABLE messages (
  id         BIGINT PRIMARY KEY DEFAULT loop_snowflake(),
  channel_id BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id    UUID REFERENCES profiles(id) ON DELETE SET NULL,
  content    TEXT NOT NULL,
  nonce      VARCHAR(64),
  edited_at  TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT content_length CHECK (char_length(content) BETWEEN 1 AND 4000)
);
CREATE INDEX messages_channel_idx ON messages (channel_id, id DESC) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX messages_nonce_uniq ON messages (channel_id, user_id, nonce)
  WHERE nonce IS NOT NULL;
```

O `nonce` com índice único é o que impede mensagem duplicada quando o cliente reenvia após um timeout de rede. Custa uma coluna e evita a classe de bug mais irritante de chat.

### 7.4 Criar Space com Room padrão

```sql
CREATE OR REPLACE FUNCTION create_space(space_name TEXT)
RETURNS BIGINT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  new_server_id BIGINT;
  uid UUID := auth.uid();
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'não autenticado'; END IF;

  INSERT INTO servers (name, owner_id) VALUES (space_name, uid)
    RETURNING id INTO new_server_id;

  INSERT INTO server_members (server_id, user_id, role)
    VALUES (new_server_id, uid, 'owner');

  INSERT INTO channels (server_id, name, position)
    VALUES (new_server_id, 'general', 0);

  RETURN new_server_id;
END;
$$;
```

As três operações precisam ser atômicas — um Space sem owner em `server_members` fica **invisível para o próprio criador** por RLS, e é um registro órfão que ninguém consegue apagar pela interface.

### 7.5 Publicação para o Realtime

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE messages;
```

Apenas `messages`. Publicar tabelas que não mudam em tempo real é tráfego desperdiçado e superfície de vazamento a mais.

---

## 8. Row Level Security

A camada de segurança inteira do MVP. Se ela estiver errada, não há mais nada por baixo.

### 8.1 Habilitar

```sql
ALTER TABLE profiles       ENABLE ROW LEVEL SECURITY;
ALTER TABLE servers        ENABLE ROW LEVEL SECURITY;
ALTER TABLE server_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE channels       ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages       ENABLE ROW LEVEL SECURITY;
```

Tabela sem RLS habilitado e com a chave `anon` exposta é **acesso público de leitura e escrita**. Verificar isso é o primeiro item do checklist de lançamento.

### 8.2 A armadilha da recursão

A política óbvia para `server_members` é: "posso ver membros dos Spaces em que sou membro". Escrita direto, ela consulta `server_members` de dentro da política de `server_members` — recursão infinita, erro `42P17` em runtime.

A saída é uma função `SECURITY DEFINER`, que roda com os privilégios do dono e não dispara RLS:

```sql
CREATE OR REPLACE FUNCTION is_member_of(target_server_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM server_members
    WHERE server_id = target_server_id AND user_id = auth.uid()
  );
$$;

CREATE OR REPLACE FUNCTION can_access_channel(target_channel_id BIGINT)
RETURNS BOOLEAN
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM channels c
    JOIN server_members m ON m.server_id = c.server_id
    WHERE c.id = target_channel_id AND m.user_id = auth.uid()
  );
$$;

REVOKE EXECUTE ON FUNCTION is_member_of, can_access_channel FROM public;
GRANT  EXECUTE ON FUNCTION is_member_of, can_access_channel TO authenticated;
```

`SECURITY DEFINER` é poderoso e perigoso. Duas proteções obrigatórias, ambas aplicadas acima: `SET search_path = public` (impede sequestro por schema malicioso) e `REVOKE ... FROM public` (só usuário autenticado executa). Toda função `SECURITY DEFINER` deste projeto precisa das duas.

### 8.3 Políticas

```sql
-- ─────────────── profiles ───────────────
CREATE POLICY "perfis visíveis a quem compartilha Space"
  ON profiles FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM server_members a
      JOIN server_members b ON a.server_id = b.server_id
      WHERE a.user_id = auth.uid() AND b.user_id = profiles.id
    )
  );

CREATE POLICY "edita o próprio perfil"
  ON profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ─────────────── servers ───────────────
CREATE POLICY "vê Spaces em que é membro"
  ON servers FOR SELECT TO authenticated
  USING (is_member_of(id));

CREATE POLICY "owner edita o Space"
  ON servers FOR UPDATE TO authenticated
  USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());

-- ─────────────── server_members ───────────────
CREATE POLICY "vê People dos próprios Spaces"
  ON server_members FOR SELECT TO authenticated
  USING (is_member_of(server_id));

CREATE POLICY "sai do Space"
  ON server_members FOR DELETE TO authenticated
  USING (user_id = auth.uid() AND role <> 'owner');

-- ─────────────── channels ───────────────
CREATE POLICY "vê Rooms dos próprios Spaces"
  ON channels FOR SELECT TO authenticated
  USING (is_member_of(server_id));

CREATE POLICY "admin cria Room"
  ON channels FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM server_members
    WHERE server_id = channels.server_id
      AND user_id = auth.uid()
      AND role IN ('owner','admin')
  ));

-- ─────────────── messages ───────────────
CREATE POLICY "lê mensagens dos Rooms acessíveis"
  ON messages FOR SELECT TO authenticated
  USING (can_access_channel(channel_id));

CREATE POLICY "envia como si mesmo em Room acessível"
  ON messages FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND can_access_channel(channel_id));

CREATE POLICY "edita apenas a própria mensagem"
  ON messages FOR UPDATE TO authenticated
  USING (user_id = auth.uid() AND deleted_at IS NULL)
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "exclui apenas a própria mensagem"
  ON messages FOR DELETE TO authenticated
  USING (user_id = auth.uid());
```

### 8.4 Detalhes que decidem se isso funciona

**`USING` versus `WITH CHECK`.** `USING` filtra linhas existentes (SELECT, UPDATE, DELETE); `WITH CHECK` valida a linha resultante (INSERT, UPDATE). Um UPDATE com `USING` mas sem `WITH CHECK` permite que a pessoa edite a própria mensagem **e mude o `user_id` para outra pessoa** no mesmo comando. As duas cláusulas são obrigatórias em UPDATE.

**Soft delete via UPDATE, não DELETE.** A política de DELETE existe, mas a aplicação nunca a usa: excluir é `UPDATE messages SET deleted_at = now(), content = ''`. Isso preserva o histórico e mantém `reply_to` íntegro na Fase 2.

**Realtime respeita RLS, mas há uma pegadinha.** O Supabase Realtime aplica RLS nos eventos de `postgres_changes`, então ninguém recebe mensagem de Room a que não tem acesso. Porém, no evento `DELETE`, o payload traz apenas a chave primária — sem `channel_id`, a política não consegue avaliar e o evento pode ser suprimido. Mais um motivo para exclusão ser UPDATE.

**Custo de desempenho.** Cada `SELECT` em `messages` executa `can_access_channel` por linha, na ausência de otimização. Duas mitigações:
- `STABLE` nas funções permite ao planner cachear o resultado dentro da mesma query.
- Envolver `auth.uid()` em subquery (`(SELECT auth.uid())`) faz o Postgres avaliá-la uma vez em vez de por linha — ganho mensurável em listas de 50 mensagens.

### 8.5 Testes de RLS obrigatórios

Executados como usuário autenticado real, não com `service_role`:

| # | Cenário | Esperado |
|---|---------|----------|
| 1 | Usuário fora do Space faz `SELECT` em `messages` daquele Space | 0 linhas |
| 2 | Usuário tenta `INSERT` com `user_id` de outra pessoa | erro |
| 3 | Usuário tenta `UPDATE` em mensagem alheia | 0 linhas afetadas |
| 4 | Usuário tenta `UPDATE` na própria mensagem mudando `user_id` | erro (`WITH CHECK`) |
| 5 | Usuário tenta `INSERT` em Room de Space que não é seu | erro |
| 6 | Usuário fora do Space assina o canal Realtime daquele Room | nenhum evento recebido |
| 7 | Requisição sem JWT em qualquer tabela | 0 linhas |
| 8 | Owner tenta se remover de `server_members` | erro |

O teste 6 é o mais esquecido e o mais grave: é possível ter RLS correto no REST e vazamento no Realtime.

---

## 9. Autenticação

### 9.1 Escopo

E-mail + senha, via Supabase Auth. Para 5 pessoas isso basta. OAuth e MFA são Fase 2.

Rotas: `/login`, `/register`. Funções: criar conta, entrar, sair, manter sessão. Recuperação de senha entra ainda na Fase 1, mas depois do chat funcionar.

### 9.2 Sessão no App Router

O ponto de atrito real do Next.js com Supabase é o refresh de sessão entre Server Components e o cliente. A solução é `@supabase/ssr` com middleware:

```ts
// middleware.ts
import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  return await updateSession(request);   // refresh de cookie + proteção de rota
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|webp)$).*)'],
};
```

O middleware faz três coisas: renova o token expirado, grava o cookie atualizado na resposta e redireciona para `/login` quem tentar acessar `(app)` sem sessão.

**Erro comum:** confiar em `getSession()` no servidor. Ele lê o cookie sem validar a assinatura — um cookie forjado passa. No servidor, sempre `getUser()`, que verifica com o Auth server.

### 9.3 Onboarding

```
/register → cria conta → trigger cria profile automaticamente
   ↓
verificação de e-mail (pode ficar desativada nos 5 usuários de teste)
   ↓
/login → sessão ativa
   ↓
tem Space?  ── não ──► tela "criar Space" ou "entrar com convite"
   │
   sim
   ↓
redireciona ao último Room visitado (localStorage) ou ao primeiro
```

O username gerado pelo trigger é provisório (`juscelio_a1b2`). A tela de perfil permite trocá-lo — com verificação de unicidade que retorna erro tratado, não um 500 cru do constraint.

---
## 10. Fluxo de mensagens

### 10.1 Envio otimista

Mesmo com só 5 pessoas, a mensagem precisa aparecer instantaneamente. Esperar o round-trip do banco antes de renderizar é a diferença entre parecer um chat e parecer um formulário.

```ts
// lib/data/messages.ts
export async function sendMessage(roomId: string, content: string) {
  const nonce = crypto.randomUUID();
  const me = useSession.getState().user;

  chatStore.insertOptimistic(roomId, {
    id: `pending:${nonce}`, nonce, roomId, content,
    author: me, createdAt: new Date().toISOString(), state: 'sending',
  });

  const { data, error } = await supabase
    .from('messages')
    .insert({ channel_id: roomId, user_id: me.id, content, nonce })
    .select('id::text, channel_id::text, user_id, content, created_at')
    .single();

  if (error) {
    chatStore.patchByNonce(nonce, { state: 'failed', error: toUserError(error) });
    return;
  }
  chatStore.reconcile(nonce, { ...toDomain(data), state: 'sent' });
}
```

O evento do Realtime frequentemente chega **antes** da resposta do `insert`. A reconciliação por `nonce` é o que impede a mensagem de aparecer duas vezes — e o índice único no banco impede que um retry crie duas linhas.

### 10.2 Estados

```
[digitando] → [sending] ──✓──► [sent]
                  │
                  ✗
                  ▼
              [failed] ──(clique em "tentar de novo")──► [sending]
```

`failed` precisa ser visível e acionável: mensagem em vermelho translúcido, com botão de retry. Mensagem que some silenciosamente destrói a confiança no produto mais rápido que qualquer bug de layout.

### 10.3 Editar e excluir

```ts
export const editMessage = (id: string, content: string) =>
  supabase.from('messages')
    .update({ content, edited_at: new Date().toISOString() })
    .eq('id', id);          // RLS garante que só o autor consegue

export const deleteMessage = (id: string) =>
  supabase.from('messages')
    .update({ deleted_at: new Date().toISOString(), content: '' })
    .eq('id', id);
```

Na UI, mensagem editada mostra `(editado)` discreto ao lado do horário; mensagem excluída some da lista (no MVP; vira tombstone visível quando existir `reply`).

### 10.4 Carregamento do histórico

```ts
// 50 mensagens mais recentes; cursor por id para páginas anteriores
const query = supabase
  .from('messages')
  .select('id::text, content, created_at, edited_at, user_id, profiles(username, display_name, avatar_url)')
  .eq('channel_id', roomId)
  .is('deleted_at', null)
  .order('id', { ascending: false })
  .limit(50);

// scroll para cima
if (cursor) query.lt('id', cursor);
```

Nunca usar `range()`/offset: o custo cresce com a profundidade e o resultado fica instável quando chega mensagem nova durante a paginação.

### 10.5 Agrupamento

Mensagens consecutivas do mesmo autor dentro de 7 minutos aparecem agrupadas — avatar e nome só na primeira, horário no hover das demais. É uma regra de apresentação, calculada no render, nunca persistida.

---

## 11. Camada de tempo real

Esta seção é a mais importante da Parte II para o futuro do projeto. É ela que decide se sair do Supabase, mais tarde, custa dias ou meses.

### 11.1 O que o Supabase Realtime entrega

`postgres_changes` emite INSERT/UPDATE/DELETE de uma tabela, filtrável por coluna, com RLS aplicada. Para um Room de texto com 5 pessoas, isso é exatamente suficiente.

O que ele **não** é: um protocolo de eventos de domínio. Ele entrega linhas de tabela, não `MESSAGE_CREATE` com autor hidratado e permissões resolvidas. Essa diferença é a raiz do lock-in — e o motivo da abstração abaixo.

### 11.2 Assinatura

```ts
const channel = supabase
  .channel(`room:${roomId}`)
  .on('postgres_changes',
    { event: '*', schema: 'public', table: 'messages', filter: `channel_id=eq.${roomId}` },
    (payload) => handle(payload))
  .subscribe((status) => setConnection(status));
```

Uma assinatura por Room aberto. Ao trocar de Room, `removeChannel` do anterior — assinaturas órfãs consomem cota de conexão e entregam eventos que ninguém consome.

### 11.3 A interface que protege o futuro

```ts
// lib/realtime/transport.ts
export type DomainEvent =
  | { type: 'MESSAGE_CREATE'; roomId: string; message: Message }
  | { type: 'MESSAGE_UPDATE'; roomId: string; message: Message }
  | { type: 'MESSAGE_DELETE'; roomId: string; messageId: string }
  | { type: 'PRESENCE_SYNC';  roomId: string; people: PresenceEntry[] }
  | { type: 'TYPING';         roomId: string; userId: string };

export interface RealtimeTransport {
  connect(): Promise<void>;
  disconnect(): void;
  subscribeRoom(roomId: string): Promise<void>;
  unsubscribeRoom(roomId: string): void;
  on(handler: (event: DomainEvent) => void): () => void;
  status(): 'connecting' | 'open' | 'closed' | 'error';
}
```

A UI e o store conhecem **apenas** essa interface e o tipo `DomainEvent`. O adaptador Supabase traduz `payload.new` em `MESSAGE_CREATE`; um futuro `GatewayTransport` traduzirá frames WebSocket nos mesmos eventos.

```ts
// lib/realtime/supabase-transport.ts
export class SupabaseTransport implements RealtimeTransport {
  private channels = new Map<string, RealtimeChannel>();
  private handlers = new Set<(e: DomainEvent) => void>();

  async subscribeRoom(roomId: string) {
    if (this.channels.has(roomId)) return;
    const ch = supabase.channel(`room:${roomId}`)
      .on('postgres_changes',
          { event: '*', schema: 'public', table: 'messages',
            filter: `channel_id=eq.${roomId}` },
          (p) => this.emit(toDomainEvent(roomId, p)))
      .subscribe();
    this.channels.set(roomId, ch);
  }

  private emit(e: DomainEvent | null) {
    if (e) for (const h of this.handlers) h(e);
  }
  // ...
}
```

O custo dessa indireção é de umas 80 linhas. O benefício é que, na Fase 3, a migração para gateway próprio é **um arquivo novo mais a troca de uma linha de instanciação** — validada pelos mesmos testes que já cobrem o adaptador atual.

### 11.4 Reconexão

O Supabase Realtime reconecta sozinho, mas **não recupera o que foi perdido durante a queda**. Isso é responsabilidade da aplicação:

```ts
transport.onStatusChange(async (status) => {
  if (status === 'open' && lastKnownMessageId) {
    const missed = await fetchMessagesAfter(roomId, lastKnownMessageId);
    chatStore.mergeMissed(roomId, missed);   // merge por id, sem duplicar
  }
});
```

Sem esse refetch, o usuário perde o trecho da conversa que aconteceu enquanto o Wi-Fi caiu — e nem percebe, porque a interface parece normal. É o bug mais insidioso de aplicações realtime, e ele nunca aparece em teste local.

### 11.5 Presença e digitando (opcionais do MVP)

Se entrarem, usar Supabase Presence e Broadcast, **não** tabelas:

```ts
channel.track({ user_id: me.id, status: 'online', at: Date.now() });
channel.send({ type: 'broadcast', event: 'typing', payload: { userId: me.id } });
```

Presença e digitação são dados efêmeros. Persistir isso no Postgres gera escrita constante, invalida cache e não traz nenhum benefício — o estado correto após um restart é "ninguém está digitando".

---

## 12. Interface do MVP

### 12.1 Layout

```
┌───────┬──────────────────┬──────────────────────────────┬──────────────┐
│       │  FACTORY         │  # general                   │  PEOPLE      │
│ SPACES│                  │                              │              │
│       │  ROOMS           │  Juscelio      hoje 15:42    │  ONLINE — 3  │
│  ◆ F  │  # general    ●  │  Olá pessoal                 │  ● Juscelio  │
│       │  # projects      │                              │  ● Pedro     │
│       │  # inspiration   │  Maria         hoje 15:43    │  ● Maria     │
│       │                  │  Olá!                        │              │
│       │                  │                              │  OFFLINE — 2 │
│       │                  │                              │  ○ Ana       │
│       │                  ├──────────────────────────────┤  ○ Carlos    │
│  ⊕    │  ⚙ Juscelio      │  Mensagem em #general     ⏎  │              │
└───────┴──────────────────┴──────────────────────────────┴──────────────┘
  72px         240px                    flex                   220px
```

Breakpoints: `< 768px` mostra uma coluna por vez; `768–1024px` esconde People; `> 1024px` layout completo. A lista de People pode ficar de fora da primeira semana — o chat não depende dela.

### 12.2 Tokens iniciais

```css
:root {
  --bg:          #0D0D10;   /* background          */
  --surface:     #151519;   /* sidebar             */
  --elevated:    #1D1D23;   /* cards, hover, input */
  --fg:          #F5F5F7;   /* primary text        */
  --fg-muted:    #98989F;   /* secondary text      */
  --fg-subtle:   #6A6A73;   /* timestamps          */
  --border:      #26262E;

  --accent:      #FF6B5A;   /* PROVISÓRIO — ver §2.6 */
  --online:      #3DDC97;
  --idle:        #F5C542;
  --busy:        #E5484D;
  --offline:     #6A6A73;
  --danger:      #E5484D;

  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --text-sm: 0.8125rem; --text-base: 0.9375rem;

  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px; --sp-4: 16px; --sp-6: 24px;
  --radius: 8px; --radius-lg: 12px;
  --dur: 160ms; --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

Texto base a **15px**, não 16px: densidade importa numa interface de chat, e 15px é onde ainda há conforto de leitura com mais linhas visíveis.

O `--accent` está marcado como provisório de propósito. Ele aparece em poucos lugares (botão primário, indicador de Room ativo, foco) justamente para que trocá-lo depois da definição de marca custe uma linha.

### 12.3 Componentes do MVP

| Grupo | Componentes |
|-------|-------------|
| Shell | `AppShell`, `SpaceRail`, `RoomSidebar`, `PeopleList`, `UserBar` |
| Chat | `MessageList`, `MessageGroup`, `MessageItem`, `Composer`, `EmptyRoom`, `DateDivider` |
| UI | `Button`, `Input`, `Textarea`, `Avatar`, `Skeleton`, `Toast`, `Modal`, `ContextMenu` |
| Estado | `LoadingState`, `ErrorState`, `OfflineBanner` |

`LoadingState`, `ErrorState` e `OfflineBanner` não são acessórios — são requisito explícito do MVP. Interface que trava sem explicar parece quebrada mesmo quando está funcionando.

### 12.4 Detalhes de comportamento que definem a percepção

| Detalhe | Comportamento |
|---------|--------------|
| Auto-scroll | Só rola sozinho se já estava a menos de 100px do fim |
| Scroll ao trocar de Room | Restaura a posição anterior; se não houver, vai ao fim |
| `Enter` | Envia; `Shift+Enter` quebra linha |
| `↑` no composer vazio | Edita a última mensagem própria |
| `Esc` | Cancela edição/reply |
| Composer | Cresce até 6 linhas, depois rola internamente |
| Rascunho | Preservado por Room ao trocar de aba (em memória) |
| Room ativo | Indicador de acento à esquerda + fundo `--elevated` |
| Não lido | Ponto de acento à direita do nome do Room |

### 12.5 Acessibilidade mínima

Mesmo no MVP: navegação por Tab em toda a interface, foco visível com anel de 2px, `role="log"` com `aria-live="polite"` na lista de mensagens, contraste ≥ 4,5:1 em texto, respeito a `prefers-reduced-motion`. Adicionar acessibilidade depois custa 5× mais que fazer certo agora.

---

## 13. Ordem de desenvolvimento

Oito semanas. A ordem importa: cada passo depende do anterior e nenhum é pulável.

### Semana 0 — Fundação de marca e UI

1. Definir símbolo, wordmark e cor proprietária da LOOP (§2.6, §2.7).
2. Definir tipografia e tokens de UI.
3. Criar favicon.
4. Desenhar a primeira tela (Room com mensagens) em alta fidelidade.

**Saída:** tokens em `globals.css` e uma tela de referência. Não é design completo — é o suficiente para não construir a interface duas vezes.

### Semana 1 — Projeto e infraestrutura

5. `create-next-app` com TypeScript + Tailwind; repositório Git no primeiro commit.
6. Projeto no Supabase; variáveis de ambiente configuradas.
7. Migrations `0001_snowflake.sql` e `0002_core.sql` aplicadas.
8. RLS habilitado e políticas aplicadas (§8).
9. Deploy na Vercel funcionando com uma página vazia.

**Saída:** pipeline `git push → Vercel → produção` verde.

### Semana 2 — Autenticação

10. `/login`, `/register`, logout, middleware de sessão.
11. Trigger de criação de profile validado.
12. Proteção das rotas de `(app)`.

**Saída:** usuário se registra, entra, vê tela vazia autenticada, atualiza a página e continua logado.

### Semana 3 — O primeiro milestone

13. Criar Space e Room via SQL (interface só depois).
14. `AppShell` com as quatro colunas.
15. Listar Rooms; trocar de Room via rota.
16. Listar mensagens (histórico).
17. Enviar mensagem.
18. **Assinar Realtime e receber sem refresh.**

**Saída — este é o marco que valida a fundação técnica inteira:**

```
Duas janelas de navegador, contas diferentes, mesmo Room.
A envia "Olá" → B recebe imediatamente, sem refresh.
```

Antes disso funcionar, nada mais deve ser construído.

### Semana 4 — Chat utilizável

19. Envio otimista com nonce e reconciliação.
20. Agrupamento, divisores de data, horário.
21. Editar e excluir a própria mensagem.
22. Estados de loading, erro e offline.
23. Paginação do histórico com scroll infinito para cima.
24. Refetch após reconexão (§11.4).

### Semana 5 — Pessoas e perfil

25. Perfil: display name, username, avatar (Supabase Storage).
26. Lista de People do Space.
27. Avatar e nome renderizados nas mensagens.
28. Responsividade e navegação mobile básica.

### Semana 6 — Endurecimento

29. Rodar os 8 testes de RLS (§8.5) como usuário real.
30. Validação de inputs e limites (4.000 caracteres, tipos e tamanho de upload).
31. Tratamento de todos os erros de rede com mensagem humana.
32. Backup do banco configurado e testado.
33. Revisão do checklist de segurança (§14).

### Semana 7 — Polimento e opcionais

34. Microinterações, transições, estados vazios com personalidade.
35. **Se e somente se** o núcleo estiver estável: reactions, reply, upload de imagem, typing, presença, criar Room pela UI, convite por link — nesta ordem de prioridade.

### Semana 8 — Teste com 5 pessoas

36. Onboarding real dos 5 usuários.
37. Uso durante pelo menos 5 dias corridos de conversa genuína.
38. Coleta de feedback estruturado.
39. Avaliação contra §16.

---

## 14. Segurança mínima para lançamento

Bloqueadores de lançamento — nenhum é opcional:

- [ ] HTTPS em todo o tráfego (Vercel entrega por padrão; confirmar redirect).
- [ ] RLS **habilitado em todas as cinco tabelas** e políticas aplicadas.
- [ ] Os 8 testes de §8.5 passando como usuário autenticado real.
- [ ] `service_role` inexistente no bundle do cliente — verificar com `grep -r "service_role" .next/`.
- [ ] Nenhuma chave secreta com prefixo `NEXT_PUBLIC_`.
- [ ] Variáveis de ambiente separadas entre development e production.
- [ ] Limite de tamanho de mensagem aplicado no banco (`CHECK`), não só na UI.
- [ ] Validação de todos os inputs (username com regex, nome de Room com regex).
- [ ] Rotas privadas protegidas por middleware **e** por RLS — as duas camadas.
- [ ] Restrições de upload: tipo por magic bytes, tamanho máximo, policy de bucket.
- [ ] Logs de erro capturados (Vercel Logs no mínimo; Sentry free se possível).
- [ ] Backup do banco configurado **e uma restauração testada**.
- [ ] Política de privacidade publicada, se houver qualquer usuário externo ao time.

Sobre uploads: o navegador reporta `content-type` que o cliente escolher. Validar por extensão ou por header é validar o que o atacante escreveu. A verificação real é magic bytes no servidor — e `Content-Disposition: attachment` para tudo que não seja imagem renderizável, senão um SVG malicioso executa script na origem do Storage.

---

## 15. Deploy e ambientes

```
Git Repository
      ↓
   Vercel  ──── preview por PR
      ↓
  Web App (produção)
      ↓
   Supabase
```

Dois ambientes desde o início:

| Ambiente | Projeto Supabase | Branch | Dados |
|----------|-----------------|--------|-------|
| Development | `loop-dev` | qualquer | seed sintético |
| Production | `loop-prod` | `main` | reais |

Regras:

1. **Nunca trabalhar no banco de produção sem controle.** Toda mudança de schema é uma migration aplicada primeiro em dev.
2. Migration aplicada pelo painel do Supabase e não versionada no Git **não existe** — na hora de recriar o ambiente, ela some.
3. `main` sempre deployável. Feature em branch, merge só com preview validado.
4. Backup diário ativo em produção desde o primeiro usuário real.

### 15.1 Variáveis de ambiente

```bash
# Público (chega ao navegador — só o que pode ser público)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://loop.app

# Servidor apenas — NUNCA com prefixo NEXT_PUBLIC_
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

A chave `anon` é pública por design: toda a segurança dela depende de RLS. É exatamente por isso que RLS não pode ter uma única falha.

---

## 16. Critérios de aprovação do MVP

Testar com 5 usuários reais, em uso genuíno por pelo menos 5 dias.

### 16.1 Critérios técnicos

- [ ] Os 5 conseguem criar e usar suas contas sem ajuda.
- [ ] Todos entram no mesmo Space.
- [ ] Trocam entre Rooms sem erro e sem lentidão perceptível.
- [ ] Mensagens aparecem em tempo real, sem refresh, em menos de 1 s.
- [ ] O histórico permanece após atualizar a página.
- [ ] Ninguém consegue editar ou excluir mensagem de outra pessoa.
- [ ] Usuário não autorizado não consulta conteúdo privado **direto pelo backend** (testado com chamada REST manual, não pela UI).
- [ ] Nenhuma mensagem perdida durante uso normal.
- [ ] Nenhuma mensagem duplicada, inclusive após reconexão.
- [ ] Experiência estável durante uma conversa real de verdade.
- [ ] Funciona em Chrome, Edge, Firefox e Safari desktop.

### 16.2 O critério que realmente importa

> **As pessoas gostam de usar a interface para conversar?**

Se os cinco critérios técnicos passarem e a resposta for não, o MVP **não está aprovado**. Nenhum recurso adicional conserta uma experiência básica que ninguém quer usar; a resposta correta nesse caso é revisar interface e ritmo de interação, não adicionar funcionalidade.

### 16.3 Perguntas do feedback estruturado

Fazer individualmente, não em grupo (em grupo, a primeira resposta ancora todas as outras):

1. Em quais momentos você preferiu usar WhatsApp/Discord em vez do LOOP? Por quê?
2. O que te irritou mais de usar?
3. Teve algum momento em que você não entendeu o que a interface estava fazendo?
4. Você percebeu alguma mensagem sumir, duplicar ou chegar atrasada?
5. Se pudesse adicionar uma única coisa, qual seria?
6. Se isso fosse um produto pago, valeria alguma coisa? Quanto?

A pergunta 1 é a mais reveladora do conjunto. Ela mede substituição real, não opinião educada.

---
---

# PARTE III — CHECKPOINT PÓS-MVP

## 17. Revisão pós-MVP

Aprovado o MVP, **não** partir imediatamente para novos recursos — e muito menos para Windows/macOS.

```
Feedback dos 5 usuários
        ↓
Correções de UX
        ↓
Revisão de segurança
        ↓
Revisão do banco
        ↓
Revisão de performance
        ↓
Definição das funcionalidades realmente usadas
        ↓
  só então: Fase 2
```

### 17.1 O que revisar em cada frente

| Frente | Perguntas |
|--------|-----------|
| **Banco** | Quais índices estão sendo usados de fato? Alguma query passou de 100 ms? O schema aguenta Tags e permissões sem reescrita? |
| **Arquitetura** | Onde o Supabase começou a apertar? Alguma parte da UI furou a abstração de `lib/data`? |
| **Segurança** | Alguma política de RLS ficou permissiva demais? Alguma função `SECURITY DEFINER` sem `search_path`? |
| **Performance** | Tempo até a primeira mensagem visível. Tamanho do bundle. Memória após 1 h de uso. |
| **UX** | Quais telas geraram dúvida? Onde as pessoas hesitaram? |
| **Logs** | O que quebrou em produção que ninguém percebeu? |
| **Custos** | Qual métrica do Supabase mais cresceu por usuário? |
| **Feedback** | Quais recursos foram pedidos por 3+ dos 5? |

### 17.2 Corrigir a fundação antes de escalar

A tentação, após a aprovação, é adicionar tudo da lista da Fase 2 de uma vez. O padrão que funciona é o oposto: consertar o que a revisão revelou, **e só depois** abrir a próxima frente. Uma fundação com rachadura conhecida não melhora quando se constrói o segundo andar em cima.

---

## 18. Gatilhos de migração

Cada peça de infraestrutura tem um número que autoriza a troca. Antes do número, migrar é complexidade prematura. Depois dele, adiar é apagar incêndio.

| Peça | De | Para | Gatilho |
|------|----|----|---------|
| **Realtime** | Supabase Realtime | Gateway próprio (uWS + Redis) | 200+ conexões simultâneas, **ou** latência p95 > 1 s, **ou** necessidade de evento de domínio que `postgres_changes` não expressa |
| **Autorização** | RLS puro | RLS + motor de permissões na API | Quando existirem Tags com overrides por Room — RLS com hierarquia de permissões fica lento e intestável |
| **API** | Supabase client direto | NestJS dedicado | Necessidade de rate limiting por rota, webhooks, ou lógica que não cabe em RPC |
| **Storage** | Supabase Storage | Cloudflare R2 + CDN | 50 GB armazenados **ou** custo de egress relevante na fatura |
| **Busca** | `ILIKE` simples | Postgres FTS (`tsvector`) | 100k+ mensagens ou busca visivelmente lenta |
| **Busca** | Postgres FTS | OpenSearch | ~50M mensagens |
| **Jobs** | — | Edge Functions → BullMQ | Quando existir push, thumbnail ou e-mail para processar |
| **Cache** | — | Redis | Quando a resolução de permissões passar a ser feita por requisição |
| **Voz** | — | LiveKit Cloud | Início da Fase 3 |
| **Voz** | LiveKit Cloud | LiveKit self-hosted | Custo de voz > US$ 800/mês |
| **IDs** | — | — | **Nunca migra** — snowflake desde o MVP justamente por isso |

### 18.1 O que nunca muda

Três decisões da Fase 1 são permanentes e por isso foram tomadas com cuidado desproporcional ao tamanho do MVP:

1. **Snowflake como PK de mensagens.** Migrar PK de tabela de alto volume com FKs apontando para ela é a operação mais cara do catálogo.
2. **Soft delete.** Adotar depois significa que todo o histórico anterior à mudança perdeu a informação de exclusão.
3. **A interface `RealtimeTransport`.** É a peça que torna o gatilho da primeira linha da tabela executável em dias em vez de meses.

---
---

# PARTE IV — ARQUITETURA ALVO

*Referência de destino para as Fases 2 a 4. **Não é backlog da Fase 1.** Cada seção aqui descreve o sistema completo; a Parte II descreve o que se constrói agora.*

## 19. Arquitetura de sistema

### 19.1 Visão macro

```
                          ┌────────────────────────┐
                          │   Cliente (Next.js)    │
                          │   PWA · React 19 · TS  │
                          └───┬────────────┬───────┘
                   HTTPS/REST │            │ WSS (gateway)
                              │            │
              ┌───────────────▼──┐    ┌────▼──────────────┐
              │   API Server     │    │  Gateway Server   │
              │   (NestJS)       │    │  (uWebSockets)    │
              │  REST + auth     │    │  fan-out, presença│
              └───┬─────┬────┬───┘    └────┬─────────┬────┘
                  │     │    │             │         │
      ┌───────────▼┐ ┌──▼────▼──┐    ┌─────▼────┐ ┌──▼──────┐
      │ PostgreSQL │ │  Redis   │◄───┤ Pub/Sub  │ │ Presence│
      │  (primary) │ │  cache   │    │ (Redis)  │ │  (Redis)│
      │  + replica │ └──────────┘    └──────────┘ └─────────┘
      └────────────┘
                  │
      ┌───────────▼──────┐  ┌────────────┐  ┌──────────────┐
      │ Cloudflare R2    │  │  LiveKit   │  │  Workers     │
      │ (objetos + CDN)  │  │  (SFU)     │  │  (BullMQ)    │
      └──────────────────┘  └────────────┘  └──────────────┘
                                                    │
                            ┌───────────────────────┼──────────┐
                            │                       │          │
                     ┌──────▼─────┐        ┌────────▼───┐ ┌────▼─────┐
                     │ thumbnails │        │ push (APNs │ │  e-mail  │
                     │ + probe    │        │  / FCM)    │ │ (Resend) │
                     └────────────┘        └────────────┘ └──────────┘
```

### 19.2 Responsabilidade de cada serviço

| Serviço | Responsabilidade | Escala |
|---------|-----------------|--------|
| **API Server** | CRUD, autenticação, autorização, validação, emissão de eventos | Horizontal, stateless |
| **Gateway** | Conexões WebSocket, fan-out de eventos, heartbeat, presença | Horizontal, sticky por sessão |
| **PostgreSQL** | Fonte de verdade. Tudo que precisa sobreviver a restart | Vertical + read replicas |
| **Redis** | Cache de permissões, presença, rate limit, pub/sub entre nós | Cluster quando necessário |
| **Workers** | Jobs assíncronos: thumbnails, push, e-mail, expurgo, indexação | Horizontal por fila |
| **LiveKit** | SFU de áudio/vídeo/screen share | Gerenciado (cloud) → self-hosted |
| **R2** | Blobs: anexos, avatares, banners, emojis | Gerenciado |

**Regra de ouro:** a API **nunca** envia mensagem direto ao cliente. Ela persiste no Postgres e publica no Redis pub/sub; o Gateway consome e faz o fan-out. Isso mantém API e Gateway independentemente escaláveis e permite reiniciar a API sem derrubar conexões.

### 19.3 Fluxo de uma mensagem (end-to-end)

```
1. Cliente     → gera nonce local, renderiza mensagem otimista (estado "sending")
2. Cliente     → POST /channels/:id/messages { content, nonce }
3. API         → valida sessão (JWT)
4. API         → resolve permissões (Redis; fallback Postgres)  ~2ms
5. API         → checa rate limit por (user, channel)           ~1ms
6. API         → sanitiza content, extrai menções e links
7. API         → INSERT em messages (snowflake gerado)          ~5ms
8. API         → PUBLISH redis: channel:{id} MESSAGE_CREATE
9. API         → 201 { id, nonce, created_at } ao autor
10. Cliente    → reconcilia otimista via nonce, estado "sent"
11. Gateway(N) → recebe do pub/sub, resolve sessões inscritas
12. Gateway(N) → filtra por permissão VIEW_CHANNEL (cache)
13. Gateway(N) → WS frame para cada sessão elegível
14. Workers    → enfileira push para menções offline
```

Orçamento de latência p95 (mesma região): passos 2–9 ≈ 40 ms, passos 11–13 ≈ 25 ms, rede ≈ 60 ms. Sobra folga confortável dentro dos 250 ms alvo.

### 19.4 Como se chega aqui a partir do MVP

A arquitetura acima **não é o que se constrói na Fase 1**. Ela é o destino. O MVP (Parte II) roda inteiro sobre Next.js + Supabase, sem gateway próprio, sem Redis, sem workers.

A ponte entre os dois mundos é a **camada de transporte abstrata** descrita em §11. O cliente nunca fala com o Supabase Realtime diretamente: fala com uma interface `RealtimeTransport`. Trocar a implementação por baixo dela é o que transforma a migração de "reescrever a sincronização do cliente" em "escrever um segundo adaptador".

| Peça | Fase 1 (MVP) | Fase 2 | Fase 3+ |
|------|--------------|--------|---------|
| Auth | Supabase Auth | Supabase Auth | Supabase Auth ou próprio |
| Banco | Supabase Postgres | Supabase Postgres | Postgres + réplica |
| Autorização | RLS | RLS + API server | Motor de permissões na API |
| Realtime | Supabase Realtime | Supabase Realtime | Gateway próprio (uWS) |
| Storage | Supabase Storage | Supabase Storage | Cloudflare R2 + CDN |
| Jobs | — | Supabase Edge Functions | BullMQ workers |
| Voz | — | — | LiveKit |

Cada linha dessa tabela tem um gatilho de migração explícito em §18. Migrar antes do gatilho é complexidade prematura; migrar depois é apagar incêndio.

---

## 20. Decisões de arquitetura (ADRs)

### ADR-001 — Snowflake IDs em vez de UUIDv4

**Contexto.** Mensagens são a entidade de maior volume e sempre consultadas por ordem cronológica dentro de um canal.

**Decisão.** IDs de 64 bits no formato snowflake (timestamp + worker + sequência), armazenados como `BIGINT` e serializados como string em JSON.

**Consequências.** Índice B-tree com inserção sempre à direita (sem page splits aleatórios), paginação por cursor sem coluna extra, timestamp extraível do próprio ID, 8 bytes contra 16 do UUID. Custo: precisa de um gerador coordenado (worker id por processo) e JavaScript não representa 64 bits com precisão — daí a serialização como string.

**Alternativa rejeitada.** UUIDv7 resolveria a ordenação, mas mantém 16 bytes e não carrega o worker id, útil para depurar origem.

**Aplicação no MVP.** Vale desde a Fase 1, gerado por função `plpgsql` no próprio Postgres (§7.2). Adotar snowflake depois significa migrar a PK de todas as mensagens — a decisão mais cara de adiar do documento inteiro. `profiles.id` é a exceção: continua `UUID`, porque precisa espelhar `auth.users.id` do Supabase.

---

### ADR-002 — Permissões como bitfield de 64 bits

**Contexto.** Cada render de canal, cada evento de fan-out e cada requisição precisa de checagem de permissão. Em fan-out para 5k membros, são 5k checagens por mensagem.

**Decisão.** Permissões representadas como bits em `BIGINT`. Resolução final = `OR` dos cargos, seguido de aplicação sequencial de overrides (`&= ~deny`, `|= allow`).

**Consequências.** Checagem vira uma operação de CPU (`(perms & PERM) != 0`), cacheável em Redis como um único inteiro por (usuário, canal). Custo: 64 permissões é um teto real — reservar bits com parcimônia e planejar `permissions_v2` como segundo bitfield se necessário.

---

### ADR-003 — Gateway separado da API *(revisada — v2)*

**Contexto.** Deploy de API é frequente; derrubar 5k WebSockets a cada deploy é inaceitável.

**Decisão.** Processos separados, comunicação via Redis pub/sub — **a partir da Fase 3**, quando existir uma API própria para separar.

**Consequências.** Deploy independente, escala independente (API é CPU-bound, Gateway é memória/conexão-bound). Custo: um hop a mais na latência (~5 ms) e a necessidade de garantir entrega ao menos uma vez com dedupe no cliente.

> **Nota de revisão.** A v1 deste documento recomendava construir o gateway próprio já na Fase 1, argumentando que o protocolo de tempo real é caro de trocar depois. O argumento continua correto, mas a premissa de escala mudou: o alvo agora é **5 usuários**, não 500. Para cinco pessoas, Supabase Realtime resolve o problema em um dia e o gateway próprio custaria três semanas antes da primeira mensagem trafegar — tempo tirado exatamente da validação que o MVP existe para fazer. O risco real (reescrever a sincronização do cliente na migração) é neutralizado pelo ADR-008, não pela construção antecipada. Ver §11 e §18.

---

### ADR-004 — Soft delete com tombstone para mensagens

**Contexto.** Deletar fisicamente quebra `reply_to`, contadores de thread e coerência do audit log.

**Decisão.** `deleted_at` marcado, `content` sobrescrito com string vazia, anexos removidos do storage por job assíncrono. A linha permanece.

**Consequências.** Respostas continuam resolvendo ("mensagem apagada"), moderação mantém a trilha. Custo: crescimento da tabela — mitigado por particionamento e por expurgo definitivo após 90 dias.

---

### ADR-005 — Threads como canais, não como coleção de mensagens

**Contexto.** Threads precisam de leitura própria, notificação própria, permissão própria e lista de participantes.

**Decisão.** Uma thread é uma linha em `channels` com `parent_id` e `type = 'thread'`.

**Consequências.** Todo o maquinário de canal (permissões, unread, busca, fan-out) funciona sem código novo. Custo: `channels` cresce muito mais rápido; exige arquivamento automático de threads inativas.

---

### ADR-006 — Postgres FTS antes de Elasticsearch

**Contexto.** Busca com filtros (`from:`, `in:`, `before:`) sobre milhões de mensagens.

**Decisão.** `tsvector` com índice GIN, coluna gerada, no próprio Postgres.

**Consequências.** Zero infra adicional, consistência transacional imediata, suporte nativo a português. Custo: ranking inferior ao ES e degradação acima de ~50M mensagens. Reavaliar naquele ponto — a interface de busca já é abstraída atrás de `SearchProvider` para permitir a troca.

---

### ADR-007 — SFU gerenciado (LiveKit Cloud) em vez de mesh WebRTC

**Contexto.** WebRTC peer-to-peer em malha exige de cada cliente `N-1` uploads. Com 8 participantes, são 7 streams de upload — inviável em conexão doméstica.

**Decisão.** SFU desde o primeiro dia. LiveKit Cloud enquanto o volume for baixo, self-hosted quando o custo por minuto justificar.

**Consequências.** Upload constante de 1 stream por cliente independentemente do tamanho da sala, simulcast e degradação adaptativa de graça, gravação e transcrição disponíveis. Custo: dependência de terceiro e custo por participante-minuto.

---

### ADR-008 — Supabase primeiro, com camada de transporte abstrata

**Contexto.** O MVP precisa validar experiência com 5 pessoas em semanas, não meses. Supabase entrega auth, banco, realtime, storage e autorização (RLS) de uma vez. O risco conhecido é o lock-in: quando o produto crescer, sair do Supabase Realtime pode significar reescrever toda a camada de sincronização do cliente — a parte mais frágil e mais testada da aplicação.

**Decisão.** Adotar Supabase como plataforma da Fase 1 e 2, **mas proibir que qualquer componente de UI importe o cliente Supabase diretamente**. Todo tempo real passa por uma interface `RealtimeTransport` própria (§11.3); todo acesso a dados passa por funções em `lib/data/`.

**Consequências.** A migração futura vira a escrita de um segundo adaptador (`GatewayTransport`) com a mesma interface, validado pelo mesmo conjunto de testes do adaptador Supabase. Custo: uma camada de indireção que, nas primeiras semanas, parece burocracia sem propósito. É o preço combinado de ter as duas coisas — velocidade agora e saída depois.

**Regra de lint que torna isso real:**

```js
// eslint.config.js
'no-restricted-imports': ['error', {
  paths: [{
    name: '@supabase/supabase-js',
    message: 'Use lib/data/* ou lib/realtime/* — nunca o cliente Supabase direto na UI.',
  }],
}]
```

Sem essa regra, a abstração dura duas semanas.

---

### ADR-009 — Electron para desktop, com Tauri reavaliado no momento da decisão

**Contexto.** O plano prevê LOOP for Windows e macOS reaproveitando a base web.

**Decisão.** Electron, conforme definido no plano de produto.

**Consequências.** Ecossistema maduro, `auto-updater` pronto, `desktopCapturer` com suporte sólido a screen share, e comportamento idêntico ao Chrome que já é o alvo de teste da web — o que importa muito para WebRTC. Custo: ~150 MB por instalador e ~200 MB de RAM em repouso.

**Alternativa a reavaliar.** Tauri produz binários de ~10 MB e consome bem menos memória, mas usa a webview do sistema (WebKit no macOS, WebView2 no Windows) — o que significa **dois motores WebRTC diferentes** para testar em chamadas de voz e screen share. Essa é a razão principal para não adotá-lo agora. Se, na Fase 4, o desktop for só chat e notificações (com voz permanecendo no navegador), Tauri passa a ser a escolha melhor. Decidir com o escopo do desktop na mão, não antes.

---

### ADR-010 — Vocabulário LOOP na interface, nomes técnicos no banco

**Contexto.** O produto adota linguagem própria (Space, Room, People) para não parecer clone do Discord. Traduzir isso para o schema criaria atrito com toda a literatura técnica de referência.

**Decisão.** Banco, API e código usam `server`, `channel`, `member`. Apenas a camada de apresentação usa Space, Room, People — centralizada num único arquivo de i18n.

**Consequências.** Renomear a marca (ou traduzir o produto) toca um arquivo, não o schema. Onboarding de dev novo continua batendo com a documentação de referência. Custo: um deslocamento constante entre o que o dev lê no código e o que vê na tela — mitigado por um comentário no topo do arquivo de vocabulário e pela tabela de §2.3.
---

## 21. Estrutura do repositório

Monorepo com pnpm workspaces + Turborepo.

```
loop/
├── apps/
│   ├── web/                    # Next.js 15 (App Router) — cliente principal
│   │   ├── app/
│   │   │   ├── (auth)/         # login, registro, recuperação
│   │   │   ├── (app)/
│   │   │   │   ├── channels/[serverId]/[channelId]/
│   │   │   │   ├── dm/[channelId]/
│   │   │   │   └── settings/
│   │   │   └── invite/[code]/
│   │   ├── components/
│   │   ├── features/           # slice vertical por domínio
│   │   │   ├── chat/
│   │   │   ├── voice/
│   │   │   ├── members/
│   │   │   └── permissions/
│   │   └── lib/
│   │       ├── gateway/        # cliente WS, reconexão, dedupe
│   │       ├── store/          # Zustand stores
│   │       └── api/            # cliente REST tipado
│   ├── api/                    # NestJS — REST
│   │   └── src/modules/{auth,servers,channels,messages,roles,...}
│   ├── gateway/                # uWebSockets.js — WebSocket
│   └── workers/                # BullMQ — jobs assíncronos
├── packages/
│   ├── shared/                 # tipos, constantes, permissões, snowflake
│   ├── db/                     # Drizzle schema + migrations
│   ├── ui/                     # design system
│   ├── sdk/                    # SDK público de apps de canal
│   └── config/                 # eslint, tsconfig, tailwind
├── infra/
│   ├── docker/
│   ├── terraform/
│   └── k8s/
└── docs/
    ├── adr/
    └── api/                    # OpenAPI gerado
```

**Regra de dependência:** `apps/*` pode importar de `packages/*`; `packages/*` nunca importa de `apps/*`. Tipos de domínio e constantes de permissão vivem exclusivamente em `packages/shared` — servidor e cliente compartilham a mesma definição, eliminando divergência de bitfield.

---

## 22. Modelo de dados

PostgreSQL 16. DDL abaixo é a fonte de verdade; migrations geradas por Drizzle Kit.

### 22.1 Convenções

- IDs de alto volume: `BIGINT` (snowflake). IDs de baixo volume: `UUID`.
- Timestamps: `TIMESTAMPTZ`, sempre UTC.
- Soft delete: `deleted_at TIMESTAMPTZ NULL`.
- Nomes de tabela no plural, colunas em `snake_case`.
- Toda FK tem índice explícito.
- `ON DELETE CASCADE` apenas onde o filho não faz sentido sem o pai.

### 22.2 Usuários e autenticação

```sql
CREATE TABLE users (
  id              BIGINT PRIMARY KEY,
  username        VARCHAR(32)  NOT NULL,
  username_lower  VARCHAR(32)  NOT NULL GENERATED ALWAYS AS (lower(username)) STORED,
  display_name    VARCHAR(64),
  email           CITEXT       NOT NULL,
  email_verified  BOOLEAN      NOT NULL DEFAULT false,
  password_hash   TEXT,                          -- NULL se apenas OAuth
  avatar_url      TEXT,
  banner_url      TEXT,
  bio             VARCHAR(300),
  pronouns        VARCHAR(40),
  accent_color    INTEGER,
  locale          VARCHAR(10)  NOT NULL DEFAULT 'pt-BR',
  timezone        VARCHAR(64)  NOT NULL DEFAULT 'America/Sao_Paulo',
  flags           BIGINT       NOT NULL DEFAULT 0,   -- staff, verified, bot...
  mfa_secret      TEXT,
  mfa_enabled     BOOLEAN      NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ  NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT username_format CHECK (username ~ '^[a-z0-9_.]{3,32}$')
);
CREATE UNIQUE INDEX users_username_uniq ON users (username_lower) WHERE deleted_at IS NULL;
CREATE UNIQUE INDEX users_email_uniq    ON users (email)          WHERE deleted_at IS NULL;

CREATE TABLE user_connections (          -- OAuth vinculado
  user_id      BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  provider     VARCHAR(32) NOT NULL,     -- google, github, discord
  provider_id  TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (provider, provider_id)
);

CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  refresh_hash  TEXT NOT NULL,
  user_agent    TEXT,
  ip_hash       TEXT,                    -- hash, não IP puro (LGPD)
  last_seen_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at    TIMESTAMPTZ NOT NULL,
  revoked_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX sessions_user_idx ON sessions (user_id) WHERE revoked_at IS NULL;
```

### 22.3 Servidores, membros e cargos

```sql
CREATE TABLE servers (
  id                BIGINT PRIMARY KEY,
  name              VARCHAR(100) NOT NULL,
  slug              VARCHAR(50),
  description       VARCHAR(500),
  icon_url          TEXT,
  banner_url        TEXT,
  splash_url        TEXT,
  owner_id          BIGINT NOT NULL REFERENCES users(id),
  system_channel_id BIGINT,
  rules_channel_id  BIGINT,
  afk_channel_id    BIGINT,
  afk_timeout       INTEGER NOT NULL DEFAULT 300,
  verification_level SMALLINT NOT NULL DEFAULT 0,  -- 0 none .. 3 phone
  default_notifications SMALLINT NOT NULL DEFAULT 0, -- 0 all, 1 mentions
  is_public         BOOLEAN NOT NULL DEFAULT false,
  member_count      INTEGER NOT NULL DEFAULT 0,     -- denormalizado
  features          TEXT[] NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ
);
CREATE UNIQUE INDEX servers_slug_uniq ON servers (lower(slug)) WHERE slug IS NOT NULL;
CREATE INDEX servers_public_idx ON servers (member_count DESC) WHERE is_public AND deleted_at IS NULL;

CREATE TABLE server_members (
  server_id     BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id       BIGINT NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  nickname      VARCHAR(64),
  avatar_url    TEXT,                       -- avatar por servidor
  joined_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  invite_code   VARCHAR(16),                -- atribuição de convite
  timeout_until TIMESTAMPTZ,                -- silenciamento temporário
  is_deafened   BOOLEAN NOT NULL DEFAULT false,
  is_muted      BOOLEAN NOT NULL DEFAULT false,
  PRIMARY KEY (server_id, user_id)
);
CREATE INDEX server_members_user_idx ON server_members (user_id);

CREATE TABLE roles (
  id           BIGINT PRIMARY KEY,
  server_id    BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name         VARCHAR(100) NOT NULL,
  color        INTEGER NOT NULL DEFAULT 0,
  position     INTEGER NOT NULL DEFAULT 0,
  permissions  BIGINT  NOT NULL DEFAULT 0,
  icon_url     TEXT,
  hoist        BOOLEAN NOT NULL DEFAULT false,  -- exibir separado na lista
  mentionable  BOOLEAN NOT NULL DEFAULT false,
  is_everyone  BOOLEAN NOT NULL DEFAULT false,
  managed_by   VARCHAR(32),                     -- integração que gerencia
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX roles_server_idx ON roles (server_id, position DESC);
CREATE UNIQUE INDEX roles_everyone_uniq ON roles (server_id) WHERE is_everyone;

CREATE TABLE member_roles (
  server_id  BIGINT NOT NULL,
  user_id    BIGINT NOT NULL,
  role_id    BIGINT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
  granted_by BIGINT REFERENCES users(id),
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (server_id, user_id, role_id),
  FOREIGN KEY (server_id, user_id) REFERENCES server_members(server_id, user_id) ON DELETE CASCADE
);
CREATE INDEX member_roles_role_idx ON member_roles (role_id);
```

> **Nota sobre a invariante 8.** A FK composta `(server_id, user_id)` garante que o membro existe no servidor, mas não que o `role_id` pertence ao mesmo servidor. Isso exige ou uma UNIQUE em `roles (id, server_id)` com FK composta `(role_id, server_id)`, ou um trigger. Recomenda-se a primeira:
> ```sql
> ALTER TABLE roles ADD CONSTRAINT roles_id_server_uniq UNIQUE (id, server_id);
> ALTER TABLE member_roles ADD CONSTRAINT member_roles_role_server_fk
>   FOREIGN KEY (role_id, server_id) REFERENCES roles(id, server_id) ON DELETE CASCADE;
> ```

### 22.4 Categorias, canais e overrides

```sql
CREATE TABLE categories (
  id         BIGINT PRIMARY KEY,
  server_id  BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name       VARCHAR(100) NOT NULL,
  position   INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX categories_server_idx ON categories (server_id, position);

CREATE TYPE channel_type AS ENUM
  ('text','voice','announcement','forum','thread','stage','dm','group_dm');

CREATE TABLE channels (
  id            BIGINT PRIMARY KEY,
  server_id     BIGINT REFERENCES servers(id) ON DELETE CASCADE,  -- NULL em DM
  category_id   BIGINT REFERENCES categories(id) ON DELETE SET NULL,
  parent_id     BIGINT REFERENCES channels(id) ON DELETE CASCADE, -- thread → pai
  type          channel_type NOT NULL,
  name          VARCHAR(100),
  topic         VARCHAR(1024),
  position      INTEGER NOT NULL DEFAULT 0,
  is_nsfw       BOOLEAN NOT NULL DEFAULT false,
  rate_limit_per_user INTEGER NOT NULL DEFAULT 0,   -- slowmode, segundos
  bitrate       INTEGER,                             -- voz
  user_limit    INTEGER,                             -- voz
  rtc_region    VARCHAR(32),
  last_message_id BIGINT,
  message_count INTEGER NOT NULL DEFAULT 0,
  archived      BOOLEAN NOT NULL DEFAULT false,      -- threads
  auto_archive_minutes INTEGER DEFAULT 4320,
  apps_enabled  TEXT[] NOT NULL DEFAULT '{}',        -- abas de app
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at    TIMESTAMPTZ,
  CONSTRAINT dm_has_no_server CHECK (
    (type IN ('dm','group_dm') AND server_id IS NULL) OR
    (type NOT IN ('dm','group_dm') AND server_id IS NOT NULL)
  )
);
CREATE INDEX channels_server_idx ON channels (server_id, position) WHERE deleted_at IS NULL;
CREATE INDEX channels_parent_idx ON channels (parent_id) WHERE parent_id IS NOT NULL;

CREATE TABLE permission_overrides (
  id          BIGINT PRIMARY KEY,
  channel_id  BIGINT REFERENCES channels(id)   ON DELETE CASCADE,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  target_type SMALLINT NOT NULL,        -- 0 = role, 1 = user
  target_id   BIGINT NOT NULL,
  allow       BIGINT NOT NULL DEFAULT 0,
  deny        BIGINT NOT NULL DEFAULT 0,
  CONSTRAINT one_scope CHECK (num_nonnulls(channel_id, category_id) = 1),
  CONSTRAINT no_overlap CHECK (allow & deny = 0)
);
CREATE UNIQUE INDEX po_channel_uniq  ON permission_overrides (channel_id, target_type, target_id)
  WHERE channel_id IS NOT NULL;
CREATE UNIQUE INDEX po_category_uniq ON permission_overrides (category_id, target_type, target_id)
  WHERE category_id IS NOT NULL;
```

### 22.5 Mensagens

```sql
CREATE TYPE message_type AS ENUM
  ('default','reply','system_join','system_leave','system_pin',
   'system_boost','thread_created','call','app_event');

CREATE TABLE messages (
  id           BIGINT PRIMARY KEY,
  channel_id   BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  server_id    BIGINT,                       -- denormalizado p/ busca
  user_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  type         message_type NOT NULL DEFAULT 'default',
  content      TEXT NOT NULL DEFAULT '',
  reply_to     BIGINT REFERENCES messages(id) ON DELETE SET NULL,
  thread_id    BIGINT REFERENCES channels(id) ON DELETE SET NULL,
  mentions     BIGINT[] NOT NULL DEFAULT '{}',
  mention_roles BIGINT[] NOT NULL DEFAULT '{}',
  mention_everyone BOOLEAN NOT NULL DEFAULT false,
  embeds       JSONB NOT NULL DEFAULT '[]',
  flags        INTEGER NOT NULL DEFAULT 0,   -- suppress_embeds, ephemeral...
  nonce        VARCHAR(64),                  -- dedupe do cliente
  pinned_at    TIMESTAMPTZ,
  pinned_by    BIGINT REFERENCES users(id),
  edited_at    TIMESTAMPTZ,
  deleted_at   TIMESTAMPTZ,
  deleted_by   BIGINT REFERENCES users(id),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  search_vector TSVECTOR GENERATED ALWAYS AS
    (to_tsvector('portuguese', coalesce(content,''))) STORED
) PARTITION BY RANGE (id);

-- Particionamento mensal por faixa de snowflake
CREATE TABLE messages_2026_08 PARTITION OF messages
  FOR VALUES FROM (7100000000000000000) TO (7110000000000000000);

CREATE INDEX messages_channel_idx ON messages (channel_id, id DESC) WHERE deleted_at IS NULL;
CREATE INDEX messages_author_idx  ON messages (user_id, id DESC);
CREATE INDEX messages_search_idx  ON messages USING GIN (search_vector);
CREATE INDEX messages_mentions_idx ON messages USING GIN (mentions);
CREATE INDEX messages_pinned_idx  ON messages (channel_id, pinned_at DESC) WHERE pinned_at IS NOT NULL;
CREATE UNIQUE INDEX messages_nonce_uniq ON messages (channel_id, user_id, nonce)
  WHERE nonce IS NOT NULL;

CREATE TABLE message_reactions (
  message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  user_id    BIGINT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  emoji_id   BIGINT REFERENCES custom_emojis(id) ON DELETE CASCADE,
  emoji_name VARCHAR(64),                  -- unicode quando emoji_id é NULL
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (message_id, user_id, COALESCE(emoji_id, 0), COALESCE(emoji_name,''))
);
CREATE INDEX reactions_message_idx ON message_reactions (message_id);

CREATE TABLE attachments (
  id           BIGINT PRIMARY KEY,
  message_id   BIGINT REFERENCES messages(id) ON DELETE CASCADE,
  uploader_id  BIGINT NOT NULL REFERENCES users(id),
  filename     VARCHAR(255) NOT NULL,
  content_type VARCHAR(128) NOT NULL,
  size_bytes   BIGINT NOT NULL,
  storage_key  TEXT NOT NULL,
  width        INTEGER,
  height       INTEGER,
  duration_ms  INTEGER,
  blurhash     VARCHAR(64),
  thumbnail_key TEXT,
  scan_status  SMALLINT NOT NULL DEFAULT 0,  -- 0 pending, 1 clean, 2 flagged
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX attachments_message_idx ON attachments (message_id);
```

### 22.6 Estado de leitura, DMs e amizades

```sql
CREATE TABLE read_states (
  user_id            BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel_id         BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  last_read_message_id BIGINT,
  mention_count      INTEGER NOT NULL DEFAULT 0,
  muted_until        TIMESTAMPTZ,
  notification_level SMALLINT,             -- NULL = herda do servidor
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, channel_id)
);

CREATE TABLE dm_participants (
  channel_id BIGINT NOT NULL REFERENCES channels(id) ON DELETE CASCADE,
  user_id    BIGINT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
  joined_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  is_owner   BOOLEAN NOT NULL DEFAULT false,   -- group DM
  closed_at  TIMESTAMPTZ,                      -- ocultar sem apagar
  PRIMARY KEY (channel_id, user_id)
);
CREATE INDEX dm_participants_user_idx ON dm_participants (user_id) WHERE closed_at IS NULL;

CREATE TABLE friendships (
  requester_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  addressee_id BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status       SMALLINT NOT NULL,   -- 0 pending, 1 accepted, 2 blocked
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (requester_id, addressee_id),
  CONSTRAINT no_self_friend CHECK (requester_id <> addressee_id)
);
CREATE INDEX friendships_addressee_idx ON friendships (addressee_id, status);
```

> **Nota de modelagem.** Amizade é simétrica, mas bloqueio é direcional. A chave `(requester_id, addressee_id)` permite que A bloqueie B sem que B bloqueie A. Toda consulta de "meus amigos" precisa varrer os dois lados — encapsular numa view:
> ```sql
> CREATE VIEW friends_of AS
>   SELECT requester_id AS user_id, addressee_id AS friend_id FROM friendships WHERE status = 1
>   UNION ALL
>   SELECT addressee_id, requester_id FROM friendships WHERE status = 1;
> ```

### 22.7 Convites, banimentos, emojis, notificações e auditoria

```sql
CREATE TABLE invites (
  code        VARCHAR(16) PRIMARY KEY,
  server_id   BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  channel_id  BIGINT REFERENCES channels(id) ON DELETE SET NULL,
  inviter_id  BIGINT REFERENCES users(id) ON DELETE SET NULL,
  max_uses    INTEGER NOT NULL DEFAULT 0,       -- 0 = ilimitado
  uses        INTEGER NOT NULL DEFAULT 0,
  max_age     INTEGER NOT NULL DEFAULT 86400,   -- 0 = nunca expira
  temporary   BOOLEAN NOT NULL DEFAULT false,
  expires_at  TIMESTAMPTZ,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX invites_server_idx ON invites (server_id) WHERE revoked_at IS NULL;

CREATE TABLE bans (
  server_id     BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  user_id       BIGINT NOT NULL REFERENCES users(id)   ON DELETE CASCADE,
  moderator_id  BIGINT REFERENCES users(id),
  reason        VARCHAR(512),
  expires_at    TIMESTAMPTZ,                    -- NULL = permanente
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (server_id, user_id)
);

CREATE TABLE custom_emojis (
  id          BIGINT PRIMARY KEY,
  server_id   BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  name        VARCHAR(32) NOT NULL,
  storage_key TEXT NOT NULL,
  animated    BOOLEAN NOT NULL DEFAULT false,
  creator_id  BIGINT REFERENCES users(id),
  role_ids    BIGINT[] NOT NULL DEFAULT '{}',   -- restrito a cargos
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX emojis_server_name_uniq ON custom_emojis (server_id, lower(name));

CREATE TABLE notifications (
  id          BIGINT PRIMARY KEY,
  user_id     BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type        VARCHAR(40) NOT NULL,
  server_id   BIGINT,
  channel_id  BIGINT,
  message_id  BIGINT,
  actor_id    BIGINT,
  payload     JSONB NOT NULL DEFAULT '{}',
  read_at     TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX notifications_user_idx ON notifications (user_id, id DESC) WHERE read_at IS NULL;

CREATE TABLE audit_logs (
  id            BIGINT PRIMARY KEY,
  server_id     BIGINT NOT NULL REFERENCES servers(id) ON DELETE CASCADE,
  actor_id      BIGINT REFERENCES users(id) ON DELETE SET NULL,
  action        VARCHAR(60) NOT NULL,           -- MEMBER_KICK, ROLE_UPDATE...
  target_type   VARCHAR(30),
  target_id     BIGINT,
  changes       JSONB NOT NULL DEFAULT '[]',    -- [{key, old, new}]
  reason        VARCHAR(512),
  ip_hash       TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX audit_server_idx ON audit_logs (server_id, id DESC);
CREATE INDEX audit_actor_idx  ON audit_logs (server_id, actor_id, id DESC);
REVOKE UPDATE, DELETE ON audit_logs FROM app_user;   -- append-only
```

### 22.8 Estratégia de particionamento e retenção

| Tabela | Estratégia | Retenção |
|--------|-----------|----------|
| `messages` | Partição por range de snowflake, mensal | Indefinida; partições antigas em tablespace frio |
| `audit_logs` | Partição trimestral | 2 anos |
| `notifications` | Sem partição | Lidas: 30 dias; não lidas: 180 dias |
| `sessions` | Sem partição | Expiradas removidas diariamente |
| `attachments` | Segue `messages` | Blob apagado 30 dias após soft delete da mensagem |

Job `partition-manager` cria as partições do mês seguinte com 7 dias de antecedência e falha ruidosamente se não conseguir — partição faltante é incidente P1 (todo INSERT de mensagem falha).

---

## 23. Identificadores e ordenação

### 23.1 Layout do snowflake

```
 63                    22        17        12                  0
 ┌─────────────────────┬─────────┬─────────┬───────────────────┐
 │   timestamp (42b)   │ dc (5b) │ wkr(5b) │   sequence (12b)  │
 └─────────────────────┴─────────┴─────────┴───────────────────┘
   ms desde EPOCH        0-31      0-31        0-4095 por ms
```

- **EPOCH:** `2026-01-01T00:00:00Z` (`1767225600000`).
- **Capacidade:** 4.096 IDs por milissegundo por worker · 1.024 workers = 4,2M IDs/ms teóricos.
- **Vida útil:** 42 bits ≈ 139 anos a partir do epoch.

```ts
// packages/shared/src/snowflake.ts
const EPOCH = 1767225600000n;

export class SnowflakeGenerator {
  private lastMs = -1n;
  private seq = 0n;

  constructor(private dc: bigint, private worker: bigint) {
    if (dc > 31n || worker > 31n) throw new Error('dc/worker fora do range');
  }

  next(): bigint {
    let now = BigInt(Date.now());
    if (now < this.lastMs) {
      // relógio andou para trás: espera em vez de emitir ID duplicado
      throw new ClockDriftError(`drift de ${this.lastMs - now}ms`);
    }
    if (now === this.lastMs) {
      this.seq = (this.seq + 1n) & 0xfffn;
      if (this.seq === 0n) { while (BigInt(Date.now()) <= now) {} now = BigInt(Date.now()); }
    } else {
      this.seq = 0n;
    }
    this.lastMs = now;
    return ((now - EPOCH) << 22n) | (this.dc << 17n) | (this.worker << 12n) | this.seq;
  }
}

export const timestampOf = (id: bigint) => new Date(Number((id >> 22n) + EPOCH));
```

**Cuidado crítico com JSON.** `Number.MAX_SAFE_INTEGER` é 2⁵³−1; um snowflake tem 63 bits significativos. Serializar como número **corrompe silenciosamente o ID**. Toda serialização usa string:

```ts
// interceptor global NestJS
JSON.stringify(obj, (_, v) => typeof v === 'bigint' ? v.toString() : v);
```

### 23.2 Paginação por cursor

Nunca usar `OFFSET` em mensagens — o custo cresce linearmente e o resultado é instável sob escrita concorrente.

```sql
-- Mensagens anteriores a um ponto (scroll para cima)
SELECT * FROM messages
WHERE channel_id = $1 AND id < $2 AND deleted_at IS NULL
ORDER BY id DESC
LIMIT 50;

-- Janela ao redor de uma mensagem (jump-to-message, resultado de busca)
(SELECT * FROM messages WHERE channel_id=$1 AND id <= $2 ORDER BY id DESC LIMIT 25)
UNION ALL
(SELECT * FROM messages WHERE channel_id=$1 AND id >  $2 ORDER BY id ASC  LIMIT 25)
ORDER BY id;
```

---

## 24. Sistema de permissões

Esta é a peça mais delicada do sistema. Um bug aqui vaza mensagem privada; erre para o lado do `deny`.

### 24.1 Catálogo de permissões

```ts
export const Permissions = {
  // --- Geral (bits 0–9)
  VIEW_CHANNEL:          1n << 0n,
  MANAGE_CHANNELS:       1n << 1n,
  MANAGE_ROLES:          1n << 2n,
  MANAGE_SERVER:         1n << 3n,
  MANAGE_EMOJIS:         1n << 4n,
  VIEW_AUDIT_LOG:        1n << 5n,
  CREATE_INVITE:         1n << 6n,
  MANAGE_INVITES:        1n << 7n,
  CHANGE_NICKNAME:       1n << 8n,
  MANAGE_NICKNAMES:      1n << 9n,

  // --- Membros (10–14)
  KICK_MEMBERS:          1n << 10n,
  BAN_MEMBERS:           1n << 11n,
  TIMEOUT_MEMBERS:       1n << 12n,
  MOVE_MEMBERS:          1n << 13n,
  VIEW_MEMBER_LIST:      1n << 14n,

  // --- Texto (15–27)
  SEND_MESSAGES:         1n << 15n,
  SEND_IN_THREADS:       1n << 16n,
  CREATE_THREADS:        1n << 17n,
  MANAGE_THREADS:        1n << 18n,
  EMBED_LINKS:           1n << 19n,
  ATTACH_FILES:          1n << 20n,
  ADD_REACTIONS:         1n << 21n,
  USE_EXTERNAL_EMOJIS:   1n << 22n,
  MENTION_EVERYONE:      1n << 23n,
  MANAGE_MESSAGES:       1n << 24n,
  READ_MESSAGE_HISTORY:  1n << 25n,
  PIN_MESSAGES:          1n << 26n,
  SEND_TTS_MESSAGES:     1n << 27n,

  // --- Voz (28–36)
  CONNECT:               1n << 28n,
  SPEAK:                 1n << 29n,
  STREAM:                1n << 30n,
  USE_VIDEO:             1n << 31n,
  MUTE_MEMBERS:          1n << 32n,
  DEAFEN_MEMBERS:        1n << 33n,
  USE_VAD:               1n << 34n,   // voice activity detection
  PRIORITY_SPEAKER:      1n << 35n,
  REQUEST_TO_SPEAK:      1n << 36n,

  // --- Apps de canal (37–41)
  USE_APPS:              1n << 37n,
  MANAGE_APPS:           1n << 38n,
  MANAGE_TASKS:          1n << 39n,
  MANAGE_FILES:          1n << 40n,
  START_MEETING:         1n << 41n,

  // --- Administração (63)
  ADMINISTRATOR:         1n << 63n,
} as const;

export const DEFAULT_EVERYONE =
  Permissions.VIEW_CHANNEL | Permissions.SEND_MESSAGES | Permissions.READ_MESSAGE_HISTORY |
  Permissions.ADD_REACTIONS | Permissions.EMBED_LINKS  | Permissions.ATTACH_FILES |
  Permissions.CONNECT       | Permissions.SPEAK        | Permissions.USE_VAD |
  Permissions.CREATE_INVITE | Permissions.CHANGE_NICKNAME | Permissions.VIEW_MEMBER_LIST |
  Permissions.CREATE_THREADS| Permissions.SEND_IN_THREADS | Permissions.USE_APPS;
```

**Bits 42–62 reservados.** Não realocar bits já publicados — permissões persistidas em `roles.permissions` quebrariam.

### 24.2 Algoritmo de resolução

Ordem de precedência, do mais fraco ao mais forte:

```
1. permissões base de @everyone
2. OR de todos os cargos do membro
3. → se ADMINISTRATOR ou owner: retorna ALL, fim
4. override de categoria para @everyone      (deny depois allow)
5. OR dos overrides de categoria para os cargos do membro
6. override de categoria para o usuário
7. override de canal para @everyone
8. OR dos overrides de canal para os cargos do membro
9. override de canal para o usuário            ← maior precedência
10. → se timeout ativo: mantém apenas VIEW_CHANNEL | READ_MESSAGE_HISTORY
```

```ts
export function resolvePermissions(ctx: PermCtx): bigint {
  const { server, member, roles, category, channel } = ctx;

  if (server.ownerId === member.userId) return ALL_PERMISSIONS;

  let perms = roles.everyone.permissions;
  for (const r of roles.assigned) perms |= r.permissions;

  if (perms & Permissions.ADMINISTRATOR) return ALL_PERMISSIONS;

  const memberRoleIds = new Set(roles.assigned.map(r => r.id));

  const applyScope = (ovs: Override[]) => {
    // 1) @everyone
    const ev = ovs.find(o => o.targetType === 0 && o.targetId === roles.everyone.id);
    if (ev) { perms &= ~ev.deny; perms |= ev.allow; }

    // 2) cargos do membro — acumula antes de aplicar (allow vence deny entre cargos)
    let allow = 0n, deny = 0n;
    for (const o of ovs) {
      if (o.targetType === 0 && memberRoleIds.has(o.targetId)) { allow |= o.allow; deny |= o.deny; }
    }
    perms &= ~deny; perms |= allow;

    // 3) usuário específico
    const u = ovs.find(o => o.targetType === 1 && o.targetId === member.userId);
    if (u) { perms &= ~u.deny; perms |= u.allow; }
  };

  if (category) applyScope(category.overrides);
  if (channel)  applyScope(channel.overrides);

  if (member.timeoutUntil && member.timeoutUntil > new Date()) {
    perms &= (Permissions.VIEW_CHANNEL | Permissions.READ_MESSAGE_HISTORY);
  }
  return perms;
}
```

**Detalhe que mais causa bug:** dentro de um mesmo escopo, os `deny` e `allow` de *todos* os cargos são acumulados **antes** de serem aplicados. Se você aplicar cargo a cargo em sequência, um `deny` do cargo Membro pode sobrescrever um `allow` do cargo Moderador dependendo apenas da ordem de iteração — comportamento não determinístico e impossível de explicar ao usuário.

### 24.3 Regras de hierarquia

Independentes do bitfield:

| Ação | Regra |
|------|-------|
| Editar/deletar cargo | `maxPosition(ator) > role.position` |
| Atribuir cargo | `maxPosition(ator) > role.position` |
| Kick / ban / timeout | `maxPosition(ator) > maxPosition(alvo)` |
| Alterar apelido de outro | `maxPosition(ator) > maxPosition(alvo)` |
| Qualquer ação sobre o owner | Proibida, sempre |
| Transferir propriedade | Apenas owner, com confirmação por MFA |

O owner ignora todas as regras acima dentro do próprio servidor. Nenhum não-owner consegue se elevar acima da própria posição máxima — isso previne escalada de privilégio via `MANAGE_ROLES`.

### 24.4 Cache

```
Chave:   perm:{userId}:{channelId}    Valor: bitfield  TTL: 300s
Chave:   perm:ver:{serverId}          Valor: contador  (bump invalida tudo)
```

A chave real inclui a versão: `perm:{ver}:{userId}:{channelId}`. Qualquer mudança em cargos, membros ou overrides do servidor incrementa `perm:ver:{serverId}` — invalidação O(1) sem varrer chaves. Custo: cache miss em massa após cada alteração de permissão, aceitável porque a resolução é barata (~2 ms com os dados do servidor já em cache local do processo).

### 24.5 Testes obrigatórios

O módulo de permissões tem cobertura exigida de 100% em branch. Casos mínimos:

- `@everyone` nega `VIEW_CHANNEL` no canal, mas cargo Moderador permite → **vê**.
- Override de usuário nega `SEND_MESSAGES`, cargo Admin permite → **não envia** (usuário é mais específico).
- Membro com `ADMINISTRATOR` e override de canal negando tudo → **vê tudo** (admin curto-circuita).
- Categoria nega `CONNECT`, canal permite → **conecta** (canal vence categoria).
- Membro em timeout com `ADMINISTRATOR` → **admin curto-circuita antes do timeout**; decidir explicitamente e documentar (recomendação: timeout não se aplica a admins, mas se aplica ao owner? Não — owner é intocável).
- Dois cargos, um nega e outro permite `ATTACH_FILES` no mesmo canal → **permite** (allow acumulado vence).

---
## 25. API REST

### 25.1 Convenções

- Base: `https://api.loop.app/v1`
- Autenticação: `Authorization: Bearer <access_token>` (JWT, 15 min) + refresh token em cookie `HttpOnly; Secure; SameSite=Lax`.
- Todo ID trafega como **string**.
- Datas em ISO-8601 UTC.
- `Idempotency-Key` aceito em todos os POST que criam recurso.
- Erros seguem RFC 7807 estendido.

```jsonc
// 403
{
  "type": "https://docs.loop.app/errors/missing-permissions",
  "title": "Permissões insuficientes",
  "status": 403,
  "code": 50013,
  "detail": "Falta SEND_MESSAGES em #anuncios",
  "instance": "/v1/channels/7108.../messages",
  "meta": { "required": ["SEND_MESSAGES"], "channelId": "7108..." }
}
```

| Código | HTTP | Significado |
|--------|------|-------------|
| 0 | 500 | Erro interno |
| 10003 | 404 | Canal desconhecido |
| 10008 | 404 | Mensagem desconhecida |
| 20016 | 429 | Slowmode ativo |
| 30003 | 400 | Limite de reactions atingido |
| 40001 | 401 | Não autorizado |
| 40002 | 403 | Conta não verificada |
| 50001 | 403 | Sem acesso ao recurso |
| 50013 | 403 | Permissões insuficientes |
| 50035 | 400 | Corpo inválido (com `errors[]` por campo) |

### 25.2 Rotas

<details>
<summary><b>Autenticação</b></summary>

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/register` | Cria conta; dispara e-mail de verificação |
| POST | `/auth/login` | Retorna access + refresh; exige MFA se ativo |
| POST | `/auth/refresh` | Rotaciona refresh token (detecção de reuso) |
| POST | `/auth/logout` | Revoga sessão atual |
| POST | `/auth/logout-all` | Revoga todas as sessões |
| GET | `/auth/sessions` | Lista sessões ativas |
| POST | `/auth/mfa/enable` | Retorna QR TOTP + códigos de recuperação |
| POST | `/auth/password/forgot` · `/reset` | Fluxo de recuperação |
| GET | `/auth/oauth/:provider` | Redireciona para o provedor |

</details>

<details>
<summary><b>Usuários e relações</b></summary>

| Método | Rota | Descrição |
|--------|------|-----------|
| GET | `/users/@me` | Perfil próprio completo |
| PATCH | `/users/@me` | Atualiza perfil |
| GET | `/users/:id` | Perfil público |
| GET | `/users/@me/servers` | Servidores do usuário |
| GET | `/users/@me/channels` | Canais de DM |
| POST | `/users/@me/channels` | Abre DM ou cria group DM |
| GET | `/users/@me/friends` | Lista com estado |
| POST | `/users/@me/friends` | Envia solicitação por `username` |
| PUT | `/users/@me/friends/:id` | Aceita |
| DELETE | `/users/@me/friends/:id` | Remove ou recusa |
| PUT | `/users/@me/blocks/:id` | Bloqueia |

</details>

<details>
<summary><b>Servidores</b></summary>

| Método | Rota | Permissão |
|--------|------|-----------|
| POST | `/servers` | — |
| GET | `/servers/:id` | `VIEW_CHANNEL` em algum canal |
| PATCH | `/servers/:id` | `MANAGE_SERVER` |
| DELETE | `/servers/:id` | owner + MFA |
| GET | `/servers/:id/members` | `VIEW_MEMBER_LIST` (paginado) |
| GET | `/servers/:id/members/search?q=` | `VIEW_MEMBER_LIST` |
| PATCH | `/servers/:id/members/:userId` | varia por campo |
| DELETE | `/servers/:id/members/:userId` | `KICK_MEMBERS` |
| PUT | `/servers/:id/bans/:userId` | `BAN_MEMBERS` |
| DELETE | `/servers/:id/bans/:userId` | `BAN_MEMBERS` |
| GET/POST/PATCH/DELETE | `/servers/:id/roles[/:roleId]` | `MANAGE_ROLES` |
| PATCH | `/servers/:id/roles` | reordenação em lote |
| GET | `/servers/:id/audit-logs` | `VIEW_AUDIT_LOG` |
| GET/POST/DELETE | `/servers/:id/emojis[/:emojiId]` | `MANAGE_EMOJIS` |
| POST | `/servers/:id/leave` | — |

</details>

<details>
<summary><b>Canais e mensagens</b></summary>

| Método | Rota | Notas |
|--------|------|-------|
| POST | `/servers/:id/channels` | `MANAGE_CHANNELS` |
| PATCH · DELETE | `/channels/:id` | `MANAGE_CHANNELS` |
| PUT · DELETE | `/channels/:id/permissions/:targetId` | `MANAGE_ROLES` |
| GET | `/channels/:id/messages?before=&after=&around=&limit=` | máx. 100 |
| POST | `/channels/:id/messages` | body ou `multipart/form-data` |
| PATCH | `/channels/:id/messages/:msgId` | apenas autor |
| DELETE | `/channels/:id/messages/:msgId` | autor ou `MANAGE_MESSAGES` |
| POST | `/channels/:id/messages/bulk-delete` | 2–100 msgs, < 14 dias |
| PUT · DELETE | `/channels/:id/messages/:msgId/reactions/:emoji/@me` | |
| GET | `/channels/:id/messages/:msgId/reactions/:emoji` | quem reagiu |
| PUT · DELETE | `/channels/:id/pins/:msgId` | `PIN_MESSAGES`, máx. 50 |
| POST | `/channels/:id/typing` | dispara evento efêmero |
| POST | `/channels/:id/messages/:msgId/threads` | `CREATE_THREADS` |
| POST | `/channels/:id/voice-token` | `CONNECT` → token LiveKit |

</details>

<details>
<summary><b>Convites, uploads e busca</b></summary>

| Método | Rota | Notas |
|--------|------|-------|
| POST | `/channels/:id/invites` | `CREATE_INVITE` |
| GET | `/invites/:code` | Público; preview do servidor |
| POST | `/invites/:code` | Aceita e entra |
| DELETE | `/invites/:code` | `MANAGE_INVITES` |
| POST | `/uploads/sign` | Retorna URL presigned |
| POST | `/uploads/complete` | Confirma e dispara processamento |
| GET | `/search?q=&server_id=&channel_id=&author_id=&before=&after=&has=` | |

</details>

### 25.3 Rate limits

Bucket por rota + escopo, `GCRA` implementado em Lua no Redis.

| Escopo | Limite | Janela |
|--------|--------|--------|
| Global por usuário | 50 req | 1 s |
| Global por IP (não autenticado) | 20 req | 1 s |
| `POST /channels/:id/messages` | 5 msgs | 5 s |
| Slowmode do canal | `rate_limit_per_user` | por canal |
| `POST /auth/login` | 5 | 15 min por IP+e-mail |
| `POST /servers` | 10 | 24 h |
| Reactions | 1 | 0,25 s |
| Upload | 500 MB | 1 h |
| Busca | 10 | 1 min |

Cabeçalhos em toda resposta: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, `X-RateLimit-Bucket`; em 429 também `Retry-After`.

---

## 26. Gateway de tempo real

### 26.1 Protocolo

Conexão: `wss://gateway.loop.app/?v=1&encoding=json` (`zlib-stream` opcional).

Todo frame:

```jsonc
{ "op": 0, "t": "MESSAGE_CREATE", "s": 42, "d": { } }
```

| op | Nome | Direção | Uso |
|----|------|---------|-----|
| 0 | DISPATCH | S→C | Evento de domínio (`t` preenchido) |
| 1 | HEARTBEAT | C→S | Keep-alive |
| 2 | IDENTIFY | C→S | Autentica e inicia sessão |
| 3 | PRESENCE_UPDATE | C→S | Muda status |
| 4 | VOICE_STATE_UPDATE | C→S | Entra/sai de canal de voz |
| 6 | RESUME | C→S | Retoma sessão após queda |
| 7 | RECONNECT | S→C | Servidor pede reconexão |
| 9 | INVALID_SESSION | S→C | Sessão morta; re-identifique |
| 10 | HELLO | S→C | Envia `heartbeat_interval` |
| 11 | HEARTBEAT_ACK | S→C | Confirma heartbeat |
| 12 | SUBSCRIBE | C→S | Assina lista de membros / canal lazy |

### 26.2 Handshake

```
Cliente                                Gateway
   │──────── WS connect ───────────────►│
   │◄─────── op:10 HELLO {41250ms} ─────│
   │──────── op:2 IDENTIFY {token} ────►│
   │                                    ├─ valida JWT
   │                                    ├─ carrega servidores/canais
   │                                    ├─ registra sessão no Redis
   │◄─────── op:0 t:READY ──────────────│
   │◄─────── op:0 t:SERVER_CREATE ×N ───│   (lazy, chunked)
   │──────── op:1 HEARTBEAT ───────────►│   a cada 41,25s
   │◄─────── op:11 HEARTBEAT_ACK ───────│
```

Payload de `READY`:

```jsonc
{
  "v": 1,
  "session_id": "a1b2c3",
  "resume_url": "wss://gateway-3.loop.app",
  "user": { },
  "servers": [{ "id": "710...", "unavailable": true }],
  "private_channels": [ ],
  "read_states": [ ],
  "relationships": [ ]
}
```

Servidores chegam como `unavailable: true` e são hidratados por `SERVER_CREATE` subsequentes — a UI pinta o esqueleto imediatamente em vez de esperar o payload completo.

### 26.3 Catálogo de eventos

| Evento | Quando | Destinatários |
|--------|--------|---------------|
| `READY` | Após IDENTIFY | Sessão |
| `RESUMED` | Após RESUME | Sessão |
| `SERVER_CREATE` / `UPDATE` / `DELETE` | Entrou/mudou/saiu | Membros |
| `CHANNEL_CREATE` / `UPDATE` / `DELETE` | CRUD de canal | Quem tem `VIEW_CHANNEL` |
| `MESSAGE_CREATE` / `UPDATE` / `DELETE` | CRUD de mensagem | Inscritos no canal |
| `MESSAGE_BULK_DELETE` | Purge | Inscritos |
| `MESSAGE_REACTION_ADD` / `REMOVE` | Reaction | Inscritos |
| `TYPING_START` | Digitando (TTL 8 s) | Inscritos |
| `MEMBER_ADD` / `UPDATE` / `REMOVE` | Membro | Membros do servidor |
| `MEMBER_CHUNK` | Resposta a SUBSCRIBE | Sessão |
| `ROLE_CREATE` / `UPDATE` / `DELETE` | Cargos | Membros (invalida cache de perms) |
| `PRESENCE_UPDATE` | Status | Amigos + servidores em comum |
| `VOICE_STATE_UPDATE` | Entrou/mutou/saiu | Membros do servidor |
| `VOICE_SERVER_UPDATE` | Credencial SFU | Sessão |
| `THREAD_CREATE` / `UPDATE` | Threads | Inscritos no pai |
| `APP_EVENT` | App de canal emitiu | Inscritos com `USE_APPS` |
| `NOTIFICATION_CREATE` | Notificação | Sessões do usuário |

### 26.4 Fan-out

O ponto de custo do sistema. Ingênuo: para cada mensagem, buscar membros do servidor, checar permissão, enviar. Num servidor de 10k membros com 20 msgs/s isso é 200k checagens por segundo.

Estratégia adotada — **subscrição lazy por canal**:

1. O cliente só recebe eventos de canais que está efetivamente renderizando (canal aberto + canais com badge de não lido).
2. O Gateway mantém em memória `Map<channelId, Set<sessionId>>`.
3. Na publicação, o fan-out itera apenas as sessões inscritas.
4. A permissão `VIEW_CHANNEL` é verificada **no momento da inscrição** e revalidada quando `perm:ver:{serverId}` muda.

```ts
async function fanout(channelId: string, event: GatewayEvent) {
  const sessions = subscriptions.get(channelId);
  if (!sessions?.size) return;

  const payload = encodeOnce(event);           // serializa 1×, envia N×
  const version = await permVersion(event.serverId);

  for (const sid of sessions) {
    const s = sessions_.get(sid);
    if (!s) { sessions.delete(sid); continue; }
    if (s.permVersion !== version && !(await revalidate(s, channelId))) continue;
    s.ws.send(payload);                        // uWS: backpressure automático
  }
}
```

**Otimizações mensuráveis:** serializar o payload uma única vez economiza ~70% de CPU em canais grandes; `uWebSockets.js` suporta ~5× mais conexões por processo que `ws`; publicar via Redis com `MESSAGE_CREATE` já contendo o objeto completo evita round-trip ao Postgres no Gateway.

### 26.5 Reconexão e garantia de entrega

- Cada sessão mantém um buffer circular dos últimos 250 eventos com número de sequência `s`.
- Ao cair, o cliente reconecta em `resume_url` e envia `op:6 RESUME { session_id, seq }`.
- Se `seq` ainda está no buffer → replay dos eventos faltantes → `RESUMED`.
- Se não está (queda longa) → `op:9 INVALID_SESSION` → `IDENTIFY` completo + refetch de mensagens desde `last_read_message_id`.
- Backoff exponencial com jitter: `min(1000 × 2^n, 30000) × (0.8 + rand×0.4)`.
- Entrega é **at-least-once**; o cliente deduplica por `id` do evento.

**Zumbi de rede.** Se o cliente enviar heartbeat e não receber `HEARTBEAT_ACK` dentro de um intervalo, ele deve fechar o socket com código 4000 e reconectar — não confiar no `readyState`, que permanece `OPEN` em conexões mortas por NAT timeout.

---

## 27. Ciclo de vida da mensagem

### 27.1 Envio otimista

```ts
async function sendMessage(channelId: string, content: string, files?: File[]) {
  const nonce = crypto.randomUUID();
  const optimistic: Message = {
    id: `optimistic:${nonce}`, nonce, channelId, content,
    author: currentUser, createdAt: new Date().toISOString(),
    state: 'sending',
  };
  store.messages.insert(channelId, optimistic);      // aparece na hora

  try {
    const real = await api.post(`/channels/${channelId}/messages`,
      { content, nonce, attachments: await uploadAll(files) });
    store.messages.replace(nonce, { ...real, state: 'sent' });
  } catch (err) {
    store.messages.patch(nonce, { state: 'failed', error: toUserError(err) });
  }
}
```

Se o evento `MESSAGE_CREATE` chegar pelo Gateway antes da resposta HTTP (acontece), a reconciliação por `nonce` evita a mensagem duplicada. O `UNIQUE (channel_id, user_id, nonce)` no banco garante que um retry do cliente não crie duas linhas.

### 27.2 Estados

```
[digitando] → [sending] ──✓──► [sent] ──► [delivered] ──► [read]
                  │
                  ✗
                  ▼
              [failed] ──(retry)──► [sending]
```

### 27.3 Parsing de conteúdo

Markdown restrito, processado no **cliente** para render e no **servidor** para extração de metadados.

| Sintaxe | Resultado |
|---------|-----------|
| `**x**` `*x*` `__x__` `~~x~~` `\|\|x\|\|` | negrito, itálico, sublinhado, riscado, spoiler |
| `` `x` `` e ```` ```lang ```` | código inline e bloco com highlight |
| `> x` | citação |
| `[texto](url)` | link (apenas `http/https`, com `rel="noopener noreferrer"`) |
| `<@123>` `<@&456>` `<#789>` | menção de usuário, cargo, canal |
| `:nome:` `<:nome:123>` | emoji unicode / customizado |
| `@everyone` `@here` | menção em massa (exige `MENTION_EVERYONE`) |

O servidor extrai `mentions[]`, `mention_roles[]` e `mention_everyone` no momento do INSERT — nunca no momento da leitura. Isso torna a consulta "minhas menções" um simples `WHERE mentions @> ARRAY[$userId]` com índice GIN.

**Regra de segurança:** o conteúdo é armazenado **cru**, sanitizado apenas na renderização. Nunca renderizar HTML vindo do usuário; o renderer produz elementos React a partir da AST, jamais `dangerouslySetInnerHTML`.

### 27.4 Limites

| Item | Limite |
|------|--------|
| Conteúdo | 4.000 caracteres |
| Anexos por mensagem | 10 |
| Tamanho por arquivo | 25 MB (100 MB em servidores com boost) |
| Reactions distintas por mensagem | 20 |
| Mensagens fixadas por canal | 50 |
| Janela de edição | ilimitada (marca `edited_at`) |
| Bulk delete | 100 msgs, até 14 dias de idade |
| Embeds por mensagem | 10 |

---

## 28. Presença e estado de leitura

### 28.1 Presença

Presença é **volátil**: vive só no Redis, nunca no Postgres. Perder presença num restart é aceitável; ela se reconstrói em segundos.

```
HSET presence:{userId} status "online" activity "{...}" since 1755870000
SADD presence:sessions:{userId} {sessionId}
EXPIRE presence:{userId} 120
```

| Estado | Origem |
|--------|--------|
| `online` | Ao menos uma sessão ativa e não inativa |
| `idle` | Todas as sessões sem input há > 10 min, ou aba oculta há > 30 min |
| `dnd` | Definido manualmente; suprime notificações de desktop |
| `offline` | Nenhuma sessão, ou `invisible` manual |

**Regra de agregação:** o status efetivo é o *mais disponível* entre as sessões, exceto se o usuário escolheu manualmente — escolha manual sempre vence. Ao fechar a última sessão, o Gateway não emite `offline` imediatamente: aguarda 15 s. Isso elimina o flicker de "offline/online" durante um refresh de página.

### 28.2 Estado de leitura

O contador de não lidas nunca é calculado com `COUNT(*)` — em canal grande isso é uma varredura cara e frequente.

```sql
-- Não lidas de um canal: quantos IDs acima do último lido
SELECT count(*) FROM messages
WHERE channel_id = $1 AND id > $2 AND deleted_at IS NULL
LIMIT 100;   -- exibe "99+" acima disso
```

- Menções são contadas incrementalmente em `read_states.mention_count` (`+1` no fan-out, zerado ao marcar como lido).
- O badge de servidor é o `OR` dos canais não lidos; o badge numérico é a soma de `mention_count`.
- Marcar como lido é debounced em 1 s no cliente e enviado como `PATCH /channels/:id/ack { message_id }`.
- Sincronização entre dispositivos via evento `MESSAGE_ACK` para as outras sessões do mesmo usuário.

### 28.3 Indicador de digitação

Efêmero, nunca persistido. `POST /channels/:id/typing` emite `TYPING_START` com TTL de 8 s. O cliente reenvia no máximo a cada 5 s enquanto houver digitação — throttle no cliente, não no servidor.

---

## 29. Voz, vídeo e screen sharing

### 29.1 Arquitetura

```
Cliente A ──┐                       ┌── Cliente C
            ├──► LiveKit SFU ◄──────┤
Cliente B ──┘        │              └── Cliente D
                     │
              ┌──────▼──────┐
              │  API Server │  emite token JWT com grants
              └─────────────┘
```

Cada cliente publica **uma** stream de áudio (Opus) e opcionalmente vídeo (VP8/VP9/AV1 com simulcast em 3 camadas). O SFU roteia sem transcodificar; a seleção de camada é feita por assinante conforme banda disponível.

### 29.2 Fluxo de entrada em canal de voz

```
1. Cliente  → POST /channels/:id/voice-token
2. API      → checa CONNECT; checa user_limit; checa ban/timeout
3. API      → gera JWT LiveKit { room: channel_id, identity: user_id,
                                  canPublish, canSubscribe, canPublishData }
4. API      → grava voice_states no Redis; emite VOICE_STATE_UPDATE
5. Cliente  → conecta ao SFU com o token
6. Cliente  → publica track de microfone
7. SFU      → webhook participant_joined → API confirma estado
```

O token carrega os grants derivados das permissões: sem `SPEAK`, `canPublish` do áudio é `false`; sem `STREAM`, screen share é bloqueado no próprio SFU. **A permissão é aplicada na origem, não só na UI** — esconder o botão não é controle de acesso.

### 29.3 Estado de voz

```jsonc
// Redis: voice:{channelId} → hash de userId
{
  "userId": "710...",
  "sessionId": "a1b2",
  "selfMute": false, "selfDeaf": false,
  "serverMute": false, "serverDeaf": false,
  "streaming": true, "video": false,
  "suppress": false,               // stage channel
  "joinedAt": 1755870000
}
```

### 29.4 Controles e configuração

| Controle | Comportamento |
|----------|---------------|
| Mute | Para de publicar áudio (track desabilitada, não removida) |
| Deafen | Não recebe áudio **e** implica mute automático |
| Push-to-talk | Publica apenas com a tecla pressionada; configurável globalmente |
| Voice Activity Detection | Publicação por limiar de energia, com sensibilidade ajustável |
| Supressão de ruído | RNNoise no cliente (Krisp se disponível) |
| Cancelamento de eco | `echoCancellation: true` na constraint |
| Priority speaker | Abaixa o volume dos demais em ~8 dB enquanto fala |

### 29.5 Screen sharing

```ts
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: { frameRate: { ideal: fps }, width: { max: 1920 }, height: { max: 1080 } },
  audio: { suppressLocalAudioPlayback: false },   // áudio da aba
  surfaceSwitching: 'include',
  selfBrowserSurface: 'exclude',                  // evita espelho infinito
});
```

| Perfil | Resolução | FPS | Bitrate | `contentHint` |
|--------|-----------|-----|---------|---------------|
| Documento | 1080p | 5 | 800 kbps | `detail` |
| Padrão | 720p | 30 | 1,5 Mbps | `motion` |
| Alta qualidade | 1080p | 30 | 3 Mbps | `motion` |
| Gaming | 1080p | 60 | 6 Mbps | `motion` |

`contentHint = 'detail'` prioriza nitidez de texto sobre fluidez — a diferença ao compartilhar código ou uma viewport 3D é enorme.

### 29.6 Layout de vídeo

```
1 participante:  ┌──────────────────┐
                 │        A         │
                 └──────────────────┘

2–4:             ┌────────┬─────────┐
                 │   A    │    B    │
                 ├────────┼─────────┤
                 │   C    │    D    │
                 └────────┴─────────┘

com screen share:┌──────────────────┐ ┌───┐
                 │   SCREEN SHARE   │ │ A │
                 │                  │ ├───┤
                 │                  │ │ B │
                 └──────────────────┘ └───┘
```

Acima de 9 participantes, apenas os falantes ativos (últimos 8 por energia de áudio) mantêm vídeo assinado; os demais viram avatar. Isso mantém o consumo de banda plano independentemente do tamanho da sala.

### 29.7 Degradação

| Condição | Ação |
|----------|------|
| Perda de pacotes > 5% | Reduz camada de simulcast |
| Perda > 15% | Desliga vídeo, mantém áudio |
| RTT > 300 ms | Aumenta buffer de jitter |
| CPU > 80% | Reduz FPS de publicação |
| Falha do SFU | Reconecta com ICE restart; após 3 falhas, notifica e desconecta |

Áudio **nunca** é sacrificado por vídeo. A hierarquia de degradação é: FPS → resolução → vídeo desligado → áudio em bitrate reduzido → desconexão.

---

## 30. Upload e pipeline de mídia

### 30.1 Fluxo

```
1. Cliente → POST /uploads/sign { filename, size, content_type, channel_id }
2. API     → valida ATTACH_FILES, tamanho, extensão, cota
3. API     → gera storage_key: {serverId}/{channelId}/{snowflake}/{slug}
4. API     → retorna presigned PUT (15 min de validade)
5. Cliente → PUT direto no R2 (com barra de progresso, sem passar pela API)
6. Cliente → POST /uploads/complete { upload_id }
7. Worker  → HEAD no objeto: confirma tamanho e content-type reais
8. Worker  → detecta tipo por magic bytes (não confia na extensão)
9. Worker  → gera thumbnail + blurhash; extrai dimensões/duração
10. Worker → varredura antivírus (ClamAV) → scan_status
11. Worker → emite ATTACHMENT_READY
```

O upload direto ao storage é obrigatório: passar 25 MB pela API consome memória e conexão de um processo que deveria estar respondendo requisições rápidas.

### 30.2 Validação

| Camada | Verificação |
|--------|-------------|
| Cliente | Extensão, tamanho, preview |
| API | Cota, permissão, `content_type` declarado contra allowlist |
| Storage | `Content-Length` forçado na policy do presigned |
| Worker | **Magic bytes** — a fonte de verdade real do tipo |
| Worker | Antivírus; `flagged` bloqueia o download |

Allowlist: `image/{png,jpeg,gif,webp,avif}`, `video/{mp4,webm,quicktime}`, `audio/{mpeg,ogg,wav,webm}`, `application/{pdf,zip,json}`, `text/{plain,markdown,csv}`, `model/gltf-binary`, `model/gltf+json`.

Bloqueado sempre: `.exe`, `.dll`, `.bat`, `.sh`, `.jar`, `.apk`, `.msi`, `.scr` e qualquer arquivo cujo magic byte divirja da extensão declarada.

### 30.3 Servir arquivos

```
https://cdn.loop.app/{storage_key}?ex={exp}&hm={hmac}
```

- URLs assinadas com HMAC e validade de 24 h; a assinatura inclui o `channel_id`, o que impede que um link vazado dê acesso após a saída do usuário do servidor.
- `Content-Disposition: attachment` para tudo que não seja imagem/vídeo/áudio renderizável — impede que um SVG malicioso execute script no domínio da CDN.
- Variantes geradas: `thumb` (400px), `medium` (1280px), `original`.
- `Cache-Control: public, max-age=31536000, immutable` (a chave contém o snowflake, então nunca muda).

### 30.4 Visualizador de imagens

Modal com: zoom por scroll e pinch, pan com arrasto, navegação por setas entre anexos da mesma mensagem e do canal, download, "abrir original", `Esc` para fechar, e transição a partir do blurhash enquanto a imagem carrega.

---

## 31. Notificações

### 31.1 Matriz de decisão

Para cada mensagem, para cada membro potencialmente notificável:

```
mensagem criada
      │
      ├─ é o próprio autor? ────────────────► não notifica
      ├─ tem VIEW_CHANNEL? ── não ──────────► não notifica
      ├─ canal mutado até depois de agora? ─► não notifica (mas conta menção)
      ├─ é menção direta (@user)? ──────────► NOTIFICA (sempre, salvo DND total)
      ├─ é menção de cargo que possui? ─────► NOTIFICA se nível ≠ "nada"
      ├─ é @everyone/@here? ────────────────► NOTIFICA se permitido e nível = "todas"
      ├─ é resposta a mensagem sua? ────────► NOTIFICA se nível ≠ "nada"
      ├─ nível do canal = "todas"? ─────────► NOTIFICA
      ├─ nível do canal = null →
      │     nível do servidor = "todas"? ───► NOTIFICA
      └─ caso contrário ────────────────────► apenas badge de não lido
```

Precedência de configuração: **canal > categoria > servidor > global**. Um `null` significa "herda"; um valor explícito interrompe a herança.

### 31.2 Canais de entrega

| Canal | Quando | Latência |
|-------|--------|----------|
| In-app (toast + badge) | Sessão ativa | Imediata |
| Desktop (Notification API) | Aba oculta, não DND | < 1 s |
| Push (FCM/APNs via web push) | Sem sessão ativa | < 5 s |
| E-mail | Menção sem leitura por 15 min, digest opcional | Agregado |

Push e e-mail passam por um job com **debounce de 15 minutos por (usuário, canal)** — cinco menções seguidas viram uma notificação agregada ("3 novas menções em #projetos"), não cinco vibrações.

### 31.3 Payload de push

```jsonc
{
  "title": "#projetos · Factory Community",
  "body": "Juscelio: pode revisar o render da cena?",
  "icon": "https://cdn.../server-icon.webp",
  "badge": "/badge-mono.png",
  "tag": "channel:7108...",          // substitui a anterior do mesmo canal
  "renotify": false,
  "data": { "url": "/channels/710.../711...", "messageId": "712..." }
}
```

Conteúdo de mensagem em push é **opcional e desligado por padrão em servidores marcados como sensíveis** — a prévia aparece na tela de bloqueio do dispositivo.

---

## 32. Busca

### 32.1 Sintaxe

```
from:juscelio in:projetos before:2026-08-20 render
has:image from:@ana during:2026-08
mentions:@me has:link
-from:bot deploy
```

| Operador | Valores |
|----------|---------|
| `from:` | username, `@me` |
| `in:` | nome ou id de canal |
| `mentions:` | username, `@me` |
| `has:` | `link`, `image`, `video`, `file`, `embed`, `reaction`, `thread` |
| `before:` `after:` `during:` | `YYYY-MM-DD`, `YYYY-MM` |
| `pinned:` | `true`, `false` |
| `-termo` | exclusão |
| `"frase exata"` | correspondência de frase |

### 32.2 Implementação

```sql
SELECT m.id, m.channel_id, m.user_id, m.content, m.created_at,
       ts_rank_cd(m.search_vector, q) AS rank,
       ts_headline('portuguese', m.content, q,
                   'StartSel=<mark>,StopSel=</mark>,MaxWords=30') AS snippet
FROM messages m,
     websearch_to_tsquery('portuguese', $1) q
WHERE m.search_vector @@ q
  AND m.server_id = $2
  AND m.channel_id = ANY($3)        -- canais visíveis, pré-computado
  AND ($4::bigint IS NULL OR m.user_id = $4)
  AND m.created_at BETWEEN $5 AND $6
  AND m.deleted_at IS NULL
ORDER BY rank DESC, m.id DESC
LIMIT 25 OFFSET $7;
```

**Ponto crítico de segurança:** `$3` (canais visíveis) é resolvido **antes** da query, a partir das permissões do usuário. Nunca filtrar permissão depois do `LIMIT` — isso produz páginas com buracos e, pior, revela por contagem a existência de canais privados.

### 32.3 Desempenho

- `ORDER BY rank` sobre milhões de linhas é caro. Mitigação: restringir sempre por `server_id` e usar índice parcial por servidor grande.
- Acima de ~50M mensagens, migrar para OpenSearch atrás da interface `SearchProvider` (já abstraída — ver ADR-006).
- Resultados cacheados por 60 s em Redis com chave `(userId, queryHash)`.
- Sinônimos e stemming em pt-BR via dicionário `portuguese` nativo; adicionar dicionário customizado para jargão do domínio (`render`, `shader`, `deploy`) se necessário.

---

## 33. Moderação e audit log

### 33.1 Ações

| Ação | Permissão | Efeito | Reversível |
|------|-----------|--------|-----------|
| Deletar mensagem | `MANAGE_MESSAGES` | Tombstone | Não |
| Purge em massa | `MANAGE_MESSAGES` | Até 100 msgs < 14 dias | Não |
| Timeout | `TIMEOUT_MEMBERS` | Perde tudo menos leitura, até 28 dias | Sim |
| Kick | `KICK_MEMBERS` | Remove; pode voltar por convite | — |
| Ban | `BAN_MEMBERS` | Remove + bloqueia; opção de apagar 7 dias de msgs | Sim |
| Server mute/deafen | `MUTE_MEMBERS` / `DEAFEN_MEMBERS` | Silencia em voz | Sim |
| Mover em voz | `MOVE_MEMBERS` | Move entre canais | — |
| Lockdown de canal | `MANAGE_CHANNELS` | Nega `SEND_MESSAGES` a `@everyone` | Sim |
| Slowmode | `MANAGE_CHANNELS` | 0–21600 s | Sim |

### 33.2 Audit log

Append-only, imutável no nível de permissão do banco. Toda ação registra ator, alvo, diff e razão.

```jsonc
{
  "id": "7108...",
  "actor": { "id": "710...", "username": "pedro" },
  "action": "MEMBER_KICK",
  "target": { "type": "user", "id": "711...", "username": "joao" },
  "changes": [],
  "reason": "spam recorrente no #geral",
  "created_at": "2026-08-22T15:32:00Z"
}
```

Renderização: `Pedro removeu João · 22/08/2026 — 15:32 · "spam recorrente no #geral"`

Ações registradas: `SERVER_UPDATE`, `CHANNEL_CREATE|UPDATE|DELETE`, `CHANNEL_OVERWRITE_*`, `MEMBER_KICK|BAN_ADD|BAN_REMOVE|UPDATE|ROLE_UPDATE|MOVE|DISCONNECT`, `ROLE_CREATE|UPDATE|DELETE`, `INVITE_CREATE|DELETE`, `MESSAGE_DELETE|BULK_DELETE|PIN|UNPIN`, `EMOJI_*`, `APP_ENABLE|DISABLE`.

### 33.3 Automoderação (fase 2)

| Regra | Ação |
|-------|------|
| Lista de palavras bloqueadas (regex por servidor) | Bloqueia envio + alerta |
| Anti-spam: 5 msgs idênticas em 10 s | Timeout de 5 min |
| Anti-menção: > 5 menções numa mensagem | Bloqueia |
| Anti-convite: link de convite externo | Deleta |
| Anti-raid: 10 entradas em 60 s | Eleva verificação, exige aprovação manual |
| Anexo com `scan_status = flagged` | Bloqueia download + notifica moderação |

Toda ação automática vai para o audit log com `actor = system` e é reversível por um moderador.

---

## 34. Segurança

### 34.1 Autenticação

- Senhas com **Argon2id** (`m=64MiB, t=3, p=4`). Nunca bcrypt novo, nunca MD5/SHA sem KDF.
- Access token JWT de 15 min (`HS256` com segredo rotacionável, ou `EdDSA` se houver múltiplos verificadores).
- Refresh token opaco, 30 dias, armazenado como hash, **rotacionado a cada uso**.
- **Detecção de reuso:** se um refresh já consumido for apresentado, toda a família de tokens daquele usuário é revogada e um alerta é enviado por e-mail. É a defesa central contra roubo de refresh token.
- MFA TOTP com 10 códigos de recuperação de uso único.
- Bloqueio progressivo por tentativas: 5 falhas → 15 min; reincidência → CAPTCHA obrigatório.

### 34.2 Superfícies de ataque e mitigações

| Vetor | Mitigação |
|-------|-----------|
| XSS via mensagem | Render por AST em React; zero `dangerouslySetInnerHTML`; CSP restritiva |
| XSS via SVG em anexo | `Content-Disposition: attachment`; CDN em domínio separado, sem cookies |
| CSRF | Refresh em cookie `SameSite=Lax`; access token via header (não cookie) |
| SQL injection | Query builder parametrizado (Drizzle); zero concatenação de string |
| IDOR | Toda rota resolve permissão a partir do recurso, nunca do parâmetro do cliente |
| Escalada de privilégio | Regras de hierarquia (§24.3) verificadas no servidor em toda mutação de cargo |
| SSRF via unfurl de link | Worker isolado, allowlist de esquema, bloqueio de IPs privados e link-local, sem seguir redirect para rede interna |
| Enumeração de usuários | Respostas idênticas em login/recuperação; rate limit agressivo |
| Vazamento por WebSocket | Permissão revalidada no fan-out, não só na inscrição |
| DoS por payload | Limite de 4 MB por frame WS; limite de profundidade em JSON |
| Zip bomb | Nunca descomprimir anexos no servidor |
| Prompt injection (app de IA) | Conteúdo do usuário tratado como dado, nunca como instrução; ferramentas com allowlist |

### 34.3 Cabeçalhos

```
Content-Security-Policy: default-src 'self';
  script-src 'self' 'wasm-unsafe-eval';
  style-src 'self' 'unsafe-inline';
  img-src 'self' https://cdn.loop.app data: blob:;
  media-src 'self' https://cdn.loop.app blob:;
  connect-src 'self' wss://gateway.loop.app https://api.loop.app wss://*.livekit.cloud;
  frame-src https://apps.loop.app;
  frame-ancestors 'none';
  base-uri 'none'; object-src 'none'
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
X-Content-Type-Options: nosniff
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(self), microphone=(self), display-capture=(self), geolocation=()
```

### 34.4 Privacidade e LGPD

| Requisito | Implementação |
|-----------|---------------|
| Direito de acesso | `POST /users/@me/data-export` → ZIP em até 30 dias |
| Direito de exclusão | Anonimização: `username = deleted_user_{hash}`, PII nula, mensagens preservadas com autor nulo |
| Minimização | IP nunca armazenado em claro — apenas HMAC com pepper |
| Retenção | Sessões 30 d, logs 90 d, notificações 180 d, audit 2 anos |
| Base legal | Execução de contrato (serviço) + legítimo interesse (segurança/antiabuso) |
| Encarregado | Contato publicado na política de privacidade |
| Incidente | Runbook de notificação à ANPD em até 2 dias úteis |

Mensagens não são apagadas na exclusão de conta porque pertencem também ao contexto de terceiros — isso deve estar explícito nos termos de uso, e o usuário pode apagar suas mensagens individualmente antes de excluir a conta.

---
## 35. Arquitetura de frontend

### 35.1 Layout

```
┌────┬──────────────────┬────────────────────────────────┬──────────────┐
│ S  │  Rooms           │  # projects                    │  People      │
│ P  │                  │  ┌──────┬───────┬──────┬─────┐ │              │
│ A  │  FACTORY         │  │ Chat │ Files │ Tasks│ 3D  │ │ ADMIN — 2    │
│ V  │  ── INFORMAÇÕES  │  └──────┴───────┴──────┴─────┘ │ 🟢 João      │
│ I  │  # boas-vindas   │                                │ 🟢 Pedro     │
│ D  │  # anúncios      │  [ lista virtualizada de       │              │
│ O  │  # regras        │    mensagens, scroll invertido]│ MEMBROS — 23 │
│ R  │  ── COMUNIDADE   │                                │ 🟢 Ana       │
│ E  │  # geral         │                                │ 🟡 Carlos    │
│ S  │  # projetos   ●  │  ─────────────────────────────  │ ⚫ Marcos    │
│    │  # dúvidas       │  [ composer ]              📎😊 │              │
│ ➕ │  ── VOZ          │                                │              │
│    │  🔊 Geral (3)    │                                │              │
├────┴──────────────────┴────────────────────────────────┴──────────────┤
│ 🎤 Conectado — Geral        [mic] [fone] [tela] [cam] [sair]          │
└───────────────────────────────────────────────────────────────────────┘
   72px      240px                    flex                    240px
```

Breakpoints: `< 768px` mostra uma coluna por vez com navegação por gesto; `768–1024px` oculta a lista de membros; `> 1024px` layout completo. A barra de voz é persistente e sobrevive à troca de canal e de servidor.

### 35.2 Estado

Quatro categorias, cada uma com sua ferramenta:

| Categoria | Ferramenta | Exemplo |
|-----------|-----------|---------|
| Servidor (cache remoto) | TanStack Query | perfis, lista de membros, histórico antigo |
| Tempo real (push) | Zustand + reducer de eventos | mensagens, presença, voice states |
| UI local | `useState` / Zustand | modais, hover, rascunhos |
| URL | Next.js router | canal ativo, servidor ativo |

```ts
interface GatewayStore {
  messages:  Map<ChannelId, MessageList>;   // ordenada, com gaps marcados
  presence:  Map<UserId, Presence>;
  voice:     Map<ChannelId, VoiceState[]>;
  typing:    Map<ChannelId, Map<UserId, number>>;
  readState: Map<ChannelId, ReadState>;
  apply(event: GatewayEvent): void;         // reducer único, testável isolado
}
```

**Regra:** um único ponto de entrada de eventos (`apply`). Nada de `useEffect` espalhado assinando o socket — isso torna a ordem de aplicação imprevisível e o estado impossível de reproduzir num teste.

### 35.3 Lista de mensagens

O componente mais difícil da aplicação. Requisitos simultâneos:

- Scroll invertido (novas embaixo), altura de item variável e desconhecida antes do render.
- Virtualização (renderizar 10k nós mata o navegador).
- Preservação de posição ao carregar histórico acima.
- Auto-scroll apenas se o usuário já estava no fim.
- Agrupamento de mensagens consecutivas do mesmo autor em até 7 minutos.
- Separadores de data e marcador de "novas mensagens".
- Jump-to-message com destaque temporário e carregamento de janela ao redor.

```ts
// TanStack Virtual com medição dinâmica
const virtualizer = useVirtualizer({
  count: items.length,
  getScrollElement: () => scrollRef.current,
  estimateSize: (i) => estimateHeight(items[i]),
  overscan: 8,
  measureElement: (el) => el.getBoundingClientRect().height,
  getItemKey: (i) => items[i].id,
});
```

Armadilhas conhecidas:

1. **Imagens sem dimensão** alteram a altura após o layout e fazem o scroll pular. Solução: reservar espaço com `width`/`height` dos metadados e exibir blurhash até carregar.
2. **Prepend de histórico** desloca o conteúdo. Solução: capturar `scrollHeight` antes, restaurar `scrollTop += delta` no `useLayoutEffect`.
3. **Auto-scroll agressivo** interrompe a leitura. Solução: só rolar se `scrollBottom < 100px` no momento do evento.
4. **Gaps no histórico.** Após uma desconexão longa, há um buraco entre o que está em memória e o que chegou. A lista precisa modelar isso explicitamente com um marcador de gap e um botão "carregar mensagens perdidas".

### 35.4 Desempenho

| Métrica | Alvo |
|---------|------|
| LCP | < 1,5 s |
| INP | < 100 ms |
| CLS | < 0,05 |
| Troca de canal | < 100 ms (cache) |
| Bundle inicial | < 250 KB gzip |
| Memória com 10 servidores | < 400 MB |

Técnicas: code splitting por rota; `next/dynamic` para viewer 3D, emoji picker e configurações; `React.memo` em item de mensagem com comparador raso por `id` + `edited_at`; Web Worker para parsing de markdown de mensagens em lote; `content-visibility: auto` em canais fora de vista; `IntersectionObserver` para lazy-load de mídia.

### 35.5 Acessibilidade

Alvo: WCAG 2.1 AA.

- Navegação completa por teclado; `Ctrl+K` para command palette, `Alt+↑/↓` entre canais, `Esc` fecha camadas.
- Lista de mensagens com `role="log"` e `aria-live="polite"`; menções e anexos anunciados.
- Foco visível sempre, com anel de 2px e contraste ≥ 3:1.
- Contraste de texto ≥ 4,5:1 em ambos os temas.
- Respeito a `prefers-reduced-motion` (desliga animações de entrada e transições de modal).
- Alternativa textual obrigatória em imagens enviadas (campo opcional no upload, com sugestão automática).
- Legendas ao vivo em chamadas de voz (fase 3, via transcrição do LiveKit).

---

## 36. Design system LOOP

### 36.1 Tokens

Escala completa derivada da base de marca de §2.5. As cinco superfícies definidas pela identidade são a espinha; o resto é extensão coerente com elas.

```css
:root {
  /* Superfícies — base da identidade LOOP */
  --bg:            #0D0D10;   /* background        (rail de Spaces) */
  --surface:       #151519;   /* surface           (sidebar)        */
  --elevated:      #1D1D23;   /* elevated surface  (cards, hover)   */
  --overlay:       #24242C;   /* modais, popovers                   */
  --border:        #26262E;
  --border-strong: #33333D;

  /* Texto */
  --fg:          #F5F5F7;   /* primary text   */
  --fg-muted:    #98989F;   /* secondary text */
  --fg-subtle:   #6A6A73;   /* timestamps     */
  --fg-inverse:  #0D0D10;

  /* Acento — cor proprietária LOOP (ver §2.6) */
  --accent:        #FF6B5A;
  --accent-hover:  #FF8271;
  --accent-subtle: rgba(255, 107, 90, 0.12);

  /* Estados semânticos — ajustados para não colidir com o acento */
  --online:  #3DDC97;
  --idle:    #F5C542;
  --busy:    #E5484D;
  --offline: #6A6A73;
  --success: #3DDC97;
  --warning: #F5C542;
  --danger:  #E5484D;

  /* Tipografia */
  --font-sans: 'Inter Variable', system-ui, sans-serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;
  --text-xs: 0.75rem;  --text-sm: 0.8125rem;
  --text-base: 0.9375rem; --text-lg: 1.0625rem;

  /* Espaçamento — escala de 4px */
  --sp-1: 4px; --sp-2: 8px; --sp-3: 12px;
  --sp-4: 16px; --sp-6: 24px; --sp-8: 32px;

  --radius-sm: 4px; --radius-md: 8px; --radius-lg: 12px; --radius-full: 9999px;
  --dur-fast: 120ms; --dur-base: 160ms; --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

**Notas de direção visual.** O texto base é 15px, não 16px — densidade importa numa interface de chat, e 15px é o ponto onde ainda há conforto de leitura com mais linhas visíveis. As superfícies são neutros levemente frios; cinza puro parece morto ao lado de conteúdo colorido. O acento aparece em poucos lugares por decisão de marca (botão primário, Room ativo, foco, menção a você) — reserva que mantém a identidade "minimal + premium" e faz o acento significar alguma coisa quando aparece.

**Sobre o `--danger` e o acento coral.** Se a cor proprietária escolhida for coral, `--danger` precisa migrar para um vermelho mais frio e escuro (`#C93B40`), senão erro e ação primária ficam visualmente indistinguíveis. Quem cede é o estado semântico, não o acento (§2.6).

**Regras de aplicação:**

| Elemento | Regra |
|----------|-------|
| Bordas | Só onde houver ambiguidade real de agrupamento. Preferir diferença de superfície. |
| Gradientes | Não usar. |
| Glow / sombra colorida | Não usar. |
| Sombra | Apenas em overlays (modal, popover, menu de contexto). |
| Animação | Transições ≤ 160 ms; nada de bounce, nada de spring exagerado. |
| Espaço negativo | Preferir espaço a divisória. |

### 36.2 Inventário de componentes

| Grupo | Componentes |
|-------|-------------|
| Layout | `AppShell`, `ServerRail`, `ChannelSidebar`, `MemberList`, `VoiceBar` |
| Chat | `MessageList`, `MessageGroup`, `MessageItem`, `Composer`, `TypingIndicator`, `ReplyPreview`, `ReactionBar`, `EmojiPicker`, `AttachmentGrid`, `Embed`, `PinnedPanel` |
| Voz | `VoiceChannelUsers`, `VideoGrid`, `VideoTile`, `ScreenShareView`, `VoiceControls`, `DeviceSettings` |
| Membros | `MemberRow`, `ProfilePopout`, `ProfileModal`, `RoleBadge`, `PresenceDot` |
| Formulário | `Input`, `Textarea`, `Select`, `Switch`, `Slider`, `ColorPicker`, `FileDrop`, `PermissionToggle` (tri-state) |
| Feedback | `Toast`, `Modal`, `Popover`, `Tooltip`, `ContextMenu`, `Skeleton`, `EmptyState`, `ErrorBoundary` |

`PermissionToggle` merece atenção: é tri-state (`allow` / `neutro` / `deny`), e a maioria dos bugs de UX de permissão vem de confundir "neutro" com "negado". O estado neutro precisa ser visualmente distinto de ambos, não um meio-termo.

---

## 37. Plataforma de aplicações em Room

O diferencial do produto. Cada Room pode expor abas além do chat, e essas abas compartilham permissões, People e contexto.

### 37.1 Modelo

```
Room #projects
├── Chat        (nativo)
├── Files       (nativo — árvore de arquivos do canal, versionada)
├── Tasks       (nativo — kanban com vínculo a mensagens)
├── 3D Viewer   (nativo — glTF/GLB com anotações posicionais)
├── Meetings    (nativo — voz agendada, gravação, transcrição)
└── AI Assistant(nativo — contexto do canal)
```

Todos os apps nativos são construídos **com o SDK público**. Se o SDK não é suficiente para construir o Tasks, ele não é suficiente para terceiros — essa é a prova de fogo do design.

### 37.2 Manifest

```jsonc
{
  "id": "com.loop.tasks",
  "name": "Tasks",
  "version": "1.2.0",
  "icon": "https://apps.loop.app/tasks/icon.svg",
  "entry": "https://apps.loop.app/tasks/index.html",
  "scopes": ["channel.read", "messages.read", "storage.channel", "members.read"],
  "permissions_required": ["USE_APPS"],
  "permissions_manage": ["MANAGE_TASKS"],
  "surfaces": ["channel_tab", "message_action", "command"],
  "commands": [
    { "name": "task", "description": "Cria tarefa a partir da mensagem" }
  ],
  "events": ["task.created", "task.completed", "task.assigned"]
}
```

### 37.3 Sandbox

Apps rodam em `<iframe sandbox="allow-scripts allow-forms">` servido de `apps.loop.app` — **origem diferente** da aplicação principal. Sem `allow-same-origin`, o app não tem acesso a cookies, localStorage ou DOM do host. Toda comunicação passa por `postMessage` com validação de origem e de esquema.

```ts
// host
iframe.contentWindow.postMessage({ type: 'CONTEXT', payload: ctx }, APPS_ORIGIN);

window.addEventListener('message', (e) => {
  if (e.origin !== APPS_ORIGIN) return;
  const msg = AppMessageSchema.safeParse(e.data);   // zod
  if (!msg.success) return;
  handleAppRequest(msg.data);   // permissões reavaliadas AQUI, no host
});
```

Chamadas do app à API passam pelo host, que injeta o token com escopo reduzido. O app **nunca** recebe o token do usuário.

### 37.4 SDK

```ts
import { createApp } from '@loop/sdk';

const app = createApp({ id: 'com.loop.tasks' });

const ctx = await app.context();          // { channel, server, user, permissions }
const msgs = await app.messages.list({ limit: 50 });
await app.storage.set('board', boardState);          // KV com escopo de canal
app.on('message.create', (m) => maybeCreateTask(m));
await app.ui.toast('Tarefa criada');
await app.messages.send(`Tarefa criada: **${title}**`);
```

Escopos disponíveis: `channel.read`, `messages.read`, `messages.write`, `members.read`, `storage.channel`, `storage.user`, `voice.read`, `files.read`, `files.write`. Cada escopo é aprovado explicitamente no momento de habilitar o app no canal, e a checagem final é sempre a permissão do usuário — um app com `messages.write` não permite que um usuário sem `SEND_MESSAGES` publique.

### 37.5 Apps nativos

| App | Escopo | Diferencial concreto |
|-----|--------|---------------------|
| **Files** | Árvore versionada por canal | Substitui "procura no histórico o arquivo que a Ana mandou" |
| **Tasks** | Kanban vinculado a mensagens | `/task` sobre uma mensagem cria a tarefa com o link da decisão |
| **3D Viewer** | glTF/GLB, USDZ | Anotação posicional no modelo vira mensagem no chat; central para o público de artistas técnicos |
| **Meetings** | Agenda + gravação + transcrição | Ata gerada vira mensagem fixada com timestamps clicáveis |
| **AI Assistant** | Contexto do canal | "resuma o que foi decidido esta semana" com citação das mensagens de origem |

O 3D Viewer é o que diferencia de fato para o público inicial: revisar um asset sem sair do canal, com a anotação virando conversa e a conversa virando task.

---

## 38. Observabilidade e SLOs

### 38.1 SLOs

| Serviço | SLI | Alvo | Janela |
|---------|-----|------|--------|
| API | Disponibilidade (não-5xx) | 99,9% | 30 d |
| API | Latência p95 | < 200 ms | 30 d |
| Gateway | Uptime de conexão | 99,5% | 30 d |
| Gateway | Entrega de evento p95 | < 250 ms | 30 d |
| Voz | Qualidade de chamada (MOS > 3,5) | 95% | 30 d |
| Upload | Sucesso | 99,5% | 30 d |
| Busca | Latência p95 | < 500 ms | 30 d |

Error budget de 43 min/mês para a API. Consumido acima de 50% no meio do mês, congela deploys de feature e prioriza confiabilidade.

### 38.2 Instrumentação

```
OpenTelemetry (traces + métricas)
   ├── traces  → Tempo / Jaeger
   ├── métricas→ Prometheus → Grafana
   └── logs    → Loki (JSON estruturado, com trace_id)
Erros → Sentry (frontend + backend, com session replay em erro)
RUM   → Web Vitals enviados para o backend próprio
```

Métricas de negócio no mesmo dashboard das técnicas — sem isso, ninguém percebe que uma regressão de latência derrubou o engajamento:

`messages_sent_total`, `voice_minutes_total`, `active_servers`, `dau`, `wau`, `d1_retention`, `d7_retention`, `d30_retention`, `time_to_first_message`, `invite_conversion_rate`.

### 38.3 Alertas

| Alerta | Condição | Severidade |
|--------|----------|-----------|
| API 5xx alta | > 1% por 5 min | P1 |
| Latência de mensagem | p95 > 1 s por 5 min | P1 |
| Gateway com queda em massa | > 20% das conexões em 1 min | P1 |
| Partição de mensagens ausente | Próxima partição inexistente em 3 dias | P1 |
| Pool de conexões do Postgres | > 80% por 10 min | P2 |
| Fila de jobs | > 1.000 pendentes | P2 |
| Espaço em disco | > 80% | P2 |
| Falha de scan de anexo | Qualquer `flagged` | P3 (revisão humana) |

---

## 39. Estratégia de testes

### 39.1 Pirâmide

```
        ╱ E2E ╲            ~30 cenários — Playwright, multi-aba
      ╱─────────╲
    ╱ Integração ╲         ~200 — API + Postgres real (testcontainers)
  ╱───────────────╲
╱     Unitários     ╲      ~800 — permissões, parsing, snowflake, reducers
```

### 39.2 O que testar com prioridade máxima

| Área | Por quê | Cobertura exigida |
|------|---------|------------------|
| Resolução de permissões | Bug aqui vaza dado privado | 100% branch |
| Fan-out do gateway | Bug aqui entrega evento a quem não deveria | 95% |
| Reconciliação otimista | Bug aqui duplica ou perde mensagem | 95% |
| Snowflake | Bug aqui corrompe IDs silenciosamente | 100% |
| Rate limiting | Bug aqui permite spam ou trava usuário legítimo | 90% |
| Parsing de markdown | Bug aqui vira XSS | 100% nos casos de sanitização |

### 39.3 Cenários E2E obrigatórios

1. Registro → verificação de e-mail → criação de servidor → primeira mensagem.
2. Dois navegadores: A envia, B recebe em < 1 s sem refresh.
3. A entra em voz, B entra, ambos se ouvem (verificado por estatística de áudio recebido).
4. Screen share de A é visível para B.
5. Admin cria cargo negando `VIEW_CHANNEL` no canal, atribui a B, B perde o canal em tempo real.
6. B tenta acessar o canal por URL direta → 403.
7. Convite com 1 uso: primeiro entra, segundo recebe erro.
8. Ban remove de `server_members` e bloqueia reentrada por convite válido.
9. Reconexão: derruba o socket de B, A envia 3 mensagens, B reconecta e recebe as 3 sem duplicar.
10. Upload de imagem → thumbnail → visualizador → download.

### 39.4 Teste de carga

Alvos com k6 e um cliente WS sintético:

| Cenário | Alvo |
|---------|------|
| Conexões simultâneas por nó de gateway | 10.000 |
| Mensagens por segundo (global) | 1.000 |
| Fan-out em servidor de 5k membros | p95 < 300 ms |
| Participantes numa sala de voz | 50 com áudio, 12 com vídeo |
| Memória por conexão WS | < 30 KB |

---

## 40. Infraestrutura, deploy e CI/CD

### 40.1 Ambientes

| Ambiente | Infra | Dados | Deploy |
|----------|-------|-------|--------|
| Local | Docker Compose | Seed sintético | — |
| Preview | Efêmero por PR | Snapshot anonimizado | Automático no PR |
| Staging | Espelho reduzido | Anonimizado | Automático no merge |
| Produção | Multi-AZ | Real | Manual, com aprovação |

### 40.2 Topologia de produção

```
Cloudflare (DNS, WAF, DDoS, CDN)
   ├── web        → Vercel / Cloudflare Pages
   ├── api        → Fly.io ou Railway, 2+ instâncias, autoscale
   ├── gateway    → Fly.io, 2+ instâncias, sticky por session_id
   ├── workers    → Fly.io, escala por profundidade de fila
   ├── postgres   → Neon / Supabase (primary + replica + PITR)
   ├── redis      → Upstash ou Redis Cloud
   ├── r2         → Cloudflare R2 (egress zero)
   └── livekit    → LiveKit Cloud
```

### 40.3 Pipeline

```yaml
on: [pull_request, push]
jobs:
  quality:   # lint, typecheck, format — paralelo
  test:      # unit + integration com testcontainers
  build:     # turbo build com cache remoto
  e2e:       # playwright contra o preview
  migrate:   # dry-run da migration + checagem de compatibilidade
  deploy:    # canary 10% → métricas 10 min → 100%
```

**Regra de migrations:** toda migration deve ser compatível com a versão anterior do código (expand → migrate → contract). Adicionar coluna com default e nullable, backfill em job separado, só então tornar `NOT NULL` numa migration posterior. Nunca renomear ou dropar coluna no mesmo deploy que muda o código.

### 40.4 Backup e recuperação

| Item | Frequência | Retenção | RPO | RTO |
|------|-----------|----------|-----|-----|
| Postgres (PITR) | Contínuo (WAL) | 30 d | 5 min | 1 h |
| Snapshot lógico | Diário | 90 d | 24 h | 4 h |
| R2 | Versionamento ativo | 30 d | — | — |
| Redis | Não crítico | — | Aceita perda | — |

Restauração testada trimestralmente em ambiente isolado — backup não testado não é backup.

---

## 41. Custos e projeção de escala

Estimativas em USD/mês, ordem de grandeza. A coluna **MVP** assume tiers gratuitos de Supabase e Vercel — suficientes para 5 pessoas, e a razão de o MVP poder ser validado sem investimento.

| Componente | MVP (5) | 500 MAU | 5k MAU | 50k MAU |
|-----------|---------|---------|--------|---------|
| Postgres | 0 | 25 | 100 | 500 |
| Redis | — | 10 | 40 | 200 |
| API (2–8 inst.) | — | 20 | 80 | 400 |
| Gateway (2–6 inst.) | — | 20 | 60 | 300 |
| Workers | — | 10 | 30 | 120 |
| R2 (storage + ops) | 0 | 5 | 40 | 300 |
| LiveKit | — | 30 | 250 | 2.000 |
| Cloudflare | 0 | 0 | 20 | 200 |
| Sentry / observabilidade | 0 | 0 | 30 | 150 |
| **Total** | **~0** | **~120** | **~650** | **~4.170** |

**Voz é o maior custo variável e cresce mais rápido que qualquer outro item.** Aos ~5k MAU, self-hostar LiveKit em VMs dedicadas costuma sair 60–70% mais barato, ao preço de operar TURN, escalonamento de SFU e monitoramento de rede. Avaliar quando o custo de voz passar de US$ 800/mês.

Alavancas de redução: R2 tem egress zero (grande economia contra S3); mensagens antigas em partições com storage frio; simulcast reduz banda do SFU; cache de permissões corta carga do Postgres pela metade.

---

## 42. Desktop — Windows e macOS

**Somente depois que a versão web estiver consolidada.** Conforme ADR-009, a base é Electron, com Tauri reavaliado no momento da decisão.

```
LOOP Web
   ↓
Electron
   ├── LOOP for Windows
   └── LOOP for macOS
```

### 42.1 O que o desktop justifica

| Recurso | Por que só existe no desktop |
|---------|----------------------------|
| Notificações nativas | Chegam com o app fechado, sem depender de aba viva |
| Tray icon | Presença persistente, contador de não lidas no ícone |
| Inicialização automática | O app está lá quando a máquina liga |
| Atalhos globais | Push-to-talk funcionando fora da janela em foco |
| Captura de tela | Escolha de janela/monitor sem o seletor do navegador |
| Auto-update | Atualização silenciosa, sem pedir refresh |

Se a lista acima não for o que os usuários pedirem no checkpoint, o desktop não é a próxima prioridade — PWA cobre a maior parte do valor com uma fração do custo.

### 42.2 Windows

Instalador `.exe` (NSIS ou MSIX). Depois: assinatura digital (certificado EV evita o alerta do SmartScreen), auto-update via `electron-updater`, integração com notificações e taskbar do Windows.

### 42.3 macOS

Builds para Apple Silicon e, se necessário, Intel. Distribuição em `.dmg`.

Obrigatório: Apple Developer Account, Code Signing, **Notarization** (sem ela o macOS recusa abrir o app), e declaração explícita das permissões de microfone, câmera e gravação de tela no `Info.plist`. O fluxo de notarização costuma consumir mais tempo que o esperado — reservar tempo de calendário, não só de desenvolvimento.

---

## 43. Roadmap consolidado

### Fase 0 — Fundação de marca e UI (1 semana)

Símbolo, wordmark, cor proprietária, tipografia, tokens, favicon, primeira tela de referência.

**Aceite:** tokens em código e uma tela em alta fidelidade que o time concorda em construir.

### Fase 1 — MVP web para 5 pessoas (8 semanas)

Escopo completo em §3.1. Marco central na semana 3: duas janelas, mensagem em tempo real.

**Aceite:** os critérios de §16, incluindo o critério subjetivo de §16.2.

### Checkpoint (1–2 semanas)

Revisão de §17 e correção do que ela revelar. Nenhum recurso novo entra antes disso.

### Fase 2 — Comunidade completa (8 semanas)

Múltiplos Spaces, convites por link, Groups (categorias), CRUD de Rooms pela interface, Tags (cargos), permissões com overrides, Rooms privados, moderação, audit log, reply, reactions, Sides (threads), menções, mensagens fixadas, busca, DMs e grupos privados, presença completa, notificações, upload de documentos e vídeos, emojis personalizados.

**Aceite:**
- Tag negando `VIEW_CHANNEL` esconde o Room em tempo real, sem refresh.
- Busca com `from:` e `in:` responde em < 500 ms.
- Ban impede reentrada por convite válido.
- Audit log registra 100% das ações de moderação.
- Notificação chega com a aba fechada.

### Fase 3 — Tempo real rico e escala (10 semanas)

Migração do transporte para gateway próprio (se o gatilho de §18 tiver disparado), API dedicada, Redis, filas, observabilidade, CDN, R2. Live Rooms: voz, vídeo, screen sharing, seleção de dispositivo. Plataforma de apps em Room + SDK, com Files, Tasks, 3D Viewer e Meetings.

**Aceite:**
- 8 pessoas em Live Room com mouth-to-ear p95 < 200 ms.
- Screen share 1080p/30 estável por 30 min.
- App de terceiro roda em sandbox sem acesso ao token do usuário.
- Migração do transporte concluída sem alterar componentes de UI (prova de que ADR-008 funcionou).

### Fase 4 — Plataforma (contínuo)

LOOP for Windows e macOS, mobile, bots e webhooks, automoderação, gravação e transcrição, monetização, marketplace de apps.

### Visão da evolução

```
Fundação de marca
        ↓
MVP WEB — 5 pessoas
        ↓
Validar chat
        ↓
Testar com usuários reais
        ↓
Aprovar MVP
        ↓
Revisar arquitetura + segurança
        ↓
Comunidades completas
        ↓
DM + notificações + arquivos
        ↓
Voice / Video / Screen Share
        ↓
Escalar infraestrutura
        ↓
Windows → macOS
```

### Cronograma

```
Semana   1  3  5  7  9 11 13 15 17 19 21 23 25 27 29
Fase 0  ▓▓
MVP       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
Check                     ▓▓▓
Fase 2                       ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
Fase 3                                       ▓▓▓▓▓▓▓▓▓▓►
```

---

## 44. Riscos e mitigações

| # | Risco | Prob. | Impacto | Mitigação |
|---|-------|-------|---------|-----------|
| R1 | Escopo cresce e o MVP nunca fecha | **Alta** | **Alto** | §3.1 é contrato; Parte IV é literatura até o MVP ser aprovado |
| R2 | Time constrói a Parte IV em vez da Parte II | **Alta** | **Alto** | Estrutura do documento separa as duas explicitamente; revisão semanal do escopo |
| R3 | Falha de RLS expõe dados privados | Média | **Crítico** | Os 8 testes de §8.5 como bloqueador de deploy; teste manual via REST, não só pela UI |
| R4 | Lock-in do Supabase trava a Fase 3 | Média | Alto | ADR-008 + `RealtimeTransport` + regra de ESLint que impede o atalho |
| R5 | Cor proprietária indefinida atrasa a UI | Média | Médio | Acento provisório isolado num token; §2.6 com candidatas e critérios objetivos |
| R6 | Os 5 usuários não gostam de usar | Média | **Crítico** | Feedback estruturado em §16.3; critério subjetivo tem peso de bloqueio |
| R7 | Mensagens perdidas em reconexão passam despercebidas | **Alta** | Alto | Refetch após reconexão (§11.4); teste explícito no critério de aprovação |
| R8 | Snowflake lido como `number` corrompe IDs | Média | Alto | `id::text` no select; `Message.id` sempre `string`; teste unitário do round-trip |
| R9 | Custo de voz cresce mais que a receita (Fase 3) | Média | Alto | Gatilho de self-host em §18; limite de minutos no plano gratuito |
| R10 | Lista virtualizada de mensagens trava o time | Média | Médio | No MVP, lista simples com 50 itens — virtualizar só quando doer |
| R11 | Migrations feitas só no painel do Supabase | **Alta** | Alto | Regra de §15; recriar o ambiente dev do zero uma vez por mês para provar |
| R12 | Nenhum diferencial percebido contra Discord | Média | **Crítico** | Marca própria desde o MVP; validar 3D Viewer e Tasks antes da Fase 3 |
| R13 | Notarization do macOS trava o release (Fase 4) | Média | Médio | Iniciar Apple Developer Account com meses de antecedência |

**Os quatro riscos que decidem o projeto:** R1 e R2 matam por exaustão, R3 mata por incidente, R6 mata por indiferença. Todos os outros são gerenciáveis.

---

## 45. Anexos

### 45.1 Objetos de API

```jsonc
// Message
{
  "id": "7108451234567890123",
  "channel_id": "7108440000000000001",
  "server_id": "7108430000000000001",
  "author": {
    "id": "7108420000000000001",
    "username": "juscelio",
    "display_name": "Juscelio",
    "avatar_url": "https://cdn.loop.app/avatars/...webp",
    "roles": ["7108431000000000001"]
  },
  "type": "default",
  "content": "Olá pessoal! Segue o render <@7108420000000000002>",
  "mentions": ["7108420000000000002"],
  "mention_roles": [],
  "mention_everyone": false,
  "attachments": [{
    "id": "7108460000000000001",
    "filename": "render_final.png",
    "content_type": "image/png",
    "size_bytes": 2458624,
    "width": 1920, "height": 1080,
    "blurhash": "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
    "url": "https://cdn.loop.app/...?ex=...&hm=...",
    "thumbnail_url": "https://cdn.loop.app/...thumb..."
  }],
  "embeds": [],
  "reactions": [
    { "emoji": { "name": "🔥" }, "count": 8, "me": true },
    { "emoji": { "id": "7108470000000000001", "name": "factory" }, "count": 3, "me": false }
  ],
  "reply_to": null,
  "thread": null,
  "pinned_at": null,
  "edited_at": null,
  "flags": 0,
  "created_at": "2026-08-22T15:32:00.000Z"
}
```

```jsonc
// Channel
{
  "id": "7108440000000000001",
  "server_id": "7108430000000000001",
  "category_id": "7108435000000000001",
  "type": "text",
  "name": "projetos",
  "topic": "Discussão dos projetos em andamento",
  "position": 1,
  "is_nsfw": false,
  "rate_limit_per_user": 0,
  "last_message_id": "7108451234567890123",
  "apps_enabled": ["com.loop.tasks", "com.loop.viewer3d"],
  "permission_overrides": [
    { "target_type": 0, "target_id": "7108431000000000000",
      "allow": "0", "deny": "32768" }
  ]
}
```

```jsonc
// Member
{
  "user": { "id": "...", "username": "ana", "display_name": "Ana", "avatar_url": "..." },
  "nickname": "Ana (PO)",
  "roles": ["7108431000000000002", "7108431000000000003"],
  "joined_at": "2026-03-14T10:00:00.000Z",
  "timeout_until": null,
  "presence": { "status": "online", "since": 1755870000 }
}
```

### 45.2 Atalhos de teclado

| Atalho | Ação |
|--------|------|
| `Ctrl/⌘ K` | Command palette (ir para canal, servidor, usuário) |
| `Ctrl/⌘ F` | Buscar no canal |
| `Ctrl/⌘ Shift F` | Buscar globalmente |
| `Alt ↑ / ↓` | Canal anterior / próximo |
| `Alt Shift ↑ / ↓` | Servidor anterior / próximo |
| `Esc` | Fecha camada; marca canal como lido se no fim |
| `Shift Esc` | Marca tudo como lido |
| `↑` (composer vazio) | Edita última mensagem própria |
| `Ctrl/⌘ Enter` | Envia (quando modo "Enter = nova linha") |
| `Ctrl/⌘ Shift M` | Mute |
| `Ctrl/⌘ Shift D` | Deafen |
| `Ctrl/⌘ /` | Lista de atalhos |

### 45.3 Variáveis de ambiente

**Fase 1 (MVP):**

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_APP_URL=https://loop.app
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # servidor apenas
```

**Fases 3–4 (arquitetura alvo):**

```bash
# Core
NODE_ENV=production
APP_URL=https://loop.app
API_URL=https://api.loop.app
GATEWAY_URL=wss://gateway.loop.app
CDN_URL=https://cdn.loop.app
APPS_ORIGIN=https://apps.loop.app

# Banco e cache
DATABASE_URL=postgres://...
DATABASE_REPLICA_URL=postgres://...
REDIS_URL=rediss://...

# Auth
JWT_SECRET=...
JWT_ACCESS_TTL=900
REFRESH_TTL=2592000
ARGON2_MEMORY=65536
IP_HASH_PEPPER=...

# Storage
R2_ACCOUNT_ID=... R2_ACCESS_KEY_ID=... R2_SECRET_ACCESS_KEY=...
R2_BUCKET=loop-uploads
CDN_SIGNING_KEY=...

# Voz
LIVEKIT_URL=wss://....livekit.cloud
LIVEKIT_API_KEY=... LIVEKIT_API_SECRET=...

# Infra
SNOWFLAKE_DC=0
SNOWFLAKE_WORKER=0      # único por processo — obrigatório
SENTRY_DSN=...
OTEL_EXPORTER_OTLP_ENDPOINT=...
```

### 45.4 Checklist pré-produção

**Segurança**
- [ ] Pentest do motor de permissões concluído
- [ ] CSP aplicada e sem `unsafe-inline` em `script-src`
- [ ] Rate limits ativos em todas as rotas de escrita
- [ ] Rotação de refresh token com detecção de reuso verificada
- [ ] Segredos fora do repositório, em cofre gerenciado
- [ ] Dependências sem CVE crítica

**Confiabilidade**
- [ ] Restauração de backup testada com sucesso
- [ ] Alertas P1 disparando para on-call real
- [ ] Teste de carga atingindo os alvos da §39.4
- [ ] Partições de mensagens criadas com 3 meses de antecedência
- [ ] Runbook de incidente escrito e ensaiado

**Produto**
- [ ] Termos de uso e política de privacidade publicados
- [ ] Fluxo de export e exclusão de dados funcionando
- [ ] Canal de denúncia de abuso ativo
- [ ] Onboarding testado com 5 usuários que nunca viram o produto
- [ ] Acessibilidade auditada (teclado + leitor de tela)

**Marca**
- [ ] Cor proprietária definida e aplicada (§2.6)
- [ ] Símbolo legível a 16×16 monocromático
- [ ] Favicon, ícone de app e avatar padrão gerados
- [ ] Vocabulário LOOP consistente — nenhuma string de UI fora de `lib/vocabulary.ts`

### 45.5 Referências

| Tema | Fonte |
|------|-------|
| Snowflake IDs | Twitter Engineering — *Announcing Snowflake* |
| Fan-out em escala | Discord Engineering — *How Discord Stores Trillions of Messages* |
| Presença distribuída | Discord Engineering — *How Discord Maintains State* |
| SFU e WebRTC | LiveKit Docs — *Architecture* |
| FTS em Postgres | PostgreSQL Docs — cap. 12 |
| Segurança de iframe | MDN — *iframe sandbox* / OWASP Cheat Sheets |
| Virtualização de lista | TanStack Virtual — *Dynamic sizing* |
| Acessibilidade | WCAG 2.1 AA, WAI-ARIA Authoring Practices |

---

## Registro de mudanças

| Versão | Data | Alterações |
|--------|------|-----------|
| 1.0 | 22/08/2026 | Documento inicial: escopo, arquitetura, modelo de dados, permissões, API, gateway, voz, apps de canal, roadmap |
| 2.0 | 22/08/2026 | Integração do plano de MVP e da identidade LOOP. **Adicionado:** marca, tagline, vocabulário próprio, direção visual e critérios da cor proprietária (§2); Parte II completa com stack, schema, RLS, camada de transporte, UI e plano de 8 semanas (§5–16); checkpoint com gatilhos numéricos de migração (§17–18); seção de desktop (§42); ADR-008, ADR-009 e ADR-010. **Revisado:** ADR-003 (gateway próprio movido para a Fase 3 — a premissa de escala mudou de 500 para 5 usuários); ADR-001 (snowflake agora gerado em `plpgsql` desde o MVP); design system realinhado à paleta LOOP; roadmap, riscos e custos reescritos com a Fase 1 real. **Removido:** a recomendação de "trilha híbrida" da v1, substituída pela ponte MVP → alvo de §19.4. |

---

*Documento vivo. Toda decisão que contrarie uma ADR existente deve gerar uma nova ADR que a substitua explicitamente, com o motivo da mudança.*
