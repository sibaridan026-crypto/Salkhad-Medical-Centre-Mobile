import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Colors, Layout, Radius, Shadows, Spacing, Typography } from '@/constants/brand';
import { Icon, type IconName } from './icon';

export type NavItem = {
  key: string;
  label: string;
  icon: IconName;
  /** Outline variant used when the item is not selected. */
  iconInactive?: IconName;
};

/**
 * Bottom navigation visual.
 *
 * Android system-navigation handling is the important part here:
 *
 * - The bar is a full-bleed light sheet with rounded upper corners, so the
 *   background shows through above it and the sheet reads as elevated.
 * - It applies `insets.bottom` as padding, so the item row is pushed clear of
 *   the native system-navigation area and the white sheet — not the content —
 *   is what fills that area. The sheet's colour therefore keeps the system bar
 *   visually coordinated with the app.
 * - Native system UI is never hidden and no replacement status/navigation bar
 *   is drawn; this only positions app content around the real system UI.
 * - The parent screen is responsible for leaving enough scroll room that
 *   content passes behind nothing.
 *
 * Only the visual language is defined here — the real patient tabs and their
 * routes arrive with the patient phase.
 */
export function BottomNav({
  items,
  activeKey,
  onSelect,
}: {
  items: NavItem[];
  activeKey: string;
  onSelect?: (key: string) => void;
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.dock, { paddingBottom: insets.bottom }]}>
      <View style={styles.bar}>
        {items.map((item) => {
          const active = item.key === activeKey;
          return (
            <Pressable
              key={item.key}
              accessibilityRole="tab"
              accessibilityState={{ selected: active }}
              accessibilityLabel={item.label}
              onPress={() => onSelect?.(item.key)}
              style={({ pressed }) => [styles.item, pressed && styles.itemPressed]}
            >
              <Icon
                name={active ? item.icon : (item.iconInactive ?? item.icon)}
                size={21}
                color={active ? Colors.primary : Colors.textMuted}
              />
              <Text
                style={[styles.label, active ? styles.labelActive : styles.labelInactive]}
                numberOfLines={1}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  dock: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: Layout.bottomNavRadius,
    borderTopRightRadius: Layout.bottomNavRadius,
    ...Shadows.nav,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    height: Layout.bottomNavHeight,
    // Keeps the item hit-area clear of the rounded top corners, so a pressed
    // item never spills past the sheet's outline.
    paddingTop: Spacing.xs,
    paddingHorizontal: Spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: Spacing.xs,
    borderRadius: Radius.md,
    minHeight: Layout.touchTarget,
  },
  itemPressed: {
    backgroundColor: Colors.lavender,
  },
  label: {
    ...Typography.micro,
    fontWeight: '500',
    maxWidth: '100%',
  },
  labelActive: {
    color: Colors.primary,
  },
  labelInactive: {
    color: Colors.textMuted,
  },
});
