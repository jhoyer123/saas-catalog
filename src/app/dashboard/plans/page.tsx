"use client";

import Plans from "@/components/plans/Plans";

export default function PlanPage() {
  return (
    <section className="min-h-screen bg-[#fafaf9] p-4">
      {/* Hero */}
      <div className="max-w-3xl mx-auto text-center pb-6 md:pb-9">
        <span className="inline-block text-xs font-medium tracking-widest uppercase text-gray-400 mb-6 px-5 py-2 border border-gray-200 rounded-full bg-white">
          Planes y precios
        </span>
        <h1 className="text-3xl sm:text-5xl font-serif text-gray-900 leading-tight tracking-tight mb-5">
          Tu tienda online,
          <br />
          sin complicaciones
        </h1>
        <p className="text-base text-gray-400 leading-relaxed w-full">
          Elige el plan que se adapta a tu negocio.
          <br />
          Sin contratos, cancela cuando quieras.
        </p>
      </div>
      <Plans />
    </section>
  );
}
