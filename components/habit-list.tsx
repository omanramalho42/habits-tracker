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
// import type { Habit, HabitWithStats } from '@/lib/types'
// import { HabitCard } from './habit-card'

// interface SortableHabitProps {
//   habit: Habit
//   date: string
//   onEdit: () => void
//   onDelete: () => void
//   onClick: () => void
// }

// function SortableHabit({ habit, date, onEdit, onDelete, onClick }: SortableHabitProps) {
//   const {
//     attributes,
//     listeners,
//     setNodeRef,
//     transform,
//     transition,
//     isDragging,
//   } = useSortable({ id: habit.id })

//   const style = {
//     transform: CSS.Transform.toString(transform),
//     transition,
//   }

//   return (
//     <div ref={setNodeRef} style={style} {...attributes}>
//       <HabitCard
//         habit={habit}
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

// interface HabitListProps {
//   onEditHabit: (habit: Habit) => void
//   onDeleteHabit: (habit: Habit) => void
//   onViewHabit: (habit: Habit) => void
// }

// export function HabitList({ onEditHabit, onDeleteHabit, onViewHabit }: HabitListProps) {
//   const { habits, selectedDate, filters, reorderHabits } = useHabitsStore()

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

//   const filteredHabits: HabitWithStats[] = useMemo(() => {
//     return habits
//       .filter((h) => {
//         if (!filters.showArchived && h.archived) return false
//         if (filters.routineId && h.routineId !== filters.routineId) return false
//         if (
//           filters.searchQuery &&
//           !h.name.toLowerCase().includes(filters.searchQuery.toLowerCase())
//         ) {
//           return false
//         }
//         return true
//       })
//       .sort((a, b) => a.order - b.order)
//   }, [habits, filters])

//   const handleDragEnd = (event: DragEndEvent) => {
//     const { active, over } = event

//     if (over && active.id !== over.id) {
//       const oldIndex = filteredHabits.findIndex((h) => h.id === active.id)
//       const newIndex = filteredHabits.findIndex((h) => h.id === over.id)
//       const newOrder = arrayMove(filteredHabits, oldIndex, newIndex)
//       reorderHabits(newOrder.map((h) => h.id))
//     }
//   }

//   if (filteredHabits.length === 0) {
//     return (
//       <div className="text-center py-12">
//         <p className="text-muted-foreground">Nenhum hábito encontrado</p>
//         <p className="text-sm text-muted-foreground mt-1">
//           Clique no + para adicionar seu primeiro hábito
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
//         items={filteredHabits.map((h) => h.id)}
//         strategy={verticalListSortingStrategy}
//       >
//         <div className="space-y-3">
//           {filteredHabits.map((habit) => (
//             <SortableHabit
//               key={habit.id}
//               habit={habit}
//               date={selectedDate}
//               onEdit={() => onEditHabit(habit)}
//               onDelete={() => onDeleteHabit(habit)}
//               onClick={() => onViewHabit(habit)}
//             />
//           ))}
//         </div>
//       </SortableContext>
//     </DndContext>
//   )
// }
