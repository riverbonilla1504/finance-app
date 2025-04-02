"use client";

import { useState, useCallback, useMemo } from 'react';
import Toast, { ToastVariant } from '@/components/Toast';
import { v4 as uuidv4 } from 'uuid';

interface ToastMessage {
    id: string;
    message: string;
    variant: ToastVariant;
}

export const useToast = () => {
    const [toasts, setToasts] = useState<ToastMessage[]>([]);

    const showToast = useCallback((
        message: string,
        variant: ToastVariant = 'info',
        duration: number = 3000
    ) => {
        const id = uuidv4();

        setToasts((prev) => [...prev, { id, message, variant }]);

        const timer = setTimeout(() => {
            setToasts((prev) => prev.filter((toast) => toast.id !== id));
        }, duration);

        return () => clearTimeout(timer);
    }, []);

    const removeToast = useCallback((id: string) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, []);

    const ToastContainer = useMemo(() => () => (
        <section
            className="fixed bottom-4 right-4 z-50 space-y-2 w-full max-w-xs"
            aria-live="polite"
            role="region"
        >
            {toasts.map((toast) => (
                <Toast
                    key={toast.id}
                    message={toast.message}
                    variant={toast.variant}
                    onDismiss={() => removeToast(toast.id)}
                />
            ))}
        </section>
    ), [toasts, removeToast]);

    return { showToast, ToastContainer };
};