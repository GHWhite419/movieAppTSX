// import firebase from "./Firebase.tsx";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";

function Login() {
// Should I have this auth declaration at both this level and in the parent App level?
  // signInWithEmailAndPassword(auth, email, password)
  //   .then((userCredential) => {
  //     // Signed in
  //     const user = userCredential.user;
  //     // ...
  //   })
  //   .catch((error) => {
  //     const errorCode = error.code;
  //     const errorMessage = error.message;
  //   });

  // Thinking about how I should handle this Login form - which I'll start with before I figure out how to handle signups.

  interface LoginForm {
    email: string;
    password: string;
  }

  const defaultValues: LoginForm = {
    email: "",
    password: "",
  };

  return (
    <>
      <h1>Welcome! Please sign in if you have an account</h1>
      <form action="submit">
        <input name="email" id="email" type="email" />
        <label htmlFor="email">Email</label>
        <input name="password" id="password" type="password" />
        <label htmlFor="password">Password</label>
        <a href="">Don't have an account? Sign up here!</a>
      </form>
    </>
  );
}

export default Login;
