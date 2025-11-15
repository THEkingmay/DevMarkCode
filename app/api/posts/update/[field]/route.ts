import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { User } from '@/util/type/type'; // (ใช้ Type 'User' ที่เม Import มา)

// --- Type Interfaces สำหรับ Body ---
interface UpdateTitleBody {
  title: string;
}
interface UpdateDescriptionBody {
  description: string;
}
interface UpdateLinkBody {
  link: string;
}
interface UpdateCodeBody {
  description: string;
  code: string;
  language: string;
}

// ใช้ Signature มาตรฐานของ App Router
 
export async function PUT(req: NextRequest, ctx: RouteContext<'/api/posts/update/[field]'>) {
  const { field } = await ctx.params
  try {
    // === 1. Authentication: ผู้ใช้คนนี้คือใคร? ===
    const session = await getServerSession(authOptions);
    // (ผมปรับ Logic การเช็ค session ให้รัดกุมขึ้นครับ)
    if (!session || !session.user) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }
    const uid = (session.user as User).uid;
    if (!uid) {
        return Response.json(
            { message: 'User ID not found in session' },
            { status: 401 },
        );
    }

    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return Response.json(
        { message: 'postId is required' },
        { status: 400 },
      );
    }

    // `id` (targetId) จะจำเป็นสำหรับ 'links' และ 'codes'
    // แต่ไม่จำเป็นสำหรับ 'title' และ 'description'
    const id = searchParams.get('id');

    // === 3. Authorization (Ownership Check): Post นี้เป็นของเขาจริงมั้ย? ===
    const { data: postOwner, error: ownerError } = await supabase
      .from('posts')
      .select('uid')
      .eq('id', postId)
      .eq('uid', uid)
      .single();

    if (ownerError || !postOwner) {
      return Response.json(
        { message: 'Post not found or you do not have permission' },
        { status: 404 },
      );
    }

    // === 4. Business Logic: แยกตาม [field] ===
    const body = await req.json();
    let updateError: any = null;

    switch (field) {
      // --- กรณีอัปเดต Title ---
      case 'title': {
        const { title } = body as UpdateTitleBody;
        if (!title) {
          return Response.json(
            { message: 'Title cannot be empty' },
            { status: 400 },
          );
        }
        const { error } = await supabase
          .from('posts')
          .update({ title: title })
          .eq('id', postId)
          .eq('uid', uid); // ยืนยัน uid อีกครั้ง
        updateError = error;
        break;
      }

      // --- กรณีอัปเดต Description ---
      case 'description': {
        const { description } = body as UpdateDescriptionBody;
        if (description === null || description === undefined || description ==='' ) {
          return Response.json(
            { message: 'Invalid description data' },
            { status: 400 },
          );
        }
        const { error } = await supabase
          .from('posts')
          .update({ description: description })
          .eq('id', postId)
          .eq('uid', uid);
        updateError = error;
        break;
      }

      // --- กรณีอัปเดต Link ---
      case 'links': {
        if (!id) {
          return Response.json(
            { message: 'Link ID (id) is required' },
            { status: 400 },
          );
        }
        const { link } = body as UpdateLinkBody;
        if (!link) {
          return Response.json(
            { message: 'Link cannot be empty' },
            { status: 400 },
          );
        }
        const { error } = await supabase
          .from('links_in_post')
          .update({ link: link })
          .eq('id', id)
          .eq('post_id', postId); // ป้องกันการอัปเดตผิด post
        updateError = error;
        break;
      }

      // --- กรณีอัปเดต Code ---
      case 'codes': {
        if (!id) {
          return Response.json(
            { message: 'Code ID (id) is required' },
            { status: 400 },
          );
        }
        const { description, code, language } = body as UpdateCodeBody;
        if ( !code || !language) {
          return Response.json(
            { message: 'Invalid code data' },
            { status: 400 },
          );
        }
        const { error } = await supabase
          .from('codes_in_post')
          .update({
            description: description,
            code: code,
            language: language,
          })
          .eq('id', id)
          .eq('post_id', postId);
        updateError = error;
        break;
      }

      // --- กรณี Field ไม่ถูกต้อง ---
      // (เราไม่มี case 'tags' เพราะ Logic การจัดการ Tag ของเราคือ Add/Delete เท่านั้น)
      default:
        return Response.json(
          { message: 'Invalid field specified' },
          { status: 400 },
        );
    }

    // === 5. ตรวจสอบผลลัพธ์ ===
    if (updateError) {
      throw updateError; // โยนเข้า Global try...catch
    }

    return Response.json(
      { message: `${field} updated successfully` },
      { status: 200 },
    );
  } catch (err) {
    // === Global Error Handler ===
    console.error(`Error in /api/posts/update/[field]:`, (err as Error).message);


    return Response.json(
      { message: 'An internal server error occurred' },
      { status: 500 },
    );
  }
}