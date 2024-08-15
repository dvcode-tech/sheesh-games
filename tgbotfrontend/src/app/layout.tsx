import type { PropsWithChildren } from 'react';
import type { Metadata } from 'next';

import { Root } from '@/components/Root/Root';
import './_assets/globals.css';

// import '@telegram-apps/telegram-ui/dist/styles.css';
// import 'normalize.css/normalize.css';
// import './_assets/globals.css';

export const metadata: Metadata = {
  title: 'PRS Game',
  description: 'Your application description goes here',
};

export default function RootLayout({ children }: PropsWithChildren) {
  return (
    <html lang="en" className="customized-scrollbar scroll-smooth">
      <body>
        <Root>{children}</Root>
      </body>
    </html>
  );
}
