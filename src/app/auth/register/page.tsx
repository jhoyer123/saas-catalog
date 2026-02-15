"use client";

import Link from "next/link";
import { useRegister } from "@/hooks/auth/useRegister";
import { useToastPromise } from "@/hooks/shared/useToastPromise";

//types
import { RegisterData } from "@/lib/schemas/auth";

//components
import FormRegister from "@/components/auth/FormRegister";

export default function Register() {
  const { showPromise } = useToastPromise();
  const { mutateAsync: register, isPending } = useRegister();

  // Function to handle the registration process
  const handleRegister = (data: RegisterData) => {
    const { confirmPassword, ...serviceData } = data;
    // Show toast promise for the registration process
    showPromise({
      promise: register(serviceData),
      messages: {
        loading: "Creando tu cuenta...",
        success: () => {
          return "¡Cuenta creada exitosamente!, Revisa tu correo para verificar tu cuenta.";
        },
        error: (error) => `Error: ${error.message}`,
      },
      position: "top-right",
      duration: 10000,
      richColors: true,
      closeButton: true,
    });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="w-full max-w-md p-6">
        {/* header */}
        <header className="mb-8 text-center flex flex-col gap-2 px-4">
          {/* logo */}
          <span>logo</span>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-200">
            Registrarse
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Crea una nueva cuenta para continuar.
          </p>
        </header>
        {/* form register*/}
        <FormRegister handleRegister={handleRegister} isPending={isPending} />
        {/* footer */}
        <footer className="text-center mt-6 text-sm text-gray-600">
          ¿Ya tienes una cuenta?{" "}
          <Link href="/auth/login" className="text-blue-600">
            Inicia sesión
          </Link>
        </footer>
      </main>
    </div>
  );
}
