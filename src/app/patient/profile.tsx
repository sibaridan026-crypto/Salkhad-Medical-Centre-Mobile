import { useRouter } from 'expo-router';
import { useMemo, useState } from 'react';
import { Linking, ScrollView, StyleSheet, Text, View } from 'react-native';

import { PatientScreen } from '@/components/patient/patient-screen';
import { Button, Card, Dialog, Divider, ListRow, SectionHeader } from '@/components/ui';
import { Language, Spacing, Typography, rowDirection, textAlignment } from '@/constants/brand';
import { CONTACT_DETAILS } from '@/data/contact';
import { answeredCount } from '@/services/health-profile';
import { useLanguage } from '@/i18n/language-context';
import { useAuth } from '@/state/auth-context';
import { useTheme } from '@/theme';

/**
 * Patient profile.
 *
 * ACCOUNT INFORMATION ONLY. Name, phone, email, date of birth and sex. No
 * medical information lives here — the patient-edited health information is on
 * the separate health-profile screen, and clinician-authored records are on the
 * medical-record screens. The three domains never share a form.
 */
export default function ProfileScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { t, lang, isRTL, toggle } = useLanguage();
  const { isAuthenticated, user, profile, signOut } = useAuth();
  const [confirmSignOut, setConfirmSignOut] = useState(false);

  const align = { textAlign: textAlignment(isRTL) } as const;
  const c = theme.colors;

  const answered = useMemo(() => (profile ? answeredCount(profile) : 0), [profile]);

  if (!isAuthenticated || !user) return null;

  const openLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) await Linking.openURL(url);
  };

  const contactRows = [
    {
      key: 'landline',
      title: t('contactLandline'),
      subtitle: CONTACT_DETAILS.landline,
      actionTitle: t('callCentre'),
      onAction: () => openLink(`tel:${CONTACT_DETAILS.landline}`),
    },
    {
      key: 'mobile',
      title: t('contactMobile'),
      subtitle: CONTACT_DETAILS.mobile,
      actionTitle: t('callCentre'),
      onAction: () => openLink(`tel:${CONTACT_DETAILS.mobile}`),
    },
    {
      key: 'whatsapp',
      title: t('contactWhatsapp'),
      subtitle: CONTACT_DETAILS.whatsapp,
      actionTitle: t('whatsappCentre'),
      onAction: () =>
        openLink(`https://wa.me/${CONTACT_DETAILS.whatsappInternational}`),
    },
  ];

  return (
    <PatientScreen activeTab="profile">
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={styles.account}>
          <View style={[styles.accountRow, { flexDirection: rowDirection(isRTL) }]}>
            <View style={[styles.avatar, { backgroundColor: c.primarySurface }]}>
              <Text style={[styles.avatarText, { color: c.primary }]}>
                {user.fullName.trim().charAt(0) || '?'}
              </Text>
            </View>
            <View style={styles.accountMeta}>
              <Text style={[styles.name, align, { color: c.text }]} numberOfLines={1}>
                {user.fullName}
              </Text>
              <Text style={[styles.phone, align, { color: c.textMuted }]} numberOfLines={1}>
                {user.phone}
              </Text>
            </View>
          </View>
          <Text style={[styles.accountHint, align, { color: c.textSecondary }]}>
            {t('profileAccountHint')}
          </Text>
          <Button
            label={t('profileEditAccount')}
            variant="secondary"
            size="sm"
            icon="account-edit-outline"
            fullWidth
            onPress={() => router.push('/patient/profile/edit')}
          />
        </Card>

        <SectionHeader title={t('healthProfileTitle')} />
        <Card style={styles.sectionCard}>
          <Text style={[styles.rowValue, align, { color: c.text }]}>
            {profile && answered > 0
              ? t('profileHealthSummary').replace('{count}', String(answered))
              : t('profileHealthEmpty')}
          </Text>
          <Text style={[styles.caption, align, { color: c.textMuted }]}>
            {t('healthProfileSubtitle')}
          </Text>
          <Button
            label={
              profile && answered > 0 ? t('profileHealthEdit') : t('profileHealthFill')
            }
            variant="secondary"
            size="sm"
            icon="clipboard-pulse-outline"
            fullWidth
            onPress={() => router.push('/patient/health-profile')}
          />
        </Card>

        <SectionHeader title={t('profileContactTitle')} />
        <Card style={styles.sectionCard}>
          {contactRows.map((row, index) => (
            <View key={row.key}>
              {index > 0 ? <Divider /> : null}
              <ListRow
                title={row.title}
                subtitle={row.subtitle}
                trailing={
                  <Button
                    label={row.actionTitle}
                    variant="ghost"
                    size="sm"
                    onPress={row.onAction}
                  />
                }
              />
            </View>
          ))}
          <Divider />
          <View style={styles.row}>
            <Text style={[styles.rowLabel, align, { color: c.textMuted }]}>
              {t('contactAddress')}
            </Text>
            <Text style={[styles.rowValue, align, { color: c.text }]}>
              {isRTL ? CONTACT_DETAILS.address.ar : CONTACT_DETAILS.address.en}
            </Text>
          </View>
        </Card>

        <SectionHeader title={t('profileLanguageTitle')} />
        <Card style={styles.sectionCard}>
          <View style={[styles.row, styles.rowBetween, { flexDirection: rowDirection(isRTL) }]}>
            <Text style={[styles.rowValue, align, { color: c.text }]}>
              {lang === Language.ar ? 'العربية' : 'English'}
            </Text>
            <Button
              label={lang === Language.ar ? 'English' : 'العربية'}
              variant="secondary"
              size="sm"
              icon="translate"
              onPress={toggle}
            />
          </View>
        </Card>

        <SectionHeader title={t('profileAboutTitle')} />
        <Card style={styles.sectionCard}>
          <Text style={[styles.about, align, { color: c.textSecondary }]}>
            {t('profileAboutBody')}
          </Text>
        </Card>

        <Button
          label={t('signOut')}
          variant="danger"
          fullWidth
          icon="logout"
          onPress={() => setConfirmSignOut(true)}
        />
      </ScrollView>

      <Dialog
        visible={confirmSignOut}
        onClose={() => setConfirmSignOut(false)}
        title={t('signOutConfirmTitle')}
        description={t('signOutConfirmBody')}
        confirmLabel={t('signOut')}
        confirmVariant="danger"
        cancelLabel={t('cancel')}
        onConfirm={() => {
          setConfirmSignOut(false);
          void (async () => {
            await signOut();
            router.replace('/');
          })();
        }}
      />
    </PatientScreen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  account: { gap: Spacing.md },
  accountRow: { alignItems: 'center', gap: Spacing.md },
  avatar: { width: 56, height: 56, borderRadius: 999, alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...Typography.sectionTitle },
  accountMeta: { flex: 1, minWidth: 0, gap: 2 },
  name: { ...Typography.sectionTitle },
  phone: { ...Typography.caption },
  accountHint: { ...Typography.caption },
  sectionCard: { gap: Spacing.md },
  row: { gap: 2 },
  rowBetween: { alignItems: 'center', justifyContent: 'space-between', gap: Spacing.md },
  rowLabel: { ...Typography.caption, fontWeight: '600' },
  rowValue: { ...Typography.body },
  caption: { ...Typography.caption },
  about: { ...Typography.secondary },
});
