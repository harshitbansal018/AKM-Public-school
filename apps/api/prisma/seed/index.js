/**
 * Seeds the database with the content that was hardcoded in the original
 * static index.html — the same values bundled in
 * apps/web/src/data/fallback.js.
 *
 * Idempotent: safe to run repeatedly. Rows are matched on a natural key
 * (slug, email, title) and updated rather than duplicated.
 */
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

const log = (message) => console.log(`  ${message}`);

// ---------------------------------------------------------------- users

async function seedUsers() {
  const email = (process.env.SEED_ADMIN_EMAIL || 'admin@akmpublicschool.in').toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD || 'Admin@12345';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    log(`admin already exists (${email})`);
    return;
  }

  await prisma.user.create({
    data: {
      name: process.env.SEED_ADMIN_NAME || 'School Administrator',
      email,
      passwordHash: await bcrypt.hash(password, 10),
      role: 'ADMIN',
    },
  });

  log(`admin created — ${email} / ${password}`);
}

// ------------------------------------------------------------- settings

const SETTINGS = [
  // contact
  ['schoolName', 'AKM Public Sr. Sec. School', 'general', 'School name'],
  ['tagline', 'Nursery to Class 12 • HPBOSE Affiliated', 'general', 'Tagline'],
  ['phonePrimary', '+91 98765 43210', 'contact', 'Primary phone'],
  ['phoneSecondary', '+91 91234 56789', 'contact', 'Secondary phone'],
  ['whatsapp', '919876543210', 'contact', 'WhatsApp number'],
  ['email', 'info@akmpublicschool.in', 'contact', 'Email address'],
  ['addressShort', 'Main Road, Tehsil & District, Himachal Pradesh', 'contact', 'Short address'],
  [
    'addressFull',
    'AKM Public Sr. Sec. School, Main Road, Tehsil & District, Himachal Pradesh — 176xxx',
    'contact',
    'Full address',
  ],
  ['timings', 'Monday – Saturday, 8:00 AM – 2:00 PM', 'contact', 'School timings'],
  ['timingsShort', 'Mon–Sat, 8:00 AM – 2:00 PM', 'contact', 'Short timings'],
  ['mapEmbedUrl', '', 'contact', 'Google Maps embed URL'],

  // stats
  ['stat_students', '310', 'stats', 'Students'],
  ['stat_teachers', '22', 'stats', 'Teachers'],
  ['stat_streams', '3', 'stats', 'Senior secondary streams'],
  ['stat_classes', '14', 'stats', 'Classes offered'],

  // hero
  ['hero_kicker', 'Welcome to AKM Public Sr. Sec. School', 'general', 'Hero kicker'],
  ['hero_title_lead', 'A Strong Start,', 'general', 'Hero title (first line)'],
  ['hero_title_accent', 'From Nursery to Class 12', 'general', 'Hero title (accent)'],
  [
    'hero_description',
    'Quality education under the Himachal Pradesh Board of School Education (HPBOSE), in both English and Hindi medium — with a focus on academics, discipline, practical learning and the overall growth of every student.',
    'general',
    'Hero description',
  ],
  [
    'hero_image_caption',
    'Real school / campus photo here (students & activities)',
    'general',
    'Hero image caption',
  ],
  // Uploaded from the admin panel; blank shows the caption placeholder instead.
  ['hero_image', '', 'general', 'Hero image'],
  ['hero_badge_1_title', 'HPBOSE', 'general', 'Hero badge 1'],
  ['hero_badge_1_sub', 'Affiliated Board', 'general', 'Hero badge 1 subtitle'],
  ['hero_badge_2_title', 'English + Hindi', 'general', 'Hero badge 2'],
  ['hero_badge_2_sub', 'Dual Medium', 'general', 'Hero badge 2 subtitle'],

  // admissions
  ['admissionSession', '2026–27', 'general', 'Admission session'],
  [
    'admission_description',
    'A simple, transparent admission process for every parent — Nursery to Class 12.',
    'general',
    'Admission description',
  ],
  [
    'admission_points',
    'Easy admission steps & guidance|English & Hindi medium options|Affordable fee structure|Quick document submission',
    'general',
    'Admission points (pipe separated)',
  ],

  ['copyrightYear', '2026', 'general', 'Copyright year'],

  /* ------------------------------------------------------------------
     Per-page copy.
     Everything below used to be hardcoded inside the page components.
     Encoding for the list fields:
       lines  →  "one|two|three"
       pairs  →  "Heading::Body text|Heading::Body text"
     ------------------------------------------------------------------ */

  // ---- About ----
  ['page_about_title', 'About Our School', 'page_about', 'Page title'],
  ['page_about_subtitle', 'Quality HPBOSE education from Nursery to Class 12, in English and Hindi medium.', 'page_about', 'Page subtitle'],
  ['about_intro_heading', 'Who We Are', 'page_about', 'Intro heading'],
  [
    'about_intro_body',
    'AKM Public Sr. Sec. School is affiliated to the Himachal Pradesh Board of School Education (HPBOSE) and teaches every class from Nursery through Class 12. Families can choose English or Hindi medium, and senior students choose between Science (Medical), Science (Non-Medical) and Arts.\n\nClass sizes stay small enough that every child is known by name. That is the part of the school we are proudest of.',
    'page_about',
    'Intro paragraphs',
  ],
  ['about_values_heading', 'What We Stand For', 'page_about', 'Values heading'],
  [
    'about_values_items',
    'Academics that hold up.::A full HPBOSE curriculum, taught thoroughly, with focused board preparation in Classes 10 and 12.|Discipline with warmth.::Clear expectations, held kindly — so students feel secure rather than scared.|Learning by doing.::Science and computer labs, projects and practical work from the middle school years onward.|The whole child.::Sports, cultural events and competitions, because school is more than examinations.',
    'page_about',
    'Values list',
  ],
  ['about_structure_tag', 'Academic Structure', 'page_about', 'Structure — label'],
  ['about_structure_title', 'Every Stage, Under One Roof', 'page_about', 'Structure — heading'],
  ['about_structure_description', 'A child can join at Nursery and finish Class 12 without ever changing schools.', 'page_about', 'Structure — description'],

  // ---- Academics ----
  ['page_academics_title', 'Academics', 'page_academics', 'Page title'],
  ['page_academics_subtitle', 'A structured HPBOSE journey — from playful early learning to board exam preparation.', 'page_academics', 'Page subtitle'],
  ['academics_stages_tag', 'Learning Stages', 'page_academics', 'Stages — label'],
  ['academics_stages_title', 'One School, Every Learning Stage', 'page_academics', 'Stages — heading'],
  ['academics_stages_description', 'Each stage builds on the one before it, so nothing is rushed and nothing is skipped.', 'page_academics', 'Stages — description'],
  ['academics_streams_tag', 'Classes 11 & 12', 'page_academics', 'Streams — label'],
  ['academics_streams_title', 'Choose Your Stream', 'page_academics', 'Streams — heading'],
  ['academics_streams_description', 'Students study subjects prescribed by HPBOSE for their selected stream, in English or Hindi medium.', 'page_academics', 'Streams — description'],
  ['academics_medium_tag', 'Medium of Instruction', 'page_academics', 'Medium — label'],
  ['academics_medium_title', 'English and Hindi, Side by Side', 'page_academics', 'Medium — heading'],
  ['academics_medium_description', 'Parents choose the medium at the time of admission. Both follow the same HPBOSE syllabus and sit the same board examinations.', 'page_academics', 'Medium — description'],

  // ---- Admissions ----
  ['page_admissions_subtitle', 'Open for Nursery to Class 12, in English and Hindi medium.', 'page_admissions', 'Page subtitle'],
  ['admissions_steps_tag', 'How It Works', 'page_admissions', 'Steps — label'],
  ['admissions_steps_title', 'Four Steps, Start to Finish', 'page_admissions', 'Steps — heading'],
  ['admissions_steps_description', 'No agents, no queues — parents deal directly with the school office.', 'page_admissions', 'Steps — description'],
  [
    'admissions_steps_items',
    'Send an enquiry::Fill the form on this page, call the school office, or send a WhatsApp message. We will call you back.|Visit the campus::Come and see the classrooms and labs, and meet the class teacher for the class you are applying to.|Submit documents::Birth certificate, previous report card, transfer certificate (if applicable) and two passport photographs.|Confirm the seat::Pay the admission fee at the office and collect the fee receipt, book list and uniform details.',
    'page_admissions',
    'The steps',
  ],
  ['admissions_form_heading', 'Admission Enquiry', 'page_admissions', 'Enquiry form — heading'],
  ['admissions_form_intro', 'Leave your number and the class you are applying for. Someone from the office will call you, usually within one working day.', 'page_admissions', 'Enquiry form — intro'],
  ['admissions_docs_tag', 'Documents', 'page_admissions', 'Documents — label'],
  ['admissions_docs_title', 'What to Bring', 'page_admissions', 'Documents — heading'],
  [
    'admissions_docs_items',
    'Birth certificate (original + one photocopy)|Previous school report card / marksheet|Transfer certificate, for students joining from another school|Two recent passport-size photographs of the student|Aadhaar card of the student and one parent|Caste or category certificate, where applicable',
    'page_admissions',
    'Documents list',
  ],

  // ---- Faculty & Staff ----
  ['page_faculty_title', 'Faculty & Staff', 'page_faculty', 'Page title'],
  ['page_faculty_subtitle', 'The teachers and staff who run the school day to day.', 'page_faculty', 'Page subtitle'],
  ['faculty_principal_tag', 'Head of the School', 'page_faculty', 'Principal — small label'],
  ['faculty_team_tag', 'Our Team', 'page_faculty', 'Team — small label'],
  ['faculty_team_title', 'Teaching & Support Staff', 'page_faculty', 'Team — heading'],
  [
    'faculty_team_description',
    'Our teachers are grouped by the subject they teach, so parents can find the right person quickly.',
    'page_faculty',
    'Team — description',
  ],
  ['faculty_admin_group_label', 'Administration & Support', 'page_faculty', 'Group name for staff with no subject'],
  ['faculty_empty_title', 'Staff details coming soon', 'page_faculty', 'Empty — heading'],
  [
    'faculty_empty_description',
    'The school is preparing the staff list. Please contact the office in the meantime.',
    'page_faculty',
    'Empty — description',
  ],
  ['faculty_join_tag', 'Work With Us', 'page_faculty', 'Careers — small label'],
  ['faculty_join_title', 'Interested in Teaching Here?', 'page_faculty', 'Careers — heading'],
  [
    'faculty_join_description',
    'We welcome enquiries from qualified teachers. Write to the school office with your details.',
    'page_faculty',
    'Careers — description',
  ],

  // ---- Campus & facilities ----
  ['page_facilities_title', 'Campus & Facilities', 'page_facilities', 'Page title'],
  ['page_facilities_subtitle', 'A supportive environment where students can learn, practise and play.', 'page_facilities', 'Page subtitle'],
  ['facilities_main_tag', 'On Campus', 'page_facilities', 'Facilities — label'],
  ['facilities_main_title', 'Everything a School Day Needs', 'page_facilities', 'Facilities — heading'],
  ['facilities_main_description', 'Facilities are shared across all classes, so even primary students get lab and computer time.', 'page_facilities', 'Facilities — description'],
  ['facilities_visit_tag', 'Visit Us', 'page_facilities', 'Visit — label'],
  ['facilities_visit_title', 'See It for Yourself', 'page_facilities', 'Visit — heading'],
  ['facilities_visit_description', 'Parents are welcome to visit the campus on any working day between 8:00 AM and 2:00 PM.', 'page_facilities', 'Visit — description'],

  // ---- Results & toppers ----
  ['page_achievements_title', 'Results & Toppers', 'page_achievements', 'Page title'],
  ['page_achievements_subtitle', 'Board results, competition wins and the students behind them.', 'page_achievements', 'Page subtitle'],
  ['achievements_section_title', 'Our Proud Moments', 'page_achievements', 'Section heading'],
  ['achievements_empty_title', 'No achievements published yet', 'page_achievements', 'Empty — heading'],
  ['achievements_empty_description', 'Results and toppers will appear here as soon as they are announced.', 'page_achievements', 'Empty — description'],

  // ---- News & notices ----
  ['page_notices_title', 'News & Notices', 'page_notices', 'Page title'],
  ['page_notices_subtitle', 'Announcements, date sheets, results and school events.', 'page_notices', 'Page subtitle'],
  ['notices_empty_title', 'No notices in this category', 'page_notices', 'Empty — heading'],
  ['notices_empty_description', 'Try another category, or check back after the next school announcement.', 'page_notices', 'Empty — description'],

  // ---- Gallery ----
  ['page_gallery_title', 'Gallery', 'page_gallery', 'Page title'],
  ['page_gallery_subtitle', 'Life at AKM — campus, classrooms, events and student activities.', 'page_gallery', 'Page subtitle'],
  ['gallery_empty_title', 'No albums yet', 'page_gallery', 'Empty — heading'],
  ['gallery_empty_description', 'Photo albums will appear here once the school office uploads them.', 'page_gallery', 'Empty — description'],

  // ---- Downloads ----
  ['page_downloads_title', 'Downloads', 'page_downloads', 'Page title'],
  ['page_downloads_subtitle', 'Date sheets, forms and other documents for parents and students.', 'page_downloads', 'Page subtitle'],
  ['downloads_empty_title', 'No downloads available yet', 'page_downloads', 'Empty — heading'],
  ['downloads_empty_description', 'Date sheets and forms will be published here through the school office.', 'page_downloads', 'Empty — description'],

  // ---- Contact ----
  ['page_contact_title', 'Contact Us', 'page_contact', 'Page title'],
  ['page_contact_subtitle', 'Call, write, or send an enquiry — the school office answers on working days.', 'page_contact', 'Page subtitle'],
  ['contact_section_tag', 'Get in Touch', 'page_contact', 'Section label'],
  ['contact_section_title', 'Contact & Admission Enquiry', 'page_contact', 'Section heading'],
];

