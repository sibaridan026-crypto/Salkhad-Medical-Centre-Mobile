import { Image, StyleSheet, Text, View, type ImageSourcePropType, type StyleProp, type ViewStyle } from 'react-native';

import { Radius, Typography } from '@/constants/brand';
import { useTheme } from '@/theme';
import { Icon, type IconName } from '../icon';

/**
 * Avatar.
 *
 * Renders, in priority order: a supplied real image, initials, or a neutral
 * icon. It never generates a portrait — when a doctor has no approved photo the
 * caller gets the neutral icon, which is the honest state.
 */
export function Avatar({
  source,
  initials,
  icon = 'account',
  size = 44,
  shape = 'pill',
  style,
}: {
  source?: ImageSourcePropType;
  initials?: string;
  icon?: IconName;
  size?: number;
  shape?: 'pill' | 'rounded';
  style?: StyleProp<ViewStyle>;
}) {
  const theme = useTheme();
  const c = theme.colors;
  const radius = shape === 'pill' ? Radius.pill : Radius.md;

  return (
    <View
      style={[
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: c.primarySurface,
        },
        style,
      ]}
    >
      {source ? (
        <Image source={source} style={styles.image} resizeMode="cover" />
      ) : initials ? (
        <Text style={[styles.initials, { color: c.primary, fontSize: Math.round(size * 0.36) }]}>
          {initials}
        </Text>
      ) : (
        <Icon name={icon} size={Math.round(size * 0.5)} color={c.primarySoft} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  base: { alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  image: { width: '100%', height: '100%' },
  initials: { ...Typography.cardTitle, fontWeight: '700' },
});
