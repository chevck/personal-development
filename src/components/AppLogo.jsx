import { Link } from 'react-router-dom';
import { getBranding } from '../config/branding';

const sizeClasses = {
  sm: { icon: 'h-8 w-8', logo: 'h-8' },
  md: { icon: 'h-9 w-9', logo: 'h-10' },
  lg: { icon: 'h-12 w-12', logo: 'h-12' },
  xl: { icon: 'h-16 w-16', logo: 'h-14' },
};

/**
 * App or project logo. Omit projectId for Persona (app-wide). Pass projectId for
 * a project logo; falls back to Persona when the project has no custom branding.
 */
export default function AppLogo({
  projectId,
  variant = 'logo',
  size = 'md',
  className = '',
  linkTo,
}) {
  const branding = getBranding(projectId);
  const sizes = sizeClasses[size] || sizeClasses.md;
  const src = variant === 'icon' ? branding.icon : branding.logo;
  const sizeClass = variant === 'icon' ? sizes.icon : sizes.logo;

  const image = (
    <img
      src={src}
      alt={branding.name}
      className={`${sizeClass} shrink-0 object-contain ${className}`}
    />
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex w-fit items-center no-underline">
        {image}
      </Link>
    );
  }

  return image;
}
