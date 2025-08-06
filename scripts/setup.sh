#!/bin/bash

# Script de Setup do Assistente RH Inteligente
# Configura o ambiente de desenvolvimento completo

set -e

echo "🎤 Assistente RH Inteligente - Setup Automatizado"
echo "=================================================="

# Verificar se Docker está instalado
if ! command -v docker &> /dev/null; then
    echo "❌ Docker não encontrado. Por favor, instale o Docker primeiro."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose não encontrado. Por favor, instale o Docker Compose primeiro."
    exit 1
fi

# Criar arquivo .env se não existir
if [ ! -f .env ]; then
    echo "📝 Criando arquivo .env..."
    cat > .env << EOF
# Configurações do Banco de Dados
DB_PASSWORD=assistente_rh_secure_2024
REDIS_PASSWORD=redis_assistente_rh_2024

# OpenAI API
OPENAI_API_KEY=your_openai_api_key_here

# JWT Secret
JWT_SECRET_KEY=jwt_super_secret_key_assistente_rh_2024

# Ambiente
FLASK_ENV=development
NODE_ENV=development
EOF
    echo "✅ Arquivo .env criado. Configure suas chaves de API!"
fi

# Verificar se a chave da OpenAI está configurada
if grep -q "your_openai_api_key_here" .env; then
    echo "⚠️  ATENÇÃO: Configure sua chave da OpenAI no arquivo .env"
    echo "   Edite o arquivo .env e substitua 'your_openai_api_key_here' pela sua chave real"
fi

# Criar diretórios necessários
echo "📁 Criando diretórios..."
mkdir -p {logs,uploads,backups}

# Instalar dependências do backend
echo "🐍 Instalando dependências do backend..."
cd backend
if [ ! -d "venv" ]; then
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt
cd ..

# Instalar dependências do frontend
echo "⚛️  Instalando dependências do frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    npm install
fi
cd ..

# Configurar banco de dados
echo "🗄️  Configurando banco de dados..."
cd docker
docker-compose up -d postgres redis
sleep 10

# Executar migrações
echo "🔄 Executando migrações..."
cd ../backend
source venv/bin/activate
export FLASK_APP=src.main:app
export DATABASE_URL=postgresql://assistente_rh_user:assistente_rh_secure_2024@localhost:5432/assistente_rh
flask db upgrade || echo "⚠️  Migrações serão executadas na primeira inicialização"
cd ..

echo ""
echo "🎉 Setup concluído com sucesso!"
echo ""
echo "📋 Próximos passos:"
echo "1. Configure sua chave da OpenAI no arquivo .env"
echo "2. Execute: docker-compose up -d (para iniciar todos os serviços)"
echo "3. Acesse: http://localhost:3000 (Frontend)"
echo "4. API: http://localhost:5000 (Backend)"
echo ""
echo "🔧 Comandos úteis:"
echo "- Iniciar: docker-compose up -d"
echo "- Parar: docker-compose down"
echo "- Logs: docker-compose logs -f"
echo "- Rebuild: docker-compose up --build"
echo ""
echo "📚 Documentação completa em: ./docs/"

