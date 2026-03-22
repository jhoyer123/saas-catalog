import { useState, useEffect } from "react";

export function useTiempoActual(intervalo = 60_000) {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setAhora(new Date()), intervalo);
    return () => clearInterval(id);
  }, [intervalo]);

  return ahora;
}
