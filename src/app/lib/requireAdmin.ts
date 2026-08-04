import { createSupabaseServerClient } from "@/app/lib/SupabaseServer";

const ADMIN_ROLES = ["admin", "president", "treasurer"];

export async function requireAdmin() {
    const supabase = await createSupabaseServerClient();
    
    const {data: { user }, error: userError} = await supabase.auth.getUser();

    if (userError || !user) {
        return {
            authorized: false as const,
            status: 401,
            message: "Unauthorized: User not authenticated",
            supabase,
        };
    }


    const { data: member, error: memberError } = await supabase
        .from("Members")
        .select("id, role")
        .eq("user_id", user.id)
        .single();

    if (memberError || !member || !ADMIN_ROLES.includes(member.role)) {
        return {
            authorized: false as const,
            status: 403,
            message: "Forbidden: You do not have the required permissions to edit pending results",
            supabase,
        };
    }

    return {
        authorized: true as const,
        user,
        member,
        supabase,
    };
}