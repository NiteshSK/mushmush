#!/bin/bash

echo "🧹 Starting clean deployment process..."

# Clean build artifacts
echo "🗑️  Cleaning build artifacts..."
rm -rf .next
rm -rf node_modules/.cache
rm -rf .vercel

# Fresh install
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Build the project
echo "🏗️  Building project..."
npm run build

# Deploy to production
echo "🚀 Deploying to production..."
vercel --prod

echo "✅ Clean deployment completed!"
