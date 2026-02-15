"use client";

import Link from "next/link";
import { useLogin } from "@/hooks/auth/useLogin";
import { useToastPromise } from "@/hooks/shared/useToastPromise";

//types
import { LoginData } from "@/lib/schemas/auth";

//components
import FormLogin from "@/components/auth/FormLogin";

export default function Login() {
  const { showPromise } = useToastPromise();
  const { mutateAsync: login, isPending } = useLogin();

  // Function to handle the login process
  const handleLogin = (data: LoginData) => {
    // Show toast promise for the login process
    showPromise({
      promise: login(data),
      messages: {
        loading: "Iniciando sesión...",
        success: () => {
          return "¡Sesión iniciada exitosamente!";
        },
        error: (error) => `Error: ${error.message}`,
      },
      position: "top-right",
      duration: 4000,
      richColors: true,
      closeButton: true,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <main className="w-full max-w-md p-6">
        {/* Header del formulario */}
        <header className="text-center mb-8">
          <div className="mb-4">
            {/* Tu logo aquí */}
            <span className="text-2xl font-bold">logo</span>
          </div>
          <h1 className="text-2xl font-bold">Iniciar Sesión</h1>
          <p className="text-gray-600 mt-2">
            Bienvenido de nuevo, por favor ingresa tus credenciales.
          </p>
        </header>

        {/* Formulario */}
        <FormLogin handleLogin={handleLogin} isPending={isPending} />

        {/* Footer opcional del formulario */}
        <footer className="text-center mt-6 text-sm text-gray-600">
          ¿No tienes cuenta?{" "}
          <Link href="/auth/register" className="text-blue-600">
            Regístrate
          </Link>
        </footer>
      </main>
    </div>
  );
}
