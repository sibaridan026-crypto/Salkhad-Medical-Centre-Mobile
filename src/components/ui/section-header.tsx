import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Spacing, textAlignment, rowDirection, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';

/**
 * Section heading with an optional "view all" style action on the trailing
 * side. The action is a real control only when `onAction` is supplied;
 * otherwise it is plain text, so a phase without navigation never shows a
 * button that does nothing.
 */
export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  const theme = useTheme();
  const { isRTL } = useLanguage();
  const c = theme.colors;

  return (
    <View style={[styles.row, { flexDirection: rowDirection(isRTL) }]}>
      <Text
        style={[styles.title, { color: c.text, textAlign: textAlignment(isRTL) }]}
        numberOfLines={1}
      >
        {title}
      </Text>

      {action ? (
        onAction ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={action}
            onPress={onAction}
            hitSlop={8}
          >
            <Text style={[styles.action, { color: c.primary }]}>{action}</Text>
          </Pressable>
        ) : (
          <Text style={[styles.action, { color: c.primary }]}>{action}</Text>
        )
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.sm },
  title: { ...Typography.sectionTitle, flexShrink: 1 },
  action: { ...Typography.micro, fontWeight: '600' },
});
