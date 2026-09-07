/**
 * Bundled fallback content.
 *
 * This is every value that used to be hardcoded in the old static index.html,
 * shaped exactly like the JSON the Express API will return. The site renders
 * from this whenever NEXT_PUBLIC_API_URL is blank or the API is unreachable,
 * so the frontend is fully usable before the backend exists.
 *
 * When the API goes live, `apps/api/prisma/seed/` loads these same values into
 * MySQL — so the switch-over is invisible.
 */

/**
 * School crest, served from apps/web/public.
 * Local rather than remote so it can never be blocked by a third-party host,
 * and so next/image can resize and compress the 1254px original on demand.
 */
export const LOGO_URL = '/images/logo.png';

export const settings = {
  schoolName: 'AKM Public Sr. Sec. School',
  tagline: 'Nursery to Class 12 • HPBOSE Affiliated',
  phonePrimary: '+91 98765 43210',
  phoneSecondary: '+91 91234 56789',
  whatsapp: '919876543210',
  email: 'info@akmpublicschool.in',
  addressShort: 'Main Road, Tehsil & District, Himachal Pradesh',
  addressFull:
    'AKM Public Sr. Sec. School, Main Road, Tehsil & District, Himachal Pradesh — 176xxx',
  timings: 'Monday – Saturday, 8:00 AM – 2:00 PM',
  timingsShort: 'Mon–Sat, 8:00 AM – 2:00 PM',
  admissionSession: '2026–27',
  mapEmbedUrl: '',
  copyrightYear: 2026,
};

export const stats = [
  { id: 1, value: 310, suffix: '+', label: 'Students' },
  { id: 2, value: 22, suffix: '', label: 'Dedicated Teachers' },
  { id: 3, value: 3, suffix: '', label: 'Senior Sec. Streams' },
  { id: 4, value: 14, suffix: '', label: 'Classes: Nursery–12' },
];

export const announcements = [
  { id: 1, text: '📢 Admissions open for Session 2026–27 — Nursery to Class 12' },
  { id: 2, text: '📝 Annual Examination date sheet released — check Downloads' },
  { id: 3, text: '🏆 Class 12 Board Results: 96% pass percentage this year' },
  { id: 4, text: '🎉 Annual Function on 20th December — parents are invited' },
];

export const hero = {
  kicker: 'Welcome to AKM Public Sr. Sec. School',
  titleLead: 'A Strong Start,',
  titleAccent: 'From Nursery to Class 12',
  description:
    'Quality education under the Himachal Pradesh Board of School Education (HPBOSE), in both English and Hindi medium — with a focus on academics, discipline, practical learning and the overall growth of every student.',
  // Uploaded through the admin panel; null falls back to the caption below.
  image: null,
  imageCaption: 'Real school / campus photo here (students & activities)',
  badges: [
    { id: 1, title: 'HPBOSE', subtitle: 'Affiliated Board' },
    { id: 2, title: 'English + Hindi', subtitle: 'Dual Medium' },
  ],
};

export const academicStages = [
  {
    id: 1,
    title: 'Pre-Primary',
    classRange: 'Nursery – UKG',
    description: 'Language, numbers, creativity and social skills through play-based activities.',
    emoji: '🧸',
    accentColor: '#e3a81c',
  },
  {
    id: 2,
    title: 'Primary',
    classRange: 'Classes 1 – 5',
    description: 'Strong foundations in languages, maths, EVS and general knowledge.',
    emoji: '📖',
    accentColor: '#d0342c',
  },
  {
    id: 3,
    title: 'Middle School',
    classRange: 'Classes 6 – 8',
    description: 'Concept-based learning, projects, practical work and independent study.',
    emoji: '🔬',
    accentColor: '#12307f',
  },
  {
    id: 4,
    title: 'Secondary',
    classRange: 'Classes 9 – 10',
    description: 'Full HPBOSE curriculum with focused board exam preparation.',
    emoji: '📝',
    accentColor: '#4a3324',
  },
  {
    id: 5,
    title: 'Senior Secondary',
    classRange: 'Classes 11 – 12',
    description: 'Science (Medical & Non-Medical) and Arts streams as per HPBOSE.',
    emoji: '🎓',
    accentColor: '#1466bc',
  },
];

export const principal = {
  id: 1,
  name: 'Mrs. Sunita Sharma',
  designation: 'Principal, AKM Public Sr. Sec. School',
  photo: null,
  photoCaption: "Principal's Photo Here",
  heading: "Nurturing Every Child's Potential",
  message:
    'At AKM Public Sr. Sec. School, we believe education is not just about textbooks — it is about building confidence, discipline, values and curiosity. Our dedicated team of 22 teachers works every day to give each of our 310 students individual attention and a supportive environment to learn, explore and grow.',
};

export const streams = [
  {
    id: 1,
    slug: 'science-medical',
    title: 'Science — Medical',
    emoji: '🩺',
    description: 'For students aiming at medical and life-science careers.',
    subjects: ['Physics, Chemistry, Biology', 'Science laboratory practicals', 'HPBOSE prescribed subjects'],
  },
  {
    id: 2,
    slug: 'science-non-medical',
    title: 'Science — Non-Medical',
    emoji: '⚙️',
    description: 'For students aiming at engineering and technical fields.',
    subjects: ['Physics, Chemistry, Mathematics', 'Practical & analytical learning', 'HPBOSE prescribed subjects'],
  },
  {
    id: 3,
    slug: 'arts',
    title: 'Arts',
    emoji: '🎨',
    description: 'For students interested in humanities and social sciences.',
    subjects: ['Humanities subject group', 'Communication & language skills', 'HPBOSE prescribed subjects'],
  },
];

