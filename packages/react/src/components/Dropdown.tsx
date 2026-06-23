'use client';

import React from 'react';

/** A single item in the dropdown menu. */
export interface DropdownItem {
  /** Unique key. */
  value: string;
  /** Display label. */
  label: string;
  /** Whether this is a destructive action. */
  destructive?: boolean;
  /** Render a separator before this item. */
  separator?: boolean;
}

/** Props for the {@link Dropdown} component. */
export interface DropdownProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Menu items. */
  items: DropdownItem[];
  /** Whether the dropdown is open (controlled). */
  open?: boolean;
  /** Called when an item is selected. */
  onSelect?: (value: string) => void;
  /** Called when open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** The trigger element rendered as the dropdown button. */
  trigger: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Menu dropdown with dither overlay on the content panel.
 * Manages open/close state and renders items from the `items` prop.
 */
export const Dropdown = React.forwardRef<HTMLDivElement, DropdownProps>(
  ({ items, open: controlledOpen, onSelect, onOpenChange, trigger, className, ...rest }, ref) => {
    const [internalOpen, setInternalOpen] = React.useState(false);
    const isOpen = controlledOpen ?? internalOpen;
    const wrapperRef = React.useRef<HTMLDivElement>(null);

    const toggle = React.useCallback(() => {
      const next = !isOpen;
      if (controlledOpen === undefined) setInternalOpen(next);
      onOpenChange?.(next);
    }, [isOpen, controlledOpen, onOpenChange]);

    const close = React.useCallback(() => {
      if (controlledOpen === undefined) setInternalOpen(false);
      onOpenChange?.(false);
    }, [controlledOpen, onOpenChange]);

    // Close on outside click
    React.useEffect(() => {
      if (!isOpen) return;
      const handler = (e: MouseEvent) => {
        if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
          close();
        }
      };
      document.addEventListener('mousedown', handler);
      return () => document.removeEventListener('mousedown', handler);
    }, [isOpen, close]);

    return (
      <div
        ref={(node) => {
          (wrapperRef as React.MutableRefObject<HTMLDivElement | null>).current = node;
          if (typeof ref === 'function') ref(node);
          else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
        }}
        className={`sk-dropdown${className ? ` ${className}` : ''}`}
        {...rest}
      >
        <span onClick={toggle} style={{ cursor: 'pointer' }}>{trigger}</span>
        <div className="sk-dropdown__content" data-open={isOpen ? '' : undefined}>
          {items.map((item) => (
            <React.Fragment key={item.value}>
              {item.separator && <div className="sk-dropdown__separator" />}
              <div
                className={`sk-dropdown__item${item.destructive ? ' sk-dropdown__item--destructive' : ''}`}
                role="menuitem"
                onClick={() => {
                  onSelect?.(item.value);
                  close();
                }}
              >
                {item.label}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
);

Dropdown.displayName = 'Dropdown';
