import { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppBackground } from '@/components/app-background';
import { AppHeader } from '@/components/app-header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button, Card, EmptyState, InlineAlert, LoadingView, TextField } from '@/components/ui';
import { Colors, Spacing, Typography } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { listDoctorAppointments, updateAppointmentStatus, type AppointmentErrorCode } from '@/services/appointments';

type AppointmentUi = {
  id: string;
  patient: string;
  phone: string | null;
  date: string;
  time: string;
  specialty: string | null;
  status: string;
  rejectionReason: string | null;
};

export default function DoctorHome() {
  const theme = useTheme();
  const { t, lang, isRTL } = useLanguage();
  const ar = lang === 'ar';
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [followup, setFollowup] = useState('');

  const [items, setItems] = useState<AppointmentUi[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await listDoctorAppointments();
        if (cancelled) return;
        setItems(loaded.map((a) => ({
          id: a.id,
          patient: a.patientName ?? t('unknownLabel'),
          phone: a.patientPhone ?? null,
          date: a.date,
          time: a.timeFrom,
          specialty: a.specialtyName ?? a.specialtyNameAr ?? null,
          status: a.status,
          rejectionReason: a.rejectionReason,
        })));
        setFailed(false);
      } catch {
        if (cancelled) return;
        setFailed(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const retry = () => {
    setLoading(true);
    setFailed(false);
    setReloadKey((key) => key + 1);
  };

  const active = items?.find((a) => a.id === selectedId) ?? null;

  const statusLabel = (status: string) => {
    if (ar) {
      if (status === 'upcoming') return t('statusUpcoming');
      if (status === 'previous') return t('statusPrevious');
      if (status === 'cancelled') return t('statusCancelled');
      return t('statusRejected');
    }
    if (status === 'upcoming') return 'Upcoming';
    if (status === 'previous') return 'Previous';
    if (status === 'cancelled') return 'Cancelled';
    return 'Rejected';
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!active) return;
    const result = await updateAppointmentStatus(active.id, newStatus);
    if (!result.ok) {
      // Silent fail — UI reflects server state on next reload
      return;
    }
    setReloadKey((key) => key + 1);
    setSelectedId(null);
  };

  return (
    <AppBackground edges={[]}>
      <SafeAreaView style={styles.top} edges={['top', 'left', 'right']}>
        <AppHeader showProfile onProfile={() => {}} />
        <ScrollView contentContainerStyle={styles.body}>
          <Text style={[styles.title, { color: '#1F1A3A' }]}>
            {ar ? 'د. أحمد الصלחاد' : 'Dr. Ahmad Al-Salkhad'}
          </Text>
          <Text style={[styles.subtitle, { color: theme.colors.textSecondary }]}>
            {t('doctorHomeTitle')}
          </Text>

          {loading && !failed ? (
            <LoadingView label={t('loading')} />
          ) : null}

          {failed ? (
            <View style={styles.stateBlock}>
              <InlineAlert variant="danger" title={t('backendPending')} />
              <Button label={t('retry')} variant="secondary" onPress={retry} />
            </View>
          ) : null}

          {!loading &&
            items !== null &&
            items.length === 0 ? (
            <EmptyState icon="calendar-blank-outline" title={t('noAppointments')} />
          ) : null}

          {!loading &&
            items?.map((a) => (
              <View key={a.id} style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={{ color: '#1F1A3A', fontWeight: '600' }}>{a.patient}</Text>
                  <Text style={{ color: theme.colors.textSecondary }}>{a.date} — {a.time}</Text>
                  {a.specialty ? (
                    <Text style={{ color: theme.colors.textMuted }}>{a.specialty}</Text>
                  ) : null}
                  <Text style={{ color: theme.colors.textMuted }}>
                    {t('doctorStatusShort')}: {statusLabel(a.status)}
                  </Text>
                </View>
                <Button label={t('doctorOpen')} size="sm" onPress={() => setSelectedId(a.id === selectedId ? null : a.id)} />
              </View>
            ))}

          {active ? (
            <Card>
              <Text style={[styles.sectionTitle, { color: '#1F1A3A', marginTop: Spacing.md }]}>
                {t('doctorAppointmentDetails')}
              </Text>
              <Text style={{ color: '#1F1A3A' }}>{t('doctorPatientLabel')}: {active.patient}</Text>
              <Text style={{ color: theme.colors.textSecondary }}>{t('doctorDateLabel')}: {active.date}</Text>
              <Text style={{ color: theme.colors.textSecondary }}>{t('doctorTimeLabel')}: {active.time}</Text>
              {active.specialty ? (
                <Text style={{ color: theme.colors.textSecondary }}>{t('doctorSpecialtyShort')}: {active.specialty}</Text>
              ) : null}
              <Text style={{ color: theme.colors.textMuted }}>{t('doctorStatusShort')}: {statusLabel(active.status)}</Text>

              <Text style={[styles.sectionTitle, { color: '#1F1A3A', marginTop: Spacing.md }]}>
                {t('doctorMedicalInfo')}
              </Text>
              <Text style={{ color: theme.colors.textMuted }}>{t('doctorDemoNotice')}</Text>

              <TextField label={t('doctorVisitNotes')} value={notes} onChangeText={(text) => setNotes(text)} multiline />
              <TextField label={t('doctorDiagnosis')} value={diagnosis} onChangeText={setDiagnosis} />
              <TextField label={t('doctorPrescription')} value={prescription} onChangeText={(text) => setPrescription(text)} multiline />
              <TextField label={t('doctorFollowup')} value={followup} onChangeText={setFollowup} />

              <View style={styles.buttonRow}>
                {active.status === 'upcoming' ? (
                  <Button
                    label={t('doctorAccept')}
                    variant="primary"
                    onPress={() => void handleStatusChange('Scheduled')}
                  />
                ) : null}
                {active.status === 'upcoming' || active.status === 'Scheduled' ? (
                  <Button
                    label={t('doctorReject')}
                    variant="ghost"
                    onPress={() => void handleStatusChange('Cancelled')}
                  />
                ) : null}
                {active.status === 'Scheduled' ? (
                  <Button
                    label={t('doctorMarkCompleted')}
                    variant="primary"
                    onPress={() => void handleStatusChange('Completed')}
                  />
                ) : null}
              </View>
            </Card>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

const styles = StyleSheet.create({
  top: { flex: 1 },
  body: { padding: Spacing.lg, gap: Spacing.lg },
  title: { ...Typography.title, fontWeight: '700' },
  subtitle: { ...Typography.secondary },
  sectionTitle: { ...Typography.subtitle, fontWeight: '700' },
  row: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm },
  buttonRow: { gap: Spacing.md, marginTop: Spacing.md },
  stateBlock: { gap: Spacing.md },
});
