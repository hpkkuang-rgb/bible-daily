import { createClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const user = data.user;
  if (!user?.email) {
    return NextResponse.redirect(`${origin}/login?error=auth`);
  }

  const betaEnabled = process.env.BETA_GATE_ENABLED === "true";
  if (betaEnabled) {
    const apiUrl = `${origin}/api/beta/check`;
    const res = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: user.email }),
    });
    const body = await res.json();
    if (!body.allowed) {
      await supabase.auth.signOut();
      return NextResponse.redirect(
        `${origin}/login?error=not_allowed&next=${encodeURIComponent(next)}`
      );
    }
  }

  return NextResponse.redirect(`${origin}${next}`);
}
