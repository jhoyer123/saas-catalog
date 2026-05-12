"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

interface CarouselProps {
  children: React.ReactNode;
  className?: string;
  itemClassName?: string;
  scrollEnabled?: boolean;
}

const STYLES = `
  .no-scrollbar { scrollbar-width: none; -ms-overflow-style: none; }
  .no-scrollbar::-webkit-scrollbar { display: none; }

  .crsl-track {
    display: flex;
    align-items: stretch;
    gap: 1rem;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
    touch-action: pan-x;
    scroll-behavior: smooth;
  }

  .crsl-item {
    flex: 0 0 calc(33.333% - 0.67rem);
    min-width: 0;
    scroll-snap-align: start;
    display: flex;
    flex-direction: column;
  }
  .crsl-item > * {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
  @media (max-width: 1024px) {
    .crsl-item { flex: 0 0 calc(50% - 0.5rem); }
  }
  @media (max-width: 700px) {
    .crsl-item { flex: 0 0 60vw; }
  }
  @media (max-width: 480px) {
    .crsl-item { flex: 0 0 60vw; }
  }

  .crsl-btn {
    position: absolute;
    top: 42%;
    transform: translateY(-50%);
    z-index: 20;
    width: 44px;
    height: 44px;
    border-radius: 50%;
    background: rgba(250, 250, 249, 0.95);
    border: 1.5px solid #a8a29e;
    color: #292524;
    font-size: 1.5rem;
    font-weight: 300;
    line-height: 1;
    padding: 0;
    cursor: pointer;
    display: none;
    align-items: center;
    justify-content: center;
    box-shadow: 0 2px 10px rgba(0,0,0,0.18);
    transition: background 0.18s, color 0.18s, border-color 0.18s, box-shadow 0.18s;
    backdrop-filter: blur(6px);
    -webkit-backdrop-filter: blur(6px);
  }
  @media (min-width: 1024px) {
    .crsl-btn { display: flex; }
  }
  .crsl-btn:hover {
    background: #f5f5f4;
    color: #0c0a09;
    border-color: #78716c;
    box-shadow: 0 4px 16px rgba(0,0,0,0.22);
  }
  .crsl-btn--prev { left: 6px; }
  .crsl-btn--next { right: 6px; }

  .crsl-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: #d6d3d1;
    border: none;
    padding: 0;
    cursor: pointer;
    flex-shrink: 0;
    transition: background 0.2s, transform 0.2s;
  }
  .crsl-dot--active {
    background: #78716c;
    transform: scale(1.4);
  }
  .crsl-dot:hover:not(.crsl-dot--active) {
    background: #a8a29e;
  }
`;

let stylesInjected = false;
function injectStyles() {
  if (stylesInjected || typeof document === "undefined") return;
  const el = document.createElement("style");
  el.setAttribute("data-crsl", "1");
  el.textContent = STYLES;
  document.head.appendChild(el);
  stylesInjected = true;
}

export default function Carousel({
  children,
  className = "",
  itemClassName = "",
  scrollEnabled = true,
}: CarouselProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const itemsCount = React.Children.count(children);

  useEffect(() => {
    injectStyles();
  }, []);

  const updateScrollState = () => {
    const el = containerRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft < maxScroll - 2);
    const items = el.querySelectorAll<HTMLElement>("[data-citem]");
    const trackLeft = el.getBoundingClientRect().left;
    let closest = 0;
    let minDist = Infinity;
    items.forEach((item, i) => {
      const dist = Math.abs(item.getBoundingClientRect().left - trackLeft);
      if (dist < minDist) {
        minDist = dist;
        closest = i;
      }
    });
    setActiveIndex(closest);
  };

  const scrollByPage = (direction: "left" | "right") => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({
      left:
        direction === "right" ? el.clientWidth * 0.8 : -el.clientWidth * 0.8,
      behavior: "smooth",
    });
  };

  const scrollToIndex = (index: number) => {
    const items =
      containerRef.current?.querySelectorAll<HTMLElement>("[data-citem]");
    items?.[index]?.scrollIntoView({
      behavior: "smooth",
      inline: "start",
      block: "nearest",
    });
  };

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [scrollEnabled, itemsCount]);

  return (
    // max-w-screen-2xl = 1536px (equivale a ~5xl según tu config de Tailwind)
    // ajusta a max-w-5xl si tu tailwind.config lo define distinto
    <div className={`relative overflow-hidden max-w-6xl mx-auto ${className}`}>
      <div
        ref={containerRef}
        className={`crsl-track no-scrollbar${!scrollEnabled ? " justify-center overflow-x-hidden!" : ""}`}
        aria-roledescription="carousel"
      >
        {React.Children.map(children, (child, i) => (
          <div
            data-citem
            className={`crsl-item ${itemClassName}`}
            role="group"
            aria-roledescription="slide"
            aria-label={`Slide ${i + 1} of ${itemsCount}`}
          >
            {child}
          </div>
        ))}
      </div>

      {scrollEnabled && canScrollLeft && (
        <button
          onClick={() => scrollByPage("left")}
          aria-label="Anterior"
          className="crsl-btn crsl-btn--prev"
        >
          <ChevronLeft />
        </button>
      )}
      {scrollEnabled && canScrollRight && (
        <button
          onClick={() => scrollByPage("right")}
          aria-label="Siguiente"
          className="crsl-btn crsl-btn--next"
        >
          <ChevronRight />
        </button>
      )}

      {scrollEnabled && itemsCount > 1 && (
        <div
          className="flex justify-center gap-2 mt-4 lg:hidden"
          role="tablist"
          aria-label="Slides"
        >
          {Array.from({ length: itemsCount }).map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={activeIndex === i}
              aria-label={`Ir al slide ${i + 1}`}
              onClick={() => scrollToIndex(i)}
              className={`crsl-dot${activeIndex === i ? " crsl-dot--active" : ""}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
