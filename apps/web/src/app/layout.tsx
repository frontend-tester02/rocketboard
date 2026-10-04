import type { Metadata } from 'next';
import { Poppins } from 'next/font/google';
import type { ReactNode } from 'react';
import { Providers } from './providers';
import './globals.css';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-poppins',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Rocket',
  description: 'Rocket admin panel',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={poppins.variable} suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
