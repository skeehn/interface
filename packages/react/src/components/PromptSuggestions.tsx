'use client';

import React from 'react';

/** Visual variant for the PromptSuggestions container. */
export type PromptSuggestionsVariant = 'chips';

/** A single prompt suggestion item. */
export interface PromptSuggestionItem {
  /** Unique identifier. */
  value: string;
  /** Suggestion text. */
  text: string;
  /** Optional icon displayed above the text. */
  icon?: string;
}

/** A labelled group of suggestions. */
export interface PromptSuggestionGroup {
  /** Group heading. */
  label: string;
  /** Items in this group. */
  items: PromptSuggestionItem[];
}

/** Props for the {@link PromptSuggestions} component. */
export interface PromptSuggestionsProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSelect'> {
  /** Flat array of suggestions (use this OR `groups`). */
  suggestions?: PromptSuggestionItem[];
  /** Categorized groups of suggestions (takes precedence over `suggestions`). */
  groups?: PromptSuggestionGroup[];
  /** Label text displayed above the grid. */
  label?: string;
  /** Visual variant. */
  variant?: PromptSuggestionsVariant;
  /** Called when a suggestion is selected. */
  onSelect?: (value: string) => void;
  /** Show a keyboard-hint footer (↑↓ navigate · ↵ select). */
  showKeyboardHints?: boolean;
  /** Opt into the staggered entrance animation. */
  animate?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Starter prompt suggestions for an empty AI chat state. Renders a grid (or
 * chips, or labelled groups) of clickable suggestions with arrow-key roving
 * focus and Enter/Space activation.
 */
export const PromptSuggestions = React.forwardRef<HTMLDivElement, PromptSuggestionsProps>(
  (
    { suggestions, groups, label, variant, onSelect, showKeyboardHints, animate, className, ...rest },
    ref,
  ) => {
    const flat = React.useMemo<PromptSuggestionItem[]>(
      () => (groups ? groups.flatMap((g) => g.items) : suggestions ?? []),
      [groups, suggestions],
    );
    const btnRefs = React.useRef<(HTMLButtonElement | null)[]>([]);
    const [focused, setFocused] = React.useState(-1);

    const focusAt = React.useCallback(
      (i: number) => {
        const n = flat.length;
        if (n === 0) return;
        const idx = ((i % n) + n) % n;
        setFocused(idx);
        btnRefs.current[idx]?.focus();
      },
      [flat.length],
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
          e.preventDefault();
          focusAt(focused + 1);
        } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
          e.preventDefault();
          focusAt(focused - 1);
        }
      },
      [focused, focusAt],
    );

    // running index across (optionally grouped) items, in flat order
    let index = -1;
    const renderItem = (s: PromptSuggestionItem) => {
      index += 1;
      const i = index;
      return (
        <button
          key={s.value}
          ref={(el) => {
            btnRefs.current[i] = el;
          }}
          type="button"
          className="sk-prompt-suggestion"
          data-focused={focused === i ? '' : undefined}
          onClick={() => onSelect?.(s.value)}
          onFocus={() => setFocused(i)}
        >
          {s.icon && <span className="sk-prompt-suggestion__icon">{s.icon}</span>}
          <span className="sk-prompt-suggestion__text">{s.text}</span>
        </button>
      );
    };

    return (
      <div
        ref={ref}
        className={`sk-prompt-suggestions${className ? ` ${className}` : ''}`}
        data-variant={variant}
        data-animate={animate ? '' : undefined}
        onKeyDown={handleKeyDown}
        {...rest}
      >
        {label && <span className="sk-prompt-suggestions__label">{label}</span>}
        {groups ? (
          groups.map((g) => (
            <div key={g.label} className="sk-prompt-suggestions__group">
              <span className="sk-prompt-suggestions__group-label">{g.label}</span>
              <div className="sk-prompt-suggestions__grid">{g.items.map(renderItem)}</div>
            </div>
          ))
        ) : (
          <div className="sk-prompt-suggestions__grid">{(suggestions ?? []).map(renderItem)}</div>
        )}
        {showKeyboardHints && (
          <div className="sk-prompt-suggestions__hint" aria-hidden="true">
            {'↑↓'} navigate · {'↵'} select
          </div>
        )}
      </div>
    );
  },
);

PromptSuggestions.displayName = 'PromptSuggestions';
