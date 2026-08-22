# LOOP --- Master Product, MVP & Technical Specification

> **Produto:** LOOP\
> **Tagline inicial:** **Stay in the Loop.**\
> **Versão:** Master 1.0\
> **Data-base:** 22/08/2026\
> **Status:** Documento unificado de produto, branding, MVP, arquitetura
> e evolução\
> **Primeiro lançamento:** Web\
> **Primeiro grupo de validação:** até 5 pessoas

------------------------------------------------------------------------

## Como usar este documento

Este arquivo é a **fonte central do projeto LOOP**. Ele unifica:

1.  visão e identidade do produto;
2.  plano prático do MVP Web para 5 pessoas;
3.  critérios de aprovação do MVP;
4.  segurança e infraestrutura inicial;
5.  especificação funcional completa;
6.  arquitetura técnica de escala;
7.  banco, permissões, APIs e realtime;
8.  voz, vídeo, arquivos, notificações e moderação;
9.  testes, observabilidade, deploy e custos;
10. roadmap pós-MVP;
11. estratégia futura para Windows e macOS.

### Regra principal de execução

A especificação técnica completa descreve **onde a LOOP pode chegar**.
Ela **não significa que toda essa infraestrutura deve ser construída
agora**.

Para o primeiro MVP, a decisão permanece:

``` text
Next.js
+
Supabase Auth
+
Supabase PostgreSQL
+
Supabase Realtime
+
Supabase Storage
+
Vercel
```

O objetivo é validar o produto com até 5 pessoas antes de introduzir
gateway WebSocket próprio, Redis, workers, LiveKit, arquitetura
distribuída ou clientes desktop.

### Decisão sobre a aparente divergência de arquitetura

Os documentos originais continham duas direções válidas:

-   **MVP simples:** Next.js + Supabase;
-   **arquitetura de escala:** API/Gateway próprio + PostgreSQL +
    Redis + workers.

Neste documento elas passam a ser **fases**, e não alternativas
concorrentes:

``` text
FASE 1
MVP para 5 pessoas
Next.js + Supabase
        ↓
VALIDAÇÃO
Uso real + segurança + UX
        ↓
FASE 2
Produto Web consolidado
        ↓
GATILHO DE ESCALA
Realtime/custos/permissões justificam mudança
        ↓
FASE 3
Gateway próprio + Redis + workers
        ↓
FASE 4
Voice/Video + Desktop + escala maior
```

Não migrar apenas porque a arquitetura avançada existe neste documento.
Migrar quando métricas e necessidades reais justificarem.

------------------------------------------------------------------------

# PARTE I --- PRODUTO, BRANDING E MVP

## 1. Objetivo

Criar uma plataforma web de comunicação em tempo real inspirada na
lógica de comunidades do Discord, mas desenvolvida como produto próprio.

O primeiro objetivo não é recriar todo o Discord. O objetivo é construir
um **MVP funcional para até 5 pessoas**, validar a experiência principal
e somente depois evoluir para uma aplicação maior.

Nesta primeira etapa o produto será **somente Web**.

------------------------------------------------------------------------

## 2. Estratégia

A prioridade do MVP é validar o núcleo do produto:

**Comunidade → Canais → Pessoas → Mensagens em tempo real**

Não entram inicialmente:

-   aplicativo Windows;
-   aplicativo macOS;
-   aplicativo mobile;
-   chamadas de voz;
-   vídeo;
-   compartilhamento de tela;
-   bots;
-   marketplace;
-   sistema complexo de moderação;
-   infraestrutura própria;
-   microserviços.

Esses recursos só serão considerados depois da aprovação do MVP.

------------------------------------------------------------------------

# FASE 1 --- MVP WEB PARA 5 PESSOAS

## 3. Stack recomendada

### Frontend

-   Next.js
-   React
-   TypeScript
-   Tailwind CSS

### Backend / Banco

-   Supabase
-   PostgreSQL
-   Supabase Auth
-   Supabase Realtime

### Hospedagem

-   Vercel

### Arquivos

No primeiro MVP:

-   Supabase Storage

No futuro, caso o volume de arquivos cresça:

-   Cloudflare R2

### Domínio e proteção

Inicialmente o domínio pode apontar para a Vercel.

Posteriormente:

-   Cloudflare DNS
-   Cloudflare WAF
-   Rate Limiting
-   proteção adicional contra bots e ataques

------------------------------------------------------------------------

# 4. Arquitetura inicial

``` text
USUÁRIO
   │
   ▼
NAVEGADOR
   │
   ▼
NEXT.JS / REACT
   │
   ├──────────────► SUPABASE AUTH
   │
   ├──────────────► POSTGRESQL
   │
   ├──────────────► SUPABASE REALTIME
   │
   └──────────────► SUPABASE STORAGE
```

O frontend será publicado na Vercel.

O Supabase será responsável inicialmente por:

-   autenticação;
-   banco;
-   mensagens;
-   realtime;
-   permissões de banco;
-   arquivos.

------------------------------------------------------------------------

# 5. PRIMEIRO PASSO

Antes de desenvolver recursos avançados, construir uma versão mínima
onde duas ou mais pessoas consigam entrar e conversar em tempo real.

## Meta do primeiro milestone

Conseguir abrir duas janelas/navegadores diferentes:

``` text
USUÁRIO A
    ↓
# geral
    ↓
"Olá"

        SUPABASE REALTIME

USUÁRIO B
    ↓
# geral
    ↓
recebe "Olá" imediatamente
```

Quando isso estiver funcionando corretamente, a fundação técnica do
produto estará validada.

------------------------------------------------------------------------

# 6. Ordem de desenvolvimento

## Passo 1 --- Criar o projeto

Criar:

``` text
Next.js
TypeScript
Tailwind
Git
```

Estrutura inicial:

``` text
/app
/components
/lib
/types
```

Criar também um repositório Git desde o início.

------------------------------------------------------------------------

## Passo 2 --- Criar projeto no Supabase

Configurar:

-   projeto;
-   PostgreSQL;
-   Auth;
-   Realtime;
-   Storage.

Adicionar as variáveis de ambiente do Supabase ao projeto Next.js.

Nunca colocar chaves administrativas ou `service_role` no frontend.

------------------------------------------------------------------------

## Passo 3 --- Autenticação

Criar:

``` text
/login
/register
```

Funções:

-   criar conta;
-   entrar;
-   sair;
-   manter sessão;
-   recuperação de senha posteriormente.

Para o MVP de 5 pessoas, email + senha é suficiente.

------------------------------------------------------------------------

# 7. Banco de dados do MVP

Não criar toda a estrutura definitiva agora.

Começar com:

``` text
profiles
servers
server_members
channels
messages
```

## profiles

``` text
id
username
display_name
avatar_url
created_at
```

## servers

``` text
id
name
owner_id
created_at
```

## server_members

``` text
server_id
user_id
role
joined_at
```

## channels

``` text
id
server_id
name
type
created_at
```

No MVP:

``` text
type = text
```

## messages

``` text
id
channel_id
user_id
content
created_at
edited_at
```

------------------------------------------------------------------------

# 8. Segurança desde o primeiro MVP

Mesmo sendo apenas 5 usuários, implementar segurança corretamente desde
o início.

Utilizar Supabase Row Level Security (RLS).

Exemplo conceitual:

``` text
Usuário autenticado
        ↓
É membro do servidor?
        ↓
SIM
        ↓
Pode visualizar os canais autorizados
```

Para mensagens:

``` text
Usuário autenticado
        ↓
É membro do servidor do canal?
        ↓
SIM
        ↓
Pode ler/enviar mensagem
```

O frontend nunca deve ser a única camada responsável por decidir
permissões.

------------------------------------------------------------------------

# 9. Interface do MVP

Layout inicial:

``` text
┌───────┬──────────────────┬──────────────────────────┬──────────────┐
│       │                  │                          │              │
│SERVER │     CHANNELS     │          CHAT            │   MEMBERS    │
│       │                  │                          │              │
│  F    │ # geral          │ João                     │ Online       │
│       │ # projetos       │ Olá pessoal              │ João         │
│       │ # random         │                          │ Maria        │
│       │                  │ Maria                    │ Pedro        │
│       │                  │ Olá!                     │              │
│       │                  │                          │              │
│       │                  ├──────────────────────────┤              │
│       │                  │ Digite uma mensagem...  │              │
└───────┴──────────────────┴──────────────────────────┴──────────────┘
```

------------------------------------------------------------------------

# 10. Funcionalidades obrigatórias do MVP

O MVP deve permitir:

-   cadastro;
-   login;
-   logout;
-   perfil básico;
-   avatar;
-   uma comunidade/servidor;
-   membros;
-   canais de texto;
-   trocar de canal;
-   enviar mensagem;
-   receber mensagem em tempo real;
-   histórico de mensagens;
-   horário da mensagem;
-   editar a própria mensagem;
-   excluir a própria mensagem;
-   mostrar membros;
-   estado básico de carregamento;
-   tratamento de erros;
-   interface responsiva para desktop/browser.

------------------------------------------------------------------------

# 11. Recursos interessantes, mas não obrigatórios

Somente adicionar se o núcleo estiver funcionando:

-   reactions;
-   reply;
-   upload de imagem;
-   indicador "digitando...";
-   presença online;
-   criação de canais pela interface;
-   convite por link.

Não deixar esses recursos atrasarem a validação do chat principal.

------------------------------------------------------------------------

# 12. O que define o MVP como aprovado

Testar com 5 usuários reais.

O MVP está tecnicamente aprovado quando:

-   os 5 conseguem criar/usar suas contas;
-   conseguem entrar na mesma comunidade;
-   conseguem trocar entre canais;
-   mensagens aparecem em tempo real;
-   histórico permanece depois de atualizar a página;
-   um usuário não consegue editar/excluir mensagem de outro sem
    permissão;
-   usuário não autorizado não consegue consultar conteúdo privado
    diretamente pelo backend;
-   não há perda de mensagens durante uso normal;
-   a experiência permanece estável durante uma conversa real;
-   funciona corretamente nos principais navegadores desktop.

Além da parte técnica, validar:

**As pessoas realmente gostam de usar a interface para conversar?**

Essa é a validação mais importante antes de aumentar a infraestrutura.

------------------------------------------------------------------------

# 13. Deploy do MVP

``` text
Git Repository
      ↓
Vercel
      ↓
Web App
      ↓
Supabase
```

O projeto deverá possuir pelo menos:

``` text
Development
Production
```

Nunca trabalhar diretamente no banco de produção sem controle.

------------------------------------------------------------------------

# 14. Segurança mínima para lançamento

Antes de liberar o MVP:

-   HTTPS;
-   RLS habilitado;
-   validação de autenticação;
-   nenhuma chave secreta exposta no frontend;
-   variáveis de ambiente configuradas corretamente;
-   limite de tamanho das mensagens;
-   validação dos inputs;
-   proteção das rotas privadas;
-   restrições de upload, caso uploads sejam habilitados;
-   logs básicos de erro;
-   backup do banco;
-   política de privacidade caso dados de usuários externos sejam
    coletados.

------------------------------------------------------------------------

# 15. Custo inicial

Para apenas 5 pessoas, a infraestrutura pode permanecer extremamente
pequena.

É possível começar utilizando os tiers gratuitos disponíveis para
desenvolvimento e migrar para planos pagos antes de um lançamento
público.

O objetivo neste estágio é gastar pouco e descobrir rapidamente se a
experiência funciona.

------------------------------------------------------------------------

# 16. CHECKPOINT --- NÃO DESENVOLVER ANTES DA APROVAÇÃO DO MVP

A arquitetura deve deixar espaço para os recursos abaixo, mas eles **não
fazem parte da primeira versão**.

------------------------------------------------------------------------

# FASE 2 --- DEPOIS DA APROVAÇÃO DO MVP

Depois que o MVP para 5 pessoas estiver aprovado, fazer uma revisão
antes de simplesmente adicionar funcionalidades.

## Primeiro passo pós-MVP

Revisar:

``` text
Banco
Arquitetura
Segurança
Performance
UX
Logs
Custos
Feedback dos usuários
```

Corrigir a fundação antes de escalar.

------------------------------------------------------------------------

# 17. Evolução do sistema de comunidade

Adicionar:

-   criação de múltiplos servidores;
-   convites;
-   categorias;
-   criação/edição/exclusão de canais;
-   cargos;
-   permissões;
-   canais privados;
-   moderação;
-   audit log.

------------------------------------------------------------------------

# 18. Evolução das mensagens

Adicionar:

-   reply;
-   reactions;
-   threads;
-   menções;
-   mensagens fixadas;
-   busca;
-   GIFs;
-   emojis personalizados;
-   preview de links;
-   upload de documentos;
-   upload de vídeos.

------------------------------------------------------------------------

# 19. Mensagens privadas

Adicionar:

``` text
Direct Messages
```

Com:

-   conversa 1:1;
-   grupos privados;
-   histórico;
-   notificações.

------------------------------------------------------------------------

# 20. Presença

Adicionar presença em tempo real:

``` text
online
idle
busy
offline
```

Adicionar também:

``` text
typing...
```

Esses estados devem ser tratados como dados temporários/realtime, não
como histórico permanente do PostgreSQL.

------------------------------------------------------------------------

# 21. Voz, vídeo e compartilhamento de tela

Somente depois da validação do chat.

Adicionar:

``` text
LiveKit
+
WebRTC
```

Funções:

-   canal de voz;
-   microfone;
-   mute;
-   câmera;
-   vídeo;
-   screen sharing;
-   escolha de dispositivo;
-   desconectar.

Arquitetura:

``` text
WEB APP
   │
   ├──── Chat ────► Supabase
   │
   └──── Voice ───► LiveKit
```

Não transportar áudio/vídeo pelo servidor normal da aplicação.

------------------------------------------------------------------------

# 22. Escalabilidade

Quando o número de usuários justificar, analisar:

-   API dedicada;
-   Redis;
-   cache;
-   filas;
-   rate limiting avançado;
-   observabilidade;
-   CDN;
-   Cloudflare R2;
-   separação de serviços;
-   otimização do PostgreSQL;
-   infraestrutura dedicada para realtime.

Não implementar essa complexidade antecipadamente.

------------------------------------------------------------------------

# 23. Desktop --- FUTURO

Somente depois que a versão Web estiver validada.

A versão web poderá ser reutilizada como base para:

``` text
Electron
```

e gerar:

``` text
Windows
macOS
```

Recursos desktop:

-   notificações nativas;
-   tray;
-   inicialização automática;
-   atalhos;
-   microfone;
-   câmera;
-   screen sharing;
-   integração com sistema operacional;
-   auto-update.

------------------------------------------------------------------------

# 24. Windows

Gerar instalador:

``` text
.exe
```

Posteriormente implementar:

-   assinatura digital;
-   auto-update;
-   instalação segura;
-   notificações;
-   integração com Windows.

------------------------------------------------------------------------

# 25. macOS

Gerar versões:

``` text
Apple Silicon
Intel, se necessário
```

Distribuição:

``` text
.dmg
```

Implementar:

-   Apple Developer Account;
-   Code Signing;
-   Notarization;
-   permissões de microfone;
-   câmera;
-   screen recording;
-   auto-update.

------------------------------------------------------------------------

# 26. Visão da evolução

``` text
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
Windows
        ↓
macOS
```

------------------------------------------------------------------------

# 27. Decisão atual

A decisão atual do projeto é:

> Construir primeiro uma versão Web extremamente simples para 5 pessoas,
> usando Next.js + Supabase, com autenticação, comunidade, canais e
> mensagens em tempo real.

O **primeiro objetivo técnico** é colocar duas pessoas autenticadas no
mesmo canal e fazer uma mensagem enviada por uma aparecer imediatamente
para a outra.

Todo recurso que não contribua diretamente para atingir e validar esse
objetivo deve ficar para depois.

------------------------------------------------------------------------

# 28. BRANDING E IDENTIDADE --- LOOP

