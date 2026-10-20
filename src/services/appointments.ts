/**
 * Appointments service — self-contained demo, no network.
 *
 * Replaces the backend implementation. Records are seeded locally on first use
 * and kept in the on-device store (see `services/storage.ts`). The exported
 * signatures are unchanged, so no screen had to be rewritten.
 *
 * Every seeded record is flagged `demo: true` and is fictional demo data — it
 * is never a real centre record. Requests the patient makes in the demo are
 * flagged `demo: false` and stored on this device only.
 *
 * Each consumer receives the status vocabulary it already understands:
 *   - the patient screens use the mobile `AppointmentStatus` union;
 *   - the doctor screen uses `upcoming` / `Scheduled` / `Cancelled` / …;
 *   - the admin screen uses `Pending` / `Scheduled` / `Completed` / ….
 */

import type { Appointment, AppointmentStatus } from '@/data/types';
import { DOCTORS } from '@/data/doctors';
import { DOCTOR_BY_ID, SPECIALTY_BY_ID, doctorDisplayName } from '@/lib/doctor';
import { readJson, StorageKeys, writeJson } from '@/services/storage';

export type AppointmentErrorCode =
  | 'invalid-slot'
  | 'duplicate-request'
  | 'not-found'
  | 'not-cancellable'
  | 'not_authenticated'
  | 'not_authorized'
  | 'status_update_failed'
  | 'network_error';

export type AppointmentResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: AppointmentErrorCode };

export interface AppointmentDraft {
  readonly doctorId: string;
  readonly specialtyId: string;
  /** ISO `YYYY-MM-DD`. */
  readonly date: string;
  readonly timeFrom: string;
  readonly timeTo: string | null;
  readonly notes: string;
}

/** The lifecycle state stored on the device, independent of any one screen. */
type InternalStatus = 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'rejected';

interface StoredAppointment {
  id: string;
  reference: string | null;
  doctorId: string;
  patientName: string | null;
  patientPhone: string | null;
  specialtyId: string;
  date: string;
  timeFrom: string;
  timeTo: string | null;
  status: InternalStatus;
  notes: string;
  rejectionReason: string | null;
  requestedAt: string;
  demo: boolean;
}

type Audience = 'patient' | 'doctor' | 'admin';

/** Fictional name shown to the doctor/admin demo dashboards. */
const DEMO_PATIENT_NAME = 'Demo Patient';

const PATIENT_STATUS: Record<InternalStatus, AppointmentStatus> = {
  pending: 'upcoming',
  scheduled: 'upcoming',
  completed: 'previous',
  cancelled: 'cancelled',
  rejected: 'rejected',
};

const DOCTOR_STATUS: Record<InternalStatus, string> = {
  pending: 'upcoming',
  scheduled: 'Scheduled',
  completed: 'previous',
  cancelled: 'Cancelled',
  rejected: 'rejected',
};

const ADMIN_STATUS: Record<InternalStatus, string> = {
  pending: 'Pending',
  scheduled: 'Scheduled',
  completed: 'Completed',
  cancelled: 'Cancelled',
  rejected: 'Rejected',
};

function statusFor(audience: Audience, status: InternalStatus): AppointmentStatus {
  if (audience === 'patient') return PATIENT_STATUS[status];
  const mapped = audience === 'doctor' ? DOCTOR_STATUS[status] : ADMIN_STATUS[status];
  // The screen-facing value is a display string, not the mobile union.
  return mapped as unknown as AppointmentStatus;
}

/** Maps the status strings the screens send back onto the stored lifecycle. */
function toInternal(status: string): InternalStatus {
  switch (status) {
    case 'Scheduled':
    case 'Accepted':
    case 'scheduled':
      return 'scheduled';
    case 'Completed':
    case 'completed':
      return 'completed';
    case 'Cancelled':
    case 'cancelled':
      return 'cancelled';
    case 'Rejected':
    case 'rejected':
      return 'rejected';
    default:
      return 'pending';
  }
}

function toAppointment(record: StoredAppointment, audience: Audience): Appointment {
  const doctor = DOCTOR_BY_ID.get(record.doctorId);
  const specialty = SPECIALTY_BY_ID.get(record.specialtyId);
  return {
    id: record.id,
    reference: record.reference,
    doctorId: record.doctorId,
    doctorName: doctor ? doctorDisplayName(doctor, 'en') : null,
    specialtyId: record.specialtyId,
    specialtyName: specialty ? specialty.name.en : null,
    specialtyNameAr: specialty ? specialty.name.ar : null,
    date: record.date,
    timeFrom: record.timeFrom,
    timeTo: record.timeTo,
    status: statusFor(audience, record.status),
    notes: record.notes,
    rejectionReason: record.rejectionReason,
    requestedAt: record.requestedAt,
    demo: record.demo,
    patientName: record.patientName,
    patientPhone: record.patientPhone,
  };
}

/** ISO `YYYY-MM-DD` for a day offset from today. */
function isoDaysFromNow(offset: number): string {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + offset);
  return date.toISOString().slice(0, 10);
}

