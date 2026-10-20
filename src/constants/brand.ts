/**
 * Salkhad Medical Centre — centralized design system.
 *
 * This is the single source of truth for colors, spacing, radius, shadows and
 * typography. Components must read from here instead of hardcoding raw hex
 * values, so the visual language stays consistent across every screen.
 *
 * Visual direction: premium modern medical. Medical white + lavender + purple
 * (primary accent) + deep medical blue (supporting) + soft cyan/teal
 * (secondary accent). Green is reserved exclusively for success/confirmed
 * states and is never a brand color.
 *
 * Phase 1 defined the foundation; Phase 2 extends it into a complete token
 * set plus RTL-aware layout helpers. Screens and flows arrive in later phases.
 */

/* -------------------------------------------------------------------------- */
/* Identity                                                                   */
/* -------------------------------------------------------------------------- */

export const Brand = {
  /** Official English name, spelled as supplied by the project owner. */
  nameEn: 'Salkhad Medical Centre',
  /** مجمع صلخد الطبي — the official Arabic product name. */
  nameAr: 'مجمع صلخد الطبي',
} as const;

export const Language = {
  ar: 'ar',
  en: 'en',
} as const;

export type LanguageCode = (typeof Language)[keyof typeof Language];

/* -------------------------------------------------------------------------- */
/* Colors                                                                     */
/* -------------------------------------------------------------------------- */

export const Colors = {
  /* --- Primary: elegant medical purple ---------------------------------- */
  /** Buttons, active states, key accents. */
  primary: '#6D4AC4',
  /** Pressed / hover states. */
  primaryDark: '#4E3199',
  /** Selected navigation items and deepest accents. */
  primaryDeep: '#3A2478',
  /** Soft purple for light fills and icon tints. */
  primarySoft: '#A98BE8',
  /** Very light purple surface (icon wells, chips). */
  primarySurface: '#EFE9FC',

  /* --- Secondary: deep medical blue + soft cyan/teal -------------------- */
  /** Deep medical blue — supporting brand color. */
  blue: '#2B5FA8',
  blueSoft: '#E4EDFA',
  /** Soft cyan/teal — secondary accent, used sparingly. */
  teal: '#3FB6C4',
  tealSoft: '#DFF4F6',

  /* --- Lavender ---------------------------------------------------------- */
  /** Very light lavender — wash behind cards and secondary fills. */
  lavender: '#F3EEFC',
  lavenderBorder: '#E3D9F7',

  /* --- Surfaces ---------------------------------------------------------- */
  /** Pure white cards. */
  surface: '#FFFFFF',
  /** Very light lavender-white, for grouped/secondary surfaces. */
  surfaceSubtle: '#FAF8FE',
  /** Subtle cool gray, for input wells and inert areas. */
  coolGray: '#F1F3F7',
  /** Fallback screen background (the real medical image sits on top). */
  background: '#F3EEFC',

  /* --- Text -------------------------------------------------------------- */
  /** Dark medical navy/purple — primary copy, never pure black. */
  text: '#2E1F52',
  /** Secondary copy. */
  textSecondary: '#6B5F86',
  /** Muted captions, placeholders, inactive labels. */
  textMuted: '#9A93AC',
  /** Text on purple/blue fills. */
  textInverse: '#FFFFFF',

  /* --- Status (never brand colors) -------------------------------------- */
  success: '#2E9E6B',
  successSoft: '#E4F5EC',
  warning: '#D98324',
  warningSoft: '#FDF1E2',
  danger: '#D2455B',
  dangerSoft: '#FCE9EC',

  /* --- Lines ------------------------------------------------------------- */
  /** Hairline used on cards and dividers. */
  border: '#EDE7F8',
  /** Slightly stronger border for fields that need definition. */
  borderStrong: '#DED3F3',
} as const;

/* -------------------------------------------------------------------------- */
/* Spacing                                                                    */
/* -------------------------------------------------------------------------- */

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  /** Horizontal screen margin — keeps text off the screen edge. */
  screen: 20,
} as const;

