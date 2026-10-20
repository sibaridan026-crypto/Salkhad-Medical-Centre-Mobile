/**
 * Specialties service — self-contained demo, no network.
 *
 * This module no longer talks to any backend. It serves the centre's supplied
 * specialty list from the local data layer (`@/data/specialties`) so the demo
 * app works fully offline. The exported function signatures are unchanged, so
 * no screen had to be rewritten.
 *
 * The returned objects keep the same field names the screens already read
 * (`id`, `name`, `nameAr`, `doctorCount`), plus the local `icon`/`description`
 * used for presentation. All names and images are fictional demo data.
 */

import type { LocalizedText, Specialty, SpecialtyIconName } from '@/data/types';
import { SPECIALTIES } from '@/data/specialties';
import { SPECIALTY_GLYPH, SPECIALTY_IMAGES } from '@/data/specialty-visuals';
import { DOCTOR_COUNT_BY_SPECIALTY } from '@/lib/doctor';

export interface BackendSpecialty {
  readonly id: string;
  readonly name: string;
  readonly nameAr: string | null;
  readonly doctorCount: number;
  readonly icon?: SpecialtyIconName;
  readonly description?: LocalizedText;
}

export type SpecialtyResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly error: 'not_found' | 'network_error' };

/** Builds the screen-facing specialty shape from one local entry. */
function toBackend(local: Specialty): BackendSpecialty {
  return {
    id: local.id,
    name: local.name.en,
    nameAr: local.name.ar,
    doctorCount: DOCTOR_COUNT_BY_SPECIALTY.get(local.id) ?? 0,
    icon: local.icon,
    description: local.description,
  };
}

/** Matches a specialty payload to its local entry by id, then by name. */
export function findLocalSpecialty(
  backend: BackendSpecialty,
  _lang: 'ar' | 'en',
): (typeof SPECIALTIES)[number] | null {
  const byId = SPECIALTIES.find((item) => item.id === backend.id);
  if (byId) return byId;

  const backendName = (backend.nameAr ?? backend.name).toLowerCase();
  return (
    SPECIALTIES.find(
      (item) =>
        item.name.ar.toLowerCase() === backendName ||
        item.name.en.toLowerCase() === backendName,
    ) ?? null
  );
}

/** All specialties from the local data layer. */
export async function listSpecialties(
  _lang: 'ar' | 'en',
): Promise<SpecialtyResult<Specialty[]>> {
  const value = SPECIALTIES.map(toBackend) as unknown as Specialty[];
  return { ok: true, value };
}

/** A single specialty from the local data layer. */
export async function getSpecialtyById(
  id: string,
  _lang: 'ar' | 'en',
): Promise<SpecialtyResult<Specialty>> {
  const local = SPECIALTIES.find((item) => item.id === id);
  if (!local) return { ok: false, error: 'not_found' };
  return { ok: true, value: toBackend(local) as unknown as Specialty };
}

/** Local cover image for a specialty (matched by id, then by name). */
export function specialtyCoverImage(backend: any): unknown {
  if (backend && typeof backend.id === 'string' && SPECIALTY_IMAGES[backend.id]) {
    return SPECIALTY_IMAGES[backend.id];
  }
  const local = findLocalSpecialty(backend as BackendSpecialty, 'en');
  return local ? SPECIALTY_IMAGES[local.id] : SPECIALTY_IMAGES['general-surgery'];
}

/** Local glyph icon for a specialty (matched by id, then by name). */
export function specialtyGlyphFor(backend: BackendSpecialty): unknown {
  if (backend && SPECIALTY_GLYPH[backend.id]) return SPECIALTY_GLYPH[backend.id];
  const local = findLocalSpecialty(backend, 'en');
  return local ? SPECIALTY_GLYPH[local.id] : 'medical-bag';
}
