import React, { useEffect, useState, createContext } from "react";
import { auth, db } from "./Firebase";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  signup: (email: string, password: string) => Promise<void>;
  resetPass: (email: string) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>(
  {} as AuthContextType
);

interface Props {
  children: React.ReactNode;
}

export const AuthProvider: React.FC<Props> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        console.log("User is signed in");
        console.log(firebaseUser);
      } else {
        setUser(null);
        console.log("User is signed out");
      }
    });
    return checkUser;
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Signed in
      const user = userCredential.user;
      console.log(user);

      const userRef = doc(db, `users/${user.uid}`);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          createdAt: new Date(),
        });
        console.log("User profile created in Firestore");
      } else {
        console.log("User already exists in Firestore");
      }
    } catch (error) {
      const errorCode = (error as { code?: string }).code;
      const errorMessage = (error as { message?: string }).message;
      console.error("Login failed:", { errorCode, errorMessage });

      if (errorCode === "auth/invalid-credential") {
        throw new Error("Incorrect email or password.");
      } else if (errorCode === "auth/too-many-requests") {
        throw new Error(
          "Too many failed login attempts. Please try again later or reset your password."
        );
      } else {
        throw new Error("An unexpected error occured. Please try again later.");
      }
    }
  };

  const logout = async (): Promise<void> => {
    signOut(auth)
      .then(() => {
        // Sign-out successful.
        console.log("User signed out successfully");
      })
      .catch((error) => {
        const errorCode = (error as { code?: string }).code;
        const errorMessage = (error as { message?: string }).message;
        console.error("Logout failed:", { errorCode, errorMessage });
        throw new Error("Error logging out. An unexpected error occured.");
      });
  };

  const signup = async (email: string, password: string): Promise<void> => {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      // Signed up
      const user = userCredential.user;

      const userRef = doc(db, `users/${user.uid}`);
      await setDoc(userRef, {
        email: user.email,
        createdAt: new Date(),
      });
    } catch (error) {
      const errorCode = (error as { code?: string }).code;
      const errorMessage = (error as { message?: string }).message;
      console.error("Signup failed:", { errorCode, errorMessage });

      if (errorCode === "auth/email-already-in-use") {
        throw new Error("Whoops! That email is already registered!");
      } else {
        throw new Error("An unexpected error occured. Please try again later.");
      }
    }
  };

  const resetPass = async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      const errorCode = (error as { code?: string }).code;
      const errorMessage = (error as { message?: string }).message;
      console.error("Error sending password reset email:", {
        errorCode,
        errorMessage,
      });
      if (errorCode === "auth/invalid-email") {
        throw new Error("Invalid email format.");
      } else {
        throw new Error("An unexpected error occured. Please try again later.");
      }
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, signup, resetPass }}>
      {children}
    </AuthContext.Provider>
  );
};
