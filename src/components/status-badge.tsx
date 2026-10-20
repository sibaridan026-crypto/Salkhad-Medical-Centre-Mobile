import { StyleSheet, Text, View } from 'react-native';

import { Colors, Radius, Spacing, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';

/** Appointment statuses the app can actually render. */
export type StatusKind = 'upcoming' | 'previous' | 'cancelled' | 'rejected';

/**
 * Reusable status badge.
 *
 * Status colours are deliberately soft and are never allowed to act as brand
 * colours: amber for a request that is still waiting, lavender for a past entry,
 * cool grey for an inert state, and red only for a rejected one.
 */
const STATUS_STYLE: Record<StatusKind, { background: string; text: string }> = {
  upcoming: { background: Colors.warningSoft, text: Colors.warning },
  previous: { background: Colors.lavender, text: Colors.textSecondary },
  cancelled: { background: Colors.coolGray, text: Colors.textMuted },
  rejected: { background: Colors.dangerSoft, text: Colors.danger },
};

const STATUS_KEY = {
  upcoming: 'statusUpcoming',
  previous: 'statusPrevious',
  cancelled: 'statusCancelled',
  rejected: 'statusRejected',
} as const;

export function StatusBadge({ status, label }: { status: StatusKind; label?: string }) {
  const { t } = useLanguage();
  const tone = STATUS_STYLE[status];

  return (
    <View style={[styles.badge, { backgroundColor: tone.background }]}>
      <View style={[styles.dot, { backgroundColor: tone.text }]} />
      <Text style={[styles.label, { color: tone.text }]} numberOfLines={1}>
        {label ?? t(STATUS_KEY[status])}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    ...Typography.micro,
  },
});
