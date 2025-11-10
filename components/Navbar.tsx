'use client'
import { useState } from 'react' // 1. Import useState
import { 
  Home,
  Plus, 
  X, 
  LogOut,
  Code,
  Menu // 2. Import Menu icon
} from 'lucide-react'
import { signOut} from "next-auth/react"
import Link from "next/link"

const navigation = [
  { name: 'โพสต์ทั้งหมด', href: '/dashboard', icon: Home },
  { name: 'เพิ่มโพสต์ใหม่', href: '/dashboard/add', icon: Plus },
]

export default function Navbar( ) {
  const [isMenuOpen, setIsMenuOpen] = useState(false) // 3. State สำหรับเมนูมือถือ

  const Logo = () => (
    <Link href="/" className="flex items-center gap-2 font-bold text-lg">
      <Code className="h-6 w-6 text-primary" />
      <span className="hidden sm:inline-block">DevMarkCode</span>
    </Link>
  )

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4 sm:px-10">

          <Logo />
          <div className="md:hidden">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle mobile menu"
              className="p-2 rounded-md duration-200 text-gray-900 hover:bg-gray-200"
            >
              {isMenuOpen ? 
                <X className="h-6 w-6" /> : // ไอคอนปิด (X)
                <Menu className="h-6 w-6" /> // ไอคอนเปิด (Menu)
              }
            </button>
          </div>

        </div>
      </header>

      {isMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 z-40 bg-background border-b shadow-lg">
          <nav className="flex flex-col p-4 space-y-2">
            
            {/* Links จาก navigation array */}
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="flex items-center gap-3 duration-200 px-3 py-2 rounded-md text-base font-medium text-gray-900 hover:bg-gray-200 "
                onClick={() => setIsMenuOpen(false)} // ปิดเมนูเมื่อคลิก
              >
                <item.icon className="h-5 w-5" />
                {item.name}
              </Link>
            ))}
            
            {/* เส้นคั่น */}
            <hr className="border-gray-700 my-2" />

            {/* 6. ปุ่มออกจากระบบ (สำหรับ Mobile) */}
            <button
              onClick={() => {
                setIsMenuOpen(false); // ปิดเมนูก่อน
                signOut();
              }}
              className="flex items-center justify-start text-left
                w-full px-3 py-2 rounded-lg transition-colors duration-200
                text-gray-900  hover:bg-gray-200 "
            >
              <LogOut className="h-5 w-5 mr-3" />
              ออกจากระบบ
            </button>
          </nav>
        </div>
      )}
    </>
  )
}