import type { ImageSourcePropType } from 'react-native';

/**
 * Maps each doctor / physiotherapist to their approved photo.
 *
 * The original photo files were copied into `assets/doctors/` under an ASCII
 * id that matches `doctors.ts`; the originals in `Life Pulse Assets/Doctors`
 * are never renamed, moved or edited. Only the real supplied photos are used —
 * no portrait is ever generated or substituted.
 */
export const DOCTOR_PHOTOS: Readonly<Record<string, ImageSourcePropType>> = {
  'diana-abu-trabi': require('../../assets/doctors/diana-abu-trabi.jpg'),
  'rihaf-subah': require('../../assets/doctors/rihaf-subah.jpg'),
  'layn-al-shumri': require('../../assets/doctors/layn-al-shumri.jpg'),
  'marhaf-al-halal': require('../../assets/doctors/marhaf-al-halal.jpg'),
  'loai-al-shoufi': require('../../assets/doctors/loai-al-shoufi.jpg'),
  'widadh-al-saadi': require('../../assets/doctors/widadh-al-saadi.jpg'),
  'waad-khawis': require('../../assets/doctors/waad-khawis.jpg'),
  'hashem-munzur': require('../../assets/doctors/hashem-munzur.jpg'),
  'hind-al-bahri': require('../../assets/doctors/hind-al-bahri.jpg'),
  'firas-abu-ahmad': require('../../assets/doctors/firas-abu-ahmad.jpg'),
  'loai-al-shumri': require('../../assets/doctors/loai-al-shumri.jpg'),
  'waseem-abu-ahmad': require('../../assets/doctors/waseem-abu-ahmad.jpg'),
  'saha-qaraysheh': require('../../assets/doctors/saha-qaraysheh.jpg'),
  'lina-nasr': require('../../assets/doctors/lina-nasr.jpg'),
  'sonia-qaraysheh': require('../../assets/doctors/sonia-qaraysheh.jpg'),
  'lubna-abu-ras': require('../../assets/doctors/lubna-abu-ras.jpg'),
  'fares-siyagha': require('../../assets/doctors/fares-siyagha.jpg'),
  'nahed-abu-maghzeb': require('../../assets/doctors/nahed-abu-maghzeb.jpg'),
  'imara-ghazali': require('../../assets/doctors/imara-ghazali.jpg'),
  'fares-al-basat': require('../../assets/doctors/fares-al-basat.jpg'),
  'ala-al-sharbati': require('../../assets/doctors/ala-al-sharbati.jpg'),
  'mursal-al-basat': require('../../assets/doctors/mursal-al-basat.jpg'),
  'lubna-jamal': require('../../assets/doctors/lubna-jamal.jpg'),
};
