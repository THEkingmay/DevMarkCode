import { NextRequest, NextResponse } from "next/server";
// import { supabase } from "@/lib/supabase"; // ยังไม่ใช้ supabase จริง
import type { PostTitle ,User } from "@/type/type";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

// (Mock Data 20 รายการของเม)
const MOCK_DATA: PostTitle[] = [
  { id: "0", title: "เจาะลึก React Hooks: useCallback vs useMemo", tags: ['react', 'hooks', 'performance'], create_at: "2025-11-10T14:30:00Z" },
  { id: "1", title: "การจัดการ Authentication ใน Next.js ด้วย NextAuth.js", tags: ['nextjs', 'auth', 'react'], create_at: "2025-11-09T18:00:00Z" },
  { id: "2", title: "Supabase vs Firebase: เลือกอะไรดีสำหรับโปรเจกต์ใหม่", tags: ['supabase', 'firebase', 'database', 'backend'], create_at: "2025-11-08T11:00:00Z" },
  { id: "3", title: "โหมด Deep Sleep ของ ESP32 เพื่อประหยัดพลังงาน", tags: ['iot', 'esp32', 'hardware'], create_at: "2025-11-10T16:45:00Z" },
  { id: "4", title: "เริ่มต้น TypeScript กับ React Project", tags: ['typescript', 'react', 'frontend'], create_at: "2025-11-07T09:20:00Z" },
  { id: "5", title: "Docker Compose สำหรับ Full-stack Developer", tags: ['docker', 'devops', 'backend'], create_at: "2025-11-09T10:15:00Z" },
  { id: "6", title: "CI/CD ง่ายๆ ด้วย GitHub Actions และ Next.js", tags: ['ci-cd', 'github', 'nextjs', 'devops'], create_at: "2025-11-05T15:00:00Z" },
  { id: "7", title: "ทฤษฎี CS: DFA และ NFA คืออะไร", tags: ['cs-theory', 'automata', 'academic'], create_at: "2025-11-06T12:00:00Z" },
  { id: "8", title: "หลักการ Database Normalization (3NF)", tags: ['database', 'sql', 'normalization', 'cs-theory'], create_at: "2025-11-10T08:30:00Z" },
  { id: "9", title: "เปรียบเทียบ Flutter vs React Native ในปี 2025", tags: ['flutter', 'react-native', 'mobile'], create_at: "2025-11-04T19:00:00Z" },
  { id: "10", title: "สร้าง Realtime Chat ด้วย WebSockets และ Node.js", tags: ['websocket', 'nodejs', 'chat', 'backend'], create_at: "2025-11-08T20:00:00Z" },
  { id: "11", title: "เทคนิคการ Optimize Node.js Application", tags: ['nodejs', 'performance', 'backend'], create_at: "2025-11-03T13:10:00Z" },
  { id: "12", title: "สร้าง 3D Portfolio ด้วย Three.js และ React", tags: ['threejs', 'react', '3d', 'frontend'], create_at: "2025-11-07T17:00:00Z" },
  { id: "13", title: "5 เทคนิค Tailwind CSS ที่ควรรู้", tags: ['css', 'tailwind', 'design'], create_at: "2025-11-09T14:00:00Z" },
  { id: "14", title: "ElysiaJS: Bun-first Framework ที่น่าจับตา", tags: ['elysiajs', 'bun', 'backend', 'nodejs'], create_at: "2025-11-06T09:00:00Z" },
  { id: "15", title: "เชื่อมต่อ Arduino กับ Sensor อ่านค่าอุณหภูมิ", tags: ['iot', 'arduino', 'c++'], create_at: "2025-11-02T10:00:00Z" },
  { id: "16", title: "การทำ Indexing ใน PostgreSQL", tags: ['postgresql', 'database', 'performance'], create_at: "2025-11-08T15:30:00Z" },
  { id: "17", title: "จัดการ State ใน React ด้วย Zustand", tags: ['react', 'state-management', 'zustand'], create_at: "2025-11-05T11:45:00Z" },
  { id: "18", title: "พื้นฐาน Microservices ด้วย Node.js และ Express", tags: ['microservices', 'nodejs', 'backend', 'architecture'], create_at: "2025-11-10T11:00:00Z" },
  { id: "19", title: "Git Branching Strategy ที่ดี (Git Flow vs GitHub Flow)", tags: ['git', 'devops', 'workflow'], create_at: "2025-11-04T08:00:00Z" },
]

const LIMIT = 9

// เรียงข้อมูล MOCK_DATA ทั้งหมด 1 ครั้ง (เหมือน .order('created_at', { ascending: false }))
const sortedMockData = MOCK_DATA.sort((a, b) => 
    new Date(b.create_at).getTime() - new Date(a.create_at).getTime()
);

export async function GET(req : NextRequest){
    const session = await getServerSession(authOptions)
    const uid = (session?.user as User)?.uid // เพิ่ม ? (Optional Chaining) เผื่อ user ไม่มี
    
    // Comment check session ออกไปก่อนเพื่อทดสอบ
    // if(!uid) return NextResponse.json({message : "คุณไม่ได้ล็อกอิน"}, { status: 401 })

    const searchParams = req.nextUrl.searchParams
    const timeCursor = searchParams.get('time') // นี่คือ cursor ของเรา
    const isNext = searchParams.get('isNext')    // ถ้าไปหน้าถัดไปจะไม่เอาตัวที่ส่งมาด้วย ต้องมากกว่า แต่ถ้าเป็นการกดย้อนกลับจะเอาตัวนั้นๆด้วย
    // console.log("API received cursor time: ", timeCursor)
    
    let data: PostTitle[] = []
        // console.log(`Fetching items older or equle than ${timeCursor}`)
        const cursorTime = new Date(timeCursor!).getTime();
        
       let olderData : PostTitle[]= []
        if(isNext == 'true'){
            olderData = sortedMockData.filter(post => {
                return new Date(post.create_at).getTime() < cursorTime; // ไม่เอา
            });
        }else if(isNext =='false'){
            olderData = sortedMockData.filter(post => {
                return new Date(post.create_at).getTime() <= cursorTime; //เอา
            });
        }
        
        data = olderData.slice(0, LIMIT);
    
    // จำลอง delay ของ API
    await new Promise(resolve => setTimeout(resolve, 500)); 

    return NextResponse.json({ data: data })
}