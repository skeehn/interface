import React from 'react';

/** Props for the {@link Dialog} component. */
export interface DialogProps extends React.DialogHTMLAttributes<HTMLDialogElement> {
  /** Whether the dialog is open. Controls the native `<dialog>` element. */
  open?: boolean;
  /** Called when the dialog requests to close (backdrop click or Escape). */
  onClose?: () => void;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Modal overlay with dither backdrop.
 * Wraps the native `<dialog>` element and manages `showModal()`/`close()` via `useEffect`.
 */
export const Dialog = React.forwardRef<HTMLDialogElement, DialogProps>(
  ({ open, onClose, className, children, ...rest }, ref) => {
    const innerRef = React.useRef<HTMLDialogElement>(null);
    const dialogRef = (ref as React.RefObject<HTMLDialogElement>) ?? innerRef;

    React.useEffect(() => {
      const el = typeof dialogRef === 'object' && dialogRef !== null ? dialogRef.current : null;
      if (!el) return;
      if (open && !el.open) {
        el.showModal();
      } else if (!open && el.open) {
        el.close();
      }
    }, [open, dialogRef]);

    React.useEffect(() => {
      const el = typeof dialogRef === 'object' && dialogRef !== null ? dialogRef.current : null;
      if (!el || !onClose) return;
      const handler = () => onClose();
      el.addEventListener('close', handler);
      return () => el.removeEventListener('close', handler);
    }, [onClose, dialogRef]);

    // Close on backdrop click
    const handleClick = React.useCallback(
      (e: React.MouseEvent<HTMLDialogElement>) => {
        const el = typeof dialogRef === 'object' && dialogRef !== null ? dialogRef.current : null;
        if (e.target === el && onClose) onClose();
      },
      [onClose, dialogRef],
    );

    return (
      <dialog
        ref={dialogRef}
        className={`sk-dialog${className ? ` ${className}` : ''}`}
        onClick={handleClick}
        {...rest}
      >
        {children}
      </dialog>
    );
  },
);

Dialog.displayName = 'Dialog';

/** Props for the {@link DialogContent} sub-component. */
export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Content wrapper inside Dialog providing the dither border. */
export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-dialog__content${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  ),
);

DialogContent.displayName = 'DialogContent';

/** Props for the {@link DialogHeader} sub-component. */
export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Dialog title text. */
  title?: string;
  /** Called when the close button is clicked. */
  onClose?: () => void;
  children?: React.ReactNode;
  className?: string;
}

/** Header section of a Dialog with title and close button. */
export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ title, onClose, className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-dialog__header${className ? ` ${className}` : ''}`} {...rest}>
      {title && <h2 className="sk-dialog__title">{title}</h2>}
      {children}
      {onClose && (
        <button className="sk-dialog__close" onClick={onClose} aria-label="Close dialog">
          [x]
        </button>
      )}
    </div>
  ),
);

DialogHeader.displayName = 'DialogHeader';

/** Props for the {@link DialogBody} sub-component. */
export interface DialogBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Body section of a Dialog. */
export const DialogBody = React.forwardRef<HTMLDivElement, DialogBodyProps>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-dialog__body${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  ),
);

DialogBody.displayName = 'DialogBody';

/** Props for the {@link DialogFooter} sub-component. */
export interface DialogFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Footer section of a Dialog, typically containing action buttons. */
export const DialogFooter = React.forwardRef<HTMLDivElement, DialogFooterProps>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-dialog__footer${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  ),
);

DialogFooter.displayName = 'DialogFooter';
