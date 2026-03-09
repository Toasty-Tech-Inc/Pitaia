# Stage 1: Dependencies
FROM node:20-slim AS deps

WORKDIR /app

# OpenSSL para Prisma (necessário no stage onde roda pnpm install)
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

RUN corepack enable && corepack prepare pnpm@latest --activate

# Desabilitar postinstall do Prisma dentro do Docker
ENV SKIP_PRISMA_GENERATE=1

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile


# Stage 2: Build
FROM node:20-slim AS builder

WORKDIR /app

RUN corepack enable && corepack prepare pnpm@latest --activate

COPY package.json pnpm-lock.yaml ./
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Prisma generate (usa URL fictícia - só gera o client)
ENV DATABASE_URL="postgresql://placeholder:placeholder@localhost:5432/placeholder"
RUN npx prisma generate --schema apps/api/prisma/schema.prisma

# Build API - usa development para main.ts (serverless usa serverless.ts para Lambda)
ENV NODE_ENV=development
RUN pnpm exec nx build api --configuration=development


# Stage 3: Production
FROM node:20-slim AS runner

WORKDIR /app

# OpenSSL também no runtime (para Prisma em produção)
RUN apt-get update -y \
  && apt-get install -y --no-install-recommends openssl ca-certificates \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production
ENV PORT=3000

# Copiar artefatos do build
COPY --from=builder /app/dist/apps/api ./
COPY --from=builder /app/apps/api/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/package.json ./
COPY --from=builder /app/node_modules ./node_modules

EXPOSE 3000

# Migrations são executadas pelo entrypoint ou CI/CD
CMD ["node", "main.js"]
