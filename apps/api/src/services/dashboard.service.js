import {
  enquiryRepository,
  noticeRepository,
  galleryRepository,
  userRepository,
} from '../repositories/index.js';
import { ENQUIRY_STATUS } from '../config/constants.js';

/** Counts for the admin dashboard tiles, plus the newest few enquiries. */
export async function getSummary() {
  const [newEnquiries, totalEnquiries, publishedNotices, galleryAlbums, users, recent] =
    await Promise.all([
      enquiryRepository.countByStatus(ENQUIRY_STATUS.NEW),
      enquiryRepository.countAll(),
      noticeRepository.countPublished(),
      galleryRepository.countAlbums(),
      userRepository.count(),
      enquiryRepository.findPaged({ skip: 0, take: 5 }),
    ]);

  return {
    newEnquiries,
    totalEnquiries,
    publishedNotices,
    galleryAlbums,
    users,
    recentEnquiries: recent.items,
  };
}