async function seedSettings() {
  await prisma.$transaction(
    SETTINGS.map(([key, value, group, label]) =>
      prisma.setting.upsert({
        where: { key },
        update: { value, group, label },
        create: { key, value, group, label },
      })
    )
  );
  log(`${SETTINGS.length} settings`);
}

// -------------------------------------------------------- announcements

const ANNOUNCEMENTS = [
  '📢 Admissions open for Session 2026–27 — Nursery to Class 12',
  '📝 Annual Examination date sheet released — check Downloads',
  '🏆 Class 12 Board Results: 96% pass percentage this year',
  '🎉 Annual Function on 20th December — parents are invited',
];

async function seedAnnouncements() {
  if ((await prisma.announcement.count()) > 0) {
    log('announcements already present — skipped');
    return;
  }
  await prisma.announcement.createMany({
    data: ANNOUNCEMENTS.map((text, index) => ({ text, sortOrder: index })),
  });
  log(`${ANNOUNCEMENTS.length} announcements`);
}

// ------------------------------------------------------ academic stages

const STAGES = [
  ['Pre-Primary', 'Nursery – UKG', 'Language, numbers, creativity and social skills through play-based activities.', '🧸', '#e3a81c'],
  ['Primary', 'Classes 1 – 5', 'Strong foundations in languages, maths, EVS and general knowledge.', '📖', '#d0342c'],
  ['Middle School', 'Classes 6 – 8', 'Concept-based learning, projects, practical work and independent study.', '🔬', '#12307f'],
  ['Secondary', 'Classes 9 – 10', 'Full HPBOSE curriculum with focused board exam preparation.', '📝', '#4a3324'],
  ['Senior Secondary', 'Classes 11 – 12', 'Science (Medical & Non-Medical) and Arts streams as per HPBOSE.', '🎓', '#1466bc'],
];

