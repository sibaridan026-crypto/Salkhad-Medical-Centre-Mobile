import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Radius, Spacing, Typography } from '@/constants/brand';
import { useTheme } from '@/theme';

/**
 * Bottom sheet.
 *
 * Presentation only: a scrim, a rounded sheet rising from the bottom, a grabber
 * and a title, with the system-navigation inset applied so content never sits
 * under the Android navigation bar. No business logic lives here — screens pass
 * their content in.
 */
export function BottomSheet({
  visible,
  onClose,
  title,
  children,
}: {
  visible: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const c = theme.colors;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.fill}>
        <Pressable
          accessibilityLabel="Close"
          style={[styles.scrim, { backgroundColor: 'rgba(46, 31, 82, 0.5)' }]}
          onPress={onClose}
        />
        <View
          style={[
            styles.sheet,
            { backgroundColor: c.surface, paddingBottom: Spacing.xl + insets.bottom },
          ]}
        >
          <View style={[styles.grabber, { backgroundColor: c.borderStrong }]} />
          {title ? <Text style={[styles.title, { color: c.text }]}>{title}</Text> : null}
          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.content}>
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, justifyContent: 'flex-end' },
  scrim: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 },
  sheet: {
    borderTopLeftRadius: Radius.xl,
    borderTopRightRadius: Radius.xl,
    paddingTop: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    maxHeight: '85%',
  },
  grabber: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: Radius.pill,
    marginBottom: Spacing.md,
  },
  title: { ...Typography.sectionTitle, marginBottom: Spacing.sm },
  content: { paddingBottom: Spacing.sm },
});
