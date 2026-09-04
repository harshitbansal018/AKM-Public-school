import * as settingService from './setting.service.js';
import * as announcementService from './announcement.service.js';
import * as noticeService from './notice.service.js';
import * as galleryService from './gallery.service.js';
import {
  academicStageService,
  streamService,
  facilityService,
  facultyService,
  achievementService,
} from './content.service.js';

/**
 * Everything the homepage needs, in one round trip.
 *
 * The shape here is contractual: it mirrors `homePayload` in
 * apps/web/src/data/fallback.js exactly, so the frontend swaps between bundled
 * content and live data without a single component change.
 */
export async function getHomePayload() {
  const [settings, announcements, stages, streams, facilities, principal, achievements, notices, albums] =
    await Promise.all([
      settingService.getPublicSettings(),
      announcementService.listActive(),
      academicStageService.listPublic(),
      streamService.listPublic(),
      facilityService.listPublic(),
      facultyService.getPrincipal(),
      achievementService.listPublic(),
      noticeService.latest(4),
      galleryService.listPublic(),
    ]);

  return {
    settings,
    stats: await settingService.getStats(),
    announcements,
    hero: buildHero(settings),
    academicStages: stages,
    principal: buildPrincipal(principal),
    streams: streams.map(withParsedSubjects),
    facilities,
    achievements,
    notices,
    galleryAlbums: albums,
    admission: buildAdmission(settings),
  };
}

function buildHero(settings) {
  return {
    kicker: settings.hero_kicker ?? `Welcome to ${settings.schoolName ?? 'our school'}`,
    titleLead: settings.hero_title_lead ?? 'A Strong Start,',
    titleAccent: settings.hero_title_accent ?? 'From Nursery to Class 12',
    description: settings.hero_description ?? '',
    imageCaption: settings.hero_image_caption ?? '',
    badges: [
      { id: 1, title: settings.hero_badge_1_title ?? 'HPBOSE', subtitle: settings.hero_badge_1_sub ?? 'Affiliated Board' },
      { id: 2, title: settings.hero_badge_2_title ?? 'English + Hindi', subtitle: settings.hero_badge_2_sub ?? 'Dual Medium' },
    ],
  };
}

function buildPrincipal(person) {
  if (!person) return null;
  return {
    id: person.id,
    name: person.name,
    designation: person.designation,
    photo: person.photo,
    photoCaption: "Principal's Photo Here",
    heading: person.qualification || "Nurturing Every Child's Potential",
    message: person.message ?? '',
  };
}

function buildAdmission(settings) {
  const points = settings.admission_points
    ? String(settings.admission_points).split('|').map((point) => point.trim()).filter(Boolean)
    : [];

  return {
    heading: `Admissions Open ${settings.admissionSession ?? ''}`.trim(),
    description: settings.admission_description ?? '',
    points,
  };
}

/**
 * MariaDB returns a Json column as a string in some driver paths, so normalise
 * it here rather than making every consumer guess.
 */
function withParsedSubjects(stream) {
  let subjects = stream.subjects;
  if (typeof subjects === 'string') {
    try {
      subjects = JSON.parse(subjects);
    } catch {
      subjects = [];
    }
  }
  return { ...stream, subjects: Array.isArray(subjects) ? subjects : [] };
}

export { withParsedSubjects };
