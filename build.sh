#!/bin/bash

# Set environment
export NODE_VERSION=18.18.0
export NODE_ENV=production

# Activate npm
corepack prepare npm@latest --activate

# Install all dependencies
npm run install:all

# Database setup
npm run db:migrate
npm run db:seed

# Build both apps
npm run build
