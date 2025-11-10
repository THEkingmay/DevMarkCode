// test-supabase.js

// 1. โหลดตัวแปรจาก .env.local เข้าสู่ process.env
require('dotenv').config({ path: '.env' });

const { createClient } = require('@supabase/supabase-js');

// 2. ดึงค่า URL และ KEY (ใช้ชื่อตัวพิมพ์ใหญ่ที่เราแก้ไป)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// 3. ตรวจสอบว่าอ่านค่าได้หรือไม่
if (!supabaseUrl) {
  console.error('❌ Error: Missing environment variable SUPABASE_URL');
  process.exit(1);
}
if (!supabaseKey) {
  console.error('❌ Error: Missing environment variable SUPABASE_KEY');
  process.exit(1);
}

console.log('🟡 กำลังเชื่อมต่อสู่ Supabase URL:', supabaseUrl , supabaseKey);

// 4. สร้าง Client
const supabase = createClient(supabaseUrl, supabaseKey);

// 5. สร้างฟังก์ชันทดสอบ
async function testConnection() {
  console.log('🟡 กำลังส่งคำสั่ง query...');
  try {
    // --- ⬇️ (สำคัญมาก) ⬇️ ---
    // *** ให้เปลี่ยน 'users' เป็นชื่อตาราง (table) ที่เมมีอยู่จริงใน Supabase ***
    const { data, error } = await supabase
      .from('Members') // <-- ⚠️ เปลี่ยนตรงนี้
      .select('*')
      .limit(1);

    // 6. ตรวจสอบ Error ที่ Supabase ส่งกลับมา
    if (error) {
      console.error('❌ Supabase error:', error.message);
      console.log('---');
      console.log('Hint: ตรวจสอบว่า SUPABASE_KEY ถูกต้อง และตาราง "Members" (หรือตารางที่เมใส่) มีอยู่จริง และเปิด RLS (Row Level Security) ถูกต้องหรือไม่');
      return;
    }

    // 7. ถ้าสำเร็จ
    console.log('✅✅✅ เชื่อมต่อ Supabase สำเร็จ! ✅✅✅');
    console.log('ได้ข้อมูล (อาจจะเป็น array ว่าง ถ้าตารางไม่มีข้อมูล):', data);

  } catch (err) {
    // 8. จับ Error ระดับ Network (เช่น fetch failed)
    console.error('❌ Network or Fetch Error:', err.message);
    console.log('---');
    console.log('Hint: ตรวจสอบว่า SUPABASE_URL ถูกต้องเป๊ะๆ และอินเทอร์เน็ต/Firewall ไม่ได้บล็อก');
  }
}

// 9. รันฟังก์ชันเทส
testConnection();