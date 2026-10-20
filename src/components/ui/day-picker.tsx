import { Pressable, ScrollView, StyleSheet, Text } from 'react-native';

import { Radius, Spacing, Typography } from '@/constants/brand';
import { useTheme } from '@/theme';

export interface DayOption {
  /** Stable key, e.g. an ISO date or weekday id. */
  value: string;
  /** Primary label, e.g. the weekday name. */
  label: string;
  /** Optional secondary label, e.g. the day number or month. */
  sublabel?: string;
  disabled?: boolean;
}

/**
 * Horizontal day picker.
 *
 * Presentation only — the parent owns the selected value and supplies the day
 * options from real schedule data. Scroll order is preserved (the caller passes
 * days in reading order), so no direction juggling is needed.
 */
export function DayPicker({
  days,
  selected,
  onSelect,
}: {
  days: readonly DayOption[];
  selected: string | null;
  onSelect?: (value: string) => void;
}) {
  const theme = useTheme();
  const c = theme.colors;

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.content}
    >
      {days.map((day) => {
        const active = day.value === selected;
        return (
          <Pressable
            key={day.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled: day.disabled }}
            accessibilityLabel={day.sublabel ? `${day.label} ${day.sublabel}` : day.label}
            disabled={day.disabled}
            onPress={() => onSelect?.(day.value)}
            style={({ pressed }) => [
              styles.day,
              active
                ? { backgroundColor: c.primary, borderColor: c.primary }
                : { backgroundColor: c.surface, borderColor: c.borderStrong },
              pressed && !active && !day.disabled && { backgroundColor: c.lavender },
              day.disabled && { opacity: theme.opacity.disabled },
            ]}
          >
            <Text
              style={[styles.label, { color: active ? c.onPrimary : c.text }]}
              numberOfLines={1}
            >
              {day.label}
            </Text>
            {day.sublabel ? (
              <Text
                style={[styles.sublabel, { color: active ? c.onPrimary : c.textMuted }]}
                numberOfLines={1}
              >
                {day.sublabel}
              </Text>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  content: { gap: Spacing.sm, paddingVertical: 2 },
  day: {
    minWidth: 64,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  label: { ...Typography.caption, fontWeight: '600' },
  sublabel: { ...Typography.micro, fontWeight: '600' },
});
