import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Solo protegemos rutas críticas
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile");

  if (!isProtectedRoute) {
    return NextResponse.next(); // No CPU extra para /auth/*, /register, /public/*
  }

  // ── Middleware protegido ──
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const {
    data: { session },
  } = await supabase.auth.getSession();
  const user = session?.user;

  // ── Redirigir a login si no está autenticado ──
  if (!user && isProtectedRoute) {
    const redirectResponse = NextResponse.redirect(
      new URL("/auth/login", request.url),
    );
    // Copiar cookies refrescadas
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value);
    });
    return redirectResponse;
  }

  // ── Evitar cache en páginas protegidas ──
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

// Solo proteger rutas críticas
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
