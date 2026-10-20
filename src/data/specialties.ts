import type { Specialty } from './types';

/**
 * The centre's 14 specialties, copied verbatim from the project's existing data
 * layer. Descriptions are neutral definitions of each medical field and contain
 * no claims about the centre, its results or its capabilities.
 */
export const SPECIALTIES: readonly Specialty[] = [
  {
    id: 'neurosurgery',
    icon: 'neurosurgery',
    name: { ar: 'الجراحة العصبية', en: 'Neurosurgery' },
    description: {
      ar: 'علاج الحالات التي تصيب الدماغ والعمود الفقري والجهاز العصبي.',
      en: 'Treatment of conditions affecting the brain, spine and nervous system.',
    },
  },
  {
    id: 'pediatrics',
    icon: 'pediatrics',
    name: {
      ar: 'أمراض الأطفال والرضع وحديثي الولادة',
      en: 'Pediatrics, Infants & Neonatology',
    },
    description: {
      ar: 'رعاية صحة الأطفال والرضع وحديثي الولادة.',
      en: 'Healthcare for children, infants and newborns.',
    },
  },
  {
    id: 'obstetrics',
    icon: 'obstetrics',
    name: {
      ar: 'التوليد والأمراض النسائية وجراحتها',
      en: 'Obstetrics & Gynecology',
    },
    description: {
      ar: 'رعاية الحمل والولادة وأمراض المرأة وجراحتها.',
      en: 'Care through pregnancy and childbirth, and women’s health.',
    },
  },
  {
    id: 'cardiology',
    icon: 'cardiology',
    name: { ar: 'الأمراض الداخلية القلبية', en: 'Internal Medicine & Cardiology' },
    description: {
      ar: 'تشخيص وعلاج أمراض القلب والأوعية الدموية.',
      en: 'Diagnosis and treatment of heart and blood vessel conditions.',
    },
  },
  {
    id: 'ent',
    icon: 'ent',
    name: {
      ar: 'الأذن والأنف والحنجرة وجراحة الرأس والعنق',
      en: 'Ear, Nose, Throat & Head and Neck Surgery',
    },
    description: {
      ar: 'علاج أمراض الأذن والأنف والحنجرة وجراحة الرأس والعنق.',
      en: 'Treatment of ear, nose and throat conditions and head and neck surgery.',
    },
  },
  {
    id: 'physiotherapy',
    icon: 'physiotherapy',
    name: { ar: 'العلاج الفيزيائي', en: 'Physical Therapy' },
    description: {
      ar: 'برامج علاج فيزيائي لدعم الحركة وتخفيف الألم.',
      en: 'Physical therapy programs to support movement and relieve pain.',
    },
  },
  {
    id: 'urology',
    icon: 'urology',
    name: { ar: 'الجراحة البولية', en: 'Urology' },
    description: {
      ar: 'تشخيص وعلاج أمراض الجهاز البولي وجراحتها.',
      en: 'Diagnosis, treatment and surgery of the urinary system.',
    },
  },
  {
    id: 'orthopedics',
    icon: 'orthopedics',
    name: { ar: 'الجراحة العظمية', en: 'Orthopedic Surgery' },
    description: {
      ar: 'علاج إصابات العظام والمفاصل والحالات العظمية.',
      en: 'Treatment of bone, joint and musculoskeletal injuries.',
    },
  },
  {
    id: 'general-surgery',
    icon: 'general-surgery',
    name: { ar: 'الجراحة العامة', en: 'General Surgery' },
    description: {
      ar: 'تشخيص وعلاج الحالات العامة التي تحتاج إلى تدخل جراحي.',
      en: 'Diagnosis and treatment of general conditions that require surgery.',
    },
  },
  {
    id: 'endocrinology',
    icon: 'endocrinology',
    name: {
      ar: 'الداخلية العامة والغدد والسكري',
      en: 'Internal Medicine, Endocrinology & Diabetes',
    },
    description: {
      ar: 'صحة الغدد الصماء والسكري والحالات الداخلية العامة.',
      en: 'Endocrine health, diabetes and general internal medicine.',
    },
  },
  {
    id: 'dermatology',
    icon: 'dermatology',
    name: { ar: 'الأمراض الجلدية والتجميل', en: 'Dermatology & Aesthetics' },
    description: {
      ar: 'علاج أمراض الجلد والبشرة.',
      en: 'Treatment of skin and dermatological conditions.',
    },
  },
  {
    id: 'gastroenterology',
    icon: 'gastroenterology',
    name: { ar: 'الأمراض الباطنية الهضمية', en: 'Gastroenterology' },
    description: {
      ar: 'تشخيص وعلاج أمراض الجهاز الهضمي.',
      en: 'Diagnosis and treatment of digestive system conditions.',
    },
  },
  {
    id: 'rheumatology',
    icon: 'rheumatology',
    name: {
      ar: 'المفاصل والروماتيزم وأمراض المناعة',
      en: 'Joint Medicine, Rheumatology & Immunology',
    },
    description: {
      ar: 'علاج أمراض المفاصل والالتهابات المزمنة وأمراض المناعة.',
      en: 'Treatment of joint conditions, chronic inflammation and immune disorders.',
    },
  },
  {
    id: 'psychiatry',
    icon: 'psychiatry',
    name: {
      ar: 'الطب النفسي ومعالجة الإدمان',
      en: 'Psychiatry & Addiction Care',
    },
    description: {
      ar: 'دعم الصحة النفسية ومعالجة الإدمان.',
      en: 'Mental health support and addiction care.',
    },
  },
];
