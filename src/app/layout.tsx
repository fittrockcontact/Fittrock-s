import React from 'react';
import type { Metadata } from 'next';
import './globals.css';
import { SalesSidebar } from '@/components/layout/SalesSidebar';
import { Toaster } from 'sonner';

export const metadata: Metadata = {
  title: 'Fittrock Sales Cockpit & CRM',
  description: 'Daily operational cockpit for Fittrock sales representatives and order dispatch.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090a0f] text-zinc-100 flex min-h-screen">
        <SalesSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
        <Toaster position="top-right" richColors theme="dark" />
      </body>
    </html>
  );
}
