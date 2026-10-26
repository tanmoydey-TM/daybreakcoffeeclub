import '@fontsource/fraunces/400.css';
import '@fontsource/fraunces/400-italic.css';
import '@fontsource/fredoka/400.css';
import '@fontsource/fredoka/500.css';
import '@fontsource/fredoka/600.css';
import '@fontsource/dm-sans/400.css';
import '@fontsource/dm-sans/500.css';
import '@fontsource/dm-sans/600.css';
import '@fontsource/dm-sans/700.css';
import 'lenis/dist/lenis.css';
import './globals.css';
import './film.css';

export const metadata = {
  title: 'daybreakcoffeeclub — Good days start here',
  description: 'Step inside daybreakcoffeeclub. Follow a sunny morning from the open door to a golden espresso and your freshly served cup.',
  robots: { index: false, follow: false },
  icons: { icon: '/icon.svg' },
};
export default function RootLayout({ children }) {
  return <html lang="en"><body>{children}</body></html>;
}
