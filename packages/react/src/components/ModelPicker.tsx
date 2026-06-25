'use client';

import * as React from 'react';

export interface ModelOption {
  /** Stable model id sent to your backend (e.g. `anthropic/claude-opus-4-8`). */
  id: string;
  /** Human label. Defaults to `id`. */
  label?: string;
  /** Optional grouping (e.g. provider) for `<optgroup>`. */
  group?: string;
}

export interface ModelPickerProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'onChange' | 'value'> {
  /** Available models. Strings are treated as `{ id }`. */
  models: ReadonlyArray<ModelOption | string>;
  /** Selected model id (controlled). */
  value?: string;
  /** Called with the new model id. */
  onChange?: (id: string) => void;
  /** Accessible label. @defaultValue "Model" */
  label?: string;
}

function normalize(m: ModelOption | string): ModelOption {
  return typeof m === 'string' ? { id: m } : m;
}

/** A compact model selector for prompt inputs and chat toolbars. */
export const ModelPicker = React.forwardRef<HTMLSelectElement, ModelPickerProps>(
  function ModelPicker({ models, value, onChange, label = 'Model', className, ...rest }, ref) {
    const options = models.map(normalize);
    const groups = Array.from(new Set(options.map((o) => o.group).filter(Boolean))) as string[];

    const renderOption = (o: ModelOption) => (
      <option key={o.id} value={o.id}>
        {o.label ?? o.id}
      </option>
    );

    return (
      <select
        ref={ref}
        className={`sk-model-picker${className ? ` ${className}` : ''}`}
        aria-label={label}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        {...rest}
      >
        {groups.length > 0
          ? groups.map((g) => (
              <optgroup key={g} label={g}>
                {options.filter((o) => o.group === g).map(renderOption)}
              </optgroup>
            ))
          : options.map(renderOption)}
      </select>
    );
  },
);
