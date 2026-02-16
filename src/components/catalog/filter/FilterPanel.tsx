"use client";

import React, { useState, useCallback } from "react";
import { X, SlidersHorizontal, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

// ── Tipos ────────────────────────────────────────────────────────────
export interface FilterState {
  categories: string[];
  brands: string[];
  priceMin: number;
  priceMax: number;
}

interface FilterPanelProps {
  /** Callback que se dispara cada vez que cambia un filtro */
  onChange?: (filters: FilterState) => void;
}

// ── Datos de ejemplo — reemplaza con los tuyos ───────────────────────
const CATEGORIES = [
  "Electrónica",
  "Ropa",
  "Hogar",
  "Deportes",
  "Juguetes",
  "Alimentos",
];
const BRANDS = ["Samsung", "Apple", "Sony", "LG", "Xiaomi", "Asus"];
const PRICE_MIN = 0;
const PRICE_MAX = 5000;

// ── Subcomponente: sección colapsable ────────────────────────────────
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-b border-gray-100 py-3">
      <button
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between text-sm font-semibold text-gray-700 hover:text-gray-900"
      >
        {title}
        {open ? (
          <ChevronUp className="w-4 h-4" />
        ) : (
          <ChevronDown className="w-4 h-4" />
        )}
      </button>
      {open && <div className="mt-3">{children}</div>}
    </div>
  );
};

