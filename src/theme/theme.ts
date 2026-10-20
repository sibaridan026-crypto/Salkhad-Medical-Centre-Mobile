/**
 * The Salkhad theme.
 *
 * A theme is the complete, resolved set of design tokens a component is allowed
 * to read: semantic colors, the active accent ramp, spacing, radius, type,
 * shadows, motion, opacity, icon sizes and layout metrics.
 *
 * Phase 3 ships the *light* theme only. Light/dark/system appearance is a later
 * phase; the shape here already reserves `isDark` so nothing has to be
 * refactored when it arrives. What Phase 3 does deliver is the accent layer:
 * swapping the accent rebuilds every primary/soft/surface shade through one
 * function, so no component ever hardcodes an accent colour.
 */

import {
  AccentColors as AccentTints,
  Colors,
  IconSize,
  Layout,
  Motion,
  Opacity,
  Radius,
  Shadows,
  Spacing,
  Typography,
} from '@/constants/brand';
import { THEME_ACCENTS, ThemeAccent, type AccentRamp, type ThemeAccentName } from './accents';

/** Every brand colour widened to `string`, plus the on-accent text colour. */
export type ThemeColors = { [K in keyof typeof Colors]: string } & { onPrimary: string };

/** Icon-well tints resolved for the active accent. */
export type ThemeAccentTints = {
  [K in keyof typeof AccentTints]: { readonly well: string; readonly icon: string };
};

export interface Theme {
  readonly accentName: ThemeAccentName;
  readonly accent: AccentRamp;
  readonly colors: ThemeColors;
  readonly accentTints: ThemeAccentTints;
  readonly spacing: typeof Spacing;
  readonly radius: typeof Radius;
  readonly typography: typeof Typography;
  readonly shadows: typeof Shadows;
  readonly motion: typeof Motion;
  readonly opacity: typeof Opacity;
  readonly iconSize: typeof IconSize;
  readonly layout: typeof Layout;
  /** Reserved for the later light/dark phase; always `false` in Phase 3. */
  readonly isDark: boolean;
}

/**
 * Builds the full theme for one accent.
 *
 * The accent repaints only the interactive/primary family. The identity
 * surfaces — white, lavender wash, text navy — deliberately stay put so the
 * centre's medical look does not change with the accent.
 */
export function createTheme(accentName: ThemeAccentName = ThemeAccent.purple): Theme {
  const accent = THEME_ACCENTS[accentName];

  const colors: ThemeColors = {
    ...Colors,
    primary: accent.primary,
    primaryDark: accent.primaryDark,
    primaryDeep: accent.primaryDeep,
    primarySoft: accent.primarySoft,
    primarySurface: accent.primarySurface,
    onPrimary: accent.onPrimary,
  };

  const accentTints: ThemeAccentTints = {
    ...AccentTints,
    primary: { well: accent.primarySurface, icon: accent.primary },
  };

  return {
    accentName,
    accent,
    colors,
    accentTints,
    spacing: Spacing,
    radius: Radius,
    typography: Typography,
    shadows: Shadows,
    motion: Motion,
    opacity: Opacity,
    iconSize: IconSize,
    layout: Layout,
    isDark: false,
  };
}

/** Default theme — the product's primary purple identity. */
export const defaultTheme: Theme = createTheme(ThemeAccent.purple);
