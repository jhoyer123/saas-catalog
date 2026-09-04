import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Solo protegemos rutas críticas
  const isProtectedRoute =
    pathname.startsWith("/dashboard") || pathname.startsWith("/profile");

  // No hacemos nada para rutas públicas
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  // Response que vamos a devolver
  let response = NextResponse.next({
    request,
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
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Comprobar sesión
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const user = session?.user;

  // Si no está autenticado → login
  if (!user) {
    const redirectResponse = NextResponse.redirect(
      new URL("/auth/login", request.url),
    );

    // Copiar cookies que Supabase haya refrescado
    response.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie.name, cookie.value, cookie);
    });

    return redirectResponse;
  }

  // Evitar cache de páginas protegidas
  response.headers.set(
    "Cache-Control",
    "no-store, no-cache, must-revalidate, proxy-revalidate",
  );
  response.headers.set("Pragma", "no-cache");
  response.headers.set("Expires", "0");

  return response;
}

// Solo ejecutar proxy para estas rutas
export const config = {
  matcher: ["/dashboard/:path*", "/profile/:path*"],
};
