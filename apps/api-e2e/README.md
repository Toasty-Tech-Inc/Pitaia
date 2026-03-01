# API E2E Tests

Este diretório contém os testes End-to-End (E2E) para a API Pitaia.

## Estrutura de Arquivos

```
src/
├── api/
│   ├── addresses.e2e-spec.ts      # Testes de endereços
│   ├── api.spec.ts                # Health check básico
│   ├── auth.e2e-spec.ts           # Testes de autenticação
│   ├── cashier-sessions.e2e-spec.ts # Testes de sessões de caixa
│   ├── categories.e2e-spec.ts     # Testes de categorias
│   ├── coupons.e2e-spec.ts        # Testes de cupons
│   ├── customers.e2e-spec.ts      # Testes de clientes
│   ├── dynamic-pricing.e2e-spec.ts # Testes de preços dinâmicos
│   ├── establishments.e2e-spec.ts # Testes de estabelecimentos
│   ├── health.e2e-spec.ts         # Testes de health check
│   ├── loyalty.e2e-spec.ts        # Testes de fidelidade
│   ├── orders.e2e-spec.ts         # Testes de pedidos
│   ├── payments.e2e-spec.ts       # Testes de pagamentos
│   ├── product-modifiers.e2e-spec.ts # Testes de modificadores
│   ├── products.e2e-spec.ts       # Testes de produtos
│   ├── sales.e2e-spec.ts          # Testes de vendas
│   ├── stock.e2e-spec.ts          # Testes de estoque
│   ├── tables.e2e-spec.ts         # Testes de mesas
│   └── users.e2e-spec.ts          # Testes de usuários
└── support/
    ├── global-setup.ts            # Setup global antes dos testes
    ├── global-teardown.ts         # Teardown global após os testes
    ├── test-helpers.ts            # Funções auxiliares para testes
    └── test-setup.ts              # Configuração do axios
```

## Pré-requisitos

1. A API deve estar rodando em `http://localhost:3000` (ou conforme variáveis de ambiente)
2. O banco de dados deve estar configurado e acessível
3. **Importante**: A API deve ser iniciada com `E2E_TEST=true` para desabilitar o rate limiting

## Executando os Testes

### Executar todos os testes E2E

```bash
# 1. Inicie a API com rate limiting desabilitado
E2E_TEST=true pnpm exec nx run api:serve

# 2. Em outro terminal, execute os testes
pnpm exec nx run api-e2e:e2e
```

### Executar com a API em modo watch

```bash
# Terminal 1: Inicie a API
npx nx run api:serve

# Terminal 2: Execute os testes
npx nx run api-e2e:e2e
```

### Executar um arquivo específico

```bash
npx nx run api-e2e:e2e --testFile=src/api/auth.e2e-spec.ts
```

### Executar com filtro de nome

```bash
npx nx run api-e2e:e2e --testNamePattern="should create"
```

## Variáveis de Ambiente

| Variável | Descrição | Default |
|----------|-----------|---------|
| `HOST` | Host da API | `localhost` |
| `PORT` | Porta da API | `3000` |

## Helpers Disponíveis

### `setupTestUser()`
Cria e autentica um usuário de teste.

### `setupTestEstablishment()`
Cria um estabelecimento de teste.

### `authenticatedRequest()`
Retorna um objeto com métodos `get`, `post`, `patch`, `delete` que incluem o token de autenticação automaticamente.

### Geradores de dados únicos
- `generateUniqueEmail()` - Gera email único
- `generateUniquePhone()` - Gera telefone único
- `generateUniqueCpf()` - Gera CPF único
- `generateUniqueCnpj()` - Gera CNPJ único
- `generateUniqueSku()` - Gera SKU único

### `cleanupTestData()`
Limpa todos os dados de teste criados durante a execução.

## Cobertura de Rotas

### Auth (`/auth`)
- POST `/auth/login` - Login
- POST `/auth/register` - Registro
- POST `/auth/refresh` - Refresh token
- GET `/auth/profile` - Perfil do usuário
- POST `/auth/validate` - Validar token

