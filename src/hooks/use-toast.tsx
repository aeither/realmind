import type React from "react";
import { createContext, useContext, useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";

interface Toast {
  title: string;
  description?: string;
  variant?: "default" | "destructive";
}

interface ToastContextType {
  toast: (toast: Toast) => void;
  toasts: (Toast & { id: string })[];
  dismissToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // Simple fallback implementation
    return {
      toast: (toast: Toast) => {
        console.log(`Toast: ${toast.title}`, toast.description);
      },
      toasts: [],
      dismissToast: () => {},
    };
  }
  return context;
};

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<(Toast & { id: string })[]>([]);
  
  // Ref to track component mount status
  const isMountedRef = useRef(true);

  // Cleanup function to prevent memory leaks
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const toast = (toast: Toast) => {
    if (!isMountedRef.current) return () => {};
    
    const id = Math.random().toString(36).substring(2, 11);
    setToasts((prev) => [...prev, { ...toast, id }]);
    
    const timeout = setTimeout(() => {
      if (isMountedRef.current) {
        dismissToast(id);
      }
    }, 3000);
    
    // Cleanup timeout if component unmounts
    return () => clearTimeout(timeout);
  };

  const dismissToast = (id: string) => {
    if (isMountedRef.current) {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }
  };

  return (
    <ToastContext.Provider value={{ toast, toasts, dismissToast }}>
      {children}
      <ToastRenderer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

const ToastRenderer: React.FC<{
  toasts: (Toast & { id: string })[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    // Create or get the toast container
    let toastContainer = document.getElementById('toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.id = 'toast-container';
      toastContainer.style.cssText = `
        position: fixed;
        top: 1rem;
        right: 1rem;
        z-index: 9999;
        max-width: 420px;
        pointer-events: none;
      `;
      document.body.appendChild(toastContainer);
    }
    setContainer(toastContainer);

    return () => {
      // Clean up if no toasts remain and container exists
      if (toasts.length === 0 && toastContainer) {
        // Use a safer removal method
        try {
          if (toastContainer.parentNode === document.body) {
            document.body.removeChild(toastContainer);
          }
        } catch (error) {
          // Silently handle cases where the element is already removed
          console.debug('Toast container already removed:', error);
        }
      }
    };
  }, [toasts.length]);

  if (!container) return null;

  return createPortal(
    <div className="space-y-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            bg-white dark:bg-gray-800 
            border border-gray-200 dark:border-gray-700 
            rounded-lg shadow-lg p-4 
            pointer-events-auto cursor-pointer
            transition-all duration-200 ease-in-out
            hover:shadow-xl
            ${toast.variant === 'destructive' ? 'border-red-200 bg-red-50 dark:bg-red-900/20' : ''}
          `}
          onClick={() => onDismiss(toast.id)}
        >
          <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
            {toast.title}
          </div>
          {toast.description && (
            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {toast.description}
            </div>
          )}
        </div>
      ))}
    </div>,
    container
  );
};