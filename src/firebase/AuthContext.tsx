import React from "react";
import { User } from "firebase/auth";

const AuthContext = React.createContext<User | null>(null);

export default AuthContext;

// Is this refactorable? Can I use "createContext" on its own? Or do I need the "React" import (which seems a little redundant)
