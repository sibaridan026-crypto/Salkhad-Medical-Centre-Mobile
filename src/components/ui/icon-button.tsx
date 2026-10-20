import { Pressable, StyleSheet } from 'react-native';

import { Radius } from '@/constants/brand';
import { useTheme } from '@/theme';
import { Icon, type IconName } from '../icon';

export type IconButtonVariant = 'surface' | 'ghost' | 'accent' | 'danger';

/**
 * Compact circular icon button — used for header actions, close affordances and
 * any single-glyph control. Variants mirror `Button` so an icon control never
 * looks like it belongs to a different design language.
 */
export function IconButton({
  icon,
  label,
  onPress,
  variant = 'surface',
  size = 40,
  disabled = false,
}: {
  icon: IconName;
  /** Accessibility label — required, since the button has no visible text. */
  label: string;
  onPress?: () => void;
  variant?: IconButtonVariant;
  size?: number;
  disabled?: boolean;
}) {
  const theme = useTheme();
  const c = theme.colors;

  const surface = variant === 'accent' ? c.primary : variant === 'danger' ? c.danger : c.surface;
  const iconColor =
    variant === 'accent' || variant === 'danger' ? c.onPrimary : c.textSecondary;
  const bordered = variant === 'surface';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled }}
      disabled={disabled}
      onPress={onPress}
      hitSlop={6}
      style={({ pressed }) => [
        styles.base,
        {
          width: size,
          height: size,
          borderRadius: Radius.pill,
          backgroundColor: variant === 'ghost' ? 'transparent' : surface,
        },
        bordered && { borderWidth: 1, borderColor: c.border },
        variant === 'accent' && theme.shadows.button,
        pressed && !disabled && { opacity: theme.opacity.pressed },
        disabled && { opacity: theme.opacity.disabled },
      ]}
    >
      <Icon name={icon} size={Math.round(size * 0.48)} color={iconColor} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
