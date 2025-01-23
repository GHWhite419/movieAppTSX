import { useState, useContext, useEffect } from "react";
import { AuthContext } from "../../context/AuthContext";
import { GroupContext, GroupContextType } from "../../context/GroupContext";
import { Link, useNavigate } from "react-router-dom";
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
  const { user, signup, joinGroupIntent, setJoinGroupIntent } =
    useContext(AuthContext);
  const { getGroup } = useContext(GroupContext) as GroupContextType;
  const [signupError, setSignupError] = useState<string | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);

  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(signupSchema),
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
      await signup(data.email, data.password);
      setSignupError(null);
      if (joinGroupIntent) {
        navigate(`/groups/join/${joinGroupIntent}`);
        setJoinGroupIntent(null);
      } else {
        navigate("/home");
      }
    } catch (error) {
      if (error instanceof Error) {
        setSignupError((error as Error).message);
      }
    }
  };

  return (
    <>
      {joinGroupIntent ? (
        <h1>Sign up for an account to join {groupName}</h1>
      ) : (
        <h1>Sign up for an account here!</h1>
      )}

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
