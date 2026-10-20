import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography } from '@/constants/brand';
import { useTheme } from '@/theme';

export interface TimeSlot {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Time-slot grid.
 *
 * Presentation only: the parent derives the slots from real availability and
 * owns the selection. Disabled slots stay visible (never hidden) so the patient
 * can see that a time exists but is taken.
 */
export function TimeSlotGrid({
  slots,
  selected,
  onSelect,
}: {
  slots: readonly TimeSlot[];
  selected: string | null;
  onSelect?: (value: string) => void;
}) {
  const theme = useTheme();
  const c = theme.colors;

  return (
    <View style={styles.grid}>
      {slots.map((slot) => {
        const active = slot.value === selected;
        return (
          <Pressable
            key={slot.value}
            accessibilityRole="button"
            accessibilityState={{ selected: active, disabled: slot.disabled }}
            accessibilityLabel={slot.label}
            disabled={slot.disabled}
            onPress={() => onSelect?.(slot.value)}
            style={({ pressed }) => [
              styles.slot,
              active
                ? { backgroundColor: c.primary, borderColor: c.primary }
                : { backgroundColor: c.surface, borderColor: c.borderStrong },
              pressed && !active && !slot.disabled && { backgroundColor: c.lavender },
              slot.disabled && { opacity: theme.opacity.disabled },
            ]}
          >
            <Text
              style={[styles.label, { color: active ? c.onPrimary : c.text }]}
              numberOfLines={1}
            >
              {slot.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  slot: {
    minWidth: 84,
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 42,
  },
  label: { ...Typography.caption, fontWeight: '600' },
});
