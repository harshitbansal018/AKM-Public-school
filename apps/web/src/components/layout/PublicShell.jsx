import Preloader from '@/components/layout/Preloader/Preloader';
import Topbar from '@/components/layout/Topbar/Topbar';
import Ticker from '@/components/layout/Ticker/Ticker';
import Header from '@/components/layout/Header/Header';
import Footer from '@/components/layout/Footer/Footer';
import BackToTop from '@/components/layout/BackToTop/BackToTop';
import { getSettings, getAnnouncements } from '@/lib/serverApi';

/**
 * Chrome shared by every public page. Settings and announcements are fetched
 * once here (cached and tagged), so individual pages never re-request them.
 */
export default async function PublicShell({ children }) {
  const [settings, announcements] = await Promise.all([getSettings(), getAnnouncements()]);

  return (
    <>
      <Preloader schoolName={settings.schoolName} />
      <Topbar settings={settings} />
      <Ticker announcements={announcements} />
      <Header settings={settings} />
      <main id="main-content">{children}</main>
      <Footer settings={settings} />
      <BackToTop />
    </>
  );
}
