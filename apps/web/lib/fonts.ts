import { Manrope as SansFont } from 'next/font/google';

/**
 * @sans
 * @description Define here the sans font.
 * Uses Manrope for a modern, clean look matching the TaxAppeal design system.
 */
const sans = SansFont({
  subsets: ['latin'],
  variable: '--font-sans',
  fallback: ['system-ui', 'Helvetica Neue', 'Helvetica', 'Arial'],
  preload: true,
  weight: ['300', '400', '500', '600', '700', '800'],
});

/**
 * @heading
 * @description Define here the heading font.
 */
const heading = sans;

// we export these fonts into the root layout
export { sans, heading };
