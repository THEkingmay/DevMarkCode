import { supabase } from "@/lib/supabase";
import { authOptions } from "../../auth/[...nextauth]/route";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import type { User } from "@/util/type/type";

/**
 * @description Delete a post by its ID
 * @route POST /api/posts/delete?postId=...
 */
export async function POST(req: Request) {
    try {
        // 1. ตรวจสอบ Session ผู้ใช้
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }
        const uid = (session.user as User).uid;

        // 2. ดึง postId จาก search parameters
        const { searchParams } = new URL(req.url);
        const postId = searchParams.get('postId');

        if (!postId) {
            return NextResponse.json({ message: "postId is required" }, { status: 400 });
        }

        // 3. ตรวจสอบความเป็นเจ้าของโพสต์
        // เลือก 'id' เพื่อเช็คว่ามีโพสต์นี้ที่ตรงกับ uid ของผู้ใช้หรือไม่
        const { data: ownerCheck, error: ownerError } = await supabase
            .from('posts')
            .select('id')
            .eq('uid', uid)
            .eq('id', Number(postId)) // ไอดีของโพสต์เป็นตัวเลข
            .maybeSingle(); // .maybeSingle() จะคืนค่า null ถ้าไม่เจอ (แทนที่จะเป็น array ว่าง)

        if (ownerError) {
            console.log(ownerError)
            throw ownerError; // ส่งไปให้ catch block
        }

        // ถ้า !ownerCheck หมายความว่าไม่พบโพสต์นี้ (อาจจะไม่มีอยู่ หรือผู้ใช้ไม่ใช่เจ้าของ)
        if (!ownerCheck) {
            return NextResponse.json({ message: "Post not found or you are not the owner" }, { status: 403 }); // 403 Forbidden
        }

        // 4. ถ้าเป็นเจ้าของจริง ให้ทำการลบ
        const { error: deleteError } = await supabase
            .from('posts')
            .delete()
            .eq('id', postId); 

        if (deleteError) {
            console.log(deleteError)
            throw deleteError; 
        }

        return NextResponse.json({ message: "Post deleted successfully" }, { status: 200 });

    } catch (err) {
        console.error((err as Error).message); // ใช้ console.error สำหรับ errors
        return NextResponse.json({ message: (err as Error).message }, { status: 500 });
    }
}