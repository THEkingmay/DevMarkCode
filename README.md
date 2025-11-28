# 🔖 DevMarkCode

![Project Status](https://img.shields.io/badge/Status-Active-success?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)
![Next.js](https://img.shields.io/badge/Next.js-14+-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue?style=flat-square&logo=typescript)

> **DevMarkCode** คือเว็บแอปพลิเคชันสำหรับบันทึกและจัดระเบียบความรู้ทางด้านการเขียนโปรแกรม ไม่ว่าจะเป็นบทความ ลิงก์ที่น่าสนใจ หรือตัวอย่างโค้ด (Code Snippets) โดยมาพร้อมกับระบบ **Tagging** ที่ช่วยให้คุณแยกหมวดหมู่และค้นหาข้อมูลได้ง่ายดาย

---

## 📸 Screen Preview

<img width="1434" height="858" alt="image" src="https://github.com/user-attachments/assets/1b9d01ff-277a-48d2-b443-d0c01f4d5920" />
<img width="1867" height="853" alt="image" src="https://github.com/user-attachments/assets/f76b3fc2-a467-461c-ba71-831723eca6e1" />
<img width="1626" height="860" alt="image" src="https://github.com/user-attachments/assets/6b7509d1-3400-4477-85f5-c017774d9ac6" />


![App Screenshot](https://via.placeholder.com/800x400?text=App+Screenshot+Here)

---

## ✨ ฟีเจอร์หลัก (Key Features)

* **📝 Save Code & Links:** บันทึกบทความ ลิงก์ หรือเก็บ Code Snippets ที่สำคัญไว้อ่านย้อนหลังได้ในที่เดียว
* **🏷️ Tagging System:** จัดระเบียบเนื้อหาด้วยการสร้างและติด **Tags** ให้กับแต่ละบทความ ช่วยให้แยกหมวดหมู่และค้นหาได้สะดวกรวดเร็ว
* **🔐 Secure Authentication:** รองรับการเข้าสู่ระบบอย่างปลอดภัยผ่าน **GitHub** โดยใช้ **NextAuth.js** และ **Auth0**
* **⚡ High Performance:** พัฒนาด้วย **Next.js (App Router)** เพื่อความเร็วและประสิทธิภาพสูงสุดในการโหลดเนื้อหา
* **🎨 Modern UI/UX:** ออกแบบด้วย **Tailwind CSS** และ **Shadcn/UI** ให้ความรู้สึกเรียบหรู สบายตา
* **📱 Responsive Design:** รองรับการใช้งานทั้งบน Desktop และ Mobile

---

## 🛠️ Tech Stack

เครื่องมือและเทคโนโลยีที่ใช้ในโปรเจคนี้:

* **Framework:** [Next.js](https://nextjs.org/) (App Router)
* **Language:** [TypeScript](https://www.typescriptlang.org/)
* **Authentication:** [NextAuth.js](https://next-auth.js.org/), [Auth0](https://auth0.com/)
* **Styling:** [Tailwind CSS](https://tailwindcss.com/)
* **Components:** [Shadcn UI](https://ui.shadcn.com/)
* **Utility:** `clsx`, `tailwind-merge`
* **Deployment:** [Vercel](https://vercel.com/)

---

## 🚀 การติดตั้งและเริ่มต้นใช้งาน (Getting Started)

หากต้องการรันโปรเจคนี้ในเครื่องของคุณ สามารถทำตามขั้นตอนด้านล่างได้เลยค่ะ:

1. **Clone Repository**
   ```bash
   git clone [https://github.com/THEkingmay/DevMarkCode.git](https://github.com/THEkingmay/DevMarkCode.git)
   cd DevMarkCode
2.ติดตั้ง Dependencies
  ```bash
    npm install
    # หรือ
    yarn install
    # หรือ
    pnpm install
```
3.ตั้งค่า Environment Variables สร้างไฟล์ .env หรือ .env.local ที่ root directory และใส่ค่าที่จำเป็น:
```bash
  NEXTAUTH_URL="http://localhost:3000/"
NEXTAUTH_SECRET= ''

GITHUB_CLIENT_ID= ''
GITHUB_CLIENT_SECRET= ''

SUPABASE_KEY = ''
SUPABASE_URL = ''
```
4.รันโปรเจค
  ```bash
   npm run dev
```
