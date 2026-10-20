import type { Doctor } from './types';

/**
 * Every entry below is taken from the weekly schedule supplied by the project
 * owner and copied verbatim from the project's existing data layer. Nothing is
 * inferred: no ratings, experience or credentials were added beyond the
 * supplied data.
 *
 * Two pairs of names are deliberately kept separate because the supplied data
 * lists them as different people:
 *   - لؤي الشوفي  (cardiology)  ≠  لؤي الشومري (orthopedics)
 *   - فراس أبو أحمد (urology)   ≠  وسيم أبو أحمد (obstetrics)
 */
export const DOCTORS: readonly Doctor[] = [
  {
    id: 'diana-abu-trabi',
    name: { ar: 'ديانا أبو ترابي', en: 'Diana Abu Trabi' },
    honorific: true,
    specialtyId: 'neurosurgery',
    credential: null,
    schedule: [{ day: 'saturday', from: '10:00', to: '12:00' }],
  },
  {
    id: 'rihaf-subah',
    name: { ar: 'رهف صبح', en: 'Rihaf Subah' },
    honorific: true,
    specialtyId: 'pediatrics',
    credential: null,
    schedule: [{ day: 'saturday', from: '11:00', to: '12:00' }],
  },
  {
    id: 'layn-al-shumri',
    name: { ar: 'لين الشومري', en: 'Layn Al-Shumri' },
    honorific: true,
    specialtyId: 'obstetrics',
    credential: null,
    schedule: [{ day: 'saturday', from: '09:00', to: '15:00' }],
  },
  {
    id: 'marhaf-al-halal',
    name: { ar: 'مرهف الحلال', en: 'Marhaf Al-Halal' },
    honorific: true,
    specialtyId: 'general-surgery',
    credential: null,
    schedule: [{ day: 'saturday', from: '09:00', to: '11:00' }],
  },
  {
    id: 'loai-al-shoufi',
    name: { ar: 'لؤي الشوفي', en: 'Loai Al-Shoufi' },
    honorific: true,
    specialtyId: 'cardiology',
    credential: null,
    schedule: [
      { day: 'sunday', from: '09:00', to: null },
      { day: 'tuesday', from: '09:00', to: null },
    ],
  },
  {
    id: 'widadh-al-saadi',
    name: { ar: 'وضاح السعدي', en: 'Widadh Al-Saadi' },
    honorific: true,
    specialtyId: 'ent',
    credential: null,
    schedule: [{ day: 'sunday', from: '12:00', to: '14:00' }],
  },
  {
    id: 'waad-khawis',
    name: { ar: 'وعد خويص', en: 'Waad Khawis' },
    honorific: false,
    specialtyId: 'physiotherapy',
    credential: {
      ar: 'دبلوم تقاني طبي علاج فيزيائي',
      en: 'Technical diploma in physical therapy',
    },
    schedule: [{ day: 'sunday', from: '09:00', to: '11:00' }],
  },
  {
    id: 'hashem-munzur',
    name: { ar: 'هاشم منذر', en: 'Hashem Munzur' },
    honorific: true,
    specialtyId: 'dermatology',
    credential: null,
    schedule: [{ day: 'sunday', from: '11:00', to: '13:00' }],
  },
  {
    id: 'hind-al-bahri',
    name: { ar: 'هند البحري', en: 'Hind Al-Bahri' },
    honorific: true,
    specialtyId: 'endocrinology',
    credential: null,
    focusAreas: {
      ar: 'الحميات، إدارة الوزن، معالجة البدانة والنحافة',
      en: 'Diet therapy, weight management, and treatment of obesity and underweight',
    },
    schedule: [{ day: 'sunday', from: '11:00', to: '13:30' }],
  },
  {
    id: 'firas-abu-ahmad',
    name: { ar: 'فراس أبو أحمد', en: 'Firas Abu Ahmad' },
    honorific: true,
    specialtyId: 'urology',
    credential: null,
    schedule: [
      { day: 'monday', from: '10:00', to: '13:00' },
      { day: 'wednesday', from: '11:30', to: '13:00' },
    ],
  },
  {
    id: 'loai-al-shumri',
    name: { ar: 'لؤي الشومري', en: 'Loai Al-Shumri' },
    honorific: true,
    specialtyId: 'orthopedics',
    credential: null,
    schedule: [{ day: 'monday', from: '10:00', to: '12:00' }],
  },
  {
    id: 'waseem-abu-ahmad',
    name: { ar: 'وسيم أبو أحمد', en: 'Waseem Abu Ahmad' },
    honorific: true,
    specialtyId: 'obstetrics',
    credential: null,
    schedule: [{ day: 'monday', from: '12:00', to: '14:00' }],
  },
  {
    id: 'saha-qaraysheh',
    name: { ar: 'سها قريشة', en: 'Saha Qaraysheh' },
    honorific: true,
    specialtyId: 'endocrinology',
    credential: null,
    schedule: [{ day: 'tuesday', from: '09:00', to: '12:00' }],
  },
  {
    id: 'lina-nasr',
    name: { ar: 'لينا نصر', en: 'Lina Nasr' },
    honorific: true,
    specialtyId: 'dermatology',
    credential: null,
    schedule: [{ day: 'tuesday', from: '09:00', to: '11:00' }],
  },
  {
    id: 'sonia-qaraysheh',
    name: { ar: 'سونيا قريشة', en: 'Sonia Qaraysheh' },
    honorific: true,
    specialtyId: 'gastroenterology',
    credential: null,
    schedule: [
      { day: 'tuesday', from: '12:00', to: '14:00' },
      { day: 'wednesday', from: '12:00', to: '14:00' },
    ],
  },
  {
    id: 'lubna-abu-ras',
    name: { ar: 'لبنى أبو راس', en: 'Lubna Abu Ras' },
    honorific: true,
    specialtyId: 'neurosurgery',
    credential: null,
    schedule: [{ day: 'wednesday', from: '09:00', to: '13:00' }],
  },
  {
    id: 'fares-siyagha',
    name: { ar: 'فارس صياغه', en: 'Fares Siyagha' },
    honorific: true,
    specialtyId: 'ent',
    credential: null,
    schedule: [{ day: 'wednesday', from: '09:00', to: '11:00' }],
  },
  {
    id: 'nahed-abu-maghzeb',
    name: { ar: 'نهاد أبو مغضب', en: 'Nahed Abu Maghzeb' },
    honorific: true,
    specialtyId: 'rheumatology',
    credential: null,
    schedule: [{ day: 'wednesday', from: '09:00', to: '12:30' }],
  },
  {
    id: 'imara-ghazali',
    name: { ar: 'إمارة غزالي', en: 'Imara Ghazali' },
    honorific: true,
    specialtyId: 'obstetrics',
    credential: null,
    schedule: [{ day: 'thursday', from: '10:00', to: '15:00' }],
  },
  {
    id: 'fares-al-basat',
    name: { ar: 'فارس الباسط', en: 'Fares Al-Basat' },
    honorific: true,
    specialtyId: 'orthopedics',
    credential: null,
    schedule: [{ day: 'thursday', from: '11:00', to: '13:00' }],
  },
  {
    id: 'ala-al-sharbati',
    name: { ar: 'علاء الشريطي', en: 'Ala Al-Sharbati' },
    honorific: true,
    specialtyId: 'psychiatry',
    credential: null,
    schedule: [{ day: 'thursday', from: '11:00', to: '14:00' }],
  },
  {
    id: 'mursal-al-basat',
    name: { ar: 'مرسل الباسط', en: 'Mursal Al-Basat' },
    honorific: false,
    specialtyId: 'physiotherapy',
    credential: {
      ar: 'أخصائي في العلاج الفيزيائي مساج طبي',
      en: 'Specialist in physical therapy, medical massage',
    },
    schedule: [{ day: 'thursday', from: '08:30', to: '11:00' }],
  },
  {
    id: 'lubna-jamal',
    name: { ar: 'لبنى جمال', en: 'Lubna Jamal' },
    honorific: true,
    specialtyId: 'ent',
    credential: null,
    schedule: [{ day: 'thursday', from: '09:00', to: '11:00' }],
  },
];
