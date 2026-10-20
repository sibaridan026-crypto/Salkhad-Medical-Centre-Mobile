import { ScrollView, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { Spacing } from '@/constants/brand';

/**
 * Safe-area screen containers.
 *
 * These exist so no screen invents its own inset handling. `Screen` fills the
 * available space and applies the safe-area edges; `ScrollScreen` is the same
 * thing with a vertical scroll view. Horizontal padding is opt-in through
 * `padded` so full-bleed content (headers, sheets) still works.
 */
export function Screen({
  children,
  style,
  edges = ['left', 'right'],
  padded = false,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
  padded?: boolean;
}) {
  return (
    <SafeAreaView style={[styles.fill, style]} edges={edges}>
      <View style={[styles.fill, padded && styles.padded]}>{children}</View>
    </SafeAreaView>
  );
}

export function ScrollScreen({
  children,
  style,
  contentStyle,
  edges = ['left', 'right'],
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
  edges?: readonly Edge[];
}) {
  return (
    <SafeAreaView style={[styles.fill, style]} edges={edges}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={[styles.scrollContent, contentStyle]}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  padded: { paddingHorizontal: Spacing.screen },
  scrollContent: {
    paddingHorizontal: Spacing.screen,
    paddingBottom: Spacing.xxl,
  },
});
