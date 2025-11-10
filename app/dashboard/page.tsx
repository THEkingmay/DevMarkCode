'use client'

import { useState, useEffect } from "react"
import { toast } from "react-toastify"

interface Post {
  id: string,
  title: string,
  tags: string[]
}

const MOCK_DATA: Post[] = [
  { id: "dsids1", title: "การใช้งาน React Hooks ในโปรเจกต์จริง", tags: ['react', 'hooks', 'frontend'] },
  { id: "dsids2", title: "เปรียบเทียบ Next.js และ Remix", tags: ['nextjs', 'remix', 'ssr'] },
  { id: "dsids3", title: "เริ่มต้นกับ Supabase Database", tags: ['supabase', 'database', 'backend'] },
  { id: "dsids4", title: "เทคนิคการใช้ Tailwind CSS ให้คล่อง", tags: ['css', 'tailwind', 'design'] },
  { id: "dsids5", title: "สร้าง Realtime Chat ด้วย Socket.io", tags: ['websocket', 'nodejs', 'chat'] },
  { id: "dsids6", title: "ESP32 กับการเชื่อมต่อ Firebase", tags: ['iot', 'esp32', 'firebase'] },
  
]


function PostCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        <div className="h-5 bg-gray-200 rounded-full w-20"></div>
        <div className="h-5 bg-gray-200 rounded-full w-14"></div>
      </div>
    </div>
  )
}

function PostCard({ post }: { post: Post }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg 
                    overflow-hidden transition-all duration-300 
                    hover:shadow-xl hover:-translate-y-1">
      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900 mb-3 truncate" title={post.title}>
          {post.title}
        </h3>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <span
              key={index}
              className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}


export default function DashboardPage() {
  const [posts, setPosts] = useState<Post[]>([]) 
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")

  const get50Post = async (time: string) => {
    // time คือตัวแปร timestampz 
    //  ไปเรียก API โดยส่ง Timestampzเข้าไป ตามอัลกอรีทึมที่วางไว้ตอนแรก
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setPosts(MOCK_DATA)
    } catch (err) {
      console.log((err as Error).message)
      toast.error('เกิดข้อผิดพลาดในการดึงรายการ')
    } finally {
      setIsLoading(false)
    }
  }

  // FIX 3: แก้ typo ชื่อฟังก์ชัน
  const handleSearch = async () => {
    // ฟังชันนี้จะเรียก API ไป คิวรีตาม titile
    // หรือ tag ได้ 
    console.log("Searching for:", searchQuery)
  }

  useEffect(() => {
    get50Post(new Date().toISOString()) // เอาเวลา timestampz ปัจจบัน
  }, [])

  return (
    <div className="container p-5 max-w-7xl mx-auto">

      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          Dashboard
        </h1>

        <div className="">
          <input
            type="text"
            placeholder="ค้นหา (Title หรือ Tag)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full md:w-80
                         focus:outline-none focus:ring-2 focus:ring-blue-500 me-3"
          />
          <button onClick={handleSearch} className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-2 md:mt-0">
            ค้นหา
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      )}


      {!isLoading && posts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      )}

      {!isLoading && posts.length === 0 && (
        <div className="text-center text-gray-500 mt-10 p-10 
                          border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-lg font-semibold">
            {searchQuery ? `ไม่พบผลลัพธ์สำหรับ "${searchQuery}"` : "ยังไม่มีโพสต์"}
          </p>
          <p className="text-sm">
            {searchQuery ? "ลองค้นหาด้วยคำอื่น" : "เมื่อมีโพสต์ใหม่จะแสดงที่นี่"}
          </p>
        </div>
      )}
    </div>
  )
}