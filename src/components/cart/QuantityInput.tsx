/**
 * QuantityInput — Control de cantidad con botones +/- e input numérico.
 *
 * Validaciones:
 * - Solo acepta números naturales >= 1.
 * - Bloquea letras, negativos, decimales y cero.
 * - Impide pegar texto no numérico.
 * - El botón "-" se deshabilita cuando la cantidad es 1.
 */

"use client";

import React, { useCallback } from "react";
import { Minus, Plus } from "lucide-react";

interface QuantityInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
}

export function QuantityInput({
  value,
  onChange,
  min = 1,
  max = 999,
}: QuantityInputProps) {
  /** Garantiza que el valor sea un entero dentro del rango válido */
  const clamp = useCallback(
    (n: number) => Math.min(max, Math.max(min, Math.floor(n))),
    [min, max],
  );

  /** Decrementa en 1 (nunca por debajo de min) */
  const handleDecrement = () => onChange(clamp(value - 1));

  /** Incrementa en 1 (nunca por encima de max) */
  const handleIncrement = () => onChange(clamp(value + 1));

  /** Maneja el cambio directo del input */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;

    // Permite vaciar temporalmente para re-escribir
    if (raw === "") return;

    const parsed = parseInt(raw, 10);

    // Ignora si no es un número válido
    if (isNaN(parsed)) return;

    onChange(clamp(parsed));
  };

  /** Si el campo queda vacío al perder el foco, restaurar al mínimo */
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    if (e.target.value === "" || parseInt(e.target.value, 10) < min) {
      onChange(min);
    }
  };

  /** Bloquea teclas no numéricas (letras, signos, decimales) */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowed = [
      "Backspace", "Delete", "Tab", "ArrowLeft", "ArrowRight",
      "Home", "End",
    ];

    if (allowed.includes(e.key)) return;

    // Solo dígitos 0-9
    if (!/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  /** Bloquea pegado de texto no numérico */
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    const pasted = e.clipboardData.getData("text");
    if (!/^\d+$/.test(pasted)) {
      e.preventDefault();
    }
  };

  return (
    <div className="inline-flex items-center rounded-lg border border-gray-200 bg-white">
      {/* Botón decrementar */}
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min}
        aria-label="Disminuir cantidad"
        className="flex h-8 w-8 items-center justify-center text-gray-500 
                   transition-colors hover:bg-gray-50 hover:text-gray-700 
                   disabled:cursor-not-allowed disabled:opacity-30
                   rounded-l-lg"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>

      {/* Input numérico */}
      <input
        type="text"
        inputMode="numeric"
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        aria-label="Cantidad"
        className="h-8 w-10 border-x border-gray-200 bg-transparent text-center 
                   text-sm font-medium text-gray-900 outline-none
                   [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none 
                   [&::-webkit-outer-spin-button]:appearance-none"
      />

      {/* Botón incrementar */}
      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max}
        aria-label="Aumentar cantidad"
        className="flex h-8 w-8 items-center justify-center text-gray-500 
                   transition-colors hover:bg-gray-50 hover:text-gray-700 
                   disabled:cursor-not-allowed disabled:opacity-30
                   rounded-r-lg"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