## Nome escolhido

**LOOP**

LOOP será o nome principal da plataforma.

O conceito da marca parte da ideia de um ciclo contínuo entre pessoas:

``` text
Conectar
   ↓
Conversar
   ↓
Compartilhar
   ↓
Voltar
   ↓
LOOP
```

A marca deve transmitir:

-   conexão;
-   comunidade;
-   continuidade;
-   presença;
-   comunicação;
-   simplicidade;
-   tecnologia.

A intenção é evitar uma identidade excessivamente gamer ou uma cópia
visual do Discord.

A direção será mais:

``` text
Minimal
+
Premium
+
Social
+
Contemporânea
+
Tecnológica
```

------------------------------------------------------------------------

# 29. Tagline

Primeira direção:

> **Stay in the Loop.**

O conceito funciona em dois níveis:

-   permanecer conectado e informado;
-   estar dentro da plataforma/comunidade LOOP.

Outras assinaturas poderão ser exploradas posteriormente, mas **Stay in
the Loop.** será a referência inicial.

------------------------------------------------------------------------

# 30. Linguagem própria do produto

Evitar copiar diretamente a nomenclatura do Discord.

Vocabulário inicial:

  Conceito tradicional   LOOP
  ---------------------- ---------------------
  Server                 **Space**
  Category               **Group**
  Channel                **Room**
  Voice Channel          **Live Room**
  Members                **People**
  Direct Messages        **Messages**
  Invite                 **Invite to Space**

Exemplo:

``` text
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

No MVP inicial, os nomes internos do banco podem continuar técnicos
(`servers`, `channels`, etc.) para facilitar desenvolvimento.

A interface apresentada ao usuário deverá utilizar a linguagem da LOOP:

``` text
Space
Room
People
```

------------------------------------------------------------------------

# 31. Direção visual

A identidade deverá ser minimalista e evitar a associação imediata com o
Discord.

Direção:

``` text
Dark interface
Off-white typography
Neutral surfaces
One strong accent color
```

Base inicial sugerida:

``` text
Background
#0D0D10

Surface
#151519

Elevated Surface
#1D1D23

Primary Text
#F5F5F7

Secondary Text
#98989F
```

A cor proprietária da LOOP ainda deverá ser definida durante a etapa de
identidade visual.

Possíveis direções:

-   verde-lima elétrico;
-   coral;
-   cyan;
-   outra cor exclusiva encontrada durante os testes de branding.

Evitar depender do roxo/azul característico associado ao Discord.

------------------------------------------------------------------------

# 32. Logo

O logo deve funcionar tanto como wordmark:

``` text
LOOP
```

quanto como símbolo independente.

Direção conceitual:

> Um traço contínuo formando um loop e criando simultaneamente uma
> referência sutil a conexão e conversa.

O símbolo pode explorar:

-   loop contínuo;
-   infinito abstrato;
-   dois elementos conectados;
-   letra L;
-   balão de conversa;
-   nós/conexões.

Não utilizar todos esses elementos literalmente ao mesmo tempo.

O objetivo é chegar a um símbolo extremamente simples e reconhecível.

Ele deverá funcionar em:

``` text
Favicon
Web App
Avatar
App Icon
Windows
macOS
Mobile — futuro
Tray Icon — futuro
Social Media
```

------------------------------------------------------------------------

# 33. Motion Branding

O conceito LOOP permite utilizar movimento como parte da identidade.

Possível animação:

``` text
ponto
 ↓
linha começa a ser desenhada
 ↓
forma o símbolo
 ↓
linha fecha o circuito
 ↓
LOOP
```

O fechamento do símbolo representa visualmente a ideia de completar um
loop.

Essa animação poderá ser utilizada futuramente em:

-   loading;
-   splash screen;
-   homepage;
-   transições;
-   aplicativo desktop;
-   vídeos da marca.

Não é requisito do primeiro MVP funcional.

------------------------------------------------------------------------

# 34. Personalidade da interface

A LOOP não deverá parecer apenas uma ferramenta corporativa e também não
deverá ser exclusivamente gamer.

Posicionamento desejado:

> Um espaço digital moderno onde grupos permanecem conectados.

A interface deve transmitir:

``` text
Rápida
Simples
Social
Organizada
Viva
Premium
```

Evitar excesso de:

-   bordas;
-   gradients;
-   efeitos glow;
-   elementos gamer;
-   informações simultâneas;
-   menus complexos.

Priorizar:

-   hierarquia;
-   espaço negativo;
-   tipografia;
-   microinterações;
-   feedback imediato;
-   animações sutis.

------------------------------------------------------------------------

# 35. Estrutura conceitual da LOOP

A hierarquia principal do produto passa a ser:

``` text
LOOP
 │
 ├── SPACE
 │     │
 │     ├── ROOM
 │     ├── ROOM
 │     ├── ROOM
 │     │
 │     └── PEOPLE
 │
 ├── SPACE
 │
 └── MESSAGES
```

No futuro:

``` text
SPACE
 │
 ├── ROOMS
 │
 ├── LIVE
 │
 ├── PEOPLE
 │
 ├── FILES
 │
 └── APPS
```

Isso deixa espaço para a LOOP evoluir além de chat.

------------------------------------------------------------------------

# 36. Atualização do objetivo do MVP

O MVP deixa de ser tratado apenas como um "clone do Discord".

A definição passa a ser:

> **LOOP é uma plataforma web de comunidades e comunicação em tempo real
> baseada em Spaces, Rooms e People.**

O primeiro MVP continua limitado a aproximadamente 5 pessoas.

O primeiro objetivo técnico permanece:

``` text
Pessoa A
   ↓
entra em um Space
   ↓
abre uma Room
   ↓
envia uma mensagem
   ↓
Pessoa B recebe instantaneamente
```

A identidade LOOP deverá ser aplicada à interface desde o MVP, mesmo que
o sistema ainda possua poucas funcionalidades.

------------------------------------------------------------------------

# 37. Próximo passo de branding

Antes de fechar a interface visual definitiva do MVP:

1.  desenvolver símbolo da LOOP;
2.  definir wordmark;
3.  escolher cor proprietária;
4.  definir tipografia;
5.  definir tokens básicos de UI;
6.  criar favicon;
7.  criar primeira tela visual da LOOP;
8.  aplicar o design system ao MVP.

Depois disso, continuar o desenvolvimento funcional:

``` text
Brand Foundation
      ↓
UI Foundation
      ↓
Login
      ↓
Space
      ↓
Rooms
      ↓
Realtime Chat
      ↓
Teste com 5 pessoas
      ↓
Aprovação do MVP
```

------------------------------------------------------------------------

# 38. Checkpoint pós-MVP da LOOP

Quando o MVP for aprovado, **não partir imediatamente para
Windows/macOS**.

Primeiro:

``` text
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
```

Somente então avançar para:

``` text
Multiple Spaces
Roles
Permissions
Invites
DM
Files
Notifications
Presence
Voice
Video
Screen Share
```

Depois da versão Web estar consolidada:

``` text
LOOP Web
   ↓
Electron
   ├── LOOP for Windows
   └── LOOP for macOS
