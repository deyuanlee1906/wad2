# Google OAuth Debugging Guide

## Step 1: Check Browser Console Errors

When you try to log in with Google, check the browser console (F12 → Console tab) for specific error codes.

Common errors and solutions:

### `auth/unauthorized-domain`
**Meaning**: Your Vercel domain is not in Firebase's authorized domains list.

**Fix**:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Project: `wad2-login-5799b`
3. Authentication → Settings → Authorized domains
4. Click "Add domain"
5. Enter your **exact Vercel domain** (e.g., `your-app.vercel.app`)
   - Do NOT include `https://`
   - Do NOT include trailing slashes
   - Use the exact domain shown in your Vercel dashboard

**Note**: The domain format should match exactly. Vercel provides:
- Production: `your-app.vercel.app`
- Preview: `your-app-git-branch.vercel.app`
- Custom: Your custom domain

Add each one you're using.

### `auth/popup-blocked`
**Meaning**: Browser is blocking the popup.

**Fix**:
1. Check browser popup settings
2. Allow popups for your Vercel domain
3. Or try using redirect flow (see below)

### `auth/operation-not-allowed`
**Meaning**: Google sign-in is not enabled in Firebase.

**Fix**:
1. Firebase Console → Authentication → Sign-in method
2. Click on "Google"
3. Enable it and configure OAuth consent screen

### `auth/network-request-failed`
**Meaning**: Network issue or CORS problem.

**Possible causes**:
- Firewall blocking Firebase
- CORS misconfiguration
- Network connectivity issue

### Other errors
Check the console for the exact error code and message. The updated code now logs full error details.

---

## Step 2: Verify Firebase Configuration

Your Firebase config should match:
```javascript
authDomain: "wad2-login-5799b.firebaseapp.com"
```

Make sure this matches your Firebase project exactly.

---

## Step 3: Verify Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: `wad2-login-5799b`
3. APIs & Services → OAuth consent screen
4. Check "Authorized domains":
   - Should include `vercel.app`
   - Should include your specific Vercel domain

---

## Step 4: Test Domain Authorization

Run this in your browser console on your Vercel deployment:

```javascript
console.log("Current domain:", window.location.hostname);
console.log("Firebase authDomain:", "wad2-login-5799b.firebaseapp.com");
```

Then verify:
1. The domain shown matches exactly what you added to Firebase
2. No typos or extra characters

---

## Step 5: Alternative - Use Redirect Instead of Popup

If popup continues to fail, you can switch to redirect flow. This is more reliable but requires handling redirect results.

**To implement redirect flow**, update `firebaseauth.js`:

1. Change imports:
```javascript
import { signInWithRedirect, getRedirectResult } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
```

2. Replace popup with redirect:
```javascript
// Change from:
await signInWithPopup(auth, provider);

// To:
await signInWithRedirect(auth, provider);
```

3. Handle redirect result on page load:
```javascript
// Add this after Firebase initialization
getRedirectResult(auth).then((result) => {
  if (result) {
    const user = result.user;
    // Handle successful login (same logic as popup success)
    localStorage.setItem('loggedInUserId', user.uid);
    // Check if new user and redirect accordingly
  }
}).catch((error) => {
  console.error("Redirect result error:", error);
});
```

---

## Step 6: Quick Checklist

- [ ] Vercel domain added to Firebase Authorized domains (exact match)
- [ ] Google sign-in enabled in Firebase Console
- [ ] OAuth consent screen configured in Google Cloud Console
- [ ] Checked browser console for specific error code
- [ ] No popup blockers active
- [ ] Using HTTPS (Vercel provides this automatically)
- [ ] Cleared browser cache/cookies

---

## Still Not Working?

If you've checked everything above, please provide:
1. Exact error code from browser console
2. Your Vercel domain URL
3. Screenshot of Firebase Authorized domains list
4. Browser and version you're testing with

This will help identify the specific issue.

