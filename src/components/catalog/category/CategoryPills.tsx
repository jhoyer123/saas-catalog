"use client";

import { useRef } from "react";
import { useProductFilter } from "@/hooks/catalog/useProductFilter";

type Category = {
  id: string;
  name: string;
  slug: string;
};

type Props = {
  categories: Category[];
};

export default function CategoryPills({ categories }: Props) {
  const { filters, updateFilter } = useProductFilter();
  const selected = filters.category ?? "";

  const scrollRef = useRef<HTMLDivElement>(null);
  const isDown = useRef(false);
  const startX = useRef(0);
  const scrollLeft = useRef(0);

  const onMouseDown = (e: React.MouseEvent) => {
    isDown.current = true;
    startX.current = e.pageX - (scrollRef.current?.offsetLeft ?? 0);
    scrollLeft.current = scrollRef.current?.scrollLeft ?? 0;
  };
  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDown.current || !scrollRef.current) return;
    const x = e.pageX - scrollRef.current.offsetLeft;
    scrollRef.current.scrollLeft =
      scrollLeft.current - (x - startX.current) * 1.2;
  };
  const stop = () => {
    isDown.current = false;
  };

  const handleSelect = (id: string) => {
    updateFilter("category", id === "" ? null : id);
  };

  return (
    <div
      ref={scrollRef}
      className="overflow-x-auto select-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseLeave={stop}
      onMouseUp={stop}
    >
      <div className="flex gap-2 w-max px-px">
        {[{ id: "", name: "Todos", slug: "" }, ...categories].map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleSelect(cat.id)}
            className={`cursor-pointer px-3 py-1.5 md:px-4.5 md:py-2 rounded-full text-sm font-inter whitespace-nowrap border transition-colors duration-150
              ${
                selected === cat.id
                  ? "bg-catalog-secondary text-catalog-tertiary border-catalog-secondary"
                  : "bg-transparent text-catalog-secondary border-catalog-secondary/30 hover:border-catalog-secondary/60"
              }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
    </div>
  );
}
