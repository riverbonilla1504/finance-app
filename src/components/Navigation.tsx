'use client';
import { IoReloadCircle } from "react-icons/io5";

import { useState } from "react";

export default function Navigation() {
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        // Simular un pequeño delay para la animación
        setTimeout(() => {
            window.location.reload();
        }, 800);
    };

    return (
        <main className="font-poppins bg-background">
            <header className="flex items-center justify-between container max-w-2xl p-6 mx-auto">
                <span className="flex items-center gap-2">
                    <figure className="h-10 w-10 rounded-full overflow-hidden border-2 border-border">
                        <img
                            src="/fototomas.jpg"
                            alt="Foto de perfil"
                            className="object-cover h-full w-full"
                        />
                    </figure>
                    <small className="text-secondary">Hi, Tomas</small>
                </span>
                <nav className="flex items-center gap-4">
                    <button
                        onClick={handleRefresh}
                        className="p-2 rounded-md bg-card hover:bg-primary transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background"
                        aria-label="Recargar datos"
                        disabled={isRefreshing}
                    >
                        {isRefreshing ? (
                            <IoReloadCircle className="text-xl  text-primary-foreground animate-spin" />
                        ) : (
                            <IoReloadCircle className="text-xl  text-primary-foreground" />
                        )}
                    </button>
                </nav>
            </header>
        </main>
    );
}