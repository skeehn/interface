import React from 'react';

// ── Container ──

/** Size preset for the Container. */
export type ContainerSize = 'narrow' | 'wide' | 'full';

/** Props for the {@link Container} component. */
export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Max-width preset. */
  size?: ContainerSize;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Centered content container with configurable max-width.
 * Renders a `<div>` with `sk-container`.
 */
export const Container = React.forwardRef<HTMLDivElement, ContainerProps>(
  ({ size, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-container${className ? ` ${className}` : ''}`}
      data-size={size}
      {...rest}
    >
      {children}
    </div>
  ),
);

Container.displayName = 'Container';

// ── Grid ──

/** Column count for the Grid. */
export type GridCols = '2' | '3' | '4';

/** Props for the {@link Grid} component. */
export interface GridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of grid columns. */
  cols?: GridCols;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * CSS grid layout with dither hover on cells.
 * Renders a `<div>` with `sk-grid`.
 */
export const Grid = React.forwardRef<HTMLDivElement, GridProps>(
  ({ cols, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-grid${className ? ` ${className}` : ''}`}
      data-cols={cols}
      {...rest}
    >
      {children}
    </div>
  ),
);

Grid.displayName = 'Grid';

/** Props for the {@link GridCell} sub-component. */
export interface GridCellProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Single cell within a Grid. */
export const GridCell = React.forwardRef<HTMLDivElement, GridCellProps>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-grid__cell${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  ),
);

GridCell.displayName = 'GridCell';

// ── Stack ──

/** Direction for the Stack. */
export type StackDirection = 'vertical' | 'horizontal';

/** Gap size for the Stack. */
export type StackGap = 'sm' | 'lg';

/** Props for the {@link Stack} component. */
export interface StackProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Flex direction. Defaults to vertical. */
  direction?: StackDirection;
  /** Gap size override. */
  gap?: StackGap;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Flex stack layout with optional dividers.
 * Renders a `<div>` with `sk-stack`.
 */
export const Stack = React.forwardRef<HTMLDivElement, StackProps>(
  ({ direction = 'vertical', gap, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-stack${className ? ` ${className}` : ''}`}
      data-direction={direction}
      data-gap={gap}
      {...rest}
    >
      {children}
    </div>
  ),
);

Stack.displayName = 'Stack';

/** Props for the {@link StackDivider} sub-component. */
export interface StackDividerProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

/** Divider line between Stack items. */
export const StackDivider = React.forwardRef<HTMLDivElement, StackDividerProps>(
  ({ className, ...rest }, ref) => (
    <div ref={ref} className={`sk-stack__divider${className ? ` ${className}` : ''}`} {...rest} />
  ),
);

StackDivider.displayName = 'StackDivider';

// ── Panel ──

/** Props for the {@link Panel} component. */
export interface PanelProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Panel title shown in the header. */
  title?: string;
  /** Additional elements in the header (right side). */
  headerActions?: React.ReactNode;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Bordered panel with header and body sections.
 * Renders a `<div>` with `sk-panel`.
 */
export const Panel = React.forwardRef<HTMLDivElement, PanelProps>(
  ({ title, headerActions, className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-panel${className ? ` ${className}` : ''}`} {...rest}>
      {title && (
        <div className="sk-panel__header">
          <h3 className="sk-panel__title">{title}</h3>
          {headerActions}
        </div>
      )}
      <div className="sk-panel__body">{children}</div>
    </div>
  ),
);

Panel.displayName = 'Panel';

// ── Divider ──

/** Variant for the Divider. */
export type DividerVariant = 'solid' | 'dashed' | 'dither' | 'ascii';

/** Props for the {@link Divider} component. */
export interface DividerProps extends React.HTMLAttributes<HTMLHRElement> {
  /** Visual variant. */
  variant?: DividerVariant;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Horizontal divider with multiple visual variants.
 * Renders an `<hr>` with `sk-divider`.
 */
export const Divider = React.forwardRef<HTMLHRElement, DividerProps>(
  ({ variant = 'solid', className, ...rest }, ref) => (
    <hr
      ref={ref}
      className={`sk-divider${className ? ` ${className}` : ''}`}
      data-variant={variant}
      {...rest}
    />
  ),
);

Divider.displayName = 'Divider';

// ── Skeleton ──

/** Shape for the Skeleton. */
export type SkeletonShape = 'circle' | 'text' | 'rect' | 'avatar';

/** Animation for the Skeleton. */
export type SkeletonAnimate = 'shimmer' | 'wave' | 'pulse';

/** Props for the {@link Skeleton} component. */
export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape preset. */
  shape?: SkeletonShape;
  /** Loading animation. */
  animate?: SkeletonAnimate;
  /** Explicit width CSS value. */
  width?: string | number;
  /** Explicit height CSS value. */
  height?: string | number;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * Loading placeholder with dither texture.
 * Renders a `<div>` with `sk-skeleton`.
 */
export const Skeleton = React.forwardRef<HTMLDivElement, SkeletonProps>(
  ({ shape, animate, width, height, className, style, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-skeleton${className ? ` ${className}` : ''}`}
      data-shape={shape}
      data-animate={animate}
      style={{ width, height, ...style }}
      {...rest}
    />
  ),
);

Skeleton.displayName = 'Skeleton';
