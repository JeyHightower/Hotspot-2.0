#!/bin/bash

set -euo pipefail

# Enable corepack and set yarn version
corepack enable
yarn set version 4.5.3

echo "Starting optimized deployment..."

# Backend build
cd backend
yarn install --immutable --immutable-cache
yarn prisma generate
yarn build

# Frontend build with production optimization
cd ../frontend
yarn install --immutable --immutable-cache
NODE_ENV=production yarn build

cd ..



#





# set -euo pipefail

# corepack enable
# yarn set version 4.5.3

# echo "Starting deployment script..."

# cd backend

# # Install dependencies
# yarn install --frozen-lockfile

# # Generate Prisma client
# yarn prisma generate

# # Build backend
# yarn build

# cd ../frontend

# # Install and build frontend
# yarn install
# yarn build

# cd ..
