"use client";

import { AuthContext } from "@/lib/store/auth-context";
import { useContext } from "react";
import { FaGoogle } from "react-icons/fa";
import { ImSpinner8 } from "react-icons/im";

export default function SignIn() {
    const authContext = useContext(AuthContext);

    if (!authContext) {
        return null;
    }

    const { loading, googleLoginHandler } = authContext;

    return (
        <main className="container max-w-2xl px-6 mx-auto font-poppins min-h-screen flex flex-col justify-center">
            <article className="card-glass p-8 rounded-2xl shadow-lg border border-border">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-primary-foreground mb-2">
                        Welcome to Finance Tracker
                    </h1>
                    <p className="text-secondary">
                        Manage your expenses and income with ease
                    </p>
                </header>

                <section className="flex flex-col items-center">
                    <button
                        onClick={googleLoginHandler}
                        disabled={loading}
                        className={`flex items-center justify-center gap-3 px-6 py-3 rounded-xl transition-all duration-300 ${loading
                            ? "bg-primary/50 cursor-not-allowed"
                            : "bg-primary hover:bg-primary-hover hover:shadow-lg"
                            } text-primary-foreground font-medium w-full max-w-xs`}
                    >
                        {loading ? (
                            <>
                                <ImSpinner8 className="animate-spin text-xl" />
                                <span>Signing in...</span>
                            </>
                        ) : (
                            <>
                                <FaGoogle className="text-xl" />
                                <span>Sign in with Google</span>
                            </>
                        )}
                    </button>

                    <footer className="mt-6 text-sm text-secondary text-center">
                        <p>By signing in, you agree to our Terms of Service</p>
                    </footer>
                </section>
            </article>
        </main>
    );
}