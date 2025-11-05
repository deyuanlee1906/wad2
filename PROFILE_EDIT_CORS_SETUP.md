# Profile Editing Page - CORS Setup & Testing Instructions

## Overview
The Profile Editing page has been completely reset with Firebase v9 modular SDK and supports:
- Profile picture upload to Firebase Storage
- Username change (Firestore)
- Bio change (Firestore)
- Email change (Firebase Auth + Firestore)
- Password change (Firebase Auth)

## Firebase Storage Bucket
- **Bucket**: `wad2-login-5799b.firebasestorage.app`
- **Profile Picture Path**: `profilePictures/{user.uid}/profile.jpg`

## CORS Configuration

### Step 1: Update CORS Configuration
The CORS configuration file (`cors.json`) should include your origins:

```json
[
  {
    "origin": ["http://localhost:10000", "https://chopelah.onrender.com"],
    "method": ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    "responseHeader": [
      "Content-Type",
      "Authorization",
      "Content-Length",
      "User-Agent",
      "X-Goog-Resumable",
      "x-goog-resumable"
    ],
    "maxAgeSeconds": 3600
  }
]
```

### Step 2: Apply CORS to Firebase Storage
Run the following command to apply CORS configuration to your Firebase Storage bucket:

```bash
gsutil cors set cors.json gs://wad2-login-5799b.firebasestorage.app
```

**Note**: You need to have Google Cloud SDK installed and authenticated.

### Step 3: Verify CORS Configuration
Check if CORS is properly configured:

```bash
gsutil cors get gs://wad2-login-5799b.firebasestorage.app
```

## Testing Instructions

### Testing CORS Issues

If you encounter CORS errors when uploading profile pictures:

1. **Clear Browser Cache**
   - Chrome/Edge: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Firefox: `Ctrl+Shift+Delete` (Windows) or `Cmd+Shift+Delete` (Mac)
   - Safari: `Cmd+Option+E` (Mac)

2. **Use Incognito/Private Mode**
   - Chrome/Edge: `Ctrl+Shift+N` (Windows) or `Cmd+Shift+N` (Mac)
   - Firefox: `Ctrl+Shift+P` (Windows) or `Cmd+Shift+P` (Mac)
   - Safari: `Cmd+Shift+N` (Mac)

3. **Hard Refresh**
   - Windows: `Ctrl+F5` or `Ctrl+Shift+R`
   - Mac: `Cmd+Shift+R`

### Common CORS Errors

1. **"CORS policy: No 'Access-Control-Allow-Origin' header"**
   - Solution: Verify CORS configuration is applied to the bucket
   - Run: `gsutil cors set cors.json gs://wad2-login-5799b.firebasestorage.app`

2. **"CORS policy: Method not allowed"**
   - Solution: Ensure all required HTTP methods are in `cors.json`

3. **"CORS policy: Request header not allowed"**
   - Solution: Add missing headers to `responseHeader` in `cors.json`

## Firebase Configuration

Update the `firebaseConfig` object in `edit-profile.html` with your actual Firebase API key:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE", // Replace with your actual API key
  authDomain: "wad2-login-5799b.firebaseapp.com",
  projectId: "wad2-login-5799b",
  storageBucket: "wad2-login-5799b.firebasestorage.app",
  messagingSenderId: "148986270821",
  appId: "1:148986270821:web:fc17df5adf49b464a1628c"
};
```

## Firebase Storage Rules

Ensure your Firebase Storage rules allow authenticated users to upload:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Allow authenticated users to upload profile pictures
    match /profilePictures/{userId}/{allPaths=**} {
      allow read: if true; // Anyone can read profile pictures
      allow write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

## Features

### Profile Picture Upload
- Supported formats: JPG, PNG, GIF
- Maximum file size: 5MB
- Storage path: `profilePictures/{user.uid}/profile.jpg`
- Automatically deletes old profile picture when uploading a new one

### Username Change
- Validates uniqueness via `usernames` collection
- Format: 3-20 characters, lowercase letters, numbers, and underscores only
- Updates both `users` and `usernames` collections

### Bio Change
- Free-form text
- Can be empty (clears bio)
- Stored in Firestore `users` collection

### Email Change
- Requires reauthentication if session is old
- Updates both Firebase Auth and Firestore
- Updates username mapping email if exists

### Password Change
- Strong password validation (8+ chars, uppercase, lowercase, number, special char)
- Requires reauthentication if session is old
- Updates Firebase Auth only

## Error Handling

The page includes comprehensive error handling for:
- Upload failures (file size, type, storage quota, permissions)
- Authentication errors (session expired, wrong password)
- CORS errors (with helpful messages)
- Network errors
- Validation errors

All errors are displayed in user-friendly messages with specific guidance.

## Browser Compatibility

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Notes

- All changes persist permanently in Firebase
- Profile pictures are stored in Firebase Storage
- User data (username, bio) is stored in Firestore
- Email and password are managed by Firebase Auth
- The page automatically loads user data on page load
- User is redirected to login if not authenticated

