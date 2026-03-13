// 'use client'

// import { useMemo } from 'react'
// import {
//   DndContext,
//   closestCenter,
//   KeyboardSensor,
//   PointerSensor,
//   useSensor,
//   useSensors,
//   type DragEndEvent,
// } from '@dnd-kit/core'
// import {
//   arrayMove,
//   SortableContext,
//   sortableKeyboardCoordinates,
//   useSortable,
//   verticalListSortingStrategy,
// } from '@dnd-kit/sortable'
// import { CSS } from '@dnd-kit/utilities'

// interface SortableRoutineProps {
//   routine: Routine
//   date: string
//   onEdit: () => void
//   onDelete: () => void
//   onClick: () => void
// }

// function SortableRoutine({ routine, date, onEdit, onDelete, onClick }: SortableRoutineProps) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: routine.id })

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   }

//   return (
//     <div ref={setNodeRef} style={style} {...attributes}>
//       <RoutineCard
//         routine={routine}
//         date={date}
//         onEdit={onEdit}
//         onDelete={onDelete}
//         onClick={onClick}
//         isDragging={isDragging}
//         dragHandleProps={listeners}
//       />
//     </div>
//   )
// }

// interface RoutineListProps {
//   onEditRoutine: (routine: Routine) => void
//   onDeleteRoutine: (routine: Routine) => void
//   onViewRoutine: (routine: Routine) => void
// }

// export function RoutineList({
//   onEditRoutine,
//   onDeleteRoutine,
//   onViewRoutine,
// }: RoutineListProps) {
//   const { routines, selectedDate, reorderRoutines } = useHabitsStore()

//   const sensors = useSensors(
//     useSensor(PointerSensor, {
//       activationConstraint: {
//         distance: 8,
//       },
//     }),
//     useSensor(KeyboardSensor, {
//       coordinateGetter: sortableKeyboardCoordinates,
//     })
//   )

//   const sortedRoutines = useMemo(() => {
//     return [...routines]
//       .filter((r) => !r.archived)
//       .sort((a, b) => a.order - b.order)
//   }, [routines])

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event

//     if (over && active.id !== over.id) {
//       const oldIndex = sortedRoutines.findIndex((r) => r.id === active.id)
//       const newIndex = sortedRoutines.findIndex((r) => r.id === over.id)
//       const newOrder = arrayMove(sortedRoutines, oldIndex, newIndex)
//       reorderRoutines(newOrder.map((r) => r.id))
//     }
//   }

//   if (sortedRoutines.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-muted-foreground">Nenhuma rotina criada</p>
//         <p className="text-sm text-muted-foreground mt-1">
//           Crie rotinas para agrupar seus hábitos
//         </p>
//       </div>
//     )
//   }

//   return (
//     <DndContext
//       sensors={sensors}
//       collisionDetection={closestCenter}
//       onDragEnd={handleDragEnd}
//     >
//       <SortableContext
//         items={sortedRoutines.map((r) => r.id)}
//         strategy={verticalListSortingStrategy}
//       >
//         <div className="space-y-3">
//           {sortedRoutines.map((routine) => (
//             <SortableRoutine
//               key={routine.id}
//               routine={routine}
//               date={selectedDate}
//               onEdit={() => onEditRoutine(routine)}
//               onDelete={() => onDeleteRoutine(routine)}
//               onClick={() => onViewRoutine(routine)}
//             />
//           ))}
//         </div>
//       </SortableContext>
//     </DndContext>
//   )
// }
