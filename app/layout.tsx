import type { Metadata } from 'next';
import './globals.css';
export const metadata: Metadata = { title: 'PARALLEL CAFÈ — Good coffee. Better company.', description: 'A little pause. A perfectly poured coffee. Find your parallel at PARALLEL CAFÈ.' };
export default function RootLayout({children}: {children: React.ReactNode}) { return <html lang="en"><body>{children}</body></html> }
