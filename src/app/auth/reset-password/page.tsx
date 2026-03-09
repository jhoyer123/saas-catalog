"use client";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/supabaseClient";
import InputPassword from "@/components/auth/InputPassword";
import { useState, useEffect } from "react";

const schema = z
  .object({
    password: z
      .string()
      .min(6, "La contraseña debe tener al menos 6 caracteres"),
    confirm: z.string(),
  })
  .refine((data) => data.password === data.confirm, {
    message: "Las contraseñas no coinciden",
    path: ["confirm"],
  });

type FormValues = z.infer<typeof schema>;

export default function ResetPassword() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [sessionReady, setSessionReady] = useState(false);

  // Verificar que hay sesión activa antes de mostrar el form
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        // No hay sesión — el link expiró o ya fue usado
        router.replace("/auth/forgot-password?reason=expired");
        return;
      }
      setSessionReady(true);
    });
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async ({ password }: FormValues) => {
    setServerError("");
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setServerError(error.message);
      return;
    }

    await supabase.auth.signOut();
    router.push("/auth/login?reset=true"); // ← toast de éxito en login
  };

  // Mientras verifica la sesión
  if (!sessionReady) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white dark:bg-black">
        <div className="w-8 h-8 border-4 border-gray-200 border-t-black rounded-full animate-spin" />
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
        <header className="mb-8 text-center flex flex-col gap-2 items-center">
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
          <h1 className="text-3xl font-bold">Nueva contraseña</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Ingresa tu nueva contraseña.
          </p>
        </header>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-6 px-4"
        >
          <InputPassword<FormValues>
            label="Nueva contraseña"
            name="password"
            register={register}
            errors={errors}
          />
          <InputPassword<FormValues>
            label="Confirmar contraseña"
            name="confirm"
            register={register}
            errors={errors}
          />

          {serverError && <p className="text-red-500 text-sm">{serverError}</p>}

          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-black text-white rounded-md py-2 text-sm font-medium disabled:opacity-50"
          >
            {isSubmitting ? "Guardando..." : "Guardar contraseña"}
          </button>
        </form>
      </main>
    </div>
  );
}
