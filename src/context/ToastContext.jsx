import { createContext, useContext, useState, useCallback } from 'react';

const ToastContext = createContext(null);

/** @param {string} msg */
function formatMsg(msg) {
  return typeof msg === 'string' ? msg : msg?.message ?? String(msg ?? '');
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info') => {
    const id = Date.now().toString(36) + Math.random().toString(36).slice(2);
    const msg = formatMsg(message);
    setToasts((prev) => [...prev, { id, message: msg, type }]);
    const duration = type === 'success' ? 5000 : 4000;
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, duration);
  }, []);

  const success = useCallback((msg) => addToast(msg, 'success'), [addToast]);
  const error = useCallback((msg) => addToast(msg, 'error'), [addToast]);
  const info = useCallback((msg) => addToast(msg, 'info'), [addToast]);

  return (
    <ToastContext.Provider value={{ addToast, success, error, info }}>
      {children}
      <div
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-sm font-medium max-w-sm animate-slide-in-right ${
              t.type === 'success'
                ? 'bg-emerald-600 text-white'
                : t.type === 'error'
                  ? 'bg-red-600 text-white'
                  : 'bg-slate-800 text-white dark:bg-slate-700'
            }`}
          >
            {t.type === 'success' && (
              <span className="material-icons text-lg flex-shrink-0" aria-hidden>check_circle</span>
            )}
            {t.type === 'error' && (
              <span className="material-icons text-lg flex-shrink-0" aria-hidden>error</span>
            )}
            {t.type === 'info' && (
              <span className="material-icons text-lg flex-shrink-0 opacity-80" aria-hidden>info</span>
            )}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) return { success: () => {}, error: () => {}, info: () => {}, addToast: () => {} };
  return ctx;
}
