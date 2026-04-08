import React from 'react';

// ── AsciiChart ──

/** A data point for the AsciiChart. */
export interface AsciiChartDataPoint {
  /** Value (height of bar). */
  value: number;
  /** Optional label displayed below the bar. */
  label?: string;
}

/** Props for the {@link AsciiChart} component. */
export interface AsciiChartProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Data points to render as bars. */
  data: AsciiChartDataPoint[];
  /** Maximum value for scaling. Defaults to the max value in data. */
  max?: number;
  /** Maximum number of character rows. Defaults to 8. */
  rows?: number;
  /** Whether to use dither cells. */
  dither?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Bar chart rendered with ASCII characters.
 * Renders a `<div>` with `sk-ascii-chart`.
 */
export const AsciiChart = React.forwardRef<HTMLDivElement, AsciiChartProps>(
  ({ data, max: maxProp, rows = 8, dither, className, ...rest }, ref) => {
    const maxVal = maxProp ?? Math.max(...data.map((d) => d.value), 1);
    return (
      <div ref={ref} className={`sk-ascii-chart${className ? ` ${className}` : ''}`} {...rest}>
        <div className="sk-ascii-chart__row">
          {data.map((d, i) => {
            const filled = Math.round((d.value / maxVal) * rows);
            return (
              <div key={i} className="sk-ascii-chart__bar">
                {Array.from({ length: rows }, (_, r) => (
                  <div
                    key={r}
                    className={`sk-ascii-chart__bar-cell${
                      r < filled
                        ? dither
                          ? ' sk-ascii-chart__bar-cell--dither'
                          : ' sk-ascii-chart__bar-cell--filled'
                        : ''
                    }`}
                  />
                ))}
              </div>
            );
          })}
        </div>
        <div className="sk-ascii-chart__label">
          {data.map((d, i) => (
            <div key={i} className="sk-ascii-chart__label-cell">
              {d.label ?? ''}
            </div>
          ))}
        </div>
      </div>
    );
  },
);

AsciiChart.displayName = 'AsciiChart';

// ── Sparkline ──

/** Props for the {@link Sparkline} component. */
export interface SparklineProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Array of numeric values to render. */
  data: number[];
  /** Whether to apply dither to bars. */
  dither?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Inline sparkline bar chart.
 * Renders a `<div>` with `sk-sparkline`.
 */
export const Sparkline = React.forwardRef<HTMLDivElement, SparklineProps>(
  ({ data, dither, className, ...rest }, ref) => {
    const maxVal = Math.max(...data, 1);
    return (
      <div ref={ref} className={`sk-sparkline${className ? ` ${className}` : ''}`} {...rest}>
        {data.map((v, i) => (
          <div
            key={i}
            className={`sk-sparkline__bar${dither ? ' sk-sparkline__bar--dither' : ''}`}
            style={{ height: `${(v / maxVal) * 100}%` }}
          />
        ))}
      </div>
    );
  },
);

Sparkline.displayName = 'Sparkline';

// ── Meter ──

/** Props for the {@link Meter} component. */
export interface MeterProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current value (0 to max). */
  value: number;
  /** Maximum value. Defaults to 100. */
  max?: number;
  /** Whether to apply dither to the fill. */
  dither?: boolean;
  /** Label text (e.g. "75%"). */
  label?: string;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Horizontal meter gauge.
 * Renders a `<div>` with `sk-meter`.
 */
export const Meter = React.forwardRef<HTMLDivElement, MeterProps>(
  ({ value, max = 100, dither, label, className, ...rest }, ref) => {
    const pct = Math.min(100, Math.max(0, (value / max) * 100));
    return (
      <div ref={ref} className={`sk-meter${className ? ` ${className}` : ''}`} {...rest}>
        <div className="sk-meter__track">
          <div
            className={`sk-meter__fill${dither ? ' sk-meter__fill--dither' : ''}`}
            style={{ width: `${pct}%` }}
          />
        </div>
        {label && <span className="sk-meter__label">{label}</span>}
      </div>
    );
  },
);

Meter.displayName = 'Meter';

// ── Heatmap ──

/** Props for the {@link Heatmap} component. */
export interface HeatmapProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 2D grid of intensity values (0-4). */
  data: number[][];
  /** Number of columns in the grid. */
  cols: number;
  /** Whether to apply dither to cells. */
  dither?: boolean;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Grid heatmap with ASCII-styled intensity cells.
 * Renders a `<div>` with `sk-heatmap`.
 */
export const Heatmap = React.forwardRef<HTMLDivElement, HeatmapProps>(
  ({ data, cols, dither, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-heatmap${className ? ` ${className}` : ''}`}
      style={{ gridTemplateColumns: `repeat(${cols}, 1ch)`, ...style }}
      {...rest}
    >
      {data.flat().map((v, i) => {
        const level = Math.min(4, Math.max(0, Math.round(v)));
        return (
          <div
            key={i}
            className={`sk-heatmap__cell sk-heatmap__cell--${level}${dither ? ' sk-heatmap__cell--dither' : ''}`}
          />
        );
      })}
    </div>
  ),
);

Heatmap.displayName = 'Heatmap';
