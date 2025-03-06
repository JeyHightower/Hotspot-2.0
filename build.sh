#!/bin/bash
set -e  # Exit immediately if a command exits with a non-zero status

echo "NODE_ENV is: $NODE_ENV"
echo "Checking DATABASE_URL..."
if [ -z "$DATABASE_URL" ]; then
    echo "DATABASE_URL is not set!"
    exit 1
fi

# Set environment
export NODE_VERSION=18.18.0
export NODE_ENV=production

# Activate npm
corepack prepare npm@latest --activate

# Frontend build
cd frontend
rm -rf node_modules package-lock.json dist
npm cache clean --force
npm install
npm run build

cd ..

# Backend build
cd backend
rm -rf node_modules package-lock.json dist
npm cache clean --force

# Install all dependencies (including devDependencies)
npm install

# Generate Prisma client
npx prisma generate

# Database setup
echo "Pushing database schema..."
npx prisma db push --accept-data-loss

echo "Running database seed..."
npm run seed || {
    echo "Seeding failed, but continuing build..."
}

# Build TypeScript
npm run build || {
    echo "TypeScript build failed"
    exit 1
}

# Create frontend directory and copy build files
# Modified to match the path expected in app.ts
mkdir -p frontend/dist
cp -r ../frontend/dist/* frontend/dist/
chmod -R 755 frontend/dist

# Remove dev dependencies after build
npm prune --production

cd ..
