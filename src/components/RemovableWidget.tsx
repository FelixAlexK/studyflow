import { X } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";

type RemovableWidgetProps = {
  children: React.ReactNode;
  onRemove: () => void;
  className?: string;
};

export default function RemovableWidget({ children, onRemove, className }: RemovableWidgetProps) {
  const [showRemove, setShowRemove] = React.useState(false);

  const handleRemove = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      e.preventDefault();
      onRemove();
    },
    [onRemove],
  );

  return (
    <section
      className={`group relative ${className ?? ""}`}
      onMouseEnter={() => setShowRemove(true)}
      onMouseLeave={() => setShowRemove(false)}
      aria-label="Widget"
    >
      {children}
      {showRemove && (
        <div className="absolute top-2 right-2 z-50 pointer-events-auto">
          <Button
            variant="destructive"
            size="icon-sm"
            onClick={handleRemove}
            onMouseDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onPointerDown={(e) => {
              e.stopPropagation();
              e.preventDefault();
            }}
            onTouchStart={(e) => {
              e.stopPropagation();
            }}
            title="Remove widget"
            className="h-7 w-7 rounded-md"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
    </section>
  );
}
