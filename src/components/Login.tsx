import { useState, useContext } from "react";
import { AuthContext } from "../firebase/AuthContext";

function Login() {
  // const auth = useContext(AuthContext);
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

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
          login(email, password);
        }}
        // Consider refactoring some of the code here. Should the submit function have its own codeblock and be referred to here and in the button, or is it fine as is? Do I need to add accessibility titles to the form itself?
      >
        <label htmlFor="email">Email</label>
        <input
          name="email"
          id="email"
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
        <label htmlFor="password">Password</label>
        <input
          name="password"
          id="password"
          type="password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
          }}
        />
        <button type="submit">Log in</button>
        {/* May need to refactor button for accessibility */}
        <a href="">Don't have an account? Sign up here!</a>
        {/* This anchor tag will later route to a sign up page. */}
      </form>
    </>
  );
}

export default Login;