/* -------------------------------------------------------------------------- */
/* Radius                                                                     */
/* -------------------------------------------------------------------------- */

export const Radius = {
  /** Compact controls: badges, small chips. */
  sm: 10,
  /** Fields and default cards. */
  md: 14,
  /** Prominent cards and buttons. */
  lg: 20,
  /** Standout/hero cards. */
  xl: 28,
  /** Pills: language selector, status badges, avatars. */
  pill: 999,
} as const;

/* -------------------------------------------------------------------------- */
/* Shadows                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Soft, low-contrast shadows — enough to lift cards off the medical
 * background, never harsh and never pure black.
 */
export const Shadows = {
  card: {
    shadowColor: '#4E3199',
    shadowOpacity: 0.08,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  /** Quieter elevation for nested or secondary cards. */
  cardSoft: {
    shadowColor: '#4E3199',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  /** Field elevation — barely there, just enough to read as a control. */
  field: {
    shadowColor: '#4E3199',
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
  button: {
    shadowColor: '#4E3199',
    shadowOpacity: 0.18,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  /** Bottom navigation sits above content. */
  nav: {
    shadowColor: '#2E1F52',
    shadowOpacity: 0.1,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
} as const;

/* -------------------------------------------------------------------------- */
/* Typography                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * One hierarchy for both languages: screen title → section title → card
 * title → body → secondary → caption. Weights stay at 400/600/700 so nothing
 * reads as extremely bold, and no size drops below 12 so nothing reads as
 * extremely small.
 *
 * Arabic and English share sizes so the two languages stay visually balanced.
 *
 * NOTE: `display` / `title` / `subtitle` / `caption` / `body` are the Phase 1
 * scale and are still used by `src/app/foundation.tsx` — they are intentionally
 * left exactly as verified. Everything else is the Phase 2 hierarchy used by
 * the shared components.
 */
export const Typography = {
  /** Greeting / screen headline — prominent, never oversized. */
  screenTitle: { fontSize: 24, fontWeight: '700', lineHeight: 32 },
  /** Section headings — medium/strong. */
  sectionTitle: { fontSize: 17, fontWeight: '700', lineHeight: 24 },
  /** Card and list titles. */
  cardTitle: { fontSize: 15, fontWeight: '600', lineHeight: 21 },
  body: { fontSize: 15, fontWeight: '400', lineHeight: 23 },
  bodyStrong: { fontSize: 15, fontWeight: '600', lineHeight: 23 },
  /** Supporting copy under a title: smaller and lighter. */
  secondary: { fontSize: 14, fontWeight: '400', lineHeight: 20 },
  caption: { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  /** Smallest permitted size — labels, badges and nav labels only. */
  micro: { fontSize: 12, fontWeight: '600', lineHeight: 16 },

  /* Phase 1 scale, kept so existing screens continue to compile. */
  display: { fontSize: 28, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '700' },
  subtitle: { fontSize: 18, fontWeight: '600' },
} as const;

/* -------------------------------------------------------------------------- */
/* Layout metrics                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Component dimensions for the Phase 2 shared components.
 *
 * Tuned for a compact, premium composition: the header and search field no
 * longer eat the top of the screen, specialty tiles are small enough for a
 * whole row to sit above the fold, and the bottom bar is short enough that it
 * reads as navigation rather than a second screen.
 *
 * `foundation.tsx` does not use these, so Phase 1 is unaffected.
 */
export const Layout = {
  /** Minimum comfortable touch target (iOS/Android guideline). */
  touchTarget: 44,
  /** Header sits below the status bar and stays deliberately short. */
  headerHeight: 56,
  /** Diameter of the brand mark and of the header's circular controls. */
  brandMarkSize: 36,
  headerIconSize: 36,
  searchFieldHeight: 46,
  buttonHeight: 54,
  buttonHeightSm: 44,
  /** Bar content height; the Android system-nav inset is added on top. */
  bottomNavHeight: 58,
  /** Rounded upper corners of the navigation sheet. */
  bottomNavRadius: 24,
  /** Diameter of the circular well behind a specialty tile icon. */
  specialtyIconSize: 44,
  doctorPhotoSize: 56,
  /**
   * Side length of the compact center-image. The real asset is only 208 px
   * wide, so it is shown near its native size to stay sharp on a 2.5–3x
   * screen instead of being stretched across the content width.
   */
  centerImageSize: 116,
} as const;

/* -------------------------------------------------------------------------- */
/* Shared surfaces                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Shared card surface: white, noticeably rounded, softly shadowed, with a
 * barely-there border. Every card in the app uses this so the visual language
 * stays consistent over the medical background.
 */
export const Card = {
  backgroundColor: Colors.surface,
  borderRadius: Radius.xl,
  borderWidth: 1,
  borderColor: Colors.border,
  ...Shadows.card,
} as const;

/* -------------------------------------------------------------------------- */
/* Accents                                                                    */
/* -------------------------------------------------------------------------- */

/**
 * Icon-well accent pairs.
 *
 * Only brand colours appear here, and the "well" is always a very light tint
 * of the icon colour so nothing reads as a saturated block. Specialty tiles,
 * category chips and similar grouped items all pull from this one map.
 */
export const AccentColors = {
  primary: { well: Colors.primarySurface, icon: Colors.primary },
  blue: { well: Colors.blueSoft, icon: Colors.blue },
  teal: { well: Colors.tealSoft, icon: Colors.teal },
  lavender: { well: Colors.lavender, icon: Colors.primaryDark },
} as const;

export type AccentName = keyof typeof AccentColors;

/* -------------------------------------------------------------------------- */
/* RTL / LTR helpers                                                          */
/* -------------------------------------------------------------------------- */

export type Direction = 'rtl' | 'ltr';

/**
 * Returns the row flow for the current direction. Components should build
 * with start/end and use this instead of hardcoding `row` / `row-reverse`,
 * so Arabic mirrors correctly and English does not.
 */
export function rowDirection(isRTL: boolean): 'row' | 'row-reverse' {
  return isRTL ? 'row-reverse' : 'row';
}

/** Text alignment that follows the reading direction. */
export function textAlignment(isRTL: boolean): 'left' | 'right' {
  return isRTL ? 'right' : 'left';
}

/* -------------------------------------------------------------------------- */
/* Motion                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Animation durations. Phase 3 keeps motion quick and calm: state changes read
 * as instant, and nothing bounces or lingers. Screens tune actual animations in
 * later phases; these are the only allowed durations.
 */
export const Motion = {
  fast: 120,
  base: 200,
  slow: 320,
} as const;

/* -------------------------------------------------------------------------- */
/* Opacity                                                                    */
/* -------------------------------------------------------------------------- */

/** Shared opacity values so pressed/disabled/overlay states never drift. */
export const Opacity = {
  /** Pressed surface feedback. */
  pressed: 0.86,
  /** Disabled controls. */
  disabled: 0.45,
  /** Soft fade for placeholder art and skeletons. */
  muted: 0.6,
  /** Background scrim behind dialogs and sheets. */
  scrim: 0.5,
} as const;

/* -------------------------------------------------------------------------- */
/* Icons                                                                      */
/* -------------------------------------------------------------------------- */

/** Icon sizes, snapped to a single scale so glyphs stay visually consistent. */
export const IconSize = {
  xs: 14,
  sm: 18,
  md: 20,
  lg: 24,
  xl: 28,
} as const;

/* -------------------------------------------------------------------------- */
/* Stacking                                                                   */
/* -------------------------------------------------------------------------- */

/** Single z-index scale — no component invents its own stacking number. */
export const ZIndex = {
  base: 0,
  raised: 10,
  header: 20,
  nav: 30,
  sheet: 40,
  overlay: 50,
} as const;
