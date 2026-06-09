import axios from 'axios';
import {
  dismissToast,
  showErrorToast,
  showLoadingToast,
  showSuccessToast,
} from './toast';

/**
 * Per-request toast config (pass on axios config):
 * toast: false                         — no automatic toasts
 * toast: { success: 'Saved.' }        — success + default error
 * toast: { loading: 'Saving…', success: 'Saved.', error: 'Failed.' }
 */
export function getApiErrorMessage(error, fallback = 'Something went wrong.') {
  const data = error?.response?.data;
  if (typeof data === 'string' && data.trim()) return data.trim();
  if (typeof data?.message === 'string' && data.message.trim()) return data.message.trim();
  if (typeof data?.error === 'string' && data.error.trim()) return data.error.trim();
  if (typeof error?.message === 'string' && error.message.trim()) return error.message.trim();
  return fallback;
}

function resolveToastMessage(toastConfig, key, response) {
  const configured = toastConfig?.[key];
  if (typeof configured === 'string' && configured.trim()) return configured.trim();
  if (key === 'success') {
    const data = response?.data;
    if (typeof data === 'string' && data.trim()) return data.trim();
    if (typeof data?.message === 'string' && data.message.trim()) return data.message.trim();
  }
  return null;
}

function shouldToast(config) {
  return config?.toast !== false && config?.toast != null;
}

export const apiClient = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || '',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  if (!shouldToast(config)) return config;

  const loadingMessage = resolveToastMessage(config.toast, 'loading');
  if (loadingMessage) {
    const loadingId = `loading:${config.method}:${config.url}:${Date.now()}`;
    config._toastId = showLoadingToast(loadingMessage, { id: loadingId });
  }

  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const { config } = response;

    if (config?._toastId) {
      dismissToast(config._toastId);
    }

    if (shouldToast(config)) {
      const successMessage =
        resolveToastMessage(config.toast, 'success', response) ||
        resolveToastMessage({ success: 'Done.' }, 'success', response);

      if (successMessage) {
        showSuccessToast(successMessage);
      }
    }

    return response;
  },
  (error) => {
    const config = error?.config;

    if (config?._toastId) {
      dismissToast(config._toastId);
    }

    if (shouldToast(config)) {
      const errorMessage =
        resolveToastMessage(config.toast, 'error') ||
        getApiErrorMessage(error, 'Something went wrong.');
      showErrorToast(errorMessage);
    }

    return Promise.reject(error);
  },
);

export default apiClient;
