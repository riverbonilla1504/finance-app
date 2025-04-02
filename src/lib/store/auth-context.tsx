"use client";

import React, { createContext, ReactNode, useContext } from "react";
import { auth } from "@/lib/firebase";
import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { useAuthState } from "react-firebase-hooks/auth";


interface AuthContextType {
    user: any;
    loading: boolean;
    googleLoginHandler: () => Promise<void>;
    logout: () => Promise<void>;
}


export const AuthContext = createContext<AuthContextType | null>(null);

const AuthContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, loading] = useAuthState(auth);
    const googleProvider = new GoogleAuthProvider();

    const googleLoginHandler = async () => {
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error(error);
        }
    };

    const logout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error(error);
        }
    };


    return (
        <AuthContext.Provider value={{ user, loading, googleLoginHandler, logout }
        }>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContextProvider;
