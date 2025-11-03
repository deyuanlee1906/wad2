// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, setDoc, doc, getDoc, collection, query, where, getDocs, updateDoc } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
// === GOOGLE LOGIN ===
import { GoogleAuthProvider, signInWithPopup } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { FacebookAuthProvider } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";

// Your web app's Firebase configuration (must be defined before using getAuth/getFirestore)
const firebaseConfig = {
  apiKey: "AIzaSyApmvl3E-sbQMZfadYGfa4P0EJ6N7IEZmo",
  authDomain: "wad2-login-5799b.firebaseapp.com",
  projectId: "wad2-login-5799b",
  storageBucket: "wad2-login-5799b.appspot.com",
  messagingSenderId: "148986270821",
  appId: "1:148986270821:web:fc17df5adf49b464a1628c"
};

// Initialize Firebase before any calls to getAuth/getFirestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
// Use browser language for auth emails
try { auth.useDeviceLanguage && auth.useDeviceLanguage(); } catch (_) {}
const db = getFirestore(app);

// Export Firebase functions globally for use in other scripts
window.db = db;
window.doc = doc;
window.setDoc = setDoc;
window.getDoc = getDoc;
window.collection = collection;
window.query = query;
window.where = where;
window.getDocs = getDocs;
window.updateDoc = updateDoc;

// Defer DOM queries and event bindings until content is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Bind to all matching icons (IDs are duplicated in markup)
  const googleButtons = document.querySelectorAll('#googleLogin');
  const facebookButtons = document.querySelectorAll('#facebookLogin');

  googleButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const provider = new GoogleAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if this is a new user (no existing document in Firestore)
        let isNewUser = false;
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          isNewUser = true;
          // For new users, create minimal profile - they'll pick username in onboarding
          await setDoc(userDocRef, {
            email: user.email,
            name: user.displayName,
            createdAt: new Date()
          });
        }

        // Persist session context
        localStorage.setItem('loggedInUserId', user.uid);
        showMessage("Google login successful!", "signInMessage");
        
        // If new user, redirect to onboarding flow; otherwise go to app
        if (isNewUser) {
          window.location.href = '/pages/onboarding/choose-username.html';
        } else {
          window.location.href = '/pages/chope/chope.html';
        }
      } catch (error) {
        console.error("Google login failed:", error);
      }
    });
  });

  facebookButtons.forEach((btn) => {
    btn.addEventListener('click', async () => {
      const provider = new FacebookAuthProvider();
      try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        // Check if this is a new user (no existing document in Firestore)
        let isNewUser = false;
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);
        
        if (!userDocSnap.exists()) {
          isNewUser = true;
          // For new users, create minimal profile - they'll pick username in onboarding
          await setDoc(userDocRef, {
            email: user.email,
            name: user.displayName,
            createdAt: new Date()
          });
        }

        // Persist session context
        localStorage.setItem('loggedInUserId', user.uid);
        showMessage("Facebook login successful!", "signInMessage");
        
        // If new user, redirect to onboarding flow; otherwise go to app
        if (isNewUser) {
          window.location.href = '/pages/onboarding/choose-username.html';
        } else {
          window.location.href = '/pages/chope/chope.html';
        }
      } catch (error) {
        console.error("Facebook login failed:", error);
      }
    });
  });

  function showMessage(message, divID){
      var messageDiv = document.getElementById(divID);
      messageDiv.style.display = "block";
      messageDiv.innerHTML=message;
      messageDiv.style.opacity=1;
      setTimeout(function(){
          messageDiv.style.opacity=0;
      },10000);
  }

  // Email/password auth handlers (consolidated into single DOMContentLoaded)
  const signUp = document.getElementById('submitSignUp');
    if (signUp) {
        signUp.addEventListener('click', (event)=>{
            event.preventDefault();
            const email=document.getElementById('rEmail').value;
            const password=document.getElementById('rPassword').value;
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

            // Pre-check if desired username is taken; if yes, show clear error and stop
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

                    const userData={
                        email: email,
                        firstName: firstName,
                        lastName: lastName,
                        username: finalUsername
                    };
                    showMessage('Account Created Successfully', 'signUpMessage');
                    const docRef=doc(db, "users", user.uid);
                    setDoc(docRef, userData)
                    .then(()=>{
                        window.location.href='/pages/chope/chope.html';
                    })
                    .catch((error)=>{
                        console.error("error writing document", error);
                    });
                });
            })
            .catch((error)=>{
                if (error && error.message === 'username-taken') return; // already shown
                const errorCode=error.code;
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
            const emailOrUsername=document.getElementById('email').value;
            const password=document.getElementById('password').value;
            const resolveEmailFromUsername = async (value) => {
                const normalized = (value || '').trim().toLowerCase();
                if (normalized.includes('@')) return normalized; // already email
                const unameRef = doc(db, 'usernames', normalized);
                const snap = await getDoc(unameRef);
                if (snap.exists()) {
                    const data = snap.data();
                    return data.email;
                }
                return normalized; // fallback: try as email
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
                // ask user for an email/username if the field is empty
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