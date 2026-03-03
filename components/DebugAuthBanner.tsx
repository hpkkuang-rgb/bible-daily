import Link from "next/link";
import { createClient } from "@/src/lib/supabase/server";
import { headers } from "next/headers";

export default async function DebugAuthBanner() {
  if (process.env.NODE_ENV !== "development") return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const headersList = await headers();
  const cookieHeader = headersList.get("cookie") ?? "";
  const hasAuthCookie = /sb-[a-z]+-auth-token/i.test(cookieHeader);

  return (
    <div
      className="fixed left-0 right-0 top-0 z-[100] flex items-center justify-center gap-4 bg-amber-100 px-4 py-1 text-center text-xs text-amber-800"
      suppressHydrationWarning
    >
      <span>[DEV] server sees user: {user ? "yes" : "no"}</span>
      <span>| Cookie header has auth-token: {hasAuthCookie ? "yes" : "no"}</span>
      <Link href="/api/debug-auth" target="_blank" className="underline">
        debug
      </Link>
    </div>
  );
}
