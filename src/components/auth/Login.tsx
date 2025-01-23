import { useContext, useState, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { GroupContext, GroupContextType } from "../../context/GroupContext";
import { Link, useNavigate } from "react-router-dom";
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
  const { user, login, joinGroupIntent, setJoinGroupIntent } =
    useContext(AuthContext);
  const { getGroup } = useContext(GroupContext) as GroupContextType;
  const [loginError, setLoginError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(loginSchema),
    mode: "onBlur",
    reValidateMode: "onSubmit",
  });

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  useEffect(() => {
    if (joinGroupIntent) {
      getGroup(joinGroupIntent).then((group) => {
        if (group) setGroupName(group.name);
      });
    }
  }, []);

  const onSubmit = async (data: { email: string; password: string }) => {
    try {
      await login(data.email, data.password);
      setLoginError(null);
      if (joinGroupIntent) {
        navigate(`/groups/join/${joinGroupIntent}`);
        setJoinGroupIntent(null);
      } else {
        navigate("/home");
      }
    } catch (error) {
      if (error instanceof Error) {
        setLoginError((error as Error).message);
      }
    }
  };

  return (
    <>
      {joinGroupIntent ? (
        <h1>Sign in to join {groupName}</h1>
      ) : (
        <h1>Welcome! Please sign in if you have an account</h1>
      )}
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
