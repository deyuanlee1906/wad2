# 🔧 Fix Google OAuth 403/503 Errors on chopelah.onrender.com

## Issues Identified

1. **403 Error on firebaseauth.js** - Domain not authorized in Firebase
2. **503 Error on index.html** - Server may be down or routing issue

## Step 1: Add Domain to Firebase Authorized Domains (CRITICAL)

This is the most common cause of OAuth errors. Firebase requires your production domain to be explicitly whitelisted.

### Instructions:

1. **Go to Firebase Console**
   - Visit: https://console.firebase.google.com/
   - Select project: **wad2-login-5799b**

2. **Navigate to Authorized Domains**
   - Click: **Authentication** (left sidebar)
   - Click: **Settings** tab
   - Scroll down to: **Authorized domains** section

3. **Add Your Domain**
   - Click: **Add domain** button
   - Enter: `chopelah.onrender.com`
     - ⚠️ **Important**: Do NOT include `https://` or trailing slashes
     - Just the domain: `chopelah.onrender.com`
   - Click: **Add**

4. **Verify the Domain Appears**
   - You should now see:
     - `localhost` (default)
     - `chopelah.onrender.com` (your addition)
     - `wad2-login-5799b.firebaseapp.com` (default)

## Step 2: Verify Google OAuth Provider is Enabled

1. In Firebase Console, go to: **Authentication** → **Sign-in method**
2. Find **Google** in the list
3. Click on it
4. Ensure:
   - ✅ **Enable** toggle is ON
   - ✅ **Project support email** is set
   - ✅ **Project public-facing name** is set

## Step 3: Update Google Cloud Console OAuth Settings

1. **Go to Google Cloud Console**
   - Visit: https://console.cloud.google.com/
   - Select project: **wad2-login-5799b**

2. **OAuth Consent Screen**
   - Navigate to: **APIs & Services** → **OAuth consent screen**
   - Check **Authorized domains** section
   - Ensure it includes:
     - `onrender.com` (wildcard for all Render domains)
     - Or specifically: `chopelah.onrender.com`

3. **OAuth 2.0 Client IDs**
   - Navigate to: **APIs & Services** → **Credentials**
   - Find your OAuth 2.0 Client ID (the one used by Firebase)
   - Click to edit
   - Check **Authorized JavaScript origins**:
     - Should include: `https://chopelah.onrender.com`
   - Check **Authorized redirect URIs**:
     - Should include: `https://chopelah.onrender.com/__/auth/handler`

## Step 4: Verify Server is Running

The 503 error suggests the server might be down. Check:

1. **Render Dashboard**
   - Go to: https://dashboard.render.com/
   - Check if your service is **Running** (green status)
   - If it's down, check logs for errors

2. **Test Health Endpoint**
   - Visit: `https://chopelah.onrender.com/api/health`
   - Should return: `{"status":"OK",...}`

3. **Test Static File Serving**
   - Visit: `https://chopelah.onrender.com/scripts/firebaseauth.js`
   - Should return the JavaScript file (not 403 or 404)

## Step 5: Clear Browser Cache

After making Firebase changes:

1. **Clear Cache**
   - Open browser DevTools (F12)
   - Right-click refresh button → **Empty Cache and Hard Reload**
   - Or: Settings → Clear browsing data → Cached images and files

2. **Try Again**
   - Go to: `https://chopelah.onrender.com`
   - Try Google sign-in again

## Step 6: Check Browser Console for Specific Errors

Open browser DevTools (F12) → Console tab, and look for:

- `auth/unauthorized-domain` → Domain not in Firebase Authorized Domains
- `auth/popup-blocked` → Browser blocking popup
- `auth/operation-not-allowed` → Google provider not enabled
- `auth/network-request-failed` → Network/CORS issue

## Quick Fix Checklist

- [ ] Added `chopelah.onrender.com` to Firebase Authorized Domains
- [ ] Google OAuth provider is enabled in Firebase
- [ ] OAuth consent screen configured in Google Cloud Console
- [ ] Render service is running (check dashboard)
- [ ] Health endpoint returns OK: `https://chopelah.onrender.com/api/health`
- [ ] Cleared browser cache
- [ ] Tested on `https://chopelah.onrender.com` (not localhost)

## Still Getting Errors?

### If 403 persists:
- Double-check domain spelling: `chopelah.onrender.com` (no typos)
- Verify it's in Firebase Console → Authentication → Settings → Authorized domains
- Wait 1-2 minutes after adding (Firebase may take time to propagate)

### If 503 persists:
- Check Render dashboard for service status
- Check Render logs for errors
- Verify server is binding to `process.env.PORT` (not hardcoded port)
- Check if Render service needs to be restarted

### Alternative: Use Redirect Instead of Popup

If popup continues to fail, the code already supports redirect flow. The `firebaseauth.js` file has both `signInWithPopup` and `signInWithRedirect` options.

---

**After completing these steps, Google OAuth should work on `chopelah.onrender.com`!** 🎉

