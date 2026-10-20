import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { Colors, Layout, Radius, Spacing, Typography, rowDirection, textAlignment } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { Icon } from './icon';
import { SurfaceCard } from './surface-card';

/**
 * Compact doctor card: a modest photo slot, the doctor's name, the specialty,
 * and a small trailing chevron as the action indicator.
 *
 * The photo slot keeps the exact geometry a real photo will use (same size and
 * rounded crop) so approving the layout here carries over to the real images
 * supplied later. When no photo is passed it renders a neutral placeholder
 * avatar — no invented doctor imagery.
 *
 * Deliberately compact: proportions stay tight and the type hierarchy does the
 * work instead of a large image. No ratings, reviews, experience or patient
 * counts are ever added — only real information is shown in later phases.
 */
export function DoctorCard({
  name,
  specialty,
  photo,
  onPress,
}: {
  name: string;
  specialty: string;
  photo?: ImageSourcePropType;
  onPress?: () => void;
}) {
  const { isRTL } = useLanguage();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => [pressed && styles.pressed]}
    >
      <SurfaceCard padded={false}>
        <View style={[styles.row, { flexDirection: rowDirection(isRTL) }]}>
          <View style={styles.photoSlot}>
            {photo ? (
              <Image source={photo} style={styles.photo} resizeMode="cover" />
            ) : (
              <Icon name="account" size={26} color={Colors.primarySoft} />
            )}
          </View>

          <View style={styles.meta}>
            <Text
              style={[styles.name, { textAlign: textAlignment(isRTL) }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {name}
            </Text>
            <Text
              style={[styles.specialty, { textAlign: textAlignment(isRTL) }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {specialty}
            </Text>
          </View>

          <Icon
            name={isRTL ? 'chevron-left' : 'chevron-right'}
            size={18}
            color={Colors.textMuted}
          />
        </View>
      </SurfaceCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },
  row: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: Layout.doctorPhotoSize + Spacing.md * 2,
  },
  photoSlot: {
    width: Layout.doctorPhotoSize,
    height: Layout.doctorPhotoSize,
    borderRadius: Radius.md,
    backgroundColor: Colors.lavender,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photo: {
    width: '100%',
    height: '100%',
  },
  meta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  name: {
    ...Typography.cardTitle,
    color: Colors.text,
  },
  specialty: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
