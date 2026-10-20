import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography, rowDirection } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { Icon, type IconName } from '../icon';

export type AlertVariant = 'info' | 'success' | 'warning' | 'danger';

const ICONS: Record<AlertVariant, IconName> = {
  info: 'information-outline',
  success: 'check-circle-outline',
  warning: 'alert-outline',
  danger: 'alert-circle-outline',
};

/**
 * Inline alert / notice.
 *
 * For validation summaries, booking outcomes and permission notices that must
 * stay in the flow rather than interrupt it. Colour and icon both come from the
 * variant, so the message is never colour-only.
 */
export function InlineAlert({
  variant = 'info',
  title,
  description,
}: {
  variant?: AlertVariant;
  title: string;
  description?: string;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;

  const { background, foreground } = {
    info: { background: c.blueSoft, foreground: c.blue },
    success: { background: c.successSoft, foreground: c.success },
    warning: { background: c.warningSoft, foreground: c.warning },
    danger: { background: c.dangerSoft, foreground: c.danger },
  }[variant];

  return (
    <View style={[styles.wrap, { backgroundColor: background, flexDirection: rowDirection(isRTL) }]}>
      <Icon name={ICONS[variant]} size={theme.iconSize.md} color={foreground} />
      <View style={styles.textWrap}>
        <Text style={[styles.title, { color: c.text }]}>{title}</Text>
        {description ? (
          <Text style={[styles.description, { color: c.textSecondary }]}>{description}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'flex-start',
    gap: Spacing.sm,
    borderRadius: Radius.md,
    padding: Spacing.md,
  },
  textWrap: { flex: 1, minWidth: 0, gap: 2 },
  title: { ...Typography.bodyStrong },
  description: { ...Typography.caption },
});
