"use client";

import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useLogin } from "@/hooks/auth/useLogin";
import { useToastPromise } from "@/hooks/shared/useToastPromise";
import { LoginData } from "@/lib/schemas/auth";
import FormLogin from "@/components/auth/FormLogin";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";

// ← componente separado que usa useSearchParams
function SearchParamsToast() {
  const searchParams = useSearchParams();

  useEffect(() => {
    if (searchParams.get("verified") === "true") {
      toast.success("¡Correo verificado!", {
        description: "Ya podés iniciar sesión con tu cuenta.",
        duration: 10000,
        action: { label: "Ok", onClick: () => {} },
      });
    }
    if (searchParams.get("reset") === "true") {
      toast.success("Contraseña actualizada", {
        description: "Ya podés iniciar sesión con tu nueva contraseña.",
        duration: 10000,
        action: { label: "Ok", onClick: () => {} },
      });
    }
  }, []);

  return null; // no renderiza nada visual
}

export default function Login() {
  const { showPromise } = useToastPromise();
  const { mutateAsync: login, isPending } = useLogin();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const handleLogin = (data: LoginData) => {
    showPromise({
      promise: login(data).then((result) => {
        setIsRedirecting(true);
        router.push("/dashboard/panel");
        return result;
      }),
      messages: {
        loading: "Iniciando sesión...",
        success: () => "¡Sesión iniciada exitosamente!",
        error: (error) => {
          setIsRedirecting(false);
          return `Error: ${error.message}`;
        },
      },
      position: "top-right",
      duration: 4000,
      richColors: true,
      closeButton: true,
    });
  };

  if (isRedirecting) {
    return (
      <div className="fixed inset-0 bg-white z-50 flex flex-col items-center justify-center gap-4">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
        <p className="text-sm text-gray-500 font-inter">Cargando panel...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <Image
        src="/images/backgroundAuth.webp"
        alt=""
        fill
        sizes="100vw"
        quality={60}
        className="object-cover opacity-50 relative z-0"
        loading="lazy"
      />

      {/* ← Suspense requerido por Next.js para useSearchParams en build */}
      <Suspense fallback={null}>
        <SearchParamsToast />
      </Suspense>

      <main className="w-full max-w-md p-6 flex relative z-10">
        <div className="flex-1/2">
          <header className="text-center mb-8">
            <div className="relative mx-auto mb-8 flex items-center justify-center">
              <div className="relative w-32 h-32 rounded-2xl bg-background border shadow-xl flex items-center justify-center">
                <Image
                  src="/images/logoCat.webp"
                  alt="JhoyLabs Logo"
                  width={80}
                  height={80}
                  priority
                  className="object-contain"
                />
              </div>
            </div>
            <h1 className="text-3xl font-bold font-poppins">Iniciar Sesión</h1>
            <p className="text-gray-600 mt-2 max-w-sm mx-auto font-inter">
              Bienvenido de nuevo, por favor ingresa tus credenciales.
            </p>
          </header>

          <FormLogin handleLogin={handleLogin} isPending={isPending} />

          <div className="text-center mt-4">
            <Link
              href="/auth/forgot-password"
              className="text-sm text-center text-blue-600"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>

          <footer className="text-center mt-6 text-sm text-gray-600 font-inter">
            ¿No tienes cuenta?{" "}
            <Link href="/auth/register" className="text-blue-600">
              Regístrate
            </Link>
          </footer>
        </div>
      </main>
    </div>
  );
}
