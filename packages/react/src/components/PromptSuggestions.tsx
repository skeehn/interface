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

/** Props for the {@link PromptSuggestions} component. */
export interface PromptSuggestionsProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of prompt suggestion items. */
  suggestions: PromptSuggestionItem[];
  /** Label text displayed above the grid. */
  label?: string;
  /** Visual variant. */
  variant?: PromptSuggestionsVariant;
  /** Called when a suggestion is selected. */
  onSelect?: (value: string) => void;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Starter prompt suggestions for empty AI chat state.
 * Renders a grid (or chips) of clickable suggestion buttons.
 */
export const PromptSuggestions = React.forwardRef<HTMLDivElement, PromptSuggestionsProps>(
  ({ suggestions, label, variant, onSelect, className, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-prompt-suggestions${className ? ` ${className}` : ''}`}
      data-variant={variant}
      {...rest}
    >
      {label && <span className="sk-prompt-suggestions__label">{label}</span>}
      <div className="sk-prompt-suggestions__grid">
        {suggestions.map((s) => (
          <button
            key={s.value}
            className="sk-prompt-suggestion"
            onClick={() => onSelect?.(s.value)}
          >
            {s.icon && <span className="sk-prompt-suggestion__icon">{s.icon}</span>}
            <span className="sk-prompt-suggestion__text">{s.text}</span>
          </button>
        ))}
      </div>
    </div>
  ),
);

PromptSuggestions.displayName = 'PromptSuggestions';
