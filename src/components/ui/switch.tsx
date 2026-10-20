import { StyleSheet, Switch as NativeSwitch, Text, View } from 'react-native';

import { Spacing, textAlignment, rowDirection, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';

/**
 * Labelled switch row. Wraps the platform switch so the accent colour and the
 * label/description typography stay consistent with the rest of the system.
 */
export function SwitchRow({
  value,
  onValueChange,
  label,
  description,
  disabled = false,
}: {
  value: boolean;
  onValueChange?: (value: boolean) => void;
  label: string;
  description?: string;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;

  return (
    <View
      style={[styles.row, { flexDirection: rowDirection(isRTL) }, disabled && { opacity: theme.opacity.disabled }]}
    >
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

      <NativeSwitch
        accessibilityLabel={label}
        disabled={disabled}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: c.borderStrong, true: c.primarySoft }}
        thumbColor={value ? c.primary : c.surface}
        ios_backgroundColor={c.borderStrong}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', gap: Spacing.md, minHeight: 44 },
  textWrap: { flex: 1, minWidth: 0, gap: 2 },
  label: { ...Typography.bodyStrong },
  description: { ...Typography.caption },
});
