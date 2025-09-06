#!/bin/bash

# Check for existing Next.js development servers
echo "Checking for existing development servers..."
EXISTING_PROCESSES=$(ps aux | grep -E "next-server|npm.*dev" | grep -v grep)

if [ ! -z "$EXISTING_PROCESSES" ]; then
    echo "Found existing development servers:"
    echo "$EXISTING_PROCESSES"
    echo ""
    read -p "Kill existing servers and start fresh? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo "Killing existing development servers..."
        # Kill all Next.js and npm dev processes
        pkill -f "next-server"
        pkill -f "npm.*dev"
        pkill -f "next dev"
        sleep 2
        echo "Existing servers terminated."
    else
        echo "Keeping existing servers. Exiting..."
        exit 0
    fi
fi

echo "Starting development server..."
npm run dev
