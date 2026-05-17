import React from 'react';
import { type SkState, skStateAttrs } from '../types';

/** Visual variant for the Card. */
export type CardVariant =
  | 'solid'
  | 'dither'
  | 'outline'
  | 'ghost'
  | 'inverted'
  | 'pixel'
  | 'retro'
  | 'ascii';

/** Props for the {@link Card} component. */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Visual variant of the card surface. */
  variant?: CardVariant;
  /** Lifecycle / interaction state — drives data-state and ARIA. */
  state?: SkState;
  /** Additional CSS class names. */
  className?: string;
  children?: React.ReactNode;
}

/**
 * Elevated container with dither surface.
 * Renders a `<div>` with the `sk-card` class.
 */
export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ variant, state, className, children, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-card${className ? ` ${className}` : ''}`}
      data-variant={variant}
      {...skStateAttrs(state)}
      {...rest}
    >
      {children}
    </div>
  ),
);

Card.displayName = 'Card';

/** Props for the {@link CardHeader} sub-component. */
export interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Header section of a Card with a subtle scanline texture. */
export const CardHeader = React.forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-card__header${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  ),
);

CardHeader.displayName = 'CardHeader';

/** Props for the {@link CardTitle} sub-component. */
export interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Title element inside a CardHeader. */
export const CardTitle = React.forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...rest }, ref) => (
    <h3 ref={ref} className={`sk-card__title${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </h3>
  ),
);

CardTitle.displayName = 'CardTitle';

/** Props for the {@link CardBody} sub-component. */
export interface CardBodyProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Body / main content area of a Card. */
export const CardBody = React.forwardRef<HTMLDivElement, CardBodyProps>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-card__body${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  ),
);

CardBody.displayName = 'CardBody';

/** Props for the {@link CardFooter} sub-component. */
export interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

/** Footer section of a Card. */
export const CardFooter = React.forwardRef<HTMLDivElement, CardFooterProps>(
  ({ className, children, ...rest }, ref) => (
    <div ref={ref} className={`sk-card__footer${className ? ` ${className}` : ''}`} {...rest}>
      {children}
    </div>
  ),
);

CardFooter.displayName = 'CardFooter';
