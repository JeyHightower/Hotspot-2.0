NODE_VERSION=18.18.0

#!/bin/bash

set -euo pipefail

# Set Node version and enable Corepack globally
export NODE_VERSION=18.18.0
export NODE_ENV=production

# Enable Corepack with sudo for system-wide access
sudo corepack enable
sudo corepack prepare yarn@4.5.3 --activate

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
