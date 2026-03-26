import { Input } from "@/components/ui/input";
import { Search, X } from "lucide-react";
import { useRef, useState } from "react";

interface DebouncedInputProps {
  onChange: (value: string) => void;
  debounce?: number;
  valueDefault: string;
  placeholder?: string;
}
// Input que espera X tiempo antes de notificar el cambio
export function DebouncedInput({
  onChange,
  debounce = 800,
  valueDefault,
  placeholder = "Buscar...",
}: DebouncedInputProps) {
  const [value, setValue] = useState(valueDefault);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onChange(newValue), debounce);
  };

  return (
    <div className="relative w-full max-w-md">
      <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
      <Input
        type="text"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="pl-8 pr-10"
      />
      {value && (
        <button
          onClick={() => {
            setValue("");
            onChange("");
          }}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground-card hover:text-foreground-card/80 transition-colors"
          type="button"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
