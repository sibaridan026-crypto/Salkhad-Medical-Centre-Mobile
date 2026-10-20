import { useRouter, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { AppBackground } from '@/components/app-background';
import { DoctorCard } from '@/components/doctor-card';
import { Icon, type IconName } from '@/components/icon';
import { DetailHeader } from '@/components/patient/detail-header';
import {
  Badge,
  Button,
  Card,
  Chip,
  DayPicker,
  Dialog,
  Divider,
  EmptyState,
  InlineAlert,
  LoadingView,
  ProgressSteps,
  TextField,
  TimeSlotGrid,
  type DayOption,
  type TimeSlot,
} from '@/components/ui';
import {
  LanguageCode,
  Radius,
  Spacing,
  Typography,
  rowDirection,
  textAlignment,
} from '@/constants/brand';
import { DAY_LABELS } from '@/data/days';
import { DOCTOR_PHOTOS } from '@/data/doctor-photos';
import { SPECIALTIES } from '@/data/specialties';
import { SPECIALTY_IMAGES } from '@/data/specialty-visuals';
import type { Appointment, AppointmentStatus } from '@/data/types';
import { useLanguage } from '@/i18n/language-context';
import { dayOfIso, endOf, timeOptions, upcomingDates } from '@/lib/booking';
import {
  DOCTOR_COUNT_BY_SPECIALTY,
  doctorDisplayName,
  doctorsBySpecialty,
  getDoctor,
  getSpecialty,
  localize,
} from '@/lib/doctor';
import { cancelAppointment, createAppointmentRequest, listAppointments } from '@/services/appointments';
import { getBackendDoctorId, getLocalDoctorId } from '@/services/doctors';
import { useTheme } from '@/theme';

/**
 * My Appointments — ONE combined screen.
 *
 * It holds both halves of the journey on purpose:
 *   A. the appointment list (upcoming / previous / cancelled / rejected), and
 *   B. an inline booking request flow (specialty → doctor → day → time →
 *      review → submit → confirmation).
 *
 * There is deliberately no separate booking route and no second list: this file
 * is the single entry point for viewing appointments and for creating a
 * request, so no booking logic exists in two places.
 *
 * Honesty rules enforced here:
 *   - Demo records are badged as demo data; requests the patient makes are
 *     badged as stored on this device only.
 *   - A successful save is described as a local request, never as an appointment
 *     confirmed by the centre.
 *   - Time options are derived from the supplied weekly schedule and are
 *     labelled as unverified availability.
 */

type TabKey = 'upcoming' | 'previous' | 'cancelled' | 'rejected';

type Mode = 'list' | 'flow' | 'done';

interface Draft {
  specialtyId: string | null;
  doctorId: string | null;
  /** ISO `YYYY-MM-DD`. */
  day: string | null;
  /** `HH:MM`. */
  time: string | null;
  notes: string;
}

const EMPTY_DRAFT: Draft = {
  specialtyId: null,
  doctorId: null,
  day: null,
  time: null,
  notes: '',
};

interface TabDef {
  readonly key: TabKey;
  readonly status: AppointmentStatus;
  readonly label: 'tabUpcoming' | 'tabPrevious' | 'tabCancelled' | 'tabRejected';
  readonly emptyTitle:
    | 'emptyUpcomingTitle'
    | 'emptyPreviousTitle'
    | 'emptyCancelledTitle'
    | 'emptyRejectedTitle';
  readonly emptyBody:
    | 'emptyUpcomingBody'
    | 'emptyPreviousBody'
    | 'emptyCancelledBody'
    | 'emptyRejectedBody';
}

const TABS: readonly TabDef[] = [
  {
    key: 'upcoming',
    status: 'upcoming',
    label: 'tabUpcoming',
    emptyTitle: 'emptyUpcomingTitle',
    emptyBody: 'emptyUpcomingBody',
  },
  {
    key: 'previous',
    status: 'previous',
    label: 'tabPrevious',
    emptyTitle: 'emptyPreviousTitle',
    emptyBody: 'emptyPreviousBody',
  },
  {
    key: 'cancelled',
    status: 'cancelled',
    label: 'tabCancelled',
    emptyTitle: 'emptyCancelledTitle',
    emptyBody: 'emptyCancelledBody',
  },
  {
    key: 'rejected',
    status: 'rejected',
    label: 'tabRejected',
    emptyTitle: 'emptyRejectedTitle',
    emptyBody: 'emptyRejectedBody',
  },
];

/** The seeded demo rejection reason is a code, not a sentence the patient reads. */
const DEMO_REJECTION_CODE = 'demo-no-reason';

/** Seeds the booking flow from a doctor deep link, if the id resolves. */
function initialDraft(doctorId?: string): Draft {
  const doctor = doctorId ? getDoctor(doctorId) : undefined;
  if (!doctor) return EMPTY_DRAFT;
  return {
    specialtyId: doctor.specialtyId,
    doctorId: doctor.id,
    day: null,
    time: null,
    notes: '',
  };
}

/** Mirrors the draft's completeness, so the UI can never show a wrong step. */
function stepFor(draft: Draft): number {
  if (!draft.specialtyId) return 0;
  if (!draft.doctorId) return 1;
  if (!draft.day) return 2;
  if (!draft.time) return 3;
  return 4;
}

const BOOKING_STEPS = [
  'bookStepSpecialty',
  'bookStepDoctor',
  'bookStepDay',
  'bookStepTime',
  'bookStepReview',
] as const;

export default function AppointmentsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ doctor?: string; book?: string }>();
  const { t, lang, isRTL } = useLanguage();
  const theme = useTheme();

  const [items, setItems] = useState<Appointment[] | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const [tab, setTab] = useState<TabKey>('upcoming');

  // Opened from a doctor card: the draft starts with that doctor preselected so
  // the flow begins at the day step. Opened from the home booking banner: the
  // flow starts at the first step. Both are derived during the first render, so
  // no effect is needed to seed them.
  const [draft, setDraft] = useState<Draft>(() => initialDraft(params.doctor));
  const [mode, setMode] = useState<Mode>(() =>
    params.doctor || params.book ? 'flow' : 'list',
  );

  const [created, setCreated] = useState<Appointment | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [pendingCancel, setPendingCancel] = useState<Appointment | null>(null);
  const [cancelError, setCancelError] = useState(false);

  const align = { textAlign: textAlignment(isRTL) } as const;

  useEffect(() => {
    let cancelled = false;
    // State is only assigned after the await, so the effect body itself never
    // triggers a render.
    void (async () => {
      try {
        const loaded = await listAppointments();
        if (cancelled) return;
        setItems(loaded);
        setLoadError(false);
      } catch {
        if (cancelled) return;
        setLoadError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [reloadKey]);

  const doctor = draft.doctorId ? getDoctor(draft.doctorId) : undefined;
  const specialty = draft.specialtyId ? getSpecialty(draft.specialtyId) : undefined;

  const dates = useMemo(
    () => (doctor ? upcomingDates(doctor.schedule, new Date(), 6) : []),
    [doctor],
  );

  /** Times that already have a device-local request for the chosen doctor/day. */
  const taken = useMemo(() => {
    const set = new Set<string>();
    for (const item of items ?? []) {
      if (!item.demo && item.doctorId === draft.doctorId && item.date === draft.day) {
        set.add(item.timeFrom);
      }
    }
    return set;
  }, [items, draft.doctorId, draft.day]);

  const times = useMemo(
    () => (doctor && draft.day ? timeOptions(doctor.schedule, draft.day, new Date()) : []),
    [doctor, draft.day],
  );

  const dayOptions: DayOption[] = dates.map((date) => ({
    value: date.iso,
    label: localize(DAY_LABELS[date.day], lang),
    sublabel: String(Number(date.iso.slice(8, 10))),
  }));

  const slotOptions: TimeSlot[] = times.map((time) => ({
    value: time.value,
    label: time.value,
    disabled: taken.has(time.value),
  }));

  const activeTab = TABS.find((entry) => entry.key === tab) ?? TABS[0];

  const visible = useMemo(
    () => (items ?? []).filter((item) => item.status === activeTab.status),
    [items, activeTab.status],
  );

  const step = stepFor(draft);

  const openFlow = () => {
    setDraft(EMPTY_DRAFT);
    setSubmitError(null);
    setMode('flow');
  };

  const openList = () => {
    setMode('list');
    setDraft(EMPTY_DRAFT);
    setSubmitError(null);
  };

  /** Discards only the last selection, so Back never wipes the whole draft. */
  const backInFlow = () => {
    setSubmitError(null);
    if (draft.time) {
      setDraft((prev) => ({ ...prev, time: null }));
      return;
    }
    if (draft.day) {
      setDraft((prev) => ({ ...prev, day: null, time: null }));
      return;
    }
    if (draft.doctorId) {
      setDraft((prev) => ({ ...prev, doctorId: null, day: null, time: null }));
      return;
    }
    if (draft.specialtyId) {
      setDraft((prev) => ({
        ...prev,
        specialtyId: null,
        doctorId: null,
        day: null,
        time: null,
      }));
      return;
    }
    openList();
  };

  const backToStep = (target: number) => {
    setSubmitError(null);
    setDraft((prev) => ({
      specialtyId: target > 0 ? prev.specialtyId : null,
      doctorId: target > 1 ? prev.doctorId : null,
      day: target > 2 ? prev.day : null,
      time: target > 3 ? prev.time : null,
      notes: prev.notes,
    }));
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitError(null);

    if (!doctor || !draft.specialtyId || !draft.day || !draft.time) {
      setSubmitError('invalid-slot');
      return;
    }

    // Resolve the backend GUID for the selected local doctor. If no confident
    // name match exists, refuse to book rather than sending a wrong ID.
    const backendDoctorId = getBackendDoctorId(doctor.id);
    if (!backendDoctorId) {
      setSubmitError('doctor_not_matched');
      return;
    }

    setSubmitting(true);
    const result = await createAppointmentRequest({
      doctorId: backendDoctorId,
      specialtyId: draft.specialtyId,
      date: draft.day,
      timeFrom: draft.time,
      timeTo: endOf(times, draft.time),
      notes: draft.notes,
    });
    setSubmitting(false);

    if (!result.ok) {
      setSubmitError(result.error);
      return;
    }

    // Refresh the list so the new request is visible immediately.
    setLoading(true);
    setReloadKey((key) => key + 1);
    setCreated(result.value);
    setTab('upcoming');
    setMode('done');
  };

  const confirmCancel = async () => {
    if (!pendingCancel) return;
    setCancelError(false);
    const result = await cancelAppointment(pendingCancel.id);
    setPendingCancel(null);
    if (!result.ok) {
      setCancelError(true);
      return;
    }
    setExpandedId(null);
    setLoading(true);
    setReloadKey((key) => key + 1);
  };

  const title = mode === 'flow' ? t('bookTitle') : t('appointmentsTitle');

  return (
    <AppBackground>
      <DetailHeader
        title={title}
        onBack={() => {
          if (mode === 'list') router.back();
          else if (mode === 'flow') backInFlow();
          else openList();
        }}
      />

      {mode === 'list' ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Button label={t('bookNew')} fullWidth icon="calendar-plus" onPress={openFlow} />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filters}
          >
            {TABS.map((entry) => (
              <Chip
                key={entry.key}
                label={t(entry.label)}
                selected={tab === entry.key}
                onPress={() => setTab(entry.key)}
              />
            ))}
          </ScrollView>

          {loading && !loadError ? <LoadingView label={t('loading')} /> : null}

        {loadError ? (
          <View style={styles.stateBlock}>
            <InlineAlert variant="danger" title={t('backendPending')} />
            <Button
              label={t('retry')}
              variant="secondary"
              onPress={() => {
                setLoading(true);
                setReloadKey((key) => key + 1);
              }}
            />
          </View>
        ) : null}

          {items !== null && !loading && visible.length === 0 ? (
            <EmptyState
              icon="calendar-blank-outline"
              title={t(activeTab.emptyTitle)}
              description={t(activeTab.emptyBody)}
            />
          ) : null}

          {!loading &&
            visible.map((item) => (
              <AppointmentCard
                key={item.id}
                appointment={item}
                expanded={expandedId === item.id}
                onToggle={() => setExpandedId((prev) => (prev === item.id ? null : item.id))}
                onCancel={() => {
                  setCancelError(false);
                  setPendingCancel(item);
                }}
              />
            ))}

          {cancelError ? (
            <InlineAlert variant="warning" title={t('cancelNotAllowed')} />
          ) : null}
        </ScrollView>
      ) : null}

      {mode === 'flow' ? (
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <ProgressSteps steps={BOOKING_STEPS.map((key) => t(key))} current={step} />

          <InlineAlert
            variant="info"
            title={t('bookSubtitle')}
            description={t('stepPreserved')}
          />

          {step === 0 ? (
            <View style={styles.stack}>
              <Text style={[styles.stepTitle, align]}>{t('bookChooseSpecialty')}</Text>
              {SPECIALTIES.map((item) => (
                <SpecialtyRow
                  key={item.id}
                  id={item.id}
                  name={localize(item.name, lang)}
                  count={DOCTOR_COUNT_BY_SPECIALTY.get(item.id) ?? 0}
                  countLabel={t('doctorsCount')}
                  rtl={isRTL}
                  onPress={() =>
                    setDraft((prev) => ({ ...prev, specialtyId: item.id, doctorId: null }))
                  }
                />
              ))}
            </View>
          ) : null}

          {step === 1 && specialty ? (
            <View style={styles.stack}>
              <SummaryRow
                label={t('bookSelectedSpecialty')}
                value={localize(specialty.name, lang)}
                actionLabel={t('bookChangeSpecialty')}
                onAction={() => backToStep(0)}
                rtl={isRTL}
              />
              <Text style={[styles.stepTitle, align]}>{t('bookChooseDoctor')}</Text>
              {doctorsBySpecialty(specialty.id).length === 0 ? (
                <EmptyState icon="account-search-outline" title={t('specialtyNoDoctors')} />
              ) : (
                doctorsBySpecialty(specialty.id).map((item) => (
                  <DoctorCard
                    key={item.id}
                    name={doctorDisplayName(item, lang)}
                    specialty={localize(specialty.name, lang)}
                    photo={DOCTOR_PHOTOS[item.id]}
                    onPress={() => setDraft((prev) => ({ ...prev, doctorId: item.id }))}
                  />
                ))
              )}
            </View>
          ) : null}

          {step === 2 && doctor ? (
            <View style={styles.stack}>
              <SummaryRow
                label={t('bookSelectedDoctor')}
                value={doctorDisplayName(doctor, lang)}
                actionLabel={t('bookChangeDoctor')}
                onAction={() => backToStep(1)}
                rtl={isRTL}
              />
              <Text style={[styles.stepTitle, align]}>{t('bookChooseDay')}</Text>
              {dates.length === 0 ? (
                <EmptyState icon="calendar-remove-outline" title={t('bookNoSlots')} />
              ) : (
                <DayPicker
                  days={dayOptions}
                  selected={draft.day}
                  onSelect={(value) =>
                    setDraft((prev) => ({ ...prev, day: value, time: null }))
                  }
                />
              )}
            </View>
          ) : null}

          {step === 3 ? (
            <View style={styles.stack}>
              <SummaryRow
                label={t('bookSelectedDoctor')}
                value={doctor ? doctorDisplayName(doctor, lang) : '—'}
                actionLabel={t('bookChangeDoctor')}
                onAction={() => backToStep(1)}
                rtl={isRTL}
              />
              <Text style={[styles.stepTitle, align]}>{t('bookChooseTime')}</Text>
              {slotOptions.length === 0 ? (
                <EmptyState icon="clock-outline" title={t('bookNoSlots')} />
              ) : (
                <TimeSlotGrid
                  slots={slotOptions}
                  selected={draft.time}
                  onSelect={(value) => setDraft((prev) => ({ ...prev, time: value }))}
                />
              )}
              <InlineAlert variant="info" title={t('bookSlotsNote')} />
            </View>
          ) : null}

          {step === 4 ? (
            <View style={styles.stack}>
              <Text style={[styles.stepTitle, align]}>{t('bookStepReview')}</Text>
              <Card style={styles.reviewCard}>
                <ReviewRow
                  label={t('bookReviewSpecialty')}
                  value={specialty ? localize(specialty.name, lang) : '—'}
                  onEdit={() => backToStep(0)}
                  rtl={isRTL}
                />
                <Divider />
                <ReviewRow
                  label={t('bookReviewDoctor')}
                  value={doctor ? doctorDisplayName(doctor, lang) : '—'}
                  onEdit={() => backToStep(1)}
                  rtl={isRTL}
                />
                <Divider />
                <ReviewRow
                  label={t('bookReviewDay')}
                  value={draft.day ? formatDay(draft.day, lang) : '—'}
                  onEdit={() => backToStep(2)}
                  rtl={isRTL}
                />
                <Divider />
                <ReviewRow
                  label={t('bookReviewTime')}
                  value={
                    draft.time ? `${draft.time} – ${endOf(times, draft.time) ?? '—'}` : '—'
                  }
                  onEdit={() => backToStep(3)}
                  rtl={isRTL}
                />
              </Card>

              <TextField
                label={t('bookReviewNotes')}
                placeholder={t('bookReviewNotesPlaceholder')}
                value={draft.notes}
                onChangeText={(notes) => setDraft((prev) => ({ ...prev, notes }))}
                multiline
              />

              <InlineAlert variant="warning" title={t('bookLocalWarning')} />

              {submitError === 'duplicate-request' ? (
                <InlineAlert variant="danger" title={t('bookDuplicate')} />
              ) : null}
              {submitError === 'invalid-slot' ? (
                <InlineAlert variant="danger" title={t('bookInvalidSlot')} />
              ) : null}
              {submitError === 'doctor_not_matched' ? (
                <InlineAlert variant="danger" title={t('doctorNotMatched')} />
              ) : null}

              <Button
                label={t('bookSubmit')}
                fullWidth
                loading={submitting}
                disabled={submitting}
                onPress={() => void submit()}
              />
              <Button
                label={t('cancel')}
                variant="ghost"
                fullWidth
                onPress={openList}
                disabled={submitting}
              />
            </View>
          ) : null}

          {step < 4 ? (
            <Button label={t('cancel')} variant="ghost" fullWidth onPress={openList} />
          ) : null}
        </ScrollView>
      ) : null}

      {mode === 'done' && created ? (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Card style={styles.doneCard}>
            <Icon name="check-circle-outline" size={44} color={theme.colors.success} />
            <Text style={[styles.doneTitle, align]}>{t('bookDoneTitle')}</Text>
            <Text style={[styles.doneBody, align]}>{t('bookDoneBody')}</Text>
            <View style={styles.doneMeta}>
              <Text style={[styles.doneMetaText, align]}>
                {`${formatDay(created.date, lang)} · ${created.timeFrom}`}
              </Text>
              <Text style={[styles.doneMetaText, align]}>
                {createdDoctorName(created, lang)}
              </Text>
            </View>
          </Card>

          <Button label={t('appointmentsTitle')} fullWidth onPress={openList} />
          <Button label={t('bookAnother')} variant="secondary" fullWidth onPress={openFlow} />
        </ScrollView>
      ) : null}

      <Dialog
        visible={pendingCancel !== null}
        onClose={() => setPendingCancel(null)}
        title={t('cancelConfirmTitle')}
        description={t('cancelConfirmBody')}
        confirmLabel={t('cancelAppointment')}
        confirmVariant="danger"
        cancelLabel={t('cancel')}
        onConfirm={() => void confirmCancel()}
      />
    </AppBackground>
  );
}

/* -------------------------------------------------------------------------- */
/* Local building blocks                                                       */
/* -------------------------------------------------------------------------- */

function createdDoctorName(appointment: Appointment, lang: LanguageCode): string {
  const doctor = getDoctor(appointment.doctorId);
  return doctor ? doctorDisplayName(doctor, lang) : '—';
}

/** Localised weekday + date for an ISO day. */
function formatDay(iso: string, lang: LanguageCode): string {
  // `dayOfIso` is the single source of weekday truth (it knows Friday is closed).
  const weekday = dayOfIso(iso);
  const label = weekday ? localize(DAY_LABELS[weekday], lang) : '';
  const day = String(Number(iso.slice(8, 10)));
  const month = String(Number(iso.slice(5, 7)));
  const date = `${day}/${month}/${iso.slice(0, 4)}`;
  const usDate = `${month}/${day}/${iso.slice(0, 4)}`;
  return lang === 'ar' ? `${label} ${date}` : `${label}, ${usDate}`;
}

function SpecialtyRow({
  id,
  name,
  count,
  countLabel,
  rtl,
  onPress,
}: {
  id: string;
  name: string;
  count: number;
  countLabel: string;
  rtl: boolean;
  onPress: () => void;
}) {
  const theme = useTheme();
  const c = theme.colors;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={name}
      onPress={onPress}
      style={({ pressed }) => [pressed && { opacity: theme.opacity.pressed }]}
    >
      <Card padded={false} style={styles.specialtyRow}>
        <View style={[styles.rowInner, { flexDirection: rowDirection(rtl) }]}>
          <Image source={SPECIALTY_IMAGES[id]} style={styles.specialtyThumb} resizeMode="cover" />
          <View style={styles.rowText}>
            <Text style={[styles.rowTitle, { color: c.text, textAlign: textAlignment(rtl) }]}>
              {name}
            </Text>
            <Text style={[styles.rowSubtitle, { color: c.textMuted, textAlign: textAlignment(rtl) }]}>
              {`${count} ${countLabel}`}
            </Text>
          </View>
          <Icon name={rtl ? 'chevron-left' : 'chevron-right'} size={18} color={c.textMuted} />
        </View>
      </Card>
    </Pressable>
  );
}

