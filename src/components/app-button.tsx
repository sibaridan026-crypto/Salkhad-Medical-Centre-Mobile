import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Colors, Layout, Radius, Shadows, Spacing, Typography, rowDirection } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { Icon, type IconName } from './icon';

type Variant = 'primary' | 'secondary';
type Size = 'md' | 'sm';

/**
 * The reusable button system.
 *
 * Primary actions get the medium/deep purple fill with white text and a soft
 * lift. Secondary actions stay light — white surface, hairline purple border,
 * purple text — so the two are never confused at a glance. Both keep a proper
 * touch target, a visible pressed state and a muted disabled state.
 *
 * No booking/auth flows are wired up here; this only establishes the control.
 */
export function AppButton({
  label,
  variant = 'primary',
  size = 'md',
  disabled = false,
  icon,
  onPress,
}: {
  label: string;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  /** Optional icon placed after the label; row direction decides which side. */
  icon?: IconName;
  onPress?: () => void;
}) {
  const { isRTL } = useLanguage();
  const primary = variant === 'primary';
  const height = size === 'sm' ? Layout.buttonHeightSm : Layout.buttonHeight;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        primary ? styles.primary : styles.secondary,
        size === 'sm' && styles.compact,
        { height },
        primary && Shadows.button,
        pressed && !disabled && (primary ? styles.primaryPressed : styles.secondaryPressed),
        disabled && styles.disabled,
      ]}
    >
      <View style={[styles.content, { flexDirection: rowDirection(isRTL) }]}>
        <Text style={[styles.label, primary ? styles.labelPrimary : styles.labelSecondary]} numberOfLines={1}>
          {label}
        </Text>
        {icon ? (
          <Icon
            name={icon}
            size={18}
            color={primary ? Colors.textInverse : Colors.primary}
            style={styles.icon}
          />
        ) : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: Radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.xl,
  },
  compact: {
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.lg,
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  primaryPressed: {
    backgroundColor: Colors.primaryDark,
    shadowOpacity: 0.1,
  },
  secondary: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.lavenderBorder,
  },
  secondaryPressed: {
    backgroundColor: Colors.lavender,
  },
  disabled: {
    opacity: 0.45,
    shadowOpacity: 0,
    elevation: 0,
  },
  content: {
    alignItems: 'center',
    gap: Spacing.sm,
  },
  label: {
    ...Typography.cardTitle,
    textAlign: 'center',
  },
  labelPrimary: {
    color: Colors.textInverse,
  },
  labelSecondary: {
    color: Colors.primaryDark,
  },
  icon: {
    // Optical alignment against the label baseline.
    marginTop: -1,
  },
});
