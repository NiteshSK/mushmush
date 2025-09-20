#!/bin/bash

# Production Blog API Debug Script
# This script uses curl to test API endpoints with detailed debugging

echo "🚀 Production Blog API Debug Script"
echo "=================================="

# Replace with your actual production domain
DOMAIN="www.mushmush.in"

if [ "$DOMAIN" = "your-domain.com" ]; then
    echo "⚠️  Please update the DOMAIN variable in this script to your actual production domain"
    exit 1
fi

echo "📍 Testing domain: $DOMAIN"
echo ""

# Test 1: Blog listing API
echo "📡 Test 1: Blog listing API (/api/blog)"
echo "----------------------------------------"
curl -v "https://$DOMAIN/api/blog" \
    -H "Content-Type: application/json" \
    -H "Accept: application/json" \
    -H "User-Agent: MushMush-Blog-Debug/1.0" \
    --connect-timeout 10 \
    --max-time 30 \
    2>&1 | head -50

echo ""
echo "----------------------------------------"
echo ""

# Test 2: Check if we get HTML instead of JSON (common redirect issue)
echo "📡 Test 2: Check response content type"
echo "----------------------------------------"
response=$(curl -s -I "https://$DOMAIN/api/blog" 2>/dev/null)
content_type=$(echo "$response" | grep -i "content-type" | head -1)
location=$(echo "$response" | grep -i "location" | head -1)

echo "Content-Type: $content_type"
echo "Location: $location"

if echo "$content_type" | grep -qi "text/html"; then
    echo "⚠️  WARNING: Getting HTML instead of JSON - indicates redirect to page"
fi

if echo "$location" | grep -q "/"; then
    echo "🔄 Redirect detected to: $location"
fi

echo ""
echo "----------------------------------------"
echo ""

# Test 3: Try with explicit JSON acceptance
echo "📡 Test 3: Explicit JSON acceptance"
echo "----------------------------------------"
curl -s "https://$DOMAIN/api/blog" \
    -H "Accept: application/json, text/plain, */*" \
    -H "Content-Type: application/json" \
    --connect-timeout 10 \
    --max-time 30

echo ""
echo "----------------------------------------"
echo ""

# Test 4: Check if the domain is accessible at all
echo "📡 Test 4: Basic domain accessibility"
echo "----------------------------------------"
curl -s -I "https://$DOMAIN" --connect-timeout 10 --max-time 30 | head -10

echo ""
echo "=================================="
echo "🔍 Debug Complete"
echo ""
echo "If you see redirects (302) or HTML responses instead of JSON,"
echo "this indicates:"
echo "1. Authentication middleware redirecting to login"
echo "2. Route configuration issues"
echo "3. Domain/HTTPS configuration problems"
echo ""
echo "Next steps:"
echo "1. Check if the API endpoint requires authentication"
echo "2. Verify the domain is correct and accessible"
echo "3. Check for any middleware that might be intercepting API calls"
