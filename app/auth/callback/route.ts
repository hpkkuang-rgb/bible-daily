import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = url.searchParams.get("next") ?? "/";

  const response = NextResponse.redirect(new URL(next, url.origin));
  const isLocalhost = url.origin.includes("localhost");
  const cookiesSet: string[] = [];

  function parseCookieHeader(header: string | null): { name: string; value: string }[] {
    if (!header) return [];
    return header.split("; ").map((c) => {
      const eq = c.indexOf("=");
      const name = eq > 0 ? c.slice(0, eq).trim() : c.trim();
      const value = eq > 0 ? c.slice(eq + 1).trim() : "";
      return { name, value };
    });
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookieOptions: {
        secure: !isLocalhost,
        path: "/",
        sameSite: "lax",
      },
      cookies: {
        getAll() {
          return parseCookieHeader(request.headers.get("cookie"));
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookiesSet.push(name);
            response.cookies.set(name, value || "", {
              ...options,
              path: "/",
              secure: !isLocalhost,
              sameSite: "lax",
            });
          });
        },
      },
    }
  );

  if (!code) {
    return NextResponse.redirect(new URL("/login?error=missing_code", url.origin));
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  // Supabase v2.91+ defers SIGNED_IN via setTimeout(0), so setAll may not run before return.
  // Allow one macrotask for the cookie adapter to persist the session.
  await new Promise((r) => setTimeout(r, 0));

  if (error) {
    return NextResponse.redirect(new URL("/login?error=exchange_failed", url.origin));
  }

  const betaEnabled = process.env.BETA_GATE_ENABLED === "true";
  if (betaEnabled && data?.user?.email) {
    const res = await fetch(`${url.origin}/api/beta/check`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: data.user.email }),
    });
    const body = await res.json();
    if (!body.allowed) {
      await supabase.auth.signOut();
      response.headers.set(
        "Location",
        new URL(`/login?error=not_allowed&next=${encodeURIComponent(next)}`, url.origin).href
      );
      return response;
    }
  }

  if (process.env.NODE_ENV === "development") {
    console.log("[auth/callback] Set-Cookie names:", cookiesSet.length > 0 ? cookiesSet.join(", ") : "(none)");
  }

  return response;
}
