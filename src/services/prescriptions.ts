/**
 * Prescriptions service — physician-prescribed medications.
 *
 * CURRENT STATE: EMPTY BY DESIGN, WAITING FOR A BACKEND.
 *
 * Nothing is invented. No prescription, dosage, frequency or instruction is
 * shown, because a prescription is a clinician's instruction and inventing one
 * would be dangerous. This list stays strictly separate from the patient's own
 * "current medications" in the health profile, which is self-reported and
 * patient-editable; the two are never merged into one list.
 */

import type { Prescription } from '@/data/types';

export type PrescriptionErrorCode = 'unavailable';

export type PrescriptionResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: PrescriptionErrorCode };

/** Physician-prescribed medications. Empty until a backend supplies them. */
export async function listPrescriptions(): Promise<Prescription[]> {
  return [];
}

export async function listPrescriptionsForVisit(
  visitId: string,
): Promise<Prescription[]> {
  const all = await listPrescriptions();
  return all.filter((item) => item.visitId === visitId);
}
