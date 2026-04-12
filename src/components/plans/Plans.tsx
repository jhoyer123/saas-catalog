"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { useGetPlans } from "@/hooks/plans/useGetPlans";

const USD_TO_BS = 9;

function formatBs(usd: number): string {
  return Math.round(usd * USD_TO_BS).toLocaleString("es-BO");
}

export default function Plans() {
  const [currency, setCurrency] = useState<"usd" | "bs">("bs");
  const { data } = useGetPlans();

  const plans = data?.map((p) => {
    const getFeatures = [
      "Catálogo online listo para vender",
      "Pedidos directos por WhatsApp",
      "Comparte tu tienda con un link",
      "Gestión de productos y ofertas",
      "Activa o desactiva productos fácilmente",
      "Diseño optimizado para tu negocio",
      "Personaliza tu tienda con tu logo",
      "Colores adaptados profesionalmente",
      "Sucursales y redes sociales integradas",
      `Hasta ${p.max_products} productos`,
      `${p.max_images_per_product} imágenes por producto`,
      `${p.max_banners} banners en tu tienda`,
    ];
    return {
      id: p.id,
      name: p.name,
      price: p.price,
      maxProducts: p.max_products,
      maxImages: p.max_images_per_product,
      maxBanners: p.max_banners,
      popular: p.name === "Estándar",
      description: p.description,
      features: getFeatures,
    };
  });

  const getWhatsappLink = (planName: string) => {
    const phone = "62557286";
    const message = `Hola, quiero solicitar el plan ${planName} en JPLATAFORM. ¿Podrían brindarme más información?`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8">
      {/* Toggle moneda */}
      <div className="flex justify-center mb-12">
        <div className="flex bg-gray-100 rounded-full p-1.5">
          <button
            onClick={() => setCurrency("bs")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              currency === "bs"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Bolivianos (Bs)
          </button>
          <button
            onClick={() => setCurrency("usd")}
            className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
              currency === "usd"
                ? "bg-white text-gray-900 shadow-sm"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            Dólares ($)
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 items-center justify-center gap-5 max-w-5xl mx-auto pb-16">
        {plans?.map((plan) => (
          <div
            key={plan.id}
            className={`relative bg-white rounded-2xl p-8 transition-all duration-200 hover:-translate-y-1 ${
              plan.popular
                ? "border-2 border-gray-900 shadow-xl"
                : "border border-gray-200 hover:shadow-md"
            }`}
          >
            {/* Badge popular */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full whitespace-nowrap">
                Más popular
              </div>
            )}

            {/* Nombre */}
            <p className="text-xs font-semibold tracking-widest uppercase text-gray-400 mb-4">
              {plan.name}
            </p>

            {/* Precio */}
            <div className="flex items-baseline gap-1.5 mb-1">
              <span className="text-xl font-medium text-gray-900">
                {currency === "bs" ? "Bs" : "$"}
              </span>
              <span className="text-6xl font-serif text-gray-900 tracking-tight leading-none">
                {currency === "bs" ? formatBs(plan.price) : plan.price}
              </span>
            </div>
            <p className="text-sm text-gray-400 mb-1">por mes</p>
            <p className="text-sm text-gray-300 mb-6">
              {currency === "bs"
                ? `$${plan.price} USD`
                : `Bs ${formatBs(plan.price)}`}
            </p>

            {/* Descripción */}
            <p className="text-sm text-gray-400 leading-relaxed mb-6 pb-6 border-b border-gray-100">
              {plan.description}
            </p>

            {/* Features */}
            <ul className="flex flex-col gap-3.5 mb-8">
              {plan.features.map((f, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-sm text-gray-600"
                >
                  <Check
                    size={15}
                    strokeWidth={2.5}
                    className="text-gray-900 shrink-0"
                  />
                  {f}
                </li>
              ))}
            </ul>

            <a
              href={getWhatsappLink(plan.name)}
              target="_blank"
              className={`block w-full text-center py-3.5 rounded-xl text-sm font-medium transition-all duration-150 ${
                plan.popular
                  ? "bg-gray-900 text-white hover:opacity-90"
                  : "bg-white text-gray-900 border border-gray-200 hover:bg-gray-50"
              }`}
            >
              Solicitar Plan
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
