"use client"

import React, { useMemo, useState } from "react"
import HeatMap from "@uiw/react-heat-map"

// --- CONSTANTES ---
const COLOR_COMPLETED = "#10B981" // Verde
const COLOR_SCHEDULED = "#3B82F6" // Azul
const COLOR_NO_HABIT = "hsl(var(--muted))" // Muted/Preto

// --- INTERFACES ---
interface CompletionValue {
  completedDate?: string 
  completed_date?: string 
}

interface HeatMapHabitProps {
  habitColor: string
  startDate: Date
  endDate: Date | null
  values: CompletionValue[] // Completions (habit.completions)
  habitFrequency: string[] // Frequency (habit.frequency)
}

// --- FUNÇÃO DE PRÉ-PROCESSAMENTO CENTRALIZADA (Corrigida) ---
function generateHeatMapValues(startDate, endDate, completions, frequency) {
    const results = [];
    let currentDate = new Date(startDate);
    currentDate.setHours(0, 0, 0, 0);

    // 1. Define o limite de iteração: (O MÍNIMO entre endDate E a data atual)
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    let limitDate = today;

    if (endDate && endDate < today) {
        // Se o endDate existir e for no passado, usamos ele como limite.
        limitDate = new Date(endDate);
        limitDate.setHours(23, 59, 59, 999);
    } 
    // Se endDate é null, limitDate já é 'today'.
    // Se endDate é futuro, limitDate já é 'today' (não mostramos agendamento futuro no heatmap, apenas o completion).
    
    // Normaliza a frequência
    const safeFrequency = Array.isArray(frequency) ? frequency : [];
    const WEEKDAYS = [ // Re-definição para garantir que a função seja auto-suficiente
        { key: "S", label: "Sun" }, { key: "M", label: "Mon" }, { key: "T", label: "Tue" }, 
        { key: "W", label: "Wed" }, { key: "TH", label: "Thu" }, { key: "F", label: "Fri" }, 
        { key: "SA", label: "Sat" }
    ];

    // Cria um Set de datas concluídas para busca rápida
    const completedDates = new Set(completions.map(c => {
        const dateStr = c.completedDate || c.completed_date;
        return new Date(dateStr).toISOString().split('T')[0]; // Formato YYYY-MM-DD
    }));


    // Itera sobre todos os dias no intervalo
    while (currentDate <= limitDate) {
        const dateStrIso = currentDate.toISOString().split("T")[0]; // YYYY-MM-DD
        const dateStrHeatMap = dateStrIso.replace(/-/g, '/'); // YYYY/MM/DD
        const dayOfWeek = currentDate.getDay(); // 0 (Sun) a 6 (Sat)
        const weekdayKey = WEEKDAYS[dayOfWeek].key;

        const completed = completedDates.has(dateStrIso);
        const inFrequency = safeFrequency.includes(weekdayKey);

        let count = 0;

        if (completed) {
            count = 2; // ✅ VERDE: Concluído
        } else if (inFrequency) {
            // Se não foi concluído, mas está na frequência:
            
            // Só mostramos o dia como AZUL (Agendado/Não Concluído)
            // se o dia já passou OU é hoje.
            if (currentDate <= today) {
                count = 1; // 🟦 AZUL: Agendado
            }
            // Se for futuro, count permanece 0, e a célula não é renderizada pelo HeatMap (ou fica Muted).
        }

        // Adiciona se houver um status de Agendado ou Concluído
        if (count > 0) {
            results.push({ date: dateStrHeatMap, count: count });
        }

        currentDate.setDate(currentDate.getDate() + 1);
        if (currentDate > today && !endDate) break; // Sai do loop se for sem end date definido e passou do dia atual
    }

    return results;
}

const HeatMapHabit: React.FC<HeatMapHabitProps> = ({
  habitColor,
  startDate,
  endDate,
  values,
  habitFrequency
}) => {
  const [selected, setSelected] = useState<string>("")
  
  // Usa a função de geração CORRIGIDA
  const heatMapValues = useMemo(() => {
    return generateHeatMapValues(startDate, endDate, values, habitFrequency);
  }, [startDate, endDate, values, habitFrequency]);

  // Normalização de datas (mantido)
  const normalizedStartDate = useMemo(() => {
    const d = new Date(startDate)
    d.setHours(0, 0, 0, 0)
    return d
  }, [startDate])

  const normalizedEndDate = useMemo(() => {
    if(endDate === null) {
      return undefined 
    }
    const d = new Date(endDate)
    d.setHours(23, 59, 59, 999)
    return d
  }, [endDate])


  return (
    <div className="overflow-x-auto w-full">
      <div className="min-w-180 pb-4">
        <HeatMap
          value={heatMapValues} 
          startDate={normalizedStartDate}
          endDate={normalizedEndDate} 
          width={720} 
          rectSize={12} 
          space={2} 
          style={{
            width: "100%",
            color: "hsl(var(--foreground))", 
          }}
          rectProps={{
            rx: 2, 
            ry: 2, 
          }}
          panelColors={{
            0: COLOR_NO_HABIT,      
            1: COLOR_SCHEDULED,     // Agendado (count=1) -> AZUL
            2: COLOR_COMPLETED,     // Concluído (count=2) -> VERDE
            3: COLOR_COMPLETED,     
            4: COLOR_COMPLETED,
          }}
          monthLabels={[
            "Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
          ]}
          weekLabels={["", "Mon", "", "Wed", "", "Fri", ""]}
          rectRender={(props, data) => {
            if (selected) {
              props.opacity = data.date === selected ? 1 : 0.4
            }

            return (
              <rect
                {...props}
                cursor="pointer"
                onClick={() =>
                  setSelected(data.date === selected ? "" : data.date)
                }
//                 title={`${data.date} - ${data.count === 2 ? 'Concluído' : data.count === 1 ? 'Agendado' : 'Sem Hábito/Fora do Prazo'}`}
              />
            )
          }}
        />
      </div>
      {/* --- Legendas --- */}
      <div className="flex justify-start gap-4 text-sm mt-3 flex-wrap">
        <div className="flex items-center space-x-1">
          <div className={`w-3 h-3 rounded-sm`} style={{ backgroundColor: COLOR_COMPLETED }} />
          <span>Concluído (Verde)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-3 h-3 rounded-sm`} style={{ backgroundColor: COLOR_SCHEDULED }} />
          <span>Agendado/Não Concluído (Azul)</span>
        </div>
        <div className="flex items-center space-x-1">
          <div className={`w-3 h-3 rounded-sm bg-muted`} style={{ backgroundColor: COLOR_NO_HABIT }} />
          <span>Sem Hábito/Fora da Frequência (Muted)</span>
        </div>
      </div>
    </div>
  )
}

export default HeatMapHabit