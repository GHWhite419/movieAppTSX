import { useState, useContext } from "react";
import { AuthContext } from "../firebase/AuthContext";
import { Link } from "react-router-dom";

function Login() {
  const { login } = useContext(AuthContext);

  const [loginEmail, setLoginEmail] = useState<string>("");
  const [loginPassword, setLoginPassword] = useState<string>("");

  // I don't know if I'll need this or not, or whether it's a best practice to include.

  // interface LoginForm {
  //   email: string;
  //   password: string;
  // }

  // const defaultValues: LoginForm = {
  //   email: "",
  //   password: "",
  // };

  return (
    <>
      <h1>Welcome! Please sign in if you have an account</h1>
      {/* Consider changing this h1 later on; may have a h1 displaying title in a parent component. */}
      <form
        action="submit"
        onSubmit={(e) => {
          e.preventDefault();
          login(loginEmail, loginPassword);
          setLoginPassword("");
        }}
        // Consider refactoring some of the code here. Should the submit function have its own codeblock and be referred to here and in the button, or is it fine as is? Do I need to add accessibility titles to the form itself?
      >
        <label htmlFor="loginEmail">Email</label>
        <input
          name="loginEmail"
          id="loginEmail"
          type="email"
          value={loginEmail}
          onChange={(e) => {
            setLoginEmail(e.target.value);
          }}
        />
        <label htmlFor="password">Password</label>
        <input
          name="password"
          id="password"
          type="password"
          value={loginPassword}
          onChange={(e) => {
            setLoginPassword(e.target.value);
          }}
        />
        <button type="submit">Log in</button>
        {/* May need to refactor button for accessibility */}
      </form>
      <Link to="signup">Don't have an account? Sign up here!</Link>
    </>
  );
}

export default Login;