export const facilities = [
  {
    id: 1,
    icon: '💻',
    title: 'Computer & IT Lab',
    description: 'Digital skills and computer-based learning for every level.',
  },
  {
    id: 2,
    icon: '🧪',
    title: 'Science Laboratories',
    description: 'Hands-on practicals that take concepts beyond textbooks.',
  },
  {
    id: 3,
    icon: '🏸',
    title: 'Indoor Playground',
    description: 'Recreational and physical activities inside the campus.',
  },
  {
    id: 4,
    icon: '🏫',
    title: 'Classrooms',
    description: 'Disciplined, engaging classrooms with individual attention.',
  },
];

export const achievements = [
  {
    id: 1,
    medal: '🥇',
    studentName: 'Anjali Thakur',
    classLabel: 'Class 12',
    score: '94.2%',
    description: 'School topper, Science (Medical), HPBOSE Board 2026',
    year: 2026,
    type: 'academic',
  },
  {
    id: 2,
    medal: '🥈',
    studentName: 'Rohit Verma',
    classLabel: 'Class 10',
    score: '92.8%',
    description: 'School topper, HPBOSE Matric Board 2026',
    year: 2026,
    type: 'academic',
  },
  {
    id: 3,
    medal: '🏆',
    studentName: 'District Level Winners',
    classLabel: null,
    score: '12+',
    description: 'Prizes in sports, quiz and cultural competitions this year',
    year: 2026,
    type: 'sports',
  },
];

export const notices = [
  {
    id: 1,
    slug: 'annual-examination-date-sheet-released',
    title: 'Annual Examination Date Sheet Released',
    excerpt: 'Date sheet for Classes 1–9 and 11 is now available in Downloads.',
    body: 'The annual examination date sheet for Classes 1–9 and Class 11 has been released and is now available in the Downloads section. Parents are requested to note the dates and ensure students reach school at least 20 minutes before each paper. Admit cards will be issued by class teachers one week before the examinations begin.',
    noticeDate: '2026-03-15',
    category: 'exam',
    isPinned: true,
  },
  {
    id: 2,
    slug: 'admissions-open-for-session-2026-27',
    title: 'Admissions Open for Session 2026–27',
    excerpt: 'Nursery to Class 12 — visit the school office or send an enquiry online.',
    body: 'Admissions for the academic session 2026–27 are now open for Nursery through Class 12, in both English and Hindi medium. Parents may visit the school office between 8:00 AM and 2:00 PM on any working day, or submit an enquiry through the contact form on this website. Required documents include the previous school report card, transfer certificate, birth certificate and two passport-size photographs.',
    noticeDate: '2026-03-02',
    category: 'admission',
    isPinned: false,
  },
  {
    id: 3,
    slug: 'republic-day-celebration',
    title: 'Republic Day Celebration',
    excerpt: 'Cultural programme and prize distribution held at the school campus.',
    body: 'The school celebrated Republic Day with flag hoisting by the Principal, followed by a cultural programme presented by students of all classes. Prizes were distributed to winners of the essay writing, drawing and patriotic song competitions held during the preceding week.',
    noticeDate: '2026-01-26',
    category: 'event',
    isPinned: false,
  },
  {
    id: 4,
    slug: 'house-test-results-announced',
    title: 'House Test Results Announced',
    excerpt: 'Results for the latest house tests are available with class teachers.',
    body: 'Results of the recently concluded house tests have been compiled and are available with the respective class teachers. Parents are encouraged to meet the class teacher during school hours to discuss their ward’s performance and areas for improvement.',
    noticeDate: '2026-01-10',
    category: 'result',
    isPinned: false,
  },
];

export const galleryAlbums = [
  {
    id: 1,
    slug: 'campus',
    title: 'Campus',
    description: 'Our school building, grounds and surroundings.',
    coverImage: null,
    theme: 'g1',
    eventDate: null,
    images: [],
  },
  {
    id: 2,
    slug: 'classrooms',
    title: 'Classrooms',
    description: 'Where the day-to-day learning happens.',
    coverImage: null,
    theme: 'g2',
    eventDate: null,
    images: [],
  },
  {
    id: 3,
    slug: 'sports-day',
    title: 'Sports Day',
    description: 'Annual athletics meet and inter-house competitions.',
    coverImage: null,
    theme: 'g3',
    eventDate: null,
    images: [],
  },
  {
    id: 4,
    slug: 'cultural-events',
    title: 'Cultural Events',
    description: 'Annual function, festivals and celebrations.',
    coverImage: null,
    theme: 'g4',
    eventDate: null,
    images: [],
  },
];

export const admission = {
  heading: `Admissions Open ${settings.admissionSession}`,
  description:
    'A simple, transparent admission process for every parent — Nursery to Class 12.',
  points: [
    'Easy admission steps & guidance',
    'English & Hindi medium options',
    'Affordable fee structure',
    'Quick document submission',
  ],
};

export const downloads = [
  {
    id: 1,
    title: 'Annual Examination Date Sheet 2026',
    category: 'datesheet',
    filePath: null,
    fileSize: null,
  },
  {
    id: 2,
    title: 'Admission Form 2026–27',
    category: 'form',
    filePath: null,
    fileSize: null,
  },
  {
    id: 3,
    title: 'School Prospectus',
    category: 'general',
    filePath: null,
    fileSize: null,
  },
];

/** Everything the homepage needs — mirrors GET /api/v1/home. */
export const homePayload = {
  settings,
  stats,
  hero,
  academicStages,
  principal,
  streams,
  facilities,
  achievements,
  notices: notices.slice(0, 4),
  galleryAlbums,
  admission,
};
