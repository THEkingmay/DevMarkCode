'use client' 

import { ReactNode, useState } from "react";
import Navbar from "@/components/Navbar";
import Sidebar from "./component/Sidebar";


export default function DashboardLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (

    <div className="flex h-screen overflow-hidden bg-gray-100">
      
      <Sidebar />
      <div className="flex-1 flex flex-col relative overflow-hidden">
        <Navbar/>
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}