#!/bin/bash

set -euo pipefail

echo "Starting deployment script..."

# Root package.json
echo '{"name": "hotspot-root", "license": "MIT"}' > package.json

# Backend setup
cd backend
echo '{
  "name": "hotspot-backend",
  "license": "MIT",
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}' > package.json

# Install dependencies with exact versions
yarn add typescript@5.0.4 \
  @types/node@18.16.0 \
  @types/express@4.17.17 \
  @types/bcryptjs@2.4.2 \
  @types/jsonwebtoken@9.0.2 \
  express@4.18.2 \
  bcryptjs@2.4.3 \
  jsonwebtoken@9.0.0 \
  prisma@4.13.0 \
  express-validator@7.0.1 \
  @prisma/client@4.13.0

# Clean install
yarn install --frozen-lockfile

# TypeScript config
echo '{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}' > tsconfig.json

# Database setup
yarn prisma generate
yarn prisma db push --accept-data-loss

# Build backend
yarn build

# Frontend setup
cd ../frontend
echo '{
  "name": "hotspot-frontend",
  "license": "MIT",
  "scripts": {
    "build": "vite build"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}' > package.json

# Install frontend dependencies with exact versions
yarn add vite@4.3.1 \
  @vitejs/plugin-react@4.0.0 \
  react@18.2.0 \
  react-dom@18.2.0 \
  react-redux@8.0.5 \
  @reduxjs/toolkit@1.9.5

# Clean install and build frontend
yarn install --frozen-lockfile
yarn build














# #!/bin/bash

# set -euo pipefail
# set -x

# echo "Starting deployment script..."
# # Add license fields to package.json files
# echo '{"name": "hotspot-root", "license": "MIT"}' > package.json
# cd backend && echo '{
#   "name": "hotspot-backend",
#   "license": "MIT",
#   "scripts": {
#     "build": "tsc"
#   }
# }' > package.json
# cd ../frontend && echo '{
#   "name": "hotspot-frontend",
#   "license": "MIT",
#   "scripts": {
#     "build": "vite build"
#   }
# }' > package.json

# cd ../backend

# # Install TypeScript and all type definitions as regular dependencies
# yarn add typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken express bcryptjs jsonwebtoken prisma node express-validator

# # Force yarn to rebuild all packages
# yarn install --force

# # Create tsconfig.json with complete configuration
# echo '{
#   "compilerOptions": {
#     "target": "es2020",
#     "module": "commonjs",
#     "lib": ["es2020", "dom"],
#     "outDir": "./dist",
#     "rootDir": ".",
#     "strict": true,
#     "esModuleInterop": true,
#     "skipLibCheck": true,
#     "forceConsistentCasingInFileNames": true,
#     "typeRoots": ["./node_modules/@types"],
#     "types": ["node", "express"],
#     "moduleResolution": "node"
#   },
#   "include": [
#     "routes/**/*",
#     "utils/**/*",
#     "config/**/*"
#   ],
#   "exclude": ["node_modules"]
# }' > tsconfig.json

# # Database operations
# echo "Executing Prisma operations..."
# yarn prisma generate
# yarn prisma db push --accept-data-loss

# # TypeScript compilation
# echo "Compiling TypeScript code..."
# yarn tsc

# # Frontend setup and build
# cd ../frontend
# yarn add vite @vitejs/plugin-react react react-dom react-redux @reduxjs/toolkit
# yarn install
# yarn run build