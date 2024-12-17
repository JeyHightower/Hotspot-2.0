#!/bin/bash

set -euo pipefail

echo "Starting deployment script..."

cd backend

# Install dependencies
yarn install --frozen-lockfile

# Generate Prisma client
yarn prisma generate

# Build backend
yarn build

cd ../frontend

# Install and build frontend
yarn install 
yarn build

cd ..
