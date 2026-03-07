import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { LayoutDashboard, Link2, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="relative min-h-screen w-full bg-[#FDFDFD] text-[#1A1A1A] overflow-x-hidden lg:overflow-hidden flex flex-col font-sans">
      {/* FONDO: Tu imagen original con overlay minimalista */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/backgroundMain.webp"
          alt="Fondo"
          fill
          className="object-cover opacity-70 grayscale-25 hidden md:block mask-[linear-gradient(to_left,black_20%,transparent_60%)]
      [-webkit-mask-image:linear-gradient(to_left,black_20%,transparent_60%)]
    "
          priority
        />
        <Image
          src="/images/backgroundMainMobil.webp"
          alt="Fondo"
          fill
          className="object-cover opacity-20 grayscale md:hidden"
          priority
        />
      </div>

      {/* NAVBAR */}
      <nav className="relative z-20 flex justify-between items-center px-6 lg:px-12 py-6">
        <div className="flex flex-col">
          <span className="text-2xl font-black tracking-tighter leading-none font-poppins">
            JVG
          </span>
          <span className="font-poppins text-[10px] uppercase tracking-[0.2em] text-[#6D001A] font-bold">
            Catalog Platform
          </span>
        </div>
        <div className="flex gap-4 items-center">
          <Link
            href="/auth/login"
            className="text-sm font-bold uppercase tracking-widest hover:opacity-50 transition-opacity hidden sm:block bg-accent p-3 rounded-3xl"
          >
            Iniciar Sesión
          </Link>
          <Link href="/auth/register">
            <Button className="font-poppins rounded-full bg-[#1A1A1A] hover:bg-[#6D001A] text-white px-6 text-xs uppercase tracking-widest transition-all">
              Empezar
            </Button>
          </Link>
        </div>
      </nav>

      {/* CONTENIDO PRINCIPAL */}
      <main className="relative z-10 flex-1 flex items-center px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 w-full gap-12 items-center">
          {/* Bloque de Texto */}
          <div className="col-span-1 lg:col-span-6 space-y-6 lg:space-y-8 text-center lg:text-left">
            <div className="space-y-5">
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-poppins font-black leading-[0.9]">
                Tu catálogo,
              </h1>
              <span className="text-5xl md:text-7xl lg:text-8xl leading-[0.9] italic font-serif font-light text-[#6D001A] tracking-wide">
                redefinido.
              </span>
            </div>

            <p className="font-inter text-gray-600 text-base lg:text-lg max-w-md mx-auto lg:mx-0 leading-relaxed">
              Crea y gestiona tu inventario con una interfaz limpia. Comparte tu
              stock mediante un enlace directo y profesional.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-4">
              <Link href="/auth/register" className="w-full sm:w-auto">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-[#6D001A] hover:bg-black text-white rounded-none px-12 h-16 text-sm font-bold font-poppins tracking-widest uppercase transition-all shadow-xl shadow-[#6D001A]/20"
                >
                  Crear mi catálogo
                </Button>
              </Link>
            </div>
          </div>

          {/* Bloque de Beneficios (Mosaico adaptado) */}
          <div className="col-span-1 lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              {
                icon: <LayoutDashboard className="w-5 h-5" />,
                title: "Gestión Total",
                desc: "Productos, marcas y categorías en un solo lugar.",
              },
              {
                icon: <Link2 className="w-5 h-5" />,
                title: "Enlace Único",
                desc: "Comparte tu catálogo personalizado al instante.",
              },
              {
                icon: <ShoppingBag className="w-5 h-5" />,
                title: "Pedidos",
                desc: "Recepción de solicitudes directo a tu whatssap.",
              },
            ].map((item, i) => (
              <div
                key={i}
                className={`p-8 bg-white/60 backdrop-blur-sm border border-gray-100 flex flex-col justify-between h-48 hover:border-[#6D001A]/30 transition-all group ${i === 0 ? "sm:col-span-2 sm:h-40 flex-row items-center" : ""}`}
              >
                <div>
                  <div className="mb-4 text-[#6D001A] group-hover:scale-110 transition-transform origin-left">
                    {item.icon}
                  </div>
                  <h3 className="font-bold font-poppins text-sm uppercase tracking-wider">
                    {item.title}
                  </h3>
                  <p className="text-xs font-inter text-gray-600 mt-2 leading-relaxed max-w-50">
                    {item.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer className="relative z-10 px-6 lg:px-12 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-center">
        <p className="text-[10px] text-gray-400 tracking-[0.2em] uppercase font-bold">
          © {new Date().getFullYear()} JVG Platform · Sistema de Catálogos
        </p>
        <div className="flex gap-6 text-[10px] text-gray-400 font-bold uppercase tracking-widest">
          <span className="hover:text-[#6D001A] cursor-pointer">
            Privacidad
          </span>
          <span className="hover:text-[#6D001A] cursor-pointer">Soporte</span>
        </div>
      </footer>
    </div>
  );
}