```

------------------------------------------------------------------------

# PARTE II --- ESPECIFICAÇÃO TÉCNICA COMPLETA E ARQUITETURA DE ESCALA

> Esta parte registra a arquitetura de longo prazo e as funcionalidades
> completas da LOOP.\
> Recursos aqui descritos que ultrapassam o MVP ficam explicitamente
> **congelados até a aprovação do MVP**, salvo quando forem necessários
> para segurança, correção ou funcionamento básico.

## Sumário da especificação técnica completa

  -------------------------------------------------------------------------
  \#   Seção
  ---- --------------------------------------------------------------------
  1    [Visão de produto](#1-visão-de-produto)

  2    [Escopo e não-objetivos](#2-escopo-e-não-objetivos)

  3    [Glossário e modelo de domínio](#3-glossário-e-modelo-de-domínio)

  4    [Arquitetura de sistema](#4-arquitetura-de-sistema)

  5    [Decisões de arquitetura (ADRs)](#5-decisões-de-arquitetura-adrs)

  6    [Estrutura do repositório](#6-estrutura-do-repositório)

  7    [Modelo de dados](#7-modelo-de-dados)

  8    [Identificadores e ordenação](#8-identificadores-e-ordenação)

  9    [Sistema de permissões](#9-sistema-de-permissões)

  10   [API REST](#10-api-rest)

  11   [Gateway de tempo real](#11-gateway-de-tempo-real)

  12   [Ciclo de vida da mensagem](#12-ciclo-de-vida-da-mensagem)

  13   [Presença e estado de leitura](#13-presença-e-estado-de-leitura)

  14   [Voz, vídeo e screen sharing](#14-voz-vídeo-e-screen-sharing)

  15   [Upload e pipeline de mídia](#15-upload-e-pipeline-de-mídia)

  16   [Notificações](#16-notificações)

  17   [Busca](#17-busca)

  18   [Moderação e audit log](#18-moderação-e-audit-log)

  19   [Segurança](#19-segurança)

  20   [Arquitetura de frontend](#20-arquitetura-de-frontend)

  21   [Design system](#21-design-system)

  22   [Plataforma de aplicações em
       canal](#22-plataforma-de-aplicações-em-canal)

  23   [Observabilidade e SLOs](#23-observabilidade-e-slos)

  24   [Estratégia de testes](#24-estratégia-de-testes)

  25   [Infraestrutura, deploy e CI/CD](#25-infraestrutura-deploy-e-cicd)

  26   [Custos e projeção de escala](#26-custos-e-projeção-de-escala)

  27   [Roadmap e critérios de aceite](#27-roadmap-e-critérios-de-aceite)

  28   [Riscos e mitigações](#28-riscos-e-mitigações)

  29   [Anexos](#29-anexos)
  -------------------------------------------------------------------------

------------------------------------------------------------------------

## 1. Visão de produto

### 1.1 Problema

Times criativos e técnicos hoje operam fragmentados entre quatro
ferramentas: Discord (comunicação informal e voz), Slack (comunicação de
trabalho), Notion (documentação) e Teams/Meet (reuniões). O custo dessa
fragmentação não é a assinatura --- é o **contexto perdido**: a decisão
foi tomada na call, registrada em nenhum lugar, referenciada num arquivo
que está no Drive, e a task que saiu dela vive num board que ninguém
abre.

### 1.2 Proposta

Uma plataforma onde o **canal é a unidade de contexto**, não a conversa.
Cada canal carrega abas de aplicação (`Chat`, `Files`, `Tasks`,
`3D Viewer`, `Meetings`, `AI Assistant`) que compartilham o mesmo espaço
de permissões, os mesmos membros e o mesmo histórico. A conversa deixa
de ser um fluxo isolado e passa a ser uma das visões de um espaço de
trabalho.

    ┌──────────────────────────────────────────────────────────┐
    │  # projeto-a                                             │
    │  ┌──────┬───────┬───────┬───────────┬──────────┬───────┐ │
    │  │ Chat │ Files │ Tasks │ 3D Viewer │ Meetings │  AI   │ │
    │  └──────┴───────┴───────┴───────────┴──────────┴───────┘ │
    │   ↑ mesma ACL, mesmos membros, mesmo histórico            │
    └──────────────────────────────────────────────────────────┘

### 1.3 Posicionamento

  ----------------------------------------------------------------------------
  Produto   Força                       Lacuna que exploramos
  --------- --------------------------- --------------------------------------
  Discord   Voz sempre-ativa,           Zero estrutura de trabalho; sem
            comunidade, latência baixa  tasks/docs; permissões rígidas

  Slack     Integrações, threads        Voz fraca, caro por assento, histórico
            maduras                     limitado no free

  Notion    Documentos e bases          Tempo real fraco, sem voz
            estruturadas                

  Teams     Enterprise, compliance      UX pesada, hostil a comunidades
                                        abertas
  ----------------------------------------------------------------------------

**Nossa aposta:** a ergonomia de voz do Discord + a estrutura de
trabalho do Notion, num único modelo de permissões.

### 1.4 Personas

  -------------------------------------------------------------------------
  Persona          Perfil           Necessidade central Métrica de sucesso
  ---------------- ---------------- ------------------- -------------------
  **Juscelio** --- Lidera estúdio   Revisar assets 3D   Reviews concluídas
  Technical Artist de 12 pessoas    sem sair da         dentro da
                                    conversa            plataforma

  **Ana** ---      Coordena 3       Rastrear decisões   Decisões com task
  Product Owner    squads           até a task          vinculada

  **Carlos** ---   Comunidade       Achar informação    Retenção D30
  Membro de        pública de 4k    sem se perder       
  comunidade       membros                              

  **Marcos** ---   Modera           Agir rápido com     Tempo médio até
  Moderador        comunidade       trilha auditável    ação de moderação
  voluntário       grande                               
  -------------------------------------------------------------------------

### 1.5 Princípios de produto

1.  **Tempo real por padrão.** Nenhuma tela exige refresh. Se um dado
    mudou no servidor, ele muda na tela em menos de um segundo.
2.  **Permissão é uma coisa só.** Um único motor de permissões governa
    chat, arquivos, voz e apps. Nada de ACL paralela por feature.
3.  **Otimismo na UI, verdade no servidor.** A ação aparece instantânea;
    o servidor reconcilia e, se recusar, a UI reverte de forma visível.
4.  **Histórico é ativo, não passivo.** Buscar, fixar, referenciar e
    citar são operações de primeira classe.
5.  **Extensível sem fork.** Apps de canal usam SDK público e sandbox
    --- nós mesmos construímos os primeiros apps usando esse SDK.

------------------------------------------------------------------------

## 2. Escopo e não-objetivos

### 2.1 Dentro do escopo

-   Servidores (comunidades), categorias, canais de texto e de voz.
-   Mensageria em tempo real com edição, exclusão, respostas, threads,
    reactions, menções, fixação e busca.
-   Mensagens diretas 1:1 e grupos privados.
-   Sistema de amizades e bloqueio.
-   Cargos, permissões hierárquicas em três níveis (servidor → categoria
    → canal) e overrides por usuário.
-   Voz, vídeo e screen sharing via SFU.
-   Upload de arquivos com armazenamento em object storage e CDN.
-   Presença, notificações in-app, push e e-mail.
-   Moderação (kick, ban, timeout, purge) com audit log imutável.
-   Emojis personalizados por servidor.
-   Plataforma de apps de canal (fase 3).

### 2.2 Fora do escopo (v1)

  ------------------------------------------------------------------------
  Item                      Motivo                      Reavaliar em
  ------------------------- --------------------------- ------------------
  Aplicativo desktop nativo PWA cobre 90% do caso de    Após 5k MAU
  (Electron/Tauri)          uso inicial                 

  Apps mobile nativos       Custo de manutenção de 3    Fase 4
                            clientes                    

  Federação / ActivityPub   Complexidade de moderação   Não planejado
                            distribuída                 

  E2E encryption em canais  Incompatível com busca      Apenas para DMs,
  de servidor               server-side e moderação     fase 4

  Marketplace de bots de    Sem massa crítica           Após plataforma de
  terceiros                                             apps estável

  Monetização (boosts,      Foco em product-market fit  Fase 4
  nitro)                                                

  Compliance SOC2 / HIPAA   Custo desproporcional       Sob demanda
                            pré-receita                 enterprise

  Streaming Go-Live para    SFU→CDN é projeto próprio   Fase 4
  audiência grande                                      
  ------------------------------------------------------------------------

### 2.3 Restrições assumidas

-   Time inicial: 2 a 4 desenvolvedores.
-   Orçamento de infra inicial: até US\$ 300/mês.
-   Meta de latência de mensagem (p95, mesma região): **≤ 250 ms** do
    envio ao recebimento por terceiros.
-   Meta de latência de voz (mouth-to-ear, p95): **≤ 200 ms**.
-   Alvo inicial de escala: **500 usuários simultâneos**, arquitetura
    preparada para 50k sem reescrita estrutural.

------------------------------------------------------------------------

## 3. Glossário e modelo de domínio

### 3.1 Glossário

  -------------------------------------------------------------------------
  Termo           Definição
  --------------- ---------------------------------------------------------
  **Servidor**    Comunidade isolada; unidade de tenancy lógica. Contém
  (guild)         canais, cargos e membros.

  **Categoria**   Agrupador de canais; carrega overrides de permissão
                  herdados pelos filhos.

  **Canal**       Espaço de conversa. Tipos: `text`, `voice`,
                  `announcement`, `forum`, `stage`.

  **Membro**      Relação entre usuário e servidor. Carrega apelido, cargos
                  e data de entrada.

  **Cargo**       Conjunto nomeado de permissões, com cor e posição
  (role)          hierárquica.

  **Override**    Permissão de allow/deny aplicada a um cargo ou usuário
                  num canal/categoria específico.

  **Thread**      Canal efêmero filho de uma mensagem, com lista de
                  participantes própria.

  **Presença**    Estado volátil de conexão do usuário: `online`, `idle`,
                  `dnd`, `offline`.

  **Sessão**      Uma conexão WebSocket ativa. Um usuário pode ter N
                  sessões.

  **App de        Extensão que renderiza uma aba dentro de um canal, em
  canal**         sandbox.

  **Snowflake**   ID de 64 bits ordenável por tempo, usado como PK de
                  entidades de alto volume.
  -------------------------------------------------------------------------

### 3.2 Diagrama de entidades (ER simplificado)

                        ┌──────────┐
                        │  users   │
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

### 3.3 Invariantes de domínio

Regras que o sistema **nunca** pode violar, verificadas por constraint
de banco sempre que possível:

1.  Todo servidor tem exatamente um `owner_id` válido e ao menos um
    canal de texto.
2.  Todo servidor tem um cargo `@everyone` com `position = 0`, não
    deletável e não removível de nenhum membro.
3.  Um membro não pode receber um cargo de posição ≥ à sua posição mais
    alta (exceto o owner).
4.  Uma mensagem não pode ter `reply_to` apontando para outro canal.
5.  `deleted_at` preenchido implica que o `content` foi apagado
    (tombstone preserva apenas metadados).
6.  Um usuário banido não pode existir em `server_members` do mesmo
    servidor.
7.  Um canal de voz não pode conter `messages` de tipo `default` se
    `type = 'voice'` e o chat de voz estiver desabilitado.
8.  `member_roles` só pode referenciar cargos do mesmo `server_id` do
    membro.

------------------------------------------------------------------------

## 4. Arquitetura de sistema

### 4.1 Visão macro

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

### 4.2 Responsabilidade de cada serviço

  -------------------------------------------------------------------------------
  Serviço          Responsabilidade                         Escala
  ---------------- ---------------------------------------- ---------------------
  **API Server**   CRUD, autenticação, autorização,         Horizontal, stateless
                   validação, emissão de eventos            

  **Gateway**      Conexões WebSocket, fan-out de eventos,  Horizontal, sticky
                   heartbeat, presença                      por sessão

  **PostgreSQL**   Fonte de verdade. Tudo que precisa       Vertical + read
                   sobreviver a restart                     replicas

  **Redis**        Cache de permissões, presença, rate      Cluster quando
                   limit, pub/sub entre nós                 necessário

  **Workers**      Jobs assíncronos: thumbnails, push,      Horizontal por fila
                   e-mail, expurgo, indexação               

  **LiveKit**      SFU de áudio/vídeo/screen share          Gerenciado (cloud) →
                                                            self-hosted

  **R2**           Blobs: anexos, avatares, banners, emojis Gerenciado
  -------------------------------------------------------------------------------

**Regra de ouro:** a API **nunca** envia mensagem direto ao cliente. Ela
persiste no Postgres e publica no Redis pub/sub; o Gateway consome e faz
o fan-out. Isso mantém API e Gateway independentemente escaláveis e
permite reiniciar a API sem derrubar conexões.

### 4.3 Fluxo de uma mensagem (end-to-end)

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

Orçamento de latência p95 (mesma região): passos 2--9 ≈ 40 ms, passos
11--13 ≈ 25 ms, rede ≈ 60 ms. Sobra folga confortável dentro dos 250 ms
alvo.

### 4.4 Dois caminhos de implementação

O documento original sugere duas trilhas. Ambas são válidas --- a
escolha depende do horizonte.

#### Trilha A --- MVP acelerado (Next.js + Supabase)

    Next.js (App Router + Server Actions)
       └─ Supabase: Postgres + Auth + Realtime + Storage + RLS
       └─ LiveKit Cloud para voz

  -----------------------------------------------------------------------
  Prós                        Contras
  --------------------------- -------------------------------------------
  Auth, realtime e storage    Realtime do Supabase é por tabela/linha,
  prontos no dia 1            não por evento de domínio

  RLS dá segurança no nível   Permissões complexas em RLS ficam lentas e
  do banco                    difíceis de testar

  Time de 1--2 devs entrega   Fan-out para 10k conexões vira caro rápido
  em semanas                  

  Custo inicial próximo de    Migração posterior é reescrita do gateway
  zero                        
  -----------------------------------------------------------------------

#### Trilha B --- Arquitetura própria (NestJS + Gateway dedicado)

  -----------------------------------------------------------------------
  Prós                            Contras
  ------------------------------- ---------------------------------------
  Controle total do protocolo de  3--4 semanas a mais até a primeira
  eventos                         mensagem trafegar

  Fan-out otimizado, permissões   Precisa gerenciar Redis, sessões,
  em memória                      deploy de WS

  Custo por conexão muito menor   Exige mais maturidade de infra
  em escala                       
  -----------------------------------------------------------------------

#### Recomendação

**Trilha híbrida.** Postgres gerenciado (Supabase ou Neon) como banco,
mas **gateway WebSocket próprio desde o início**. Motivo: o banco é
fácil de trocar depois; o protocolo de tempo real, não. Usar Supabase
Realtime na fase 1 e migrar na fase 2 significa reescrever a camada de
sincronização do cliente inteiro --- exatamente a parte mais frágil e
mais testada do sistema.

O que **sim** vale terceirizar desde o início: autenticação (Supabase
Auth ou Auth.js), storage (R2), e SFU (LiveKit Cloud).

------------------------------------------------------------------------

## 5. Decisões de arquitetura (ADRs)

### ADR-001 --- Snowflake IDs em vez de UUIDv4

**Contexto.** Mensagens são a entidade de maior volume e sempre
consultadas por ordem cronológica dentro de um canal.

**Decisão.** IDs de 64 bits no formato snowflake (timestamp + worker +
sequência), armazenados como `BIGINT` e serializados como string em
JSON.

**Consequências.** Índice B-tree com inserção sempre à direita (sem page
splits aleatórios), paginação por cursor sem coluna extra, timestamp
extraível do próprio ID, 8 bytes contra 16 do UUID. Custo: precisa de um
gerador coordenado (worker id por processo) e JavaScript não representa
64 bits com precisão --- daí a serialização como string.

**Alternativa rejeitada.** UUIDv7 resolveria a ordenação, mas mantém 16
bytes e não carrega o worker id, útil para depurar origem.

------------------------------------------------------------------------

### ADR-002 --- Permissões como bitfield de 64 bits

**Contexto.** Cada render de canal, cada evento de fan-out e cada
requisição precisa de checagem de permissão. Em fan-out para 5k membros,
são 5k checagens por mensagem.

**Decisão.** Permissões representadas como bits em `BIGINT`. Resolução
final = `OR` dos cargos, seguido de aplicação sequencial de overrides
(`&= ~deny`, `|= allow`).

**Consequências.** Checagem vira uma operação de CPU
(`(perms & PERM) != 0`), cacheável em Redis como um único inteiro por
(usuário, canal). Custo: 64 permissões é um teto real --- reservar bits
com parcimônia e planejar `permissions_v2` como segundo bitfield se
necessário.

------------------------------------------------------------------------

### ADR-003 --- Gateway separado da API

**Contexto.** Deploy de API é frequente; derrubar 5k WebSockets a cada
deploy é inaceitável.

**Decisão.** Processos separados, comunicação via Redis pub/sub.

**Consequências.** Deploy independente, escala independente (API é
CPU-bound, Gateway é memória/conexão-bound). Custo: um hop a mais na
latência (\~5 ms) e a necessidade de garantir entrega ao menos uma vez
com dedupe no cliente.

------------------------------------------------------------------------

### ADR-004 --- Soft delete com tombstone para mensagens

**Contexto.** Deletar fisicamente quebra `reply_to`, contadores de
thread e coerência do audit log.

**Decisão.** `deleted_at` marcado, `content` sobrescrito com string
vazia, anexos removidos do storage por job assíncrono. A linha
permanece.

**Consequências.** Respostas continuam resolvendo ("mensagem apagada"),
moderação mantém a trilha. Custo: crescimento da tabela --- mitigado por
particionamento e por expurgo definitivo após 90 dias.

------------------------------------------------------------------------

### ADR-005 --- Threads como canais, não como coleção de mensagens

**Contexto.** Threads precisam de leitura própria, notificação própria,
permissão própria e lista de participantes.

**Decisão.** Uma thread é uma linha em `channels` com `parent_id` e
`type = 'thread'`.

**Consequências.** Todo o maquinário de canal (permissões, unread,
busca, fan-out) funciona sem código novo. Custo: `channels` cresce muito
mais rápido; exige arquivamento automático de threads inativas.

------------------------------------------------------------------------

### ADR-006 --- Postgres FTS antes de Elasticsearch

**Contexto.** Busca com filtros (`from:`, `in:`, `before:`) sobre
milhões de mensagens.

**Decisão.** `tsvector` com índice GIN, coluna gerada, no próprio
Postgres.

**Consequências.** Zero infra adicional, consistência transacional
imediata, suporte nativo a português. Custo: ranking inferior ao ES e
degradação acima de \~50M mensagens. Reavaliar naquele ponto --- a
interface de busca já é abstraída atrás de `SearchProvider` para
permitir a troca.

------------------------------------------------------------------------

### ADR-007 --- SFU gerenciado (LiveKit Cloud) em vez de mesh WebRTC

**Contexto.** WebRTC peer-to-peer em malha exige de cada cliente `N-1`
uploads. Com 8 participantes, são 7 streams de upload --- inviável em
conexão doméstica.

**Decisão.** SFU desde o primeiro dia. LiveKit Cloud enquanto o volume
for baixo, self-hosted quando o custo por minuto justificar.

## **Consequências.** Upload constante de 1 stream por cliente independentemente do tamanho da sala, simulcast e degradação adaptativa de graça, gravação e transcrição disponíveis. Custo: dependência de terceiro e custo por participante-minuto.

## 6. Estrutura do repositório

Monorepo com pnpm workspaces + Turborepo.

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

**Regra de dependência:** `apps/*` pode importar de `packages/*`;
`packages/*` nunca importa de `apps/*`. Tipos de domínio e constantes de
permissão vivem exclusivamente em `packages/shared` --- servidor e
cliente compartilham a mesma definição, eliminando divergência de
bitfield.

------------------------------------------------------------------------

## 7. Modelo de dados

PostgreSQL 16. DDL abaixo é a fonte de verdade; migrations geradas por
Drizzle Kit.

### 7.1 Convenções

-   IDs de alto volume: `BIGINT` (snowflake). IDs de baixo volume:
    `UUID`.
-   Timestamps: `TIMESTAMPTZ`, sempre UTC.
-   Soft delete: `deleted_at TIMESTAMPTZ NULL`.
-   Nomes de tabela no plural, colunas em `snake_case`.
-   Toda FK tem índice explícito.
-   `ON DELETE CASCADE` apenas onde o filho não faz sentido sem o pai.

### 7.2 Usuários e autenticação

``` sql
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

### 7.3 Servidores, membros e cargos

``` sql
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

> **Nota sobre a invariante 8.** A FK composta `(server_id, user_id)`
> garante que o membro existe no servidor, mas não que o `role_id`
> pertence ao mesmo servidor. Isso exige ou uma UNIQUE em
> `roles (id, server_id)` com FK composta `(role_id, server_id)`, ou um
> trigger. Recomenda-se a primeira:
>
> ``` sql
> ALTER TABLE roles ADD CONSTRAINT roles_id_server_uniq UNIQUE (id, server_id);
> ALTER TABLE member_roles ADD CONSTRAINT member_roles_role_server_fk
>   FOREIGN KEY (role_id, server_id) REFERENCES roles(id, server_id) ON DELETE CASCADE;
> ```

### 7.4 Categorias, canais e overrides

``` sql
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

### 7.5 Mensagens

``` sql
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

### 7.6 Estado de leitura, DMs e amizades

``` sql
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

> **Nota de modelagem.** Amizade é simétrica, mas bloqueio é direcional.
> A chave `(requester_id, addressee_id)` permite que A bloqueie B sem
> que B bloqueie A. Toda consulta de "meus amigos" precisa varrer os
> dois lados --- encapsular numa view:
>
> ``` sql
> CREATE VIEW friends_of AS
>   SELECT requester_id AS user_id, addressee_id AS friend_id FROM friendships WHERE status = 1
>   UNION ALL
>   SELECT addressee_id, requester_id FROM friendships WHERE status = 1;
> ```

### 7.7 Convites, banimentos, emojis, notificações e auditoria

``` sql
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

### 7.8 Estratégia de particionamento e retenção

  ------------------------------------------------------------------------------
  Tabela            Estratégia                 Retenção
  ----------------- -------------------------- ---------------------------------
  `messages`        Partição por range de      Indefinida; partições antigas em
                    snowflake, mensal          tablespace frio

  `audit_logs`      Partição trimestral        2 anos

  `notifications`   Sem partição               Lidas: 30 dias; não lidas: 180
                                               dias

  `sessions`        Sem partição               Expiradas removidas diariamente

  `attachments`     Segue `messages`           Blob apagado 30 dias após soft
                                               delete da mensagem
  ------------------------------------------------------------------------------

Job `partition-manager` cria as partições do mês seguinte com 7 dias de
antecedência e falha ruidosamente se não conseguir --- partição faltante
é incidente P1 (todo INSERT de mensagem falha).

------------------------------------------------------------------------

## 8. Identificadores e ordenação

### 8.1 Layout do snowflake

     63                    22        17        12                  0
     ┌─────────────────────┬─────────┬─────────┬───────────────────┐
     │   timestamp (42b)   │ dc (5b) │ wkr(5b) │   sequence (12b)  │
     └─────────────────────┴─────────┴─────────┴───────────────────┘
       ms desde EPOCH        0-31      0-31        0-4095 por ms

-   **EPOCH:** `2026-01-01T00:00:00Z` (`1767225600000`).
-   **Capacidade:** 4.096 IDs por milissegundo por worker · 1.024
    workers = 4,2M IDs/ms teóricos.
-   **Vida útil:** 42 bits ≈ 139 anos a partir do epoch.

``` ts
// packages/shared/src/snowflake.ts
const EPOCH = 1767225600000n;

export class SnowflakeGenerator {
  private lastMs = -1n;
  private seq = 0n;

  constructor(
    private dc: bigint,
    private worker: bigint,
  ) {
    if (dc > 31n || worker > 31n) throw new Error("dc/worker fora do range");
  }

  next(): bigint {
    let now = BigInt(Date.now());
    if (now < this.lastMs) {
      // relógio andou para trás: espera em vez de emitir ID duplicado
      throw new ClockDriftError(`drift de ${this.lastMs - now}ms`);
    }
    if (now === this.lastMs) {
      this.seq = (this.seq + 1n) & 0xfffn;
      if (this.seq === 0n) {
        while (BigInt(Date.now()) <= now) {}
        now = BigInt(Date.now());
      }
    } else {
      this.seq = 0n;
    }
    this.lastMs = now;
    return (
      ((now - EPOCH) << 22n) |
      (this.dc << 17n) |
      (this.worker << 12n) |
      this.seq
    );
  }
}

export const timestampOf = (id: bigint) =>
  new Date(Number((id >> 22n) + EPOCH));
```

**Cuidado crítico com JSON.** `Number.MAX_SAFE_INTEGER` é 2⁵³−1; um
snowflake tem 63 bits significativos. Serializar como número **corrompe
silenciosamente o ID**. Toda serialização usa string:

``` ts
// interceptor global NestJS
JSON.stringify(obj, (_, v) => (typeof v === "bigint" ? v.toString() : v));
```

### 8.2 Paginação por cursor

Nunca usar `OFFSET` em mensagens --- o custo cresce linearmente e o
resultado é instável sob escrita concorrente.

``` sql
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

------------------------------------------------------------------------

## 9. Sistema de permissões

Esta é a peça mais delicada do sistema. Um bug aqui vaza mensagem
privada; erre para o lado do `deny`.

### 9.1 Catálogo de permissões

``` ts
export const Permissions = {
  // --- Geral (bits 0–9)
  VIEW_CHANNEL: 1n << 0n,
  MANAGE_CHANNELS: 1n << 1n,
  MANAGE_ROLES: 1n << 2n,
  MANAGE_SERVER: 1n << 3n,
  MANAGE_EMOJIS: 1n << 4n,
  VIEW_AUDIT_LOG: 1n << 5n,
  CREATE_INVITE: 1n << 6n,
  MANAGE_INVITES: 1n << 7n,
  CHANGE_NICKNAME: 1n << 8n,
  MANAGE_NICKNAMES: 1n << 9n,

  // --- Membros (10–14)
  KICK_MEMBERS: 1n << 10n,
  BAN_MEMBERS: 1n << 11n,
  TIMEOUT_MEMBERS: 1n << 12n,
  MOVE_MEMBERS: 1n << 13n,
  VIEW_MEMBER_LIST: 1n << 14n,

  // --- Texto (15–27)
  SEND_MESSAGES: 1n << 15n,
  SEND_IN_THREADS: 1n << 16n,
  CREATE_THREADS: 1n << 17n,
  MANAGE_THREADS: 1n << 18n,
  EMBED_LINKS: 1n << 19n,
  ATTACH_FILES: 1n << 20n,
  ADD_REACTIONS: 1n << 21n,
  USE_EXTERNAL_EMOJIS: 1n << 22n,
  MENTION_EVERYONE: 1n << 23n,
  MANAGE_MESSAGES: 1n << 24n,
  READ_MESSAGE_HISTORY: 1n << 25n,
  PIN_MESSAGES: 1n << 26n,
  SEND_TTS_MESSAGES: 1n << 27n,

  // --- Voz (28–36)
  CONNECT: 1n << 28n,
  SPEAK: 1n << 29n,
  STREAM: 1n << 30n,
  USE_VIDEO: 1n << 31n,
  MUTE_MEMBERS: 1n << 32n,
  DEAFEN_MEMBERS: 1n << 33n,
  USE_VAD: 1n << 34n, // voice activity detection
  PRIORITY_SPEAKER: 1n << 35n,
  REQUEST_TO_SPEAK: 1n << 36n,

  // --- Apps de canal (37–41)
  USE_APPS: 1n << 37n,
  MANAGE_APPS: 1n << 38n,
  MANAGE_TASKS: 1n << 39n,
  MANAGE_FILES: 1n << 40n,
  START_MEETING: 1n << 41n,

  // --- Administração (63)
  ADMINISTRATOR: 1n << 63n,
} as const;

export const DEFAULT_EVERYONE =
  Permissions.VIEW_CHANNEL |
  Permissions.SEND_MESSAGES |
  Permissions.READ_MESSAGE_HISTORY |
  Permissions.ADD_REACTIONS |
  Permissions.EMBED_LINKS |
  Permissions.ATTACH_FILES |
  Permissions.CONNECT |
  Permissions.SPEAK |
  Permissions.USE_VAD |
  Permissions.CREATE_INVITE |
  Permissions.CHANGE_NICKNAME |
  Permissions.VIEW_MEMBER_LIST |
  Permissions.CREATE_THREADS |
  Permissions.SEND_IN_THREADS |
  Permissions.USE_APPS;
```

**Bits 42--62 reservados.** Não realocar bits já publicados ---
permissões persistidas em `roles.permissions` quebrariam.

### 9.2 Algoritmo de resolução

Ordem de precedência, do mais fraco ao mais forte:

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

``` ts
export function resolvePermissions(ctx: PermCtx): bigint {
  const { server, member, roles, category, channel } = ctx;

  if (server.ownerId === member.userId) return ALL_PERMISSIONS;

  let perms = roles.everyone.permissions;
  for (const r of roles.assigned) perms |= r.permissions;

  if (perms & Permissions.ADMINISTRATOR) return ALL_PERMISSIONS;

  const memberRoleIds = new Set(roles.assigned.map((r) => r.id));

  const applyScope = (ovs: Override[]) => {
    // 1) @everyone
    const ev = ovs.find(
      (o) => o.targetType === 0 && o.targetId === roles.everyone.id,
    );
    if (ev) {
      perms &= ~ev.deny;
      perms |= ev.allow;
    }

    // 2) cargos do membro — acumula antes de aplicar (allow vence deny entre cargos)
    let allow = 0n,
      deny = 0n;
    for (const o of ovs) {
      if (o.targetType === 0 && memberRoleIds.has(o.targetId)) {
        allow |= o.allow;
        deny |= o.deny;
      }
    }
    perms &= ~deny;
    perms |= allow;

    // 3) usuário específico
    const u = ovs.find(
      (o) => o.targetType === 1 && o.targetId === member.userId,
    );
    if (u) {
      perms &= ~u.deny;
      perms |= u.allow;
    }
  };

  if (category) applyScope(category.overrides);
  if (channel) applyScope(channel.overrides);

  if (member.timeoutUntil && member.timeoutUntil > new Date()) {
    perms &= Permissions.VIEW_CHANNEL | Permissions.READ_MESSAGE_HISTORY;
  }
  return perms;
}
```

**Detalhe que mais causa bug:** dentro de um mesmo escopo, os `deny` e
`allow` de *todos* os cargos são acumulados **antes** de serem
aplicados. Se você aplicar cargo a cargo em sequência, um `deny` do
cargo Membro pode sobrescrever um `allow` do cargo Moderador dependendo
apenas da ordem de iteração --- comportamento não determinístico e
impossível de explicar ao usuário.

### 9.3 Regras de hierarquia

Independentes do bitfield:

  -----------------------------------------------------------------------
  Ação                          Regra
  ----------------------------- -----------------------------------------
  Editar/deletar cargo          `maxPosition(ator) > role.position`

  Atribuir cargo                `maxPosition(ator) > role.position`

  Kick / ban / timeout          `maxPosition(ator) > maxPosition(alvo)`

  Alterar apelido de outro      `maxPosition(ator) > maxPosition(alvo)`

  Qualquer ação sobre o owner   Proibida, sempre

  Transferir propriedade        Apenas owner, com confirmação por MFA
  -----------------------------------------------------------------------

O owner ignora todas as regras acima dentro do próprio servidor. Nenhum
não-owner consegue se elevar acima da própria posição máxima --- isso
previne escalada de privilégio via `MANAGE_ROLES`.

### 9.4 Cache

    Chave:   perm:{userId}:{channelId}    Valor: bitfield  TTL: 300s
    Chave:   perm:ver:{serverId}          Valor: contador  (bump invalida tudo)

A chave real inclui a versão: `perm:{ver}:{userId}:{channelId}`.
Qualquer mudança em cargos, membros ou overrides do servidor incrementa
`perm:ver:{serverId}` --- invalidação O(1) sem varrer chaves. Custo:
cache miss em massa após cada alteração de permissão, aceitável porque a
resolução é barata (\~2 ms com os dados do servidor já em cache local do
processo).

### 9.5 Testes obrigatórios

O módulo de permissões tem cobertura exigida de 100% em branch. Casos
mínimos:

-   `@everyone` nega `VIEW_CHANNEL` no canal, mas cargo Moderador
    permite → **vê**.
-   Override de usuário nega `SEND_MESSAGES`, cargo Admin permite →
    **não envia** (usuário é mais específico).
-   Membro com `ADMINISTRATOR` e override de canal negando tudo → **vê
    tudo** (admin curto-circuita).
-   Categoria nega `CONNECT`, canal permite → **conecta** (canal vence
    categoria).
-   Membro em timeout com `ADMINISTRATOR` → **admin curto-circuita antes
    do timeout**; decidir explicitamente e documentar (recomendação:
    timeout não se aplica a admins, mas se aplica ao owner? Não ---
    owner é intocável).
-   Dois cargos, um nega e outro permite `ATTACH_FILES` no mesmo canal →
    **permite** (allow acumulado vence).

------------------------------------------------------------------------

## 10. API REST

### 10.1 Convenções

-   Base: `https://api.factory.app/v1`
-   Autenticação: `Authorization: Bearer <access_token>` (JWT, 15 min) +
    refresh token em cookie `HttpOnly; Secure; SameSite=Lax`.
-   Todo ID trafega como **string**.
-   Datas em ISO-8601 UTC.
-   `Idempotency-Key` aceito em todos os POST que criam recurso.
-   Erros seguem RFC 7807 estendido.

``` jsonc
// 403
{
  "type": "https://docs.factory.app/errors/missing-permissions",
  "title": "Permissões insuficientes",
  "status": 403,
  "code": 50013,
  "detail": "Falta SEND_MESSAGES em #anuncios",
  "instance": "/v1/channels/7108.../messages",
  "meta": { "required": ["SEND_MESSAGES"], "channelId": "7108..." },
}
```

  Código   HTTP   Significado
  -------- ------ -------------------------------------------
  0        500    Erro interno
  10003    404    Canal desconhecido
  10008    404    Mensagem desconhecida
  20016    429    Slowmode ativo
  30003    400    Limite de reactions atingido
  40001    401    Não autorizado
  40002    403    Conta não verificada
  50001    403    Sem acesso ao recurso
  50013    403    Permissões insuficientes
  50035    400    Corpo inválido (com `errors[]` por campo)

### 10.2 Rotas

```{=html}
<details>
```
```{=html}
<summary>
```
`<b>`{=html}Autenticação`</b>`{=html}
```{=html}
</summary>
```
  ---------------------------------------------------------------------------
  Método   Rota                         Descrição
  -------- ---------------------------- -------------------------------------
  POST     `/auth/register`             Cria conta; dispara e-mail de
                                        verificação

  POST     `/auth/login`                Retorna access + refresh; exige MFA
                                        se ativo

  POST     `/auth/refresh`              Rotaciona refresh token (detecção de
                                        reuso)

  POST     `/auth/logout`               Revoga sessão atual

  POST     `/auth/logout-all`           Revoga todas as sessões

  GET      `/auth/sessions`             Lista sessões ativas

  POST     `/auth/mfa/enable`           Retorna QR TOTP + códigos de
                                        recuperação

  POST     `/auth/password/forgot` ·    Fluxo de recuperação
           `/reset`                     

  GET      `/auth/oauth/:provider`      Redireciona para o provedor
  ---------------------------------------------------------------------------

```{=html}
</details>
```
```{=html}
<details>
```
```{=html}
<summary>
```
`<b>`{=html}Usuários e relações`</b>`{=html}
```{=html}
</summary>
```
  Método   Rota                       Descrição
  -------- -------------------------- ----------------------------------
  GET      `/users/@me`               Perfil próprio completo
  PATCH    `/users/@me`               Atualiza perfil
  GET      `/users/:id`               Perfil público
  GET      `/users/@me/servers`       Servidores do usuário
  GET      `/users/@me/channels`      Canais de DM
  POST     `/users/@me/channels`      Abre DM ou cria group DM
  GET      `/users/@me/friends`       Lista com estado
  POST     `/users/@me/friends`       Envia solicitação por `username`
  PUT      `/users/@me/friends/:id`   Aceita
  DELETE   `/users/@me/friends/:id`   Remove ou recusa
  PUT      `/users/@me/blocks/:id`    Bloqueia

```{=html}
</details>
```
```{=html}
<details>
```
```{=html}
<summary>
```
`<b>`{=html}Servidores`</b>`{=html}
```{=html}
</summary>
```
  ------------------------------------------------------------------------------------
  Método                  Rota                               Permissão
  ----------------------- ---------------------------------- -------------------------
  POST                    `/servers`                         ---

  GET                     `/servers/:id`                     `VIEW_CHANNEL` em algum
                                                             canal

  PATCH                   `/servers/:id`                     `MANAGE_SERVER`

  DELETE                  `/servers/:id`                     owner + MFA

  GET                     `/servers/:id/members`             `VIEW_MEMBER_LIST`
                                                             (paginado)

  GET                     `/servers/:id/members/search?q=`   `VIEW_MEMBER_LIST`

  PATCH                   `/servers/:id/members/:userId`     varia por campo

  DELETE                  `/servers/:id/members/:userId`     `KICK_MEMBERS`

  PUT                     `/servers/:id/bans/:userId`        `BAN_MEMBERS`

  DELETE                  `/servers/:id/bans/:userId`        `BAN_MEMBERS`

  GET/POST/PATCH/DELETE   `/servers/:id/roles[/:roleId]`     `MANAGE_ROLES`

  PATCH                   `/servers/:id/roles`               reordenação em lote

  GET                     `/servers/:id/audit-logs`          `VIEW_AUDIT_LOG`

  GET/POST/DELETE         `/servers/:id/emojis[/:emojiId]`   `MANAGE_EMOJIS`

  POST                    `/servers/:id/leave`               ---
  ------------------------------------------------------------------------------------

```{=html}
</details>
```
```{=html}
<details>
```
```{=html}
<summary>
```
`<b>`{=html}Canais e mensagens`</b>`{=html}
```{=html}
</summary>
```
  -------------------------------------------------------------------------------------------
  Método     Rota                                                     Notas
  ---------- -------------------------------------------------------- -----------------------
  POST       `/servers/:id/channels`                                  `MANAGE_CHANNELS`

  PATCH ·    `/channels/:id`                                          `MANAGE_CHANNELS`
  DELETE                                                              

  PUT ·      `/channels/:id/permissions/:targetId`                    `MANAGE_ROLES`
  DELETE                                                              

  GET        `/channels/:id/messages?before=&after=&around=&limit=`   máx. 100

  POST       `/channels/:id/messages`                                 body ou
                                                                      `multipart/form-data`

  PATCH      `/channels/:id/messages/:msgId`                          apenas autor

  DELETE     `/channels/:id/messages/:msgId`                          autor ou
                                                                      `MANAGE_MESSAGES`

  POST       `/channels/:id/messages/bulk-delete`                     2--100 msgs, \< 14 dias

  PUT ·      `/channels/:id/messages/:msgId/reactions/:emoji/@me`     
  DELETE                                                              

  GET        `/channels/:id/messages/:msgId/reactions/:emoji`         quem reagiu

  PUT ·      `/channels/:id/pins/:msgId`                              `PIN_MESSAGES`, máx. 50
  DELETE                                                              

  POST       `/channels/:id/typing`                                   dispara evento efêmero

  POST       `/channels/:id/messages/:msgId/threads`                  `CREATE_THREADS`

  POST       `/channels/:id/voice-token`                              `CONNECT` → token
                                                                      LiveKit
  -------------------------------------------------------------------------------------------

```{=html}
</details>
```
```{=html}
<details>
```
```{=html}
<summary>
```
`<b>`{=html}Convites, uploads e busca`</b>`{=html}
```{=html}
</summary>
```
  ---------------------------------------------------------------------------------------------------
  Método   Rota                                                                 Notas
  -------- -------------------------------------------------------------------- ---------------------
  POST     `/channels/:id/invites`                                              `CREATE_INVITE`

  GET      `/invites/:code`                                                     Público; preview do
                                                                                servidor

  POST     `/invites/:code`                                                     Aceita e entra

  DELETE   `/invites/:code`                                                     `MANAGE_INVITES`

  POST     `/uploads/sign`                                                      Retorna URL presigned

  POST     `/uploads/complete`                                                  Confirma e dispara
                                                                                processamento

  GET      `/search?q=&server_id=&channel_id=&author_id=&before=&after=&has=`   
  ---------------------------------------------------------------------------------------------------

```{=html}
</details>
```
### 10.3 Rate limits

Bucket por rota + escopo, `GCRA` implementado em Lua no Redis.

  ---------------------------------------------------------------------------
  Escopo                          Limite                  Janela
  ------------------------------- ----------------------- -------------------
  Global por usuário              50 req                  1 s

  Global por IP (não autenticado) 20 req                  1 s

  `POST /channels/:id/messages`   5 msgs                  5 s

  Slowmode do canal               `rate_limit_per_user`   por canal

  `POST /auth/login`              5                       15 min por
                                                          IP+e-mail

  `POST /servers`                 10                      24 h

  Reactions                       1                       0,25 s

  Upload                          500 MB                  1 h

  Busca                           10                      1 min
  ---------------------------------------------------------------------------

Cabeçalhos em toda resposta: `X-RateLimit-Limit`,
`X-RateLimit-Remaining`, `X-RateLimit-Reset`, `X-RateLimit-Bucket`; em
429 também `Retry-After`.

------------------------------------------------------------------------

## 11. Gateway de tempo real

### 11.1 Protocolo

Conexão: `wss://gateway.factory.app/?v=1&encoding=json` (`zlib-stream`
opcional).

Todo frame:

``` jsonc
{ "op": 0, "t": "MESSAGE_CREATE", "s": 42, "d": {} }
```

  ---------------------------------------------------------------------------
  op   Nome                 Direção   Uso
  ---- -------------------- --------- ---------------------------------------
  0    DISPATCH             S→C       Evento de domínio (`t` preenchido)

  1    HEARTBEAT            C→S       Keep-alive

  2    IDENTIFY             C→S       Autentica e inicia sessão

  3    PRESENCE_UPDATE      C→S       Muda status

  4    VOICE_STATE_UPDATE   C→S       Entra/sai de canal de voz

  6    RESUME               C→S       Retoma sessão após queda

  7    RECONNECT            S→C       Servidor pede reconexão

  9    INVALID_SESSION      S→C       Sessão morta; re-identifique

  10   HELLO                S→C       Envia `heartbeat_interval`

  11   HEARTBEAT_ACK        S→C       Confirma heartbeat

  12   SUBSCRIBE            C→S       Assina lista de membros / canal lazy
  ---------------------------------------------------------------------------

### 11.2 Handshake

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

Payload de `READY`:

``` jsonc
{
  "v": 1,
  "session_id": "a1b2c3",
  "resume_url": "wss://gateway-3.factory.app",
  "user": {},
  "servers": [{ "id": "710...", "unavailable": true }],
  "private_channels": [],
  "read_states": [],
  "relationships": [],
}
```

Servidores chegam como `unavailable: true` e são hidratados por
`SERVER_CREATE` subsequentes --- a UI pinta o esqueleto imediatamente em
vez de esperar o payload completo.

### 11.3 Catálogo de eventos

  ---------------------------------------------------------------------------
  Evento                        Quando              Destinatários
  ----------------------------- ------------------- -------------------------
  `READY`                       Após IDENTIFY       Sessão

  `RESUMED`                     Após RESUME         Sessão

  `SERVER_CREATE` / `UPDATE` /  Entrou/mudou/saiu   Membros
  `DELETE`                                          

  `CHANNEL_CREATE` / `UPDATE` / CRUD de canal       Quem tem `VIEW_CHANNEL`
  `DELETE`                                          

  `MESSAGE_CREATE` / `UPDATE` / CRUD de mensagem    Inscritos no canal
  `DELETE`                                          

  `MESSAGE_BULK_DELETE`         Purge               Inscritos

  `MESSAGE_REACTION_ADD` /      Reaction            Inscritos
  `REMOVE`                                          

  `TYPING_START`                Digitando (TTL 8 s) Inscritos

  `MEMBER_ADD` / `UPDATE` /     Membro              Membros do servidor
  `REMOVE`                                          

  `MEMBER_CHUNK`                Resposta a          Sessão
                                SUBSCRIBE           

  `ROLE_CREATE` / `UPDATE` /    Cargos              Membros (invalida cache
  `DELETE`                                          de perms)

  `PRESENCE_UPDATE`             Status              Amigos + servidores em
                                                    comum

  `VOICE_STATE_UPDATE`          Entrou/mutou/saiu   Membros do servidor

  `VOICE_SERVER_UPDATE`         Credencial SFU      Sessão

  `THREAD_CREATE` / `UPDATE`    Threads             Inscritos no pai

  `APP_EVENT`                   App de canal emitiu Inscritos com `USE_APPS`

  `NOTIFICATION_CREATE`         Notificação         Sessões do usuário
  ---------------------------------------------------------------------------

### 11.4 Fan-out

O ponto de custo do sistema. Ingênuo: para cada mensagem, buscar membros
do servidor, checar permissão, enviar. Num servidor de 10k membros com
20 msgs/s isso é 200k checagens por segundo.

Estratégia adotada --- **subscrição lazy por canal**:

1.  O cliente só recebe eventos de canais que está efetivamente
    renderizando (canal aberto + canais com badge de não lido).
2.  O Gateway mantém em memória `Map<channelId, Set<sessionId>>`.
3.  Na publicação, o fan-out itera apenas as sessões inscritas.
4.  A permissão `VIEW_CHANNEL` é verificada **no momento da inscrição**
    e revalidada quando `perm:ver:{serverId}` muda.

``` ts
async function fanout(channelId: string, event: GatewayEvent) {
  const sessions = subscriptions.get(channelId);
  if (!sessions?.size) return;

  const payload = encodeOnce(event); // serializa 1×, envia N×
  const version = await permVersion(event.serverId);

  for (const sid of sessions) {
    const s = sessions_.get(sid);
    if (!s) {
      sessions.delete(sid);
      continue;
    }
    if (s.permVersion !== version && !(await revalidate(s, channelId)))
      continue;
    s.ws.send(payload); // uWS: backpressure automático
  }
}
```

**Otimizações mensuráveis:** serializar o payload uma única vez
economiza \~70% de CPU em canais grandes; `uWebSockets.js` suporta \~5×
mais conexões por processo que `ws`; publicar via Redis com
`MESSAGE_CREATE` já contendo o objeto completo evita round-trip ao
Postgres no Gateway.

### 11.5 Reconexão e garantia de entrega

-   Cada sessão mantém um buffer circular dos últimos 250 eventos com
    número de sequência `s`.
-   Ao cair, o cliente reconecta em `resume_url` e envia
    `op:6 RESUME { session_id, seq }`.
-   Se `seq` ainda está no buffer → replay dos eventos faltantes →
    `RESUMED`.
-   Se não está (queda longa) → `op:9 INVALID_SESSION` → `IDENTIFY`
    completo + refetch de mensagens desde `last_read_message_id`.
-   Backoff exponencial com jitter:
    `min(1000 × 2^n, 30000) × (0.8 + rand×0.4)`.
-   Entrega é **at-least-once**; o cliente deduplica por `id` do evento.

**Zumbi de rede.** Se o cliente enviar heartbeat e não receber
`HEARTBEAT_ACK` dentro de um intervalo, ele deve fechar o socket com
código 4000 e reconectar --- não confiar no `readyState`, que permanece
`OPEN` em conexões mortas por NAT timeout.

------------------------------------------------------------------------

## 12. Ciclo de vida da mensagem

### 12.1 Envio otimista

``` ts
async function sendMessage(channelId: string, content: string, files?: File[]) {
  const nonce = crypto.randomUUID();
  const optimistic: Message = {
    id: `optimistic:${nonce}`,
    nonce,
    channelId,
    content,
    author: currentUser,
    createdAt: new Date().toISOString(),
    state: "sending",
  };
  store.messages.insert(channelId, optimistic); // aparece na hora

  try {
    const real = await api.post(`/channels/${channelId}/messages`, {
      content,
      nonce,
      attachments: await uploadAll(files),
    });
    store.messages.replace(nonce, { ...real, state: "sent" });
  } catch (err) {
    store.messages.patch(nonce, { state: "failed", error: toUserError(err) });
  }
}
```

Se o evento `MESSAGE_CREATE` chegar pelo Gateway antes da resposta HTTP
(acontece), a reconciliação por `nonce` evita a mensagem duplicada. O
`UNIQUE (channel_id, user_id, nonce)` no banco garante que um retry do
cliente não crie duas linhas.

### 12.2 Estados

    [digitando] → [sending] ──✓──► [sent] ──► [delivered] ──► [read]
                      │
                      ✗
                      ▼
                  [failed] ──(retry)──► [sending]

### 12.3 Parsing de conteúdo

Markdown restrito, processado no **cliente** para render e no
**servidor** para extração de metadados.

  -----------------------------------------------------------------------
  Sintaxe                       Resultado
  ----------------------------- -----------------------------------------
  `**x**` `*x*` `__x__` `~~x~~` negrito, itálico, sublinhado, riscado,
  `\|\|x\|\|`                   spoiler

  `` `x` `` e ```` ```lang ```` código inline e bloco com highlight

  `> x`                         citação

  `[texto](url)`                link (apenas `http/https`, com
                                `rel="noopener noreferrer"`)

  `<@123>` `<@&456>` `<#789>`   menção de usuário, cargo, canal

  `:nome:` `<:nome:123>`        emoji unicode / customizado

  `@everyone` `@here`           menção em massa (exige
                                `MENTION_EVERYONE`)
  -----------------------------------------------------------------------

O servidor extrai `mentions[]`, `mention_roles[]` e `mention_everyone`
no momento do INSERT --- nunca no momento da leitura. Isso torna a
consulta "minhas menções" um simples `WHERE mentions @> ARRAY[$userId]`
com índice GIN.

**Regra de segurança:** o conteúdo é armazenado **cru**, sanitizado
apenas na renderização. Nunca renderizar HTML vindo do usuário; o
renderer produz elementos React a partir da AST, jamais
`dangerouslySetInnerHTML`.

### 12.4 Limites

  -----------------------------------------------------------------------
  Item                             Limite
  -------------------------------- --------------------------------------
  Conteúdo                         4.000 caracteres

  Anexos por mensagem              10

  Tamanho por arquivo              25 MB (100 MB em servidores com boost)

  Reactions distintas por mensagem 20

  Mensagens fixadas por canal      50

  Janela de edição                 ilimitada (marca `edited_at`)

  Bulk delete                      100 msgs, até 14 dias de idade

  Embeds por mensagem              10
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 13. Presença e estado de leitura

### 13.1 Presença

Presença é **volátil**: vive só no Redis, nunca no Postgres. Perder
presença num restart é aceitável; ela se reconstrói em segundos.

    HSET presence:{userId} status "online" activity "{...}" since 1755870000
    SADD presence:sessions:{userId} {sessionId}
    EXPIRE presence:{userId} 120

  --------------------------------------------------------------------------
  Estado      Origem
  ----------- --------------------------------------------------------------
  `online`    Ao menos uma sessão ativa e não inativa

  `idle`      Todas as sessões sem input há \> 10 min, ou aba oculta há \>
              30 min

  `dnd`       Definido manualmente; suprime notificações de desktop

  `offline`   Nenhuma sessão, ou `invisible` manual
  --------------------------------------------------------------------------

**Regra de agregação:** o status efetivo é o *mais disponível* entre as
sessões, exceto se o usuário escolheu manualmente --- escolha manual
sempre vence. Ao fechar a última sessão, o Gateway não emite `offline`
imediatamente: aguarda 15 s. Isso elimina o flicker de "offline/online"
durante um refresh de página.

### 13.2 Estado de leitura

O contador de não lidas nunca é calculado com `COUNT(*)` --- em canal
grande isso é uma varredura cara e frequente.

``` sql
-- Não lidas de um canal: quantos IDs acima do último lido
SELECT count(*) FROM messages
WHERE channel_id = $1 AND id > $2 AND deleted_at IS NULL
LIMIT 100;   -- exibe "99+" acima disso
```

-   Menções são contadas incrementalmente em `read_states.mention_count`
    (`+1` no fan-out, zerado ao marcar como lido).
-   O badge de servidor é o `OR` dos canais não lidos; o badge numérico
    é a soma de `mention_count`.
-   Marcar como lido é debounced em 1 s no cliente e enviado como
    `PATCH /channels/:id/ack { message_id }`.
-   Sincronização entre dispositivos via evento `MESSAGE_ACK` para as
    outras sessões do mesmo usuário.

### 13.3 Indicador de digitação

Efêmero, nunca persistido. `POST /channels/:id/typing` emite
`TYPING_START` com TTL de 8 s. O cliente reenvia no máximo a cada 5 s
enquanto houver digitação --- throttle no cliente, não no servidor.

------------------------------------------------------------------------

## 14. Voz, vídeo e screen sharing

### 14.1 Arquitetura

    Cliente A ──┐                       ┌── Cliente C
                ├──► LiveKit SFU ◄──────┤
    Cliente B ──┘        │              └── Cliente D
                         │
                  ┌──────▼──────┐
                  │  API Server │  emite token JWT com grants
                  └─────────────┘

Cada cliente publica **uma** stream de áudio (Opus) e opcionalmente
vídeo (VP8/VP9/AV1 com simulcast em 3 camadas). O SFU roteia sem
transcodificar; a seleção de camada é feita por assinante conforme banda
disponível.

### 14.2 Fluxo de entrada em canal de voz

    1. Cliente  → POST /channels/:id/voice-token
    2. API      → checa CONNECT; checa user_limit; checa ban/timeout
    3. API      → gera JWT LiveKit { room: channel_id, identity: user_id,
                                      canPublish, canSubscribe, canPublishData }
    4. API      → grava voice_states no Redis; emite VOICE_STATE_UPDATE
    5. Cliente  → conecta ao SFU com o token
    6. Cliente  → publica track de microfone
    7. SFU      → webhook participant_joined → API confirma estado

O token carrega os grants derivados das permissões: sem `SPEAK`,
`canPublish` do áudio é `false`; sem `STREAM`, screen share é bloqueado
no próprio SFU. **A permissão é aplicada na origem, não só na UI** ---
esconder o botão não é controle de acesso.

### 14.3 Estado de voz

``` jsonc
// Redis: voice:{channelId} → hash de userId
{
  "userId": "710...",
  "sessionId": "a1b2",
  "selfMute": false,
  "selfDeaf": false,
  "serverMute": false,
  "serverDeaf": false,
  "streaming": true,
  "video": false,
  "suppress": false, // stage channel
  "joinedAt": 1755870000,
}
```

### 14.4 Controles e configuração

  -----------------------------------------------------------------------
  Controle            Comportamento
  ------------------- ---------------------------------------------------
  Mute                Para de publicar áudio (track desabilitada, não
                      removida)

  Deafen              Não recebe áudio **e** implica mute automático

  Push-to-talk        Publica apenas com a tecla pressionada;
                      configurável globalmente

  Voice Activity      Publicação por limiar de energia, com sensibilidade
  Detection           ajustável

  Supressão de ruído  RNNoise no cliente (Krisp se disponível)

  Cancelamento de eco `echoCancellation: true` na constraint

  Priority speaker    Abaixa o volume dos demais em \~8 dB enquanto fala
  -----------------------------------------------------------------------

### 14.5 Screen sharing

``` ts
const stream = await navigator.mediaDevices.getDisplayMedia({
  video: {
    frameRate: { ideal: fps },
    width: { max: 1920 },
    height: { max: 1080 },
  },
  audio: { suppressLocalAudioPlayback: false }, // áudio da aba
  surfaceSwitching: "include",
  selfBrowserSurface: "exclude", // evita espelho infinito
});
```

  Perfil           Resolução   FPS   Bitrate    `contentHint`
  ---------------- ----------- ----- ---------- ---------------
  Documento        1080p       5     800 kbps   `detail`
  Padrão           720p        30    1,5 Mbps   `motion`
  Alta qualidade   1080p       30    3 Mbps     `motion`
  Gaming           1080p       60    6 Mbps     `motion`

`contentHint = 'detail'` prioriza nitidez de texto sobre fluidez --- a
diferença ao compartilhar código ou uma viewport 3D é enorme.

### 14.6 Layout de vídeo

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

Acima de 9 participantes, apenas os falantes ativos (últimos 8 por
energia de áudio) mantêm vídeo assinado; os demais viram avatar. Isso
mantém o consumo de banda plano independentemente do tamanho da sala.

### 14.7 Degradação

  -----------------------------------------------------------------------
  Condição          Ação
  ----------------- -----------------------------------------------------
  Perda de pacotes  Reduz camada de simulcast
  \> 5%             

  Perda \> 15%      Desliga vídeo, mantém áudio

  RTT \> 300 ms     Aumenta buffer de jitter

  CPU \> 80%        Reduz FPS de publicação

  Falha do SFU      Reconecta com ICE restart; após 3 falhas, notifica e
                    desconecta
  -----------------------------------------------------------------------

Áudio **nunca** é sacrificado por vídeo. A hierarquia de degradação é:
FPS → resolução → vídeo desligado → áudio em bitrate reduzido →
desconexão.

------------------------------------------------------------------------

## 15. Upload e pipeline de mídia

### 15.1 Fluxo

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

O upload direto ao storage é obrigatório: passar 25 MB pela API consome
memória e conexão de um processo que deveria estar respondendo
requisições rápidas.

### 15.2 Validação

  Camada    Verificação
  --------- ------------------------------------------------------------
  Cliente   Extensão, tamanho, preview
  API       Cota, permissão, `content_type` declarado contra allowlist
  Storage   `Content-Length` forçado na policy do presigned
  Worker    **Magic bytes** --- a fonte de verdade real do tipo
  Worker    Antivírus; `flagged` bloqueia o download

Allowlist: `image/{png,jpeg,gif,webp,avif}`,
`video/{mp4,webm,quicktime}`, `audio/{mpeg,ogg,wav,webm}`,
`application/{pdf,zip,json}`, `text/{plain,markdown,csv}`,
`model/gltf-binary`, `model/gltf+json`.

Bloqueado sempre: `.exe`, `.dll`, `.bat`, `.sh`, `.jar`, `.apk`, `.msi`,
`.scr` e qualquer arquivo cujo magic byte divirja da extensão declarada.

### 15.3 Servir arquivos

    https://cdn.factory.app/{storage_key}?ex={exp}&hm={hmac}

-   URLs assinadas com HMAC e validade de 24 h; a assinatura inclui o
    `channel_id`, o que impede que um link vazado dê acesso após a saída
    do usuário do servidor.
-   `Content-Disposition: attachment` para tudo que não seja
    imagem/vídeo/áudio renderizável --- impede que um SVG malicioso
    execute script no domínio da CDN.
-   Variantes geradas: `thumb` (400px), `medium` (1280px), `original`.
-   `Cache-Control: public, max-age=31536000, immutable` (a chave contém
    o snowflake, então nunca muda).

### 15.4 Visualizador de imagens

Modal com: zoom por scroll e pinch, pan com arrasto, navegação por setas
entre anexos da mesma mensagem e do canal, download, "abrir original",
`Esc` para fechar, e transição a partir do blurhash enquanto a imagem
carrega.

------------------------------------------------------------------------

## 16. Notificações

### 16.1 Matriz de decisão

Para cada mensagem, para cada membro potencialmente notificável:

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

Precedência de configuração: **canal \> categoria \> servidor \>
global**. Um `null` significa "herda"; um valor explícito interrompe a
herança.

### 16.2 Canais de entrega

  ---------------------------------------------------------------------------
  Canal                    Quando                                  Latência
  ------------------------ --------------------------------------- ----------
  In-app (toast + badge)   Sessão ativa                            Imediata

  Desktop (Notification    Aba oculta, não DND                     \< 1 s
  API)                                                             

  Push (FCM/APNs via web   Sem sessão ativa                        \< 5 s
  push)                                                            

  E-mail                   Menção sem leitura por 15 min, digest   Agregado
                           opcional                                
  ---------------------------------------------------------------------------

Push e e-mail passam por um job com **debounce de 15 minutos por
(usuário, canal)** --- cinco menções seguidas viram uma notificação
agregada ("3 novas menções em #projetos"), não cinco vibrações.

### 16.3 Payload de push

``` jsonc
{
  "title": "#projetos · Factory Community",
  "body": "Juscelio: pode revisar o render da cena?",
  "icon": "https://cdn.../server-icon.webp",
  "badge": "/badge-mono.png",
  "tag": "channel:7108...", // substitui a anterior do mesmo canal
  "renotify": false,
  "data": { "url": "/channels/710.../711...", "messageId": "712..." },
}
```

Conteúdo de mensagem em push é **opcional e desligado por padrão em
servidores marcados como sensíveis** --- a prévia aparece na tela de
bloqueio do dispositivo.

------------------------------------------------------------------------

## 17. Busca

### 17.1 Sintaxe

    from:juscelio in:projetos before:2026-08-20 render
    has:image from:@ana during:2026-08
    mentions:@me has:link
    -from:bot deploy

  -----------------------------------------------------------------------
  Operador              Valores
  --------------------- -------------------------------------------------
  `from:`               username, `@me`

  `in:`                 nome ou id de canal

  `mentions:`           username, `@me`

  `has:`                `link`, `image`, `video`, `file`, `embed`,
                        `reaction`, `thread`

  `before:` `after:`    `YYYY-MM-DD`, `YYYY-MM`
  `during:`             

  `pinned:`             `true`, `false`

  `-termo`              exclusão

  `"frase exata"`       correspondência de frase
  -----------------------------------------------------------------------

### 17.2 Implementação

``` sql
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

**Ponto crítico de segurança:** `$3` (canais visíveis) é resolvido
**antes** da query, a partir das permissões do usuário. Nunca filtrar
permissão depois do `LIMIT` --- isso produz páginas com buracos e, pior,
revela por contagem a existência de canais privados.

### 17.3 Desempenho

-   `ORDER BY rank` sobre milhões de linhas é caro. Mitigação:
    restringir sempre por `server_id` e usar índice parcial por servidor
    grande.
-   Acima de \~50M mensagens, migrar para OpenSearch atrás da interface
    `SearchProvider` (já abstraída --- ver ADR-006).
-   Resultados cacheados por 60 s em Redis com chave
    `(userId, queryHash)`.
-   Sinônimos e stemming em pt-BR via dicionário `portuguese` nativo;
    adicionar dicionário customizado para jargão do domínio (`render`,
    `shader`, `deploy`) se necessário.

------------------------------------------------------------------------

## 18. Moderação e audit log

### 18.1 Ações

  --------------------------------------------------------------------------------
  Ação          Permissão             Efeito                          Reversível
  ------------- --------------------- ------------------------------- ------------
  Deletar       `MANAGE_MESSAGES`     Tombstone                       Não
  mensagem                                                            

  Purge em      `MANAGE_MESSAGES`     Até 100 msgs \< 14 dias         Não
  massa                                                               

  Timeout       `TIMEOUT_MEMBERS`     Perde tudo menos leitura, até   Sim
                                      28 dias                         

  Kick          `KICK_MEMBERS`        Remove; pode voltar por convite ---

  Ban           `BAN_MEMBERS`         Remove + bloqueia; opção de     Sim
                                      apagar 7 dias de msgs           

  Server        `MUTE_MEMBERS` /      Silencia em voz                 Sim
  mute/deafen   `DEAFEN_MEMBERS`                                      

  Mover em voz  `MOVE_MEMBERS`        Move entre canais               ---

  Lockdown de   `MANAGE_CHANNELS`     Nega `SEND_MESSAGES` a          Sim
  canal                               `@everyone`                     

  Slowmode      `MANAGE_CHANNELS`     0--21600 s                      Sim
  --------------------------------------------------------------------------------

### 18.2 Audit log

Append-only, imutável no nível de permissão do banco. Toda ação registra
ator, alvo, diff e razão.

``` jsonc
{
  "id": "7108...",
  "actor": { "id": "710...", "username": "pedro" },
  "action": "MEMBER_KICK",
  "target": { "type": "user", "id": "711...", "username": "joao" },
  "changes": [],
  "reason": "spam recorrente no #geral",
  "created_at": "2026-08-22T15:32:00Z",
}
```

Renderização:
`Pedro removeu João · 22/08/2026 — 15:32 · "spam recorrente no #geral"`

Ações registradas: `SERVER_UPDATE`, `CHANNEL_CREATE|UPDATE|DELETE`,
`CHANNEL_OVERWRITE_*`,
`MEMBER_KICK|BAN_ADD|BAN_REMOVE|UPDATE|ROLE_UPDATE|MOVE|DISCONNECT`,
`ROLE_CREATE|UPDATE|DELETE`, `INVITE_CREATE|DELETE`,
`MESSAGE_DELETE|BULK_DELETE|PIN|UNPIN`, `EMOJI_*`, `APP_ENABLE|DISABLE`.

### 18.3 Automoderação (fase 2)

  -----------------------------------------------------------------------
  Regra                                  Ação
  -------------------------------------- --------------------------------
  Lista de palavras bloqueadas (regex    Bloqueia envio + alerta
  por servidor)                          

  Anti-spam: 5 msgs idênticas em 10 s    Timeout de 5 min

  Anti-menção: \> 5 menções numa         Bloqueia
  mensagem                               

  Anti-convite: link de convite externo  Deleta

  Anti-raid: 10 entradas em 60 s         Eleva verificação, exige
                                         aprovação manual

  Anexo com `scan_status = flagged`      Bloqueia download + notifica
                                         moderação
  -----------------------------------------------------------------------

Toda ação automática vai para o audit log com `actor = system` e é
reversível por um moderador.

------------------------------------------------------------------------

## 19. Segurança

### 19.1 Autenticação

-   Senhas com **Argon2id** (`m=64MiB, t=3, p=4`). Nunca bcrypt novo,
    nunca MD5/SHA sem KDF.
-   Access token JWT de 15 min (`HS256` com segredo rotacionável, ou
    `EdDSA` se houver múltiplos verificadores).
-   Refresh token opaco, 30 dias, armazenado como hash, **rotacionado a
    cada uso**.
-   **Detecção de reuso:** se um refresh já consumido for apresentado,
    toda a família de tokens daquele usuário é revogada e um alerta é
    enviado por e-mail. É a defesa central contra roubo de refresh
    token.
-   MFA TOTP com 10 códigos de recuperação de uso único.
-   Bloqueio progressivo por tentativas: 5 falhas → 15 min; reincidência
    → CAPTCHA obrigatório.

### 19.2 Superfícies de ataque e mitigações

  -----------------------------------------------------------------------
  Vetor         Mitigação
  ------------- ---------------------------------------------------------
  XSS via       Render por AST em React; zero `dangerouslySetInnerHTML`;
  mensagem      CSP restritiva

  XSS via SVG   `Content-Disposition: attachment`; CDN em domínio
  em anexo      separado, sem cookies

  CSRF          Refresh em cookie `SameSite=Lax`; access token via header
                (não cookie)

  SQL injection Query builder parametrizado (Drizzle); zero concatenação
                de string

  IDOR          Toda rota resolve permissão a partir do recurso, nunca do
                parâmetro do cliente

  Escalada de   Regras de hierarquia (§9.3) verificadas no servidor em
  privilégio    toda mutação de cargo

  SSRF via      Worker isolado, allowlist de esquema, bloqueio de IPs
  unfurl de     privados e link-local, sem seguir redirect para rede
  link          interna

  Enumeração de Respostas idênticas em login/recuperação; rate limit
  usuários      agressivo

  Vazamento por Permissão revalidada no fan-out, não só na inscrição
  WebSocket     

  DoS por       Limite de 4 MB por frame WS; limite de profundidade em
  payload       JSON

  Zip bomb      Nunca descomprimir anexos no servidor

  Prompt        Conteúdo do usuário tratado como dado, nunca como
  injection     instrução; ferramentas com allowlist
  (app de IA)   
  -----------------------------------------------------------------------

### 19.3 Cabeçalhos

    Content-Security-Policy: default-src 'self';
      script-src 'self' 'wasm-unsafe-eval';
      style-src 'self' 'unsafe-inline';
      img-src 'self' https://cdn.factory.app data: blob:;
      media-src 'self' https://cdn.factory.app blob:;
      connect-src 'self' wss://gateway.factory.app https://api.factory.app wss://*.livekit.cloud;
      frame-src https://apps.factory.app;
      frame-ancestors 'none';
      base-uri 'none'; object-src 'none'
    Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
    X-Content-Type-Options: nosniff
    Referrer-Policy: strict-origin-when-cross-origin
    Permissions-Policy: camera=(self), microphone=(self), display-capture=(self), geolocation=()

### 19.4 Privacidade e LGPD

  -------------------------------------------------------------------------
  Requisito     Implementação
  ------------- -----------------------------------------------------------
  Direito de    `POST /users/@me/data-export` → ZIP em até 30 dias
  acesso        

  Direito de    Anonimização: `username = deleted_user_{hash}`, PII nula,
  exclusão      mensagens preservadas com autor nulo

  Minimização   IP nunca armazenado em claro --- apenas HMAC com pepper

  Retenção      Sessões 30 d, logs 90 d, notificações 180 d, audit 2 anos

  Base legal    Execução de contrato (serviço) + legítimo interesse
                (segurança/antiabuso)

  Encarregado   Contato publicado na política de privacidade

  Incidente     Runbook de notificação à ANPD em até 2 dias úteis
  -------------------------------------------------------------------------

Mensagens não são apagadas na exclusão de conta porque pertencem também
ao contexto de terceiros --- isso deve estar explícito nos termos de
uso, e o usuário pode apagar suas mensagens individualmente antes de
excluir a conta.

------------------------------------------------------------------------

## 20. Arquitetura de frontend

### 20.1 Layout

    ┌────┬──────────────────┬────────────────────────────────┬──────────────┐
    │ S  │  Canais          │  # projetos                    │  Membros     │
    │ E  │                  │  ┌──────┬───────┬──────┬─────┐ │              │
    │ R  │  FACTORY         │  │ Chat │ Files │ Tasks│ 3D  │ │ ADMIN — 2    │
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

Breakpoints: `< 768px` mostra uma coluna por vez com navegação por
gesto; `768–1024px` oculta a lista de membros; `> 1024px` layout
completo. A barra de voz é persistente e sobrevive à troca de canal e de
servidor.

### 20.2 Estado

Quatro categorias, cada uma com sua ferramenta:

  ------------------------------------------------------------------------
  Categoria         Ferramenta            Exemplo
  ----------------- --------------------- --------------------------------
  Servidor (cache   TanStack Query        perfis, lista de membros,
  remoto)                                 histórico antigo

  Tempo real (push) Zustand + reducer de  mensagens, presença, voice
                    eventos               states

  UI local          `useState` / Zustand  modais, hover, rascunhos

  URL               Next.js router        canal ativo, servidor ativo
  ------------------------------------------------------------------------

``` ts
interface GatewayStore {
  messages: Map<ChannelId, MessageList>; // ordenada, com gaps marcados
  presence: Map<UserId, Presence>;
  voice: Map<ChannelId, VoiceState[]>;
  typing: Map<ChannelId, Map<UserId, number>>;
  readState: Map<ChannelId, ReadState>;
  apply(event: GatewayEvent): void; // reducer único, testável isolado
}
```

**Regra:** um único ponto de entrada de eventos (`apply`). Nada de
`useEffect` espalhado assinando o socket --- isso torna a ordem de
aplicação imprevisível e o estado impossível de reproduzir num teste.

### 20.3 Lista de mensagens

O componente mais difícil da aplicação. Requisitos simultâneos:

-   Scroll invertido (novas embaixo), altura de item variável e
    desconhecida antes do render.
-   Virtualização (renderizar 10k nós mata o navegador).
-   Preservação de posição ao carregar histórico acima.
-   Auto-scroll apenas se o usuário já estava no fim.
-   Agrupamento de mensagens consecutivas do mesmo autor em até 7
    minutos.
-   Separadores de data e marcador de "novas mensagens".
-   Jump-to-message com destaque temporário e carregamento de janela ao
    redor.

``` ts
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

1.  **Imagens sem dimensão** alteram a altura após o layout e fazem o
    scroll pular. Solução: reservar espaço com `width`/`height` dos
    metadados e exibir blurhash até carregar.
2.  **Prepend de histórico** desloca o conteúdo. Solução: capturar
    `scrollHeight` antes, restaurar `scrollTop += delta` no
    `useLayoutEffect`.
3.  **Auto-scroll agressivo** interrompe a leitura. Solução: só rolar se
    `scrollBottom < 100px` no momento do evento.
4.  **Gaps no histórico.** Após uma desconexão longa, há um buraco entre
    o que está em memória e o que chegou. A lista precisa modelar isso
    explicitamente com um marcador de gap e um botão "carregar mensagens
    perdidas".

### 20.4 Desempenho

  Métrica                     Alvo
  --------------------------- -------------------
  LCP                         \< 1,5 s
  INP                         \< 100 ms
  CLS                         \< 0,05
  Troca de canal              \< 100 ms (cache)
  Bundle inicial              \< 250 KB gzip
  Memória com 10 servidores   \< 400 MB

Técnicas: code splitting por rota; `next/dynamic` para viewer 3D, emoji
picker e configurações; `React.memo` em item de mensagem com comparador
raso por `id` + `edited_at`; Web Worker para parsing de markdown de
mensagens em lote; `content-visibility: auto` em canais fora de vista;
`IntersectionObserver` para lazy-load de mídia.

### 20.5 Acessibilidade

Alvo: WCAG 2.1 AA.

-   Navegação completa por teclado; `Ctrl+K` para command palette,
    `Alt+↑/↓` entre canais, `Esc` fecha camadas.
-   Lista de mensagens com `role="log"` e `aria-live="polite"`; menções
    e anexos anunciados.
-   Foco visível sempre, com anel de 2px e contraste ≥ 3:1.
-   Contraste de texto ≥ 4,5:1 em ambos os temas.
-   Respeito a `prefers-reduced-motion` (desliga animações de entrada e
    transições de modal).
-   Alternativa textual obrigatória em imagens enviadas (campo opcional
    no upload, com sugestão automática).
-   Legendas ao vivo em chamadas de voz (fase 3, via transcrição do
    LiveKit).

------------------------------------------------------------------------

## 21. Design system

### 21.1 Tokens

``` css
:root {
  /* Superfícies — escala neutra fria, não cinza puro */
  --bg-deepest: #0b0d10; /* barra de servidores */
  --bg-deep: #14171c; /* sidebar de canais */
  --bg-base: #1a1e24; /* área de conteúdo */
  --bg-raised: #222730; /* cards, hover */
  --bg-overlay: #2b313b; /* modais, popovers */

  /* Texto */
  --fg-primary: #e8eaed;
  --fg-secondary: #a3adba;
  --fg-muted: #6b7684;
  --fg-inverse: #0b0d10;

  /* Marca e estado */
  --accent: #5b6ef5;
  --accent-hover: #6d7ef7;
  --success: #3ba55d;
  --warning: #faa61a;
  --danger: #ed4245;
  --online: #23a55a;
  --idle: #f0b232;
  --dnd: #f23f43;
  --offline: #80848e;

  /* Tipografia */
  --font-sans: "Inter Variable", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, monospace;
  --text-xs: 0.75rem;
  --text-sm: 0.8125rem;
  --text-base: 0.9375rem;
  --text-lg: 1.0625rem;

  /* Espaçamento — escala de 4px */
  --sp-1: 4px;
  --sp-2: 8px;
  --sp-3: 12px;
  --sp-4: 16px;
  --sp-6: 24px;
  --sp-8: 32px;

  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-full: 9999px;
  --dur-fast: 120ms;
  --dur-base: 200ms;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