### Users (`/users`)
- POST `/users` - Criar usuário
- GET `/users` - Listar usuários
- GET `/users/me` - Dados do usuário atual
- GET `/users/:id` - Buscar usuário
- PATCH `/users/:id` - Atualizar usuário
- PATCH `/users/me/update` - Atualizar próprio perfil
- POST `/users/me/change-password` - Alterar senha
- PATCH `/users/:id/activate` - Ativar usuário
- PATCH `/users/:id/deactivate` - Desativar usuário
- DELETE `/users/:id` - Deletar usuário

### Establishments (`/establishments`)
- POST `/establishments` - Criar estabelecimento
- GET `/establishments` - Listar estabelecimentos
- GET `/establishments/my` - Meus estabelecimentos
- GET `/establishments/:id` - Buscar estabelecimento
- PATCH `/establishments/:id` - Atualizar estabelecimento
- POST `/establishments/:id/users` - Adicionar usuário

### Categories (`/categories`)
- POST `/categories` - Criar categoria
- GET `/categories` - Listar categorias
- GET `/categories/establishment/:id` - Categorias por estabelecimento
- GET `/categories/establishment/:id/root` - Categorias raiz
- GET `/categories/:id` - Buscar categoria
- PATCH `/categories/:id` - Atualizar categoria
- PATCH `/categories/:id/sort-order` - Atualizar ordem
- PATCH `/categories/:id/toggle-active` - Alternar status
- DELETE `/categories/:id` - Deletar categoria

### Products (`/products`)
- POST `/products` - Criar produto
- GET `/products` - Listar produtos
- GET `/products/featured/:id` - Produtos em destaque
- GET `/products/low-stock/:id` - Produtos com estoque baixo
- GET `/products/:id` - Buscar produto
- PATCH `/products/:id` - Atualizar produto
- PATCH `/products/:id/stock` - Atualizar estoque
- PATCH `/products/:id/toggle-availability` - Alternar disponibilidade
- DELETE `/products/:id` - Deletar produto

### Customers (`/customers`)
- POST `/customers` - Criar cliente
- GET `/customers` - Listar clientes
- GET `/customers/phone/:phone` - Buscar por telefone
- GET `/customers/cpf/:cpf` - Buscar por CPF
- GET `/customers/:id` - Buscar cliente
- PATCH `/customers/:id` - Atualizar cliente
- PATCH `/customers/:id/toggle-active` - Alternar status
- POST `/customers/:id/addresses` - Adicionar endereço
- DELETE `/customers/:id` - Deletar cliente

### Orders (`/orders`)
- POST `/orders` - Criar pedido
- GET `/orders` - Listar pedidos
- GET `/orders/status/:establishmentId/:status` - Pedidos por status
- GET `/orders/table/:tableId` - Pedidos por mesa
- GET `/orders/my-orders` - Meus pedidos
- GET `/orders/:id` - Buscar pedido
- PATCH `/orders/:id` - Atualizar pedido
- PATCH `/orders/:id/status` - Atualizar status
- POST `/orders/:id/confirm` - Confirmar pedido
- POST `/orders/:id/prepare` - Iniciar preparo
- POST `/orders/:id/ready` - Marcar como pronto
- POST `/orders/:id/deliver` - Iniciar entrega
- POST `/orders/:id/complete` - Completar pedido
- POST `/orders/:id/cancel` - Cancelar pedido

### Tables (`/tables`)
- POST `/tables` - Criar mesa
- GET `/tables` - Listar mesas
- GET `/tables/establishment/:id` - Mesas por estabelecimento
- GET `/tables/qr-code/:code` - Buscar por QR code
- GET `/tables/:id` - Buscar mesa
- PATCH `/tables/:id` - Atualizar mesa
- PATCH `/tables/:id/status` - Atualizar status
- PATCH `/tables/:id/toggle-active` - Alternar status ativo
- DELETE `/tables/:id` - Deletar mesa

### Coupons (`/coupons`)
- POST `/coupons` - Criar cupom
- GET `/coupons` - Listar cupons
- GET `/coupons/public` - Cupons públicos
- POST `/coupons/validate` - Validar cupom
- GET `/coupons/code/:code` - Buscar por código
- GET `/coupons/:id` - Buscar cupom
- PATCH `/coupons/:id` - Atualizar cupom
- PATCH `/coupons/:id/toggle-active` - Alternar status
- DELETE `/coupons/:id` - Deletar cupom

