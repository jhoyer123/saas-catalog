"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/supabaseClient";

const supabase = createClient();

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsPending(true);

    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/reset-password`,
    });

    // Siempre mostramos éxito por seguridad
    // (no revelamos si el email existe o no)
    setSent(true);
    setIsPending(false);
  };

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
          <span className="text-2xl font-black tracking-tighter font-poppins">
            JVG
          </span>
          <h1 className="text-3xl font-bold">Recuperar contraseña</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Te enviaremos un link para restablecer tu contraseña.
          </p>
        </header>

        {sent ? (
          <div className="text-center flex flex-col gap-4">
            <p className="text-green-600 font-medium">
              ¡Correo enviado! Revisa tu bandeja de entrada.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-4">
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Correo electrónico</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alan.gonzales@gmail.com"
                className="border rounded-md px-3 py-2 text-sm dark:bg-zinc-900 dark:border-zinc-700"
              />
            </div>
            <button
              type="submit"
              disabled={isPending}
              className="bg-black text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
            >
              {isPending ? "Enviando..." : "Enviar link"}
            </button>
          </form>
        )}

        <footer className="text-center mt-6 text-sm text-gray-600">
          <Link href="/auth/login" className="text-blue-600">
            Volver al login
          </Link>
        </footer>
      </main>
    </div>
  );
}
