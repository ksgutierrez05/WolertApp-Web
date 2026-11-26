import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { mensajeSeguro } from "./feedbackUtils";
import { FeedbackContext } from "./feedbackContext";
import "../../css/feedback.css";

let nextToastId = 0;
let nextDialogId = 0;

function ToastCard({ toast, onClose }) {
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    if (!toast.duration) return undefined;
    const timer = window.setTimeout(() => onClose(toast.id), toast.duration);
    return () => window.clearTimeout(timer);
  }, [onClose, toast.duration, toast.id]);

  const iconos = {
    success: "bi-check-lg",
    error: "bi-exclamation-lg",
    warning: "bi-exclamation",
    info: "bi-info-lg",
  };

  return (
    <article
      className={`feedback-toast feedback-toast--${toast.type}`}
      role={toast.type === "error" ? "alert" : "status"}
      aria-labelledby={titleId}
      aria-describedby={descriptionId}
      style={{ "--feedback-toast-duration": `${toast.duration}ms` }}
    >
      <span className="feedback-toast-icon" aria-hidden="true">
        <i className={`bi ${iconos[toast.type] || iconos.info}`} />
      </span>
      <div className="feedback-toast-copy">
        <strong id={titleId}>{toast.title}</strong>
        <p id={descriptionId}>{toast.description}</p>
      </div>
      <button
        className="feedback-toast-close"
        type="button"
        aria-label="Cerrar notificación"
        onClick={() => onClose(toast.id)}
      >
        <i className="bi bi-x-lg" aria-hidden="true" />
      </button>
      {toast.duration > 0 && <span className="feedback-toast-progress" aria-hidden="true" />}
    </article>
  );
}

