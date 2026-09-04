import { getSettings } from '@/lib/serverApi';
import { buildMetadata } from '@/lib/seo';
import PageHeader from '@/components/ui/PageHeader/PageHeader';
import SectionIntro from '@/components/ui/SectionIntro/SectionIntro';
import ContactSection from '@/components/home/ContactSection/ContactSection';

export const metadata = buildMetadata({
  title: 'Contact Us',
  description:
    'Phone, email, address and school timings for AKM Public Sr. Sec. School, plus an online admission enquiry form.',
  path: '/contact',
});

export default async function ContactPage() {
  const settings = await getSettings();

  return (
    <>
      <PageHeader
        title="Contact Us"
        subtitle="Call, write, or send an enquiry — the school office answers on working days."
        breadcrumbs={[{ label: 'Contact' }]}
      />

      <section className="section bg-sky">
        <div className="container">
          <SectionIntro tag="Get in Touch" title="Contact & Admission Enquiry" />
          <ContactSection settings={settings} />
        </div>
      </section>
    </>
  );
}
