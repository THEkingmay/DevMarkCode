import { NextRequest, NextResponse } from 'next/server';
import { supabase } from "@/lib/supabase"; 
import type { PostTitle, User } from '@/util/type/type';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  const uid = (session?.user as User)?.uid;

  if (!uid) {
    return NextResponse.json({ message: 'คุณไม่ได้ล็อกอิน' }, { status: 401 });
  }

  try {

    const { data, error } = await supabase.rpc('get_posts_by_user', {
        p_uid: uid,
    });

    if(error){
      throw new Error((error.message))
    }
    return NextResponse.json({data : data as PostTitle[] }, {status : 200})

  } catch (err) {
    console.log((err as Error).message)
    const error = err as Error;
    return NextResponse.json({ message: error.message || 'เกิดข้อผิดพลาด' }, { status: 500 });
  }
}