'use client';

import { ReactNode, useState } from 'react';
import Navbar from '@/components/Navbar';
import Sidebar from './component/Sidebar';

export default function DashboardLayout({ children }: { children: ReactNode }) {

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className=" flex flex-1 flex-col  overflow-hidden">
        <Navbar />
        <main className="overflow-y-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