Observações de direção visual: o tamanho base de texto é **15px**, não
16px --- densidade importa numa interface de chat, e 15px é o ponto onde
ainda há conforto de leitura com mais linhas visíveis. As superfícies
usam neutros ligeiramente azulados; cinza puro (`#1a1a1a`) parece morto
ao lado de conteúdo colorido. O acento é um índigo levemente
dessaturado, escolhido para não competir com os avatares e cores de
cargo dos usuários.

### 21.2 Inventário de componentes

  -------------------------------------------------------------------------------
  Grupo        Componentes
  ------------ ------------------------------------------------------------------
  Layout       `AppShell`, `ServerRail`, `ChannelSidebar`, `MemberList`,
               `VoiceBar`

  Chat         `MessageList`, `MessageGroup`, `MessageItem`, `Composer`,
               `TypingIndicator`, `ReplyPreview`, `ReactionBar`, `EmojiPicker`,
               `AttachmentGrid`, `Embed`, `PinnedPanel`

  Voz          `VoiceChannelUsers`, `VideoGrid`, `VideoTile`, `ScreenShareView`,
               `VoiceControls`, `DeviceSettings`

  Membros      `MemberRow`, `ProfilePopout`, `ProfileModal`, `RoleBadge`,
               `PresenceDot`

  Formulário   `Input`, `Textarea`, `Select`, `Switch`, `Slider`, `ColorPicker`,
               `FileDrop`, `PermissionToggle` (tri-state)

  Feedback     `Toast`, `Modal`, `Popover`, `Tooltip`, `ContextMenu`, `Skeleton`,
               `EmptyState`, `ErrorBoundary`
  -------------------------------------------------------------------------------

