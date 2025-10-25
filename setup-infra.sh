#!/bin/bash

echo "🚀 Configurando infraestrutura do Pitaia..."

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Instalar dependências serverless
echo -e "${YELLOW}📦 Instalando dependências Serverless...${NC}"
cd infra/serverless/webhooks && npm install
cd ../etl && npm install
cd ../triggers && npm install
cd ../../..

# Instalar dependências Pulumi
echo -e "${YELLOW}📦 Instalando dependências Pulumi...${NC}"
cd infra/pulumi/dev && npm install
cd ../staging && npm install
cd ../prod && npm install
cd ../../..

# Subir containers
echo -e "${YELLOW}🐳 Subindo containers Docker...${NC}"
docker-compose up -d

# Aguardar containers ficarem prontos
echo -e "${YELLOW}⏳ Aguardando containers iniciarem...${NC}"
sleep 10

# Verificar status
echo -e "${YELLOW}✅ Verificando status dos serviços...${NC}"
docker-compose ps

echo ""
echo -e "${GREEN}✅ Infraestrutura configurada com sucesso!${NC}"
echo ""
echo "Serviços disponíveis:"
echo "  - PostgreSQL:  localhost:5432"
echo "  - MongoDB:     localhost:27017"
echo "  - Redis:       localhost:6379"
echo "  - RabbitMQ:    localhost:15672 (admin/admin123)"
echo "  - Prometheus:  localhost:9090"
echo "  - Grafana:     localhost:3001 (admin/admin)"
echo "  - Jaeger:      localhost:16686"
