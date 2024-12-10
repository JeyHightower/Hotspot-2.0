#!/bin/zsh

set -euo pipefail  # Exit immediately if a command exits with a non-zero status, treat unset variables as an error, and fail on any command in a pipeline that fails.
set -x             # Print each command before executing it for debugging purposes.

# Navigate to the backend directory and run commands
npm run tsc
npm install @prisma/client prisma --save-dev
cd backend || { echo "Failed to change directory to backend"; exit 1; }
npm install        # Use 'npm install' instead of 'npm i' for clarity
npx prisma generate
npm run tsc        # Use 'npm run tsc' to ensure the command is run correctly
npm prisma db push --accept-data-loss  # Fixed typo: changed '-data-loss' to '--accept-data-loss'
cd ..

# Navigate to the frontend directory and run commands
cd frontend || { echo "Failed to change directory to frontend"; exit 1; }
npm install        # Use 'npm install' instead of 'npm i' for clarity
npm run build
cd ..