function Dialog({ dialog, onConfirm, onCancel, onValueChange }) {
  const dialogRef = useRef(null);
  const cancelRef = useRef(null);
  const confirmRef = useRef(null);
  const inputRef = useRef(null);
  const isPrompt = dialog.kind === "prompt";

  useEffect(() => {
    const target = isPrompt ? inputRef.current : confirmRef.current;
    target?.focus();
  }, [dialog.id, isPrompt]);

  const handleKeyDown = (event) => {
    if (dialog.closing) {
      event.preventDefault();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      onCancel();
      return;
    }
    if (event.key === "Enter" && isPrompt && !dialog.busy) {
      event.preventDefault();
      onConfirm();
      return;
    }
    if (event.key !== "Tab") return;

    const focusables = dialogRef.current?.querySelectorAll(
      "button:not(:disabled), input:not(:disabled), textarea:not(:disabled), [tabindex='0']"
    );
    if (!focusables?.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const iconos = {
    success: "bi-check-lg",
    error: "bi-exclamation-lg",
    warning: "bi-exclamation",
    info: "bi-info-lg",
    confirm: "bi-question-lg",
    prompt: "bi-chat-square-text",
  };
  const tone = dialog.tone || (isPrompt ? "info" : "confirm");

  return (
    <div
      className={`feedback-backdrop${dialog.closing ? " feedback-is-closing" : ""}`}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !dialog.busy && !dialog.closing) onCancel();
      }}
    >
      <section
        className={`feedback-dialog${dialog.closing ? " feedback-dialog-is-closing" : ""}`}
        role={isPrompt || dialog.kind === "confirm" ? "alertdialog" : "dialog"}
        aria-modal="true"
        aria-labelledby={`feedback-dialog-title-${dialog.id}`}
        aria-describedby={`feedback-dialog-description-${dialog.id}`}
        ref={dialogRef}
        onKeyDown={handleKeyDown}
      >
        <button
          type="button"
          className="feedback-dialog-close"
          aria-label="Cerrar ventana"
          onClick={onCancel}
          disabled={dialog.busy || dialog.closing}
        >
          <i className="bi bi-x-lg" aria-hidden="true" />
        </button>
        <div className={`feedback-dialog-icon feedback-dialog-icon--${tone}`} aria-hidden="true">
          <i className={`bi ${iconos[tone] || iconos.info}`} />
        </div>
        <h2 id={`feedback-dialog-title-${dialog.id}`}>{dialog.title}</h2>
        <p id={`feedback-dialog-description-${dialog.id}`} className="feedback-dialog-description">
          {dialog.description}
        </p>
        {isPrompt && (
          <label className="feedback-prompt-label">
            <span>{dialog.inputLabel}</span>
            {dialog.multiline ? (
              <textarea
                ref={inputRef}
                value={dialog.value}
                placeholder={dialog.placeholder}
                maxLength={dialog.maxLength || 500}
                onChange={(event) => onValueChange(event.target.value)}
                disabled={dialog.busy}
                rows={3}
              />
            ) : (
              <input
                ref={inputRef}
                value={dialog.value}
                placeholder={dialog.placeholder}
                maxLength={dialog.maxLength || 200}
                onChange={(event) => onValueChange(event.target.value)}
                disabled={dialog.busy}
              />
            )}
            {dialog.validation && <small role="alert">{dialog.validation}</small>}
          </label>
        )}
        {dialog.busy && (
          <span className="feedback-dialog-progress" role="status">
            <span className="feedback-spinner" aria-hidden="true" />
            Procesando solicitud…
          </span>
        )}
        <div className="feedback-dialog-actions">
          <button
            type="button"
            className="feedback-button feedback-button--secondary"
            onClick={onCancel}
            disabled={dialog.busy || dialog.closing}
            ref={cancelRef}
          >
            {dialog.cancelLabel || "Cancelar"}
          </button>
          <button
            type="button"
            className="feedback-button feedback-button--primary"
            onClick={onConfirm}
            disabled={dialog.busy || dialog.closing}
            ref={confirmRef}
          >
            {dialog.busy ? "Procesando…" : dialog.confirmLabel || "Confirmar"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function FeedbackProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [dialog, setDialog] = useState(null);
  const dialogRef = useRef(null);
  const closeTimerRef = useRef(null);

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const notify = useCallback((type, description, title, duration) => {
    const key = `${type}:${String(description).trim().toLocaleLowerCase()}`;
    setToasts((current) => {
      if (current.some((toast) => toast.key === key)) return current;
      const persistent = type === "error";
      return [
        ...current,
        {
          id: ++nextToastId,
          key,
          type,
          title: title || ({ success: "Operación completada", error: "No se pudo completar", warning: "Revisa esta información", info: "Información" }[type]),
          description: String(description || ""),
          duration: persistent ? 0 : duration ?? 4500,
        },
      ].slice(-5);
    });
  }, []);

  const toast = useMemo(() => ({
    success: (message, title, duration) => notify("success", message, title, duration),
    error: (message, title) => notify("error", message, title, 0),
    warning: (message, title, duration) => notify("warning", message, title, duration),
    info: (message, title, duration) => notify("info", message, title, duration),
    errorFrom: (error, fallback, title) => {
      console.error("[Central Policía]", error);
      notify("error", mensajeSeguro(error, fallback), title || "No se pudo completar", 0);
    },
  }), [notify]);

  const openDialog = useCallback((kind, options = {}) => {
    if (dialogRef.current) return Promise.resolve(false);
    return new Promise((resolve) => {
      const next = {
        ...options,
        id: ++nextDialogId,
        kind,
        busy: false,
        value: options.value || "",
        validation: "",
        opener: document.activeElement,
        resolve,
      };
      dialogRef.current = next;
      setDialog(next);
    });
  }, []);

  const confirm = useCallback((options) => openDialog("confirm", options), [openDialog]);
  const prompt = useCallback((options) => openDialog("prompt", options), [openDialog]);

  const finishDialog = useCallback((value, force = false) => {
    const active = dialogRef.current;
    if (!active || active.closing || (active.busy && !force)) return;
    const closing = { ...active, closing: true };
    dialogRef.current = closing;
    setDialog(closing);
    closeTimerRef.current = window.setTimeout(() => {
      if (dialogRef.current?.id !== active.id) return;
      dialogRef.current = null;
      setDialog(null);
      active.resolve(value);
      window.requestAnimationFrame(() => {
        if (active.opener?.isConnected) active.opener.focus();
      });
    }, 120);
  }, []);

  const cancelDialog = useCallback(() => {
    if (!dialogRef.current?.busy) {
      finishDialog(dialogRef.current?.kind === "prompt" ? null : false);
    }
  }, [finishDialog]);

  const changePromptValue = useCallback((value) => {
    const active = dialogRef.current;
    if (!active || active.busy) return;
    const next = { ...active, value, validation: "" };
    dialogRef.current = next;
    setDialog(next);
  }, []);

  const submitDialog = useCallback(async () => {
    const active = dialogRef.current;
    if (!active || active.busy) return;

    if (active.kind === "prompt" && active.required && !active.value.trim()) {
      const next = { ...active, validation: active.validationMessage || "Escribe un motivo para continuar." };
      dialogRef.current = next;
      setDialog(next);
      return;
    }

    if (!active.onConfirm) {
      finishDialog(active.kind === "prompt" ? active.value.trim() : true, true);
      return;
    }

    const processing = { ...active, busy: true };
    dialogRef.current = processing;
    setDialog(processing);
    try {
      await active.onConfirm(active.kind === "prompt" ? active.value.trim() : undefined);
      finishDialog(active.kind === "prompt" ? active.value.trim() : true, true);
    } catch (error) {
      console.error("[Central Policía]", error);
      notify("error", mensajeSeguro(error, active.failureMessage), active.failureTitle || "No se pudo completar", 0);
      finishDialog(active.kind === "prompt" ? null : false, true);
    }
  }, [finishDialog, notify]);

  const previousDialog = useRef(null);
  useEffect(() => {
    if (dialog) {
      previousDialog.current = dialog;
      return undefined;
    }
    const opener = previousDialog.current?.opener;
    previousDialog.current = null;
    if (opener?.isConnected) window.requestAnimationFrame(() => opener.focus());
    return undefined;
  }, [dialog]);

  const value = { confirm, prompt, toast };
  const portal = typeof document === "undefined"
    ? null
    : createPortal(
        <>
          <div className="feedback-toast-stack" aria-label="Notificaciones del sistema" aria-live="polite">
            {toasts.map((item) => <ToastCard key={item.id} toast={item} onClose={removeToast} />)}
          </div>
          {dialog && (
            <Dialog
              dialog={dialog}
              onConfirm={submitDialog}
              onCancel={cancelDialog}
              onValueChange={changePromptValue}
            />
          )}
        </>,
        document.body
      );

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {portal}
    </FeedbackContext.Provider>
  );
}

