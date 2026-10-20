import { StyleSheet, Text, View } from 'react-native';

import { Radius, Spacing, Typography } from '@/constants/brand';
import { useTheme } from '@/theme';
import { Icon, type IconName } from '../icon';
import { Button } from './button';

/**
 * Empty state.
 *
 * A neutral icon well, a short title and an optional explanatory line and
 * action. Used wherever a list, record or result set can legitimately be empty,
 * so "nothing here" never looks like a failed load.
 */
export function EmptyState({
  icon = 'inbox-outline',
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  const c = theme.colors;

  return (
    <View style={styles.wrap}>
      <View style={[styles.well, { backgroundColor: c.primarySurface }]}>
        <Icon name={icon} size={theme.iconSize.xl} color={c.primary} />
      </View>
      <Text style={[styles.title, { color: c.text }]}>{title}</Text>
      {description ? (
        <Text style={[styles.description, { color: c.textMuted }]}>{description}</Text>
      ) : null}
      {actionLabel && onAction ? (
        <View style={styles.action}>
          <Button label={actionLabel} variant="secondary" size="sm" onPress={onAction} />
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { alignItems: 'center', paddingVertical: Spacing.xl, gap: Spacing.sm },
  well: {
    width: 64,
    height: 64,
    borderRadius: Radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  title: { ...Typography.cardTitle, textAlign: 'center' },
  description: {
    ...Typography.secondary,
    textAlign: 'center',
    paddingHorizontal: Spacing.lg,
  },
  action: { marginTop: Spacing.sm },
});
