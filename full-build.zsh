#!/bin/zsh

set -euo pipefail
set -x


cd backend
    npm i
    npm prisma generate
    npm tsc
    npm prisma db push --accept -data-loss
cd ..

cd frontend
    npm i
    npm run build
cd ..