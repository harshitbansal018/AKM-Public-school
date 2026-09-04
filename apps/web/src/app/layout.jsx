import { Baloo_2, Nunito_Sans } from 'next/font/google';
import { ToastProvider } from '@/context/ToastContext';
import { buildMetadata, SITE_URL } from '@/lib/seo';
import './globals.css';

// Display face for headings and buttons.
const baloo = Baloo_2({
  subsets: ['latin'],
  weight: ['500', '600', '700', '800'],
  variable: '--font-display-loaded',
  display: 'swap',
});

// Body face for everything else.
const nunito = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700', '800'],
  style: ['normal', 'italic'],
  variable: '--font-body-loaded',
  display: 'swap',
});

export const metadata = {
  metadataBase: new URL(SITE_URL),
  ...buildMetadata({}),
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export const viewport = {
  themeColor: '#12307f',
  width: 'device-width',
  initialScale: 1,
};

/**
 * Root layout. Deliberately thin — it owns the document, the fonts and the
 * toast provider only. Public chrome lives in (public)/layout.jsx and the admin
 * chrome in admin/layout.jsx, so the two never bleed into each other.
 */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${baloo.variable} ${nunito.variable}`}>
      <body
        style={{
          // hand next/font's generated families to the tokens in globals.css
          '--font-display': `var(--font-display-loaded), 'Baloo 2', cursive`,
          '--font-body': `var(--font-body-loaded), 'Nunito Sans', sans-serif`,
        }}
      >
        <a href="#main-content" className="sr-only">
          Skip to main content
        </a>
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
