import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography, rowDirection } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';

/**
 * Segmented control.
 *
 * Generic over the option value. Used for any either/or or small set of choices
 * (language, appointment status filter, sex, etc.). The active segment takes the
 * accent fill; the track stays a quiet bordered pill.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  fullWidth = true,
}: {
  options: readonly { value: T; label: string }[];
  value: T;
  onChange?: (value: T) => void;
  fullWidth?: boolean;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;

  return (
    <View
      accessibilityRole="tablist"
      style={[
        styles.track,
        {
          flexDirection: rowDirection(isRTL),
          backgroundColor: c.surface,
          borderColor: c.lavenderBorder,
        },
        fullWidth && styles.fullWidth,
      ]}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            accessibilityLabel={option.label}
            onPress={() => onChange?.(option.value)}
            style={({ pressed }) => [
              styles.segment,
              fullWidth && styles.segmentFlex,
              active && { backgroundColor: c.primary },
              pressed && !active && { backgroundColor: c.lavender },
            ]}
          >
            <Text
              style={[styles.label, { color: active ? c.onPrimary : c.textSecondary }]}
              numberOfLines={1}
            >
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    alignItems: 'center',
    padding: 3,
    borderRadius: Radius.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  fullWidth: { alignSelf: 'stretch' },
  segment: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    minHeight: 34,
  },
  segmentFlex: { flex: 1 },
  label: { ...Typography.micro, fontWeight: '600' },
});
