import { ImageBackground, StyleSheet, View } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { MedicalBackground } from '@/constants/background';
import { Colors } from '@/constants/brand';

/**
 * App-wide background: the official medical background image, with a light
 * lavender wash over it so white content cards keep a strong contrast ratio.
 *
 * `SafeAreaProvider` is expected to sit above this component (see the root
 * layout). Screens that draw their own chrome can opt out with `edges={[]}`.
 */
export function AppBackground({
  children,
  edges = ['top', 'left', 'right'],
}: {
  children: React.ReactNode;
  edges?: readonly Edge[];
}) {
  return (
    <ImageBackground
      source={MedicalBackground}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.wash} pointerEvents="none" />
      <SafeAreaView style={styles.safeArea} edges={edges}>
        {children}
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    // Shows through anywhere the image does not reach.
    backgroundColor: Colors.lavender,
  },
  wash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    /**
     * Light overlay only. It is deliberately thin enough that the medical
     * photograph still reads as a photograph — the composition depends on it
     * contributing to the identity — while dark navy text and white cards
     * keep a comfortable contrast ratio over it.
     */
    backgroundColor: 'rgba(243, 238, 252, 0.45)',
  },
  safeArea: {
    flex: 1,
  },
});