import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Colors, Radius, Shadows, Spacing } from '@/constants/brand';

/**
 * The shared card surface.
 *
 * Cards are the main visual element of this design language: white / near
 * white, noticeably rounded, generously padded and only lightly lifted off the
 * medical background. Heavy shadows, thick borders and dark surfaces are all
 * deliberately avoided.
 */
export function SurfaceCard({
  children,
  style,
  tone = 'surface',
  padded = true,
  elevated = true,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  /** `surface` = white, `subtle` = lavender-white, `accent` = soft teal. */
  tone?: 'surface' | 'subtle' | 'accent';
  padded?: boolean;
  /** Turn off for containers that nest one card inside another. */
  elevated?: boolean;
}) {
  const backgroundColor =
    tone === 'subtle'
      ? Colors.surfaceSubtle
      : tone === 'accent'
        ? Colors.tealSoft
        : Colors.surface;

  return (
    <View
      style={[
        styles.base,
        elevated ? styles.elevated : styles.flat,
        { backgroundColor },
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
    borderColor: Colors.border,
  },
  elevated: {
    ...Shadows.card,
    elevation: 2,
  },
  flat: {
    shadowOpacity: 0,
    shadowRadius: 0,
    shadowOffset: { width: 0, height: 0 },
    elevation: 0,
  },
  padded: {
    padding: Spacing.screen,
  },
});
