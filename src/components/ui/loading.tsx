import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { Spacing, Typography } from '@/constants/brand';
import { useTheme } from '@/theme';

/** Bare accent spinner. */
export function Spinner({ size = 'small' }: { size?: 'small' | 'large' }) {
  const theme = useTheme();
  return <ActivityIndicator size={size} color={theme.colors.primary} />;
}

/** Centered loading block with an optional label. */
export function LoadingView({ label }: { label?: string }) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      {label ? (
        <Text style={[styles.label, { color: theme.colors.textMuted }]}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', justifyContent: 'center', paddingVertical: Spacing.xxl, gap: Spacing.md },
  label: { ...Typography.secondary },
});
