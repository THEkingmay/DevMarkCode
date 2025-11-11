'use client';
import { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import type { Code, PostForm, Tag } from '@/util/type/type';
import {
  XMarkIcon,
  PlusIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/solid';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const Card = ({
  children,
  title,
}: {
  children: React.ReactNode;
  title?: string;
}) => (
  <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden">
    {title && (
      <h3 className="text-lg font-semibold p-4 border-b dark:border-gray-700">
        {title}
      </h3>
    )}
    <div className="p-4 space-y-4">{children}</div>
  </div>
);

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
}
const FormInput = ({ label, ...props }: FormInputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <input
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    />
  </div>
);

interface FormTextAreaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
}
const FormTextArea = ({ label, ...props }: FormTextAreaProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
      {label}
    </label>
    <textarea
      {...props}
      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
    />
  </div>
);

export default function AddPost() {
  const [selectableTags, setTags] = useState<Tag[]>([]);
  const [loadTags, setLoadTags] = useState<boolean>(true);

  const [formPost, setFormPost] = useState<PostForm>({
    title: '',
    description: '',
    tags: [],
    links: [],
    codeSnip: [],
  });

  const [newLink, setNewLink] = useState('');
  const [newCode, setNewCode] = useState<Code>({
    code: '',
    description: '',
    language: '',
  });
  const [isHideCodeForm, setHidden] = useState<boolean>(true);

  const [searchTag, setSearchTag] = useState<string>('');
  const handleSearchTag = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { value } = e.target;
    setSearchTag(value);
  };
  const filteredTags = useMemo(() => {
    const lowerSearch = searchTag.toLowerCase();

    return selectableTags.filter((tag) =>
      tag.description.toLowerCase().includes(lowerSearch)
    );
  }, [selectableTags, searchTag]);

  const resetForm = () => {
    setFormPost({
      title: '',
      description: '',
      tags: [],
      links: [],
      codeSnip: [],
    });
    setNewLink('');
    setNewCode({ code: '', description: '', language: '' });
    setSearchTag('');
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    if (name === 'title' || name === 'description') {
      setFormPost((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTagToggle = (tag: Tag) => {
    setFormPost((prev) => {
      // ใช้ description เพราะหากเพิ่มแท็กที่ยังไม่มี จะยังไม่มี id แต่ต้องเอาไปสร้างที่API
      const isSelected = prev.tags.find(
        (t) => t.description === tag.description
      );

      if (isSelected) {
        return {
          ...prev,
          tags: prev.tags.filter((t) => t.description !== tag.description),
        };
      } else {
        setSearchTag('');
        return { ...prev, tags: [...prev.tags, tag] };
      }
    });
  };

  const addLink = () => {
    if (newLink.trim() && !formPost.links.includes(newLink)) {
      setFormPost((prev) => ({ ...prev, links: [...prev.links, newLink] }));
      setNewLink('');
      toast.success('เพิ่มลิงก์แล้ว!');
    } else {
      toast.warn('โปรดป้อนลิงก์ที่ถูกต้องและไม่ซ้ำกัน');
    }
  };

  const removeLink = (index: number) => {
    setFormPost((prev) => ({
      ...prev,
      links: prev.links.filter((_, i) => i !== index),
    }));
  };

  const addCodeSnip = () => {
    if (newCode.code.trim() && newCode.language.trim()) {
      // console.log(newCode)
      setFormPost((prev) => ({
        ...prev,
        codeSnip: [...prev.codeSnip, newCode],
      }));
      setNewCode({ code: '', description: '', language: '' });
      toast.success('เพิ่มโค้ดตัวอย่างแล้ว!');
    } else {
      toast.warn('จำเป็นต้องกรอกโค้ดและภาษา');
    }
  };

  const removeCodeSnip = (index: number) => {
    setFormPost((prev) => ({
      ...prev,
      codeSnip: prev.codeSnip.filter((_, i) => i !== index),
    }));
  };

  const fetchSelectableTags = async () => {
    try {
      setLoadTags(true);

      const res = await fetch('/api/posts/tags/getAllTags');
      if (!res.ok) {
        const errorRes = await res.json();
        throw new Error(errorRes.message || 'เกิดข้อผิดพลาดในการโหลดแท็ก');
      }
      const responseJson = await res.json();
      const data: Tag[] = responseJson.data;

      setTags(data);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoadTags(false);
    }
  };

  useEffect(() => {
    fetchSelectableTags();
  }, []);

  const [loadSubmit, setLoadSubmit] = useState<boolean>(false);
  const handleSubmit = async () => {
    // ตรวจสอบก่อน
    // console.log(formPost)
    if (formPost.title.trim() == '' || formPost.description?.trim() == '')
      return toast.warn('ต้องกรอกหัวข้อและคำอธิบาย');
    try {
      setLoadSubmit(true);
      const res = await fetch('/api/posts/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formPost),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'เกิดข้อผิดพลาดในการเพิ่ม');
      }
      toast.success('เพิ่มโพสต์ใหม่สำเร็จ');
      resetForm();
    } catch (err) {
      console.log((err as Error).message);
      toast.error((err as Error).message);
    } finally {
      setLoadSubmit(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 dark:text-white">
        สร้างโพสต์ใหม่
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-5">
          <Card title="เนื้อหาหลัก">
            <FormInput
              label="หัวข้อ"
              name="title"
              value={formPost.title}
              onChange={handleTextChange}
              placeholder="หัวข้อโพสต์ของคุณ..."
            />
            <FormTextArea
              label="คำอธิบาย"
              name="description"
              value={formPost.description || ''}
              onChange={handleTextChange}
              rows={5}
              placeholder="คำอธิบายสั้นๆ เกี่ยวกับโพสต์..."
            />
          </Card>

          <Card>
            <div
              onClick={() => setHidden(!isHideCodeForm)}
              className="flex justify-between items-center p-4 border-b dark:border-gray-700 cursor-pointer select-none"
            >
              <h3 className="text-lg font-semibold dark:text-white">
                โค้ดตัวอย่าง
                <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-2">
                  {isHideCodeForm ? '(คลิกเพื่อเปิด)' : '(คลิกเพื่อซ่อน)'}
                </span>
              </h3>
              <ChevronDownIcon
                className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isHideCodeForm ? '' : 'rotate-180'}`}
              />
            </div>

            <div
              className={`p-4 space-y-4 ${isHideCodeForm ? 'hidden' : 'block'}`}
            >
              <FormInput
                label="ภาษา"
                value={newCode.language}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCode((c) => ({ ...c, language: e.target.value }))
                }
                placeholder="เช่น typescript, python, css"
              />
              <FormTextArea
                label="โค้ด"
                value={newCode.code}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                  setNewCode((c) => ({ ...c, code: e.target.value }))
                }
                rows={8}
                placeholder="วางโค้ดของคุณที่นี่..."
                className="font-mono text-sm"
              />
              <FormInput
                label="คำอธิบาย (ไม่บังคับ)"
                value={newCode.description}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewCode((c) => ({ ...c, description: e.target.value }))
                }
                placeholder="โค้ดนี้ทำหน้าที่อะไร?"
              />
              <button
                onClick={addCodeSnip}
                className="w-full flex justify-center items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                <PlusIcon className="w-5 h-5" />
                เพิ่มโค้ดตัวอย่าง
              </button>
            </div>

            {formPost.codeSnip.length > 0 && (
              <div className="p-4 border-t dark:border-gray-700 space-y-3">
                <h4 className="font-semibold dark:text-white">
                  โค้ดที่เพิ่มแล้ว:
                </h4>
                {formPost.codeSnip.map((snippet, index) => (
                  <div
                    key={index}
                    className="bg-gray-100 dark:bg-gray-700 p-3 rounded-md relative"
                  >
                    <button
                      onClick={() => removeCodeSnip(index)}
                      className="absolute top-2 right-2 text-gray-500 hover:text-red-500 dark:text-gray-400"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                    <p className="text-sm font-medium dark:text-white">
                      {snippet.language}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-300 mb-2">
                      {snippet.description}
                    </p>
                    <pre className="text-sm bg-white dark:bg-gray-800 p-2 rounded overflow-x-auto">
                      <code>{snippet.code.substring(0, 100)}...</code>
                    </pre>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>

        <div className="md:col-span-1 space-y-5">
          <Card title="แท็ก">
            <div className="relative w-full">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
              </span>
              <input
                type="text"
                className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                onChange={handleSearchTag}
                placeholder="ค้นหาแท็ก..."
                value={searchTag}
              />
            </div>
            <div className="flex flex-wrap gap-2 p-3 border-b dark:border-gray-700 min-h-[50px]">
              {formPost.tags.length === 0 ? (
                <span className="text-sm text-gray-500 dark:text-gray-400 italic px-2 py-1">
                  ยังไม่ได้เลือกแท็ก
                </span>
              ) : (
                formPost.tags.map((tag) => (
                  <button
                    key={`selected-${tag.description}`}
                    onClick={() => handleTagToggle(tag)}
                    className="flex items-center gap-1.5 px-3 py-1 text-sm rounded-full bg-blue-600 text-white transition-colors hover:bg-blue-700"
                  >
                    <span>{tag.description}</span>
                    <XMarkIcon className="w-4 h-4 stroke-2" />
                  </button>
                ))
              )}
            </div>

            <div className="flex flex-wrap gap-2 p-3 max-h-48 overflow-y-auto">
              {loadTags ? (
                <p className="text-sm text-gray-500">กำลังโหลดแท็ก...</p>
              ) : (
                filteredTags
                  .filter(
                    (tag) =>
                      !formPost.tags.find(
                        (t) => t.description === tag.description
                      )
                  )
                  .map((tag) => (
                    <button
                      key={tag.id}
                      onClick={() => handleTagToggle(tag)} // คลิกเพื่อเพิ่ม
                      className="px-3 py-1 text-sm rounded-full bg-gray-200 dark:bg-gray-700 dark:text-gray-200 hover:bg-gray-300 transition-colors"
                    >
                      {tag.description}
                    </button>
                  ))
              )}
              {filteredTags.length === 0 &&
                searchTag.trim() !== '' &&
                !formPost.tags.find(
                  (tag) =>
                    tag.description.toLowerCase() === searchTag.toLowerCase()
                ) && (
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg shadow-sm mt-4">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center sm:text-left">
                      ไม่พบแท็ก "
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {searchTag}
                      </span>
                      " !
                    </span>
                    <button
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                      onClick={() => {
                        handleTagToggle({ id: '', description: searchTag });
                      }}
                    >
                      เพิ่มแท็ก "
                      <span className="font-semibold">{searchTag}</span>"
                    </button>
                  </div>
                )}
              {!loadTags &&
                selectableTags.filter(
                  (tag) => !formPost.tags.find((t) => t.id === tag.id)
                ).length === 0 &&
                formPost.tags.length > 0 && (
                  <span className="text-sm text-gray-500 dark:text-gray-400 italic px-2 py-1">
                    เลือกแท็กทั้งหมดแล้ว
                  </span>
                )}
            </div>
          </Card>

          <Card title="ลิงก์ที่เกี่ยวข้อง">
            <div className="flex gap-2">
              <input
                type="url"
                value={newLink}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                  setNewLink(e.target.value)
                }
                placeholder="https://..."
                className="flex-grow px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              <button
                onClick={addLink}
                className="flex-shrink-0 px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                <PlusIcon className="w-5 h-5" />
              </button>
            </div>
            <ul className="list-disc list-inside space-y-2 mt-4">
              {formPost.links.map((link, index) => (
                <li
                  key={index}
                  className="flex items-center justify-between text-sm dark:text-gray-300"
                >
                  <a
                    href={link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="truncate hover:underline"
                    title={link}
                  >
                    {link}
                  </a>
                  <button
                    onClick={() => removeLink(index)}
                    className="ml-2 text-gray-500 hover:text-red-500 flex-shrink-0"
                  >
                    <XMarkIcon className="w-4 h-4" />
                  </button>
                </li>
              ))}
            </ul>
          </Card>

          <Card title="การดำเนินการ">
            <button
              disabled={loadSubmit}
              onClick={handleSubmit}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors font-semibold"
            >
              {loadSubmit ? 'กำลังเพิ่ม...' : 'เพิ่มโพสต์ใหม่'}
            </button>
            <button
              onClick={resetForm}
              className="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 dark:text-gray-200 text-gray-800 rounded-md hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              ล้างฟอร์ม
            </button>
          </Card>
        </div>
      </div>
    </div>
  );
}
