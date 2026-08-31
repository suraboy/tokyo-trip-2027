import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tokyo & Japan Trip Planner 2027 | Best Dates, Flights & Highlights',
  description: 'Plan your dream 2027 Japan trip with intelligent seasonality analysis, flight fare tracking, and curated attraction wishlists.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
