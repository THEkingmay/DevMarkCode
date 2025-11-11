CREATE OR REPLACE FUNCTION fn_create_post(
    p_uid text, -- (UID ผู้ใช้, ประเภท text)
    p_title text,
    p_description text,
    p_tags jsonb, -- (Array ของ tags)
    p_links text[], -- (Array ของ links)
    p_codes jsonb -- (Array ของ code snippets)
)
RETURNS json -- (คืนค่าเป็น JSON)
LANGUAGE plpgsql
AS $$
DECLARE
    new_post_id bigint;
    tag_record jsonb;
    tag_id_to_use bigint;
    new_tag_id bigint;
    link_url text;
    code_record jsonb;
BEGIN
    -- 1. บันทึกโพสต์หลัก และดึง ID ที่สร้างใหม่
    INSERT INTO posts (title, description, uid)
    VALUES (p_title, p_description, p_uid)
    RETURNING id INTO new_post_id;

    -- 2. วนลูปเพื่อจัดการแท็ก
    FOR tag_record IN SELECT * FROM jsonb_array_elements(p_tags)
    LOOP
        IF tag_record->>'id' != '' THEN
            -- 2.1 แท็กมี ID อยู่แล้ว (เป็นแท็กเก่าที่เลือก)
            tag_id_to_use := (tag_record->>'id')::bigint;
        ELSE
            -- 2.2 แท็กใหม่ (ไม่มี id, ที่ผู้ใช้พิมพ์เพิ่ม)
            -- ตรวจสอบก่อนว่าแท็กนี้ (description) ของ user นี้ มีอยู่แล้วหรือไม่
            SELECT id INTO new_tag_id FROM tags
            WHERE description = tag_record->>'description' AND uid = p_uid;
            
            IF NOT FOUND THEN
                -- ถ้าไม่พบ ให้สร้างแท็กใหม่ในตาราง tags
                INSERT INTO tags (description, uid)
                VALUES (tag_record->>'description', p_uid)
                RETURNING id INTO new_tag_id;
            END IF;
            
            tag_id_to_use := new_tag_id;
        END IF;

        -- บันทึกลงตารางเชื่อม (post_tags)
        -- (ON CONFLICT... ป้องกัน error หากมีการส่ง tag_id ซ้ำซ้อนมา)
        INSERT INTO post_tags (post_id, tag_id)
        VALUES (new_post_id, tag_id_to_use)
        ON CONFLICT (post_id, tag_id) DO NOTHING;
        
    END LOOP;

    -- 3. วนลูปเพื่อบันทึก Links
    FOREACH link_url IN ARRAY p_links
    LOOP
        INSERT INTO links_in_post (post_id, link)
        VALUES (new_post_id, link_url);
    END LOOP;

    -- 4. วนลูปเพื่อบันทึก Code Snippets
    FOR code_record IN SELECT * FROM jsonb_array_elements(p_codes)
    LOOP
        INSERT INTO codes_in_post (post_id, code, language, description)
        VALUES (
            new_post_id,
            code_record->>'code',
            code_record->>'language',
            code_record->>'description'
        );
    END LOOP;

    -- คืนค่า JSON เพื่อยืนยันความสำเร็จ
    RETURN json_build_object('status', 'success', 'post_id', new_post_id);

END;
$$;