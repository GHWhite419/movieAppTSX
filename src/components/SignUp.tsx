import { useState, useContext } from "react";
import { AuthContext } from "../firebase/AuthContext";
import { Link } from "react-router-dom";

function SignUp() {
  const { signup } = useContext(AuthContext);

  const [signupEmail, setSignupEmail] = useState<string>("");
  const [signupPassword, setSignupPassword] = useState<string>("");

  return (
    <>
      <h1>Sign up for an account here!</h1>
      <form
        action="submit"
        onSubmit={(e) => {
          e.preventDefault();
          signup(signupEmail, signupPassword);
        }}
      >
        <label htmlFor="email">Email</label>
        <input
          name="email"
          id="email"
          type="email"
          value={signupEmail}
          onChange={(e) => {
            setSignupEmail(e.target.value);
          }}
        />
        <label htmlFor="password">Password</label>
        <input
          name="password"
          id="password"
          type="password"
          value={signupPassword}
          onChange={(e) => {
            setSignupPassword(e.target.value);
          }}
        />
        <button type="submit">Register</button>
      </form>
      <Link to="/">Already have an account? Log in here!</Link>
    </>
  );
}

export default SignUp;
