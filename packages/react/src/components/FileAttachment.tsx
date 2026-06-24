'use client';

import React from 'react';

/** Upload state for a file attachment. */
export type FileAttachmentState = 'uploading' | 'done' | 'error';

/** Props for the {@link FileAttachment} component. */
export interface FileAttachmentProps extends React.HTMLAttributes<HTMLDivElement> {
  /** File name. */
  name: string;
  /** Human-readable file size string (e.g. "2.4 MB"). */
  size?: string;
  /** File icon character or emoji. */
  icon?: string;
  /** Current upload state. */
  state?: FileAttachmentState;
  /** Upload progress (0-100). Drives the progress bar width via CSS variable. */
  progress?: number;
  /** Called when the remove button is clicked. */
  onRemove?: () => void;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * File upload pill with progress bar and remove button.
 * Renders a `<div>` with `sk-file-attachment` and `data-state`.
 */
export const FileAttachment = React.forwardRef<HTMLDivElement, FileAttachmentProps>(
  ({ name, size, icon, state, progress, onRemove, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-file-attachment${className ? ` ${className}` : ''}`}
      data-state={state}
      style={{ '--_progress': progress !== undefined ? `${progress}%` : undefined } as React.CSSProperties}
      {...rest}
    >
      <div className="sk-file-attachment__progress" />
      {icon && <span className="sk-file-attachment__icon">{icon}</span>}
      <span className="sk-file-attachment__name">{name}</span>
      {size && <span className="sk-file-attachment__size">{size}</span>}
      {onRemove && (
        <button className="sk-file-attachment__remove" onClick={onRemove} aria-label="Remove file">
          x
        </button>
      )}
    </div>
  ),
);

FileAttachment.displayName = 'FileAttachment';

/** Props for the {@link FileAttachments} list wrapper. */
export interface FileAttachmentsProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Flex-wrap container for multiple FileAttachment pills. */
export const FileAttachments = React.forwardRef<HTMLDivElement, FileAttachmentsProps>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-file-attachments${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  ),
);

FileAttachments.displayName = 'FileAttachments';
