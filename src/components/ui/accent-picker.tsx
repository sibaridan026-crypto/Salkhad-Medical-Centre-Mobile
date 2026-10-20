import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { ACCENT_LABELS, THEME_ACCENT_ORDER, useAccent, useTheme, type ThemeAccentName } from '@/theme';

/**
 * Accent picker.
 *
 * Real, working theme control: selecting a swatch rebuilds the app theme
 * immediately. Purple is the default identity. Labels are bilingual so the
 * control reads correctly in either language.
 */
export function AccentPicker() {
  const accent = useAccent();
  const theme = useTheme();
  const { lang } = useLanguage();
  const c = theme.colors;
  const active = accent?.accentName ?? theme.accentName;

  return (
    <View style={styles.row}>
      {THEME_ACCENT_ORDER.map((name: ThemeAccentName) => {
        const selected = name === active;
        const swatch = theme.accentName === name ? theme.accent.primary : undefined;
        return (
          <Pressable
            key={name}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            accessibilityLabel={ACCENT_LABELS[name][lang]}
            onPress={() => accent?.setAccent(name)}
            style={styles.item}
          >
            <View
              style={[
                styles.ring,
                { borderColor: selected ? c.text : 'transparent' },
              ]}
            >
              <View
                style={[
                  styles.swatch,
                  { backgroundColor: swatch ?? previewColor(name) },
                ]}
              />
            </View>
            <Text
              style={[styles.label, { color: selected ? c.text : c.textMuted }]}
              numberOfLines={1}
            >
              {ACCENT_LABELS[name][lang]}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Swatch colour for accents that are not the currently active theme. */
function previewColor(name: ThemeAccentName): string {
  switch (name) {
    case 'purple':
      return '#6D4AC4';
    case 'blue':
      return '#2B5FA8';
    case 'teal':
      return '#2E9FB0';
    case 'lavender':
      return '#8B6FD0';
    case 'deepBlue':
      return '#21458F';
  }
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.lg },
  item: { alignItems: 'center', gap: Spacing.xs, width: 64 },
  ring: {
    width: 46,
    height: 46,
    borderRadius: Radius.pill,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  swatch: { width: 34, height: 34, borderRadius: Radius.pill },
  label: { ...Typography.micro, fontWeight: '600', textAlign: 'center' },
});
