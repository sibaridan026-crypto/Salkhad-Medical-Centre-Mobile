import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography } from '@/constants/brand';
import { useTheme } from '@/theme';
import { Icon } from '../icon';

/**
 * QR frame.
 *
 * A presentation shell for a patient's medical QR. It renders corner brackets
 * and a placeholder state only — it deliberately does NOT draw a fake QR code,
 * because a hard-coded pattern would look like a real scannable identity while
 * carrying no verified data. The real QR is supplied to `children` once the
 * identity service exists.
 */
export function QRFrame({
  size = 200,
  label,
  children,
}: {
  size?: number;
  label?: string;
  children?: React.ReactNode;
}) {
  const theme = useTheme();
  const c = theme.colors;

  return (
    <View style={styles.wrap}>
      <View
        style={[
          styles.frame,
          { width: size, height: size, borderColor: c.borderStrong, backgroundColor: c.surface },
        ]}
      >
        {children ?? (
          <View style={styles.placeholder}>
            <Icon name="qrcode" size={48} color={c.primarySoft} />
            <Text style={[styles.placeholderText, { color: c.textMuted }]}>
              QR placeholder
            </Text>
          </View>
        )}

        {(
          [
            styles.cornerTopStart,
            styles.cornerTopEnd,
            styles.cornerBottomStart,
            styles.cornerBottomEnd,
          ] as const
        ).map((corner, index) => (
          <View key={index} style={[styles.corner, corner, { borderColor: c.primary }]} />
        ))}
      </View>

      {label ? <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', gap: Spacing.md },
  frame: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radius.lg,
    borderWidth: 1,
  },
  placeholder: { alignItems: 'center', gap: Spacing.sm },
  placeholderText: { ...Typography.caption },
  corner: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderColor: 'transparent',
  },
  cornerTopStart: { top: -1, left: -1, borderTopWidth: 3, borderLeftWidth: 3, borderTopLeftRadius: Radius.lg },
  cornerTopEnd: { top: -1, right: -1, borderTopWidth: 3, borderRightWidth: 3, borderTopRightRadius: Radius.lg },
  cornerBottomStart: { bottom: -1, left: -1, borderBottomWidth: 3, borderLeftWidth: 3, borderBottomLeftRadius: Radius.lg },
  cornerBottomEnd: { bottom: -1, right: -1, borderBottomWidth: 3, borderRightWidth: 3, borderBottomRightRadius: Radius.lg },
  label: { ...Typography.secondary },
});
