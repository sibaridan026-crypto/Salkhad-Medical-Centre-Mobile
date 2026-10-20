import type { ReactNode } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Spacing, Typography, textAlignment } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { AppBackground } from '../app-background';
import { BrandMark } from '../brand-mark';

/**
 * Shared centered layout for the unauthenticated screens (sign in, register and
 * the first-time health profile). Keeps the brand mark, headline and card
 * consistent and RTL-aware across those screens.
 *
 * Keyboard handling: the content scrolls inside a `KeyboardAvoidingView`, so the
 * CTA and the focused field stay reachable when the keyboard opens on a small
 * screen, and `keyboardShouldPersistTaps="handled"` keeps taps working while the
 * keyboard is open.
 */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  const theme = useTheme();
  const { isRTL, strings } = useLanguage();
  const c = theme.colors;
  const align = { textAlign: textAlignment(isRTL) } as const;

  return (
    <AppBackground edges={[]}>
      <SafeAreaView style={styles.fill} edges={['top', 'left', 'right']}>
        <KeyboardAvoidingView
          style={styles.fill}
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
          <ScrollView
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.brand}>
              <BrandMark size={64} />
              <Text style={[styles.brandName, align, { color: c.text }]}>{strings.brand}</Text>
              <Text style={[styles.brandSecondary, align, { color: c.textMuted }]}>
                {strings.brandSecondary}
              </Text>
            </View>

            <View style={styles.heading}>
              <Text style={[styles.title, align, { color: c.text }]}>{title}</Text>
              {subtitle ? (
                <Text style={[styles.subtitle, align, { color: c.textSecondary }]}>{subtitle}</Text>
              ) : null}
            </View>

            {children}
          </ScrollView>

          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </KeyboardAvoidingView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: {
    flexGrow: 1,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.xxl,
    gap: Spacing.xl,
  },
  brand: { alignItems: 'center', gap: Spacing.xs },
  brandName: { ...Typography.screenTitle },
  brandSecondary: { ...Typography.caption },
  heading: { gap: Spacing.xs },
  title: { ...Typography.screenTitle },
  subtitle: { ...Typography.secondary },
  footer: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    // The sign-in / register footers hold up to three items (prompt, primary
    // link, employee login). Without wrapping the trailing employee button is
    // pushed off-screen on narrow devices in both RTL and LTR.
    flexWrap: 'wrap',
    rowGap: Spacing.xs,
    columnGap: Spacing.xs,
  },
});
