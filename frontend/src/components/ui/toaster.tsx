/**
 * Toaster — renders active toast notifications with auto-dismiss.
 * Mount once in App.tsx or main layout.
 */
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

const variantStyles: Record<string, string> = {
  default: 'bg-background border text-foreground',
  success: 'bg-emerald-600 border-emerald-700 text-white',
  destructive: 'bg-red-600 border-red-700 text-white',
};

export function Toaster() {
  const { toasts, dismiss } = useToast();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((t) => (
        <ToastItem key={t.id} toast={t} onDismiss={dismiss} />
      ))}
    </div>
  );
}

function ToastItem({
  toast: t,
  onDismiss,
}: {
  toast: { id: string; title: string; description?: string; variant?: string };
  onDismiss: (id: string) => void;
}) {
  useEffect(() => {
    const timer = setTimeout(() => onDismiss(t.id), 4000);
    return () => clearTimeout(timer);
  }, [t.id, onDismiss]);

  return (
    <div
      className={cn(
        'pointer-events-auto rounded-lg border px-4 py-3 shadow-lg transition-all animate-in slide-in-from-bottom-2 fade-in-0 duration-200 flex items-start gap-3',
        variantStyles[t.variant || 'default']
      )}
      role="alert"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold leading-tight">{t.title}</p>
        {t.description && (
          <p className="text-sm mt-1 opacity-90 leading-snug">{t.description}</p>
        )}
      </div>
      <button
        onClick={() => onDismiss(t.id)}
        className="shrink-0 rounded-md p-1 opacity-70 hover:opacity-100 transition-opacity"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
