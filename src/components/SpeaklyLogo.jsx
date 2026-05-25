import { Link } from 'react-router-dom';

const ICON_SRC = `${process.env.PUBLIC_URL}/speakly-icon.png`;
const LOGO_SRC = `${process.env.PUBLIC_URL}/speakly-logo.png`;

const sizeClasses = {
  sm: { icon: 'h-8 w-8', logo: 'h-8' },
  md: { icon: 'h-9 w-9', logo: 'h-10' },
  lg: { icon: 'h-12 w-12', logo: 'h-12' },
  xl: { icon: 'h-16 w-16', logo: 'h-14' },
};

export default function SpeaklyLogo({
  variant = 'logo',
  size = 'md',
  className = '',
  linkTo,
}) {
  const sizes = sizeClasses[size] || sizeClasses.md;
  const src = variant === 'icon' ? ICON_SRC : LOGO_SRC;
  const sizeClass = variant === 'icon' ? sizes.icon : sizes.logo;

  const image = (
    <img
      src={src}
      alt="Speakly"
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
