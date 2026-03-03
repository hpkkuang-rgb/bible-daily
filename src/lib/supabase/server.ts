import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

const isDev = process.env.NODE_ENV === "development";

/**
 * 统一封装：用于 Server Components / Route Handlers / Server Actions
 * 使用 next/headers cookies() 实现 getAll/setAll，setAll 必须写回且 Path=/
 */
export async function createSupabaseServerClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        secure: !isDev,
        path: "/",
        sameSite: "lax",
      },
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value || "", {
                ...options,
                path: "/",
                secure: !isDev,
              })
            );
          } catch {
            // Server Component 中 set 可能失败，忽略
          }
        },
      },
    }
  );
}

/** @deprecated 使用 createSupabaseServerClient */
export const createClient = createSupabaseServerClient;

export function createServiceRoleClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false } }
  );
}
