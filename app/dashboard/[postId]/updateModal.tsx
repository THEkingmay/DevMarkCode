import { Code, PostStructure, Tag } from "@/util/type/type";
import { ArrowPathIcon, TrashIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";


// --- Interface สำหรับ Props ---
interface UpdateFormContentProps {
    field: string;
    targetId: string | number | null;
    post: PostStructure;
    onComplete: (message: string) => void;
    onCancel: () => void;
}

// --- Component จัดการฟอร์ม ---
export default function UpdateFormContent({
    field,
    targetId,
    post,
    onComplete,
    onCancel,
}: UpdateFormContentProps) {
    const [isLoading, setIsLoading] = useState(false);

    // --- Helper Function สำหรับยิง API ---
    // (นี่เป็นตัวอย่างการยิง API แบบรวมๆ คุณสามารถปรับแก้ได้)
    const callApi = async (
        url: string,
        method: string,
        body: any,
        successMessage: string,
    ) => {
        setIsLoading(true);
        try {
            const res = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) {
                throw new Error(data.message || 'เกิดข้อผิดพลาด');
            }
            onComplete(successMessage); // เรียก callback เมื่อสำเร็จ
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- 1. Form แก้ไข Title ---
    if (field === 'title') {
        const [title, setTitle] = useState(post.title);
        const handleSubmit = () => {
            if (!title) return toast.error('Title ห้ามว่าง');
            callApi(
                `/api/posts/update/title?postId=${post.post_id}`,
                'PUT', // หรือ 'PUT' / 'PATCH'
                { title: title },
                'อัปเดต Title สำเร็จ',
            );
        };

        return (
            <div className="space-y-4">
                <label htmlFor="title" className="block font-medium">
                    New Title:
                </label>
                <input
                    id="title"
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2 border rounded"
                    disabled={isLoading}
                />
                <FormButtons
                    onCancel={onCancel}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    submitText="Update Title"
                />
            </div>
        );
    }

    // --- 2. Form แก้ไข Description ---
    if (field === 'description') {
        const [description, setDescription] = useState(post.description);
        const handleSubmit = () => {
            if (!description) return toast.error('Description ห้ามว่าง');
            callApi(
                `/api/posts/update/description?postId=${post.post_id}`,
                'PUT',
                { description: description },
                'อัปเดต Description สำเร็จ',
            );
        };

        return (
            <div className="space-y-4">
                <label htmlFor="description" className="block font-medium">
                    New Description:
                </label>
                <textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2 border rounded min-h-[200px]"
                    disabled={isLoading}
                />
                <FormButtons
                    onCancel={onCancel}
                    onSubmit={handleSubmit}
                    isLoading={isLoading}
                    submitText="Update Description"
                />
            </div>
        );
    }

    // --- 3. Form จัดการ Links ---
    if (field === 'links') {
        const [link, setLink] = useState(
            () => post.links.find((l) => l.id === targetId)?.link || '',
        );

        // ถ้ามี targetId (แก้ไข หรือ ลบ)
        if (targetId) {
            const handleUpdate = () => {
                if (!link) return toast.error('Link ห้ามว่าง');
                callApi(
                    `/api/posts/update/links?postId=${post.post_id}&id=${targetId}`,
                    'PUT',
                    { link: link },
                    'อัปเดต Link สำเร็จ',
                );
            };

            const handleDelete = () => {
                if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ Link นี้?')) return;
                callApi(
                    `/api/posts/delete/links?postId=${post.post_id}&id=${targetId}`,
                    'DELETE', // หรือ 'DELETE'
                    {},
                    'ลบ Link สำเร็จ',
                );
            };

            return (
                <div className="space-y-4">
                    <label htmlFor="link" className="block font-medium">
                        Edit Link:
                    </label>
                    <input
                        id="link"
                        type="text"
                        value={link}
                        onChange={(e) => setLink(e.target.value)}
                        className="w-full p-2 border rounded"
                        disabled={isLoading}
                    />
                    <FormButtons
                        onCancel={onCancel}
                        onSubmit={handleUpdate} // ปุ่มหลักคือ "Update"
                        isLoading={isLoading}
                        submitText="Update Link"
                        onDelete={handleDelete} // เพิ่มปุ่ม "Delete"
                        deleteText="Delete Link"
                    />
                </div>
            );
        }

        // ถ้าไม่มี targetId (เพิ่มใหม่)
        const handleAdd = () => {
            if (!link) return toast.error('Link ห้ามว่าง');
            callApi(
                `/api/posts/add/links?postId=${post.post_id}`,
                'POST',
                { link: link },
                'เพิ่ม Link สำเร็จ',
            );
        };

        return (
            <div className="space-y-4">
                <label htmlFor="link" className="block font-medium">
                    Add New Link:
                </label>
                <input
                    id="link"
                    type="text"
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    className="w-full p-2 border rounded"
                    placeholder="https://example.com"
                    disabled={isLoading}
                />
                <FormButtons
                    onCancel={onCancel}
                    onSubmit={handleAdd}
                    isLoading={isLoading}
                    submitText="Add Link"
                />
            </div>
        );
    }

    // --- 4. Form จัดการ Codes ---
    if (field === 'codes') {
        const [codeData, setCodeData] = useState<Code>(
            () =>
                post.codes.find((c) => c.id === targetId) || {
                    id: '',
                    description: '',
                    code: '',
                    language: '',
                },
        );

        const handleChange = (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
        ) => {
            setCodeData({ ...codeData, [e.target.name]: e.target.value });
        };

        // ถ้ามี targetId (แก้ไข หรือ ลบ)
        if (targetId) {
            const handleUpdate = () => {
                if (!codeData.description || !codeData.code)
                    return toast.error('กรุณากรอกข้อมูลให้ครบ');
                callApi(
                    `/api/posts/update/codes?postId=${post.post_id}&id=${targetId}`,
                    'PUT',
                    codeData,
                    'อัปเดต Code สำเร็จ',
                );
            };

            const handleDelete = () => {
                if (!window.confirm('คุณแน่ใจหรือไม่ว่าต้องการลบ Code Block นี้?'))
                    return;
                callApi(
                    `/api/posts/delete/codes?postId=${post.post_id}&id=${targetId}`,
                    'DELETE',
                    {},
                    'ลบ Code สำเร็จ',
                );
            };

            return (
                <div className="space-y-4">
                    <CodeFormFields codeData={codeData} onChange={handleChange} />
                    <FormButtons
                        onCancel={onCancel}
                        onSubmit={handleUpdate}
                        isLoading={isLoading}
                        submitText="Update Code"
                        onDelete={handleDelete}
                        deleteText="Delete Code"
                    />
                </div>
            );
        }

        // ถ้าไม่มี targetId (เพิ่มใหม่)
        const handleAdd = () => {
            if (!codeData.description || !codeData.code)
                return toast.error('กรุณากรอกข้อมูลให้ครบ');
            callApi(
                `/api/posts/add/codes?postId=${post.post_id}`,
                'POST',
                codeData,
                'เพิ่ม Code สำเร็จ',
            );
        };

        return (
            <div className="space-y-4">
                <CodeFormFields codeData={codeData} onChange={handleChange} />
                <FormButtons
                    onCancel={onCancel}
                    onSubmit={handleAdd}
                    isLoading={isLoading}
                    submitText="Add Code"
                />
            </div>
        );
    }

    // --- 5. Form จัดการ Tags (ตามแผนของคุณ) ---
    if (field === 'tags') {
        // นี่คือ Component ที่ซับซ้อนที่สุด
        return (
            <TagManager
                post={post}
                onComplete={onComplete}
                onCancel={onCancel}
            />
        );
    }

    // Fallback
    return <div>ไม่พบ Form ที่ตรงกัน</div>;
}

// --- Component ย่อยสำหรับปุ่ม (เพื่อลดโค้ดซ้ำ) ---
interface FormButtonsProps {
    onCancel: () => void;
    onSubmit: () => void;
    isLoading: boolean;
    submitText?: string;
    onDelete?: () => void;
    deleteText?: string;
}

function FormButtons({
    onCancel,
    onSubmit,
    isLoading,
    submitText = 'Submit',
    onDelete,
    deleteText = 'Delete',
}: FormButtonsProps) {
    return (
        <div className="flex justify-between items-center mt-6">
            <div>
                {onDelete && ( // แสดงปุ่มลบ ถ้ามีฟังก์ชันส่งมา
                    <button
                        type="button"
                        onClick={onDelete}
                        disabled={isLoading}
                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-red-300 flex items-center gap-2"
                    >
                        {isLoading ? (
                            <ArrowPathIcon className="w-5 h-5 animate-spin" />
                        ) : (
                            <TrashIcon className="w-5 h-5" />
                        )}
                        {deleteText}
                    </button>
                )}
            </div>
            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 disabled:bg-gray-100"
                >
                    ยกเลิก
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isLoading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2"
                >
                    {isLoading && (
                        <ArrowPathIcon className="w-5 h-5 animate-spin" />
                    )}
                    {isLoading ? 'Processing...' : submitText}
                </button>
            </div>
        </div>
    );
}

// --- Component ย่อยสำหรับ Code Form (เพื่อลดโค้ดซ้ำ) ---
function CodeFormFields({
    codeData,
    onChange,
}: {
    codeData: Code;
    onChange: (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
    ) => void;
}) {
    return (
        <>
            <div>
                <label htmlFor="description" className="block font-medium">
                    Description:
                </label>
                <input
                    id="description"
                    name="description"
                    type="text"
                    value={codeData.description}
                    onChange={onChange}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label htmlFor="language" className="block font-medium">
                    Language:
                </label>
                {/* คุณสามารถเปลี่ยนเป็น Select ที่มีภาษาให้เลือกได้ */}
                <input
                    id="language"
                    name="language"
                    type="text"
                    value={codeData.language}
                    onChange={onChange}
                    className="w-full p-2 border rounded"
                />
            </div>
            <div>
                <label htmlFor="code" className="block font-medium">
                    Code:
                </label>
                <textarea
                    id="code"
                    name="code"
                    value={codeData.code}
                    onChange={onChange}
                    className="w-full p-2 border rounded min-h-[300px] font-mono"
                />
            </div>
        </>
    );
}

// --- 3. Component `TagManager` (สำหรับ field 'tags') ---
// นี่คือการ Implement ตามแผนของคุณครับ
function TagManager({
    post,
    onComplete,
}: {
    post: PostStructure;
    onComplete: (message: string) => void;
    onCancel: () => void;
}) {
    const [allUserTags, setAllUserTags] = useState<Tag[]>([]);
    const [currentPostTags, setCurrentPostTags] = useState<Tag[]>(post.tags);
    const [searchTerm, setSearchTerm] = useState('');
    const [newTag, setNewTag] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isFetching, setIsFetching] = useState(true);

    // 1. โหลดแท็กทั้งหมดของผู้ใช้ (ตามแผน)
    useEffect(() => {
        const fetchTags = async () => {
            setIsFetching(true);
            try {
                // (สมมติว่า API นี้คืนค่าแท็กทั้งหมดของ uid ที่ login อยู่)
                const res = await fetch('/api/posts/tags/getAllTags');
                if (!res.ok) throw new Error('ไม่สามารถโหลด Tag ทั้งหมดได้');
                const data = await res.json();
                setAllUserTags(data.data);
            } catch (err) {
                toast.error((err as Error).message);
            } finally {
                setIsFetching(false);
            }
        };
        fetchTags();
    }, []);

    // 2. Logic การเพิ่ม Tag ที่มีอยู่แล้ว ไปยัง Post
    const handleAddTagToPost = async (tag: Tag) => {
        setIsLoading(true);
        try {
            // (API นี้ควรจะเชื่อมโยง post_id กับ tag_id)
            const res = await fetch(
                `/api/posts/add/tags?postId=${post.post_id}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ tagId: tag.id }), // ส่ง ID ของแท็ก
                },
            );
            if (!res.ok) throw new Error('เพิ่ม Tag ไม่สำเร็จ');
            // อัปเดต UI ทันที
            setCurrentPostTags([...currentPostTags, tag]);
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // 3. Logic การสร้าง Tag ใหม่ และเพิ่มไปยัง Post (ตามแผน)
    const handleCreateAndAddTag = async () => {
        if (!newTag) return;
        setIsLoading(true);
        try {
            // (API นี้ควรจะสร้าง Tag ใหม่ก่อน (ถ้าไม่มี) แล้วค่อยเชื่อมโยง)
            const res = await fetch(
                `/api/posts/add/tags?postId=${post.post_id}`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ description: newTag }), // ส่ง description
                },
            );
            if (!res.ok) throw new Error('สร้าง Tag ใหม่ไม่สำเร็จ');
            const data = await res.json(); // สมมติว่า API คืน Tag ที่สร้างใหม่
            // อัปเดต UI
            setCurrentPostTags([...currentPostTags, data.newTag]);
            setAllUserTags([...allUserTags, data.newTag]); // เพิ่มใน list รวมด้วย
            setNewTag('');
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // 4. Logic การลบ Tag ออกจาก Post (ตามแผน)
    const handleRemoveTagFromPost = async (tag: Tag) => {
        setIsLoading(true);
        try {
            // (API นี้ควรจะลบความเชื่อมโยงระหว่าง post_id กับ tag_id)
            const res = await fetch(
                `/api/posts/delete/tags?postId=${post.post_id}&id=${tag.id}`,
                { method: 'DELETE' },
            );
            if (!res.ok) throw new Error('ลบ Tag ไม่สำเร็จ');
            // อัปเดต UI
            setCurrentPostTags(
                currentPostTags.filter((t) => t.id !== tag.id),
            );
        } catch (err) {
            toast.error((err as Error).message);
        } finally {
            setIsLoading(false);
        }
    };

    // 5. กรอง Tag ที่จะแสดง
    const availableTags = allUserTags
        .filter(
            (tag) =>
                !currentPostTags.some(
                    (postTag) => postTag.id === tag.id,
                ), // กรอง Tag ที่มีใน Post นี้แล้ว
        )
        .filter((tag) =>
            tag.description.toLowerCase().includes(searchTerm.toLowerCase()),
        ); // กรองด้วยการค้นหา

    return (
        <div className="space-y-4" style={{ minHeight: '400px' }}>
            {/* ส่วน Tag ที่มีใน Post นี้ */}
            <div>
                <h4 className="font-semibold mb-2">Current Tags:</h4>
                <div className="flex flex-wrap gap-2 p-2 bg-white rounded border min-h-[40px]">
                    {currentPostTags.length === 0 && (
                        <span className="text-gray-400">No tags yet.</span>
                    )}
                    {currentPostTags.map((tag) => (
                        <span
                            key={tag.id}
                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2"
                        >
                            {tag.description}
                            <button
                                onClick={() => handleRemoveTagFromPost(tag)}
                                disabled={isLoading}
                                className="text-blue-500 hover:text-blue-800"
                            >
                                <XMarkIcon className="w-4 h-4" />
                            </button>
                        </span>
                    ))}
                </div>
            </div>

            {/* ส่วนเพิ่ม Tag ใหม่ */}
            <div>
                <h4 className="font-semibold mb-2">Create New Tag:</h4>
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        placeholder="e.g. 'React'"
                        className="flex-grow p-2 border rounded"
                        disabled={isLoading}
                    />
                    <button
                        onClick={handleCreateAndAddTag}
                        disabled={isLoading || !newTag}
                        className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-green-300"
                    >
                        Create & Add
                    </button>
                </div>
            </div>

            {/* ส่วนค้นหาและเพิ่ม Tag ที่มีอยู่ */}
            <div>
                <h4 className="font-semibold mb-2">Add Existing Tag:</h4>
                <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search tags..."
                    className="w-full p-2 border rounded"
                    disabled={isFetching}
                />
                <div className="flex flex-wrap gap-2 p-2 border rounded mt-2 min-h-[100px] max-h-[200px] overflow-y-auto">
                    {isFetching && <p>Loading tags...</p>}
                    {!isFetching && availableTags.length === 0 && (
                        <span className="text-gray-400">
                            No available tags found.
                        </span>
                    )}
                    {availableTags.map((tag) => (
                        <button
                            key={tag.id}
                            onClick={() => handleAddTagToPost(tag)}
                            disabled={isLoading}
                            className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm font-medium hover:bg-gray-300"
                        >
                            + {tag.description}
                        </button>
                    ))}
                </div>
            </div>

            {/* ปุ่มปิด Modal */}
            <div className="flex justify-end mt-6">
                <button
                    type="button"
                    onClick={() => onComplete('อัปเดต Tag สำเร็จ')} // เราจะใช้ onComplete เพื่อปิดและ reload
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                    Done
                </button>
            </div>
        </div>
    );
}