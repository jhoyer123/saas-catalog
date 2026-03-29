import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useProductFilter } from "@/hooks/catalog/useProductFilter";
import { Funnel, Search } from "lucide-react";

interface InputSearchProps {
  onOpenFilters: () => void;
}

export const InputSearch = ({ onOpenFilters }: InputSearchProps) => {
  const { searchInput, setSearchInput } = useProductFilter();
  return (
    <div className="w-full max-w-md px-4 flex items-center gap-2 bg-catalog-primary lg:hidden">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Buscar productos..."
          className="pl-10 pr-4 py-2 w-full bg-card"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={onOpenFilters}
        className="lg:hidden h-9 px-2"
      >
        <Funnel />
      </Button>
    </div>
  );
};
