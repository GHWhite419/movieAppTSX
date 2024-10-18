import { useContext, useState } from "react";
import { AuthContext } from "../firebase/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

const resetPassSchema = yup.object().shape({
  email: yup
    .string()
    .email("Invalid email format.")
    .required("Email is required."),
});

function PasswordReset() {
  const { resetPass } = useContext(AuthContext);
  const [resetMessage, setResetMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(resetPassSchema),
    mode: "onBlur",
    reValidateMode: "onSubmit",
  });

  const onSubmit = async (data: { email: string }) => {
    try {
      await resetPass(data.email);
      setResetMessage("Check your email to reset your password! Redirecting to login screen...");
      setTimeout(() => {
        navigate(-1);
      }, 6000);
    } catch (error) {
      if (error instanceof Error) {
        setResetMessage((error as Error).message);
      }
    }
  };

  return (
    <>
      <h1>Reset your password</h1>
      <form action="submit" onSubmit={handleSubmit(onSubmit)} noValidate>
        <label htmlFor="email">Email</label>
        <input id="email" type="email" {...register("email")} />
        {errors.email && <p>{errors.email.message}</p>}
        {resetMessage && <p>{resetMessage}</p>}
        <button type="submit">Reset Password</button>
      </form>
      <Link to="/">Know your password?</Link>
    </>
  );
}

export default PasswordReset;
