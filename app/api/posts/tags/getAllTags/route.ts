import { supabase } from '@/lib/supabase';
import { getServerSession } from 'next-auth';
import type { User } from '@/util/type/type';
import { NextResponse } from 'next/server';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET() {
  // ดึงแท็กทั้งหมดจากผู้ใช้คนนั้นๆ
  const session = await getServerSession(authOptions);
  // console.log(session)
  const uid = (session?.user as User).uid;
  if (!uid) {
    return NextResponse.json({ message: 'You must login' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('tags')
    .select('id, description')
    .eq('uid', uid);

  if (error) {
    console.log(error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }

  return NextResponse.json({ data });
}
