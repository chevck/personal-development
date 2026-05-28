const DARK_INK = '28 28 28';
const LIGHT_INK = '255 255 255';

export const THEME_PALETTE = [
  { id: 'gold', label: 'Gold', brand: '245 215 110', hover: '237 203 90', ink: DARK_INK },
  { id: 'coral', label: 'Coral', brand: '217 93 57', hover: '201 78 44', ink: LIGHT_INK },
  { id: 'sky', label: 'Sky', brand: '56 189 248', hover: '14 165 233', ink: DARK_INK },
  { id: 'emerald', label: 'Emerald', brand: '16 185 129', hover: '5 150 105', ink: LIGHT_INK },
  { id: 'violet', label: 'Violet', brand: '139 92 246', hover: '124 58 237', ink: LIGHT_INK },
  { id: 'rose', label: 'Rose', brand: '244 63 94', hover: '225 29 72', ink: LIGHT_INK },
  { id: 'slate', label: 'Slate', brand: '71 85 105', hover: '51 65 85', ink: LIGHT_INK },
];

export const DEFAULT_THEME_ID = 'gold';

export function getThemeById(themeId) {
  return (
    THEME_PALETTE.find((t) => t.id === themeId) ||
    THEME_PALETTE.find((t) => t.id === DEFAULT_THEME_ID) ||
    THEME_PALETTE[0]
  );
}

