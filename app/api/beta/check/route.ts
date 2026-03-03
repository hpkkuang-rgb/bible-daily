import { createServiceRoleClient } from "@/src/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { email } = (await request.json()) as { email?: string };
    if (!email || typeof email !== "string") {
      return NextResponse.json(
        { allowed: false, error: "Missing email" },
        { status: 400 }
      );
    }

    const betaEnabled = process.env.BETA_GATE_ENABLED === "true";
    if (!betaEnabled) {
      return NextResponse.json({ allowed: true });
    }

    const supabase = createServiceRoleClient();
    const { data, error } = await supabase
      .from("beta_allowlist")
      .select("email")
      .eq("email", email.toLowerCase().trim())
      .eq("is_active", true)
      .maybeSingle();

    if (error) {
      console.error("beta_allowlist query error:", error);
      return NextResponse.json(
        { allowed: false, error: "Check failed" },
        { status: 500 }
      );
    }

    return NextResponse.json({ allowed: !!data });
  } catch (e) {
    console.error("beta check error:", e);
    return NextResponse.json(
      { allowed: false, error: "Check failed" },
      { status: 500 }
    );
  }
}
