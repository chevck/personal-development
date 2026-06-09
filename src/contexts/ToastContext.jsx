import { createContext, useCallback, useContext, useMemo } from 'react';
import { Toaster } from 'react-hot-toast';
import {
  dismissAllToasts,
  dismissToast,
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
  showToast,
  toast,
  toastPromise,
} from '../lib/toast';

const ToastContext = createContext(null);

const toastClassName =
  'rounded-2xl border px-4 py-3 text-sm font-medium shadow-[0_8px_30px_rgba(0,0,0,0.12)]';

export function ToastProvider({ children }) {
  const value = useMemo(
    () => ({
      toast,
      showToast,
      showSuccessToast,
      showErrorToast,
      showLoadingToast,
      dismissToast,
      dismissAllToasts,
      toastPromise,
    }),
    [],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <Toaster
        position="top-center"
        gutter={12}
        containerClassName="!top-4 sm:!top-6"
        toastOptions={{
          duration: 4500,
          className: `${toastClassName} !bg-white !text-speakly-ink !border-speakly-coral-ring/80`,
          success: {
            iconTheme: {
              primary: '#D95D39',
              secondary: '#FFF4F0',
            },
            className: `${toastClassName} !bg-emerald-50 !text-emerald-900 !border-emerald-200`,
          },
          error: {
            iconTheme: {
              primary: '#DC2626',
              secondary: '#FEF2F2',
            },
            className: `${toastClassName} !bg-red-50 !text-red-800 !border-red-200`,
          },
          loading: {
            iconTheme: {
              primary: '#D95D39',
              secondary: '#FFF4F0',
            },
          },
        }}
      />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider.');
  }
  return context;
}

/** Fire a toast when a promise settles. Useful outside axios. */
export function useToastPromise() {
  const { toastPromise: runToastPromise } = useToast();
  return useCallback(
    (promise, messages, options) => runToastPromise(promise, messages, options),
    [runToastPromise],
  );
}

export default ToastProvider;
