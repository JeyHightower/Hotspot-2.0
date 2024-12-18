#!/bin/bash

set -euo pipefail

export NODE_VERSION=20.10.0
export NODE_ENV=production

corepack enable
yarn set version 4.5.3

echo "Starting production build..."

# Backend build
cd backend
yarn install
yarn prisma generate
yarn build

# Frontend build
cd ../frontend
yarn install
yarn build

cd ..
