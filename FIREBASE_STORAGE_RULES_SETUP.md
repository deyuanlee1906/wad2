# Firebase Storage Rules Setup Guide

## Problem
You're getting a `403 Forbidden` error when trying to upload profile pictures:
```
Firebase Storage: User does not have permission to access 'profilePictures/.../profile.jpg'. (storage/unauthorized)
```

This is because Firebase Storage security rules haven't been configured yet.

## Solution

### Step 1: Deploy Storage Rules

I've created `storage.rules` file with the correct rules. Now you need to deploy them to Firebase.

**Option A: Using Firebase CLI (Recommended)**

```bash
# Make sure you're in the project root directory
cd /Applications/MAMP/htdocs/wad2/proj/wad2

# Deploy storage rules
firebase deploy --only storage
```

**Option B: Using Firebase Console (Web UI)**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `wad2-login-5799b`
3. Navigate to **Storage** in the left sidebar
4. Click on the **Rules** tab
5. Copy and paste the following rules:

```javascript
rules_version = '2';

service firebase.storage {
  match /b/{bucket}/o {
    
    // Profile pictures - users can read any profile picture, but only write their own
    match /profilePictures/{userId}/{allPaths=**} {
      // Allow anyone to read profile pictures (for displaying in the app)
      allow read: if true;
      
      // Allow authenticated users to write their own profile pictures
      // Users can only upload/delete files in their own userId folder
      allow write: if request.auth != null 
                   && request.auth.uid == userId
                   && request.resource.size < 5 * 1024 * 1024  // Max 5MB
                   && request.resource.contentType.matches('image/.*');
      
      // Allow users to delete their own profile pictures
      allow delete: if request.auth != null 
                    && request.auth.uid == userId;
    }
    
    // Default: deny all other access
    match /{allPaths=**} {
      allow read, write: if false;
    }
  }
}
```

6. Click **Publish**

### Step 2: Verify Rules Are Active

After deploying, test the profile picture upload again. The rules should now allow:
- ✅ Authenticated users to upload images to `profilePictures/{theirUserId}/profile.jpg`
- ✅ Anyone to read profile pictures (for displaying in the app)
- ✅ Users to delete their own profile pictures
- ✅ File size limit: 5MB maximum
- ✅ File type: Images only (`image/*`)

### What the Rules Do

1. **Profile Pictures Path**: `profilePictures/{userId}/{allPaths=**}`
   - Matches any file in a user's profile picture folder
   - `{userId}` is the Firebase Auth UID
   - `{allPaths=**}` matches any file name in that folder

2. **Read Access**: `allow read: if true;`
   - Anyone can read profile pictures (needed for displaying in the app)

3. **Write Access**: 
   ```javascript
   allow write: if request.auth != null 
                && request.auth.uid == userId
                && request.resource.size < 5 * 1024 * 1024
                && request.resource.contentType.matches('image/.*');
   ```
   - User must be authenticated (`request.auth != null`)
   - User can only write to their own folder (`request.auth.uid == userId`)
   - File size must be less than 5MB
   - File must be an image type

4. **Delete Access**: 
   ```javascript
   allow delete: if request.auth != null 
                 && request.auth.uid == userId;
   ```
   - User must be authenticated
   - User can only delete their own files

5. **Default Deny**: All other paths are denied by default

## Troubleshooting

### Still Getting 403 After Deploying Rules?

1. **Check Firebase Console**
   - Go to Storage > Rules tab
   - Verify the rules are published (you should see the rules you just deployed)

2. **Check Authentication**
   - Make sure the user is logged in
   - Check browser console for auth errors
   - Verify `auth.currentUser` is not null

3. **Check File Path**
   - The path should match: `profilePictures/{userId}/profile.jpg`
   - The `userId` must match the authenticated user's UID

4. **Check File Type and Size**
   - File must be an image (JPG, PNG, GIF)
   - File must be under 5MB

5. **Browser Cache**
   - Clear browser cache or use incognito mode
   - Hard refresh the page (`Ctrl+F5` or `Cmd+Shift+R`)

### Testing Rules Locally

You can test rules locally before deploying:

```bash
# Install Firebase CLI if not already installed
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init storage

# Test rules locally
firebase emulators:start --only storage
```

## Security Notes

- Users can only upload/manage files in their own `profilePictures/{userId}/` folder
- File size is limited to 5MB to prevent abuse
- Only image files are allowed
- All other storage paths are denied by default (secure by default)

## Next Steps

After deploying the rules:
1. Test profile picture upload on the edit profile page
2. Verify the image appears correctly
3. Test deleting/changing the profile picture
4. Check that users cannot access other users' profile picture folders

## Related Files

- `storage.rules` - Storage security rules file
- `firebase.json` - Firebase configuration (includes storage rules reference)
- `src/pages/profile/edit-profile.html` - Profile editing page that uses these rules

