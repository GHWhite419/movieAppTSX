// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBNVtuq6XsxH8gS5oMneuzQYA8NCgnYjT0",
  authDomain: "moviesapptsx.firebaseapp.com",
  projectId: "moviesapptsx",
  storageBucket: "moviesapptsx.appspot.com",
  messagingSenderId: "454311538112",
  appId: "1:454311538112:web:17ae13d162f99a79d5ac25"
};

// Initialize Firebase
const firebase = initializeApp(firebaseConfig);

export default firebase;