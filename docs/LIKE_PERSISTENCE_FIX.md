# Like Persistence Fix

## Problem
Likes were being saved to Firebase but the heart icons weren't staying filled when the page refreshed.

## Root Cause
The community feed was rendering **before** Firebase Authentication initialized. This meant:
1. `getAuth().currentUser` returned `null` even when user was logged in
2. User likes couldn't be loaded from Firestore
3. Posts rendered with default (unliked) state
4. Hearts appeared empty even though likes existed in database

## Solution
Wrapped the feed initialization in `onAuthStateChanged` listener to ensure:
1. Firebase Auth completes initialization first
2. User authentication state is confirmed
3. Likes are loaded from Firestore **before** posts render
4. Posts render with correct like status

## Changes Made

### Key Fix in `community.html`:
```javascript
// OLD: Called immediately (auth not ready yet)
renderInstagramFeed();

// NEW: Wait for auth to initialize
onAuthStateChanged(getAuth(), async (user) => {
  if (!feedInitialized) {
    feedInitialized = true;
    await renderInstagramFeed();
  }
});
```

### Additional Improvements:
1. Consistent use of `auth` constant throughout the file
2. Added console logging to help debug like loading
3. Fixed variable scope issues between script blocks

## How to Test

### Test 1: Like Persistence
1. **Clear your browser cache** or open in incognito/private mode
2. Log in to your account
3. Go to Community page
4. Like a post (heart should turn red)
5. **Refresh the page** (press F5 or Ctrl+R)
6. ✅ **Expected**: Heart should still be red
7. ✅ **Expected**: Like count should be correct

### Test 2: Multiple Likes
1. Like 3-4 different posts
2. Note which ones you liked
3. Refresh the page
4. ✅ **Expected**: All the posts you liked should still have red hearts
5. Go to Profile > Liked tab
6. ✅ **Expected**: Should see all posts you liked

### Test 3: Cross-Device Persistence
1. Like a post on one browser/device
2. Log in to the same account on another browser/device
3. Go to Community page
4. ✅ **Expected**: The like should show on the other device too

### Test 4: Unlike Persistence
1. Unlike a post (heart turns empty)
2. Refresh the page
3. ✅ **Expected**: Heart should still be empty
4. Check Profile > Liked tab
5. ✅ **Expected**: Post should not appear there

## Debugging

If likes still don't persist, check the browser console for these logs:

```
Loading likes for user: [user-id]
User has X likes in their collection
Likes loaded: [array of post IDs]
Like counts: {post1: 5, post2: 3, ...}
```

### Common Issues:

1. **"No user logged in, skipping like loading"**
   - You're not logged in
   - Try logging out and back in

2. **"User has 0 likes in their collection"**
   - No likes saved yet, or
   - Firestore data was cleared

3. **Likes show in console but hearts are empty**
   - Check Firestore rules
   - Check browser console for errors
   - Try hard refresh (Ctrl+Shift+R)

4. **Auth never initializes**
   - Check Firebase config in `firebaseauth.js`
   - Check network tab for Firebase API errors

## Technical Details

### Data Structure
```
firestore/
├── users/{uid}/
│   └── likes/{postId}
│       └── { postId, likedAt }
└── posts/{postId}/
    └── likes/{uid}
        └── { uid, likedAt }
```

Likes are stored bidirectionally:
- `users/{uid}/likes` - For "what posts did this user like?"
- `posts/{postId}/likes` - For "who liked this post?"

### Load Order
1. Page loads → Firebase Auth initializes
2. `onAuthStateChanged` fires
3. `loadUserLikes()` queries Firestore
4. `userLikes` Set is populated
5. `renderInstagramFeed()` runs
6. `renderOne()` checks `userLikes.has(postId)`
7. Posts render with correct like state

## Verification Checklist

- [ ] Hearts persist after refresh
- [ ] Like counts are accurate
- [ ] Liked posts appear in Profile > Liked tab
- [ ] Unlikes persist after refresh
- [ ] Console shows "Likes loaded: [...]"
- [ ] No errors in console
- [ ] Works in incognito mode
- [ ] Works after logout/login

## Success Criteria

✅ **Fixed**: Likes now persist correctly across page refreshes
✅ **Fixed**: Hearts stay filled for liked posts
✅ **Fixed**: Like counts remain accurate
✅ **Fixed**: Profile > Liked tab syncs with community page

