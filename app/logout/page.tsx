"use client";

import { createClient } from "@/src/lib/supabase/client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    async function signOut() {
      const supabase = createClient();
      await supabase.auth.signOut();
      router.replace("/login");
    }
    signOut();
  }, [router]);

  return (
    <main style={{ padding: "2rem", textAlign: "center" }}>
      <p>正在退出…</p>
    </main>
  );
}
