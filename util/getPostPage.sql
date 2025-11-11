 REPLACE FUNCTION get_paginated_posts_with_tags(
    p_uid TEXT,
    p_cursor_time TIMESTAMPTZ,
    p_cursor_id BIGINT,
    p_is_next BOOLEAN,
    p_page_limit INT
)
RETURNS TABLE(
    id BIGINT,
    title TEXT,
    tags TEXT[],
    created_at TIMESTAMPTZ
)
LANGUAGE plpgsql
AS $$
BEGIN
    
    IF p_cursor_time IS NULL THEN
        RETURN QUERY
        WITH user_posts_with_tags AS (
            SELECT
                p.id, p.title, p.created_at,
                COALESCE(array_agg(t.description ORDER BY t.description), '{}'::text[]) AS tags
            FROM posts p
            LEFT JOIN post_tags pt ON p.id = pt.post_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            WHERE p.uid = p_uid
            GROUP BY p.id, p.title, p.created_at
        )
        SELECT upt.id, upt.title, upt.tags, upt.created_at
        FROM user_posts_with_tags upt
        ORDER BY upt.created_at DESC, upt.id DESC
        LIMIT p_page_limit;

    ELSIF p_is_next THEN
        RETURN QUERY
        WITH user_posts_with_tags AS (
            SELECT
                p.id, p.title, p.created_at,
                COALESCE(array_agg(t.description ORDER BY t.description), '{}'::text[]) AS tags
            FROM posts p
            LEFT JOIN post_tags pt ON p.id = pt.post_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            WHERE p.uid = p_uid
            GROUP BY p.id, p.title, p.created_at
        )
        SELECT upt.id, upt.title, upt.tags, upt.created_at
        FROM user_posts_with_tags upt
        WHERE (upt.created_at, upt.id) < (p_cursor_time, p_cursor_id)
        ORDER BY upt.created_at DESC, upt.id DESC
        LIMIT p_page_limit;

    ELSE
        RETURN QUERY
        WITH user_posts_with_tags AS (
            SELECT
                p.id, p.title, p.created_at,
                COALESCE(array_agg(t.description ORDER BY t.description), '{}'::text[]) AS tags
            FROM posts p
            LEFT JOIN post_tags pt ON p.id = pt.post_id
            LEFT JOIN tags t ON pt.tag_id = t.id
            WHERE p.uid = p_uid
            GROUP BY p.id, p.title, p.created_at
        )
        SELECT upt.id, upt.title, upt.tags, upt.created_at
        FROM user_posts_with_tags upt
        WHERE (upt.created_at, upt.id) > (p_cursor_time, p_cursor_id)
        ORDER BY upt.created_at ASC, upt.id ASC
        LIMIT p_page_limit;
    END IF;
END;
$$;
