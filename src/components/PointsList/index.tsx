import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import cn from "classnames";
import { useStore } from "store";
import { Point } from "types";
import { formatCoords } from "utils";
import styles from "./styles.module.css";

export default function PointsList() {
  const path = useStore((s) => s.path);
  const { movePoint, select } = useStore((s) => s.actions);

  return (
    <DragDropContext
      onDragEnd={({ destination, source }) => {
        if (
          destination?.droppableId !== source.droppableId ||
          destination.index === source.index
        )
          return;

        movePoint(path[destination.index].id, path[source.index].id);
      }}
    >
      <Droppable droppableId="points">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            onMouseLeave={() => select(null)}
          >
            {path.map((p, i) => (
              <Item key={p.id} point={p} index={i} />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

type ItemProps = {
  point: Point;
  index: number;
};

function Item({ point, index }: ItemProps) {
  const selected = useStore((s) => s.selected);
  const { removePoint, select } = useStore((s) => s.actions);

  return (
    <Draggable key={point.id} draggableId={point.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(styles.item, selected === point.id && styles.selected)}
          onMouseEnter={() => select(point.id)}
        >
          <div title={formatCoords(point.coords)}>{point.label}</div>
          <div className={styles.removeBox}>
            <button onClick={() => removePoint(point.id)}>X</button>
          </div>
        </div>
      )}
    </Draggable>
  );
}
