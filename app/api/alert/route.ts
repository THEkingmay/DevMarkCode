import { supabase } from "@/lib/supabase";


export async function GET() {
    const { data, error } = await supabase.from("users").select("*");
    if (error) {
        console.error("Supabase select error:", (error as Error).message);
        return new Response(JSON.stringify({ error: "Failed to fetch users" }), { status: 500 });
    }
    return new Response(JSON.stringify(data), { status: 200 });
}