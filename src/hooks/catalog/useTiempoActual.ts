import { useState, useEffect } from "react";

export function useTiempoActual() {
  const [ahora, setAhora] = useState(() => new Date());

  useEffect(() => {
    let intervaloId: ReturnType<typeof setInterval>;

    const msHastaProximoMinuto =
      (60 - new Date().getSeconds()) * 1000 - new Date().getMilliseconds();

    const timeoutId = setTimeout(() => {
      setAhora(new Date());

      intervaloId = setInterval(() => {
        setAhora(new Date());
      }, 60_000);
    }, msHastaProximoMinuto);

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervaloId);
    };
  }, []);

  return ahora;
}
