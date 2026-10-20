import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography, rowDirection } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { Icon, type IconName } from '../icon';

export type BadgeTone = 'neutral' | 'accent' | 'success' | 'warning' | 'danger' | 'info';

/**
 * Small status/label pill.
 *
 * Tones map to semantic colours only — success green is used for success and
 * nothing else, so colour never sends a mixed message. This is the general
 * badge; appointment status uses the same tones through `StatusBadge`.
 */
export function Badge({
  label,
  tone = 'neutral',
  icon,
}: {
  label: string;
  tone?: BadgeTone;
  icon?: IconName;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;

  const { background, foreground } = {
    neutral: { background: c.coolGray, foreground: c.textSecondary },
    accent: { background: c.primarySurface, foreground: c.primaryDark },
    success: { background: c.successSoft, foreground: c.success },
    warning: { background: c.warningSoft, foreground: c.warning },
    danger: { background: c.dangerSoft, foreground: c.danger },
    info: { background: c.blueSoft, foreground: c.blue },
  }[tone];

  return (
    <View style={[styles.badge, { backgroundColor: background, flexDirection: rowDirection(isRTL) }]}>
      {icon ? <Icon name={icon} size={12} color={foreground} /> : null}
      <Text style={[styles.label, { color: foreground }]} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  label: { ...Typography.micro, fontWeight: '600' },
});
