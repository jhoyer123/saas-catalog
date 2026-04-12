"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import Plans from "@/components/plans/Plans";

export default function PlanPage() {
  return (
    <main className="relative min-h-screen w-full bg-[#FDFDFD] text-[#1A1A1A] overflow-x-hidden flex flex-col font-sans">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {/* Desktop */}
        <div className="hidden md:block fixed inset-0">
          <Image
            src="/images/backgroundMain.webp"
            alt="Fondo"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-70 grayscale-10"
          />
          {/* Overlay oscuro suave */}
          <div className="absolute inset-0 bg-linear-to-r from-white/95 via-white/80 to-white/40" />
        </div>
        {/* Mobile */}
        <div className="md:hidden fixed inset-0" style={{ height: "100lvh" }}>
          <Image
            src="/images/backgroundMainMobil.webp"
            alt="Fondo móvil"
            fill
            priority
            sizes="100vw"
            className="object-cover opacity-60 grayscale-20"
          />
          <div className="absolute inset-0 bg-linear-to-t from-white/95 via-white/70 to-white/30" />
        </div>
      </div>

      {/* NAVBAR */}
      <nav className="relative z-30 flex justify-between items-center px-4 py-6 md:px-12">
        <Link href="/">
          <Image
            src="/images/logoCat.webp"
            alt="Logo"
            width={600}
            height={500}
            priority
            className="object-contain w-20 lg:w-35 h-auto"
          />
        </Link>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <Link
            href="/auth/login"
            prefetch={false}
            className="px-5 py-2.5 rounded-full border border-black/10 bg-white
                       text-[11px] font-bold uppercase tracking-widest
                       hover:bg-gray-50 transition"
          >
            Iniciar sesión
          </Link>
          <Link href="/auth/register" prefetch={false}>
            <Button
              className="rounded-full bg-black text-white
                         px-6 py-3 text-[11px] font-bold uppercase tracking-widest
                         hover:bg-[#6D001A]"
            >
              Empezar
            </Button>
          </Link>
        </div>
      </nav>

      {/* HEADER DE SECCIÓN */}
      <div className="relative z-20 text-center px-6 pt-10 pb-4">
        <p className="text-[11px] font-bold uppercase tracking-widest text-[#6D001A] mb-4">
          Planes y precios
        </p>
        <h1 className="text-5xl sm:text-6xl font-black leading-[0.9] mb-6">
          Elige tu
          <span className="block italic font-serif font-light text-[#6D001A] mt-2">
            plan ideal.
          </span>
        </h1>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Sin comisiones. Sin sorpresas. Cancela cuando quieras.
        </p>
      </div>

      {/* PLANS — sin tocar */}
      <div className="relative z-20 flex-1">
        <Plans />
      </div>

      {/* FOOTER */}
      <footer className="relative z-20 px-6 lg:px-12 py-8 flex flex-col gap-6 items-center justify-center text-xs text-gray-400 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} JPlatform - Catalog</p>
        <Link href="/" className="hover:text-gray-600 transition">
          ← Volver a inicio
        </Link>
      </footer>
    </main>
  );
}