`PermissionToggle` merece atenção: é tri-state (`allow` / `neutro` /
`deny`), e a maioria dos bugs de UX de permissão vem de confundir
"neutro" com "negado". O estado neutro precisa ser visualmente distinto
de ambos, não um meio-termo.

------------------------------------------------------------------------

## 22. Plataforma de aplicações em canal

O diferencial do produto. Cada canal pode expor abas além do chat, e
essas abas compartilham permissões, membros e contexto.

### 22.1 Modelo

    Canal #projeto-a
    ├── Chat        (nativo)
    ├── Files       (nativo — árvore de arquivos do canal, versionada)
    ├── Tasks       (nativo — kanban com vínculo a mensagens)
    ├── 3D Viewer   (nativo — glTF/GLB com anotações posicionais)
    ├── Meetings    (nativo — voz agendada, gravação, transcrição)
    └── AI Assistant(nativo — contexto do canal)

Todos os apps nativos são construídos **com o SDK público**. Se o SDK
não é suficiente para construir o Tasks, ele não é suficiente para
terceiros --- essa é a prova de fogo do design.

### 22.2 Manifest

``` jsonc
{
  "id": "com.factory.tasks",
  "name": "Tasks",
  "version": "1.2.0",
  "icon": "https://apps.factory.app/tasks/icon.svg",
  "entry": "https://apps.factory.app/tasks/index.html",
  "scopes": [
    "channel.read",
    "messages.read",
    "storage.channel",
    "members.read",
  ],
  "permissions_required": ["USE_APPS"],
  "permissions_manage": ["MANAGE_TASKS"],
  "surfaces": ["channel_tab", "message_action", "command"],
  "commands": [
    { "name": "task", "description": "Cria tarefa a partir da mensagem" },
  ],
  "events": ["task.created", "task.completed", "task.assigned"],
}
```

