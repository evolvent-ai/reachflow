#!/bin/bash

# Load nvm
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use Node.js v22
echo "Switching to Node.js v22..."
nvm use 22

# Check Node version
echo "Node version: $(node --version)"
echo "npm version: $(npm --version)"
echo ""

# Start development server
echo "Starting development server..."
npm run dev
