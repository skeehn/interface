import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Mardi Gras AI — powered by skeehn',
  description: 'An AI chat interface with the skeehn Mardi Gras theme. Purple, gold, and green.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="mardi-gras">
      <body>{children}</body>
    </html>
  );
}
