#!/bin/bash


#!/bin/bash
set -euo pipefail

# Enable debugging
set -x

# Install dependencies
npm install

# Generate Prisma client
npx dotenv -- npx prisma generate

# Compile TypeScript files
npx tsc

# Push the Prisma schema to the database
npx dotenv -- npx prisma db push --accept-data-loss

# set -euo pipefail

# set -x

# npm i
# dotenv prisma generate
# tsc
# dotenv prisma db push --accept-data-loss
