# Arquitetura do Dashboard Angular

## Estrutura de Pastas

```
src/app/
├── core/                          # Funcionalidades core da aplicação
│   ├── interceptors/              # HTTP Interceptors
│   │   └── auth.interceptor.ts    # Interceptor de autenticação
│   ├── models/                    # Modelos/Interfaces TypeScript
│   │   ├── user.model.ts
│   │   ├── order.model.ts
│   │   ├── product.model.ts
│   │   ├── customer.model.ts
│   │   ├── table.model.ts
│   │   └── api-response.model.ts
│   └── services/                  # Serviços core
│       ├── api.service.ts         # Serviço base para chamadas HTTP
│       ├── orders.service.ts
│       ├── products.service.ts
│       ├── customers.service.ts
│       └── tables.service.ts
│
├── shared/                        # Componentes compartilhados
│   └── components/
│       ├── header/                # Cabeçalho da aplicação
│       └── sidebar/               # Menu lateral
│
├── features/                      # Módulos de funcionalidades
│   ├── orders/
│   │   ├── components/
│   │   │   ├── order-card/        # Card de pedido
│   │   │   └── kanban-column/     # Coluna do Kanban
│   │   └── orders.routes.ts
│   ├── products/
│   ├── customers/
│   └── tables/
│
├── pages/                         # Páginas principais
│   ├── login/
│   ├── register/
│   └── dashboard/
│
└── services/                      # Serviços globais
    └── user.service.ts            # Serviço de autenticação
```

## Princípios de Arquitetura

### 1. **Separação de Responsabilidades**
- **Core**: Funcionalidades fundamentais (interceptors, models, services base)
- **Shared**: Componentes reutilizáveis (header, sidebar)
- **Features**: Módulos de funcionalidades específicas
- **Pages**: Páginas principais da aplicação

### 2. **Standalone Components**
Todos os componentes são standalone, facilitando:
- Lazy loading
- Tree-shaking
- Manutenção

### 3. **Services Organizados por Módulo**
Cada módulo da API tem seu próprio service:
- `OrdersService` - Gerenciamento de pedidos
- `ProductsService` - Gerenciamento de produtos
- `CustomersService` - Gerenciamento de clientes
- `TablesService` - Gerenciamento de mesas

### 4. **Interceptors**
- **AuthInterceptor**: Adiciona automaticamente o token JWT em todas as requisições

### 5. **Componentes Pequenos e Reutilizáveis**
- `OrderCardComponent`: Card individual de pedido
- `KanbanColumnComponent`: Coluna do Kanban
- `HeaderComponent`: Cabeçalho reutilizável
- `SidebarComponent`: Menu lateral reutilizável

## Integração com API

### Configuração
A URL da API está configurada em `src/environments/environment.ts`:
```typescript
export const environment = {
  urlApi: 'https://pitaia-six.vercel.app',
  // ...
}
```

### Autenticação
- Token JWT armazenado em `localStorage`
- Interceptor adiciona automaticamente o header `Authorization`
- Service `UserService` gerencia autenticação e estado do usuário

### Endpoints Disponíveis
- `/api/auth/login` - Login
- `/api/auth/register` - Registro
- `/api/orders` - Pedidos
- `/api/products` - Produtos
- `/api/customers` - Clientes
- `/api/tables` - Mesas
- `/api/categories` - Categorias
- `/api/coupons` - Cupons

## Melhorias Implementadas

1. ✅ **Estrutura modular e organizada**
2. ✅ **Componentes pequenos e reutilizáveis**
3. ✅ **Services organizados por módulo**
4. ✅ **Interceptors para autenticação**
5. ✅ **Models TypeScript tipados**
6. ✅ **Layout components separados**
7. ✅ **Rotas lazy-loaded**
8. ✅ **Integração completa com API**

## Próximos Passos

1. Implementar páginas de listagem para cada feature
2. Adicionar formulários de criação/edição
3. Implementar tratamento de erros global
4. Adicionar loading states
5. Implementar notificações/toasts
6. Adicionar testes unitários