// ── Componente principal ─────────────────────────────────────────────
const FilterPanel: React.FC<FilterPanelProps> = ({ onChange }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [priceMin, setPriceMin] = useState(PRICE_MIN);
  const [priceMax, setPriceMax] = useState(PRICE_MAX);

  const notify = useCallback(
    (cats: string[], brands: string[], min: number, max: number) => {
      onChange?.({ categories: cats, brands, priceMin: min, priceMax: max });
    },
    [onChange],
  );

  const toggleCategory = (cat: string) => {
    const next = selectedCategories.includes(cat)
      ? selectedCategories.filter((c) => c !== cat)
      : [...selectedCategories, cat];
    setSelectedCategories(next);
    notify(next, selectedBrands, priceMin, priceMax);
  };

  const toggleBrand = (brand: string) => {
    const next = selectedBrands.includes(brand)
      ? selectedBrands.filter((b) => b !== brand)
      : [...selectedBrands, brand];
    setSelectedBrands(next);
    notify(selectedCategories, next, priceMin, priceMax);
  };

  const handlePriceMin = (val: number) => {
    const safe = Math.min(val, priceMax - 1);
    setPriceMin(safe);
    notify(selectedCategories, selectedBrands, safe, priceMax);
  };

  const handlePriceMax = (val: number) => {
    const safe = Math.max(val, priceMin + 1);
    setPriceMax(safe);
    notify(selectedCategories, selectedBrands, priceMin, safe);
  };

  const clearAll = () => {
    setSelectedCategories([]);
    setSelectedBrands([]);
    setPriceMin(PRICE_MIN);
    setPriceMax(PRICE_MAX);
    notify([], [], PRICE_MIN, PRICE_MAX);
  };

  const activeCount =
    selectedCategories.length +
    selectedBrands.length +
    (priceMin !== PRICE_MIN || priceMax !== PRICE_MAX ? 1 : 0);

  // ── Contenido del panel (compartido entre modal y sidebar) ─────────
  const PanelContent = (
    <div className="flex flex-col gap-1">
      {/* Header del panel */}
      <div className="flex items-center justify-between pb-2">
        <span className="font-bold text-gray-800">Filtros</span>
        {activeCount > 0 && (
          <button
            onClick={clearAll}
            className="text-xs text-red-500 hover:text-red-700 underline underline-offset-2"
          >
            Limpiar todo
          </button>
        )}
      </div>

      {/* Categoría */}
      <Section title="Categoría">
        <div className="flex flex-col gap-2">
          {CATEGORIES.map((cat) => (
            <label
              key={cat}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat)}
                onChange={() => toggleCategory(cat)}
                className="w-4 h-4 rounded accent-black cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">
                {cat}
              </span>
            </label>
          ))}
        </div>
      </Section>

      {/* Precio */}
      <Section title="Precio">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>${priceMin.toLocaleString()}</span>
            <span>${priceMax.toLocaleString()}</span>
          </div>
          {/* Range min */}
          <div className="relative h-5">
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1.5 rounded-full bg-gray-200">
              <div
                className="absolute h-full rounded-full bg-black"
                style={{
                  left: `${((priceMin - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                  right: `${100 - ((priceMax - PRICE_MIN) / (PRICE_MAX - PRICE_MIN)) * 100}%`,
                }}
              />
            </div>
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={50}
              value={priceMin}
              onChange={(e) => handlePriceMin(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          {/* Range max */}
          <div className="relative h-5">
            <input
              type="range"
              min={PRICE_MIN}
              max={PRICE_MAX}
              step={50}
              value={priceMax}
              onChange={(e) => handlePriceMax(Number(e.target.value))}
              className="absolute inset-0 w-full opacity-0 cursor-pointer"
            />
          </div>
          <div className="flex gap-2">
            <input
              type="number"
              value={priceMin}
              min={PRICE_MIN}
              max={priceMax - 1}
              onChange={(e) => handlePriceMin(Number(e.target.value))}
              className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-black"
            />
            <span className="text-gray-400 self-center">–</span>
            <input
              type="number"
              value={priceMax}
              min={priceMin + 1}
              max={PRICE_MAX}
              onChange={(e) => handlePriceMax(Number(e.target.value))}
              className="w-full border border-gray-200 rounded px-2 py-1 text-sm text-center focus:outline-none focus:ring-1 focus:ring-black"
            />
          </div>
        </div>
      </Section>

      {/* Marca */}
      <Section title="Marca">
        <div className="flex flex-col gap-2">
          {BRANDS.map((brand) => (
            <label
              key={brand}
              className="flex items-center gap-2 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedBrands.includes(brand)}
                onChange={() => toggleBrand(brand)}
                className="w-4 h-4 rounded accent-black cursor-pointer"
              />
              <span className="text-sm text-gray-600 group-hover:text-gray-900">
                {brand}
              </span>
            </label>
          ))}
        </div>
      </Section>
    </div>
  );

  return (
    <>
      {/* ── MOBILE: botón flotante + modal ────────────────────── */}
      <div className="md:hidden">
        <Button
          variant="outline"
          size="sm"
          onClick={() => setMobileOpen(true)}
          className="flex items-center gap-2 border-gray-300"
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filtros
          {activeCount > 0 && (
            <span className="ml-1 bg-black text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              {activeCount}
            </span>
          )}
        </Button>

        {/* Backdrop */}
        {mobileOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
        )}

        {/* Drawer bottom-sheet */}
        <div
          className={`fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-2xl shadow-xl p-5 pb-8
            transform transition-transform duration-300 ease-out max-h-[85vh] overflow-y-auto
            ${mobileOpen ? "translate-y-0" : "translate-y-full"}`}
        >
          {/* Handle */}
          <div className="w-10 h-1 bg-gray-300 rounded-full mx-auto mb-4" />
          {/* Cerrar */}
          <button
            onClick={() => setMobileOpen(false)}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-700"
            aria-label="Cerrar filtros"
          >
            <X className="w-5 h-5" />
          </button>
          {PanelContent}
          <Button
            className="w-full mt-5 bg-black text-white hover:bg-gray-800"
            onClick={() => setMobileOpen(false)}
          >
            Ver resultados
          </Button>
        </div>
      </div>

      {/* ── DESKTOP: sidebar estático ──────────────────────────── */}
      <aside className="hidden md:block w-full bg-white rounded-lg shadow-sm border border-gray-100 p-4 h-fit">
        {PanelContent}
      </aside>
    </>
  );
};

export default FilterPanel;