async function seedStages() {
  for (const [index, [title, classRange, description, emoji, accentColor]] of STAGES.entries()) {
    const existing = await prisma.academicStage.findFirst({ where: { title } });
    const data = { title, classRange, description, emoji, accentColor, sortOrder: index };
    if (existing) await prisma.academicStage.update({ where: { id: existing.id }, data });
    else await prisma.academicStage.create({ data });
  }
  log(`${STAGES.length} academic stages`);
}

// -------------------------------------------------------------- streams

const STREAMS = [
  ['science-medical', 'Science — Medical', '🩺', 'For students aiming at medical and life-science careers.', ['Physics, Chemistry, Biology', 'Science laboratory practicals', 'HPBOSE prescribed subjects']],
  ['science-non-medical', 'Science — Non-Medical', '⚙️', 'For students aiming at engineering and technical fields.', ['Physics, Chemistry, Mathematics', 'Practical & analytical learning', 'HPBOSE prescribed subjects']],
  ['arts', 'Arts', '🎨', 'For students interested in humanities and social sciences.', ['Humanities subject group', 'Communication & language skills', 'HPBOSE prescribed subjects']],
];

async function seedStreams() {
  for (const [index, [slug, title, emoji, description, subjects]] of STREAMS.entries()) {
    const data = { slug, title, emoji, description, subjects, sortOrder: index };
    await prisma.stream.upsert({ where: { slug }, update: data, create: data });
  }
  log(`${STREAMS.length} streams`);
}

