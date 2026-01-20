import React from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

type WidgetOption<T extends string> = {
  id: T;
  title: string;
  description?: string;
};

type AddWidgetButtonProps<T extends string> = {
  sectionLabel: string;
  options: WidgetOption<T>[];
  existingIds: T[];
  onAdd: (id: T) => void;
  className?: string;
};

export default function AddWidgetButton<T extends string>({ sectionLabel, options, existingIds, onAdd, className }: AddWidgetButtonProps<T>) {
  const [open, setOpen] = React.useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className={className}>
          + Add Widget
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add widget to {sectionLabel}</DialogTitle>
        </DialogHeader>
        <div className="grid gap-3">
          {options.map((opt) => {
            const disabled = existingIds.includes(opt.id);
            return (
              <div key={opt.id} className="flex items-start justify-between gap-4 rounded-md border p-3">
                <div>
                  <div className="font-medium">{opt.title}</div>
                  {opt.description ? (
                    <div className="text-muted-foreground text-sm">{opt.description}</div>
                  ) : null}
                </div>
                <Button
                  variant={disabled ? "secondary" : "default"}
                  disabled={disabled}
                  onClick={() => {
                    onAdd(opt.id);
                    setOpen(false);
                  }}
                >
                  {disabled ? "Added" : "Add"}
                </Button>
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
