#!/bin/bash
set -euo pipefail

# Enable debugging
set -x

# Generate Prisma client
npx dotenv -- npx prisma generate
yarn dotenv -- dlx prisma generate
# Compile TypeScript files
npx tsc
dlx tsc
# Push the Prisma schema to the database
npx dotenv -- npx prisma db push --accept-data-loss
dlx dotenv --dlx prisma db push --accept-data-loss