// ----------------------------------------------------------- facilities

const FACILITIES = [
  ['Computer & IT Lab', 'Digital skills and computer-based learning for every level.', '💻'],
  ['Science Laboratories', 'Hands-on practicals that take concepts beyond textbooks.', '🧪'],
  ['Indoor Playground', 'Recreational and physical activities inside the campus.', '🏸'],
  ['Classrooms', 'Disciplined, engaging classrooms with individual attention.', '🏫'],
];

async function seedFacilities() {
  for (const [index, [title, description, icon]] of FACILITIES.entries()) {
    const existing = await prisma.facility.findFirst({ where: { title } });
    const data = { title, description, icon, sortOrder: index };
    if (existing) await prisma.facility.update({ where: { id: existing.id }, data });
    else await prisma.facility.create({ data });
  }
  log(`${FACILITIES.length} facilities`);
}

// -------------------------------------------------------------- faculty

async function seedFaculty() {
  const name = 'Mrs. Sunita Sharma';
  const data = {
    name,
    designation: 'Principal, AKM Public Sr. Sec. School',
    qualification: "Nurturing Every Child's Potential",
    message:
      'At AKM Public Sr. Sec. School, we believe education is not just about textbooks — it is about building confidence, discipline, values and curiosity. Our dedicated team of 22 teachers works every day to give each of our 310 students individual attention and a supportive environment to learn, explore and grow.',
    isPrincipal: true,
    sortOrder: 0,
  };

  const existing = await prisma.faculty.findFirst({ where: { name } });
  if (existing) await prisma.faculty.update({ where: { id: existing.id }, data });
  else await prisma.faculty.create({ data });

  log('principal');
}

