"use client"
import {  Bookmark, Code, Tag, Github } from 'lucide-react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'


export default function HomePage() {

  const router = useRouter()
  const session =useSession()
  
  useEffect(()=>{
    if(session.status=='authenticated') return router.push('/dashboard')
  },[session.status])

  const handleLogin = async () => {
    await signIn('github', { 
      callbackUrl: '/dashboard' 
    })
  }
if(session.status=='unauthenticated'){
     return (
    // Container หลัก ใช้สีพื้นหลังเทาอ่อนๆ สไตล์โมเดิร์น
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 pt-3">
      
      {/* ส่วน Header (Navbar) แบบง่ายๆ */}
      <header className="w-full px-6 py-4">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          {/* ชื่อโปรเจกต์ */}
          <div className="flex items-center gap-2">
            <Bookmark className="w-6 h-6 text-blue-600" />
            <span className="text-xl font-bold">DevMarkCode</span>
          </div>
          
          {/* 3. แก้ไขปุ่ม Login */}
          <button
            onClick={handleLogin} // ใช้ handleLogin ที่เราสร้างไว้
            className="inline-flex cursor-pointer items-center justify-center px-4 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2"
          >
            {/* แก้คำผิด "เด้วย" -> "ด้วย" และจัดไอคอนให้สวยงาม */}
            เข้าสู่ระบบด้วย Github
            <Github className="ml-2 w-4 h-4" />
          </button>
        </div>
      </header>

      {/* ส่วนเนื้อหาหลัก (Hero Section) */}
      <main className="flex-grow flex flex-col items-center justify-center text-center px-6 pb-3">
        <div className="max-w-3xl mx-auto">
          
          {/* Headline หลัก */}
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
            คลังความรู้ส่วนตัว
            <br />
            <span className="text-blue-600">สำหรับนักพัฒนา</span>
          </h1>

          {/* คำอธิบายโปรเจกต์ */}
          <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto mb-10">
            บันทึกบทความ, โค้ด Snippets, และแนวทางแก้ปัญหาที่คุณพบบ่อย จัดการทุกอย่างง่ายๆ ด้วยระบบแท็ก ค้นหาสิ่งที่ต้องการได้ในไม่กี่วินาที
          </p>


        </div>
      </main>

      {/* 5. แก้ไข Tailwind class ที่ไม่ถูกต้อง */}
      <section className="w-full bg-white py-16 px-6"> {/* แก้ไข 'py-15' (ไม่มีอยู่จริง) เป็น 'py-16' */}
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          
          {/* Feature 1: บันทึกลิงก์ */}
          <div className="flex flex-col p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
              <Bookmark className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">บันทึกบทความ (Links)</h3>
            <p className="text-gray-600">
              เจอบทความดีๆ? บันทึกลิงก์พร้อมคำอธิบายและหัวข้อ
            </p>
          </div>

          {/* Feature 2: บันทึกโค้ด */}
          <div className="flex flex-col p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 bg-green-100 text-green-600 rounded-full mb-4">
              <Code className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">เก็บ Code Snippets</h3>
            <p className="text-gray-600">
              บันทึกโค้ดส่วนสำคัญด้วย Code Editor สวยงาม พร้อม Syntax Highlighting
            </p>
          </div>

          {/* Feature 3: แท็ก */}
          <div className="flex flex-col p-6 border border-gray-200 rounded-lg shadow-sm">
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 text-purple-600 rounded-full mb-4">
              <Tag className="w-6 h-6" />
            </div>
            <h3 className="text-xl font-semibold mb-2">ค้นหาง่ายด้วยแท็ก</h3>
            <p className="text-gray-600">
              จัดหมวดหมู่ทุกอย่างด้วยระบบแท็ก (Tags) เพื่อให้คุณค้นหาเจอได้ทันที
            </p>
          </div>

        </div>
      </section>

      {/* Footer */}
      <footer className="w-full py-6 text-center">
        <p className="text-gray-500 text-sm">
          Built by May3Site , for developers.
        </p>
      </footer>

    </div>
  )
  }
}