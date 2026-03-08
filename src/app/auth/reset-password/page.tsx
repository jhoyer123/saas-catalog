"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/supabaseClient";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirm) {
      setError("Las contraseñas no coinciden");
      return;
    }

    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres");
      return;
    }

    setIsPending(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      setIsPending(false);
      return;
    }

    router.push("/auth/login");
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
          <h1 className="text-3xl font-bold">Nueva contraseña</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ingresa tu nueva contraseña.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 px-4">
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Nueva contraseña</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="border rounded-md px-3 py-2 text-sm dark:bg-zinc-900 dark:border-zinc-700"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium">Confirmar contraseña</label>
            <input
              type="password"
              required
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              placeholder="••••••••"
              className="border rounded-md px-3 py-2 text-sm dark:bg-zinc-900 dark:border-zinc-700"
            />
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={isPending}
            className="bg-black text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
          >
            {isPending ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      </main>
    </div>
  );
}