### 22.3 Sandbox

Apps rodam em `<iframe sandbox="allow-scripts allow-forms">` servido de
`apps.factory.app` --- **origem diferente** da aplicação principal. Sem
`allow-same-origin`, o app não tem acesso a cookies, localStorage ou DOM
do host. Toda comunicação passa por `postMessage` com validação de
origem e de esquema.

``` ts
// host
iframe.contentWindow.postMessage(
  { type: "CONTEXT", payload: ctx },
  APPS_ORIGIN,
);

window.addEventListener("message", (e) => {
  if (e.origin !== APPS_ORIGIN) return;
  const msg = AppMessageSchema.safeParse(e.data); // zod
  if (!msg.success) return;
  handleAppRequest(msg.data); // permissões reavaliadas AQUI, no host
});
```

Chamadas do app à API passam pelo host, que injeta o token com escopo
reduzido. O app **nunca** recebe o token do usuário.

### 22.4 SDK

``` ts
import { createApp } from "@loop/sdk";

const app = createApp({ id: "com.factory.tasks" });

const ctx = await app.context(); // { channel, server, user, permissions }
const msgs = await app.messages.list({ limit: 50 });
await app.storage.set("board", boardState); // KV com escopo de canal
app.on("message.create", (m) => maybeCreateTask(m));
await app.ui.toast("Tarefa criada");
await app.messages.send(`Tarefa criada: **${title}**`);
```

