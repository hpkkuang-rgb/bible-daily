import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            response.cookies.set(name, value)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;
  const isAuthRoute = pathname === "/login" || pathname.startsWith("/auth/");
  const isLogoutRoute = pathname === "/logout";
  const isApiRoute = pathname.startsWith("/api/");
  const isPublicAsset =
    pathname.startsWith("/_next") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico";

  if (isPublicAsset || isApiRoute) {
    return response;
  }

  if (isLogoutRoute) {
    return response;
  }

  if (!user && !isAuthRoute) {
    const protectedPaths = ["/", "/history", "/me", "/records", "/read"];
    const isProtected = protectedPaths.some(
      (p) => p === "/" ? pathname === "/" : pathname.startsWith(p)
    );
    if (isProtected) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("next", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (user && isAuthRoute && pathname === "/login") {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return response;
}
