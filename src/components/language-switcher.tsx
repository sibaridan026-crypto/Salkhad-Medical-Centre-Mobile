import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';

/**
 * Compact AR / EN language selector.
 *
 * The selected language sits on a stronger purple fill with white text; the
 * inactive one stays on a light surface with muted text, so the current
 * language is unmistakable. This switches the direction foundation (RTL for
 * Arabic, LTR for English) — full localization is a later phase.
 */
export function LanguageSwitcher() {
  const { lang, setLang } = useLanguage();

  return (
    <View style={styles.track} accessibilityRole="tablist">
      <Segment label="عربي" active={lang === 'ar'} onPress={() => setLang('ar')} />
      <Segment label="EN" active={lang === 'en'} onPress={() => setLang('en')} />
    </View>
  );
}

function Segment({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      onPress={onPress}
      style={({ pressed }) => [styles.segment, active && styles.segmentActive, pressed && !active && styles.segmentPressed]}
    >
      <Text style={[styles.label, active ? styles.labelActive : styles.labelInactive]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 2,
    borderRadius: Radius.pill,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.lavenderBorder,
  },
  segment: {
    minWidth: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    paddingHorizontal: 7,
    paddingVertical: 5,
  },
  segmentActive: {
    backgroundColor: Colors.primary,
  },
  segmentPressed: {
    backgroundColor: Colors.lavender,
  },
  label: {
    ...Typography.micro,
    letterSpacing: 0.2,
  },
  labelActive: {
    color: Colors.textInverse,
  },
  labelInactive: {
    color: Colors.textSecondary,
  },
});
