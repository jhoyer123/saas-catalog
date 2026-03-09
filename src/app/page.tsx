import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Link2, ShoppingBag, LogIn } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#FDFDFD] text-[#1A1A1A] overflow-x-hidden flex flex-col font-sans">
      {/* FONDO */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/backgroundMain.webp"
          alt="Fondo"
          fill
          className="object-cover opacity-70 grayscale-25 hidden md:block [-webkit-mask-image:linear-gradient(to_left,black_20%,transparent_60%)] mask-[linear-gradient(to_left,black_20%,transparent_60%)]"
          priority
        />
        <Image
          src="/images/backgroundMainMobil.webp"
          alt="Fondo"
          fill
          className="object-cover opacity-30 grayscale md:hidden"
          priority
        />
      </div>

      {/* NAVBAR RESPONSIVE */}
      <nav className="relative z-20 flex justify-between items-center px-6 lg:px-12 py-6">
        <div className="flex flex-col">
          <span className="text-xl md:text-2xl font-black tracking-tighter leading-none font-poppins">
            JVG
          </span>
          <span className="font-poppins text-[9px] md:text-[10px] uppercase tracking-[0.2em] text-[#6D001A] font-bold">
            Catalog Platform
          </span>
        </div>

        <div className="flex gap-3 md:gap-5 items-center">
          {/* Iniciar Sesión: Corregido para verse en todas las pantallas */}
          <Link
            href="/auth/login"
            className="flex items-center gap-2 px-4 md:px-6 py-2 md:py-2.5 rounded-full 
               border border-black/5 md:border-white/20 bg-white/40 md:bg-white/10 backdrop-blur-md 
               text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] text-foreground/80 
               hover:text-foreground hover:bg-white/60 transition-all duration-300 active:scale-95"
          >
            <LogIn className="w-4 h-4 md:hidden" />
            <span className="hidden md:block">Iniciar Sesión</span>
          </Link>

          <Link href="/auth/register">
            <Button
              className="font-poppins h-auto rounded-full bg-[#1A1A1A] text-white 
                 px-5 md:px-8 py-2.5 md:py-3 text-[10px] md:text-[11px] font-bold uppercase tracking-[0.15em] md:tracking-[0.2em] 
                 shadow-lg hover:bg-[#6D001A] transition-all duration-300 active:scale-95 group relative overflow-hidden"
            >
              <span className="relative z-10">Empezar</span>
              <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Button>
          </Link>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="relative z-10 flex-1 flex items-center px-6 lg:px-12 py-8 md:py-16">
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full gap-10 md:gap-16 items-center">
          {/* Bloque de Texto */}
          <div className="col-span-1 lg:col-span-6 space-y-6 md:space-y-8 text-center lg:text-left">
            <div className="space-y-3 md:space-y-5">
              <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-poppins font-black leading-none md:leading-[0.9]">
                Tu catálogo,
              </h1>
              <span className="block text-5xl sm:text-6xl md:text-7xl lg:text-8xl leading-none md:leading-[0.9] italic font-serif font-light text-[#6D001A] tracking-wide">
                redefinido.
              </span>
            </div>

            {/* Texto de ventas (Copywriting mejorado) */}
            <p className="font-inter text-gray-600 text-sm md:text-base lg:text-lg max-w-lg mx-auto lg:mx-0 leading-relaxed">
              Transforma la forma en que muestras tus productos. Diseña un
              escaparate digital profesional, gestiona tu inventario sin
              complicaciones y recibe pedidos de tus clientes directamente en tu
              WhatsApp.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full bg-[#6D001A] hover:bg-black text-white rounded-none px-10 md:px-14 h-14 md:h-16 text-xs md:text-sm font-bold font-poppins tracking-widest uppercase transition-all shadow-xl shadow-[#6D001A]/20 hover:-translate-y-1"
                >
                  Crear mi catálogo
                </Button>
              </Link>
            </div>
          </div>

          {/* Bloque de Beneficios: Mosaico Responsive */}
          <div className="col-span-1 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <LayoutDashboard className="w-6 h-6" />,
                title: "Control Total",
                desc: "Administra productos, precios y categorías desde un panel intuitivo y rápido.",
                span: "sm:col-span-2",
              },
              {
                icon: <Link2 className="w-6 h-6" />,
                title: "Enlace Único",
                desc: "Un solo link profesional para compartir tu tienda en cualquier red social.",
                span: "col-span-1",
              },
              {
                icon: <ShoppingBag className="w-6 h-6" />,
                title: "Venta Directa",
                desc: "Los clientes arman su pedido y te llega el resumen claro a tu WhatsApp.",
                span: "col-span-1",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-6 md:p-8 bg-white/60 backdrop-blur-xl border border-gray-100 flex flex-col justify-center transition-all duration-300 group hover:border-[#6D001A]/30 hover:shadow-lg hover:shadow-black/5 hover:-translate-y-1 ${item.span} ${i === 0 ? "min-h-35 md:flex-row md:items-center md:gap-6" : "min-h-45"}`}
              >
                <div className="mb-4 md:mb-0 p-3 bg-white rounded-full shadow-sm text-[#6D001A] w-fit group-hover:scale-110 group-hover:bg-[#6D001A] group-hover:text-white transition-all shrink-0">
                  {item.icon}
                </div>
                <div>
                  <h3 className="font-bold font-poppins text-sm md:text-base uppercase tracking-wider text-black">
                    {item.title}
                  </h3>
                  <p className="text-[12px] md:text-sm font-inter text-gray-600 mt-2 leading-relaxed max-w-65">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER RESPONSIVE */}
      <footer className="relative z-10 px-6 lg:px-12 py-6 md:py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center border-t border-black/5">
        <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold">
          © {new Date().getFullYear()} JVG Platform · Sistema de Catálogos
        </p>
        <div className="flex gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <span className="hover:text-[#6D001A] transition-colors cursor-pointer">
            Privacidad
          </span>
          <span className="hover:text-[#6D001A] transition-colors cursor-pointer">
            Soporte
          </span>
        </div>
      </footer>
    </div>
  );
}
