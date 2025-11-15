import type { NextRequest } from 'next/server';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { getServerSession } from 'next-auth';
import { Tag, User } from '@/util/type/type';

// นี่คือ Type ที่เราคาดหวังจาก Body (จาก Frontend)
interface AddLinkBody {
  link: string;
}
interface AddCodeBody {
  description: string;
  code: string;
  language: string;
}
interface AddTagBody {
  tagId?: string; // ID ของ Tag ที่มีอยู่แล้ว
  description?: string; // Description ของ Tag ที่สร้างใหม่
}

// เราจะใช้ Signature มาตรฐานของ App Router ครับ
 
export async function POST(req: NextRequest, ctx: RouteContext<'/api/posts/add/[field]'>) {
  const { field } = await ctx.params
//   console.log(field)
  try {
    // === 1. Authentication: ผู้ใช้คนนี้คือใคร? ===
    const session = await getServerSession(authOptions);
    if (!session || !session.user || !(session.user as User).uid) {
      return Response.json(
        { message: 'Unauthorized' },
        { status: 401 },
      );
    }
    // เราได้ uid ของผู้ใช้ที่ login แล้ว
    const uid = (session.user as User).uid;
    const { searchParams } = new URL(req.url);
    const postId = searchParams.get('postId');

    if (!postId) {
      return Response.json(
        { message: 'postId is required' },
        { status: 400 },
      );
    }

    // === 3. Authorization (Ownership Check): Post นี้เป็นของเขาจริงมั้ย? ===
    // (สมมติว่าตาราง posts ของเมมีคอลัมน์ uid)
    const { data: postOwner, error: ownerError } = await supabase
      .from('posts')
      .select('uid')
      .eq('id', postId) // ID ของ Post ตรงกัน
      .eq('uid', uid) // และ UID ของเจ้าของตรงกัน
      .single(); // เอาแค่แถวเดียว

    if (ownerError || !postOwner) {
      // ถ้าหาไม่เจอ (error หรือ !postOwner) หมายความว่า...
      // 1. Post นี้ไม่มีอยู่จริง
      // 2. Post นี้มีอยู่จริง แต่เป็นของคนอื่น
      // ไม่ว่าจะกรณีไหน เราก็ไม่อนุญาตให้เขาแก้ไข
      return Response.json(
        { message: 'Post not found or you do not have permission' },
        { status: 404 }, // 404 (Not Found) หรือ 403 (Forbidden) ก็ได้ครับ
      );
    }

    // === 4. Business Logic: แยกตาม [field] ===
    // ถ้าผ่านมาถึงตรงนี้ได้ แปลว่าเขาเป็นเจ้าของ Post ตัวจริง
    const body = await req.json();

    switch (field) {
      // --- กรณีเพิ่ม Link ---
      case 'links': {
        const { link } = body as AddLinkBody;
        if (!link || typeof link !== 'string') {
          return Response.json(
            { message: 'Invalid link data' },
            { status: 400 },
          );
        }

        // (สมมติว่าตารางชื่อ 'links_in_post')
        const { error: insertError } = await supabase
          .from('links_in_post')
          .insert({
            post_id: postId,
            link: link,
            // (ถ้ามีคอลัมน์ uid ก็ใส่ uid ด้วยก็ได้ครับ)
          });

        if (insertError) {
          throw insertError; // โยนเข้า Global try...catch
        }

        return Response.json(
          { message: 'Link added successfully' },
          { status: 201 },
        );
      }

      // --- กรณีเพิ่ม Code ---
      case 'codes': {
        const { description, code, language } = body as AddCodeBody;
        if (!description || !code || !language) {
          return Response.json(
            { message: 'Invalid code data' },
            { status: 400 },
          );
        }

        // (สมมติว่าตารางชื่อ 'code_in_post')
        const { error: insertError } = await supabase
          .from('codes_in_post')
          .insert({
            post_id: postId,
            description: description,
            code: code,
            language: language,
          });

        if (insertError) {
          throw insertError;
        }

        return Response.json(
          { message: 'Code block added successfully' },
          { status: 201 },
        );
      }

      // --- กรณีเพิ่ม Tag (ซับซ้อนที่สุด ตามแผน) ---
      case 'tags': {
        const { tagId, description } = body as AddTagBody;

        // สถานการณ์ 1: เพิ่ม Tag ที่มีอยู่แล้ว (ส่ง tagId มา)
        if (tagId) {
          // (สมมติว่าตารางเชื่อมชื่อ 'post_tags')
          // เราควรเช็คก่อนว่ามันเชื่อมไปแล้วหรือยัง (กันข้อมูลซ้ำ)
          const { data: existingLink } = await supabase
            .from('post_tags')
            .select('id')
            .eq('post_id', postId)
            .eq('tag_id', tagId)
            .single();

          if (existingLink) {
            return Response.json(
              { message: 'Tag already added' },
              { status: 409 }, // 409 Conflict
            );
          }

          // ถ้ายังไม่มี ก็เพิ่มลงตารางเชื่อม
          const { error: linkError } = await supabase
            .from('post_tags')
            .insert({ post_id: postId, tag_id: tagId });

          if (linkError) throw linkError;

          return Response.json(
            { message: 'Tag linked successfully' },
            { status: 201 },
          );
        }

        // สถานการณ์ 2: สร้าง Tag ใหม่ (ส่ง description มา)
        if (description) {
          let newTagData: Tag; // ตัวแปรสำหรับเก็บ Tag ที่จะส่งกลับไป

          // 2.1 ค้นหา "หรือ" สร้าง Tag ใหม่
          // (สมมติว่าตาราง Tag ชื่อ 'tags' และมี 'uid' เพื่อบอกว่าใครสร้าง)
          const { data: existingTag } = await supabase
            .from('tags')
            .select('*') // ดึงมาทั้งแถวเลย
            .eq('description', description)
            .eq('uid', uid) // Tag นี้ ที่ user คนนี้สร้าง
            .single();

          if (existingTag) {
            // ถ้ามี Tag นี้อยู่แล้ว (ด้วย uid นี้)
            newTagData = existingTag;
          } else {
            // ถ้ายังไม่มี Tag นี้ (สำหรับ uid นี้)
            // สร้างมันขึ้นมาใหม่
            console.log('create new tag' ,description)
            const { data: createdTag, error: createTagError } = await supabase
              .from('tags')
              .insert({
                description: description,
                uid: uid,
              })
              .select('*') // ขอข้อมูลที่เพิ่งสร้างกลับมาด้วย
              .single();

            if (createTagError || !createdTag) {
              throw createTagError || new Error('Failed to create tag');
            }
            newTagData = createdTag;
          }
          
          // 2.2 เชื่อม Tag (ที่เพิ่งหา/สร้าง) เข้ากับ Post
          // (เช็คซ้ำอีกที กันกรณีที่ Tag มีอยู่แล้ว แต่ดันเชื่อมไปแล้ว)
          const { data: existingLink } = await supabase
            .from('post_tags')
            .select('id')
            .eq('post_id', postId)
            .eq('tag_id', newTagData.id)
            .single();

          if (existingLink) {
            return Response.json(
              { message: 'Tag already added' },
              { status: 409 },
            );
          }

          const { error: linkError } = await supabase
            .from('post_tags')
            .insert({ post_id: postId, tag_id: newTagData.id }); // เพิ่มแท็กใหม่แล้วเพิ่มลงในโพสต์ด้วย

          if (linkError) throw linkError;
          // ส่ง Tag ที่สร้าง/หาเจอ กลับไปให้ Frontend (ตามแผน)
          return Response.json(
            { message: 'Tag created and linked', newTag: newTagData },
            { status: 201 },
          );
        }

        // ถ้าไม่ส่งอะไรมาเลย
        return Response.json(
          { message: 'Invalid tag data' },
          { status: 400 },
        );
      }

      // --- กรณี Field ไม่ถูกต้อง ---
      default:
        return Response.json(
          { message: 'Invalid field specified' },
          { status: 400 },
        );
    }
  } catch (err) {
    // === Global Error Handler ===
    console.error(`Error in /api/posts/add/[field]:`, (err as Error).message);

    return Response.json(
      { message: 'An internal server error occurred' },
      { status: 500 },
    );
  }
}