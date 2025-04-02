'use client';
import { IoReloadCircle } from "react-icons/io5";
import { useState, useContext } from "react";
import { AuthContext } from "@/lib/store/auth-context";
import Image from "next/image";

export default function Navigation() {
    const [isRefreshing, setIsRefreshing] = useState(false);
    const authContext = useContext(AuthContext);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => {
            window.location.reload();
        }, 800);
    };

    if (!authContext || authContext.loading) {
        return (
            <header className="flex items-center justify-between container max-w-2xl p-6 mx-auto">
                <span className="h-10 w-10 rounded-full bg-card animate-pulse"></span>
            </header>
        );
    }

    const { user, logout } = authContext;

    return (
        <main className="font-poppins bg-background">
            <header className="flex items-center justify-between container max-w-2xl p-6 mx-auto">
                {user ? (
                    <>
                        <span className="flex items-center gap-2">
                            <figure className="h-10 w-10 rounded-full overflow-hidden border-2 border-border relative">
                                <Image
                                    src={user.photoURL || '/default-avatar.png'}
                                    alt={user.displayName || 'User'}
                                    fill
                                    className="object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.onerror = null;
                                        target.src = '/default-avatar.png';
                                    }}
                                />
                            </figure>
                            <small className="text-secondary">
                                Hi, {user.displayName || 'User'}
                            </small>
                        </span>
                        <nav className="flex items-center gap-4">
                            <button
                                onClick={logout}
                                className="py-1  px-2 transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg rounded-md bg-error hover:bg-error/90 text-primary-foreground"
                            >
                                Logout
                            </button>
                        </nav>
                    </>
                ) : (
                    <span></span>
                )}
            </header>
        </main>
    );
}