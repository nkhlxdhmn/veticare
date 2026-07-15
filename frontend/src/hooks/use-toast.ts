/**
 * Toast notification hook. Lightweight imperative toast API.
 * Uses a simple event emitter pattern to avoid extra context overhead.
 */
import { useState, useEffect, useCallback } from 'react';

export type ToastVariant = 'default' | 'success' | 'destructive';

export interface Toast {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

type ToastListener = (toast: Toast) => void;

const listeners: Set<ToastListener> = new Set();
let toastCount = 0;

/** Dispatch a toast notification from anywhere in the app. */
export function toast({
  title,
  description,
  variant = 'default',
}: Omit<Toast, 'id'>) {
  const id = String(++toastCount);
  const t: Toast = { id, title, description, variant };
  listeners.forEach((fn) => fn(t));
}

/** Hook to consume incoming toast events. Used by the Toaster component. */
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([]);

  useEffect(() => {
    const handler: ToastListener = (t) => {
      setToasts((prev) => [...prev, t]);
    };
    listeners.add(handler);
    return () => {
      listeners.delete(handler);
    };
  }, []);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return { toasts, dismiss };
}
