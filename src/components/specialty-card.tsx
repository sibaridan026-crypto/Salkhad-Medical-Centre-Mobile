import { Pressable, StyleSheet, Text, View } from 'react-native';

import {
  AccentColors,
  Colors,
  Layout,
  Radius,
  Spacing,
  Typography,
  rowDirection,
  textAlignment,
  type AccentName,
} from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { Icon, type IconName } from './icon';
import { SurfaceCard } from './surface-card';

/**
 * Specialty card: a soft circular/rounded icon well, the specialty name, and a
 * trailing chevron that flips with the reading direction.
 *
 * Accent colours come from the shared `AccentColors` token map — no random
 * colours. Real Salkhad specialties are wired in during a later phase; this
 * component only defines how one looks.
 */
export function SpecialtyCard({
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
  const { isRTL } = useLanguage();
  const tone = AccentColors[accent];

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <SurfaceCard padded={false}>
        <View style={[styles.row, { flexDirection: rowDirection(isRTL) }]}>
          <View style={[styles.well, { backgroundColor: tone.well }]}>
            <Icon name={icon} size={24} color={tone.icon} />
          </View>
          <Text
            style={[styles.name, { textAlign: textAlignment(isRTL) }]}
            numberOfLines={2}
          >
            {name}
          </Text>
          <Icon
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={20}
            color={Colors.textMuted}
          />
        </View>
      </SurfaceCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.86,
    transform: [{ scale: 0.995 }],
  },
  row: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    minHeight: Layout.specialtyIconSize + Spacing.xl,
  },
  well: {
    width: Layout.specialtyIconSize,
    height: Layout.specialtyIconSize,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    ...Typography.cardTitle,
    color: Colors.text,
    flex: 1,
  },
});
