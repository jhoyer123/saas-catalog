import { useState, useCallback, useRef, useEffect } from "react";
import {
  Banner,
  AUTOPLAY_INTERVAL,
  DRAG_THRESHOLD,
  SNAP_THRESHOLD,
} from "@/types/catalog/catalog.types";

export function useBannerCarousel(offers: Banner[]) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Ref del contenedor para calcular el ancho real en píxeles
  const trackRef = useRef<HTMLDivElement>(null);

  // Guardamos el timer para poder cancelarlo cuando el usuario interactúa
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Refs de drag — usamos refs en lugar de state porque no necesitan re-render
  const isDragging = useRef(false);
  const dragStartX = useRef(0);
  const hasMoved = useRef(false);

  // --- Autoplay ---

  const clearTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = null;
  }, []);

  const startTimer = useCallback(() => {
    clearTimer();
    timerRef.current = setInterval(() => {
      // % offers.length hace que después del último vuelva al primero
      setCurrentIndex((prev) => (prev + 1) % offers.length);
    }, AUTOPLAY_INTERVAL);
  }, [clearTimer, offers.length]);

  // Arranca el autoplay al montar y lo limpia al desmontar
  useEffect(() => {
    startTimer();
    return clearTimer;
  }, [startTimer, clearTimer]);

  // --- Navegación ---

  const goTo = useCallback(
    (index: number) => {
      // El módulo con suma garantiza que -1 cicle al último, no quede en negativo
      const next = (index + offers.length) % offers.length;
      setIsAnimating(true);
      setCurrentIndex(next);
      setDragOffset(0);
      startTimer(); // reinicia el autoplay al navegar manualmente
    },
    [startTimer, offers.length],
  );

  // --- Drag / Swipe ---

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      // setPointerCapture hace que aunque el mouse salga del div sigamos recibiendo eventos
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
      isDragging.current = true;
      hasMoved.current = false;
      dragStartX.current = e.clientX;
      setIsAnimating(false); // desactivamos la animación CSS mientras se arrastra
      clearTimer();
    },
    [clearTimer],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging.current) return;
    const delta = e.clientX - dragStartX.current;
    // Solo marcamos hasMoved si superó el umbral mínimo (evita falsos drags)
    if (Math.abs(delta) > DRAG_THRESHOLD) hasMoved.current = true;
    setDragOffset(delta);
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging.current) return;
      isDragging.current = false;
      const delta = e.clientX - dragStartX.current;

      // Si apenas se movió, tratamos como click normal, no como swipe
      if (!hasMoved.current || Math.abs(delta) < DRAG_THRESHOLD) {
        setIsAnimating(true);
        setDragOffset(0);
        startTimer();
        return;
      }

      // Decidimos a dónde ir según qué tan lejos y en qué dirección arrastró
      if (delta < -SNAP_THRESHOLD)
        goTo(currentIndex + 1); // swipe izquierda → siguiente
      else if (delta > SNAP_THRESHOLD)
        goTo(currentIndex - 1); // swipe derecha  → anterior
      else {
        // No llegó al umbral → vuelve al slide actual con animación
        setIsAnimating(true);
        setDragOffset(0);
        startTimer();
      }
    },
    [currentIndex, goTo, startTimer],
  );

  const onPointerCancel = useCallback(() => {
    if (!isDragging.current) return;
    isDragging.current = false;
    setIsAnimating(true);
    setDragOffset(0);
    startTimer();
  }, [startTimer]);

  // --- Cálculo de posición ---

  // Convertimos el offset en píxeles a porcentaje según el ancho real del track
  const trackWidth = trackRef.current?.offsetWidth ?? 0;
  const dragPercent = trackWidth ? (dragOffset / trackWidth) * 100 : 0;

  // Posición final: cada slide ocupa 100%, más el desplazamiento del drag
  const translateX = -(currentIndex * 100) + dragPercent;

  return {
    // Estado
    currentIndex,
    isAnimating,
    translateX,
    // Ref
    trackRef,
    // Handlers de autoplay (para pausar al hacer hover)
    clearTimer,
    startTimer,
    isDragging,
    // Handlers de interacción
    goTo,
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  };
}
