# 🔥 Firebase Storage CORS Configuration Guide

This guide explains how to configure CORS for Firebase Storage to allow profile picture uploads from your web app.

---

## 📋 Important Note

**Firebase SDK handles CORS automatically** when using `uploadBytes()` and `getDownloadURL()`. Manual CORS configuration is typically only needed for:
- Direct HTTP requests to Firebase Storage (without the SDK)
- Troubleshooting CORS issues
- Custom upload implementations

However, configuring CORS manually ensures compatibility and resolves edge cases.

---

## 🛠️ Step 1: Install gsutil (Google Cloud Storage Command Line Tool)

### On macOS:

```bash
# Install using Homebrew (recommended)
brew install gsutil

# Or install via pip
pip3 install gsutil
```

### On Linux:

```bash
# Install using pip
pip3 install gsutil

# Or install via apt (Ubuntu/Debian)
sudo apt-get update
sudo apt-get install gsutil
```

### On Windows:

1. Install Python 3.x from [python.org](https://www.python.org/downloads/)
2. Open Command Prompt or PowerShell
3. Run:
```bash
pip install gsutil
```

### Verify Installation:

```bash
gsutil version
```

You should see version information. If not, check your PATH or reinstall.

---

## 🔐 Step 2: Authenticate with Google Cloud

Before applying CORS, you need to authenticate with Google Cloud:

```bash
# Authenticate with Google Cloud
gcloud auth login

# Set your project
gcloud config set project wad2-login-5799b

# Verify authentication
gsutil ls
```

**Note**: If you don't have `gcloud` CLI installed, you can install it separately or use service account authentication. See [Google Cloud SDK documentation](https://cloud.google.com/sdk/docs/install).

---

## 📝 Step 3: CORS Configuration File

The `cors.json` file in your project root contains the CORS rules:

```json
[
  {
    "origin": ["http://localhost:10000", "https://myproductiondomain.com"],
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

**Note**: Replace `https://myproductiondomain.com` with your actual production domain (e.g., `https://chopelah.onrender.com`).

### Configuration Explanation:

- **`origin`**: Allowed origins (your development and production domains)
- **`method`**: HTTP methods allowed (including OPTIONS for preflight)
- **`responseHeader`**: Headers that can be sent in responses
- **`maxAgeSeconds`**: How long browsers cache preflight responses (1 hour)

---

## 🚀 Step 4: Apply CORS Configuration to Firebase Storage Bucket

Firebase Storage uses Google Cloud Storage buckets. Your bucket name is: `wad2-login-5799b.appspot.com`

### Apply CORS Configuration:

```bash
# Navigate to your project root (where cors.json is located)
cd /Applications/MAMP/htdocs/wad2/proj/wad2

# Apply CORS configuration to the Firebase Storage bucket
gsutil cors set cors.json gs://wad2-login-5799b.appspot.com
```

### Expected Output:

```
Setting CORS on gs://wad2-login-5799b.appspot.com/...
```

---

## ✅ Step 5: Verify CORS Configuration

### Check Current CORS Rules:

```bash
# View current CORS configuration
gsutil cors get gs://wad2-login-5799b.appspot.com
```

### Expected Output:

You should see the CORS configuration matching your `cors.json` file:

```json
[
  {
    "maxAgeSeconds": 3600,
    "method": ["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"],
    "origin": ["http://localhost:10000", "https://chopelah.onrender.com"],
    "responseHeader": [
      "Content-Type",
      "Authorization",
      "Content-Length",
      "User-Agent",
      "X-Goog-Resumable",
      "x-goog-resumable"
    ]
  }
]
```

---

## 🧪 Step 6: Testing & Cache Clearing

### Clear Browser Cache:

**Important**: Browsers cache CORS preflight responses. After updating CORS rules:

1. **Hard Refresh**:
   - **Chrome/Edge (Mac)**: `Cmd + Shift + R`
   - **Chrome/Edge (Windows/Linux)**: `Ctrl + Shift + R`
   - **Firefox (Mac)**: `Cmd + Shift + R`
   - **Firefox (Windows/Linux)**: `Ctrl + Shift + R`
   - **Safari**: `Cmd + Option + R`

2. **Clear Browser Cache**:
   - **Chrome**: Settings → Privacy → Clear browsing data → Cached images and files
   - **Firefox**: Settings → Privacy & Security → Clear Data → Cached Web Content
   - **Safari**: Preferences → Advanced → Show Develop menu → Empty Caches

3. **Use Incognito/Private Mode**:
   - Open a new incognito/private window
   - Test the upload functionality
   - This bypasses cache and uses fresh CORS rules

### Test Upload:

1. Open your Edit Profile page in incognito mode
2. Click the camera icon to upload a profile picture
3. Check browser console for any CORS errors
4. Verify upload completes successfully

---

## 💻 Example Firebase SDK Upload Code

This code works with the CORS configuration above:

```javascript
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-storage.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Initialize Firebase instances
const auth = getAuth();
const db = getFirestore();
const storage = getStorage();

/**
 * Upload profile picture to Firebase Storage
 * @param {File} file - Image file to upload
 * @returns {Promise<string>} Download URL of uploaded image
 */
async function uploadProfilePicture(file) {
  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('User not authenticated');
    }

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      throw new Error('Invalid file type. Only JPG, PNG, and GIF are allowed.');
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      throw new Error('File too large. Maximum size is 5MB.');
    }

    // Create storage reference
    // Path: profilePictures/{userId}/profile.jpg
    const storagePath = `profilePictures/${user.uid}/profile.jpg`;
    const storageRef = ref(storage, storagePath);

    // Upload file with metadata
    console.log('📤 Uploading to Firebase Storage...');
    const uploadResult = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/jpeg'
    });
    console.log('✅ Upload successful');

    // Get download URL
    const downloadURL = await getDownloadURL(uploadResult.ref);
    console.log('🔗 Download URL:', downloadURL);

    // Save URL to Firestore
    await setDoc(doc(db, 'users', user.uid), {
      photoURL: downloadURL
    }, { merge: true });
    console.log('💾 Saved to Firestore');

    return downloadURL;
  } catch (error) {
    console.error('❌ Upload error:', error);
    throw error;
  }
}

// Usage example:
// const fileInput = document.getElementById('profileImageInput');
// fileInput.addEventListener('change', async (e) => {
//   const file = e.target.files[0];
//   if (file) {
//     try {
//       const downloadURL = await uploadProfilePicture(file);
//       console.log('Profile picture uploaded:', downloadURL);
//     } catch (error) {
//       console.error('Failed to upload:', error);
//     }
//   }
// });
```

---

## 🔧 Troubleshooting

### Error: "gsutil: command not found"

**Solution**: Install gsutil (see Step 1)

### Error: "Access Denied" when applying CORS

**Solution**: 
1. Ensure you're authenticated: `gcloud auth login`
2. Verify project: `gcloud config set project wad2-login-5799b`
3. Check you have Storage Admin permissions in Firebase Console

### Error: CORS still not working after configuration

**Solutions**:
1. **Clear browser cache** (see Step 6)
2. **Wait 5-10 minutes** for changes to propagate
3. **Check CORS rules** are correctly applied: `gsutil cors get gs://wad2-login-5799b.appspot.com`
4. **Verify origins** match exactly (including http vs https, port numbers)
5. **Check browser console** for specific CORS error messages

### Error: "Preflight request doesn't pass access control check"

**Solution**: 
1. Ensure `OPTIONS` method is in CORS configuration
2. Verify `origin` includes your exact domain (with/without trailing slash)
3. Clear browser cache and try again

---

## 📚 Additional Resources

- [Google Cloud Storage CORS Documentation](https://cloud.google.com/storage/docs/configuring-cors)
- [Firebase Storage Documentation](https://firebase.google.com/docs/storage)
- [gsutil CORS Documentation](https://cloud.google.com/storage/docs/gsutil/commands/cors)

---

## ✅ Quick Reference Commands

```bash
# Install gsutil (macOS)
brew install gsutil

# Authenticate
gcloud auth login
gcloud config set project wad2-login-5799b

# Apply CORS
gsutil cors set cors.json gs://wad2-login-5799b.appspot.com

# Verify CORS
gsutil cors get gs://wad2-login-5799b.appspot.com

# Remove CORS (if needed)
gsutil cors set [] gs://wad2-login-5799b.appspot.com
```

---

**After completing these steps, profile picture uploads should work correctly from both localhost and production!** 🎉