function SummaryRow({
  label,
  value,
  actionLabel,
  onAction,
  rtl,
}: {
  label: string;
  value: string;
  actionLabel: string;
  onAction: () => void;
  rtl: boolean;
}) {
  const theme = useTheme();
  const c = theme.colors;
  return (
    <Card style={styles.summaryCard}>
      <View style={[styles.summaryRow, { flexDirection: rowDirection(rtl) }]}>
        <View style={styles.rowText}>
          <Text style={[styles.rowSubtitle, { color: c.textMuted, textAlign: textAlignment(rtl) }]}>
            {label}
          </Text>
          <Text style={[styles.rowTitle, { color: c.text, textAlign: textAlignment(rtl) }]}>
            {value}
          </Text>
        </View>
        <Button label={actionLabel} variant="ghost" size="sm" onPress={onAction} />
      </View>
    </Card>
  );
}

function ReviewRow({
  label,
  value,
  onEdit,
  rtl,
}: {
  label: string;
  value: string;
  onEdit: () => void;
  rtl: boolean;
}) {
  const { t } = useLanguage();
  const theme = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.summaryRow, { flexDirection: rowDirection(rtl) }]}>
      <View style={styles.rowText}>
        <Text style={[styles.rowSubtitle, { color: c.textMuted, textAlign: textAlignment(rtl) }]}>
          {label}
        </Text>
        <Text style={[styles.rowTitle, { color: c.text, textAlign: textAlignment(rtl) }]}>
          {value}
        </Text>
      </View>
      <Button label={t('edit')} variant="ghost" size="sm" onPress={onEdit} />
    </View>
  );
}