Escopos disponíveis: `channel.read`, `messages.read`, `messages.write`,
`members.read`, `storage.channel`, `storage.user`, `voice.read`,
`files.read`, `files.write`. Cada escopo é aprovado explicitamente no
momento de habilitar o app no canal, e a checagem final é sempre a
permissão do usuário --- um app com `messages.write` não permite que um
usuário sem `SEND_MESSAGES` publique.

### 22.5 Apps nativos

  ------------------------------------------------------------------------------
  App            Escopo          Diferencial concreto
  -------------- --------------- -----------------------------------------------
  **Files**      Árvore          Substitui "procura no histórico o arquivo que a
                 versionada por  Ana mandou"
                 canal           

  **Tasks**      Kanban          `/task` sobre uma mensagem cria a tarefa com o
                 vinculado a     link da decisão
                 mensagens       

  **3D Viewer**  glTF/GLB, USDZ  Anotação posicional no modelo vira mensagem no
                                 chat; central para o público de artistas
                                 técnicos

  **Meetings**   Agenda +        Ata gerada vira mensagem fixada com timestamps
                 gravação +      clicáveis
                 transcrição     

  **AI           Contexto do     "resuma o que foi decidido esta semana" com
  Assistant**    canal           citação das mensagens de origem
  ------------------------------------------------------------------------------

O 3D Viewer é o que diferencia de fato para o público inicial: revisar
um asset sem sair do canal, com a anotação virando conversa e a conversa
virando task.

------------------------------------------------------------------------

## 23. Observabilidade e SLOs

### 23.1 SLOs

  Serviço   SLI                                 Alvo        Janela
  --------- ----------------------------------- ----------- --------
  API       Disponibilidade (não-5xx)           99,9%       30 d
  API       Latência p95                        \< 200 ms   30 d
  Gateway   Uptime de conexão                   99,5%       30 d
  Gateway   Entrega de evento p95               \< 250 ms   30 d
  Voz       Qualidade de chamada (MOS \> 3,5)   95%         30 d
  Upload    Sucesso                             99,5%       30 d
  Busca     Latência p95                        \< 500 ms   30 d

Error budget de 43 min/mês para a API. Consumido acima de 50% no meio do
mês, congela deploys de feature e prioriza confiabilidade.

### 23.2 Instrumentação

    OpenTelemetry (traces + métricas)
       ├── traces  → Tempo / Jaeger
       ├── métricas→ Prometheus → Grafana
       └── logs    → Loki (JSON estruturado, com trace_id)
    Erros → Sentry (frontend + backend, com session replay em erro)
    RUM   → Web Vitals enviados para o backend próprio

Métricas de negócio no mesmo dashboard das técnicas --- sem isso,
ninguém percebe que uma regressão de latência derrubou o engajamento:

`messages_sent_total`, `voice_minutes_total`, `active_servers`, `dau`,
`wau`, `d1_retention`, `d7_retention`, `d30_retention`,
`time_to_first_message`, `invite_conversion_rate`.

### 23.3 Alertas

  -----------------------------------------------------------------------
  Alerta                  Condição                        Severidade
  ----------------------- ------------------------------- ---------------
  API 5xx alta            \> 1% por 5 min                 P1

  Latência de mensagem    p95 \> 1 s por 5 min            P1

  Gateway com queda em    \> 20% das conexões em 1 min    P1
  massa                                                   

  Partição de mensagens   Próxima partição inexistente em P1
  ausente                 3 dias                          

  Pool de conexões do     \> 80% por 10 min               P2
  Postgres                                                

  Fila de jobs            \> 1.000 pendentes              P2

  Espaço em disco         \> 80%                          P2

  Falha de scan de anexo  Qualquer `flagged`              P3 (revisão
                                                          humana)
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## 24. Estratégia de testes

### 24.1 Pirâmide

            ╱ E2E ╲            ~30 cenários — Playwright, multi-aba
          ╱─────────╲
        ╱ Integração ╲         ~200 — API + Postgres real (testcontainers)
      ╱───────────────╲
    ╱     Unitários     ╲      ~800 — permissões, parsing, snowflake, reducers

### 24.2 O que testar com prioridade máxima

  -----------------------------------------------------------------------
  Área             Por quê                           Cobertura exigida
  ---------------- --------------------------------- --------------------
  Resolução de     Bug aqui vaza dado privado        100% branch
  permissões                                         

  Fan-out do       Bug aqui entrega evento a quem    95%
  gateway          não deveria                       

  Reconciliação    Bug aqui duplica ou perde         95%
  otimista         mensagem                          

  Snowflake        Bug aqui corrompe IDs             100%
                   silenciosamente                   

  Rate limiting    Bug aqui permite spam ou trava    90%
                   usuário legítimo                  

  Parsing de       Bug aqui vira XSS                 100% nos casos de
  markdown                                           sanitização
  -----------------------------------------------------------------------

### 24.3 Cenários E2E obrigatórios

1.  Registro → verificação de e-mail → criação de servidor → primeira
    mensagem.
2.  Dois navegadores: A envia, B recebe em \< 1 s sem refresh.
3.  A entra em voz, B entra, ambos se ouvem (verificado por estatística
    de áudio recebido).
4.  Screen share de A é visível para B.
5.  Admin cria cargo negando `VIEW_CHANNEL` no canal, atribui a B, B
    perde o canal em tempo real.
6.  B tenta acessar o canal por URL direta → 403.
7.  Convite com 1 uso: primeiro entra, segundo recebe erro.
8.  Ban remove de `server_members` e bloqueia reentrada por convite
    válido.
9.  Reconexão: derruba o socket de B, A envia 3 mensagens, B reconecta e
    recebe as 3 sem duplicar.
10. Upload de imagem → thumbnail → visualizador → download.

### 24.4 Teste de carga

Alvos com k6 e um cliente WS sintético:

  Cenário                                  Alvo
  ---------------------------------------- ----------------------------
  Conexões simultâneas por nó de gateway   10.000
  Mensagens por segundo (global)           1.000
  Fan-out em servidor de 5k membros        p95 \< 300 ms
  Participantes numa sala de voz           50 com áudio, 12 com vídeo
  Memória por conexão WS                   \< 30 KB

------------------------------------------------------------------------

## 25. Infraestrutura, deploy e CI/CD

### 25.1 Ambientes

  -------------------------------------------------------------------------
  Ambiente   Infra             Dados                 Deploy
  ---------- ----------------- --------------------- ----------------------
  Local      Docker Compose    Seed sintético        ---

  Preview    Efêmero por PR    Snapshot anonimizado  Automático no PR

  Staging    Espelho reduzido  Anonimizado           Automático no merge

  Produção   Multi-AZ          Real                  Manual, com aprovação
  -------------------------------------------------------------------------

