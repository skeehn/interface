import React from 'react';

/** Semantic type for the Alert. */
export type AlertType = 'info' | 'success' | 'warning' | 'destructive';

/** Props for the {@link Alert} component. */
export interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Semantic alert type that controls color and icon. */
  type?: AlertType;
  /** Icon displayed to the left of the content. */
  icon?: React.ReactNode;
  /** Alert title. */
  title?: string;
  /** Alert description. */
  description?: string;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Feedback message with dither border.
 * Renders a `<div>` with the `sk-alert` class.
 */
export const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ type, icon, title, description, className, children, ...rest }, ref) => {
    const defaultIcons: Record<AlertType, string> = {
      info: 'i',
      success: '\u2713',
      warning: '!',
      destructive: '\u2717',
    };
    return (
      <div
        ref={ref}
        className={`sk-alert${className ? ` ${className}` : ''}`}
        data-type={type}
        {...rest}
      >
        {(icon || type) && (
          <span className="sk-alert__icon">{icon ?? (type ? defaultIcons[type] : null)}</span>
        )}
        <div className="sk-alert__content">
          {title && <p className="sk-alert__title">{title}</p>}
          {description && <p className="sk-alert__description">{description}</p>}
          {children}
        </div>
      </div>
    );
  },
);

Alert.displayName = 'Alert';
