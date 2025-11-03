# Vercel + Firebase OAuth Setup Guide

## Issue: Google Login Not Working on Vercel

When deploying to Vercel, Google OAuth login may fail because Firebase requires authorized redirect URIs to be whitelisted in your Firebase Console.

## Solution: Update Firebase Authorized Domains

### Step 1: Get Your Vercel Domain
1. Deploy your app to Vercel (or check your existing deployment)
2. Note your Vercel URL (e.g., `https://your-app.vercel.app`)

### Step 2: Add Vercel Domain to Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wad2-login-5799b**
3. Navigate to: **Authentication** → **Settings** → **Authorized domains**
4. Click **Add domain**
5. Enter your Vercel domain (without `https://`):
   - `your-app.vercel.app`
   - `*.vercel.app` (for preview deployments)

### Step 3: Verify OAuth Providers

1. In Firebase Console, go to **Authentication** → **Sign-in method**
2. Ensure **Google** is enabled
3. Ensure **Facebook** is enabled (if using)
4. For Google:
   - Check that **Project support email** is set
   - Verify **OAuth consent screen** is configured in Google Cloud Console

### Step 4: Update OAuth Consent Screen (Google Cloud Console)

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **wad2-login-5799b** (or the associated project)
3. Navigate to: **APIs & Services** → **OAuth consent screen**
4. Add authorized domains:
   - `vercel.app`
   - Your specific Vercel domain

### Step 5: Test

After updating:
1. Clear browser cache/cookies
2. Try Google login on your Vercel deployment
3. Check browser console for any CORS or redirect errors

## Common Issues & Solutions

### Issue: "redirect_uri_mismatch" Error
**Solution**: Make sure your Vercel domain is added to Firebase Authorized domains

### Issue: Popup Blocked
**Solution**: 
- Check browser popup blocker settings
- Ensure your Vercel domain uses HTTPS (Vercel provides this automatically)
- Try `signInWithRedirect` instead of `signInWithPopup` if popups are blocked

### Issue: CORS Error
**Solution**: 
- Verify Firebase config `authDomain` matches your project
- Ensure all domains are whitelisted in Firebase Console

## Alternative: Use Redirect Instead of Popup

If popup authentication continues to fail, you can modify `firebaseauth.js` to use redirect instead:

```javascript
// Change from:
await signInWithPopup(auth, provider);

// To:
await signInWithRedirect(auth, provider);
```

Then handle the redirect result:
```javascript
import { getRedirectResult } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Check for redirect result after page load
getRedirectResult(auth).then((result) => {
  if (result) {
    // User signed in via redirect
    const user = result.user;
    // Handle success...
  }
});
```

## Testing Checklist

- [ ] Vercel domain added to Firebase Authorized domains
- [ ] Google OAuth provider enabled in Firebase
- [ ] OAuth consent screen configured in Google Cloud Console
- [ ] Firebase config matches project settings
- [ ] HTTPS enabled on Vercel (automatic)
- [ ] Tested on actual Vercel deployment (not localhost)

