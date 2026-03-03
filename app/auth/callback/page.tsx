"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";

export default function AuthCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    const run = async () => {
      const search = window.location.search || "";
      const hash = window.location.hash || "";
      const params = new URLSearchParams(window.location.search);
      const code = params.get("code");
      const next = params.get("next") ?? "/";

      try {
        if (!code) {
          router.replace(
            `/login?error=callback_missing_code&search=${encodeURIComponent(
              search
            )}&hash=${encodeURIComponent(hash)}`
          );
          return;
        }

        // Browser client (PKCE code exchange)
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        const { error } = await supabase.auth.exchangeCodeForSession(code);

        if (error) {
          router.replace(
            `/login?error=callback_exchange_failed&msg=${encodeURIComponent(
              error.message
            )}&search=${encodeURIComponent(search)}`
          );
          return;
        }

        // 成功：跳回 next
        router.replace(next);
      } catch (e: any) {
        router.replace(
          `/login?error=callback_exception&msg=${encodeURIComponent(
            e?.message ?? "unknown"
          )}&search=${encodeURIComponent(search)}`
        );
      }
    };

    run();
  }, [router]);

  return (
    <div style={{ padding: 24 }}>
      <p>Signing you in…</p>
    </div>
  );
}
