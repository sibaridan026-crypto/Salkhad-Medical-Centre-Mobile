import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Layout, Radius, Spacing, Typography, rowDirection, textAlignment } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { BrandMark } from './brand-mark';
import { Icon, type IconName } from './icon';
import { LanguageSwitcher } from './language-switcher';

/**
 * App header — deliberately compact.
 *
 * Composition follows the reference: a small brand mark leading, the center's
 * name in both languages beside it (current language stronger, the other
 * language quieter), and a trailing control cluster of the AR/EN pill plus
 * notification and profile affordances.
 *
 * It never becomes a toolbar and never eats more than `Layout.headerHeight`,
 * so the greeting and search field stay above the fold. The parent screen is
 * responsible for placing this below the status bar via the safe-area inset.
 *
 * The brand block is allowed to shrink so the controls never wrap and the
 * name ellipsizes gracefully on narrow devices.
 */
export function AppHeader({
  showNotification = false,
  showProfile = false,
  onNotification,
  onProfile,
}: {
  showNotification?: boolean;
  showProfile?: boolean;
  onNotification?: () => void;
  onProfile?: () => void;
}) {
  const { isRTL, strings } = useLanguage();

  return (
    <View style={[styles.header, { flexDirection: rowDirection(isRTL) }]}>
      <View style={[styles.brand, { flexDirection: rowDirection(isRTL) }]}>
        <BrandMark size={Layout.brandMarkSize} />
        <View style={styles.names}>
          <Text
            style={[styles.name, { textAlign: textAlignment(isRTL) }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {strings.brand}
          </Text>
          <Text
            style={[styles.secondary, { textAlign: textAlignment(isRTL) }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {strings.brandSecondary}
          </Text>
        </View>
      </View>

      <View style={[styles.controls, { flexDirection: rowDirection(isRTL) }]}>
        <LanguageSwitcher />
        {showNotification ? (
          <HeaderIcon
            name="bell-outline"
            label="Notifications"
            onPress={onNotification}
          />
        ) : null}
        {showProfile ? (
          <HeaderIcon name="account-outline" label="Profile" onPress={onProfile} />
        ) : null}
      </View>
    </View>
  );
}

function HeaderIcon({
  name,
  label,
  onPress,
}: {
  name: IconName;
  label: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}
    >
      <Icon name={name} size={19} color={Colors.textSecondary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: {
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: Spacing.sm,
    minHeight: Layout.headerHeight,
    paddingHorizontal: Spacing.screen,
    paddingVertical: Spacing.xs,
  },
  brand: {
    alignItems: 'center',
    gap: Spacing.sm,
    flex: 1,
    minWidth: 0,
  },
  names: {
    flex: 1,
    minWidth: 0,
    gap: 1,
  },
  name: {
    ...Typography.cardTitle,
    color: Colors.text,
  },
  secondary: {
    ...Typography.caption,
    color: Colors.textMuted,
  },
  controls: {
    alignItems: 'center',
    gap: 6,
    flexShrink: 0,
  },
  iconButton: {
    width: Layout.headerIconSize,
    height: Layout.headerIconSize,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  iconButtonPressed: {
    backgroundColor: Colors.lavender,
    borderColor: Colors.lavenderBorder,
  },
});
