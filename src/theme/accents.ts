/**
 * Accent presets for the Salkhad design system.
 *
 * The app has one stable medical identity — white surfaces, lavender wash,
 * dark navy/purple text — and a *single* switchable accent that recolours the
 * interactive layer: buttons, active navigation, icons, highlights, headings
 * and status elements.
 *
 * Purple is the default and the product's primary identity. The remaining
 * presets exist so the centre can later choose a different accent from
 * Settings → Appearance without any component knowing about it.
 *
 * Every ramp is complete (base, dark, deep, soft, surface tint) so a component
 * never has to compute or guess a shade, and every pairing keeps a comfortable
 * contrast ratio against white.
 */

export const ThemeAccent = {
  purple: 'purple',
  blue: 'blue',
  teal: 'teal',
  lavender: 'lavender',
  deepBlue: 'deepBlue',
} as const;

export type ThemeAccentName = (typeof ThemeAccent)[keyof typeof ThemeAccent];

/** Order shown to the user, purple first because it is the default identity. */
export const THEME_ACCENT_ORDER: readonly ThemeAccentName[] = [
  ThemeAccent.purple,
  ThemeAccent.blue,
  ThemeAccent.teal,
  ThemeAccent.lavender,
  ThemeAccent.deepBlue,
];

export interface AccentRamp {
  /** Interactive base — fills, active states. */
  readonly primary: string;
  /** Pressed / hover state. */
  readonly primaryDark: string;
  /** Deepest shade — selected navigation, strong accents. */
  readonly primaryDeep: string;
  /** Soft tint for secondary icon tints. */
  readonly primarySoft: string;
  /** Very light tint for icon wells and chips. */
  readonly primarySurface: string;
  /** Text/icon colour placed on top of `primary`. */
  readonly onPrimary: string;
}

export const THEME_ACCENTS: Readonly<Record<ThemeAccentName, AccentRamp>> = {
  purple: {
    primary: '#6D4AC4',
    primaryDark: '#4E3199',
    primaryDeep: '#3A2478',
    primarySoft: '#A98BE8',
    primarySurface: '#EFE9FC',
    onPrimary: '#FFFFFF',
  },
  blue: {
    primary: '#2B5FA8',
    primaryDark: '#1E4780',
    primaryDeep: '#143059',
    primarySoft: '#7FA8D9',
    primarySurface: '#E4EDFA',
    onPrimary: '#FFFFFF',
  },
  teal: {
    primary: '#2E9FB0',
    primaryDark: '#1F7A88',
    primaryDeep: '#14535C',
    primarySoft: '#7FCFD8',
    primarySurface: '#DFF4F6',
    onPrimary: '#FFFFFF',
  },
  lavender: {
    primary: '#8B6FD0',
    primaryDark: '#6A4FAE',
    primaryDeep: '#4B3580',
    primarySoft: '#C0A9EC',
    primarySurface: '#F3EEFC',
    onPrimary: '#FFFFFF',
  },
  deepBlue: {
    primary: '#21458F',
    primaryDark: '#163066',
    primaryDeep: '#0E204A',
    primarySoft: '#6E8CC4',
    primarySurface: '#E6ECF8',
    onPrimary: '#FFFFFF',
  },
};

/** Human labels for the accent picker. */
export const ACCENT_LABELS: Readonly<
  Record<ThemeAccentName, { readonly ar: string; readonly en: string }>
> = {
  purple: { ar: 'بنفسجي', en: 'Purple' },
  blue: { ar: 'أزرق', en: 'Blue' },
  teal: { ar: 'فيروزي', en: 'Cyan' },
  lavender: { ar: 'لافندر', en: 'Lavender' },
  deepBlue: { ar: 'أزرق داكن', en: 'Deep blue' },
};
