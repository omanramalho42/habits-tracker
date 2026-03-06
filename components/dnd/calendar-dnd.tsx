"use client"

import { useState } from "react"
import { Calendar } from "@/components/ui/calendar"
import { DndContext } from "@dnd-kit/core"
import { format } from "date-fns"

import DraggableEvent from "./draggable-event"
import DroppableCell from "./droppable-cell"
import { Button } from "../ui/button"

import "./styles.css"

const initialEvents = [
  { id: "id1", title: "Event 1", date: "2026-03-01" },
  { id: "id2", title: "Event 2", date: "2026-03-02" },
  { id: "id3", title: "Event 3", date: "2026-03-03" },
  { id: "id4", title: "Event 4", date: "2026-03-04" },
  { id: "id5", title: "Event 5", date: "2026-03-05" }
]

export default function CalendarDnd({ bookedDates = [] }) {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [events, setEvents] = useState(initialEvents)

  const handleDragEnd = (event: any) => {
    const { over, active } = event

    if (over && over.id !== active.id) {
      setEvents((prev) =>
        prev.map((ev) =>
          ev.id === active.id ? { ...ev, date: over.id } : ev
        )
      )
    }
  }

  function DayButton(props: any) {
    const { day, ...rest } = props
    const currentDate = format(day.date, "yyyy-MM-dd")

    const eventsOfDay = events.filter(
      (event) => event.date === currentDate
    )

    return (
      <Button
        variant="ghost" {...rest}
        className="w-full h-full"
      >
        <DroppableCell id={currentDate}>
          <div className="grid grid-cols-3 gap-1 items-start">
            <span className="text-sm">
              {day.date.getDate()}
              {/* <p>✅</p> */}
            </span>

            {eventsOfDay.map((event) => (
              <DraggableEvent key={event.id} id={event.id}>
                {event.title}
              </DraggableEvent>
            ))}
          </div>
        </DroppableCell>
      </Button>
    )
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        defaultMonth={date}
        disabled={bookedDates}
        showOutsideDays={false}
        modifiers={{
          booked: bookedDates
        }}
        modifiersClassNames={{
          booked: "[&>button]:line-through opacity-100"
        }}
        className="bg-transparent [--cell-size:--spacing(10)] [&_table]:border-separate [&_table]:border-spacing-0.5"
        formatters={{
          formatWeekdayName: (date) =>
            date.toLocaleString("pt-BR", { weekday: "short" })
        }}
        components={{
          DayButton
        }}
      />
    </DndContext>
  )
}