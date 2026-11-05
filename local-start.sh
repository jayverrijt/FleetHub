#!/bin/bash
set -e

cd FleetHub_Backend
chmod +x gradlew
./gradlew bootJar -x test --no-daemon
cd ..

cd FleetHub_Frontend
npm install
npm run build
cd ..

docker compose -f docker-compose.local.yml up -d --build

echo "FleetHub is nu online"
echo "   - Frontend: http://localhost:3000"
echo "   - Backend API: http://localhost:8080"
echo "   - MySQL: localhost:3306"

