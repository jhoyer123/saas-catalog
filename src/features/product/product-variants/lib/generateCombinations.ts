// generateCombinations.ts

export interface ComboValue {
  option_type_id: string;
  option_value_id: string;
}

type ValuesByType = Record<string, string[]>;

/**
 * Genera el producto cartesiano de los valores seleccionados por atributo.
 * Regla: si el producto tiene N atributos seleccionados, cada combinación
 * debe incluir un valor de CADA uno de los N. Si algún atributo seleccionado
 * todavía no tiene ningún valor tildado, no se genera NINGUNA combinación
 * (no existen combinaciones parciales con menos atributos que los elegidos).
 */
export function generateCombinations(
  selectedTypeIds: string[],
  valuesByType: ValuesByType,
): ComboValue[][] {
  if (selectedTypeIds.length === 0) return [];

  const groups = selectedTypeIds.map((typeId) =>
    (valuesByType[typeId] ?? []).map((valueId) => ({
      option_type_id: typeId,
      option_value_id: valueId,
    })),
  );

  // si CUALQUIER atributo seleccionado no tiene valores aún, no hay combinaciones válidas
  const someTypeWithoutValues = groups.some((g) => g.length === 0);
  if (someTypeWithoutValues) return [];

  return groups.reduce<ComboValue[][]>((acc, group) => {
    if (acc.length === 0) return group.map((g) => [g]);
    const next: ComboValue[][] = [];
    for (const combo of acc) {
      for (const g of group) next.push([...combo, g]);
    }
    return next;
  }, []);
}

export function comboSignature(combo: ComboValue[]): string {
  return [...combo]
    .sort((a, b) => a.option_type_id.localeCompare(b.option_type_id))
    .map((c) => c.option_value_id)
    .join("|");
}

export function visualSignature(
  combo: ComboValue[],
  visualTypeIds: string[],
): string | null {
  const visualPart = combo.filter((c) =>
    visualTypeIds.includes(c.option_type_id),
  );
  if (visualPart.length === 0) return null;
  return [...visualPart]
    .sort((a, b) => a.option_type_id.localeCompare(b.option_type_id))
    .map((c) => c.option_value_id)
    .join("|");
}
