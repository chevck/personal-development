const DARK_INK = '28 28 28';
const LIGHT_INK = '255 255 255';

function tripletToRgb(triplet) {
  const [r, g, b] = triplet.split(' ').map(Number);
  return { r, g, b };
}

export function tripletToHex(triplet) {
  const { r, g, b } = tripletToRgb(triplet);
  return `#${[r, g, b].map((channel) => channel.toString(16).padStart(2, '0')).join('')}`;
}

function tripletToRgba(triplet, alpha) {
  const { r, g, b } = tripletToRgb(triplet);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

export const THEME_PALETTE = [
  { id: 'gold', label: 'Gold', brand: '245 215 110', hover: '237 203 90', ink: DARK_INK },
  { id: 'coral', label: 'Coral', brand: '217 93 57', hover: '201 78 44', ink: LIGHT_INK },
  { id: 'sky', label: 'Sky', brand: '56 189 248', hover: '14 165 233', ink: DARK_INK },
  { id: 'emerald', label: 'Emerald', brand: '16 185 129', hover: '5 150 105', ink: LIGHT_INK },
  { id: 'violet', label: 'Violet', brand: '139 92 246', hover: '124 58 237', ink: LIGHT_INK },
  { id: 'rose', label: 'Rose', brand: '244 63 94', hover: '225 29 72', ink: LIGHT_INK },
  { id: 'slate', label: 'Slate', brand: '71 85 105', hover: '51 65 85', ink: LIGHT_INK },
];

export const DEFAULT_THEME_ID = 'coral';

export function getThemeById(themeId) {
  return (
    THEME_PALETTE.find((t) => t.id === themeId) ||
    THEME_PALETTE.find((t) => t.id === DEFAULT_THEME_ID) ||
    THEME_PALETTE[0]
  );
}

function mixWithWhite(triplet, amount) {
  const [r, g, b] = triplet.split(' ').map(Number);
  return `${Math.round(r + (255 - r) * amount)} ${Math.round(g + (255 - g) * amount)} ${Math.round(b + (255 - b) * amount)}`;
}

function darkenTriplet(triplet, factor = 0.72) {
  const [r, g, b] = triplet.split(' ').map(Number);
  return `${Math.round(r * factor)} ${Math.round(g * factor)} ${Math.round(b * factor)}`;
}

/** Apply accent palette to document CSS variables (Speakly app + brand tokens). */
export function applyThemeToDocument(themeId) {
  const theme = getThemeById(themeId);
  const root = document.documentElement;

  root.style.setProperty('--brand', theme.brand);
  root.style.setProperty('--brand-hover', theme.hover);
  root.style.setProperty('--brand-ink', theme.ink);
  root.style.setProperty('--speakly-coral', theme.brand);
  root.style.setProperty('--speakly-coral-hover', theme.hover);
  root.style.setProperty('--speakly-coral-dark', darkenTriplet(theme.brand));
  root.style.setProperty('--speakly-coral-light', mixWithWhite(theme.brand, 0.92));
  root.style.setProperty('--speakly-coral-ring', mixWithWhite(theme.brand, 0.75));
  root.style.setProperty('--speakly-coral-muted', mixWithWhite(theme.brand, 0.85));
}

export function isValidThemeId(themeId) {
  return THEME_PALETTE.some((theme) => theme.id === themeId);
}

/** Resolved accent colors for share cards (inline styles — not CSS variables). */
export function getShareCardColors(themeId) {
  const theme = getThemeById(themeId);
  const brand = theme.brand;

  return {
    brand: tripletToHex(brand),
    brandHover: tripletToHex(theme.hover),
    brandDark: tripletToHex(darkenTriplet(brand)),
    brandLight: tripletToHex(mixWithWhite(brand, 0.93)),
    brandRing: tripletToHex(mixWithWhite(brand, 0.76)),
    brandMuted: tripletToHex(mixWithWhite(brand, 0.86)),
    onBrand: theme.ink === LIGHT_INK ? '#FFFFFF' : '#1C1C1C',
    ink: '#1C1C1C',
    muted: '#5C5C5C',
    subtle: '#8A8A8A',
    background: `linear-gradient(155deg, ${tripletToHex(mixWithWhite(brand, 0.94))} 0%, #ffffff 46%, ${tripletToHex(mixWithWhite(brand, 0.9))} 100%)`,
    glow: `radial-gradient(circle at 88% 8%, ${tripletToRgba(brand, 0.28)}, transparent 44%), radial-gradient(circle at 8% 92%, ${tripletToRgba(brand, 0.16)}, transparent 42%)`,
    progressTrack: tripletToHex(mixWithWhite(brand, 0.72)),
    progressFill: `linear-gradient(90deg, ${tripletToHex(brand)}, ${tripletToHex(theme.hover)})`,
  };
}
