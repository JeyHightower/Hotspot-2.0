#!/bin/bash

# Set Node version and environment
export NODE_VERSION=18.18.0
export NODE_ENV=production

# Activate latest npm
corepack prepare npm@latest --activate

# Backend build
cd backend
npm install --omit=optional
npx prisma generate
npx tsc

# Frontend build
cd ../frontend
npm install --omit=optional
vite build

cd ..
