import type { ImageSourcePropType } from 'react-native';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography, rowDirection, textAlignment } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { Badge } from '../ui';
import { SurfaceCard } from '../surface-card';

/**
 * Specialty card with the generated cover image, the specialty name, a short
 * neutral description and the number of doctors in it (calculated from real
 * data, never hardcoded).
 */
export function SpecialtyCoverCard({
  name,
  description,
  image,
  doctorsLabel,
  onPress,
}: {
  name: string;
  description: string;
  image: ImageSourcePropType;
  doctorsLabel: string;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;
  const align = { textAlign: textAlignment(isRTL) } as const;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: theme.opacity.pressed }]}
    >
      <SurfaceCard padded={false} style={styles.card}>
        <Image source={image} style={styles.image} resizeMode="cover" accessible={false} />
        <View style={styles.body}>
          <Text style={[styles.name, align, { color: c.text }]} numberOfLines={2}>
            {name}
          </Text>
          <Text
            style={[styles.description, align, { color: c.textMuted }]}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {description}
          </Text>
          <View style={[styles.footer, { flexDirection: rowDirection(isRTL) }]}>
            <Badge label={doctorsLabel} tone="accent" icon="account-outline" />
          </View>
        </View>
      </SurfaceCard>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: { overflow: 'hidden', borderRadius: Radius.xl },
  image: { width: '100%', height: 132, backgroundColor: '#F3EEFC' },
  body: { padding: Spacing.lg, gap: Spacing.xs },
  name: { ...Typography.cardTitle },
  description: { ...Typography.caption },
  footer: { marginTop: Spacing.xs },
});
