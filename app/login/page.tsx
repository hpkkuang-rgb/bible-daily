"use client";

import { Suspense, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { useSearchParams } from "next/navigation";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/";
  const errorParam = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(
    errorParam === "not_allowed"
      ? "您不在内测名单中，暂无法登录。"
      : errorParam === "auth"
        ? "登录失败，请重试。"
        : null
  );

  async function handleMagicLink(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const emailRedirectTo = `${origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: err } = await supabase.auth.signInWithOtp({
      email: email.trim().toLowerCase(),
      options: { emailRedirectTo },
    });
    setLoading(false);
    if (err) {
      setError(err.message || "发送失败，请重试。");
      return;
    }
    setSent(true);
  }

  function handleResend() {
    setSent(false);
    setError(null);
  }

  return (
    <main style={{ padding: "2rem", maxWidth: 400, margin: "0 auto" }}>
      <h1>登录</h1>
      {error && (
        <p style={{ color: "#b91c1c", marginBottom: 12 }}>{error}</p>
      )}
      {sent ? (
        <div>
          <p>请查收邮件中的魔法链接，点击即可登录。</p>
          <button
            type="button"
            onClick={handleResend}
            style={{ marginTop: 12 }}
          >
            重新发送
          </button>
        </div>
      ) : (
        <form onSubmit={handleMagicLink}>
          <input
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ display: "block", marginBottom: 8, width: "100%" }}
          />
          <button type="submit" disabled={loading}>
            {loading ? "发送中…" : "发送魔法链接"}
          </button>
        </form>
      )}
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<main style={{ padding: "2rem" }}><p>加载中…</p></main>}>
      <LoginForm />
    </Suspense>
  );
}
