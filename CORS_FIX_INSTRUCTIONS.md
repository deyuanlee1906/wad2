# CORS Fix - Storage Bucket Update

## Problem
The app was trying to use the old storage bucket (`wad2-login-5799b.appspot.com`) which doesn't exist, causing CORS errors.

## Solution Applied
✅ Updated all storage initialization to use the new bucket: `wad2-login-5799b.firebasestorage.app`
✅ Applied CORS configuration to the new bucket
✅ Updated all Firebase config files

## IMPORTANT: Clear Browser Cache

The old bucket URL might be cached in your browser. You **MUST** clear your cache:

### Option 1: Hard Refresh (Quick)
1. **Windows/Linux**: Press `Ctrl + Shift + R` or `Ctrl + F5`
2. **Mac**: Press `Cmd + Shift + R`
3. This forces the browser to reload all files from the server

### Option 2: Clear Cache (Thorough)
1. **Chrome/Edge**:
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "Cached images and files"
   - Select "All time"
   - Click "Clear data"

2. **Firefox**:
   - Press `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Select "Cache"
   - Select "Everything"
   - Click "Clear Now"

3. **Safari**:
   - Press `Cmd+Option+E` to empty caches
   - Or go to Safari > Preferences > Advanced > "Show Develop menu"
   - Then Develop > Empty Caches

### Option 3: Use Incognito/Private Mode (Recommended for Testing)
1. Open a new incognito/private window
2. Navigate to your app
3. This ensures no cached files are used

## Verify It's Working

After clearing cache:
1. Open browser console (F12)
2. Go to your profile page
3. Try uploading a post image
4. Check the console - you should see:
   - `✅ Storage initialized with new bucket`
   - No CORS errors
   - Upload URL should show `firebasestorage.app` (NOT `appspot.com`)

## Files Updated
- ✅ `src/scripts/firebaseauth.js` - Updated storage bucket
- ✅ `src/pages/profile/profile.html` - Explicitly uses new bucket
- ✅ `src/pages/admin/online-order-seed-data.html` - Updated bucket
- ✅ `storage.rules` - Added rules for community posts
- ✅ CORS configuration applied to new bucket

## If Still Having Issues

1. **Check browser console** - Look for which bucket URL is being used
2. **Verify CORS is set**:
   ```bash
   gsutil cors get gs://wad2-login-5799b.firebasestorage.app
   ```
3. **Try different browser** - Test in Chrome, Firefox, or Safari
4. **Check network tab** - See if requests are going to the correct bucket

## Current CORS Configuration

The bucket is configured for:
- Origins: `http://localhost:10000`, `https://chopelah.onrender.com`
- Methods: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS
- Headers: Content-Type, Authorization, Content-Length, User-Agent, X-Goog-Resumable