function seedAppointments(): StoredAppointment[] {
  const now = new Date().toISOString();
  const doctorA = DOCTORS[0];
  const doctorB = DOCTORS[1] ?? DOCTORS[0];

  const make = (
    index: number,
    doctor: (typeof DOCTORS)[number],
    date: string,
    timeFrom: string,
    timeTo: string,
    status: InternalStatus,
    extras: Partial<StoredAppointment> = {},
  ): StoredAppointment => ({
    id: `demo-appt-${index}`,
    reference: null,
    doctorId: doctor.id,
    patientName: DEMO_PATIENT_NAME,
    patientPhone: null,
    specialtyId: doctor.specialtyId,
    date,
    timeFrom,
    timeTo,
    status,
    notes: '',
    rejectionReason: null,
    requestedAt: now,
    demo: true,
    ...extras,
  });

  return [
    make(1, doctorA, isoDaysFromNow(2), '10:00', '10:30', 'pending'),
    make(2, doctorB, isoDaysFromNow(-10), '09:00', '09:30', 'completed'),
    make(3, doctorA, isoDaysFromNow(-4), '11:00', '11:30', 'cancelled'),
    make(4, doctorB, isoDaysFromNow(1), '12:00', '12:30', 'rejected', {
      rejectionReason: 'demo-no-reason',
    }),
  ];
}

let records: StoredAppointment[] | null = null;

async function load(): Promise<StoredAppointment[]> {
  if (records) return records;
  const stored = await readJson<StoredAppointment[]>(StorageKeys.appointments);
  if (stored && Array.isArray(stored) && stored.length > 0) {
    records = stored;
    return records;
  }
  records = seedAppointments();
  await writeJson(StorageKeys.appointments, records);
  return records;
}

async function persist(): Promise<void> {
  if (records) await writeJson(StorageKeys.appointments, records);
}

/** Appointments for the signed-in patient (demo records included). */
export async function listAppointments(): Promise<Appointment[]> {
  const all = await load();
  return all.map((record) => toAppointment(record, 'patient'));
}

/** A single appointment by id, or null. */
export async function getAppointment(id: string): Promise<Appointment | null> {
  const all = await load();
  const record = all.find((item) => item.id === id);
  return record ? toAppointment(record, 'patient') : null;
}

/** Creates a patient request and stores it on this device only. */
export async function createAppointmentRequest(
  draft: AppointmentDraft,
): Promise<AppointmentResult<Appointment>> {
  if (!draft.doctorId || !draft.specialtyId) return { ok: false, error: 'invalid-slot' };
  if (!draft.date || !/^\d{2}:\d{2}$/.test(draft.timeFrom)) {
    return { ok: false, error: 'invalid-slot' };
  }

  const all = await load();
  const duplicate = all.some(
    (item) =>
      !item.demo &&
      item.doctorId === draft.doctorId &&
      item.date === draft.date &&
      item.timeFrom === draft.timeFrom &&
      (item.status === 'pending' || item.status === 'scheduled'),
  );
  if (duplicate) return { ok: false, error: 'duplicate-request' };

  const record: StoredAppointment = {
    id: `appt-${Date.now()}`,
    reference: null,
    doctorId: draft.doctorId,
    patientName: DEMO_PATIENT_NAME,
    patientPhone: null,
    specialtyId: draft.specialtyId,
    date: draft.date,
    timeFrom: draft.timeFrom,
    timeTo: draft.timeTo,
    status: 'pending',
    notes: draft.notes,
    rejectionReason: null,
    requestedAt: new Date().toISOString(),
    demo: false,
  };

  all.unshift(record);
  records = all;
  await persist();
  return { ok: true, value: toAppointment(record, 'patient') };
}

/** Cancels a pending/scheduled request owned by this device. */
export async function cancelAppointment(
  id: string,
): Promise<AppointmentResult<Appointment>> {
  const all = await load();
  const record = all.find((item) => item.id === id);
  if (!record) return { ok: false, error: 'not-found' };
  if (record.status !== 'pending' && record.status !== 'scheduled') {
    return { ok: false, error: 'not-cancellable' };
  }
  record.status = 'cancelled';
  await persist();
  return { ok: true, value: toAppointment(record, 'patient') };
}

/** All appointments for the doctor demo dashboard. */
export async function listDoctorAppointments(): Promise<Appointment[]> {
  const all = await load();
  return all.map((record) => toAppointment(record, 'doctor'));
}

/** All appointments for the admin demo dashboard. */
export async function listAllAppointments(): Promise<Appointment[]> {
  const all = await load();
  return all.map((record) => toAppointment(record, 'admin'));
}

/** Applies a status change requested by a doctor/admin screen. */
export async function updateAppointmentStatus(
  id: string,
  status: string,
  rejectionReason?: string,
): Promise<AppointmentResult<Appointment>> {
  const all = await load();
  const record = all.find((item) => item.id === id);
  if (!record) return { ok: false, error: 'not-found' };

  record.status = toInternal(status);
  if (record.status === 'rejected') {
    record.rejectionReason = rejectionReason ?? record.rejectionReason ?? 'demo-no-reason';
  }
  await persist();
  return { ok: true, value: toAppointment(record, 'admin') };
}
