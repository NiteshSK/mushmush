# Google Sign-In Troubleshooting Guide

## Issue: Google Sign-In Not Working

If you're experiencing issues with Google sign-in on the MushMush website, follow this comprehensive troubleshooting guide.

## Quick Diagnosis

### 1. Test the Authentication Configuration

Run the test script to check if Google provider is properly configured:

```bash
node test-auth.js
```

This will tell you:
- ✅ If Google provider is available
- ❌ If Google provider is missing
- Current session status

### 2. Check Environment Variables

Google OAuth requires these environment variables to be set:

**Required Variables:**
```env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret
```

**Check your .env or .env.local file:**
```bash
# View environment files (they might be hidden)
ls -la | grep env
```

## Common Issues and Solutions

### Issue 1: Google Provider Not Showing Up

**Symptoms:**
- Google sign-in button doesn't appear
- Test script shows "❌ Google provider is NOT configured"

**Causes:**
1. Missing environment variables
2. Incorrect environment variable names
3. Development server not restarted after env changes

**Solutions:**

1. **Set Environment Variables:**
   Create or update `.env.local` file:
   ```env
   GOOGLE_CLIENT_ID=your-actual-google-client-id.apps.googleusercontent.com
   GOOGLE_CLIENT_SECRET=your-actual-google-client-secret
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=generate-a-random-secret-here
   ```

2. **Generate NEXTAUTH_SECRET:**
   ```bash
   openssl rand -base64 32
   ```

3. **Restart Development Server:**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

### Issue 2: Google OAuth Credentials Not Working

**Symptoms:**
- Google provider shows up but sign-in fails
- Error messages about invalid credentials or redirect URIs

**Causes:**
1. Invalid Google OAuth credentials
2. Incorrect redirect URI configuration
3. OAuth consent screen not configured

**Solutions:**

1. **Verify Google Cloud Console Setup:**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Select your project
   - Navigate to "APIs & Services" > "Credentials"
   - Verify OAuth 2.0 Client ID exists

2. **Configure Redirect URIs:**
   In Google Cloud Console > Credentials > OAuth 2.0 Client IDs:
   - Add: `http://localhost:3000/api/auth/callback/google`
   - Add: `https://yourdomain.com/api/auth/callback/google` (for production)

3. **Configure OAuth Consent Screen:**
   - Go to "OAuth consent screen"
   - Fill in required fields:
     - App name: "MushMush"
     - User support email: your-email@example.com
     - Developer contact information: your-email@example.com
   - Add scopes: `../auth/userinfo.email`, `../auth/userinfo.profile`
   - Add test users (if in testing mode)

### Issue 3: Network or CORS Issues

**Symptoms:**
- Sign-in button works but nothing happens
- Browser console shows network errors

**Solutions:**

1. **Check Browser Console:**
   - Open Developer Tools (F12)
   - Look for errors in Console tab
   - Check Network tab for failed requests

2. **Verify Network Connectivity:**
   ```bash
   curl https://accounts.google.com/.well-known/openid-configuration
   ```

### Issue 4: Session Issues

**Symptoms:**
- Sign-in works but user is not authenticated
- Session disappears after page refresh

**Solutions:**

1. **Check Session Storage:**
   - Open Developer Tools > Application > Storage
   - Verify cookies are being set
   - Check localStorage for session data

2. **Verify Database Connection:**
   - Ensure Prisma is properly connected
   - Check if user records are being created

## Testing Steps

### Step 1: Verify Environment Setup
```bash
# Check if environment variables are loaded
node -e "console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? 'SET' : 'NOT SET')"
```

### Step 2: Test NextAuth Providers
```bash
node test-auth.js
```

### Step 3: Test Direct Provider Access
```bash
curl http://localhost:3000/api/auth/providers
```

### Step 4: Test Google Sign-in Flow
1. Open browser to `http://localhost:3000/signin`
2. Click "Sign In with Google"
3. Verify redirect to Google
4. Complete Google authentication
5. Verify redirect back to application

## Production Deployment

For production deployment, ensure:

1. **Environment Variables:**
   ```env
   GOOGLE_CLIENT_ID=production-client-id
   GOOGLE_CLIENT_SECRET=production-client-secret
   NEXTAUTH_URL=https://yourdomain.com
   NEXTAUTH_SECRET=production-secret
   ```

2. **Google Cloud Console:**
   - Add production redirect URI: `https://yourdomain.com/api/auth/callback/google`
   - Publish OAuth consent screen
   - Remove test user restrictions

3. **Domain Configuration:**
   - Ensure domain is properly configured
   - SSL certificate is valid
   - DNS records are correct

## Getting Help

If you're still experiencing issues:

1. Check browser console for specific error messages
2. Verify all steps in this guide
3. Check server logs for authentication errors
4. Ensure Google OAuth credentials are valid and not expired

## Code Changes Made

The following code changes were implemented to fix Google sign-in:

1. **Updated Sign-in Component** (`/src/components/Auth/Signin/index.tsx`):
   - Added `signIn` and `getProviders` from `next-auth/react`
   - Added state management for providers
   - Added click handler for Google sign-in
   - Conditional rendering of Google button based on provider availability

2. **Enhanced Test Script** (`/test-auth.js`):
   - Added comprehensive provider checking
   - Added environment variable guidance
   - Added session endpoint testing

These changes ensure that Google sign-in is properly integrated with NextAuth and will work correctly once environment variables are configured.
