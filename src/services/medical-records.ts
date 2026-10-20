/**
 * Medical-record service — clinician-authored information.
 *
 * CURRENT STATE: EMPTY BY DESIGN, WAITING FOR A BACKEND.
 *
 * There is no backend, so this service returns an empty list rather than any
 * visit, diagnosis, test result or clinical note. Fabricating a diagnosis or a
 * physician note would be wrong, and mixing patient-entered notes into a
 * medical record would be worse: everything returned here belongs to the
 * medical-care domain, not to the health profile the patient edits.
 *
 * The functions are async and shaped exactly like the API they will call, so
 * wiring the backend later does not touch a single screen.
 */

import type { MedicalVisit } from '@/data/types';

export type RecordErrorCode = 'unavailable';

export type RecordResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: RecordErrorCode };

/** The patient's previous visits. Empty until a backend supplies them. */
export async function listVisits(): Promise<MedicalVisit[]> {
  return [];
}

export async function getVisit(id: string): Promise<MedicalVisit | null> {
  const visits = await listVisits();
  return visits.find((visit) => visit.id === id) ?? null;
}
