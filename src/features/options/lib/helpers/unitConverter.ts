import { ALL_UNITS, UnitSymbol } from "../constants/units";

/**
 * Convierte un valor desde una unidad específica a la unidad normalizada de su familia.
 * Ejemplo: normalizeValue(2, "TB") -> 2048 (GB)
 */
export function normalizeValue(value: number, unitSymbol: UnitSymbol): number {
  const unit = ALL_UNITS.find((u) => u.symbol === unitSymbol);

  if (!unit) {
    throw new Error(`Unidad no reconocida: ${unitSymbol}`);
  }

  return value * unit.toNormalizedFactor;
}

/**
 * Convierte un valor de una unidad a otra, validando que sean de la misma familia.
 * Ejemplo: convertUnit(1000, "MB", "GB") -> 0.9765625
 */
export function convertUnit(
  value: number,
  fromSymbol: UnitSymbol,
  toSymbol: UnitSymbol,
): number {
  const fromUnit = ALL_UNITS.find((u) => u.symbol === fromSymbol);
  const toUnit = ALL_UNITS.find((u) => u.symbol === toSymbol);

  if (!fromUnit)
    throw new Error(`Unidad de origen no reconocida: ${fromSymbol}`);
  if (!toUnit) throw new Error(`Unidad de destino no reconocida: ${toSymbol}`);

  // Validar que ambas unidades pertenezcan a la misma familia
  if (fromUnit.familyName !== toUnit.familyName) {
    throw new Error(
      `No se puede convertir entre familias diferentes: ${fromUnit.familyName} a ${toUnit.familyName}`,
    );
  }

  // Paso 1: Convertir el valor de origen a la unidad normalizada
  const normalizedValue = value * fromUnit.toNormalizedFactor;

  // Paso 2: Convertir de la unidad normalizada a la unidad de destino
  return normalizedValue / toUnit.toNormalizedFactor;
}

/**
 * Obtiene el símbolo de la unidad base (normalizada) para cualquier unidad.
 * Ejemplo: getNormalizedUnit("mg") -> "g"
 */
export function getNormalizedUnit(unitSymbol: UnitSymbol): string {
  const unit = ALL_UNITS.find((u) => u.symbol === unitSymbol);

  if (!unit) {
    throw new Error(`Unidad no reconocida: ${unitSymbol}`);
  }

  return unit.normalizedUnit;
}

export interface ParsedOptionValue {
  displayNumber: number | null;
  unit: UnitSymbol | null;
}

/**
 * Recibe la cadena guardada (ej: "1 TB", "500 MB", "12")
 * y extrae el número y la unidad original.
 */
export function parseOptionValue(value?: string | null): ParsedOptionValue {
  if (!value || typeof value !== "string") {
    return { displayNumber: null, unit: null };
  }

  const parts = value.trim().split(" ");

  // Caso 1: Tiene el formato "1 TB" (dos partes)
  if (parts.length === 2) {
    const parsedNum = parseFloat(parts[0]);
    const rawUnit = parts[1];

    // Validamos que sea una unidad registrada en tu sistema
    const validUnit = ALL_UNITS.find((u) => u.symbol === rawUnit);

    return {
      displayNumber: isNaN(parsedNum) ? null : parsedNum,
      unit: validUnit ? (validUnit.symbol as UnitSymbol) : null,
    };
  }

  // Caso 2: Solo hay un número sin unidad (ej: "12")
  const parsedNum = parseFloat(parts[0]);
  return {
    displayNumber: isNaN(parsedNum) ? null : parsedNum,
    unit: null,
  };
}
