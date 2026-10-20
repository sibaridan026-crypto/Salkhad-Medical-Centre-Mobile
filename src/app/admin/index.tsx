import { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppBackground } from '@/components/app-background';
import { AppHeader } from '@/components/app-header';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Badge, Button, Card, EmptyState, InlineAlert, LoadingView, TextField } from '@/components/ui';
import { Colors, Spacing, Typography, rowDirection, textAlignment } from '@/constants/brand';
import { useLanguage } from '@/i18n/language-context';
import { useTheme } from '@/theme';
import { listAllAppointments, updateAppointmentStatus, type AppointmentErrorCode } from '@/services/appointments';

type AppointmentUi = {
  id: string;
  patient: string;
  phone: string | null;
  date: string;
  specialty: string | null;
  status: string;
  rejectionReason: string | null;
};

export default function AdminHome() {
  const theme = useTheme();
  const { t, lang, isRTL } = useLanguage();
  const ar = lang === 'ar';
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Scheduled' | 'Rejected' | 'Completed'>('All');

  const [items, setItems] = useState<AppointmentUi[] | null>(null);
  const [failed, setFailed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const loaded = await listAllAppointments();
        if (cancelled) return;
        setItems(
          loaded.map((a) => ({
            id: a.id,
            patient: a.patientName ?? t('unknownLabel'),
            phone: a.patientPhone ?? null,
            date: a.date,
            specialty: a.specialtyName ?? a.specialtyNameAr ?? null,
            status: a.status,
            rejectionReason: a.rejectionReason,
          })),
        );
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

  const statusLabel = (status: string) => {
    if (!ar) return status;
    if (status === 'Pending') return 'قيد الانتظار';
    if (status === 'Scheduled') return 'مجدولة';
    if (status === 'Completed') return 'مكتملة';
    if (status === 'Cancelled') return 'ملغاة';
    if (status === 'NoShow') return 'لم يحضر';
    return status;
  };

  const statusTone = (status: string) => {
    if (status === 'Cancelled' || status === 'Rejected') return 'danger';
    if (status === 'Completed') return 'success';
    if (status === 'Scheduled') return 'info';
    return 'warning';
  };

  const handleAccept = async (id: string) => {
    const result = await updateAppointmentStatus(id, 'Scheduled');
    if (!result.ok) return;
    setReloadKey((key) => key + 1);
  };

  const handleReject = async (id: string) => {
    const result = await updateAppointmentStatus(id, 'Cancelled');
    if (!result.ok) return;
    setReloadKey((key) => key + 1);
  };

  const filtered = useMemo(() => {
    if (!items) return [];
    const needle = query.trim().toLowerCase();
    return items.filter((r) => {
      const matchesFilter = filter === 'All' || r.status === filter;
      const matchesSearch =
        !needle ||
        r.patient.toLowerCase().includes(needle) ||
        (r.phone && r.phone.includes(needle));
      return matchesFilter && matchesSearch;
    });
  }, [items, query, filter]);

  const pendingCount = items?.filter((r) => r.status === 'Pending').length ?? 0;
  const acceptedCount = items?.filter((r) => r.status === 'Scheduled' || r.status === 'Accepted').length ?? 0;
  const rejectedCount = items?.filter((r) => r.status === 'Cancelled' || r.status === 'Rejected').length ?? 0;
  const todayCount = items?.length ?? 0;

  return (
    <AppBackground edges={[]}>
      <SafeAreaView style={styles.top} edges={['top', 'left', 'right']}>
        <AppHeader showProfile onProfile={() => {}} />
        <ScrollView contentContainerStyle={styles.body}>
          {loading && !failed ? (
            <LoadingView label={t('loading')} />
          ) : null}

          {failed ? (
            <View style={styles.stateBlock}>
              <InlineAlert variant="danger" title={t('backendPending')} />
              <Button label={t('retry')} variant="secondary" onPress={retry} />
            </View>
          ) : null}

          <View style={[styles.titleBlock, { flexDirection: rowDirection(isRTL) }]}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.title, { color: '#1F1A3A', textAlign: textAlignment(isRTL) }]}>
                {ar ? 'لوحة الإدارة' : 'Admin Dashboard'}
              </Text>
              <Text style={[styles.subtitle, { color: theme.colors.textSecondary, textAlign: textAlignment(isRTL) }]}>
                {ar ? 'مجمع صلخد الطبي — إدارة المواعيد' : 'Salkhad Medical Centre — Appointments'}
              </Text>
            </View>
          </View>

          <View style={[styles.summaryGrid, { flexDirection: rowDirection(isRTL) }]}>
            <SummaryCard label={ar ? 'الطلبات المعلقة' : 'Pending Requests'} value={pendingCount} color={Colors.primary} />
            <SummaryCard label={ar ? 'المقبولة' : 'Accepted'} value={acceptedCount} color={Colors.blue} />
            <SummaryCard label={ar ? 'المرفوضة' : 'Rejected'} value={rejectedCount} color={Colors.textMuted} />
            <SummaryCard label={ar ? 'إجمالي اليوم' : "Today's Total"} value={todayCount} color={Colors.teal} />
          </View>

          <Card>
            <Text style={[styles.section, { color: '#1F1A3A', textAlign: textAlignment(isRTL) }]}>
              {ar ? 'طلبات المواعيد' : 'Appointment Requests'}
            </Text>
            <View style={[styles.filterRow, { flexDirection: rowDirection(isRTL) }]}>
              {(['All', 'Pending', 'Scheduled', 'Rejected', 'Completed'] as const).map((f) => (
                <Button
                  key={f}
                  label={f === 'All' ? (ar ? 'الكل' : 'All') : f}
                  size="sm"
                  variant={filter === f ? 'primary' : 'ghost'}
                  onPress={() => setFilter(f)}
                />
              ))}
            </View>

            {filtered.length === 0 ? (
              <EmptyState title={ar ? 'لا توجد طلبات' : 'No requests'} description={ar ? 'لا توجد طلبات في هذه الفئة.' : 'No requests in this category.'} />
            ) : (
              filtered.map((r) => (
                <View key={r.id} style={[styles.requestCard, { flexDirection: rowDirection(isRTL) }]}>
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: '#1F1A3A', fontWeight: '600', textAlign: textAlignment(isRTL) }}>{r.patient}</Text>
                    <Text style={{ color: theme.colors.textSecondary, textAlign: textAlignment(isRTL) }}>{r.date}</Text>
                    {r.specialty ? (
                      <Text style={{ color: theme.colors.textMuted, textAlign: textAlignment(isRTL) }}>{r.specialty}</Text>
                    ) : null}
                    <View style={{ marginTop: 4 }}>
                      <Badge label={statusLabel(r.status)} tone={statusTone(r.status)} />
                    </View>
                  </View>
                  <View style={{ gap: 6 }}>
                    {r.status === 'Pending' ? (
                      <>
                        <Button label={ar ? 'قبول' : 'Accept'} size="sm" onPress={() => void handleAccept(r.id)} />
                        <Button label={ar ? 'رفض' : 'Reject'} size="sm" variant="ghost" onPress={() => void handleReject(r.id)} />
                      </>
                    ) : null}
                  </View>
                </View>
              ))
            )}
          </Card>

          <Card>
            <Text style={[styles.section, { color: '#1F1A3A', textAlign: textAlignment(isRTL) }]}>
              {ar ? 'البحث الأساسي عن المرضى' : 'Basic Patient Lookup'}
            </Text>
            <TextField label={ar ? 'بحث بالاسم أو الهاتف' : 'Search by name or phone'} value={query} onChangeText={setQuery} />
            <Text style={{ color: theme.colors.textMuted, fontSize: 12, textAlign: textAlignment(isRTL) }}>
              {ar ? 'يُعرض تحديد الهوية الأساسية فقط؛ لا توجد سجلات طبية.' : 'Only basic identification shown; no medical records.'}
            </Text>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </AppBackground>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.summaryCard}>
      <Text style={[styles.summaryValue, { color }]}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  top: { flex: 1 },
  body: { padding: Spacing.lg, gap: Spacing.lg },
  titleBlock: { alignItems: 'center', gap: Spacing.sm },
  title: { ...Typography.title, fontWeight: '700' },
  subtitle: { ...Typography.secondary },
  summaryGrid: { flexWrap: 'wrap', gap: Spacing.sm },
  summaryCard: { flex: 1, minWidth: 140, borderRadius: 16, borderWidth: 1, borderColor: Colors.lavenderBorder, backgroundColor: Colors.surface, padding: Spacing.md, gap: 4 },
  summaryValue: { ...Typography.title, fontWeight: '700' },
  summaryLabel: { ...Typography.caption, color: Colors.textSecondary },
  section: { ...Typography.subtitle, fontWeight: '700' },
  filterRow: { flexWrap: 'wrap', gap: 6, marginVertical: Spacing.sm },
  requestCard: { alignItems: 'center', gap: Spacing.md, paddingVertical: Spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: Colors.lavenderBorder },
  stateBlock: { gap: Spacing.md },
});
