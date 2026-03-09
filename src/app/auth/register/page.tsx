"use client";

import Link from "next/link";
import { useRegister } from "@/hooks/auth/useRegister";
import { useToastPromise } from "@/hooks/shared/useToastPromise";

//types
import { RegisterData } from "@/lib/schemas/auth";

//components
import FormRegister from "@/components/auth/FormRegister";
import Image from "next/image";

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
      <Image
        src="/images/backgroundAuth.webp"
        alt="Fondo de Login"
        fill
        className="object-cover opacity-50 relative z-0"
        priority
      />
      <main className="w-full max-w-md p-6 relative z-10">
        {/* header */}
        <header className="mb-8 text-center flex flex-col gap-2 px-4">
          {/* logo */}
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
          <h1 className="text-3xl font-bold">Registrarse</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Completa el formulario para crear tu cuenta y empezar a gestionar tu
            catálogo.
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
