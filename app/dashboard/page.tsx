'use client'

import { signOut, useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/')
    }
  }, [status, router])

  
  return (
    <div className="container mx-auto max-w-lg p-8 mt-10">
      <div className="bg-white shadow-md rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">Dashboard</h1>
        
        <div className="mb-6 p-4 bg-gray-100 rounded-lg min-h-[90px]">
          {status === 'loading' && (
            <SkeletonUserCard />
          )}
          {status === 'authenticated' && session.user && (
            <div>
              <p className="text-xl">
                สวัสดี, <strong>{session.user.name ?? 'ผู้ใช้งาน'}</strong>!
              </p>
              <p className="text-gray-600 mt-1">
                {session.user.email}
              </p>
            </div>
          )}
          {status === 'unauthenticated' && (
            <p className="text-gray-500">กำลังนำคุณไปหน้า Sign in...</p>
          )}
        </div>

        <button 
          className="w-full bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded transition duration-300" 
          onClick={() => signOut()}
          disabled={status === 'loading'}
        >
          Sign out
        </button>
      </div>
    </div>
  )
}

const SkeletonUserCard = () => {
  return (
    <div className="animate-pulse">
      {/* แท่งสำหรับ "สวัสดี, ..." */}
      <div className="h-6 bg-gray-300 rounded-md w-1/2 mb-2"></div>
      {/* แท่งสำหรับ "email..." */}
      <div className="h-4 bg-gray-300 rounded-md w-3/4"></div>
    </div>
  )
}