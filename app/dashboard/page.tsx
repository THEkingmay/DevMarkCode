'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { PostTitle } from '@/util/type/type';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

function Loader() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <div className="flex space-x-2 mb-4">
        <div className="w-4 h-4 bg-indigo-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-4 h-4 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-4 h-4 bg-indigo-600 rounded-full animate-bounce"></div>
      </div>
      <p className="text-gray-500 font-medium animate-pulse">กำลังวิ่งไปเอาข้อมูล...</p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="text-center py-20 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
      <p className="text-xl text-gray-400 font-semibold">ยังไม่มีโพสต์ในขณะนี้</p>
      <p className="text-sm text-gray-400 mt-2">ลองสร้างโพสต์ใหม่ดูไหมคะ?</p>
    </div>
  );
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<PostTitle[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [serchQuery , setSearchQeury] = useState<string>('')
  const [listTagsSearch , setListTagsSerch] = useState<string[]>([])

  const [tagSearch , setTagSearch] = useState<string>('')

  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      // จำลอง delay เพื่อให้เห็น Loading (ลบออกได้ตอนใช้จริงนะคะ)
      // await new Promise(resolve => setTimeout(resolve, 1500)); 

      const res = await fetch('/api/posts/get_all_posts', {
        method: 'GET',
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);
      setPosts(data.data);
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };


  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <div className="container px-4 py-8 max-w-7xl mx-auto min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Dashboard</h1>
          <p className="text-gray-500 mt-1">จัดการและดูรายการโพสต์ทั้งหมดของคุณ</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-gray-700">ค้นหาจากชื่อโพสต์</Label>
              <div className="flex gap-2">
                <Input 
                  placeholder="พิมพ์ชื่อโพสต์ที่ต้องการ..." 
                  value={serchQuery} 
                  onChange={(e) => setSearchQeury(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  variant="outline" 
                  onClick={() => setSearchQeury('')}
                  className="shrink-0 text-gray-500 hover:text-red-500 hover:bg-red-50"
                >
                  ล้างคำค้นหา
                </Button>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <Label className="text-sm font-medium text-gray-700">กรองด้วย Tags</Label>
              
              {listTagsSearch.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-1">
                  {listTagsSearch.map((l, i) => (
                    <span key={i} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-sm font-medium bg-indigo-100 text-indigo-800">
                      {l}
                      <button
                        type="button"
                        onClick={() => setListTagsSerch(prev => prev.filter(p => p !== l))}
                        className="ml-1.5 inline-flex items-center justify-center w-4 h-4 rounded-full text-indigo-400 hover:bg-indigo-200 hover:text-indigo-500 focus:outline-none transition-colors"
                      >
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" /></svg>
                      </button>
                    </span>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input 
                  placeholder="พิมพ์ชื่อ Tag (เช่น React, NextJS)" 
                  value={tagSearch} 
                  onChange={(e) => setTagSearch(e.target.value)}
                  onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                          if (!listTagsSearch.includes(tagSearch) && tagSearch !== '') {
                              setListTagsSerch(prev => [...prev, tagSearch]);
                              setTagSearch('');
                          }
                      }
                  }}
                  className="flex-1"
                />
                <Button 
                  onClick={() => {
                    if (!listTagsSearch.includes(tagSearch) && tagSearch !== '') {
                      setListTagsSerch(prev => [...prev, tagSearch]);
                      setTagSearch('');
                    }
                  }}
                  className="bg-gray-900 hover:bg-gray-800 text-white shrink-0"
                  disabled={!tagSearch}
                >
                  เพิ่ม Tag
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        
        {isLoading ? (
          <Loader />
        ) : posts.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">ชื่อโพสต์ (Title)</th>
                  <th className="px-6 py-4 font-semibold">หมวดหมู่ (Tags)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {posts.map((p) => (
                  p.title.includes(serchQuery) && 
                  listTagsSearch.every(tag => p.tags.includes(tag) ) &&
                  (<tr 
                    key={p.id}
                    className="hover:bg-indigo-50/30 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <Link href={`/dashboard/${p.id}`} className="block">
                        <span className="text-gray-900 font-medium hover:text-indigo-600 transition-colors text-base">
                          {p.title}
                        </span>
                    
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-2">
                        {p.tags.length > 0 ? (
                          p.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="bg-indigo-100 text-indigo-700 text-xs font-medium px-2.5 py-1 rounded-full border border-indigo-200"
                            >
                              {tag}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-sm italic">- ไม่มีหมวดหมู่ -</span>
                        )}
                      </div>
                    </td>

                  </tr>)
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
      
      {!isLoading && posts.length > 0 && (
        <div className="mt-4 text-right text-sm text-gray-500">
          ทั้งหมด {posts.length} รายการ
        </div>
      )}

    </div>
  );
}