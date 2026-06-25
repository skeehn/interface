/**
 * @module @skeehn/react/blocks — HeroSection
 *
 * A themeable landing-page hero built from the core foundation — proof that
 * skeehn is for sites and app interfaces, not only chat. Compose your CTAs in
 * `actions`; drop an image/illustration in `media`.
 */
import * as React from 'react';

export interface HeroSectionProps extends Omit<React.HTMLAttributes<HTMLElement>, 'title'> {
  /** Small eyebrow / kicker above the title. */
  eyebrow?: React.ReactNode;
  /** Headline. */
  title: React.ReactNode;
  /** Supporting subtitle. */
  subtitle?: React.ReactNode;
  /** Call-to-action area (e.g. `<Button>`s). */
  actions?: React.ReactNode;
  /** Optional media rendered below the copy (image, illustration, demo). */
  media?: React.ReactNode;
  /** Text alignment. @defaultValue "center" */
  align?: 'center' | 'left';
}

/** A landing-page hero section built from skeehn tokens. */
export const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(function HeroSection(
  { eyebrow, title, subtitle, actions, media, align = 'center', className, ...rest },
  ref,
) {
  return (
    <section
      ref={ref}
      className={`sk-hero${className ? ` ${className}` : ''}`}
      data-align={align}
      {...rest}
    >
      <div className="sk-hero__inner">
        {eyebrow && <p className="sk-hero__eyebrow">{eyebrow}</p>}
        <h1 className="sk-hero__title">{title}</h1>
        {subtitle && <p className="sk-hero__subtitle">{subtitle}</p>}
        {actions && <div className="sk-hero__actions">{actions}</div>}
      </div>
      {media && <div className="sk-hero__media">{media}</div>}
    </section>
  );
});
