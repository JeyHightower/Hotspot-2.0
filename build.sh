#!/bin/bash

set -euo pipefail

# Enable corepack and set yarn version
#!/bin/bash

set -euo pipefail

# Set Node version to LTS
export NODE_VERSION=18.17.0

corepack enable
yarn set version 4.5.3

echo "Starting production build..."

# Backend build
cd backend
DISABLE_WATCHING=true yarn install --frozen-lockfile
yarn prisma generate
yarn build

# Frontend build
cd ../frontend
DISABLE_WATCHING=true yarn install --frozen-lockfile
VITE_DISABLE_WATCHER=true yarn build

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
