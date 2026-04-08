import React from 'react';

/** Size preset for the Avatar. */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

/** Props for the {@link Avatar} component. */
export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Image source URL. When absent, the fallback is rendered. */
  src?: string;
  /** Alt text for the image. */
  alt?: string;
  /** Fallback text (typically initials) shown when there is no image. */
  fallback?: string;
  /** Size preset. */
  size?: AvatarSize;
  /** Additional CSS class names. */
  className?: string;
}

/**
 * User image with dither fallback.
 * Renders a `<div>` with the `sk-avatar` class, containing either an `<img>` or fallback text.
 */
export const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ src, alt, fallback, size = 'md', className, ...rest }, ref) => (
    <div
      ref={ref}
      className={`sk-avatar${className ? ` ${className}` : ''}`}
      data-size={size}
      {...rest}
    >
      {src ? (
        <img src={src} alt={alt ?? ''} />
      ) : (
        <span className="sk-avatar__fallback">{fallback}</span>
      )}
    </div>
  ),
);

Avatar.displayName = 'Avatar';
