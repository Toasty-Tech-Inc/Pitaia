# Diagrama Arquitetural Completo

**Resumo:** Este diagrama descreve a arquitetura que montamos para o projeto **Pitaia**: monorepo Nx com apps em Angular 20 (SSR) + Taiga UI, microserviços em Go (Gin + GORM) e Node/NestJS (Prisma) quando aplicável, mobile Ionic (Capacitor), infra provisionada com Pulumi, funções event-driven com Serverless Framework, RabbitMQ para filas, Redis para cache, PostgreSQL como banco primário, MongoDB para analytics/dashboards, observabilidade com Prometheus + Grafana + Jaeger e CI/CD orquestrado por Nx + GitHub Actions / Nx Cloud.

---

## Funcionalidades do Projeto — Pitaia

**Funcionalidades principais:**

- Sistema de controle de caixa
- Sistema de ponto de venda (PDV)
- Cardápio online para pedidos
- Sistema de mesas e garçons
- Controle de taxas de entrega e motoboys
- CRUD de produtos
- Cupons de desconto
- Sistema de fidelidade
- Controle de estoque
- Cálculo de CMV
- Relatórios de vendas, produtos e clientes
- Formas de pagamento personalizadas
- Pagamento online automatizado
- Relatório de caixa
- Sistema de encomendas
- Emissão de notas fiscais
- Impressão automática e manual de pedidos

**Funcionalidades de IA:**

- Cadastro automático de produtos (OCR / visão computacional + NLP para classificação)
- Edição automática de produtos (sugestões de atributos, categorias, imagens)
- Criar promoções e ofertas personalizadas com base em análise de vendas (modelos de recomendação)
- Controle de valores flutuantes (preços dinâmicos / pricing engine)
- Anotar pedidos via chat (assistente conversacional para anotações e extras)

**Integrações externas:**

- Agilizone e Repediu — controle de motoboys
- Finanz — controle financeiro completo
- iFood — recebimento de pedidos
- Focus — emissão de notas fiscais

---

## Diagrama (Mermaid)

```mermaid
flowchart LR
  subgraph Users[Usuários]
    A[Browser (SEO) / Bot] -->|HTTP(s)| CDN[CDN (Cloudflare / CDN)]
    M[Mobile (Ionic/Capacitor / PWA)] -->|HTTP(s) / WebSocket| CDN
  end

  CDN --> SSR[Angular 20 (SSR) + Taiga UI]
  SSR --> APIGW[API Gateway / Load Balancer]

  subgraph Backend[Back-end & Microservices]
    APIGW --> NEST[NestJS (Prisma ORM — APIs de domínio / GraphQL / BFF)]
    APIGW --> GO_MS[Go Services (Gin + GORM) — microserviços críticos]
    NEST -->|RPC/HTTP/gRPC| GO_MS
    GO_MS --> POSTGRES[(PostgreSQL) — Banco primário]
    GO_MS -->|cache read/write| REDIS[(Redis) — Cache & Pub/Sub leve]
    NEST --> AUTH[Auth Service (JWT / OAuth)]
  end

  subgraph Messaging[Mensageria & Jobs]
    GO_MS -->|publish| RABBIT[(RabbitMQ) — Filas e entrega garantida]
    NEST -->|publish| RABBIT
    RABBIT --> WORKERS[Workers / ETL / Consumers]
    WORKERS --> MONGO[(MongoDB) — Store para dashboards/relatórios]
    WORKERS -->|update cache| REDIS
  end

  subgraph Serverless[Funções Serverless]
    APIGW --> SLF[Serverless Functions (Lambda / Cloud Functions)]
    SLF --> RABBIT
    SLF --> MONGO
  end

  subgraph Observability[Observability]
    GO_MS -->|/metrics| PROM[Prometheus (scrape)]
    NEST -->|/metrics| PROM
    SLF -->|OTel/Traces| JAEGER[Jaeger (Collector)]
    GO_MS -->|OTel/Traces| JAEGER
    NEST -->|OTel/Traces| JAEGER

    PROM --> GRAF[Grafana (dashboards + alertas)]
    JAEGER --> GRAF
    LOGS[(Structured logs -> Loki optional)] --> GRAF
  end

  subgraph Infra[Infra Estruturada]
    PULUMI[Pulumi] ---|provisiona| CLOUD[Cloud (AWS/GCP/Azure)]
    PULUMI ---|provisiona| RABBIT
    PULUMI ---|provisiona| POSTGRES
    PULUMI ---|provisiona| MONGO
    PULUMI ---|provisiona| REDIS
    PULUMI ---|provisiona| PROM
    PULUMI ---|provisiona| JAEGER
    PULUMI ---|provisiona| GRAF
  end

  subgraph DevOps[Monorepo & CI/CD]
    NX[Nx Monorepo (apps/libs/go work)] -->|orquestra| CI[GitHub Actions / GitLab CI]
    NX -->|cache| NXCLOUD[Nx Cloud]
    CI -->|nx affected| PULUMI
    CI -->|nx affected| SLF
    CI -->|build| DOCKER[Docker / Buildx]
    DOCKER -->|push| REG[Registry (ECR/GCR/ACR)]
    REG -->|deploy| CLOUD
  end

  %% Cross links
  M --> APIGW
  SSR -->|realtime| WS[WebSocket / Socket.IO / WebSocket Gateway]
  WS --> GO_MS
  WORKERS -->|ETL| MONGO
  POSTGRES -->|logical replication / CDC| WORKERS

```

