import type { Metadata, Viewport } from 'next';
import { Unbounded, Instrument_Sans } from 'next/font/google';
import { DATA } from '@/data';
import './globals.css';

/* Fonts are downloaded at build time and self-hosted by Next. */
const display = Unbounded({ subsets: ['latin'], variable: '--font-display', display: 'swap' });
const sans = Instrument_Sans({ subsets: ['latin'], variable: '--font-sans', display: 'swap' });

const description = `${DATA.name} is a full-stack developer and computer science student at UCF. Skills, experience and projects, presented as a tour of the solar system.`;

export const metadata: Metadata = {
  title: `${DATA.name} | Portfolio`,
  description,
  openGraph: {
    title: `${DATA.name} | Portfolio`,
    description,
    type: 'website'
  }
  /* After you deploy, add:  metadataBase: new URL('https://your-domain.com')
     so link previews use absolute URLs. */
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  themeColor: '#02030a',
  colorScheme: 'dark'
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body>
        {/* Without JavaScript: skip the loader and show the text. */}
        <noscript>
          <style>{`#loader{display:none!important}.h-hide{visibility:visible!important}.h-in{opacity:1!important}`}</style>
        </noscript>
        {children}
      </body>
    </html>
  );
}
