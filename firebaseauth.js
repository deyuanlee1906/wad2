// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.4.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-auth.js";
import { getFirestore, setDoc, doc} from "https://www.gstatic.com/firebasejs/12.4.0/firebase-firestore.js";
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
  storageBucket: "wad2-login-5799b.firebasestorage.app",
  messagingSenderId: "148986270821",
  appId: "1:148986270821:web:fc17df5adf49b464a1628c"
};

// Initialize Firebase before any calls to getAuth/getFirestore
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

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

        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL
        }, { merge: true });

        // Persist session context and redirect to app home
        localStorage.setItem('loggedInUserId', user.uid);
        showMessage("Google login successful!", "signInMessage");
        window.location.href = 'homepage.html';
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

        await setDoc(doc(db, "users", user.uid), {
          email: user.email,
          name: user.displayName,
          photoURL: user.photoURL
        }, { merge: true });

        // Persist session context and redirect to app home
        localStorage.setItem('loggedInUserId', user.uid);
        showMessage("Facebook login successful!", "signInMessage");
        window.location.href = 'homepage.html';
      } catch (error) {
        console.error("Facebook login failed:", error);
      }
    });
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
// Bind email/password auth after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    const signUp = document.getElementById('submitSignUp');
    if (signUp) {
        signUp.addEventListener('click', (event)=>{
            event.preventDefault();
            const email=document.getElementById('rEmail').value;
            const password=document.getElementById('rPassword').value;
            const firstName = document.getElementById('fName').value;
            const lastName = document.getElementById('lName').value;

            createUserWithEmailAndPassword(auth,email,password)
            .then((userCredential)=>{
                const user = userCredential.user;
                const userData={
                    email: email,
                    firstName: firstName,
                    lastName: lastName
                };
                showMessage('Account Created Successfully', 'signUpMessage');
                const docRef=doc(db, "users", user.uid);
                setDoc(docRef, userData)
                .then(()=>{
                    window.location.href='index.html';
                })
                .catch((error)=>{
                    console.error("error writing document", error);
                });
            })
            .catch((error)=>{
                const errorCode=error.code;
                if(errorCode=='auth/email-already-in-use'){
                    showMessage('Email Addres already in use', 'signUpMessage')
                }
                else{
                    showMessage('Unable to create User', 'signUpMessage');
                }
            })
        })
    }

    const signIn = document.getElementById('submitSignIn');
    if (signIn) {
        signIn.addEventListener('click', (event)=>{
            event.preventDefault();
            const email=document.getElementById('email').value;
            const password=document.getElementById('password').value;

            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential)=>{
                showMessage('login is successful', 'signInMessage');
                const user = userCredential.user;
                localStorage.setItem('loggedInUserId', user.uid);
                window.location.href='homepage.html';
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
});