import { ToastMessage } from '../components';
import { dismissToast, useToasts } from '../store/toasts';

export function ToastStack() {
  const toasts = useToasts();
  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-lg bottom-lg left-lg z-40 flex flex-col items-end gap-sm sm:left-auto sm:w-full sm:max-w-dialog">
      {toasts.map((toast) => (
        <ToastMessage key={toast.id} tone={toast.tone} text={toast.text} onClose={() => dismissToast(toast.id)} />
      ))}
    </div>
  );
}