### 25.2 Topologia de produção

    Cloudflare (DNS, WAF, DDoS, CDN)
       ├── web        → Vercel / Cloudflare Pages
       ├── api        → Fly.io ou Railway, 2+ instâncias, autoscale
       ├── gateway    → Fly.io, 2+ instâncias, sticky por session_id
       ├── workers    → Fly.io, escala por profundidade de fila
       ├── postgres   → Neon / Supabase (primary + replica + PITR)
       ├── redis      → Upstash ou Redis Cloud
       ├── r2         → Cloudflare R2 (egress zero)
       └── livekit    → LiveKit Cloud

### 25.3 Pipeline

``` yaml
on: [pull_request, push]
jobs:
  quality: # lint, typecheck, format — paralelo
  test: # unit + integration com testcontainers
  build: # turbo build com cache remoto
  e2e: # playwright contra o preview
  migrate: # dry-run da migration + checagem de compatibilidade
  deploy: # canary 10% → métricas 10 min → 100%
```

**Regra de migrations:** toda migration deve ser compatível com a versão
anterior do código (expand → migrate → contract). Adicionar coluna com
default e nullable, backfill em job separado, só então tornar `NOT NULL`
numa migration posterior. Nunca renomear ou dropar coluna no mesmo
deploy que muda o código.

### 25.4 Backup e recuperação

  --------------------------------------------------------------------------
  Item               Frequência              Retenção   RPO            RTO
  ------------------ ----------------------- ---------- -------------- -----
  Postgres (PITR)    Contínuo (WAL)          30 d       5 min          1 h

  Snapshot lógico    Diário                  90 d       24 h           4 h

  R2                 Versionamento ativo     30 d       ---            ---

  Redis              Não crítico             ---        Aceita perda   ---
  --------------------------------------------------------------------------

Restauração testada trimestralmente em ambiente isolado --- backup não
testado não é backup.

------------------------------------------------------------------------

## 26. Custos e projeção de escala

Estimativas em USD/mês, ordem de grandeza.

  Componente                 500 MAU     5k MAU      50k MAU
  -------------------------- ----------- ----------- -------------
  Postgres                   25          100         500
  Redis                      10          40          200
  API (2--8 inst.)           20          80          400
  Gateway (2--6 inst.)       20          60          300
  Workers                    10          30          120
  R2 (storage + ops)         5           40          300
  LiveKit                    30          250         2.000
  Cloudflare                 0           20          200
  Sentry / observabilidade   0           30          150
  **Total**                  **\~120**   **\~650**   **\~4.170**

**Voz é o maior custo variável e cresce mais rápido que qualquer outro
item.** Aos \~5k MAU, self-hostar LiveKit em VMs dedicadas costuma sair
60--70% mais barato, ao preço de operar TURN, escalonamento de SFU e
monitoramento de rede. Avaliar quando o custo de voz passar de US\$
800/mês.

Alavancas de redução: R2 tem egress zero (grande economia contra S3);
mensagens antigas em partições com storage frio; simulcast reduz banda
do SFU; cache de permissões corta carga do Postgres pela metade.

------------------------------------------------------------------------

## 27. Roadmap e critérios de aceite

### Fase 0 --- Fundação (2 semanas)

Monorepo, CI, schema base, autenticação (registro, login, refresh, MFA),
design system inicial, deploy de staging.

**Aceite:** usuário registra, faz login, vê tela vazia autenticada;
pipeline verde ponta a ponta.

### Fase 1 --- MVP (6 semanas)

Servidores, categorias, canais de texto, mensagens em tempo real,
reactions, respostas, menções, upload de imagens, lista de membros,
presença, cargos básicos, convites, perfil.

**Aceite:**

-   Dois usuários em navegadores distintos conversam com latência p95 \<
    500 ms.
-   Convite funciona com validade e limite de usos.
-   Cargo negando `VIEW_CHANNEL` esconde o canal em tempo real, sem
    refresh.
-   Upload de imagem gera thumbnail e abre no visualizador.
-   100 usuários simultâneos sem degradação perceptível.

### Fase 2 --- Colaboração (6 semanas)

DMs e group DMs, amizades e bloqueio, threads, busca, notificações
(in-app, desktop, push), moderação completa, audit log, permissões
avançadas com overrides, emojis customizados, slowmode.

**Aceite:**

-   Busca com `from:` e `in:` retorna resultado correto em \< 500 ms
    sobre 1M mensagens.
-   Push chega em dispositivo com a aba fechada.
-   Ban impede reentrada por convite válido.
-   Audit log registra 100% das ações de moderação, sem exceção.

### Fase 3 --- Tempo real rico (8 semanas)

Voz, vídeo, screen sharing, controles de dispositivo, layout dinâmico,
stage channels, plataforma de apps + SDK, apps nativos (Files, Tasks, 3D
Viewer, Meetings).

**Aceite:**

-   8 pessoas em voz com mouth-to-ear p95 \< 200 ms.
-   Screen share 1080p/30 estável por 30 min.
-   Um app de terceiro roda em sandbox sem acesso ao token do usuário
    (verificado por pentest interno).
-   3D Viewer abre GLB de 50 MB em \< 5 s.

### Fase 4 --- Escala e plataforma (contínuo)

App mobile (React Native), desktop (Tauri), bots e webhooks,
automoderação com ML, gravação e transcrição, monetização, E2E em DMs,
marketplace de apps.

### Cronograma

    Semana  1  3  5  7  9 11 13 15 17 19 21 23 25
    Fase 0 ▓▓▓▓
    Fase 1     ▓▓▓▓▓▓▓▓▓▓▓▓
    Fase 2                 ▓▓▓▓▓▓▓▓▓▓▓▓
    Fase 3                             ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓
    Fase 4                                             ▓▓▓▓▓►

------------------------------------------------------------------------

## 28. Riscos e mitigações

  ---------------------------------------------------------------------------------------------
  \#    Risco                      Prob.      Impacto       Mitigação
  ----- -------------------------- ---------- ------------- -----------------------------------
  R1    Escopo cresce até virar    **Alta**   **Alto**      Fases com critério de aceite
        clone completo do Discord                           objetivo; nada entra na fase atual
                                                            sem sair outra coisa

  R2    Custo de voz cresce mais   Média      Alto          Limitar minutos no plano gratuito;
        rápido que a receita                                monitorar custo por MAU
                                                            semanalmente

  R3    Bug de permissão vaza      Média      **Crítico**   100% de cobertura no motor; pentest
        mensagem privada                                    antes de cada fase; bug bounty

  R4    Fan-out não escala em      Média      Alto          Subscrição lazy desde o dia 1;
        servidor grande                                     teste de carga em cada fase

  R5    Complexidade da lista      **Alta**   Médio         Construir isolada em Storybook na
        virtualizada trava o time                           semana 1 da fase 1

  R6    Migrar de Supabase         Média      Alto          **Evitado por decisão:** gateway
        Realtime para gateway                               próprio desde o início
        próprio vira reescrita                              

  R7    Moderação insuficiente em  Média      Alto          Automoderação na fase 2;
        comunidade pública                                  verificação obrigatória em
                                                            servidores públicos

  R8    Sandbox de apps é          Baixa      **Crítico**   Origem separada, sem
        contornada                                          `allow-same-origin`; revisão de
                                                            segurança obrigatória

  R9    Nenhum diferencial         Média      **Crítico**   Validar 3D Viewer e Tasks com 5
        percebido contra Discord                            estúdios antes da fase 3

  R10   Time pequeno demais para 4 **Alta**   Alto          Terceirizar auth, storage e SFU;
        aplicações                                          não construir mobile nativo na v1

  R11   Partição de mensagens não  Baixa      Alto          Job com 7 dias de antecedência +
        criada a tempo                                      alerta P1

  R12   Perda de dados por         Baixa      **Crítico**   Expand/contract obrigatório; PITR
        migration destrutiva                                testado trimestralmente
  ---------------------------------------------------------------------------------------------

**Os três riscos que realmente decidem o projeto:** R1 (escopo), R3
(permissões) e R9 (diferencial). R1 mata por exaustão, R3 mata por
incidente, R9 mata por indiferença do mercado.

------------------------------------------------------------------------

## 29. Anexos

### 29.1 Objetos de API

``` jsonc
// Message
{
  "id": "7108451234567890123",
  "channel_id": "7108440000000000001",
  "server_id": "7108430000000000001",
  "author": {
    "id": "7108420000000000001",
    "username": "juscelio",
    "display_name": "Juscelio",
    "avatar_url": "https://cdn.factory.app/avatars/...webp",
    "roles": ["7108431000000000001"],
  },
  "type": "default",
  "content": "Olá pessoal! Segue o render <@7108420000000000002>",
  "mentions": ["7108420000000000002"],
  "mention_roles": [],
  "mention_everyone": false,
  "attachments": [
    {
      "id": "7108460000000000001",
      "filename": "render_final.png",
      "content_type": "image/png",
      "size_bytes": 2458624,
      "width": 1920,
      "height": 1080,
      "blurhash": "LEHV6nWB2yk8pyo0adR*.7kCMdnj",
      "url": "https://cdn.factory.app/...?ex=...&hm=...",
      "thumbnail_url": "https://cdn.factory.app/...thumb...",
    },
  ],
  "embeds": [],
  "reactions": [
    { "emoji": { "name": "🔥" }, "count": 8, "me": true },
    {
      "emoji": { "id": "7108470000000000001", "name": "factory" },
      "count": 3,
      "me": false,
    },
  ],
  "reply_to": null,
  "thread": null,
  "pinned_at": null,
  "edited_at": null,
  "flags": 0,
  "created_at": "2026-08-22T15:32:00.000Z",
}
```

``` jsonc
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
  "apps_enabled": ["com.factory.tasks", "com.factory.viewer3d"],
  "permission_overrides": [
    {
      "target_type": 0,
      "target_id": "7108431000000000000",
      "allow": "0",
      "deny": "32768",
    },
  ],
}
```

``` jsonc
// Member
{
  "user": {
    "id": "...",
    "username": "ana",
    "display_name": "Ana",
    "avatar_url": "...",
  },
  "nickname": "Ana (PO)",
  "roles": ["7108431000000000002", "7108431000000000003"],
  "joined_at": "2026-03-14T10:00:00.000Z",
  "timeout_until": null,
  "presence": { "status": "online", "since": 1755870000 },
}
```

### 29.2 Atalhos de teclado

  -----------------------------------------------------------------------
  Atalho               Ação
  -------------------- --------------------------------------------------
  `Ctrl/⌘ K`           Command palette (ir para canal, servidor, usuário)

  `Ctrl/⌘ F`           Buscar no canal

  `Ctrl/⌘ Shift F`     Buscar globalmente

  `Alt ↑ / ↓`          Canal anterior / próximo

  `Alt Shift ↑ / ↓`    Servidor anterior / próximo

  `Esc`                Fecha camada; marca canal como lido se no fim

  `Shift Esc`          Marca tudo como lido

  `↑` (composer vazio) Edita última mensagem própria

  `Ctrl/⌘ Enter`       Envia (quando modo "Enter = nova linha")

  `Ctrl/⌘ Shift M`     Mute

  `Ctrl/⌘ Shift D`     Deafen

  `Ctrl/⌘ /`           Lista de atalhos
  -----------------------------------------------------------------------

### 29.3 Variáveis de ambiente

``` bash
# Core
NODE_ENV=production
APP_URL=https://factory.app
API_URL=https://api.factory.app
GATEWAY_URL=wss://gateway.factory.app
CDN_URL=https://cdn.factory.app
APPS_ORIGIN=https://apps.factory.app

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
R2_BUCKET=factory-uploads
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

### 29.4 Checklist pré-produção

**Segurança**

-   [ ] Pentest do motor de permissões concluído
-   [ ] CSP aplicada e sem `unsafe-inline` em `script-src`
-   [ ] Rate limits ativos em todas as rotas de escrita
-   [ ] Rotação de refresh token com detecção de reuso verificada
-   [ ] Segredos fora do repositório, em cofre gerenciado
-   [ ] Dependências sem CVE crítica

**Confiabilidade**

-   [ ] Restauração de backup testada com sucesso
-   [ ] Alertas P1 disparando para on-call real
-   [ ] Teste de carga atingindo os alvos da §24.4
-   [ ] Partições de mensagens criadas com 3 meses de antecedência
-   [ ] Runbook de incidente escrito e ensaiado

**Produto**

-   [ ] Termos de uso e política de privacidade publicados
-   [ ] Fluxo de export e exclusão de dados funcionando
-   [ ] Canal de denúncia de abuso ativo
-   [ ] Onboarding testado com 5 usuários que nunca viram o produto
-   [ ] Acessibilidade auditada (teclado + leitor de tela)

### 29.5 Referências

  -----------------------------------------------------------------------
  Tema               Fonte
  ------------------ ----------------------------------------------------
  Snowflake IDs      Twitter Engineering --- *Announcing Snowflake*

  Fan-out em escala  Discord Engineering --- *How Discord Stores
                     Trillions of Messages*

  Presença           Discord Engineering --- *How Discord Maintains
  distribuída        State*

  SFU e WebRTC       LiveKit Docs --- *Architecture*

  FTS em Postgres    PostgreSQL Docs --- cap. 12

  Segurança de       MDN --- *iframe sandbox* / OWASP Cheat Sheets
  iframe             

  Virtualização de   TanStack Virtual --- *Dynamic sizing*
  lista              

  Acessibilidade     WCAG 2.1 AA, WAI-ARIA Authoring Practices
  -----------------------------------------------------------------------

------------------------------------------------------------------------

## Registro de mudanças

  -----------------------------------------------------------------------------------
  Versão   Data         Alterações
  -------- ------------ -------------------------------------------------------------
  1.0      22/08/2026   Documento inicial: escopo, arquitetura, modelo de dados,
                        permissões, API, gateway, voz, apps de canal, roadmap

  -----------------------------------------------------------------------------------

------------------------------------------------------------------------

*Documento vivo. Toda decisão que contrarie uma ADR existente deve gerar
uma nova ADR que a substitua explicitamente, com o motivo da mudança.*

------------------------------------------------------------------------

# PARTE III --- REGRA DE CONTINUIDADE DO PROJETO

## Estado atual

A LOOP está na etapa:

``` text
Brand Foundation
        ↓
MVP Web
        ↓
5 usuários
```

## Próxima ação prática

A próxima implementação deve buscar o menor caminho possível até:

``` text
Pessoa A autenticada
        ↓
Space
        ↓
Room
        ↓
envia mensagem
        ↓
Supabase Realtime
        ↓
Pessoa B recebe sem refresh
```

Depois disso:

1.  histórico persistente;
2.  edição/exclusão da própria mensagem;
3.  lista de People;
4.  RLS e testes de acesso;
5.  refinamento visual LOOP;
6.  teste real com 5 pessoas;
7.  decisão formal: **MVP aprovado / MVP precisa de correções**.

## Se o MVP for aprovado

Não iniciar desktop imediatamente.

Executar primeiro:

``` text
Feedback
→ UX
→ Segurança
→ Banco
→ Performance
→ Custos
→ Priorização
```

Depois selecionar, com base no uso real, quais blocos da **Parte II**
entram na próxima release.

## Desktop no futuro

Quando a versão Web estiver consolidada:

``` text
LOOP Web
   ↓
Electron
   ├── LOOP for Windows
   └── LOOP for macOS
```

Windows deverá considerar assinatura de código, instalador e
auto-update.

macOS deverá considerar Apple Developer, Code Signing, Notarization,
Apple Silicon, permissões de microfone/câmera/screen recording e
auto-update.

------------------------------------------------------------------------

# Decisão final registrada

> **Construir pequeno, validar rápido e manter a arquitetura preparada
> para crescer sem obrigar o projeto a carregar complexidade
> prematura.**

A LOOP começa como uma experiência Web de comunicação em tempo real para
5 pessoas.\
A especificação completa existe como mapa de evolução --- não como
backlog obrigatório do primeiro lançamento.
