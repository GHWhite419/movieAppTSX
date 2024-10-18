import { useContext, useState } from "react";
import { AuthContext } from "../firebase/AuthContext";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const loginSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format.")
    .required("Email is required."),
  password: yup
    .string()
    .required("Password is required.")
    .min(6, "Password must be at least 6 characters."),
});

function Login() {
  const { login } = useContext(AuthContext);
  const [loginError, setLoginError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password);
      setLoginError(null);
    } catch (error) {
      if (error instanceof Error) {
        setLoginError((error as Error).message);
      }
    }
  };

  return (
    <>
      <h1>Welcome! Please sign in if you have an account</h1>
      {/* Consider changing this h1 later on; may have a h1 displaying title in a parent component. */}
      <form action="submit" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}

        <label htmlFor="password">Password</label>
        <input id="password" type="password" {...register("password")} />
        {errors.password && <p>{errors.password.message}</p>}

        {loginError && <p>{loginError}</p>}

        <button type="submit">Log in</button>
        {/* May need to refactor button for accessibility */}
      </form>
      <Link to="signup">Don't have an account? Sign up here!</Link>
      <Link to="passreset">Forgot your password?</Link>
      {/* Add new password reset component */}
    </>
  );
}

export default Login;
