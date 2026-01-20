import type { DragEndEvent } from "@dnd-kit/core";
import {
  DndContext,
  closestCenter,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  rectSortingStrategy,
  SortableContext,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import React from "react";

type DraggableGridProps<T extends string> = {
  items: T[];
  renderItem: (id: T) => React.ReactNode;
  className?: string;
  getItemClassName?: (id: T) => string | undefined;
};

export function DraggableGrid<T extends string>({
  items,
  renderItem,
  className,
  getItemClassName,
}: DraggableGridProps<T>) {
  const [order, setOrder] = React.useState<T[]>(items);

  React.useEffect(() => {
    setOrder(items);
  }, [items]);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as T);
    const newIndex = order.indexOf(over.id as T);
    setOrder((prev) => arrayMove(prev, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={order} strategy={rectSortingStrategy}>
        <div className={className}>
          {order.map((id) => (
            <SortableCard key={id} id={id} className={getItemClassName?.(id)}>
              {renderItem(id)}
            </SortableCard>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
}

function SortableCard<T extends string>({ id, className, children }: { id: T; className?: string; children: React.ReactNode }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    cursor: "grab",
  };

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={className}>
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm">
        <div className="p-2 md:p-0">
          {children}
        </div>
      </div>
    </div>
  );
}

export default DraggableGrid;
