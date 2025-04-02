import React from "react";

export function Modal({
    show,
    onClose,
    children
}: {
    show: boolean;
    onClose: (value: boolean) => void;
    children?: React.ReactNode
}) {
    return (
        <section
            style={{
                transform: show ? "translateX(0%)" : "translateX(-200%)",
            }}
            className="absolute top-0 left-0 w-full h-full z-50 transition-all duration-500 ease-custom"
            aria-modal="true"
            aria-hidden={!show}
        >

            <button
                onClick={() => onClose(false)}
                className="fixed inset-0 w-full h-full bg-background/80 backdrop-blur-sm cursor-default"
                aria-label="Cerrar modal"
            />


            <article className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl px-4">
                <section className="container mx-auto rounded-2xl bg-card border border-border shadow-xl overflow-hidden">
                    <header className="flex justify-end p-4 border-b border-border">
                        <button
                            onClick={() => onClose(false)}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-error hover:bg-error/90 text-primary-foreground font-bold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-error focus:ring-offset-2 focus:ring-offset-card"
                            aria-label="Cerrar modal"
                        >
                            <span aria-hidden="true">X</span>
                        </button>
                    </header>

                    <main className="p-6">
                        {children}
                    </main>
                </section>
            </article>
        </section>
    );
}

