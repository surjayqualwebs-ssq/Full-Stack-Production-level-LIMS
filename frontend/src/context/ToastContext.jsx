import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
    const [toasts, setToasts] = useState([]);

    const addToast = useCallback((message, type = 'info', duration = 3000) => {
        const id = Date.now().toString();
        // Prevent duplicate toasts if needed, but for now allow stacking
        setToasts(prev => [...prev, { id, message, type, duration }]);

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id);
            }, duration);
        }
    }, []);

    const removeToast = useCallback((id) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const success = (message, duration) => addToast(message, 'success', duration);
    const error = (message, duration) => addToast(message, 'error', duration);
    const info = (message, duration) => addToast(message, 'info', duration);
    const warning = (message, duration) => addToast(message, 'warning', duration);

    return (
        <ToastContext.Provider value={{ addToast, removeToast, success, error, info, warning }}>
            {children}
            <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
                {toasts.map(toast => (
                    <ToastItem key={toast.id} toast={toast} onRemove={() => removeToast(toast.id)} />
                ))}
            </div>
        </ToastContext.Provider>
    );
};

const ToastItem = ({ toast, onRemove }) => {
    const { message, type, duration } = toast;
    const [width, setWidth] = useState(100);
    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (duration > 0) {
            // Tiny delay to ensure the transition happens after mount
            const timer = setTimeout(() => {
                setWidth(0);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [duration]);

    // Handle manual close with animation
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(onRemove, 300); // Match exit animation duration
    };

    // Icon mapping
    const icons = {
        success: <CheckCircle className="text-green-500" size={24} />,
        error: <AlertCircle className="text-red-500" size={24} />,
        warning: <AlertTriangle className="text-yellow-500" size={24} />,
        info: <Info className="text-blue-500" size={24} />
    };

    // Style mapping
    const styles = {
        success: "border-l-4 border-l-green-500 bg-white",
        error: "border-l-4 border-l-red-500 bg-white",
        warning: "border-l-4 border-l-yellow-500 bg-white",
        info: "border-l-4 border-l-blue-500 bg-white"
    };

    return (
        <div
            className={`pointer-events-auto flex items-start w-full p-4 rounded-md shadow-lg border border-gray-100 ${styles[type]} 
            ${isClosing ? 'animate-out fade-out slide-out-to-right duration-300' : 'animate-in slide-in-from-right-full duration-300'} 
            relative overflow-hidden group transition-all`}
        >
            <div className="flex-shrink-0 mr-3 mt-0.5">
                {icons[type]}
            </div>
            <div className="flex-1 mr-2">
                <h3 className="text-sm font-semibold text-gray-800 capitalize mb-1">
                    {type === 'info' ? 'Information' : type}
                </h3>
                <p className="text-sm text-gray-600 leading-relaxed font-medium">{message}</p>
            </div>
            <button
                onClick={handleClose}
                className="flex-shrink-0 text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 rounded-full hover:bg-gray-100"
            >
                <X size={16} />
            </button>

            {/* Progress Bar */}
            {duration > 0 && (
                <div
                    className={`absolute bottom-0 left-0 h-1 ${type === 'success' ? 'bg-green-500' :
                            type === 'error' ? 'bg-red-500' :
                                type === 'warning' ? 'bg-yellow-500' :
                                    'bg-blue-500'
                        }`}
                    style={{
                        width: `${width}%`,
                        transition: `width ${duration}ms linear`
                    }}
                />
            )}
        </div>
    );
};

export const useToast = () => {
    const context = useContext(ToastContext);
    if (!context) {
        throw new Error('useToast must be used within a ToastProvider');
    }
    return context;
};
