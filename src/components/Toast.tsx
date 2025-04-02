"use client";

import {
    FaCheckCircle,
    FaTimesCircle,
    FaInfoCircle,
    FaExclamationTriangle
} from 'react-icons/fa';
import { useEffect, useState } from 'react';

export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
    message: string;
    variant: ToastVariant;
    duration?: number;
    onDismiss?: () => void;
}

const Toast = ({
    message,
    variant,
    duration = 3000,
    onDismiss
}: ToastProps) => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsVisible(false);
            onDismiss?.();
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onDismiss]);

    const iconMap = {
        success: <FaCheckCircle className="text-success" />,
        error: <FaTimesCircle className="text-error" />,
        info: <FaInfoCircle className="text-info" />,
        warning: <FaExclamationTriangle className="text-warning" />
    };

    const bgColorMap = {
        success: 'bg-success/20 border-success/30',
        error: 'bg-error/20 border-error/30',
        info: 'bg-info/20 border-info/30',
        warning: 'bg-warning/20 border-warning/30'
    };

    return (
        <div
            role="alert"
            aria-live="polite"
            className={`transition-all duration-300 ${isVisible
                ? 'translate-x-0 opacity-100'
                : '-translate-x-full opacity-0'
                }`}
        >
            <div
                className={`${bgColorMap[variant]} border rounded-lg p-3 shadow-lg backdrop-blur-sm flex items-center gap-3 w-full`}
            >
                <span className="text-lg flex-shrink-0">
                    {iconMap[variant]}
                </span>
                <p className="text-primary-foreground text-sm">
                    {message}
                </p>
            </div>
        </div>
    );
};

export default Toast;