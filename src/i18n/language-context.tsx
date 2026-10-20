import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

import { Language, type LanguageCode } from '@/constants/brand';
import { stringsFor, type StringsKey } from './strings';

/**
 * Direction foundation for the app.
 *
 * Arabic runs RTL, English runs LTR. Components read `isRTL` and build with
 * logical properties (`paddingStart` / `paddingEnd`, `row` vs `row-reverse`,
 * `start` vs `end` text alignment) so nothing has to be "fixed for RTL" later.
 *
 * This deliberately does NOT call `I18nManager.forceRTL()`: that flag is only
 * applied on the next cold start, which would make an in-session language
 * switch feel broken. Components therefore resolve direction from context
 * instead of from the global flag.
 */
type LanguageValue = {
  lang: LanguageCode;
  isRTL: boolean;
  setLang: (lang: LanguageCode) => void;
  toggle: () => void;
  t: (key: StringsKey) => string;
  strings: ReturnType<typeof stringsFor>;
};

const LanguageContext = createContext<LanguageValue | null>(null);

export function LanguageProvider({
  children,
  initialLang = Language.ar,
}: {
  children: ReactNode;
  initialLang?: LanguageCode;
}) {
  const [lang, setLang] = useState<LanguageCode>(initialLang);

  const strings = useMemo(() => stringsFor(lang), [lang]);
  const t = useCallback(
    (key: StringsKey) => strings[key] as string,
    [strings]
  );
  const toggle = useCallback(
    () => setLang((current) => (current === Language.ar ? Language.en : Language.ar)),
    []
  );

  const value = useMemo<LanguageValue>(
    () => ({
      lang,
      isRTL: lang === Language.ar,
      setLang,
      toggle,
      t,
      strings,
    }),
    [lang, strings, t, toggle]
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage(): LanguageValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within <LanguageProvider>');
  }
  return ctx;
}
