/**
 * Patient QR identity service.
 *
 * CURRENT STATE: UNAVAILABLE — NO IDENTITY SERVICE EXISTS.
 *
 * This screen exists so the patient can be told the truth about their medical
 * QR instead of being shown a decorative pattern that looks scannable:
 *
 *   - No identity token has been issued for any account, because issuing one
 *     is a backend responsibility.
 *   - Nothing in the app generates, guesses or derives a patient identifier,
 *     and no phone number or other account data is ever used as a credential.
 *   - When a token is eventually issued it will be an opaque, non-guessable
 *     reference that a reception scanner resolves server-side; no diagnosis,
 *     allergy or medication value will ever be placed inside the QR itself.
 *
 * TO ACTIVATE: implement `loadQrIdentity` against the identity/authorisation
 * API and install a genuine QR-rendering package. Until then this returns
 * `unavailable` and the UI shows the honest setup state.
 */

import type { QrIdentityState } from '@/data/types';

export interface QrIdentity {
  readonly state: QrIdentityState;
  /** Opaque token issued by the backend. `null` until one is issued. */
  readonly token: string | null;
}

export async function loadQrIdentity(): Promise<QrIdentity> {
  return { state: 'unavailable', token: null };
}
