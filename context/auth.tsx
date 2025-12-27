"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/firebase/client";
import { onAuthStateChanged } from "firebase/auth";

type AuthContextType = {
     currentUser: User | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
     const [currentUser, setCurrentUser] = useState<User | null>(null);

     useEffect(() => {
          const unsubscribe = onAuthStateChanged(auth, (user) => {
               setCurrentUser(user ? user : null);
          });
          return () => unsubscribe();
     }, []);
     return (
          <AuthContext.Provider value={{ currentUser }}>
               {children}
          </AuthContext.Provider>
     )
}
export const useAuth = () => useContext(AuthContext);