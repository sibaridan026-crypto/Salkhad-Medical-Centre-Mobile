import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, textAlignment, rowDirection, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { Icon } from '../icon';

/**
 * Generic list row.
 *
 * The workhorse for every tappable list in the app: a leading slot (avatar or
 * icon well), a title/subtitle block that truncates rather than pushes the row
 * wide, and a trailing slot. When `onPress` is provided and no trailing content
 * is given, a direction-aware chevron is shown — so the affordance never
 * contradicts the reading direction.
 */
export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  onPress,
  last = false,
  danger = false,
}: {
  title: string;
  subtitle?: string;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  onPress?: () => void;
  /** Hides the bottom divider — set on the final row of a group. */
  last?: boolean;
  danger?: boolean;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;
  const interactive = Boolean(onPress);
  const showChevron = interactive && trailing === undefined;

  const body = (
    <View style={[styles.row, { flexDirection: rowDirection(isRTL) }]}>
      {leading ? <View style={styles.leading}>{leading}</View> : null}

      <View style={styles.textWrap}>
        <Text
          style={[styles.title, { color: danger ? c.danger : c.text, textAlign: textAlignment(isRTL) }]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {subtitle ? (
          <Text
            style={[styles.subtitle, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        ) : null}
      </View>

      {trailing !== undefined ? (
        <View style={styles.trailing}>{trailing}</View>
      ) : showChevron ? (
        <Icon
          name={isRTL ? 'chevron-left' : 'chevron-right'}
          size={theme.iconSize.sm}
          color={c.textMuted}
        />
      ) : null}
    </View>
  );

  return (
    <View>
      {interactive ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={title}
          onPress={onPress}
          style={({ pressed }) => [pressed && { backgroundColor: c.lavender }]}
        >
          {body}
        </Pressable>
      ) : (
        body
      )}
      {!last ? <View style={[styles.divider, { backgroundColor: c.border }]} /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    alignItems: 'center',
    gap: Spacing.md,
    paddingVertical: Spacing.md,
    minHeight: 56,
  },
  leading: { flexShrink: 0 },
  textWrap: { flex: 1, minWidth: 0, gap: 2 },
  trailing: { flexShrink: 0 },
  title: { ...Typography.bodyStrong },
  subtitle: { ...Typography.caption },
  divider: { height: StyleSheet.hairlineWidth, width: '100%' },
});
