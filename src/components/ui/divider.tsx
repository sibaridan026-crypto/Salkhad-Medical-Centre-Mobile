import { StyleSheet, View } from 'react-native';

import { Spacing } from '@/constants/brand';
import { useTheme } from '@/theme';

/**
 * Hairline divider. `inset` keeps it aligned to content rather than the card
 * edge, and `spacing` adds vertical breathing room so lists read cleanly.
 */
export function Divider({
  inset = false,
  spacing = 0,
}: {
  inset?: boolean;
  spacing?: number;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.line,
        {
          backgroundColor: theme.colors.border,
          marginVertical: spacing || undefined,
          marginHorizontal: inset ? Spacing.screen : 0,
        },
      ]}
    />
  );
}

const styles = StyleSheet.create({
  line: { height: StyleSheet.hairlineWidth, width: '100%' },
});
