#!/bin/bash

set -euo pipefail
set -x

echo "Starting deployment script..."

# Backend setup and build
cd backend || { echo "Error: backend directory not found"; exit 1; }

# Install TypeScript and types as regular dependencies (not dev dependencies)
pnpm add typescript @types/node @types/express

# Ensure tsconfig.json has the correct paths
echo '{
  "compilerOptions": {
    "target": "es2020",
    "module": "commonjs",
    "lib": ["es2020"],
    "outDir": "./dist",
    "rootDir": ".",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "typeRoots": ["./node_modules/@types"]
  },
  "include": [
    "routes/**/*",
    "utils/**/*",
    "config/**/*"
  ],
  "exclude": ["node_modules"]
}' > tsconfig.json


# Single consolidated dependency installation including types
echo "Installing backend dependencies and type definitions..."
pnpm i
pnpm add -D typescript @types/node @types/express @types/bcryptjs @types/jsonwebtoken

# Database operations
echo "Executing Prisma operations..."
pnpm exec prisma generate
pnpm exec prisma db push --accept-data-loss

# TypeScript compilation
echo "Compiling TypeScript code..."
pnpm exec tsc

# Frontend setup and build
cd ../frontend || { echo "Error: frontend directory not found"; exit 1; }

echo "Installing frontend dependencies..."
pnpm i

echo "Building frontend code..."
pnpm run build

echo "Deployment script complete!"
