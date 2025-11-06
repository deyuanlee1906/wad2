# 🔥 Firebase Storage Setup Guide for Profile Pictures

This guide explains how to configure Firebase Storage for profile picture uploads in the Edit Profile page.

---

## 📋 Prerequisites

- Firebase project created (`wad2-login-5799b`)
- Firebase Storage enabled in your project
- Firebase Authentication enabled
- Firebase Firestore enabled

---

## 🔧 Step 1: Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **wad2-login-5799b**
3. Click **Storage** in the left sidebar
4. If you see "Get started", click it to enable Storage
5. Choose a location (recommended: `asia-southeast1` for Singapore)
6. Click **Done**

---

## 🔒 Step 2: Configure Firebase Storage Security Rules

The Storage rules ensure that:
- Anyone can view profile pictures (for displaying in the app)
- Only authenticated users can upload their own profile pictures
- Users can only upload to their own folder (`profilePictures/{userId}/profile.jpg`)

### Rules Configuration:

1. In Firebase Console, go to **Storage** → **Rules** tab
2. **Delete all existing rules** and paste the following:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Profile pictures: users can only upload their own
    match /profilePictures/{userId}/{allPaths=**} {
      // Allow read access to anyone (for displaying profile pictures)
      allow read: if true;
      
      // Allow write (upload/delete) only if:
      // 1. User is authenticated
      // 2. The userId in the path matches their UID
      allow write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

3. Click **Publish** to save the rules
4. Wait 10-20 seconds for rules to propagate

### Rules Explanation:

- **`match /profilePictures/{userId}/{allPaths=**}`**: Matches any file in `profilePictures/{userId}/` folder
- **`allow read: if true`**: Anyone can read (view) profile pictures
- **`allow write: if request.auth != null && request.auth.uid == userId`**: Only authenticated users can write, and only to their own folder
- **`match /{allPaths=**}`**: Catches all other paths and denies access

---

## 🌐 Step 3: CORS Configuration

Firebase Storage automatically handles CORS for requests from:
- `http://localhost:10000` (local development)
- `https://chopelah.onrender.com` (production)

**No additional CORS configuration is needed** if you're using the Firebase SDK correctly.

However, if you encounter CORS errors:

### Check Firebase Authorized Domains:

1. Go to Firebase Console → **Authentication** → **Settings**
2. Scroll to **Authorized domains**
3. Ensure these domains are listed:
   - `localhost`
   - `chopelah.onrender.com`
4. If not, click **Add domain** and add them

### Verify Storage Bucket CORS:

Firebase Storage buckets don't require manual CORS configuration when using the Firebase SDK. The SDK automatically includes the necessary authentication headers.

If you're still getting CORS errors:
1. Check that Storage rules are correctly published
2. Verify the user is authenticated (check browser console for auth token)
3. Ensure Firebase Storage is enabled in your project

---

## 📁 File Structure in Firebase Storage

After uploading, files will be organized as:

```
profilePictures/
  ├── {userId1}/
  │   └── profile.jpg
  ├── {userId2}/
  │   └── profile.jpg
  └── ...
```

Each user's profile picture is stored at:
- **Path**: `profilePictures/{userId}/profile.jpg`
- **Download URL**: Saved to Firestore at `users/{userId}/photoURL`

---

## ✅ Testing the Setup

### Test Upload:

1. Go to Edit Profile page
2. Click the camera icon on the avatar
3. Select an image file (JPG, PNG, or GIF, max 5MB)
4. Wait for upload to complete
5. Check browser console for success messages:
   - `📤 Starting profile picture upload...`
   - `✅ Upload successful`
   - `🔗 Download URL: https://...`
   - `💾 Saved photoURL to Firestore`

### Verify in Firebase Console:

1. Go to **Storage** → **Files** tab
2. Navigate to `profilePictures/` folder
3. You should see user folders with `profile.jpg` files inside
4. Click on a file to see its download URL

### Verify in Firestore:

1. Go to **Firestore Database** → **users** collection
2. Open a user document
3. Check that `photoURL` field contains a Firebase Storage URL

---

## 🐛 Troubleshooting

### Error: `storage/unauthorized`

**Cause**: Storage rules are blocking the upload.

**Solution**:
1. Check Storage rules match the code above exactly
2. Ensure rules are published (click "Publish" button)
3. Wait 30 seconds and try again
4. Verify user is authenticated (check `auth.currentUser`)

### Error: `storage/quota-exceeded`

**Cause**: Firebase Storage quota exceeded.

**Solution**: Check your Firebase plan and upgrade if needed.

### Error: `storage/unauthenticated`

**Cause**: User is not signed in.

**Solution**: Ensure user is authenticated before uploading.

### Error: CORS policy blocked

**Cause**: Request is being blocked by browser CORS policy.

**Solution**:
1. Check Firebase Authorized Domains includes your domain
2. Verify Storage rules are correct
3. Ensure Firebase SDK is properly initialized
4. Check browser console for detailed error messages

### Upload Shows "Uploading" but Never Completes

**Possible Causes**:
1. Storage rules not published correctly
2. Network connectivity issues
3. File size exceeds limit (5MB)
4. Invalid file type

**Solution**:
1. Check browser console for error messages
2. Verify Storage rules are published
3. Try a smaller image file
4. Check network tab for failed requests

---

## 📝 Code Implementation Details

### Storage Path:
```javascript
const storagePath = `profilePictures/${user.uid}/profile.jpg`;
const storageRef = ref(storage, storagePath);
```

### Upload Process:
1. Validate file type and size
2. Delete old profile picture (if exists)
3. Upload new file to Storage
4. Get download URL
5. Save URL to Firestore `users/{userId}/photoURL`
6. Update UI immediately

### Firestore Update:
```javascript
await setDoc(doc(db, 'users', user.uid), { 
  photoURL: downloadURL 
}, { merge: true });
```

---

## 🔐 Security Best Practices

1. **Always validate file types** on the client side (JPG, PNG, GIF only)
2. **Enforce file size limits** (5MB max)
3. **Use Storage rules** to restrict uploads to authenticated users only
4. **Validate user ownership** in Storage rules (`userId == request.auth.uid`)
5. **Don't store sensitive data** in image metadata
6. **Regularly monitor Storage usage** to prevent quota issues

---

## 📚 Additional Resources

- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [Firebase Storage Security Rules](https://firebase.google.com/docs/storage/security)
- [Firebase Storage CORS](https://firebase.google.com/docs/storage/web/download-files#cors_configuration)

---

**After completing these steps, profile picture uploads should work correctly!** 🎉

