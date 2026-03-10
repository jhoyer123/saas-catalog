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

  // Verificación no-bloqueante: si no hay sesión, redirige en segundo plano.
  // El formulario se muestra de inmediato para evitar el spinner lento.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace("/auth/forgot-password?reason=expired");
      }
    });
  }, [router]);

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
    // replace evita que el usuario vuelva al formulario con el botón atrás
    window.location.replace("/auth/login?reset=true");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 dark:bg-black">
      <Image
        src="/images/backgroundAuth.webp"
        alt=""
        fill
        sizes="100vw"
        quality={60}
        className="object-cover opacity-50 relative z-0"
        loading="lazy"
      />
      <main className="w-full max-w-md p-6 relative z-10">
        <header className="mb-8 text-center flex flex-col gap-2 items-center">
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
