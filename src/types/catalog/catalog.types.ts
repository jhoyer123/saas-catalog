// Forma de cada banner que viene de la base de datos
export interface Offer {
  id: number;
  image: string;
  link: string;
  alt?: string;
}

// Cuánto tiempo muestra cada banner antes de pasar al siguiente
export const AUTOPLAY_INTERVAL = 5000;

// Píxeles mínimos que tiene que moverse el dedo/mouse para contar como drag
export const DRAG_THRESHOLD = 5;

// Píxeles mínimos para que el drag cambie de slide (si no, vuelve al mismo)
export const SNAP_THRESHOLD = 80;
