/**
 * protected routes middleware automatically redirecting users to login if they are not authenticated
 * and redirecting to dashboard if they are authenticated and try to access login or register pages
 */
import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
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
    data: { user },
  } = await supabase.auth.getUser();

  if (!user && request.nextUrl.pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/auth/login", request.url));
  }

  if (user && request.nextUrl.pathname.startsWith("/auth/login")) {
    return NextResponse.redirect(new URL("/dashboard/panel", request.url));
  }

  return response;
}

export const config = {
  matcher: [
    "/dashboard/:path*", // Protege dashboard
    "/profile/:path*", // Protege perfil
    "/settings/:path*", // Protege configuración
  ],
};
