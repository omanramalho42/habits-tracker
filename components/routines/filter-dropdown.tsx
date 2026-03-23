"use client"

import React from "react"
import { Filter, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu"

import { cn } from "@/lib/utils"

type FilterField = "name" | "status" | "category" | "type"
type SortField = "createdAt" | "updatedAt" | "name"
type SortOrder = "asc" | "desc"

type FilterState = {
  field: FilterField
  values: string[]

  // 🔥 NOVO
  sortBy?: SortField
  order?: SortOrder
}

interface FilterDropdownProps {
  filter: FilterState
  setFilter: React.Dispatch<React.SetStateAction<FilterState>>

  // 🔥 opcional: categorias dinâmicas vindas do banco
  categories?: string[]
}

const FilterDropdown: React.FC<FilterDropdownProps> = ({
  filter,
  setFilter,
  categories = []
}) => {
  const applySort = (sortBy: SortField) => {
    setFilter((prev) => ({
      ...prev,
      sortBy
    }))
  }

  const applyOrder = (order: SortOrder) => {
    setFilter((prev) => ({
      ...prev,
      order
    }))
  }
  const isActive = (field: string, value: string) =>
    filter.field === field && filter.values.includes(value)

  const applyFilter = (field: FilterState["field"], value: string) => {
    setFilter({
      field,
      values: [value]
    })
  }

  const resetFilter = () => {
    setFilter({
      field: "category",
      values: [],
      sortBy: undefined,
      order: undefined
    })
  }
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          type="button"
          size="icon-lg"
          className={cn(
            "border-white/10 bg-black/40 backdrop-blur-md",
            "hover:bg-green-500/10 hover:border-green-500/30",
            "shadow-[0_0_10px_rgba(34,197,94,0.15)]"
          )}
        >
          <Filter className="w-4 h-4 text-green-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-64 bg-black/80 backdrop-blur-xl border border-white/10"
      >

        {/* TIPO */}
        {/* <DropdownMenuLabel>Tipo</DropdownMenuLabel> */}

        {/* {["habit", "task"].map((type) => (
          <DropdownMenuItem
            key={type}
            onClick={() => applyFilter("type", type)}
            className="flex justify-between"
          >
            {type === "habit" && "Hábitos"}
            {type === "task" && "Tarefas"}

            {isActive("type", type) && (
              <Check className="w-4 h-4 text-green-400" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator /> */}

        {/* STATUS */}
        <DropdownMenuLabel>Status</DropdownMenuLabel>

        {["ACTIVE", "INACTIVE"].map((status) => (
          <DropdownMenuItem
            key={status}
            onClick={() => applyFilter("status", status)}
            className="flex justify-between"
          >
            {status === "ACTIVE" ? "Ativo" : "Inativo"}

            {isActive("status", status) && (
              <Check className="w-4 h-4 text-green-400" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* ORDENAÇÃO */}
        <DropdownMenuLabel>Ordenar por</DropdownMenuLabel>

        {[
          { label: "Criado em", value: "createdAt" },
          { label: "Atualizado em", value: "updatedAt" },
          { label: "Nome", value: "name" }
        ].map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => applySort(item.value as any)}
            className="flex justify-between"
          >
            {item.label}

            {filter.sortBy === item.value && (
              <Check className="w-4 h-4 text-green-400" />
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* ORDEM */}
        <DropdownMenuLabel>Ordem</DropdownMenuLabel>

        {[
          { label: "Ascendente", value: "asc" },
          { label: "Descendente", value: "desc" }
        ].map((item) => (
          <DropdownMenuItem
            key={item.value}
            onClick={() => applyOrder(item.value as any)}
            className="flex justify-between"
          >
            {item.label}

            {filter.order === item.value && (
              <Check className="w-4 h-4 text-green-400" />
            )}
          </DropdownMenuItem>
        ))}

        {/* CATEGORIAS */}
        {categories.length > 0 && (
          <>
            <DropdownMenuLabel>Categorias</DropdownMenuLabel>

            {categories.map((cat) => (
              <DropdownMenuItem
                key={cat}
                onClick={() => applyFilter("category", cat)}
                className="flex justify-between"
              >
                {cat}

                {isActive("category", cat) && (
                  <Check className="w-4 h-4 text-green-400" />
                )}
              </DropdownMenuItem>
            ))}

            <DropdownMenuSeparator />
          </>
        )}

        {/* RESET */}
        <DropdownMenuItem
          onClick={resetFilter}
          className="text-red-400"
        >
          Limpar filtros
        </DropdownMenuItem>

      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default FilterDropdown