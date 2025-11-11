import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import type { User, PostForm } from '@/util/type/type';
import { supabase } from '@/lib/supabase';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions); 
    if (!session)
      return NextResponse.json(
        { message: 'you have to login' },
        { status: 401 }
      );
    const uid = (session.user as User).uid;

    const body: PostForm = await req.json();
    if (!body.title.trim() || !body.description?.trim()) {
      return NextResponse.json(
        { message: 'ต้องกรอกหัวข้อและคำอธิบาย' },
        { status: 400 }
      );
    }
    const { data: NewPost, error } = await supabase.rpc('fn_create_post', {
      p_uid: uid,
      p_title: body.title,
      p_description: body.description,
      p_tags: body.tags,
      p_links: body.links,
      p_codes: body.codeSnip,
    });
    if (error) {
      console.error('Supabase RPC Error:', error.message);
      return NextResponse.json({ message: error.message }, { status: 500 });
    }
    return NextResponse.json(NewPost, { status: 201 });
  } catch (err) {
    console.error('Internal POST Error:', (err as Error).message);
    return NextResponse.json(
      { message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

// ขั้นตอนการเพิ่ม

//     {

//   title: 'API',

//   description: 'ทดสอบๆ',

//   tags: [ { id: '', description: 'ts' }, { id: '', description: 'next' } ],

//   links: [ 'https://gemini.google.com/app/53f5ca3a0402c005' ],

//   codeSnip: [

//     {

//       code: 'import { getServerSession } from "next-auth";\n' +

//         'import { NextRequest, NextResponse } from "next/server";\n' +

//         'import type { User , PostForm} from "@/type/type";\n' +

//         'import { supabase } from "@/lib/supabase";\n' +

//         '\n' +

//         'export async function POST(req : NextRequest){\n' +

//         '    const session = await getServerSession()\n' +

//         '    if(!session) return NextResponse.json({message : "you have to login"} ,{status : 401})\n' +

//         '    const  uid = (session.user as User).uid\n' +

//         '    const body : PostForm = await req.json()\n' +

//         '    console.log(body)\n' +

//         '\n' +

//         '    // ขั้นตอนการเพิ่ม\n' +

//         '    \n' +

//         '\n' +

//         '    return NextResponse.json({message : "เพิ่มสำเร็จ"} , {status:200})\n' +

//         '}   ',

//       description: 'เก็บโพสต์',

//       language: 'tsx'

//     }

//   ]

// }

// 1. บันทึกโพสต์ ในตาราง posts โดยเก็บ title description uid และเอา id ออกมา

// 2. บันทึกแท็ก วนลูปในแท็ก

//  2.1 ถ้าแท็กไอดี เป็น '' ให้บันทึกลง ตาราง tags ใช้ description กับ uid ดึงไอดีแท็กมาแล้วบันทึก post_tag ใช้ postid , tagId

//  2.2 ถ้าไอดีแท็ก != '' ให้บันทึก post_tags ได้เลย

// 3.บันทึก link_post โดยวนลูปใน body.link แล้วบันทึกโดย post_id , link

//4.บันทึก code_in_post เหมือนกันวนลุปแล้วใช้ post_id , code , language , descritpion
