// components/ui/toast-promise.tsx
"use client";

import { toast, ExternalToast } from "sonner";

interface ToastPromiseOptions<T> extends ExternalToast {
  loading?: string;
  success?: string | ((data: T) => string);
  error?: string | ((error: Error) => string);
}

interface ToastPromiseProps<T> {
  promise: Promise<T> | (() => Promise<T>);
  messages: ToastPromiseOptions<T>;
  position?:
    | "top-left"
    | "top-right"
    | "bottom-left"
    | "bottom-right"
    | "top-center"
    | "bottom-center";
  className?: string;
  duration?: number;
  richColors?: boolean;
  closeButton?: boolean;
}

export function useToastPromise() {
  const showPromise = <T,>({
    promise,
    messages,
    position,
    className,
    duration,
    richColors,
    closeButton,
  }: ToastPromiseProps<T>) => {
    const promiseToExecute =
      typeof promise === "function" ? promise() : promise;

    return toast.promise<T>(promiseToExecute, {
      loading: messages.loading || "Cargando...",
      success: messages.success || "¡Completado!",
      error: messages.error || "Ocurrió un error",
      position,
      className,
      duration: duration || 4000,
      richColors,
      closeButton,
      ...messages,
    });
  };

  return { showPromise };
}
