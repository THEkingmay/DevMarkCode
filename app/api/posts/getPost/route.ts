import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route'; 
import type { PostStructure, User } from '@/util/type/type';
import { supabase } from '@/lib/supabase';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const post_id_str = searchParams.get('post_id');

    if (!post_id_str) {
      return NextResponse.json(
        { message: 'post_id is required' },
        { status: 400 },
      );
    }

    const post_id = parseInt(post_id_str, 10);
    if (isNaN(post_id)) {
      return NextResponse.json(
        { message: 'Invalid post_id format' },
        { status: 400 },
      );
    }

    // --- 3. ดึง Session และ uid ---
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { message: 'Not authenticated' },
        { status: 401 },
      );
    }

    // (ผมสมมติว่าคุณ config NextAuth ให้มี User object อยู่ใน session.user)
    const user = session.user as User;
    const uid = user.uid;

    if (!uid) {
      return NextResponse.json(
        { message: 'User ID not found in session' },
        { status: 401 },
      );
    }

    const { data, error } = await supabase.rpc('get_post_for_owner', {
      p_post_id: post_id,
      p_uid: uid,
    });

    if (error) {
      console.error('Supabase RPC error:', error.message);
      return NextResponse.json(
        { message: 'Error fetching post', error: error.message },
        { status: 500 },
      );
    }

    if (!data) {
      return NextResponse.json(
        { message: 'Post not found or access denied' },
        { status: 404 },
      );
    }

    return NextResponse.json({ data: data as PostStructure });
    
  } catch (err) {
    console.error('GET handler error:', err);
    return NextResponse.json(
      { message: 'An unexpected error occurred' },
      { status: 500 },
    );
  }
}

// ขั้นตอนในการดึงข้อมูลโพสต์มาเก็บในรูปนี้ PostStructure 
    // 1. เอาคิวรีพารา มา คิวรีคือ post_id เป็นสตริง แต่ใน ตารางโพสต์เป็น int 
    // สอง ตัวสอบ  uid จาก sesssion โดย const session = getServerSession -> uid = (sesssion as User).uid ถ้าไม่มีส่งกลับไปว่าไม่ได้ล็แกอิน
    // 3. ก่อนดึงข้อมูลของโพสต์ ตรวจสอบก่อนว่า โพสต์นั้นเป็นของเจ้าของคนนนี้มั้ยโดยเชคว่า post_id นั้น เป็นของ uid นั้นหรือไม่
    
    // 4.ถ้าเป็นของคนนั้น เรียกใช้ postqsql fnuction โดยจะส่ง uid post_id ไป หลักการคือ ตรวจหาtag id ในตาราง post_tags เพื่อเชคว่า post_id นั้น มี tag_id ใดบ้าง
    // เมื่อรู้ tag_id ทั้งหมด จะไปหา description ในตาราง tags ว่า tag_id นั้นๆ มี description อะไรบ้าง 
    // ต่้อไปตรวจสอบโค้ดของโพสต์นั้นๆ จากตาราง code_in_post โดยใช้ post_id แล้วดึง code , language , descrition ออกมา
    // ต่อมาหา link จากตาราง links_in_post ใช้  post_id เหมือนเดิมถ้าแถวไหนเป็น post_id ดีง link ออกมา
