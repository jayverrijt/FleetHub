#!/bin/bash
set -e

echo "==> [1/3] Backend compileren..."
cd FleetHub_Backend
chmod +x gradlew
./gradlew bootJar -x test --no-daemon
cd ..

echo "==> [2/3] Frontend compileren..."
cd FleetHub_Frontend
npm install
VITE_API_BASE_URL="http://localhost:8080/api" npm run build
cd ..

echo "==> [3/3] Containers herbouwen (database-volume blijft behouden)..."
docker compose -f docker-compose.local.yml build --no-cache frontend backend
docker compose -f docker-compose.local.yml up -d

echo "FleetHub is nu online"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8080"
echo "   - MySQL: localhost:3306"
