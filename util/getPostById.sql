CREATE OR REPLACE FUNCTION get_post_for_owner(p_post_id INT, p_uid TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    post_data JSONB;
    v_post_uid TEXT;
BEGIN
    -- 1. ตรวจสอบความเป็นเจ้าของ
    -- [FIX] ตรวจสอบโดยใช้ 'id' ของตาราง posts
    SELECT uid INTO v_post_uid FROM public.posts WHERE id = p_post_id;

    -- 2. ถ้าไม่พบ หรือ ไม่ใช่เจ้าของ
    IF NOT FOUND OR v_post_uid != p_uid THEN
        RETURN NULL;
    END IF;

    -- 3. ถ้าเป็นเจ้าของจริง ให้สร้าง JSON
    SELECT
        jsonb_build_object(
            -- [FIX] แมพ p.id (จากตาราง) ไปยัง 'post_id' (ใน JSON ที่ส่งกลับ)
            'post_id', p.id, 
            'uid', p.uid,
            'title', p.title,
            'description', p.description,
            'created_at', p.created_at,
            'tags', COALESCE(t.tags_agg, '[]'::jsonb),
            'links', COALESCE(l.links_agg, '[]'::jsonb),
            'codes', COALESCE(c.codes_agg, '[]'::jsonb)
        )
    INTO post_data
    FROM
        public.posts p
    
    -- LEFT JOIN เพื่อดึง Tags
    LEFT JOIN (
        SELECT
            pt.post_id,
            jsonb_agg(
                jsonb_build_object(
                    'id', t.id,
                    'description', t.description,
                    'created_at', t.created_at
                )
                ORDER BY t.id ASC
            ) AS tags_agg
        FROM
            public.post_tags pt
        -- [CHECK] JOIN ตาราง post_tags (FK: tag_id) 
        --         กับ ตาราง tags (PK: id)
        JOIN
            public.tags t ON pt.tag_id = t.id 
        WHERE
            pt.post_id = p_post_id
        GROUP BY
            pt.post_id
    -- [FIX] JOIN ผลลัพธ์ (t) กลับไปยังตาราง posts (p) โดยใช้ p.id
    ) AS t ON p.id = t.post_id

    -- LEFT JOIN เพื่อดึง Links
    LEFT JOIN (
        SELECT
            l.post_id,
            jsonb_agg(
                jsonb_build_object(
                    'id', l.id,
                    'link', l.link
                )
                ORDER BY l.id ASC
            ) AS links_agg
        FROM
            public.links_in_post l
        WHERE
            l.post_id = p_post_id
        GROUP BY
            l.post_id
    -- [FIX] JOIN ผลลัพธ์ (l) กลับไปยังตาราง posts (p) โดยใช้ p.id
    ) AS l ON p.id = l.post_id

    -- LEFT JOIN เพื่อดึง Codes
    LEFT JOIN (
        SELECT
            c.post_id,
            jsonb_agg(
                jsonb_build_object(
                    'id', c.id, 
                    'code', c.code,
                    'language', c.language,
                    'description', c.description
                )
                ORDER BY c.id ASC
            ) AS codes_agg
        FROM
            public.codes_in_post c
        WHERE
            c.post_id = p_post_id
        GROUP BY
            c.post_id
    -- [FIX] JOIN ผลลัพธ์ (c) กลับไปยังตาราง posts (p) โดยใช้ p.id
    ) AS c ON p.id = c.post_id

    -- [FIX] WHERE clause หลัก ต้องค้นหาด้วย p.id
    WHERE
        p.id = p_post_id;

    -- 4. คืนค่า
    RETURN post_data;

END;
$$;