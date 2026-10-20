import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, rowDirection } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { Icon, type IconName } from '../icon';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'md' | 'sm';

/**
 * The button system.
 *
 * - `primary`   accent fill, white label, soft lift — the main action.
 * - `secondary` white surface, hairline accent border, accent label.
 * - `ghost`     no surface at all — tertiary/quiet actions.
 * - `danger`    red fill, reserved for destructive confirmation.
 *
 * Every variant keeps a real touch target, a visible pressed state, a muted
 * disabled state and a loading state, and every colour comes from the active
 * theme (so a button follows the accent automatically).
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'leading',
  loading = false,
  disabled = false,
  fullWidth = false,
  onPress,
  accessibilityLabel,
}: {
  label: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  icon?: IconName;
  iconPosition?: 'leading' | 'trailing';
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  onPress?: () => void;
  accessibilityLabel?: string;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const inactive = disabled || loading;
  const c = theme.colors;

  const surface = {
    primary: c.primary,
    secondary: c.surface,
    ghost: 'transparent',
    danger: c.danger,
  }[variant];

  const labelColor = {
    primary: c.onPrimary,
    secondary: c.primaryDark,
    ghost: c.primary,
    danger: c.onPrimary,
  }[variant];

  const iconColor = labelColor;

  const spinnerColor = variant === 'secondary' || variant === 'ghost' ? c.primary : c.onPrimary;

  const showIcon = icon && iconPosition === 'leading' && !loading;
  const showTrailing = icon && iconPosition === 'trailing' && !loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          backgroundColor: surface,
          height: size === 'sm' ? theme.layout.buttonHeightSm : theme.layout.buttonHeight,
          borderRadius: size === 'sm' ? Radius.md : Radius.lg,
          paddingHorizontal: size === 'sm' ? Spacing.lg : Spacing.xl,
        },
        variant === 'secondary' && [styles.bordered, { borderColor: c.lavenderBorder }],
        variant === 'primary' && theme.shadows.button,
        variant === 'danger' && theme.shadows.button,
        pressed && !inactive && { opacity: theme.opacity.pressed },
        disabled && !loading && { opacity: theme.opacity.disabled },
        fullWidth && styles.fullWidth,
      ]}
    >
      <View style={[styles.content, { flexDirection: rowDirection(isRTL) }]}>
        {loading ? (
          <ActivityIndicator size="small" color={spinnerColor} />
        ) : showIcon ? (
          <Icon name={icon} size={theme.iconSize.sm} color={iconColor} />
        ) : null}
        <Text style={[styles.label, { color: labelColor }]} numberOfLines={1}>
          {label}
        </Text>
        {showTrailing ? <Icon name={icon} size={theme.iconSize.sm} color={iconColor} /> : null}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  bordered: { borderWidth: 1 },
  fullWidth: { alignSelf: 'stretch' },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
  },
});
