import React from "react";

export function Modal({ show, onClose, children }: { show: boolean; onClose: (value: boolean) => void; children?: React.ReactNode }) {
    return (
        <section style={{
            transform: show ? "translateX(0%)" : "translateX(-200%)",
        }} className="absolute top-10 left-0 w-full h-full z-10 transition-all duration-500">
            <section className="container mx-auto max-w-2xl h-210 rounded-3xl bg-slate-800 p-4">
                <button onClick={() => { onClose(false) }} className="w-10 h-10 mb-4 font-bold rounded-full bg-red-200">X</button>
                {children}
            </section>
        </section>
    );
}