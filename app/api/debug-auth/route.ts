import { createClient } from "@/src/lib/supabase/server";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "dev only" }, { status: 404 });
  }

  const store = await cookies();
  const allCookies = store.getAll();

  const supabase = await createClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  return NextResponse.json({
    cookieCount: allCookies.length,
    cookieNames: allCookies.map((c) => c.name),
    user: user ? { id: user.id, email: user.email } : null,
    error: error?.message ?? null,
  });
}
