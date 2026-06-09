import toast from 'react-hot-toast';

export { toast };

function toastId(type, message, options = {}) {
  if (options.id) return options.id;
  return `${type}:${String(message).trim()}`;
}

export function showToast(message, options = {}) {
  return toast(message, {
    ...options,
    id: toastId('default', message, options),
  });
}

export function showSuccessToast(message, options = {}) {
  return toast.success(message, {
    ...options,
    id: toastId('success', message, options),
  });
}

export function showErrorToast(message, options = {}) {
  return toast.error(message, {
    ...options,
    id: toastId('error', message, options),
  });
}

export function showLoadingToast(message, options = {}) {
  return toast.loading(message, {
    ...options,
    id: options.id ?? toastId('loading', message, options),
  });
}

export function dismissToast(toastId) {
  toast.dismiss(toastId);
}

export function dismissAllToasts() {
  toast.dismiss();
}

export async function toastPromise(promise, messages, options = {}) {
  const id =
    options.id ??
    (messages?.success
      ? toastId('success', messages.success, options)
      : undefined);

  return toast.promise(promise, messages, id ? { ...options, id } : options);
}