// --------------------------------------------------------- achievements

const ACHIEVEMENTS = [
  ['Anjali Thakur', 'Class 12', '94.2%', 'School topper, Science (Medical), HPBOSE Board 2026', '🥇', 2026, 'academic'],
  ['Rohit Verma', 'Class 10', '92.8%', 'School topper, HPBOSE Matric Board 2026', '🥈', 2026, 'academic'],
  ['District Level Winners', null, '12+', 'Prizes in sports, quiz and cultural competitions this year', '🏆', 2026, 'sports'],
];

async function seedAchievements() {
  for (const [index, row] of ACHIEVEMENTS.entries()) {
    const [studentName, classLabel, score, description, medal, year, type] = row;
    const existing = await prisma.achievement.findFirst({ where: { studentName, year } });
    const data = { studentName, classLabel, score, description, medal, year, type, sortOrder: index };
    if (existing) await prisma.achievement.update({ where: { id: existing.id }, data });
    else await prisma.achievement.create({ data });
  }
  log(`${ACHIEVEMENTS.length} achievements`);
}

// -------------------------------------------------------------- notices

const NOTICES = [
  {
    slug: 'annual-examination-date-sheet-released',
    title: 'Annual Examination Date Sheet Released',
    excerpt: 'Date sheet for Classes 1–9 and 11 is now available in Downloads.',
    body: 'The annual examination date sheet for Classes 1–9 and Class 11 has been released and is now available in the Downloads section. Parents are requested to note the dates and ensure students reach school at least 20 minutes before each paper. Admit cards will be issued by class teachers one week before the examinations begin.',
    noticeDate: '2026-03-15',
    category: 'exam',
    isPinned: true,
  },
  {
    slug: 'admissions-open-for-session-2026-27',
    title: 'Admissions Open for Session 2026–27',
    excerpt: 'Nursery to Class 12 — visit the school office or send an enquiry online.',
    body: 'Admissions for the academic session 2026–27 are now open for Nursery through Class 12, in both English and Hindi medium. Parents may visit the school office between 8:00 AM and 2:00 PM on any working day, or submit an enquiry through the contact form on this website. Required documents include the previous school report card, transfer certificate, birth certificate and two passport-size photographs.',
    noticeDate: '2026-03-02',
    category: 'admission',
    isPinned: false,
  },
  {
    slug: 'republic-day-celebration',
    title: 'Republic Day Celebration',
    excerpt: 'Cultural programme and prize distribution held at the school campus.',
    body: 'The school celebrated Republic Day with flag hoisting by the Principal, followed by a cultural programme presented by students of all classes. Prizes were distributed to winners of the essay writing, drawing and patriotic song competitions held during the preceding week.',
    noticeDate: '2026-01-26',
    category: 'event',
    isPinned: false,
  },
  {
    slug: 'house-test-results-announced',
    title: 'House Test Results Announced',
    excerpt: 'Results for the latest house tests are available with class teachers.',
    body: 'Results of the recently concluded house tests have been compiled and are available with the respective class teachers. Parents are encouraged to meet the class teacher during school hours to discuss their ward performance and areas for improvement.',
    noticeDate: '2026-01-10',
    category: 'result',
    isPinned: false,
  },
];

