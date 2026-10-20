/**
 * Doctors service — self-contained demo, no network.
 *
 * Serves the centre's supplied doctors from the local data layer
 * (`@/data/doctors`) so the demo app works fully offline. The exported
 * signatures are unchanged, so no screen had to be rewritten.
 *
 * The doctor ID mapper is now an identity mapping over the local IDs: every
 * local doctor resolves to itself, so patient booking is no longer blocked by
 * a missing name-based backend match. All names, photos and schedules are
 * fictional demo data.
 */

import type { Doctor } from '@/data/types';
import { DOCTORS } from '@/data/doctors';
import {
  DOCTOR_BY_ID,
  SPECIALTY_BY_ID,
  doctorDisplayName,
  groupSlotsByDay,
} from '@/lib/doctor';

export interface BackendDoctor {
  readonly id: string;
  readonly fullName: string;
  readonly specialtyId: string | null;
  readonly specialtyName: string | null;
  readonly specialtyNameAr: string | null;
  readonly createdAt: string;
  readonly schedule: readonly {
    readonly day: string;
    readonly from: string;
    readonly to: string | null;
  }[];
}

export type DoctorResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: 'not_found' | 'network_error' };

/**
 * Local doctor ID → the ID used for API-shaped payloads. In demo mode this is
 * the identity, so bookings store the same ID the UI resolves against.
 */
const localToBackendDoctorId = new Map<string, string>(
  DOCTORS.map((doctor) => [doctor.id, doctor.id]),
);

/** Backend-style ID → local doctor ID. Identity in demo mode. */
const backendToLocalDoctorId = new Map<string, string>(
  DOCTORS.map((doctor) => [doctor.id, doctor.id]),
);

/** Returns the API-shaped ID for a local doctor ID, or null when unknown. */
export function getBackendDoctorId(localDoctorId: string): string | null {
  return localToBackendDoctorId.get(localDoctorId) ?? null;
}

/** Returns the local doctor ID for an API-shaped ID, or null when unknown. */
export function getLocalDoctorId(backendDoctorId: string): string | null {
  return backendToLocalDoctorId.get(backendDoctorId) ?? null;
}

/** Builds the screen-facing doctor shape from one local entry. */
function toBackend(local: Doctor, lang: 'ar' | 'en'): BackendDoctor {
  const specialty = SPECIALTY_BY_ID.get(local.specialtyId);
  return {
    id: local.id,
    fullName: doctorDisplayName(local, lang),
    specialtyId: local.specialtyId,
    specialtyName: specialty ? specialty.name.en : null,
    specialtyNameAr: specialty ? specialty.name.ar : null,
    createdAt: '',
    schedule: groupSlotsByDay(local.schedule),
  };
}

/** All doctors, optionally filtered by specialty, from the local data layer. */
export async function listDoctors(
  specialtyId: string | null,
  lang: 'ar' | 'en',
): Promise<DoctorResult<Doctor[]>> {
  const matching = specialtyId
    ? DOCTORS.filter((doctor) => doctor.specialtyId === specialtyId)
    : DOCTORS;
  const value = matching.map((doctor) => toBackend(doctor, lang)) as unknown as Doctor[];
  return { ok: true, value };
}

/** A single doctor from the local data layer. */
export async function getDoctorById(
  id: string,
  lang: 'ar' | 'en',
): Promise<DoctorResult<Doctor>> {
  const local = DOCTOR_BY_ID.get(id);
  if (!local) return { ok: false, error: 'not_found' };
  return { ok: true, value: toBackend(local, lang) as unknown as Doctor };
}

/** Find a local doctor from a payload, matched by id then by name. */
export function findLocalDoctorExported(
  backend: BackendDoctor,
  _lang: 'ar' | 'en',
): (typeof DOCTORS)[number] | null {
  const byId = DOCTOR_BY_ID.get(backend.id);
  if (byId) return byId;

  const backendName = backend.fullName.toLowerCase();
  return (
    DOCTORS.find(
      (item) =>
        item.name.ar.toLowerCase() === backendName ||
        item.name.en.toLowerCase() === backendName,
    ) ?? null
  );
}
