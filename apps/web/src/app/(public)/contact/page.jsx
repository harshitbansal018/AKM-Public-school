import { getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import { text } from '@/lib/content';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import ContactSection from '@/components/home/ContactSection/ContactSection';

export async function generateMetadata() {
  const settings = await getSettings();
  return buildMetadata({
    title: text(settings, 'page_contact_title', 'Contact Us'),
    description: text(settings, 'page_contact_subtitle'),
    path: '/contact',
  });
}

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        title={text(settings, 'page_contact_title', 'Contact Us')}
        subtitle={text(settings, 'page_contact_subtitle')}
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="section bg-sky">
        <div className="container">
          <SectionIntro
            tag={text(settings, 'contact_section_tag', 'Get in Touch')}
            title={text(settings, 'contact_section_title', 'Contact & Admission Enquiry')}
          />
          <ContactSection settings={settings} />
        </div>
      </section>
    </>
  );
}
