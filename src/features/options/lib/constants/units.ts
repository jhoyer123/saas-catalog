/* export type UnitFamilyKey =
  | "Storage"
  | "Length"
  | "Weight"
  | "Power"
  | "Frequency";

export interface UnitDefinition {
  symbol: string;
  label: string;
  // Multiplicador para convertir el valor ingresado a la unidad BASE
  toBaseFactor: number;
}

export interface UnitFamily {
  name: UnitFamilyKey;
  baseUnit: string;
  units: Record<string, UnitDefinition>;
}

export const UNIT_FAMILIES: Record<UnitFamilyKey, UnitFamily> = {
  Storage: {
    name: "Storage",
    baseUnit: "GB",
    units: {
      MB: { symbol: "MB", label: "Megabytes (MB)", toBaseFactor: 1 / 1024 },
      GB: { symbol: "GB", label: "Gigabytes (GB)", toBaseFactor: 1 },
      TB: { symbol: "TB", label: "Terabytes (TB)", toBaseFactor: 1024 },
    },
  },
  Length: {
    name: "Length",
    baseUnit: "cm",
    units: {
      mm: { symbol: "mm", label: "Milímetros (mm)", toBaseFactor: 0.1 },
      cm: { symbol: "cm", label: "Centímetros (cm)", toBaseFactor: 1 },
      m: { symbol: "m", label: "Metros (m)", toBaseFactor: 100 },
      in: { symbol: "in", label: "Pulgadas (in)", toBaseFactor: 2.54 },
    },
  },
  Weight: {
    name: "Weight",
    baseUnit: "g",
    units: {
      mg: { symbol: "mg", label: "Miligramos (mg)", toBaseFactor: 0.001 },
      g: { symbol: "g", label: "Gramos (g)", toBaseFactor: 1 },
      kg: { symbol: "kg", label: "Kilogramos (kg)", toBaseFactor: 1000 },
    },
  },
  Power: {
    name: "Power",
    baseUnit: "W",
    units: {
      W: { symbol: "W", label: "Watts (W)", toBaseFactor: 1 },
      kW: { symbol: "kW", label: "Kilowatts (kW)", toBaseFactor: 1000 },
    },
  },
  Frequency: {
    name: "Frequency",
    baseUnit: "Hz",
    units: {
      Hz: { symbol: "Hz", label: "Hertz (Hz)", toBaseFactor: 1 },
      kHz: { symbol: "kHz", label: "Kilohertz (kHz)", toBaseFactor: 1000 },
      MHz: { symbol: "MHz", label: "Megahertz (MHz)", toBaseFactor: 1_000_000 },
      GHz: {
        symbol: "GHz",
        label: "Gigahertz (GHz)",
        toBaseFactor: 1_000_000_000,
      },
    },
  },
};

// Lista plana de todas las unidades para Render de Select/Combobox
export const ALL_UNITS = Object.values(UNIT_FAMILIES).flatMap((family) =>
  Object.values(family.units).map((u) => ({
    ...u,
    familyName: family.name,
    baseUnit: family.baseUnit,
  })),
);

export type UnitSymbol = string;
 */
export type UnitFamilyKey =
  | "Storage"
  | "Length"
  | "Weight"
  | "Power"
  | "Frequency";

export interface UnitDefinition {
  /** Símbolo oficial de la unidad (GB, cm, kg...) */
  symbol: string;

  /** Nombre para mostrar en la UI */
  label: string;

  /**
   * Factor para convertir un valor ingresado
   * a la unidad normalizada de la familia.
   *
   * Ejemplo:
   * Storage normaliza a GB
   * 1 TB × 1024 = 1024 GB
   */
  toNormalizedFactor: number;
}

export interface UnitFamily {
  name: UnitFamilyKey;

  /**
   * Unidad utilizada internamente por el sistema
   * para almacenar y comparar valores numéricos.
   */
  normalizedUnit: string;

  units: Record<string, UnitDefinition>;
}

export const UNIT_FAMILIES: Record<UnitFamilyKey, UnitFamily> = {
  Storage: {
    name: "Storage",
    normalizedUnit: "GB",
    units: {
      MB: {
        symbol: "MB",
        label: "Megabyte (MB)",
        toNormalizedFactor: 1 / 1024,
      },
      GB: {
        symbol: "GB",
        label: "Gigabyte (GB)",
        toNormalizedFactor: 1,
      },
      TB: {
        symbol: "TB",
        label: "Terabyte (TB)",
        toNormalizedFactor: 1024,
      },
    },
  },

  Length: {
    name: "Length",
    normalizedUnit: "cm",
    units: {
      mm: {
        symbol: "mm",
        label: "Milímetro (mm)",
        toNormalizedFactor: 0.1,
      },
      cm: {
        symbol: "cm",
        label: "Centímetro (cm)",
        toNormalizedFactor: 1,
      },
      m: {
        symbol: "m",
        label: "Metro (m)",
        toNormalizedFactor: 100,
      },
      in: {
        symbol: "in",
        label: "Pulgada (in)",
        toNormalizedFactor: 2.54,
      },
    },
  },

  Weight: {
    name: "Weight",
    normalizedUnit: "g",
    units: {
      mg: {
        symbol: "mg",
        label: "Miligramo (mg)",
        toNormalizedFactor: 0.001,
      },
      g: {
        symbol: "g",
        label: "Gramo (g)",
        toNormalizedFactor: 1,
      },
      kg: {
        symbol: "kg",
        label: "Kilogramo (kg)",
        toNormalizedFactor: 1000,
      },
    },
  },

  Power: {
    name: "Power",
    normalizedUnit: "W",
    units: {
      W: {
        symbol: "W",
        label: "Watt (W)",
        toNormalizedFactor: 1,
      },
      kW: {
        symbol: "kW",
        label: "Kilowatt (kW)",
        toNormalizedFactor: 1000,
      },
    },
  },

  Frequency: {
    name: "Frequency",
    normalizedUnit: "Hz",
    units: {
      Hz: {
        symbol: "Hz",
        label: "Hertz (Hz)",
        toNormalizedFactor: 1,
      },
      kHz: {
        symbol: "kHz",
        label: "Kilohertz (kHz)",
        toNormalizedFactor: 1000,
      },
      MHz: {
        symbol: "MHz",
        label: "Megahertz (MHz)",
        toNormalizedFactor: 1_000_000,
      },
      GHz: {
        symbol: "GHz",
        label: "Gigahertz (GHz)",
        toNormalizedFactor: 1_000_000_000,
      },
    },
  },
};

export const ALL_UNITS = Object.values(UNIT_FAMILIES).flatMap((family) =>
  Object.values(family.units).map((unit) => ({
    ...unit,
    familyName: family.name,
    normalizedUnit: family.normalizedUnit,
  })),
);

export type UnitSymbol =
  | "MB"
  | "GB"
  | "TB"
  | "mm"
  | "cm"
  | "m"
  | "in"
  | "mg"
  | "g"
  | "kg"
  | "W"
  | "kW"
  | "Hz"
  | "kHz"
  | "MHz"
  | "GHz";