---

## Componentes e Responsabilidades

- **Angular 20 (SSR) + Taiga UI**: frontend público com Server-Side Rendering para SEO. Pode ser hospedado em Vercel (SSR) ou em infra própria (Node server ou container). PWA compatível para melhorar indexação e experiência.

- **Nx Monorepo**: organiza `apps/` e `libs/`, coordena builds, affected commands, caching (Nx Cloud) e integra executors customizados para Go, Pulumi e Serverless.

- **Go (Gin + GORM)**: microserviços críticos focados em performance (autenticação crítica, billing, gateways, processamento em tempo real). Compilados em binários para execução em containers/instances.

- **NestJS (Prisma ORM)**: BFF / API de domínio quando for útil aproveitar decorators, GraphQL e integração rápida com ecossistema Node. Pode coexistir com Go.

- **PostgreSQL**: fonte de verdade para dados transacionais, ACID, JSONB quando precisar de flexibilidade.

- **MongoDB**: armazena documentos otimizados para dashboards e relatórios (ETL atualizado por workers consumidores das filas ou por CDC).

- **Redis**: cache de leitura (HTTP cache, session store, rate limiting), pub/sub leve, TTLs para manter performance.

- **RabbitMQ**: filas com garantia de entrega (tasks demoradas, processamento assíncrono, orquestração de workflows). Preferível para flows que requerem confirmações e requeues.

- **Serverless Framework**: funções event-driven (webhooks, triggers) isoladas, deploys independentes (stages), integradas ao Nx como targets.

- **Pulumi**: IaC para provisionar VPC, serviços gerenciados (RDS, ElastiCache, DocumentDB/Mongo Atlas), collectors (Prometheus, Jaeger) e configurações de infra.

- **Prometheus + Grafana + Jaeger**: observabilidade completa — métricas (Prometheus scrapes `/metrics`), traces (OpenTelemetry → Jaeger), dashboards e alertas (Grafana). Logs estruturados enviados a Loki (opcional) para correlação.

- **CI/CD**: GitHub Actions (ou GitLab CI) com comandos Nx (`nx affected --target=build`, `nx affected --target=deploy`), Pulumi deploys e Serverless deploys. Cache distribuído via Nx Cloud.

---

## Fluxos principais (resumidos)

1. **Requisição Web (SEO)**
   - Usuário/Bot → CDN → Angular SSR → API Gateway → NEST / Go → Postgres (write) / Redis (read cache)
   - Traces instrumentados com OpenTelemetry → Jaeger; métricas expostas em `/metrics` → Prometheus → Grafana

2. **Processamento Assíncrono / Filas**
   - Serviço escreve no Postgres → publica evento em RabbitMQ → Workers consomem → atualizam MongoDB (documentos otimizados) e limpam/atualizam cache Redis

3. **Serverless / Event-driven**
   - Webhook / evento externo → Serverless Function → validação / publicação em RabbitMQ → worker ou atualização direta no MongoDB

4. **ETL para dashboards**
   - Workers (consumidores) aplicam transformações/denormalizações e gravam em MongoDB; dashboards consultam Mongo diretamente para agregações

5. **CI/CD & Infra**
   - Push na main/branches → GitHub Actions → `nx affected` → builds, testes e `pulumi up` ou `serverless deploy` conforme impacto.

---

---
