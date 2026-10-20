import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { ThemeAccent, type ThemeAccentName } from './accents';
import { createTheme, defaultTheme, type Theme } from './theme';

/**
 * App-wide theme context.
 *
 * Holds the *choice* (the accent name) and exposes the *resolved* theme. The
 * resolved object is memoised per accent, so a screen that reads `useTheme()`
 * re-renders only when the accent actually changes.
 *
 * Appearance (light/dark/system) is intentionally absent: it is a later phase,
 * and shipping a control that did nothing would be a fake button.
 */
type ThemeValue = {
  theme: Theme;
  accentName: ThemeAccentName;
  setAccent: (accent: ThemeAccentName) => void;
};

const ThemeContext = createContext<ThemeValue | null>(null);

export function ThemeProvider({
  children,
  initialAccent = ThemeAccent.purple,
}: {
  children: ReactNode;
  initialAccent?: ThemeAccentName;
}) {
  const [accentName, setAccentName] = useState<ThemeAccentName>(initialAccent);

  const setAccent = useCallback((accent: ThemeAccentName) => setAccentName(accent), []);
  const theme = useMemo(() => createTheme(accentName), [accentName]);

  const value = useMemo<ThemeValue>(
    () => ({ theme, accentName, setAccent }),
    [theme, accentName, setAccent]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

/**
 * Reads the active theme. Falls back to the default purple theme when used
 * outside a provider — components stay usable in isolation (and in the gallery)
 * without crashing.
 */
export function useTheme(): Theme {
  return useContext(ThemeContext)?.theme ?? defaultTheme;
}

/** Reads the accent controls; `null` outside a provider. */
export function useAccent(): { accentName: ThemeAccentName; setAccent: (a: ThemeAccentName) => void } | null {
  const ctx = useContext(ThemeContext);
  return ctx ? { accentName: ctx.accentName, setAccent: ctx.setAccent } : null;
}
