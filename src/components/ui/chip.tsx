import { Pressable, StyleSheet, Text } from 'react-native';

import { Radius, Spacing, Typography, rowDirection } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { Icon, type IconName } from '../icon';

/**
 * Filter / selection chip.
 *
 * Two uses in one control: `selected` toggles the accent fill (filters,
 * day pickers), and omitting `onPress` makes it a static tag. Keeps filter
 * rows compact and consistent.
 */
export function Chip({
  label,
  selected = false,
  onPress,
  icon,
  disabled = false,
}: {
  label: string;
  selected?: boolean;
  onPress?: () => void;
  icon?: IconName;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;
  const interactive = Boolean(onPress);

  return (
    <Pressable
      accessibilityRole={interactive ? 'button' : 'text'}
      accessibilityState={interactive ? { selected, disabled } : undefined}
      accessibilityLabel={label}
      disabled={disabled || !interactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        { flexDirection: rowDirection(isRTL) },
        selected
          ? { backgroundColor: c.primary, borderColor: c.primary }
          : { backgroundColor: c.surface, borderColor: c.borderStrong },
        pressed && interactive && !disabled && { opacity: theme.opacity.pressed },
        disabled && { opacity: theme.opacity.disabled },
      ]}
    >
      {icon ? (
        <Icon
          name={icon}
          size={theme.iconSize.xs}
          color={selected ? c.onPrimary : c.textSecondary}
        />
      ) : null}
      <Text
        style={[styles.label, { color: selected ? c.onPrimary : c.textSecondary }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.pill,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    minHeight: 34,
  },
  label: { ...Typography.micro, fontWeight: '600' },
});
