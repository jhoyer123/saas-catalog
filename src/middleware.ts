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

  // getUser() puede refrescar el token y escribir cookies nuevas en `response`.
  // Es CRÍTICO que esas cookies se propaguen en cualquier respuesta (incluso redirects).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isDashboard = request.nextUrl.pathname.startsWith("/dashboard");

  // ── Redirects ──
  // Usamos una función helper para copiar las cookies de Supabase
  // al redirect. Sin esto, el token refrescado se pierde y la
  // siguiente petición falla con sesión inválida.
  if (!user && isDashboard) {
    return redirectWithCookies("/auth/login", request, response);
  }

  // Excluir /auth/callback y /auth/reset-password del redirect automático.
  // - /auth/callback: necesita procesar el token sin importar el estado de sesión.
  // - /auth/reset-password: tras procesar el token de recovery, el usuario queda
  //   con sesión activa pero DEBE poder acceder al formulario para cambiar su contraseña.
  const pathname = request.nextUrl.pathname;
  const isAuthExcluded =
    pathname === "/auth/callback" || pathname === "/auth/reset-password";
  if (user && pathname.startsWith("/auth") && !isAuthExcluded) {
    return redirectWithCookies("/dashboard/panel", request, response);
  }

  // ── Evitar que el navegador cachee páginas protegidas ──
  // Sin esto, al cerrar sesión y presionar "atrás" el navegador
  // muestra la página del dashboard desde su caché (bfcache)
  // sin pasar por el middleware.
  if (isDashboard) {
    response.headers.set(
      "Cache-Control",
      "no-store, no-cache, must-revalidate, proxy-revalidate",
    );
    response.headers.set("Pragma", "no-cache");
    response.headers.set("Expires", "0");
  }

  return response;
}

/**
 * Crea un redirect que conserva las cookies escritas por Supabase.
 *
 * ¿Por qué?
 * supabase.auth.getUser() puede refrescar el JWT y escribir cookies
 * nuevas en `response`. Si hacemos NextResponse.redirect() sin copiarlas,
 * el navegador pierde el token refrescado → la siguiente petición falla.
 */
function redirectWithCookies(
  path: string,
  request: NextRequest,
  currentResponse: NextResponse,
) {
  const redirectResponse = NextResponse.redirect(new URL(path, request.url));

  // Copiar todas las cookies que Supabase escribió al nuevo redirect
  currentResponse.cookies.getAll().forEach((cookie) => {
    redirectResponse.cookies.set(cookie.name, cookie.value);
  });

  return redirectResponse;
}

export const config = {
  matcher: [
    "/dashboard/:path*", // Protege dashboard
    "/auth/:path*", // Redirige a dashboard si ya está logueado
    "/profile/:path*", // Protege perfil
    "/settings/:path*", // Protege configuración
  ],
};
