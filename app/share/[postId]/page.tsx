'use server'
import { supabase } from "@/lib/supabase";

interface CodeSnippet {
  id: number;
  post_id: number;
  code: string;
  language: string;
  description: string;
}

interface PostData {
  id: number;
  title: string;
  description: string;
  created_at: string;
  uid: string;
  is_shared: boolean;
  code: CodeSnippet[];
}

export const getSharePostbyId = async (postId: string): Promise<PostData> => {
    if (!postId) {
        throw new Error("Post ID is required");
    }
    
    const { data, error } = await supabase
        .from('posts')
        .select('*')
        .eq('id', postId)
        .single();

    if (error) {
        throw new Error("Error fetching post");
    }

    if (!data.is_shared) {
        throw new Error("Post is not shared");
    }
    
    const { data: codes, error: postError } = await supabase
        .from('codes_in_post')
        .select('*')
        .eq('post_id', postId);

    if (postError) {
        throw new Error("Error fetching post data");
    }
    
    const sortedCodes = codes.sort((a, b) => a.id - b.id);

    const combinedData = {
        ...data,
        code: sortedCodes
    };
    
    return combinedData as PostData;
}

export default async function SharePage({ params } : { params: Promise<{ postId: string }> }) {
    const { postId } = await params;
    
    if (!postId) {
        return (
            <div className="flex items-center justify-center min-h-screen text-gray-500">
                No post ID provided.
            </div>
        );
    }

    let postData: PostData;
    try {
        postData = await getSharePostbyId(postId);
    } catch (error) {
        return (
            <div className="flex items-center justify-center min-h-screen text-red-500">
                {(error as Error).message || "Something went wrong."}
            </div>
        );
    }

    const formattedDate = new Date(postData.created_at).toLocaleDateString('th-TH', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    return (
        <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-800 selection:bg-indigo-100 selection:text-indigo-900">
            <article className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
            <div className="overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                <header className="border-b border-slate-200 px-6 py-8 sm:px-8">
                <div className="mb-4 inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium uppercase tracking-wide text-slate-600">
                    Shared Post
                </div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                    {postData.title}
                </h1>
                <time className="mt-3 block text-sm text-slate-500">
                    บันทึกเมื่อ: {formattedDate}
                </time>
                </header>

                {postData.description && (
                <section className="border-b border-slate-200 px-6 py-7 sm:px-8">
                    <p className="whitespace-pre-wrap text-base leading-8 text-slate-700 sm:text-lg">
                    {postData.description}
                    </p>
                </section>
                )}

                <section className="space-y-6 px-6 py-8 sm:px-8">
                {postData.code.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-sm text-slate-500">
                    No code snippets found.
                    </div>
                ) : (
                    postData.code.map((item, index) => (
                    <div
                        key={item.id}
                        className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950 shadow-sm"
                    >
                        <div className="flex items-center justify-between border-b border-white/10 bg-slate-900 px-4 py-2.5">
                        <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-slate-400">
                            Snippet {index + 1}
                            </span>
                            <span className="rounded-md border border-white/15 bg-white/5 px-2 py-0.5 text-[11px] font-mono uppercase tracking-wide text-slate-200">
                            {item.language || "text"}
                            </span>
                        </div>
                        </div>

                        {item.description && (
                        <div className="border-b border-white/10 bg-slate-900/60 px-4 py-2.5 text-sm text-slate-300">
                            {item.description}
                        </div>
                        )}

                        <pre className="max-h-[36rem] overflow-auto p-4 text-[13px] leading-6 text-slate-100 sm:text-sm">
                        <code>{item.code}</code>
                        </pre>
                    </div>
                    ))
                )}
                </section>
            </div>
            </article>
        </main>
    );  
}