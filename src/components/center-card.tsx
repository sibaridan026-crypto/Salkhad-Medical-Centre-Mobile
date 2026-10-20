import { Image, StyleSheet, Text, View } from 'react-native';

import { Colors, Layout, Radius, Spacing, Typography, rowDirection, textAlignment } from '@/constants/brand';
import { CenterImage } from '@/constants/center-image';
import { useLanguage } from '@/i18n/language-context';
import { SurfaceCard } from './surface-card';

/**
 * Compact center-image section for the Home composition.
 *
 * It carries the real Salkhad Medical Centre photograph — the only center
 * asset in the project — beside the center's name in both languages.
 *
 * The photograph is a small near-square source (208 x 210), so it is shown at
 * a controlled, near-native size with rounded corners rather than stretched
 * into a full-width banner. That keeps it sharp on a high-density Android
 * screen while still giving the section a clear focal point that does not
 * dominate the screen.
 *
 * No overlay text is invented and nothing is drawn on top of the image.
 */
export function CenterCard() {
  const { isRTL, strings } = useLanguage();

  return (
    <SurfaceCard padded={false} style={styles.card}>
      <View style={[styles.row, { flexDirection: rowDirection(isRTL) }]}>
        <Image
          source={CenterImage}
          style={styles.image}
          resizeMode="cover"
          accessible
          accessibilityLabel={strings.brand}
        />
        <View style={styles.meta}>
          <Text
            style={[styles.title, { textAlign: textAlignment(isRTL) }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {strings.brand}
          </Text>
          <Text
            style={[styles.subtitle, { textAlign: textAlignment(isRTL) }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {strings.brandSecondary}
          </Text>
        </View>
      </View>
    </SurfaceCard>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: Spacing.sm,
    borderRadius: Radius.lg,
  },
  row: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  image: {
    width: Layout.centerImageSize,
    height: Layout.centerImageSize,
    borderRadius: Radius.md,
    backgroundColor: Colors.lavender,
  },
  meta: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  title: {
    ...Typography.cardTitle,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
});
