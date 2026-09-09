/**
 * The CMS map: which website page each setting belongs to, and where on it.
 *
 * The database stores settings as flat key/value rows grouped technically
 * (contact, general, stats). That is fine for code and useless for a person —
 * "hero_kicker" in a group called "general" tells a school clerk nothing.
 *
 * This map is the human layer. It says: this field lives on the Homepage, in
 * the top banner, and it is the small label above the headline. Purely
 * presentational — changing it never touches the database.
 *
 * Field types: text | textarea | number | image | lines
 *   lines — stored pipe-separated in one row, edited one per line
 */
export const cmsPages = [
  {
    id: 'home',
    label: 'Homepage',
    icon: '🏠',
    href: '/',
    description: 'The first page visitors see.',
    sections: [
      {
        id: 'hero',
        label: 'Top banner',
        help: 'The blue section at the very top, with the big headline and the photo beside it.',
        fields: [
          {
            key: 'hero_kicker',
            label: 'Small label above the headline',
            type: 'text',
            help: 'Sits in the dashed gold pill. Example: “Welcome to AKM Public Sr. Sec. School”.',
          },
          {
            key: 'hero_title_lead',
            label: 'Headline — first part',
            type: 'text',
            half: true,
            help: 'Shown in dark blue.',
          },
          {
            key: 'hero_title_accent',
            label: 'Headline — highlighted part',
            type: 'text',
            half: true,
            help: 'Shown in red, straight after the first part.',
          },
          {
            key: 'hero_description',
            label: 'Introduction paragraph',
            type: 'textarea',
            rows: 3,
            help: 'Two or three lines about the school, under the headline.',
          },
          {
            key: 'hero_image',
            label: 'Banner photo',
            type: 'image',
            folder: 'misc',
            help: 'A real photo of the school or students. A wide landscape photo works best.',
          },
          {
            key: 'hero_image_caption',
            label: 'Text shown until a photo is uploaded',
            type: 'text',
            help: 'A placeholder so the banner never looks empty. Ignored once a photo is added.',
          },
        ],
      },
      {
        id: 'hero-badges',
        label: 'Floating badges on the photo',
        help: 'The two small white cards that sit on the banner photo.',
        fields: [
          { key: 'hero_badge_1_title', label: 'First badge — title', type: 'text', half: true },
          { key: 'hero_badge_1_sub', label: 'First badge — small text', type: 'text', half: true },
          { key: 'hero_badge_2_title', label: 'Second badge — title', type: 'text', half: true },
          { key: 'hero_badge_2_sub', label: 'Second badge — small text', type: 'text', half: true },
        ],
      },
      {
        id: 'stats',
        label: 'Numbers strip',
        help: 'The four counters on the dark blue bar that count up as you scroll.',
        fields: [
          { key: 'stat_students', label: 'Students', type: 'number', half: true },
          { key: 'stat_teachers', label: 'Teachers', type: 'number', half: true },
          { key: 'stat_streams', label: 'Senior secondary streams', type: 'number', half: true },
          { key: 'stat_classes', label: 'Number of classes', type: 'number', half: true },
        ],
      },
      {
        id: 'admissions-box',
        label: 'Admissions box',
        help: 'The royal blue panel beside the notice board, and the same panel on the Admissions page.',
        fields: [
          {
            key: 'admissionSession',
            label: 'Session',
            type: 'text',
            half: true,
            help: 'Example: 2026–27. Appears in the heading and the top bar.',
          },
          {
            key: 'admission_description',
            label: 'Short description',
            type: 'textarea',
            rows: 2,
          },
          {
            key: 'admission_points',
            label: 'Bullet points',
            type: 'lines',
            rows: 5,
            help: 'One point per line. Each becomes a ★ bullet.',
          },
        ],
      },
    ],
  },

  {
    id: 'about',
    label: 'About page',
    icon: '🎓',
    href: '/about',
    description: 'The “About Our School” page.',
    sections: [
      {
        id: 'header',
        label: 'Page heading',
        fields: [
          { key: 'page_about_title', label: 'Page title', type: 'text', half: true },
          { key: 'page_about_subtitle', label: 'Subtitle', type: 'text', half: true },
        ],
      },
      {
        id: 'intro',
        label: 'Who we are',
        help: 'The opening block of text on the left.',
        fields: [
          { key: 'about_intro_heading', label: 'Heading', type: 'text' },
          {
            key: 'about_intro_body',
            label: 'Paragraphs',
            type: 'textarea',
            rows: 7,
            help: 'Leave a blank line between paragraphs.',
          },
        ],
      },
      {
        id: 'values',
        label: 'What we stand for',
        help: 'The white card on the right, with the gold ★ bullets.',
        fields: [
          { key: 'about_values_heading', label: 'Heading', type: 'text' },
          {
            key: 'about_values_items',
            label: 'Points',
            type: 'pairs',
            titleLabel: 'Point',
            bodyLabel: 'Explanation',
          },
        ],
      },
      {
        id: 'structure',
        label: 'Academic structure band',
        fields: [
          { key: 'about_structure_tag', label: 'Small label', type: 'text', half: true },
          { key: 'about_structure_title', label: 'Heading', type: 'text', half: true },
          { key: 'about_structure_description', label: 'Description', type: 'textarea', rows: 2 },
        ],
      },
    ],
  },

  {
    id: 'academics',
    label: 'Academics page',
    icon: '📚',
    href: '/academics',
    description: 'Learning stages, streams and medium of instruction.',
    sections: [
      {
        id: 'header',
        label: 'Page heading',
        fields: [
          { key: 'page_academics_title', label: 'Page title', type: 'text', half: true },
          { key: 'page_academics_subtitle', label: 'Subtitle', type: 'text', half: true },
        ],
      },
      {
        id: 'stages',
        label: 'Learning stages band',
        help: 'The cards themselves are edited under “Academic Stages” in the sidebar.',
        fields: [
          { key: 'academics_stages_tag', label: 'Small label', type: 'text', half: true },
          { key: 'academics_stages_title', label: 'Heading', type: 'text', half: true },
          { key: 'academics_stages_description', label: 'Description', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'streams',
        label: 'Streams band',
        help: 'The streams themselves are edited under “Streams” in the sidebar.',
        fields: [
          { key: 'academics_streams_tag', label: 'Small label', type: 'text', half: true },
          { key: 'academics_streams_title', label: 'Heading', type: 'text', half: true },
          { key: 'academics_streams_description', label: 'Description', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'medium',
        label: 'Medium of instruction band',
        fields: [
          { key: 'academics_medium_tag', label: 'Small label', type: 'text', half: true },
          { key: 'academics_medium_title', label: 'Heading', type: 'text', half: true },
          { key: 'academics_medium_description', label: 'Description', type: 'textarea', rows: 2 },
        ],
      },
    ],
  },

  {
    id: 'admissions',
    label: 'Admissions page',
    icon: '📝',
    href: '/admissions',
    description:
      'The admission process. The page title uses the session set on the Homepage tab.',
    sections: [
      {
        id: 'header',
        label: 'Page heading',
        fields: [{ key: 'page_admissions_subtitle', label: 'Subtitle', type: 'text' }],
      },
      {
        id: 'steps',
        label: 'How it works',
        help: 'The numbered step cards.',
        fields: [
          { key: 'admissions_steps_tag', label: 'Small label', type: 'text', half: true },
          { key: 'admissions_steps_title', label: 'Heading', type: 'text', half: true },
          { key: 'admissions_steps_description', label: 'Description', type: 'textarea', rows: 2 },
          {
            key: 'admissions_steps_items',
            label: 'The steps',
            type: 'pairs',
            titleLabel: 'Step title',
            bodyLabel: 'What happens',
            help: 'Each step keeps the icon that belongs to its position, so reordering the steps also reorders the icons. A fifth step onwards shows its number only.',
          },
        ],
      },
      {
        id: 'form',
        label: 'Enquiry form box',
        fields: [
          { key: 'admissions_form_heading', label: 'Heading', type: 'text' },
          { key: 'admissions_form_intro', label: 'Intro text', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'documents',
        label: 'Documents to bring',
        fields: [
          { key: 'admissions_docs_tag', label: 'Small label', type: 'text', half: true },
          { key: 'admissions_docs_title', label: 'Heading', type: 'text', half: true },
          {
            key: 'admissions_docs_items',
            label: 'Document list',
            type: 'lines',
            rows: 7,
            help: 'One document per line.',
          },
        ],
      },
      {
        id: 'map',
        label: 'Map box (beside the enquiry form)',
        fields: [
          {
            key: 'mapEmbedUrl',
            label: 'Google Map embed',
            type: 'map',
            help: 'The same map as the homepage and Contact page — changing it here changes it everywhere.',
          },
        ],
      },
    ],
  },

  {
    id: 'faculty',
    label: 'Faculty page',
    icon: '👩‍🏫',
    href: '/faculty',
    description:
      'Teaching and support staff. The people themselves are added under “Faculty” in the sidebar.',
    sections: [
      {
        id: 'header',
        label: 'Page heading',
        fields: [
          { key: 'page_faculty_title', label: 'Page title', type: 'text', half: true },
          { key: 'page_faculty_subtitle', label: 'Subtitle', type: 'text', half: true },
        ],
      },
      {
        id: 'principal',
        label: 'Principal block',
        help: 'The large photo and message at the top. Edited under Faculty → the person marked Principal.',
        fields: [
          { key: 'faculty_principal_tag', label: 'Small label above the name', type: 'text' },
        ],
      },
      {
        id: 'team',
        label: 'Staff list band',
        help: 'Teachers are grouped by the subject set on each person.',
        fields: [
          { key: 'faculty_team_tag', label: 'Small label', type: 'text', half: true },
          { key: 'faculty_team_title', label: 'Heading', type: 'text', half: true },
          { key: 'faculty_team_description', label: 'Description', type: 'textarea', rows: 2 },
          {
            key: 'faculty_admin_group_label',
            label: 'Group name for staff with no subject',
            type: 'text',
            help: 'Anyone without a subject is listed under this heading, at the end.',
          },
        ],
      },
      {
        id: 'careers',
        label: 'Work with us band',
        fields: [
          { key: 'faculty_join_tag', label: 'Small label', type: 'text', half: true },
          { key: 'faculty_join_title', label: 'Heading', type: 'text', half: true },
          { key: 'faculty_join_description', label: 'Description', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'empty',
        label: 'When no staff are published',
        fields: [
          { key: 'faculty_empty_title', label: 'Heading', type: 'text', half: true },
          { key: 'faculty_empty_description', label: 'Description', type: 'text', half: true },
        ],
      },
    ],
  },

  {
    id: 'facilities',
    label: 'Campus page',
    icon: '🏫',
    href: '/facilities',
    description: 'Campus and facilities. The facility cards are edited under “Facilities”.',
    sections: [
      {
        id: 'header',
        label: 'Page heading',
        fields: [
          { key: 'page_facilities_title', label: 'Page title', type: 'text', half: true },
          { key: 'page_facilities_subtitle', label: 'Subtitle', type: 'text', half: true },
        ],
      },
      {
        id: 'main',
        label: 'Facilities band',
        fields: [
          { key: 'facilities_main_tag', label: 'Small label', type: 'text', half: true },
          { key: 'facilities_main_title', label: 'Heading', type: 'text', half: true },
          { key: 'facilities_main_description', label: 'Description', type: 'textarea', rows: 2 },
        ],
      },
      {
        id: 'visit',
        label: 'Visit us band',
        fields: [
          { key: 'facilities_visit_tag', label: 'Small label', type: 'text', half: true },
          { key: 'facilities_visit_title', label: 'Heading', type: 'text', half: true },
          { key: 'facilities_visit_description', label: 'Description', type: 'textarea', rows: 2 },
        ],
      },
    ],
  },

  {
    id: 'achievements',
    label: 'Results page',
    icon: '🏆',
    href: '/achievements',
    description: 'Results and toppers. The entries themselves are edited under “Achievements”.',
    sections: [
      {
        id: 'header',
        label: 'Page heading',
        fields: [
          { key: 'page_achievements_title', label: 'Page title', type: 'text', half: true },
          { key: 'page_achievements_subtitle', label: 'Subtitle', type: 'text', half: true },
          { key: 'achievements_section_title', label: 'Section heading', type: 'text' },
        ],
      },
      {
        id: 'empty',
        label: 'When nothing is published yet',
        help: 'Shown only while there are no achievements.',
        fields: [
          { key: 'achievements_empty_title', label: 'Heading', type: 'text', half: true },
          { key: 'achievements_empty_description', label: 'Description', type: 'text', half: true },
        ],
      },
    ],
  },

  {
    id: 'notices',
    label: 'News & notices page',
    icon: '📌',
    href: '/notices',
    description: 'The notice list. Notices themselves are edited under “Notices”.',
    sections: [
      {
        id: 'header',
        label: 'Page heading',
        fields: [
          { key: 'page_notices_title', label: 'Page title', type: 'text', half: true },
          { key: 'page_notices_subtitle', label: 'Subtitle', type: 'text', half: true },
        ],
      },
      {
        id: 'empty',
        label: 'When a category is empty',
        fields: [
          { key: 'notices_empty_title', label: 'Heading', type: 'text', half: true },
          { key: 'notices_empty_description', label: 'Description', type: 'text', half: true },
        ],
      },
    ],
  },

  {
    id: 'gallery',
    label: 'Gallery page',
    icon: '🖼️',
    href: '/gallery',
    description: 'The album grid. Albums and photos are managed under “Gallery”.',
    sections: [
      {
        id: 'header',
        label: 'Page heading',
        fields: [
          { key: 'page_gallery_title', label: 'Page title', type: 'text', half: true },
          { key: 'page_gallery_subtitle', label: 'Subtitle', type: 'text', half: true },
        ],
      },
      {
        id: 'empty',
        label: 'When there are no albums',
        fields: [
          { key: 'gallery_empty_title', label: 'Heading', type: 'text', half: true },
          { key: 'gallery_empty_description', label: 'Description', type: 'text', half: true },
        ],
      },
    ],
  },

  {
    id: 'downloads',
    label: 'Downloads page',
    icon: '📄',
    href: '/downloads',
    description: 'The file list. Files are uploaded under “Downloads”.',
    sections: [
      {
        id: 'header',
        label: 'Page heading',
        fields: [
          { key: 'page_downloads_title', label: 'Page title', type: 'text', half: true },
          { key: 'page_downloads_subtitle', label: 'Subtitle', type: 'text', half: true },
        ],
      },
      {
        id: 'empty',
        label: 'When there are no files',
        fields: [
          { key: 'downloads_empty_title', label: 'Heading', type: 'text', half: true },
          { key: 'downloads_empty_description', label: 'Description', type: 'text', half: true },
        ],
      },
    ],
  },

  {
    id: 'contact',
    label: 'Contact details',
    icon: '📞',
    href: '/contact',
    description:
      'Used on the Contact page, in the top bar, in the footer and on the enquiry form — change it once here and it updates everywhere.',
    sections: [
      {
        id: 'header',
        label: 'Contact page heading',
        fields: [
          { key: 'page_contact_title', label: 'Page title', type: 'text', half: true },
          { key: 'page_contact_subtitle', label: 'Subtitle', type: 'text', half: true },
          { key: 'contact_section_tag', label: 'Section label', type: 'text', half: true },
          { key: 'contact_section_title', label: 'Section heading', type: 'text', half: true },
        ],
      },
      {
        id: 'phone',
        label: 'Phone & email',
        fields: [
          {
            key: 'phonePrimary',
            label: 'Main phone number',
            type: 'text',
            half: true,
            help: 'Shown in the top bar and footer.',
          },
          { key: 'phoneSecondary', label: 'Second phone number', type: 'text', half: true },
          {
            key: 'whatsapp',
            label: 'WhatsApp number',
            type: 'text',
            half: true,
            help: 'Digits only, with country code and no + or spaces. Example: 919876543210',
          },
          { key: 'email', label: 'Email address', type: 'text', half: true },
        ],
      },
      {
        id: 'address',
        label: 'Address',
        fields: [
          {
            key: 'addressShort',
            label: 'Short address',
            type: 'text',
            help: 'Used in the footer, where space is tight.',
          },
          {
            key: 'addressFull',
            label: 'Full address',
            type: 'textarea',
            rows: 2,
            help: 'Used on the Contact page, including the PIN code.',
          },
        ],
      },
      {
        id: 'hours',
        label: 'School timings',
        fields: [
          {
            key: 'timings',
            label: 'Full timings',
            type: 'text',
            help: 'Example: Monday – Saturday, 8:00 AM – 2:00 PM',
          },
          {
            key: 'timingsShort',
            label: 'Short timings',
            type: 'text',
            help: 'Used in the narrow top bar. Example: Mon–Sat, 8:00 AM – 2:00 PM',
          },
        ],
      },
      {
        id: 'map',
        label: 'Google Map',
        fields: [
          {
            key: 'mapEmbedUrl',
            label: 'Google Map embed',
            type: 'map',
            help: 'Shows on the homepage, the Contact page and the Admissions page. Leave blank for a placeholder.',
          },
        ],
      },
    ],
  },

  {
    id: 'identity',
    label: 'Header & footer',
    icon: '🏫',
    href: '/',
    description: 'The school name and tagline that appear on every page of the website.',
    sections: [
      {
        id: 'identity',
        label: 'School identity',
        fields: [
          {
            key: 'schoolName',
            label: 'School name',
            type: 'text',
            help: 'Shown beside the logo in the header and footer, and in the browser tab.',
          },
          {
            key: 'tagline',
            label: 'Tagline',
            type: 'text',
            help: 'The small grey line under the school name.',
          },
        ],
      },
      {
        id: 'footer',
        label: 'Footer',
        fields: [
          {
            key: 'copyrightYear',
            label: 'Copyright year',
            type: 'number',
            half: true,
            help: 'Shown at the very bottom: © 2026 …',
          },
        ],
      },
    ],
  },
];

/** Every key the map accounts for — anything else is surfaced as "Other". */
export const mappedKeys = new Set(
  cmsPages.flatMap((page) => page.sections.flatMap((section) => section.fields.map((f) => f.key)))
);

export default cmsPages;
