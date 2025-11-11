'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Link from 'next/link';
import { PostTitle } from '@/util/type/type';

function PostCardSkeleton() {
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-5 animate-pulse">
      <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
      <div className="flex flex-wrap gap-2">
        <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        <div className="h-5 bg-gray-200 rounded-full w-20"></div>
        <div className="h-5 bg-gray-200 rounded-full w-14"></div>
      </div>
    </div>
  );
}

function PostCard({ post }: { post: PostTitle }) {
  return (
    <Link href={`/dashboard/${post.id}`}>
      <div
        className="bg-white border border-gray-200 rounded-xl shadow-lg 
                   overflow-hidden transition-all duration-300 
                   hover:shadow-xl hover:-translate-y-1"
      >
        <div className="p-5">
          <h3
            className="text-lg font-semibold text-gray-900 mb-3 truncate"
            title={post.title}
          >
            {post.title}
          </h3>
          <div className="flex flex-wrap gap-2">
            {post.tags.map((tag, index) => (
              <span
                key={index}
                className="bg-indigo-100 text-indigo-800 text-xs font-medium px-3 py-1 rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="text-sm pt-1 text-gray-400 text-end">
            {new Date(post.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const [posts, setPosts] = useState<PostTitle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [hasNextPage, setHasNextPage] = useState(true);
  const PAGE_SIZE = 9;

  const handlePrevousAndNext = (isNext: boolean) => {
    if (!isNext) {
      if (page === 1) {
        toast.info('นี่คือหน้าแรกแล้ว');
        return;
      }
      const firstPost = posts[0];
      get9Post(firstPost.created_at, firstPost.id, false);
      setPage((prev) => prev - 1);
    } else {
      const lastPost = posts[posts.length - 1];
      get9Post(lastPost.created_at, lastPost.id, true);
      setPage((prev) => prev + 1);
    }
  };

  const get9Post = async (
    cursorTime: string | null,
    idCursor: string | null,
    isNext: boolean
  ) => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('isNext', String(isNext));

      if (cursorTime && idCursor) {
        params.append('time', cursorTime);
        params.append('id', idCursor);
      }

      const res = await fetch(
        `/api/posts/getPagePosts?${params.toString()}`
      );

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Server error');
      }

      const fetchedPosts: PostTitle[] = (await res.json()).data;

      if (fetchedPosts.length === 0) {
        if (isNext) {
          setHasNextPage(false);
          toast.info('นี่คือหน้าสุดท้ายแล้ว');
        } else {
          toast.error('ไม่พบหน้าที่แล้ว');
        }
        return;
      }

      setPosts(fetchedPosts);

      // --- Logic Enhancement ---
      if (isNext) {
        // ถ้าไปหน้า "Next" ให้เช็คตามปกติ
        setHasNextPage(fetchedPosts.length === PAGE_SIZE);
      } else {
        // ถ้าไปหน้า "Previous" สำเร็จ แสดงว่าต้องมีหน้า "Next" (คือหน้าที่เราเพิ่งจากมา)
        setHasNextPage(true);
      }
      // --- End Enhancement ---

    } catch (err) {
      console.error((err as Error).message);
      toast.error('เกิดข้อผิดพลาดในการดึงรายการ');
      if (isNext) {
        setPage((prev) => prev - 1);
      } else {
        setPage((prev) => prev + 1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = async () => {
    console.log('Searching for:', searchQuery);
    // เพิ่มเติม: ควรจะเรียก get9Post หรือ API ค้นหาใหม่ที่นี่
    // และรีเซ็ต page เป็น 1
  };

  useEffect(() => {
    get9Post(null, null, true);
  }, []);

  return (
    <div className="container px-5 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">
          Dashboard
        </h1>
        <div className="">
          <input
            type="text"
            placeholder="ค้นหา (Title หรือ Tag)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border border-gray-300 rounded-lg py-2 px-4 w-full md:w-80
                       focus:outline-none focus:ring-2 focus:ring-blue-500 me-3"
          />
          <button
            onClick={handleSearch}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 mt-2 md:mt-0"
          >
            ค้นหา
          </button>
        </div>
      </div>

      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PostCardSkeleton />
          <PostCardSkeleton />
          <PostCardSkeleton />
        </div>
      )}

      {!isLoading && posts.length > 0 && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>

          <div className="flex justify-between mt-5">
            <button
              onClick={() => handlePrevousAndNext(false)}
              disabled={page === 1 || isLoading}
              className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handlePrevousAndNext(true)}
              disabled={!hasNextPage || isLoading}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg 
                         hover:bg-blue-600
                         disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </>
      )}

      {!isLoading && posts.length === 0 && (
        <div
          className="text-center text-gray-500 mt-10 p-10 
                     border-2 border-dashed border-gray-300 rounded-lg"
        >
          <p className="text-lg font-semibold">
            {searchQuery
              ? `ไม่พบผลลัพธ์สำหรับ "${searchQuery}"`
              : 'ยังไม่มีโพสต์'}
          </p>
          <p className="text-sm">
            {searchQuery
              ? 'ลองค้นหาด้วยคำอื่น'
              : 'เมื่อมีโพสต์ใหม่จะแสดงที่นี่'}
          </p>
        </div>
      )}
    </div>
  );
}