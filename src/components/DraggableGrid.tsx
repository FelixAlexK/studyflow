import type { DragEndEvent } from "@dnd-kit/core";
import {
  closestCenter,
  DndContext,
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
  onOrderChange?: (next: T[]) => void;
};

export function DraggableGrid<T extends string>({
  items,
  renderItem,
  className,
  getItemClassName,
  onOrderChange,
}: DraggableGridProps<T>) {
  const [order, setOrder] = React.useState<T[]>(items);

  const arraysEqual = React.useCallback((a: T[], b: T[]) => {
    if (a === b) return true;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }, []);

  // Always sync with parent items when they change
  React.useEffect(() => {
    if (!arraysEqual(order, items)) {
      setOrder(items);
    }
  }, [items, order, arraysEqual]);

  const sensors = useSensors(useSensor(MouseSensor), useSensor(TouchSensor));

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.indexOf(active.id as T);
    const newIndex = order.indexOf(over.id as T);
    setOrder((prev) => {
      const next = arrayMove(prev, oldIndex, newIndex);
      onOrderChange?.(next);
      return next;
    });
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
  };

  // Create safe listeners that don't interfere with interactive elements
  const safeListeners = React.useMemo(() => {
    if (!listeners) return {};
    const { onPointerDown, ...rest } = listeners;
    return {
      onPointerDown: (e: React.PointerEvent<HTMLDivElement>) => {
        const target = e.target as HTMLElement;
        // Don't start drag if clicking on interactive elements
        if (target.closest("button, a, input, textarea, [role='button']")) {
          return;
        }
        // Allow drag for card area
        onPointerDown?.(e);
      },
      ...rest,
    };
  }, [listeners]);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...safeListeners}
      className={className}
    >
      {children}
    </div>
  );
}

export default DraggableGrid;
