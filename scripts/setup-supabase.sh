#!/bin/bash

echo "Setting up Supabase for CloudLeave..."

# Install Supabase CLI (if not already installed)
if ! command -v supabase &> /dev/null; then
    echo "Installing Supabase CLI..."
    npm install -g supabase
fi

# Initialize Supabase project
echo "Initializing Supabase project..."
supabase init

# Start local Supabase
echo "Starting local Supabase..."
supabase start

echo "Supabase setup complete!"
echo "Please update your .env.local file with the following variables:"
echo "NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
