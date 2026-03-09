"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/supabaseClient";

const schema = z.object({
  email: z.string().email("Ingresá un correo válido"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPassword() {
  const [sent, setSent] = useState(false);

  const {
    register,
    handleSubmit,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ email }: FormValues) => {
    const supabase = createClient();
    // redirectTo es ignorado cuando el template tiene el link hardcodeado
    // lo dejamos igual por si en algún momento se cambia el template
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });
    // Siempre mostramos éxito — no revelamos si el email existe
    setSent(true);
  };

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
        <Image
          src="/images/backgroundAuth.webp"
          alt="Fondo"
          fill
          className="object-cover opacity-50 z-0"
          priority
        />
        <main className="w-full max-w-md p-6 relative z-10 text-center flex flex-col items-center gap-4">
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
          <h1 className="text-2xl font-bold">Revisá tu correo</h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm max-w-xs">
            Si <strong>{getValues("email")}</strong> tiene una cuenta, vas a
            recibir un link para restablecer tu contraseña.
          </p>
          <Link href="/auth/login" className="text-sm text-blue-600 mt-2">
            Volver al login
          </Link>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <Image
        src="/images/backgroundAuth.webp"
        alt="Fondo"
        fill
        className="object-cover opacity-50 z-0"
        priority
      />
      <main className="w-full max-w-md p-6 relative z-10">
        <header className="mb-8 text-center flex flex-col gap-2">
          <div className="relative mx-auto mb-8 flex items-center justify-center">
            <div className="absolute w-44 h-44 rounded-full bg-[#FCC4CA]/20 blur-3xl" />
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
          <h1 className="text-3xl font-bold">Recuperar contraseña</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Te enviaremos un link para restablecer tu contraseña.
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 px-4"
        >
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Correo electrónico</label>
            <input
              {...register("email")}
              type="email"
              placeholder="alan.gonzales@gmail.com"
              className="border rounded-md px-3 py-2 text-sm dark:bg-zinc-900 dark:border-zinc-700"
            />
            {errors.email && (
              <p className="text-red-500 text-sm">{errors.email.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Enviando..." : "Enviar link"}
          </button>
        </form>

        <footer className="text-center mt-6 text-sm text-gray-600">
          <Link href="/auth/login" className="text-blue-600">
            Volver al login
          </Link>
        </footer>
      </main>
    </div>
  );
}
