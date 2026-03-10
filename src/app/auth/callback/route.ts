import { createClient } from "@/lib/supabase/supabaseServer";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type");
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/auth/login";

  const supabase = await createClient();

  // Flujo PKCE: el email incluye un `code` generado por Supabase
  // Requiere que el code_verifier esté en cookies del mismo navegador.
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error(
      "[auth/callback] exchangeCodeForSession error:",
      error.message,
    );
  }

  // Flujo token_hash: el template de email incluye `token_hash` y `type` directamente.
  // Este flujo NO depende de cookies y funciona en cualquier navegador/dispositivo.
  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as "recovery" | "signup" | "invite" | "magiclink" | "email",
    });
    if (!error) {
      // Signup: cerrar sesión para que el middleware no redirija al dashboard.
      // El usuario debe llegar al login limpio y ver el toast de verificación.
      if (type === "signup") {
        await supabase.auth.signOut();
      }
      return NextResponse.redirect(`${origin}${next}`);
    }
    console.error("[auth/callback] verifyOtp error:", error.message);
  }

  const errorType = code
    ? "pkce_failed"
    : token_hash
      ? "otp_failed"
      : "no_token";
  return NextResponse.redirect(`${origin}/auth/error?reason=${errorType}`);
}
