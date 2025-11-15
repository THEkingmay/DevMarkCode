import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { User } from '@/util/type/type';

 
export async function DELETE(req: NextRequest, ctx: RouteContext<'/api/posts/delete/[field]'>) {
  const { field } = await ctx.params
//   console.log(field)
  try {
    // === 1. Authentication: ผู้ใช้คนนี้คือใคร? ===
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as User) .uid) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }
    const uid =(session.user as User) .uid;
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');
    const id = searchParams.get('id'); // นี่คือ ID ของ item ที่จะลบ (link.id, code.id, tag.id)

    if (!postId || !id) {
      return Response.json(
        { message: 'postId and id are required' },
        { status: 400 },
      );
    }

    // === 3. Authorization (Ownership Check): Post นี้เป็นของเขาจริงมั้ย? ===
    // สเต็ปนี้ "ห้าม" ข้ามเด็ดขาด
    const { data: postOwner, error: ownerError } = await supabase
      .from('posts')
      .select('uid')
      .eq('id', postId)
      .eq('uid', uid)
      .single();

    if (ownerError || !postOwner) {
      // ถ้าหาไม่เจอ = เขาไม่ใช่เจ้าของ หรือ Post ไม่มีอยู่จริง
      return Response.json(
        { message: 'Post not found or you do not have permission' },
        { status: 404 },
      );
    }

    // === 4. Business Logic: แยกตาม [field] ===
    // ถ้าผ่านมาถึงตรงนี้ได้ แปลว่าเขาเป็นเจ้าของ Post ตัวจริง

    // เราจะสร้างตัวแปร error ไว้รับ error จาก switch case
    let deleteError: Error | null = null;

    switch (field) {
      // --- กรณีลบ Link ---
      case 'links': {
        // (สมมติว่าตารางชื่อ 'links_in_post')
        // เราจะลบแถวที่ `id` ตรงกัน "และ" `post_id` ตรงกัน
        // เพื่อความปลอดภัยสูงสุด (ถึงแม้เราจะเช็ค ownership ไปแล้ว)
        const { error } = await supabase
          .from('links_in_post')
          .delete()
          .eq('id', id)
          .eq('post_id', postId); // ป้องกันการลบผิด post
        deleteError = error;
        break;
      }

      // --- กรณีลบ Code ---
      case 'codes': {
        // (สมมติว่าตารางชื่อ 'code_in_post')
        const { error } = await supabase
          .from('codes_in_post')
          .delete()
          .eq('id', id)
          .eq('post_id', postId);
        deleteError = error;
        break;
      }

      // --- กรณีลบ Tag (Unlink) ---
      case 'tags': {
        // console.log("TEST")
        // *** สำคัญ ***
        // 'id' ที่ส่งมาใน case นี้คือ 'tag_id' ไม่ใช่ 'post_tags.id'
        // (อ้างอิงจาก Frontend: /api/posts/delete/tags?postId=...&id=${tag.id})
        // เราจะลบ "ความสัมพันธ์" ในตารางเชื่อม 'post_tags'
        const { error } = await supabase
          .from('post_tags')
          .delete()
          .eq('tag_id', id) // ลบโดยอ้างอิง tag_id
          .eq('post_id', postId); // ที่อยู่ใน post_id นี้
        deleteError = error;
        break;
      }

      // --- กรณี Field ไม่ถูกต้อง ---
      default:
        return Response.json(
          { message: 'Invalid field specified' },
          { status: 400 },
        );
    }

    // === 5. ตรวจสอบผลลัพธ์ ===
    if (deleteError) {
      throw deleteError; // โยนเข้า Global try...catch
    }

    // ถ้าไม่ error
    return Response.json(
      { message: `${field} item deleted successfully` },
      { status: 200 }, // 200 OK (หรือ 204 No Content ก็ได้ครับ)
    );
  } catch (err) {
    // === Global Error Handler ===
    console.error(`Error in /api/posts/delete/[field]:`, (err as Error).message);

    return Response.json(
      { message: 'An internal server error occurred' },
      { status: 500 },
    );
  }
}