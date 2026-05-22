// Brand category colours are vibrant — designed for backgrounds, borders, and
// accents. When used directly as small text on white, the lighter ones
// (yellow, pink, orange, sky blue, mint) fail WCAG AA (need 4.5:1).
//
// This map provides a deepened variant of each brand colour that preserves
// the hue/identity but passes 4.5:1 on white. Use it ONLY when applying the
// category colour as the colour of small text on a light background.
// Borders, dividers, and backgrounds should keep the original brand colour.

const ACCENT_TO_TEXT: Record<string, string> = {
  '#FFD07A': '#A86A00', // yellow  → dark amber
  '#F280AA': '#C44A7A', // pink    → dark pink
  '#FAA21B': '#A66200', // orange  → dark orange
  '#7BAFDD': '#3D6B96', // blue    → dark blue
  '#5DCAA5': '#1E7A5A', // green   → dark green
  '#6E3A5A': '#6E3A5A', // plum already passes
};

export function accentForText(colour?: string | null): string {
  if (!colour) return '#6E3A5A';
  const upper = colour.toUpperCase();
  return ACCENT_TO_TEXT[upper] || colour;
}
