"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/src/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "done">("loading");

  useEffect(() => {
    async function handleCallback() {
      const params = new URLSearchParams(window.location.search);
      const hash = new URLSearchParams(window.location.hash.slice(1));
      const next = params.get("next") ?? "/";

      const code = params.get("code");
      const accessToken = hash.get("access_token");
      const refreshToken = hash.get("refresh_token");

      const supabase = createClient();

      try {
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) throw error;
          if (data?.user?.email) {
            const res = await fetch("/api/beta/check", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: data.user.email }),
            });
            const body = await res.json();
            if (!body.allowed) {
              await supabase.auth.signOut();
              router.replace(`/login?error=not_allowed&next=${encodeURIComponent(next)}`);
              return;
            }
          }
        } else if (accessToken && refreshToken) {
          const { error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (error) throw error;
          const { data } = await supabase.auth.getUser();
          if (data?.user?.email) {
            const res = await fetch("/api/beta/check", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: data.user.email }),
            });
            const body = await res.json();
            if (!body.allowed) {
              await supabase.auth.signOut();
              router.replace(`/login?error=not_allowed&next=${encodeURIComponent(next)}`);
              return;
            }
          }
        } else {
          router.replace("/login?error=callback_failed");
          return;
        }

        setStatus("done");
        router.replace(next);
      } catch {
        router.replace("/login?error=callback_failed");
      }
    }

    handleCallback();
  }, [router]);

  return (
    <main style={{ padding: "2rem", maxWidth: 400, margin: "0 auto", textAlign: "center" }}>
      <p>{status === "loading" ? "正在处理登录…" : "跳转中…"}</p>
    </main>
  );
}
