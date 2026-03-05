import { useDroppable } from "@dnd-kit/core"

import "./styles.css"

const DroppableCell = (props: any) => {
  const { setNodeRef } = useDroppable({ id: props.id })

  return (
    <div ref={setNodeRef} className="">
      {props.children}
    </div>
  );
};

export default DroppableCell
