import { NextRequest, NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase"; 
import type { PostTitle, User } from '@/util/type/type';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

const LIMIT = 9;

// /api/posts/getPagePosts?time=...&id=...&isNext=true 

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as User)?.uid;

  if (!uid) {
    return NextResponse.json({ message: 'คุณไม่ได้ล็อกอิน' }, { status: 401 });
  }

  const searchParams = req.nextUrl.searchParams;
  const timeCursor = searchParams.get('time'); // Cursor หลัก (create_at)
  const idCursor = searchParams.get('id');     // Cursor รอง (id)
  const isNextStr = searchParams.get('isNext'); // "true" หรือ "false"
  const isNextPage = isNextStr === 'true';    // แปลงเป็น boolean

  try {
    // 1. เรียก RPC แทนการ .select().eq()...
    const { data, error } = await supabase.rpc('get_paginated_posts_with_tags', {
        p_uid: uid,
        p_cursor_time: timeCursor, // Supabase JS จะแปลง null ให้ถูกต้อง
        p_cursor_id: idCursor,     // Supabase JS จะแปลง null ให้ถูกต้อง
        p_is_next: isNextPage,
        p_page_limit: LIMIT
    });

    if (error) {
      console.error("Supabase RPC error:", error);
      throw new Error(error.message);
    }

    // 2. ข้อมูลที่ได้จาก RPC จะมีโครงสร้างตาม PostTitle อยู่แล้ว
    let finalData: PostTitle[] = data || [];

    // 3. กลับลำดับข้อมูล (เฉพาะกรณีย้อนกลับ)
    // ตรรกะนี้ยังคงเหมือนเดิม และจำเป็น
    if (timeCursor && idCursor && !isNextPage) {
      // เพราะ SQL เราดึงแบบ ASC (เก่าไปใหม่) เราจึงต้อง reverse()
      // เพื่อให้ได้ลำดับที่ถูกต้อง (ใหม่ไปเก่า) ก่อนส่งกลับ
      finalData.reverse();
    }

    return NextResponse.json({ data: finalData });

  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ message: error.message || 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}