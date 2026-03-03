#!/bin/bash

# Code Net - Quick Deploy Script
# This script helps you deploy the application quickly

echo "🚀 Code Net - Deploy Script"
echo "============================"
echo ""

# Check if .env files exist
if [ ! -f "client/.env" ]; then
    echo "❌ Error: client/.env not found!"
    echo "Please copy client/.env.example to client/.env and fill in your Firebase credentials"
    exit 1
fi

if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env not found in root directory"
    echo "If you're using OTP feature, please create .env with GMAIL_USER and GMAIL_APP_PASSWORD"
    echo ""
fi

# Ask which platform to deploy
echo "Select deployment platform:"
echo "1) Vercel (Frontend only)"
echo "2) Netlify (Frontend only)"
echo "3) Build only (test build)"
echo "4) Exit"
echo ""
read -p "Enter your choice (1-4): " choice

case $choice in
    1)
        echo ""
        echo "📦 Building frontend..."
        cd client
        npm install
        npm run build
        
        echo ""
        echo "🚀 Deploying to Vercel..."
        npx vercel --prod
        
        echo ""
        echo "✅ Deployment complete!"
        echo "Don't forget to:"
        echo "1. Set environment variables in Vercel dashboard"
        echo "2. Deploy backend separately (Railway/Render)"
        echo "3. Update backend URL in frontend code"
        ;;
    2)
        echo ""
        echo "📦 Building frontend..."
        cd client
        npm install
        npm run build
        
        echo ""
        echo "🚀 Deploying to Netlify..."
        npx netlify deploy --prod
        
        echo ""
        echo "✅ Deployment complete!"
        echo "Don't forget to:"
        echo "1. Set environment variables in Netlify dashboard"
        echo "2. Deploy backend separately (Railway/Render)"
        echo "3. Update backend URL in frontend code"
        ;;
    3)
        echo ""
        echo "📦 Building frontend..."
        cd client
        npm install
        npm run build
        
        if [ $? -eq 0 ]; then
            echo ""
            echo "✅ Build successful!"
            echo "Preview build: npm run preview"
        else
            echo ""
            echo "❌ Build failed! Check errors above."
            exit 1
        fi
        ;;
    4)
        echo "Exiting..."
        exit 0
        ;;
    *)
        echo "Invalid choice!"
        exit 1
        ;;
esac
