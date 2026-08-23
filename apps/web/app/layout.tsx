import type { Metadata } from 'next';
import './globals.css';

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
      <body className="bg-zinc-950 text-zinc-100 antialiased selection:bg-cyan-500/20 selection:text-cyan-200">
        {children}
      </body>
    </html>
  );
}
