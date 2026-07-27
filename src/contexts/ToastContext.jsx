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

// Paper background, ink text, a slim colored accent on the left instead of a
// loud filled background—reads as premium/minimal rather than an alert box.
const toastBaseClassName =
  '!flex !items-center !gap-3 !rounded-2xl !border !border-persona-border !border-l-[3px] !bg-white !px-4 !py-3.5 !font-sans !text-sm !font-semibold !text-persona-ink !shadow-[0_12px_36px_rgba(22,23,27,0.12)]';

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
        gutter={10}
        containerClassName="!top-4 sm:!top-6"
        toastOptions={{
          duration: 4500,
          className: toastBaseClassName,
          success: {
            iconTheme: {
              primary: '#0EAE6E',
              secondary: '#F4F3F1',
            },
            className: `${toastBaseClassName} !border-l-persona-purple`,
          },
          error: {
            iconTheme: {
              primary: '#E0453C',
              secondary: '#FDF3F2',
            },
            className: `${toastBaseClassName} !border-l-[#E0453C]`,
          },
          loading: {
            iconTheme: {
              primary: '#0EAE6E',
              secondary: '#E2F2EA',
            },
            className: `${toastBaseClassName} !border-l-persona-border`,
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
