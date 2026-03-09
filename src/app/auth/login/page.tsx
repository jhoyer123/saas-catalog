"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLogin } from "@/hooks/auth/useLogin";
import { useToastPromise } from "@/hooks/shared/useToastPromise";

import { LoginData } from "@/lib/schemas/auth";
import FormLogin from "@/components/auth/FormLogin";
import Image from "next/image";

export default function Login() {
  const { showPromise } = useToastPromise();
  const { mutateAsync: login, isPending } = useLogin();
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();

  const handleLogin = (data: LoginData) => {
    showPromise({
      promise: login(data).then((result) => {
        // .then() se ejecuta cuando login es exitoso,
        // ANTES de que sonner muestre el mensaje success
        // así el spinner aparece exactamente en el punto ciego
        setIsRedirecting(true);
        router.push("/dashboard/panel");
        return result;
      }),
      messages: {
        loading: "Iniciando sesión...",
        success: () => "¡Sesión iniciada exitosamente!",
        error: (error) => {
          setIsRedirecting(false); // si falla, apaga el spinner
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
        alt="Fondo de Login"
        fill
        className="object-fill opacity-50 relative z-0"
        priority
      />
      <main className="w-full max-w-md p-6 flex relative z-10">
        <div className="flex-1/2">
          <header className="text-center mb-8">
            <div className="relative mx-auto mb-8 flex items-center justify-center">
              {/* Glow exterior */}
              <div className="absolute w-44 h-44 rounded-full bg-[#FCC4CA]/20 blur-3xl" />

              {/* Contenedor del logo */}
              <div className="relative w-32 h-32 rounded-2xl bg-background/80 backdrop-blur border shadow-xl flex items-center justify-center">
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
