import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AppBackground } from '@/components/app-background';
import { LanguageProvider } from '@/i18n/language-context';
import { AuthProvider } from '@/state/auth-context';
import { ThemeProvider } from '@/theme';

/**
 * Root layout for the Salkhad Medical Centre app.
 *
 * Phase 1 established the shell: brand background, light status bar and a
 * single stack. Phase 2 added the language/direction provider so every screen
 * and reusable component can resolve RTL (Arabic) or LTR (English). Phase 3
 * adds the theme provider so the accent can be swapped app-wide.
 *
 * Phase 4 adds the patient auth/session provider that backs the entry gate and
 * the patient screens.
 *
 * The doctor / reception / admin route groups are added in later phases.
 */
export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppBackground edges={[]}>
              <StatusBar style="dark" />
              <Stack
                screenOptions={{
                  headerShown: false,
                  contentStyle: { backgroundColor: 'transparent' },
                  animation: 'fade',
                }}
              />
            </AppBackground>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}