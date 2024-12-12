#!/bin/bash

set -euo pipefail
set -x

# Log the start of the script
echo "Starting deployment script..."

# Change into the backend directory
cd backend || { echo "Error: backend directory not found"; exit 1; }

# Install dependencies
echo "Installing backend dependencies..."
pnpm i || { echo "Error: failed to install backend dependencies"; exit 1; }

# Add @types/node as a dev dependency
echo "Adding @types/node as a dev dependency..."
pnpm add -D @types/node || { echo "Error: failed to add @types/node"; exit 1; }

# Generate Prisma client code
echo "Generating Prisma client code..."
pnpm exec prisma generate || { echo "Error: failed to generate Prisma client code"; exit 1; }

# Compile TypeScript code
echo "Compiling TypeScript code..."
pnpm exec tsc || { echo "Error: failed to compile TypeScript code"; exit 1; }

# Push Prisma schema to database
echo "Pushing Prisma schema to database..."
pnpm exec prisma db push --accept-data-loss || { echo "Error: failed to push Prisma schema"; exit 1; }

# Change into the frontend directory
cd ../frontend || { echo "Error: frontend directory not found"; exit 1; }

# Install dependencies
echo "Installing frontend dependencies..."
pnpm i || { echo "Error: failed to install frontend dependencies"; exit 1; }

# Build frontend code
echo "Building frontend code..."
pnpm run build || { echo "Error: failed to build frontend code"; exit 1; }

# Log the end of the script
echo "Deployment script complete!"