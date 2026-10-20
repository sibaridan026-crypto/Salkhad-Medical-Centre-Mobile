import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, textAlignment, rowDirection, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { Icon } from '../icon';

/**
 * Checkbox, with optional supporting description.
 *
 * Selection uses the accent fill; unselected stays a plain bordered square.
 * Used by consent, multi-select filters and health-profile multi-selects.
 */
export function Checkbox({
  checked,
  onChange,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onChange?: (checked: boolean) => void;
  label?: string;
  description?: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;

  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={() => onChange?.(!checked)}
      style={({ pressed }) => [
        styles.row,
        { flexDirection: rowDirection(isRTL) },
        pressed && !disabled && { opacity: theme.opacity.pressed },
        disabled && { opacity: theme.opacity.disabled },
      ]}
    >
      <View
        style={[
          styles.box,
          {
            backgroundColor: checked ? c.primary : c.surface,
            borderColor: checked ? c.primary : c.borderStrong,
          },
        ]}
      >
        {checked ? <Icon name="check" size={15} color={c.onPrimary} /> : null}
      </View>

      {label || description ? (
        <View style={styles.textWrap}>
          {label ? (
            <Text style={[styles.label, { color: c.text, textAlign: textAlignment(isRTL) }]}>
              {label}
            </Text>
          ) : null}
          {description ? (
            <Text
              style={[styles.description, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}
            >
              {description}
            </Text>
          ) : null}
        </View>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'flex-start',
    gap: Spacing.md,
    minHeight: 32,
  },
  box: {
    width: 24,
    height: 24,
    borderRadius: Radius.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  textWrap: { flex: 1, minWidth: 0, gap: 2 },
  label: { ...Typography.bodyStrong },
  description: { ...Typography.caption },
});
