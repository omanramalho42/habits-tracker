import { useDraggable } from "@dnd-kit/core"

import "./styles.css"

const DraggableEvent = (props: any) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging
  } = useDraggable({
    id: props.id
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        position: "absolute",
        backgroundColor: isDragging && "red"
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      // @ts-ignore
      style={style}
      className="event"
      {...listeners}
      {...attributes}
      data-id={props.id}
    >
      {props.children.title}
    </div>
  );
};

export default DraggableEvent;
