import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, textAlignment, rowDirection, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';

/** Single radio option, rendered as a labelled row. */
export function Radio({
  checked,
  onSelect,
  label,
  description,
  disabled = false,
}: {
  checked: boolean;
  onSelect?: () => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected: checked, disabled }}
      accessibilityLabel={label}
      disabled={disabled}
      onPress={onSelect}
      style={({ pressed }) => [
        styles.row,
        { flexDirection: rowDirection(isRTL) },
        pressed && !disabled && { opacity: theme.opacity.pressed },
        disabled && { opacity: theme.opacity.disabled },
      ]}
    >
      <View
        style={[
          styles.outer,
          { borderColor: checked ? c.primary : c.borderStrong, backgroundColor: c.surface },
        ]}
      >
        {checked ? <View style={[styles.inner, { backgroundColor: c.primary }]} /> : null}
      </View>

      <View style={styles.textWrap}>
        <Text style={[styles.label, { color: c.text, textAlign: textAlignment(isRTL) }]}>
          {label}
        </Text>
        {description ? (
          <Text
            style={[styles.description, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}
          >
            {description}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

/**
 * Radio group. Controlled: the parent owns `value` and receives the newly
 * selected value. Direction follows the language.
 */
export function RadioGroup<T extends string>({
  options,
  value,
  onChange,
}: {
  options: readonly { value: T; label: string; description?: string }[];
  value: T | null;
  onChange?: (value: T) => void;
}) {
  return (
    <View style={styles.group}>
      {options.map((option) => (
        <Radio
          key={option.value}
          checked={value === option.value}
          onSelect={() => onChange?.(option.value)}
          label={option.label}
          description={option.description}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: Spacing.md },
  row: { alignItems: 'flex-start', gap: Spacing.md, minHeight: 32 },
  outer: {
    width: 24,
    height: 24,
    borderRadius: Radius.pill,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  inner: { width: 12, height: 12, borderRadius: Radius.pill },
  textWrap: { flex: 1, minWidth: 0, gap: 2 },
  label: { ...Typography.bodyStrong },
  description: { ...Typography.caption },
});
