import type { Metadata } from 'next';
import './globals.css';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'Q-Trace — Quantum Flight Recorder & Learning Platform',
  description: 'AI-assisted quantum learning platform with visual execution evidence and Quantum Flight Recorder divergence diagnosis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <head>
        {/* Observatory Dark type system — Google Fonts link (not next/font) so the
            offline demo-local mode degrades gracefully to the system stack. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;600&family=Space+Grotesk:wght@500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-abyss text-ink font-sans antialiased">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}