async function seedNotices() {
  for (const notice of NOTICES) {
    const data = { ...notice, noticeDate: new Date(notice.noticeDate) };
    await prisma.notice.upsert({ where: { slug: notice.slug }, update: data, create: data });
  }
  log(`${NOTICES.length} notices`);
}

// -------------------------------------------------------------- gallery

const ALBUMS = [
  ['campus', 'Campus', 'Our school building, grounds and surroundings.'],
  ['classrooms', 'Classrooms', 'Where the day-to-day learning happens.'],
  ['sports-day', 'Sports Day', 'Annual athletics meet and inter-house competitions.'],
  ['cultural-events', 'Cultural Events', 'Annual function, festivals and celebrations.'],
];

async function seedGallery() {
  for (const [index, [slug, title, description]] of ALBUMS.entries()) {
    const data = { slug, title, description, sortOrder: index };
    await prisma.galleryAlbum.upsert({ where: { slug }, update: data, create: data });
  }
  log(`${ALBUMS.length} gallery albums`);
}

// ----------------------------------------------------------------- run

async function main() {
  console.log('\nSeeding AKM school database\n');

  await seedUsers();
  await seedSettings();
  await seedAnnouncements();
  await seedStages();
  await seedStreams();
  await seedFacilities();
  await seedFaculty();
  await seedAchievements();
  await seedNotices();
  await seedGallery();

  console.log('\nDone.\n');
}

main()
  .catch((error) => {
    console.error('\nSeed failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
