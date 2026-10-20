import { useEffect, useState } from 'react';
import { Animated, StyleSheet, type StyleProp, type ViewStyle } from 'react-native';

import { Radius } from '@/constants/brand';
import { useTheme } from '@/theme';

/**
 * Skeleton placeholder with a slow opacity pulse.
 *
 * Reserved for content that is genuinely loading. It is deliberately a soft
 * neutral block (never a fake layout of invented text), so it communicates
 * "loading" without implying data that does not exist.
 */
export function Skeleton({
  width = '100%',
  height = 16,
  radius = Radius.sm,
  style,
}: {
  width?: number | `${number}%`;
  height?: number;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const [pulse] = useState(() => new Animated.Value(0.5));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 700, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0.5, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        styles.block,
        { width, height, borderRadius: radius, backgroundColor: theme.colors.coolGray, opacity: pulse },
        style,
      ]}
    />
  );
}

const styles = StyleSheet.create({
  block: {},
});
