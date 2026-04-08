import React from 'react';

/** A single accordion section definition. */
export interface AccordionItem {
  /** Unique key for this section. */
  value: string;
  /** Trigger label text. */
  label: string;
  /** Content rendered when expanded. */
  content: React.ReactNode;
}

/** Props for the {@link Accordion} component. */
export interface AccordionProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Accordion sections. */
  items: AccordionItem[];
  /** Currently open section value(s). Controls single or multiple. */
  value?: string | string[];
  /** Default open section(s) (uncontrolled). */
  defaultValue?: string | string[];
  /** Called when open sections change. */
  onValueChange?: (value: string[]) => void;
  /** Allow multiple sections to be open simultaneously. */
  multiple?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Collapsible sections with dither overlay on open items.
 * Manages expand/collapse state with optional multi-select.
 */
export const Accordion = React.forwardRef<HTMLDivElement, AccordionProps>(
  ({ items, value, defaultValue, onValueChange, multiple = false, className, ...rest }, ref) => {
    const normalize = (v: string | string[] | undefined): string[] => {
      if (v === undefined) return [];
      return Array.isArray(v) ? v : [v];
    };

    const [internal, setInternal] = React.useState<string[]>(normalize(defaultValue));
    const openItems = value !== undefined ? normalize(value) : internal;

    const toggle = React.useCallback(
      (itemValue: string) => {
        let next: string[];
        if (openItems.includes(itemValue)) {
          next = openItems.filter((v) => v !== itemValue);
        } else {
          next = multiple ? [...openItems, itemValue] : [itemValue];
        }
        if (value === undefined) setInternal(next);
        onValueChange?.(next);
      },
      [openItems, multiple, value, onValueChange],
    );

    return (
      <div ref={ref} className={`sk-accordion${className ? ` ${className}` : ''}`} {...rest}>
        {items.map((item) => {
          const isOpen = openItems.includes(item.value);
          return (
            <div
              key={item.value}
              className="sk-accordion__item"
              data-open={isOpen ? '' : undefined}
            >
              <button
                className="sk-accordion__trigger"
                aria-expanded={isOpen}
                onClick={() => toggle(item.value)}
              >
                <span>{item.label}</span>
                <span className="sk-accordion__chevron">{isOpen ? '\u25BE' : '\u25B8'}</span>
              </button>
              {isOpen && <div className="sk-accordion__content">{item.content}</div>}
            </div>
          );
        })}
      </div>
    );
  },
);

Accordion.displayName = 'Accordion';
