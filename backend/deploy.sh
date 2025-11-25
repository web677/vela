#!/bin/bash

# ========================================
# Vela Backend - Production Deployment Script
# ========================================

set -e  # Exit on error

echo "🚀 Starting Vela Backend Deployment..."
echo ""

# Check if .env file exists
if [ ! -f .env ]; then
    echo "❌ Error: .env file not found!"
    echo "Please copy .env.example to .env and fill in your values."
    exit 1
fi

# Load environment variables
export $(cat .env | grep -v '^#' | xargs)

# Validate required environment variables
REQUIRED_VARS=("SUPABASE_URL" "SUPABASE_ANON_KEY" "SUPABASE_SERVICE_ROLE_KEY" "JWT_SECRET")

for var in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!var}" ]; then
        echo "❌ Error: $var is not set in .env file"
        exit 1
    fi
done

echo "✅ Environment variables validated"
echo ""

# Build and start containers
echo "📦 Building Docker image..."
docker-compose build

echo ""
echo "🐳 Starting container..."
docker-compose up -d

echo ""
echo "⏳ Waiting for service to be ready..."
sleep 5

# Check if service is healthy
if docker-compose ps | grep -q "Up"; then
    echo ""
    echo "========================================="
    echo "✅ Deployment successful!"
    echo "========================================="
    echo "Backend API: http://localhost:3000/api"
    echo ""
    echo "View logs: docker-compose logs -f vela-api"
    echo "Stop service: docker-compose down"
    echo "========================================="
else
    echo ""
    echo "❌ Deployment failed! Check logs:"
    docker-compose logs vela-api
    exit 1
fi
