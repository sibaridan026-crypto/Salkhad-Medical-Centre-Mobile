import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Layout, Radius, Shadows, Typography, rowDirection } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { Icon } from './icon';

/**
 * Medical search field — compact and quiet.
 *
 * Visual only in this phase; no search logic is wired up. It reads as a
 * control through its height, light surface, hairline border and very soft
 * lift, with a compact icon leading the RTL-aware placeholder in the reading
 * direction. The radius is generous relative to its height, so the corners
 * read as soft rather than boxy.
 */
export function SearchField({ onPress }: { onPress?: () => void }) {
  const { t, isRTL } = useLanguage();

  return (
    <Pressable
      accessibilityRole="search"
      accessibilityLabel={t('searchPlaceholder')}
      onPress={onPress}
      style={({ pressed }) => [styles.field, pressed && styles.pressed]}
    >
      <View style={[styles.content, { flexDirection: rowDirection(isRTL) }]}>
        <Icon name="magnify" size={19} color={Colors.textMuted} />
        <Text style={styles.placeholder} numberOfLines={1} ellipsizeMode="tail">
          {t('searchPlaceholder')}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  field: {
    height: Layout.searchFieldHeight,
    borderRadius: Radius.lg,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    justifyContent: 'center',
    paddingHorizontal: 14,
    ...Shadows.field,
  },
  pressed: {
    backgroundColor: Colors.surfaceSubtle,
    borderColor: Colors.lavenderBorder,
  },
  content: {
    alignItems: 'center',
    gap: 9,
  },
  placeholder: {
    ...Typography.secondary,
    color: Colors.textMuted,
    flexShrink: 1,
  },
});
