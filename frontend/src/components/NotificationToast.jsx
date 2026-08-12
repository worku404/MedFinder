import { useEffect } from "react";
import "./NotificationToast.css";

export function NotificationToast({ toasts, onDismiss, onAction }) {
  useEffect(() => {
    if (toasts.length === 0) return;
    const latestToast = toasts[toasts.length - 1];
    const timer = setTimeout(() => {
      onDismiss(latestToast.id);
    }, 6000);

    return () => clearTimeout(timer);
  }, [toasts, onDismiss]);

  if (toasts.length === 0) return null;

  return (
    <div className="notification-toast-container" aria-live="assertive">
      {toasts.map((t) => (
        <div key={t.id} className="notification-toast">
          <div className="notification-toast__header">
            <h4 className="notification-toast__title">{t.title}</h4>
            <button
              type="button"
              className="notification-toast__close"
              aria-label="Dismiss notification"
              onClick={() => onDismiss(t.id)}
            >
              ✕
            </button>
          </div>
          <p className="notification-toast__body">{t.body}</p>
          {t.target_url && (
            <button
              type="button"
              className="btn btn--primary notification-toast__action"
              onClick={() => onAction(t)}
            >
              View Message
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