function AppointmentCard({
  appointment,
  expanded,
  onToggle,
  onCancel,
}: {
  appointment: Appointment;
  expanded: boolean;
  onToggle: () => void;
  onCancel: () => void;
}) {
  const { t, lang, isRTL } = useLanguage();
  const theme = useTheme();
  const c = theme.colors;
  const doctor = getDoctor(appointment.doctorId);
  const specialty = getSpecialty(appointment.specialtyId);

  const statusLabel =
    appointment.status === 'upcoming'
      ? t('statusUpcoming')
      : appointment.status === 'previous'
        ? t('statusPrevious')
        : appointment.status === 'cancelled'
          ? t('statusCancelled')
          : t('statusRejected');

  const rejectionReason =
    appointment.rejectionReason && appointment.rejectionReason !== DEMO_REJECTION_CODE
      ? appointment.rejectionReason
      : null;

  const detailIcon: IconName = expanded ? 'chevron-up' : 'chevron-down';

  return (
    <Card style={styles.apptCard}>
      <View style={[styles.apptHead, { flexDirection: rowDirection(isRTL) }]}>
        <View style={styles.rowText}>
          <Text style={[styles.rowTitle, { color: c.text, textAlign: textAlignment(isRTL) }]}>
            {doctor ? doctorDisplayName(doctor, lang) : t('unknownLabel')}
          </Text>
          <Text style={[styles.rowSubtitle, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}>
            {specialty ? localize(specialty.name, lang) : t('unknownLabel')}
          </Text>
        </View>
        <StatusPill label={statusLabel} status={appointment.status} />
      </View>

      <View style={[styles.apptMeta, { flexDirection: rowDirection(isRTL) }]}>
        <MetaItem icon="calendar-outline" value={formatDay(appointment.date, lang)} rtl={isRTL} />
        <MetaItem icon="clock-outline" value={appointment.timeFrom} rtl={isRTL} />
      </View>

      <View style={[styles.badgeRow, { flexDirection: rowDirection(isRTL) }]}>
        {appointment.demo ? (
          <Badge label={t('demoBadge')} tone="neutral" />
        ) : (
          <Badge label={t('apptLocalBadge')} tone="info" />
        )}
        <Button
          label={t('appointmentDetailsTitle')}
          variant="ghost"
          size="sm"
          icon={detailIcon}
          iconPosition="trailing"
          onPress={onToggle}
        />
      </View>

      {expanded ? (
        <View style={styles.details}>
          <Divider />
          <DetailLine label={t('apptDoctor')} value={doctor ? doctorDisplayName(doctor, lang) : t('unknownLabel')} rtl={isRTL} />
          <DetailLine label={t('apptSpecialty')} value={specialty ? localize(specialty.name, lang) : t('unknownLabel')} rtl={isRTL} />
          <DetailLine label={t('apptDate')} value={formatDay(appointment.date, lang)} rtl={isRTL} />
          <DetailLine label={t('apptTime')} value={appointment.timeFrom} rtl={isRTL} />
          <DetailLine
            label={t('apptReference')}
            value={appointment.reference ?? t('apptReferenceMissing')}
            rtl={isRTL}
          />
          <DetailLine label={t('apptStatus')} value={statusLabel} rtl={isRTL} />
          {appointment.notes.trim() ? (
            <DetailLine label={t('apptNotes')} value={appointment.notes} rtl={isRTL} />
          ) : null}
          {appointment.status === 'rejected' ? (
            <DetailLine
              label={t('rejectReasonLabel')}
              value={rejectionReason ?? t('rejectReasonNone')}
              rtl={isRTL}
            />
          ) : null}
          <Divider />
          {appointment.status === 'upcoming' ? (
            <Button label={t('cancelAppointment')} variant="danger" size="sm" onPress={onCancel} />
          ) : null}
          <Text style={[styles.demoNote, { color: c.textMuted, textAlign: textAlignment(isRTL) }]}>
            {appointment.demo ? t('demoNote') : t('bookLocalWarning')}
          </Text>
        </View>
      ) : null}
    </Card>
  );
}

function MetaItem({
  icon,
  value,
  rtl,
}: {
  icon: 'calendar-outline' | 'clock-outline';
  value: string;
  rtl: boolean;
}) {
  const theme = useTheme();
  const c = theme.colors;
  return (
    <View style={[styles.metaItem, { flexDirection: rowDirection(rtl) }]}>
      <Icon name={icon} size={16} color={c.textMuted} />
      <Text style={[styles.metaText, { color: c.textSecondary }]}>{value}</Text>
    </View>
  );
}

function DetailLine({ label, value, rtl }: { label: string; value: string; rtl: boolean }) {
  const theme = useTheme();
  const c = theme.colors;
  return (
    <View style={styles.detailLine}>
      <Text style={[styles.detailLabel, { color: c.textMuted, textAlign: textAlignment(rtl) }]}>
        {label}
      </Text>
      <Text style={[styles.detailValue, { color: c.text, textAlign: textAlignment(rtl) }]}>
        {value}
      </Text>
    </View>
  );
}

function StatusPill({ label, status }: { label: string; status: AppointmentStatus }) {
  const theme = useTheme();
  const c = theme.colors;
  const tone =
    status === 'rejected'
      ? { background: c.dangerSoft, text: c.danger }
      : status === 'cancelled'
        ? { background: c.coolGray, text: c.textMuted }
        : status === 'previous'
          ? { background: c.lavender, text: c.textSecondary }
          : { background: c.primarySurface, text: c.primary };

  return (
    <View style={[styles.statusPill, { backgroundColor: tone.background }]}>
      <Text style={[styles.statusText, { color: tone.text }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: Spacing.screen,
    paddingTop: Spacing.xs,
    paddingBottom: Spacing.xxl,
    gap: Spacing.lg,
  },
  filters: { gap: Spacing.sm, paddingVertical: 2 },
  stateBlock: { gap: Spacing.md },
  stack: { gap: Spacing.md },
  stepTitle: { ...Typography.sectionTitle },
  specialtyRow: { overflow: 'hidden' },
  rowInner: { alignItems: 'center', gap: Spacing.md, padding: Spacing.md },
  specialtyThumb: { width: 48, height: 48, borderRadius: Radius.md },
  rowText: { flex: 1, minWidth: 0, gap: 2 },
  rowTitle: { ...Typography.bodyStrong },
  rowSubtitle: { ...Typography.caption },
  summaryCard: { gap: Spacing.sm },
  summaryRow: { alignItems: 'center', gap: Spacing.sm },
  reviewCard: { gap: Spacing.sm },
  apptCard: { gap: Spacing.md },
  apptHead: { alignItems: 'center', gap: Spacing.sm },
  apptMeta: { alignItems: 'center', gap: Spacing.md, flexWrap: 'wrap' },
  metaItem: { alignItems: 'center', gap: 6 },
  metaText: { ...Typography.caption },
  badgeRow: { alignItems: 'center', gap: Spacing.sm, flexWrap: 'wrap' },
  statusPill: {
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
  },
  statusText: { ...Typography.micro, fontWeight: '700' },
  details: { gap: Spacing.sm },
  detailLine: { gap: 2 },
  detailLabel: { ...Typography.caption, fontWeight: '600' },
  detailValue: { ...Typography.body },
  demoNote: { ...Typography.caption },
  doneCard: { alignItems: 'center', gap: Spacing.sm },
  doneTitle: { ...Typography.sectionTitle, textAlign: 'center' },
  doneBody: { ...Typography.secondary, textAlign: 'center' },
  doneMeta: { gap: 2, alignItems: 'center' },
  doneMetaText: { ...Typography.caption },
});
