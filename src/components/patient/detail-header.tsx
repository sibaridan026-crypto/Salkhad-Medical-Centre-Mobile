import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography, rowDirection } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { Icon } from '../icon';

/**
 * Compact header for patient detail screens: a direction-aware back control
 * plus the screen title. The back control always works (it falls back to the
 * router's back action), so detail screens never show a dead button.
 */
export function DetailHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const router = useRouter();
  const { isRTL } = useLanguage();
  const theme = useTheme();
  const c = theme.colors;

  const handleBack = () => {
    if (onBack) onBack();
    else router.back();
  };

  return (
    <View style={[styles.row, { flexDirection: rowDirection(isRTL) }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={handleBack}
        hitSlop={6}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: c.surface, borderColor: c.border },
          pressed && { backgroundColor: c.lavender },
        ]}
      >
        <Icon name={isRTL ? 'arrow-right' : 'arrow-left'} size={theme.iconSize.md} color={c.text} />
      </Pressable>

      <Text style={[styles.title, { color: c.text }]} numberOfLines={1}>
        {title}
      </Text>

      <View style={styles.spacer} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.sm,
    minHeight: 52,
  },
  button: {
    width: 40,
    height: 40,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { ...Typography.sectionTitle, flex: 1 },
  spacer: { width: 40 },
});
