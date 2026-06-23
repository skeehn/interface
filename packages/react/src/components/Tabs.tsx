'use client';

import React from 'react';

/** A single tab definition. */
export interface TabItem {
  /** Unique value identifying this tab. */
  value: string;
  /** Label displayed on the tab trigger. */
  label: string;
  /** Content rendered when this tab is active. */
  content?: React.ReactNode;
}

/** Props for the {@link Tabs} component. */
export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of tab definitions. */
  tabs: TabItem[];
  /** The currently active tab value (controlled). */
  value?: string;
  /** Default active tab value (uncontrolled). */
  defaultValue?: string;
  /** Called when the active tab changes. */
  onValueChange?: (value: string) => void;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Tabbed navigation with dither tab indicator.
 * Manages active tab state internally or via controlled `value` prop.
 */
export const Tabs = React.forwardRef<HTMLDivElement, TabsProps>(
  ({ tabs, value, defaultValue, onValueChange, className, ...rest }, ref) => {
    const [internal, setInternal] = React.useState(defaultValue ?? tabs[0]?.value ?? '');
    const active = value ?? internal;

    const select = React.useCallback(
      (v: string) => {
        if (value === undefined) setInternal(v);
        onValueChange?.(v);
      },
      [value, onValueChange],
    );

    return (
      <div ref={ref} className={`sk-tabs${className ? ` ${className}` : ''}`} {...rest}>
        <div className="sk-tabs__list" role="tablist">
          {tabs.map((t) => (
            <button
              key={t.value}
              className="sk-tabs__trigger"
              role="tab"
              aria-selected={active === t.value}
              onClick={() => select(t.value)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tabs.map((t) => (
          <div
            key={t.value}
            className="sk-tabs__content"
            role="tabpanel"
            hidden={active !== t.value}
          >
            {t.content}
          </div>
        ))}
      </div>
    );
  },
);

Tabs.displayName = 'Tabs';
