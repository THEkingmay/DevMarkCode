'use client';

import { useParams } from 'next/navigation';
import { Fragment, useEffect, useState } from 'react';
import { PostStructure } from '@/util/type/type'; // (ใช้ Type เดิมของคุณ)
import { toast } from 'react-toastify';

// --- Imports สำหรับ UI ---
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import {
  PencilSquareIcon,
  TrashIcon,
  ClipboardIcon,
  PlusCircleIcon ,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline';

import { Dialog, Transition } from '@headlessui/react';

// --- Component หลัก ---
export default function SelectPost() {
  const [post, setPost] = useState<PostStructure>({
    post_id: '',
    uid: '',
    title: '',
    description: '',
    tags: [],
    links: [],
    codes: [],
    created_at: '',
  });
  const { postId } = useParams<{ postId: string }>();

  // --- State สำหรับ Modal และ UI ---
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingField, setEditingField] = useState<string | null>(null);
  const [copiedCodeIndex, setCopiedCodeIndex] = useState<number | null>(null);

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);

  // --- ส่วน Logic การดึงข้อมูล (โค้ดเดิมของคุณ) ---
  const getPostById = async (post_id: string) => {
    try {
      const res = await fetch(`/api/posts/getPost?post_id=${post_id}`);
      if (!res.ok) throw new Error('ไม่สามารถดึงข้อมูลโพสต์ได้');
      const resData = await res.json();
      const data: PostStructure = resData.data;
      setPost(data);
    } catch (err) {
      console.log((err as Error).message);
      toast.error((err as Error).message);
    }
  };

  useEffect(() => {
    if (postId) {
      getPostById(postId);
    }
  }, [postId]); // (เปลี่ยนเป็น [postId] เพื่อให้ re-fetch เมื่อ ID เปลี่ยน)

  // --- Logic สำหรับ UI ---

  // 1. เปิด Modal
  const openModal = (field: string) => {
    setEditingField(field);
    setIsModalOpen(true);
  };

  // 2. ปิด Modal
  const closeModal = () => {
    setIsModalOpen(false);
    setEditingField(null);
  };

  const handleUpdate = () => {
    //
    // *** ที่นี่คือส่วนที่คุณจะเขียน Logic การยิง API เพื่ออัปเดตข้อมูล ***
    //
    console.log('กำลังอัปเดต field:', editingField);
    toast.success('อัปเดตข้อมูลสำเร็จ! กำลังรีโหลด...');
    // ปิด Modal และ Reload ข้อมูล
    closeModal();
    getPostById(postId);
  };


  const handleConfirmDelete = () => {

    console.log('กำลังลบโพสต์ ID:', post.post_id);
    toast.warn('ฟังก์ชันลบยังไม่ได้เชื่อมต่อ API');

    setIsDeleteModalOpen(false);

  };

  // 5. ปุ่มคัดลอกโค้ด
  const handleCopyCode = (codeToCopy: string, index: number) => {
    navigator.clipboard.writeText(codeToCopy);
    setCopiedCodeIndex(index);
    toast.success('คัดลอกโค้ดแล้ว!');
    setTimeout(() => setCopiedCodeIndex(null), 2000); // ซ่อน feedback หลัง 2 วิ
  };

  if (!post.post_id) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <p>Loading post...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8">
      {/* === 1. ส่วนหัวเรื่อง (Title) === */}
      <section>
        <div className="flex justify-between items-start gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl md:text-4xl font-bold break-words">
              {post.title}
            </h1>
            <button
              onClick={() => openModal('title')}
              className="text-gray-500 hover:text-blue-600 transition-colors"
            >
              <PencilSquareIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          โดย: {post.uid} | เผยแพร่เมื่อ:{' '}
          {new Date(post.created_at).toLocaleString('th-TH')}
        </p>
      </section>

      {/* === 2. ส่วนคำอธิบาย (Description) === */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-semibold">คำอธิบาย</h2>
          <button
            onClick={() => openModal('description')}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
        </div>
        <p className="text-gray-800 whitespace-pre-wrap">{post.description}</p>
      </section>

      {/* === 3. ส่วนแท็ก (Tags) === */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-semibold">แท็ก</h2>
          <button
            onClick={() => openModal('tags')}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag.id}
              className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium"
            >
              {tag.description}
            </span>
          ))}
        </div>
      </section>

      {/* === 4. ส่วนลิงก์ (Links) === */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <h2 className="text-2xl font-semibold">ลิงก์อ้างอิง</h2>
          <button
            onClick={() => openModal('links')}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <PencilSquareIcon className="w-5 h-5" />
          </button>
        </div>
        <ul className="list-disc list-inside space-y-1">
          {post.links.map((link, index) => (
            <li key={index}>
              <a
                href={link.link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline break-all"
              >
                {link.link}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* === 5. ส่วนโค้ด (Codes) === */}
      <section>
      <div className='flex items-center'>
          <h2 className="text-2xl font-semibold mb-2 me-2">ตัวอย่างโค้ด</h2> 
          <button
            onClick={() => openModal('Add Code')}
            className="text-gray-500 hover:text-blue-600 transition-colors"
          >
            <PlusCircleIcon className="w-7 h-7" />
          </button>
      </div>
        <div className="space-y-6">
          {post.codes.map((codeBlock, index) => (
            <div
              key={index}
              className="border rounded-lg overflow-hidden shadow-md"
            >
              {/* ส่วนหัวของ Code Block (คำอธิบาย + ปุ่มแก้ไข/คัดลอก) */}
              <div className="flex justify-between items-center bg-gray-100 p-3">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{codeBlock.description}</p>
                  <button
                    onClick={() => openModal(`code-${index}`)} // ส่ง index ไปด้วย
                    className="text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <PencilSquareIcon className="w-5 h-5" />
                  </button>
                </div>
                <button
                  onClick={() => handleCopyCode(codeBlock.code, index)}
                  className="flex items-center gap-1 text-sm text-gray-600 hover:text-black"
                >
                  <ClipboardIcon className="w-4 h-4" />
                  {copiedCodeIndex === index ? 'คัดลอกแล้ว!' : 'คัดลอก'}
                </button>
              </div>

              {/* ส่วนแสดงโค้ด (Syntax Highlighter) */}
              <SyntaxHighlighter
                language={codeBlock.language}
                style={atomDark} // (คุณสามารถเปลี่ยน Theme ได้ที่นี่)
                customStyle={{ margin: 0, borderRadius: '0 0 8px 8px' }}
                wrapLongLines={true}
              >
                {codeBlock.code}
              </SyntaxHighlighter>
            </div>
          ))}
        </div>
      </section>

      <Transition appear show={isModalOpen} as={Fragment}>
        <Dialog as="div" className=" z-50" onClose={closeModal}>
          
        <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-30"
            leave="ease-in duration-200"
            leaveFrom="opacity-30"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0" /> 
          </Transition.Child>

          {/* ส่วนที่ 2: ตัว Modal (Panel) */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95" // <-- Start (เล็กและจาง)
                enterTo="opacity-100 scale-100"   // <-- End (ปกติ)
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100" // <-- Start (ปกติ)
                leaveTo="opacity-0 scale-95"   // <-- End (เล็กและจาง)
              >
                <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  

                  <Dialog.Title
                    as="h3"
                    className="text-xl font-semibold leading-6 text-gray-900 mb-4"
                  >
                    แก้ไขข้อมูล (Field: {editingField})
                  </Dialog.Title>

                  {/* ส่วนฟอร์ม (เหมือนเดิม) */}
                  <div className="mt-2">
                    <div className="bg-gray-100 p-4 rounded min-h-[200px]">
                      <p className="text-gray-600">
                        (นี่คือพื้นที่สำหรับฟอร์มแก้ไข {editingField})
                      </p>
                      <p>คุณจะต้องเขียน Logic การแก้ไขในส่วนนี้...</p>
                    </div>
                  </div>

                  {/* ปุ่มควบคุม (เหมือนเดิม) */}
                  <div className="flex justify-end gap-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="button"
                      onClick={handleUpdate}
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                      ยืนยันการแก้ไข
                    </button>
                  </div>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      <button
            onClick={() => setIsDeleteModalOpen(true)} 
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex-shrink-0"
          >
            <TrashIcon className="w-5 h-5" />
            <span className="hidden md:inline">ลบโพสต์</span>
       </button>
       <Transition appear show={isDeleteModalOpen} as={Fragment}>
        <Dialog as="div" className=" z-50" onClose={() => setIsDeleteModalOpen(false)}>
          
          {/* Backdrop (ใช้โค้ดเดิมที่โปร่งใส 30%) */}
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-30" 
            leave="ease-in duration-200"
            leaveFrom="opacity-30"
            leaveTo="opacity-0"
          >
            <div className="fixed" />
          </Transition.Child>

          {/* ส่วนตัว Modal */}
          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-lg bg-white p-6 text-left align-middle shadow-xl transition-all">
                  
                  {/* ดีไซน์ส่วนหัว (ไอคอน + ข้อความ) */}
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-600" aria-hidden="true" />
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                        ยืนยันการลบโพสต์
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-gray-500">
                          คุณแน่ใจหรือไม่ว่าต้องการลบโพสต์นี้?
                          ข้อมูลทั้งหมดจะถูกลบถาวรและไม่สามารถกู้คืนได้
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* ปุ่มควบคุม (ยืนยัน / ยกเลิก) */}
                  <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                    <button
                      type="button"
                      className="inline-flex w-full justify-center rounded-md bg-red-600 px-4 py-2 text-base font-medium text-white shadow-sm hover:bg-red-700 sm:ml-3 sm:w-auto sm:text-sm"
                      onClick={handleConfirmDelete} // <-- เรียกฟังก์ชันลบจริง
                    >
                      ยืนยันการลบ
                    </button>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-4 py-2 text-base font-medium text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto sm:text-sm"
                      onClick={() => setIsDeleteModalOpen(false)} // <-- แค่ปิด Modal
                    >
                      ยกเลิก
                    </button>
                  </div>

                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}