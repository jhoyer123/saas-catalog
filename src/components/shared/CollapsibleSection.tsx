import { useState, ReactNode } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

type CollapsibleSectionProps = {
  title: string;
  description: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};

export const CollapsibleSection = ({
  title,
  description,
  children,
  defaultOpen = true,
}: CollapsibleSectionProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg border-input bg-card font-inter w-full overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center justify-between w-full p-4 md:p-6 text-left hover:bg-accent/50 transition-colors"
      >
        <div className="flex flex-col gap-1 pr-4">
          <h3 className="text-lg font-semibold font-poppins">{title}</h3>
          <div className="text-sm text-muted-foreground font-inter">
            {description}
          </div>
        </div>
        {isOpen ? (
          <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 md:p-6 border-t border-input pt-4">{children}</div>
      )}
    </div>
  );
};
