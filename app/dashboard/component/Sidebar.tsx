'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react' // 1. Import signOut
import { 
  Home,     // 2. เปลี่ยนไอคอนเป็น lucide-react
  Plus, 
  X, 
  LogOut    // 3. Import ไอคอน Logout
} from 'lucide-react'

// 4. อัปเดต navigation array ให้ใช้ไอคอนใหม่
const navigation = [
  { name: 'โพสต์ทั้งหมด', href: '/dashboard', icon: Home },
  { name: 'เพิ่มโพสต์ใหม่', href: '/dashboard/add', icon: Plus },
]

export default function Sidebar() {
  const pathname = usePathname()

  const getLinkClassName = (href: string) => {
    const isActive = (href === '/dashboard' && pathname === href) || (href !== '/dashboard' && pathname.startsWith(href));
    
    return `
      flex items-center px-4 py-2 mb-1 rounded-lg transition-colors duration-200
      ${
        isActive
          ? 'bg-gray-900 text-white'
          : 'text-gray-300 hover:bg-gray-700 hover:text-white'
      }
    `
  }

  return (
    <>

      <aside
        className={`
          hidden md:flex
          fixed inset-y-0 left-0 z-30 w-64 bg-gray-800 text-white
          flex flex-col p-4 transform transition-transform duration-300 ease-in-out
          md:static md:inset-auto md:translate-x-0
        `}
      >
        <div className="flex items-center justify-center h-16 px-2 border-b border-gray-700">
          <span className="text-2xl font-bold text-white ">รายการเมนู</span>
        </div>

        {/* รายการเมนู */}
        <nav className="flex-1 mt-6 space-y-2 ">
          {navigation.map((item) => (
            <Link key={item.name} href={item.href}>
              <span className={getLinkClassName(item.href)}>
                <item.icon className="h-5 w-5 mr-3" />
                {item.name}
              </span>
            </Link>
          ))}
        </nav>

        {/* 5. ส่วนของ Logout ที่เพิ่มเข้ามา */}
        <div className="mt-auto pt-4 border-t border-gray-700 flex items-center justify-center">
          <button
            onClick={() => signOut()}
            className="flex items-center justify-center
             w-full px-4 py-2 rounded-lg transition-colors duration-200
              text-gray-300 hover:bg-gray-900 hover:text-white
            "
          >
            ออกจากระบบ<LogOut className="h-5 w-5 mr-3 ms-1" />
          </button>
        </div>
        
      </aside>
    </>
  )
}