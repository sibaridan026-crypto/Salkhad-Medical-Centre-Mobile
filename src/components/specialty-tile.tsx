import { Pressable, StyleSheet, Text, View } from 'react-native';

import { AccentColors, Colors, Layout, Radius, Typography, type AccentName } from '@/constants/brand';
import { Icon, type IconName } from './icon';
import { SurfaceCard } from './surface-card';

/**
 * Compact specialty tile used in the Home composition.
 *
 * Instead of a full-width row per specialty, the reference groups several
 * specialties side by side: a soft circular well holding the icon with the
 * name directly beneath it, all inside a small, quiet card. A whole row fits
 * above the fold, which is what makes the section scan at a glance.
 *
 * Names are allowed two lines and then ellipsize, so the real (long) Arabic
 * specialty labels still sit inside an even grid without stretching the tiles.
 *
 * Accent colours come from the shared `AccentColors` token map.
 */
export function SpecialtyTile({
  name,
  icon,
  accent = 'primary',
  onPress,
}: {
  name: string;
  icon: IconName;
  accent?: AccentName;
  onPress?: () => void;
}) {
  const tone = AccentColors[accent];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
    >
      <SurfaceCard padded={false} style={styles.card}>
        <View style={[styles.well, { backgroundColor: tone.well }]}>
          <Icon name={icon} size={21} color={tone.icon} />
        </View>
        <Text style={styles.name} numberOfLines={2} ellipsizeMode="tail">
          {name}
        </Text>
      </SurfaceCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flex: 1,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ scale: 0.985 }],
  },
  card: {
    alignItems: 'center',
    gap: 7,
    paddingVertical: 12,
    paddingHorizontal: 6,
    borderRadius: Radius.lg,
    minHeight: 96,
  },
  well: {
    width: Layout.specialtyIconSize,
    height: Layout.specialtyIconSize,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...Typography.caption,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    width: '100%',
  },
});
