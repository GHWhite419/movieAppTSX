import { useState, useContext } from "react";
import { AuthContext } from "../../firebase/AuthContext";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const signupSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format.")
    .required("Email is required."),
  password: yup
    .string()
    .required("Password is required.")
    .min(6, "Password must be at least 6 characters."),
});

function SignUp() {
  const { signup } = useContext(AuthContext);
  const [signupError, setSignupError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
    mode: "onBlur",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await signup(data.email, data.password);
      setSignupError(null);
    } catch (error) {
      if (error instanceof Error) {
        setSignupError((error as Error).message);
      }
    }
  };

  return (
    <>
      <h1>Sign up for an account here!</h1>
      <form action="submit" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}

        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register("password")} />
        {errors.password && <p>{errors.password.message}</p>}

        {signupError && <p>{signupError}</p>}

        <button type="submit">Register</button>
        {/* Refactor button for accessibility */}
      </form>
      <Link to="/">Already have an account? Log in here!</Link>
    </>
  );
}

export default SignUp;
