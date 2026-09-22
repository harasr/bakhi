import type {Metadata} from 'next';
import './globals.css'; // Global styles
import { AuthProvider } from '@/hooks/use-auth';

export const metadata: Metadata = {
  title: 'Nintendo CRT Background',
  description: 'An 8-bit console title screen drawn on a pixel-perfect CRT simulation.',
  openGraph: {
    title: 'Nintendo CRT Background',
    description: 'An 8-bit console title screen drawn on a pixel-perfect CRT simulation.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nintendo CRT Background',
    description: 'An 8-bit console title screen drawn on a pixel-perfect CRT simulation.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
