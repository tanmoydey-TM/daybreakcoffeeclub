import type { Metadata } from 'next';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import '@fontsource/fraunces/600.css';
import '@fontsource/fraunces/700.css';
import '@fontsource/fraunces/600-italic.css';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daybreak Coffee Club — A little brighter, one cup at a time',
  description: 'Follow your coffee from bean to first sip. A colorful, interactive 3D coffee journey at Daybreak Coffee Club.',
  robots: { index: false, follow: false },
  icons: { icon: '/icon.svg' },
};
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
