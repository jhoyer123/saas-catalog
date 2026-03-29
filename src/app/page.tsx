import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Link2, ShoppingBag } from "lucide-react";
import { TermsModal } from "@/components/dashboard/TermModal";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#FDFDFD] text-[#1A1A1A] overflow-x-hidden flex flex-col font-sans">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0 pointer-events-none select-none">
        {/* Desktop */}
        <div className="hidden md:block absolute inset-0">
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
        <div className="md:hidden absolute inset-0">
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
        <div className="flex flex-col items-center justify-center">
          <Image
            src="/images/logoCat.webp"
            alt="Logo"
            width={600}
            height={500}
            priority
            className="object-contain w-20 lg:w-35 h-auto"
          />
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
          <Link
            href="/auth/login"
            className="px-5 py-2.5 rounded-full
                       border border-black/10 bg-white
                       text-[11px] font-bold uppercase tracking-widest
                       hover:bg-gray-50 transition"
          >
            Iniciar sesión
          </Link>

          <Link href="/auth/register">
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

      {/* MAIN */}
      <main className="relative z-20 flex-1 flex items-center px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full gap-16 items-center">
          {/* TEXTO */}
          <div className="lg:col-span-6 space-y-8">
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.9]">
              Tu catálogo,
              <span className="block italic font-serif font-light text-[#6D001A] mt-2">
                redefinido.
              </span>
            </h1>

            <p className="text-center md:text-start text-gray-700 text-lg max-w-lg">
              Transforma la forma en que muestras tus productos. Diseña un
              catálogo digital profesional y recibe pedidos directamente en tu
              WhatsApp.
            </p>

            <div className="flex justify-center md:justify-start">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="bg-[#6D001A] hover:bg-black text-white
                           px-12 h-16 text-sm font-bold uppercase tracking-[0.2em]"
                >
                  Crear mi catálogo
                </Button>
              </Link>
            </div>
          </div>

          {/* CARDS */}
          <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {[
              {
                icon: <LayoutDashboard className="w-6 h-6" />,
                title: "Control total",
                desc: "Administra productos, precios y categorías desde un panel intuitivo.",
                span: "sm:col-span-2",
              },
              {
                icon: <Link2 className="w-6 h-6" />,
                title: "Enlace único",
                desc: "Un solo link profesional para todas tus redes.",
                span: "",
              },
              {
                icon: <ShoppingBag className="w-6 h-6" />,
                title: "Venta directa",
                desc: "Resumen de pedidos directo a tu WhatsApp.",
                span: "",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-8 bg-white shadow-lg border border-gray-200
                           hover:shadow-xl transition
                           ${item.span}`}
              >
                <div className="mb-4 text-[#6D001A]">{item.icon}</div>

                <h3 className="font-bold uppercase text-sm tracking-widest mb-2">
                  {item.title}
                </h3>

                <p className="text-gray-600 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-20 px-6 lg:px-12 py-8 flex flex-col gap-6 items-center justify-center text-xs text-gray-400 md:flex-row md:justify-between">
        <p>© {new Date().getFullYear()} JPlatform - Catalog</p>
        <TermsModal />
      </footer>
    </div>
  );
}