### Cashier Sessions (`/cashier-sessions`)
- POST `/cashier-sessions/open` - Abrir sessão
- POST `/cashier-sessions/:id/close` - Fechar sessão
- GET `/cashier-sessions` - Listar sessões
- GET `/cashier-sessions/active` - Sessão ativa
- GET `/cashier-sessions/:id` - Buscar sessão
- GET `/cashier-sessions/:id/report` - Relatório da sessão
- GET `/cashier-sessions/report/daily/:id` - Relatório diário
- POST `/cashier-sessions/movements` - Criar movimento
- GET `/cashier-sessions/:id/movements` - Listar movimentos

### Sales (`/sales`)
- POST `/sales` - Criar venda
- GET `/sales` - Listar vendas
- GET `/sales/report` - Relatório de vendas
- GET `/sales/establishment/:id` - Vendas por estabelecimento
- GET `/sales/cashier-session/:id` - Vendas por sessão
- GET `/sales/report/daily/:id` - Relatório diário
- GET `/sales/report/products/:id` - Relatório por produtos
- GET `/sales/:id` - Buscar venda

### Payments (`/payments`)
- POST `/payments` - Criar pagamento
- POST `/payments/process/:orderId` - Processar pagamento
- GET `/payments/sale/:saleId` - Pagamentos da venda
- GET `/payments/:id` - Buscar pagamento
- POST `/payments/:id/refund` - Estornar pagamento

### Stock (`/stock`)
- POST `/stock/movement` - Criar movimentação
- GET `/stock/movements` - Listar movimentações
- GET `/stock/movements/:id` - Buscar movimentação
- GET `/stock/product/:id` - Movimentações do produto
- POST `/stock/product/:id/adjust` - Ajustar estoque
- GET `/stock/report/:establishmentId` - Relatório de estoque

### Loyalty (`/loyalty`)
- POST `/loyalty/earn` - Adicionar pontos
- POST `/loyalty/redeem/:customerId` - Resgatar pontos
- POST `/loyalty/adjust` - Ajustar pontos
- GET `/loyalty/transactions` - Listar transações
- GET `/loyalty/customer/:id` - Transações do cliente
- GET `/loyalty/balance/:id` - Saldo de pontos
- GET `/loyalty/summary/:id` - Resumo de fidelidade
- POST `/loyalty/process-expired` - Processar pontos expirados

### Product Modifiers (`/product-modifiers`)
- POST `/product-modifiers` - Criar modificador
- POST `/product-modifiers/bulk` - Criar em lote
- GET `/product-modifiers/product/:id` - Modificadores do produto
- GET `/product-modifiers/:id` - Buscar modificador
- PATCH `/product-modifiers/:id` - Atualizar modificador
- PATCH `/product-modifiers/:id/toggle-required` - Alternar obrigatoriedade
- POST `/product-modifiers/duplicate/:source/:target` - Duplicar modificadores
- DELETE `/product-modifiers/:id` - Deletar modificador

### Dynamic Pricing (`/dynamic-pricing`)
- POST `/dynamic-pricing` - Criar preço dinâmico
- GET `/dynamic-pricing` - Listar preços dinâmicos
- GET `/dynamic-pricing/:id` - Buscar preço dinâmico
- GET `/dynamic-pricing/product/:id` - Preços do produto
- GET `/dynamic-pricing/product/:id/current` - Preço atual
- GET `/dynamic-pricing/product/:id/analysis` - Análise de preços
- PATCH `/dynamic-pricing/:id` - Atualizar preço dinâmico
- PATCH `/dynamic-pricing/:id/toggle` - Alternar status
- DELETE `/dynamic-pricing/:id` - Deletar preço dinâmico

### Addresses (`/addresses`)
- POST `/addresses` - Criar endereço
- GET `/addresses/my-addresses` - Meus endereços
- GET `/addresses/customer/:id` - Endereços do cliente
- GET `/addresses/:id` - Buscar endereço
- PATCH `/addresses/:id` - Atualizar endereço
- PATCH `/addresses/:id/set-default` - Definir como padrão
- DELETE `/addresses/:id` - Deletar endereço
- POST `/addresses/calculate-delivery` - Calcular taxa de entrega
- POST `/addresses/geocode` - Obter coordenadas
- GET `/addresses/viacep/:zipCode` - Buscar endereço por CEP

### Health (`/health`)
- GET `/health` - Health check da API
