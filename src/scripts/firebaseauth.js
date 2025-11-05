// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  sendPasswordResetEmail,
  signInWithRedirect,
  getRedirectResult,
  GoogleAuthProvider,
  FacebookAuthProvider,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { 
  getFirestore, 
  setDoc, 
  doc, 
  getDoc, 
  collection, 
  query, 
  where, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp, 
  addDoc 
} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";

// Fallback Firebase configuration (used if API fetch fails)
const fallbackFirebaseConfig = {
  apiKey: "AIzaSyApmvl3E-sbQMZfadYGfa4P0EJ6N7IEZmo",
  authDomain: "wad2-login-5799b.firebaseapp.com",
  projectId: "wad2-login-5799b",
  storageBucket: "wad2-login-5799b.appspot.com",
  messagingSenderId: "148986270821",
  appId: "1:148986270821:web:fc17df5adf49b464a1628c"
};

// Fetch Firebase config from API endpoint (uses environment variables)
async function getFirebaseConfig() {
  try {
    const response = await fetch('/api/firebase-config');
    if (response.ok) {
      const config = await response.json();
      // Only use API config if apiKey is provided, otherwise use fallback
      if (config.apiKey && config.apiKey.trim() !== '') {
        console.log('✅ Loaded Firebase config from environment variables');
        return config;
      }
    }
  } catch (error) {
    console.warn('⚠️ Could not fetch Firebase config from API, using fallback:', error.message);
  }
  // Use fallback config if API fetch fails or apiKey is empty
  console.log('📋 Using fallback Firebase config');
  return fallbackFirebaseConfig;
}

// Initialize Firebase with config from API or fallback
let app, auth, db;
let firebaseConfig = fallbackFirebaseConfig;

