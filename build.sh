#!/bin/bash

# Set environment
export NODE_VERSION=18.18.0
export NODE_ENV=production

# Activate npm
corepack prepare npm@latest --activate

# backend
cd backend

# Install dependencies and type definitions
npm install
npm install --save-dev @types/bcryptjs @types/cookie-parser @types/cors @types/csurf \
  @types/express @types/jsonwebtoken @types/morgan express-validator

# Generate Prisma client and run migrations
npx prisma generate
npx prisma migrate deploy
npx prisma db seed

# frontend
cd ../frontend
npm install
npm run build
cd ..


