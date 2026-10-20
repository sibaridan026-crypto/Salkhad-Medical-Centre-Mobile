import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Spacing } from '@/constants/brand';
import { useTheme } from '@/theme';

export type CardTone = 'surface' | 'subtle' | 'accent' | 'outline';

/**
 * Themed card surface. The single container every grouped block of content
 * should use, so cards stay identical across the app and follow the active
 * accent (`accent` tone) without any component hardcoding a colour.
 */
export function Card({
  children,
  style,
  tone = 'surface',
  padded = true,
  elevated = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  tone?: CardTone;
  padded?: boolean;
  elevated?: boolean;
}) {
  const theme = useTheme();
  const c = theme.colors;

  const background =
    tone === 'subtle'
      ? c.surfaceSubtle
      : tone === 'accent'
        ? c.primarySurface
        : c.surface;

  return (
    <View
      style={[
        styles.base,
        { backgroundColor: background, borderColor: c.border },
        tone === 'accent' && { borderColor: c.lavenderBorder },
        elevated ? theme.shadows.card : styles.flat,
        padded && styles.padded,
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.xl,
    borderWidth: 1,
  },
  flat: {
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  padded: {
    padding: Spacing.lg,
  },
});
