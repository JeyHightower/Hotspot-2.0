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

# Create ToolTip component if it doesn't exist
mkdir -p src/components/ToolTip
if [ ! -f "src/components/ToolTip/index.jsx" ]; then
    echo "Creating ToolTip component..."
    cat > src/components/ToolTip/index.jsx << 'EOL'
import React from 'react';
import './ToolTip.css';

const ToolTip = ({ text, children }) => {
  return (
    <div className="tooltip-container">
      {children}
      <div className="tooltip-text">{text}</div>
    </div>
  );
};

export default ToolTip;
EOL
fi

if [ ! -f "src/components/ToolTip/ToolTip.css" ]; then
    echo "Creating ToolTip styles..."
    cat > src/components/ToolTip/ToolTip.css << 'EOL'
.tooltip-container {
  position: relative;
  display: inline-block;
}

.tooltip-text {
  visibility: hidden;
  position: absolute;
  z-index: 1;
  bottom: 125%;
  left: 50%;
  transform: translateX(-50%);
  background-color: rgba(0, 0, 0, 0.8);
  color: white;
  text-align: center;
  padding: 5px 10px;
  border-radius: 6px;
  font-size: 14px;
  white-space: nowrap;
}

.tooltip-container:hover .tooltip-text {
  visibility: visible;
}
EOL
fi

npm run build

cd ..

# backend
cd backend

# Clean install dependencies
rm -rf node_modules package-lock.json dist
npm cache clean --force
npm install

# Database setup (add these before seeding)
echo "Generating Prisma Client..."
npx prisma generate

echo "Pushing database schema..."
npx prisma db push --accept-data-loss

echo "Running database seed..."
NODE_ENV=production npx prisma db seed

# Build TypeScript
npm run build

# Create frontend directory and copy build files
mkdir -p dist/frontend/dist
cp -r ../frontend/dist/* dist/frontend/dist/
chmod -R 755 dist/frontend/dist

# Remove dev dependencies after build
npm prune --production

cd ..
