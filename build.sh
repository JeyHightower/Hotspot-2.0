#!/bin/bash

set -euo pipefail
set -x

echo "Starting deployment script..."
# Add license fields to package.json files
echo '{"name": "hotspot-root", "license": "MIT"}' > package.json
cd backend && echo '{
  "name": "hotspot-backend",
  "license": "MIT",
  "scripts": {
    "build": "tsc"
  }
}' > package.json
cd ../frontend && echo '{
  "name": "hotspot-frontend",
  "license": "MIT",
  "scripts": {
    "build": "vite build"
  }
}' > package.json

cd ../backend

# Install TypeScript and all type definitions as regular dependencies
yarn add typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken express bcryptjs jsonwebtoken prisma node express-validator

# Force yarn to rebuild all packages
yarn install --force

# Create tsconfig.json with complete configuration
echo '{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020", "dom"],
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "typeRoots": ["./node_modules/@types"],
    "types": ["node", "express"],
    "moduleResolution": "node"
  },
  "include": [
    "routes/**/*",
    "utils/**/*",
    "config/**/*"
  ],
  "exclude": ["node_modules"]
}' > tsconfig.json

# Database operations
echo "Executing Prisma operations..."
yarn prisma generate
yarn prisma db push --accept-data-loss

# TypeScript compilation
echo "Compiling TypeScript code..."
yarn tsc

# Frontend setup and build
cd ../frontend
yarn add vite @vitejs/plugin-react
yarn install
yarn build