// Promise that resolves when Firebase is initialized
const firebaseInitPromise = (async function initializeFirebase() {
  try {
    firebaseConfig = await getFirebaseConfig();
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    // Use browser language for auth emails
    try { auth.useDeviceLanguage && auth.useDeviceLanguage(); } catch (_) {}
    db = getFirestore(app);
    
    // Export to window once initialized
    window.app = app;
    window.db = db;
    window.doc = doc;
    window.setDoc = setDoc;
    window.getDoc = getDoc;
    window.collection = collection;
    window.query = query;
    window.where = where;
    window.getDocs = getDocs;
    window.updateDoc = updateDoc;
    window.deleteDoc = deleteDoc;
    window.serverTimestamp = serverTimestamp;
    window.addDoc = addDoc;
    window.auth = auth;
    
    console.log("✅ Firebase initialized successfully - all functions exported to window");
    return { app, auth, db, firebaseConfig };
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    // Fallback initialization with default config
    app = initializeApp(fallbackFirebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    
    // Export to window with fallback
    window.app = app;
    window.db = db;
    window.doc = doc;
    window.setDoc = setDoc;
    window.getDoc = getDoc;
    window.collection = collection;
    window.query = query;
    window.where = where;
    window.getDocs = getDocs;
    window.updateDoc = updateDoc;
    window.deleteDoc = deleteDoc;
    window.serverTimestamp = serverTimestamp;
    window.addDoc = addDoc;
    window.auth = auth;
    
    console.log("⚠️ Firebase initialized with fallback config");
    return { app, auth, db, firebaseConfig: fallbackFirebaseConfig };
  }
})();

// Export the promise so other code can wait for initialization
window.firebaseInitPromise = firebaseInitPromise;

/**
 * Insert a single document into a collection
 * @param {string} collectionName - Name of the collection
 * @param {string} docId - Document ID (optional, will auto-generate if not provided)
 * @param {object} data - Data to insert
 * @param {boolean} merge - Whether to merge with existing data (default: false)
 * @returns {Promise<string>} Document ID
 */
export async function insertDocument(collectionName, docId, data, merge = false) {
  try {
    if (docId) {
      // Use setDoc with specific document ID
      const docRef = doc(db, collectionName, docId);
      await setDoc(docRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      }, { merge });
      console.log(`✓ Inserted document ${docId} into ${collectionName}`);
      return docId;
    } else {
      // Use addDoc to auto-generate document ID
      const colRef = collection(db, collectionName);
      const docRef = await addDoc(colRef, {
        ...data,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log(`✓ Inserted document ${docRef.id} into ${collectionName}`);
      return docRef.id;
    }
  } catch (error) {
    console.error(`✗ Error inserting into ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Insert multiple documents into a collection
 * @param {string} collectionName - Name of the collection
 * @param {Array<{id?: string, data: object}>} documents - Array of documents to insert
 * @param {boolean} merge - Whether to merge with existing data (default: false)
 * @returns {Promise<string[]>} Array of document IDs
 */
export async function insertMultipleDocuments(collectionName, documents, merge = false) {
  try {
    const docIds = [];
    for (const doc of documents) {
      const docId = await insertDocument(collectionName, doc.id, doc.data, merge);
      docIds.push(docId);
    }
    console.log(`✓ Inserted ${docIds.length} documents into ${collectionName}`);
    return docIds;
  } catch (error) {
    console.error(`✗ Error inserting multiple documents into ${collectionName}:`, error);
    throw error;
  }
}

/**
 * Insert a stall into the 'stalls' collection
 * @param {object} stallData - Stall data
 * @returns {Promise<string>} Document ID
 */
export async function insertStall(stallData) {
  const defaultStall = {
    name: '',
    slug: stallData.name?.toLowerCase().replace(/\s+/g, '-') || '',
    cuisine: '',
    status: 'open',
    priceRange: '',
    rating: 0,
    waitTime: '',
    image: '',
    foodCentre: '',
    description: ''
  };
  
  return await insertDocument('stalls', stallData.id || stallData.slug, {
    ...defaultStall,
    ...stallData
  }, true);
}

/**
 * Insert a menu item into the 'menuItems' collection
 * @param {string} stallId - The ID of the stall this menu item belongs to
 * @param {object} menuItemData - Menu item data
 * @returns {Promise<string>} Document ID
 */
export async function insertMenuItem(stallId, menuItemData) {
  const defaultMenuItem = {
    name: '',
    description: '',
    price: 0,
    category: '',
    image: '',
    available: true,
    stallId: stallId
  };
  
  return await insertDocument('menuItems', menuItemData.id, {
    ...defaultMenuItem,
    ...menuItemData
  }, true);
}

/**
 * Insert a post into the 'posts' collection
 * @param {string} userId - The ID of the user creating the post
 * @param {object} postData - Post data
 * @returns {Promise<string>} Document ID
 */
export async function insertPost(userId, postData) {
  const defaultPost = {
    authorId: userId,
    authorName: '',
    caption: '',
    mediaUrl: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  
  return await insertDocument('posts', null, {
    ...defaultPost,
    ...postData
  });
}

/**
 * Insert a reservation into the 'reservations' collection
 * @param {object} reservationData - Reservation data
 * @returns {Promise<string>} Document ID
 */
export async function insertReservation(reservationData) {
  const defaultReservation = {
    userId: '',
    foodCentre: '',
    tableNumber: 0,
    seatNumber: 0,
    reservationTime: serverTimestamp(),
    duration: 60, // minutes
    status: 'pending',
    createdAt: serverTimestamp()
  };
  
  return await insertDocument('reservations', null, {
    ...defaultReservation,
    ...reservationData
  });
}

/**
 * Insert an order into the 'orders' collection
 * @param {object} orderData - Order data
 * @returns {Promise<string>} Document ID
 */
export async function insertOrder(orderData) {
  const defaultOrder = {
    userId: '',
    stallId: '',
    items: [],
    totalAmount: 0,
    status: 'pending',
    paymentStatus: 'unpaid',
    orderTime: serverTimestamp(),
    createdAt: serverTimestamp()
  };
  
  return await insertDocument('orders', null, {
    ...defaultOrder,
    ...orderData
  });
}

/**
 * Insert a review into the 'reviews' collection
 * @param {object} reviewData - Review data
 * @returns {Promise<string>} Document ID
 */
export async function insertReview(reviewData) {
  const defaultReview = {
    userId: '',
    stallId: '',
    rating: 0,
    comment: '',
    createdAt: serverTimestamp()
  };
  
  return await insertDocument('reviews', null, {
    ...defaultReview,
    ...reviewData
  });
}

// Export db instance for direct access if needed
export { db, doc, setDoc, collection, addDoc, serverTimestamp };

// Make functions available globally if used in non-module scripts
if (typeof window !== 'undefined') {
  window.firebaseDataUtils = {
    insertDocument,
    insertMultipleDocuments,
    insertStall,
    insertMenuItem,
    insertPost,
    insertReservation,
    insertOrder,
    insertReview,
    db
  };
}

function showMessage(message, divID){
  const messageDiv = document.getElementById(divID);
  if (!messageDiv) return;
  messageDiv.style.display = "block";
  messageDiv.innerHTML = message;
  messageDiv.style.opacity = 1;
  setTimeout(function(){
    messageDiv.style.opacity = 0;
  }, 10000);
}

// Handle OAuth redirect result
async function handleRedirectResult() {
  try {
    const result = await getRedirectResult(auth);
    if (result) {
      console.log('✅ Redirect result received:', result);
      const user = result.user;

      // Check if this is a new user
      let isNewUser = false;
      const userDocRef = doc(db, 'users', user.uid);
      const userDocSnap = await getDoc(userDocRef);
      
      if (!userDocSnap.exists()) {
        isNewUser = true;
        // Create minimal profile for new users (serverTimestamp for consistency)
        await setDoc(userDocRef, {
          email: user.email,
          name: user.displayName,
          createdAt: serverTimestamp()
        });
      }

      // Persist session
      localStorage.setItem('loggedInUserId', user.uid);
      
      // Redirect based on user status
      if (isNewUser) {
        window.location.href = '/pages/onboarding/choose-username.html';
      } else {
        window.location.href = '/pages/chope/chope.html';
      }
      return; // important: stop here once handled
    }
  } catch (error) {
    console.error("Redirect error:", error);
    const errorCode = error.code;
    let errorMessage = `Login failed: ${error.message || 'Unknown error'}`;
    if (errorCode === 'auth/popup-blocked') {
      errorMessage = "Login was blocked. Please allow popups and try again.";
    } else if (errorCode === 'auth/unauthorized-domain') {
      errorMessage = `Domain not authorized: ${window.location.hostname}. Please contact support.`;
    } else if (errorCode === 'auth/operation-not-allowed') {
      errorMessage = "This login method is not enabled. Please contact support.";
    } else if (errorCode === 'auth/account-exists-with-different-credential') {
      errorMessage = "An account already exists with this email using a different sign-in method.";
    }
    showMessage(errorMessage, "signInMessage");
  }
}

// Defer DOM queries and event bindings until content is loaded AND Firebase is initialized
document.addEventListener('DOMContentLoaded', async () => {
  // Wait for Firebase to be initialized
  await firebaseInitPromise;

  // 1) Process redirect result first (user returning from OAuth)
  await handleRedirectResult();

  // 2) Safety net: if user is already signed in (e.g., session restore), route them
  onAuthStateChanged(auth, (user) => {
    if (!user) return;
    // Avoid redirect loops: only route if not already on target page
    const onChope = location.pathname.startsWith('/pages/chope/');
    const onOnboarding = location.pathname.startsWith('/pages/onboarding/');
    if (!onChope && !onOnboarding) {
      window.location.href = '/pages/chope/chope.html';
    }
  });

  // Setup Google login buttons with REDIRECT method
  const googleButtons = document.querySelectorAll('#googleLogin');
  googleButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const provider = new GoogleAuthProvider();
      try {
        console.log('🔄 Initiating Google sign-in redirect...');
        await signInWithRedirect(auth, provider);
      } catch (error) {
        console.error("Google login failed:", error);
        const errorCode = error.code;
        let errorMessage = `Google login failed: ${error.message || errorCode || 'Unknown error'}`;
        if (errorCode === 'auth/unauthorized-domain') {
          errorMessage = `Unauthorized domain: ${window.location.hostname}. Please add this domain to Firebase Console.`;
        } else if (errorCode === 'auth/operation-not-allowed') {
          errorMessage = "Google login is not enabled in Firebase Console.";
        }
        showMessage(errorMessage, "signInMessage");
      }
    });
  });

  // Setup Facebook login buttons with REDIRECT method
  const facebookButtons = document.querySelectorAll('#facebookLogin');
  facebookButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const provider = new FacebookAuthProvider();
      try {
        console.log('🔄 Initiating Facebook sign-in redirect...');
        await signInWithRedirect(auth, provider);
      } catch (error) {
        console.error("Facebook login failed:", error);
        const errorCode = error.code;
        let errorMessage = "Facebook login failed. Please try again.";
        if (errorCode === 'auth/unauthorized-domain') {
          errorMessage = "This domain is not authorized. Please contact support.";
        } else if (errorCode === 'auth/operation-not-allowed') {
          errorMessage = "Facebook login is not enabled. Please contact support.";
        }
        showMessage(errorMessage, "signInMessage");
      }
    });
  });

  // Email/password auth handlers (unchanged)
  const signUp = document.getElementById('submitSignUp');
  if (signUp) {
    signUp.addEventListener('click', (event)=>{
      event.preventDefault();
      const email = document.getElementById('rEmail').value;
      const password = document.getElementById('rPassword').value;
      const firstName = document.getElementById('fName').value;
      const lastName = document.getElementById('lName').value;
      const desiredUsernameInput = document.getElementById('username');
      const desiredUsernameRaw = desiredUsernameInput ? desiredUsernameInput.value : '';
      const desiredUsernameBase = desiredUsernameRaw.trim().toLowerCase();

      if (!desiredUsernameBase) {
        const el = document.getElementById('usernameHelp');
        if (el) { el.style.display = 'block'; el.innerHTML = 'Please enter a username.'; }
        else { showMessage('Please enter a username', 'signUpMessage'); }
        return;
      }

      // Password validation: collect all unmet requirements
      const passwordErrors = [];
      if (password.length < 8) passwordErrors.push('At least 8 characters');
      if (!/[A-Z]/.test(password)) passwordErrors.push('At least 1 uppercase letter');
      if (!/[a-z]/.test(password)) passwordErrors.push('At least 1 lowercase letter');
      if (!/[0-9]/.test(password)) passwordErrors.push('At least 1 number');
      if (!/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>\/?`~]/.test(password)) passwordErrors.push('At least 1 special character');

      if (passwordErrors.length > 0) {
        const listHtml = '<strong>Password must include:</strong><ul style="margin-left:16px">' + passwordErrors.map(e => `<li>${e}</li>`).join('') + '</ul>';
        const el = document.getElementById('rPasswordHelp');
        if (el) { el.style.display = 'block'; el.innerHTML = listHtml; }
        else { showMessage(listHtml, 'signUpMessage'); }
        return;
      }

      // Ensure username uniqueness by checking reserved collection
      const reserveUniqueUsername = async (base) => {
        let candidate = base;
        let suffix = 0;
        while (true) {
          const unameRef = doc(db, 'usernames', candidate);
          const snap = await getDoc(unameRef);
          if (!snap.exists()) {
            return candidate;
          }
          suffix += 1;
          candidate = `${base}${suffix}`;
        }
      };

      // Clear previous inline errors
      const uEl = document.getElementById('usernameHelp'); if (uEl) { uEl.style.display='none'; uEl.innerHTML=''; }
      const eEl = document.getElementById('rEmailHelp'); if (eEl) { eEl.style.display='none'; eEl.innerHTML=''; }
      const pEl = document.getElementById('rPasswordHelp'); if (pEl) { pEl.style.display='none'; pEl.innerHTML=''; }

      getDoc(doc(db, 'usernames', desiredUsernameBase))
      .then((unameSnap) => {
        if (unameSnap.exists()) {
          const el = document.getElementById('usernameHelp');
          if (el) { el.style.display = 'block'; el.innerHTML = 'Username is taken. Please choose another.'; }
          else { showMessage('Username is taken. Please choose another.', 'signUpMessage'); }
          throw new Error('username-taken');
        }
        return null;
      })
      .then(() => createUserWithEmailAndPassword(auth, email, password))
      .then((userCredential)=>{
        const user = userCredential.user;
        reserveUniqueUsername(desiredUsernameBase)
        .then(async (finalUsername)=>{
          // Reserve username mapping
          await setDoc(doc(db, 'usernames', finalUsername), { uid: user.uid, email });

          const userData = {
            email: email,
            firstName: firstName,
            lastName: lastName,
            username: finalUsername
          };
          showMessage('Account Created Successfully', 'signUpMessage');
          const docRef = doc(db, "users", user.uid);
          setDoc(docRef, userData)
          .then(()=>{
            // Store user ID in localStorage for session management
            localStorage.setItem('loggedInUserId', user.uid);
            console.log('User signed up successfully, redirecting to chope page...');
            window.location.href='/pages/chope/chope.html';
          })
          .catch((error)=>{
            console.error("error writing document", error);
            showMessage('Account created but failed to save user data. Please try logging in.', 'signUpMessage');
          });
        });
      })
      .catch((error)=>{
        if (error && error.message === 'username-taken') return;
        const errorCode = error.code;
        if(errorCode==='auth/email-already-in-use'){
          const el = document.getElementById('rEmailHelp');
          if (el) { el.style.display = 'block'; el.innerHTML = 'Email address is already in use. Try signing in or reset password.'; }
          else { showMessage('Email address is already in use. Try signing in or reset password.', 'signUpMessage'); }
        } else if (errorCode==='auth/weak-password') {
          const el = document.getElementById('rPasswordHelp');
          if (el) { el.style.display = 'block'; el.innerHTML = 'Password is too weak. Please strengthen it and try again.'; }
          else { showMessage('Password is too weak. Please strengthen it and try again.', 'signUpMessage'); }
        } else if (errorCode==='auth/invalid-email') {
          const el = document.getElementById('rEmailHelp');
          if (el) { el.style.display = 'block'; el.innerHTML = 'Invalid email address.'; }
          else { showMessage('Invalid email address.', 'signUpMessage'); }
        } else {
          showMessage('Unable to create user. Please try again.', 'signUpMessage');
        }
      })
    })
  }

  const signIn = document.getElementById('submitSignIn');
  if (signIn) {
    signIn.addEventListener('click', (event)=>{
      event.preventDefault();
      const emailOrUsername = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const resolveEmailFromUsername = async (value) => {
        const normalized = (value || '').trim().toLowerCase();
        if (normalized.includes('@')) return normalized;
        const unameRef = doc(db, 'usernames', normalized);
        const snap = await getDoc(unameRef);
        if (snap.exists()) {
          const data = snap.data();
          return data.email;
        }
        return normalized;
      };

      resolveEmailFromUsername(emailOrUsername)
      .then((resolvedEmail)=> signInWithEmailAndPassword(auth, resolvedEmail, password))
      .then((userCredential)=>{
        showMessage('login is successful', 'signInMessage');
        const user = userCredential.user;
        localStorage.setItem('loggedInUserId', user.uid);
        window.location.href='/pages/chope/chope.html';
      })
      .catch((error)=>{
        const errorCode = error.code;
        if(errorCode==='auth/invalid-credential'){
          showMessage('Incorrect Email or Password', 'signInMessage');
        }
        else{
          showMessage('Account does not exist', 'signInMessage');
        }
      })
    })
  }

  // Password reset handler
  const recoverLink = document.getElementById('recoverPasswordLink');
  if (recoverLink) {
    recoverLink.addEventListener('click', async (e) => {
      e.preventDefault();
      let emailOrUsername = (document.getElementById('email')?.value || '').trim();
      if (!emailOrUsername) {
        emailOrUsername = window.prompt('Enter your email or username to reset password:') || '';
        emailOrUsername = emailOrUsername.trim();
      }
      if (!emailOrUsername) {
        showMessage('Please provide an email or username.', 'signInMessage');
        return;
      }
      try {
        let targetEmail = emailOrUsername;
        if (!emailOrUsername.includes('@')) {
          const unameRef = doc(db, 'usernames', emailOrUsername.toLowerCase());
          const unameSnap = await getDoc(unameRef);
          if (unameSnap.exists()) {
            targetEmail = unameSnap.data().email;
          }
        }
        await sendPasswordResetEmail(auth, targetEmail);
        showMessage('Password reset email sent. Check your inbox (or spam).', 'signInMessage');
      } catch (err) {
        const code = err?.code || '';
        if (code === 'auth/user-not-found') {
          showMessage('No account found for that email/username.', 'signInMessage');
        } else if (code === 'auth/invalid-email') {
          showMessage('That email address looks invalid.', 'signInMessage');
        } else if (code === 'auth/missing-email') {
          showMessage('Please enter a valid email.', 'signInMessage');
        } else {
          showMessage('Could not send reset email. Try again later.', 'signInMessage');
        }
        console.error('Password reset error:', err);
      }
    });
  }
});
