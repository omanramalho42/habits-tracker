"use client"

import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Cell } from "recharts"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"
import { ArrowUpRight } from "lucide-react"
import { parseLocaleNumber } from "@/lib/utils"

interface MetricChartProps {
  metrics: any[]
  taskColor?: string
  counterLabel?: string
  step: number
}

export function MetricChart({ metrics, taskColor, counterLabel, step }: MetricChartProps) {
  // Configuração de cor: usa a cor da task ou um fallback esmeralda (estilo wireframe)
  const primaryColor = taskColor || "hsl(var(--primary))"

  // Dentro do mapeamento do chartData no MetricChart
  const chartData = metrics.map((m) => ({
    name: m.field,
    atual: parseLocaleNumber(m.completion?.value), // Garante número para o gráfico
    meta: parseLocaleNumber(m.limit),
    unit: m.unit,
  }));

  // No cálculo do percentual do rodapé (estilo wireframe image_6b381d.png)
  const totalRealizado = chartData.reduce((acc, curr) => acc + curr.atual, 0);
  const totalMeta = chartData.reduce((acc, curr) => acc + curr.meta, 0);
  const percentual = totalMeta > 0 ? Math.round((totalRealizado / totalMeta) * 100) : 0;

  const unitLabel = metrics[0]?.unit || ""

  const chartConfig = {
    atual: {
      label: "Realizado",
      color: primaryColor,
    },
    meta: {
      label: "Meta Esperada",
      color: "hsl(var(--muted))",
    },
  } satisfies ChartConfig

  if (metrics.length === 0) return null

  return (
    <div className="mt-2 p-4 rounded-xl bg-green/40 border border-white/5 shadow-2xl">
      {/* HEADER ESTILO WIREFRAME */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
            Desempenho da Série
          </h4>
          <p className="text-sm font-semibold text-white">
            {counterLabel} - Passo {step}
          </p>
        </div>
        <div className="p-2 bg-white/5 rounded-lg">
           <div className="w-4 h-4 rounded-full border-2" style={{ borderColor: primaryColor }} />
        </div>
      </div>

      {/* GRÁFICO REDUZIDO */}
      <ChartContainer config={chartConfig} className="h-30 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart 
            data={chartData} 
            layout="vertical" // Layout vertical economiza espaço e facilita leitura de nomes longos
            margin={{ top: 0, right: 30, left: -10, bottom: 0 }}
          >
            <CartesianGrid horizontal={false} vertical={true} stroke="white" opacity={0.05} />
            <XAxis type="number" hide />
            <YAxis 
              dataKey="name" 
              type="category" 
              tickLine={false} 
              axisLine={false} 
              fontSize={10}
              width={70}
              tick={{ fill: 'rgba(255,255,255,0.5)' }}
            />
            <ChartTooltip content={<ChartTooltipContent hideLabel />} />
            
            {/* Barra de Meta (Fundo/Ghost) */}
            <Bar 
              dataKey="meta" 
              stackId="a" 
              fill="rgba(255,255,255,0.1)" 
              radius={[0, 4, 4, 0]} 
              barSize={12} 
            />
            
            {/* Barra de Realizado (Sobreposta/Colorida) */}
            <Bar 
              dataKey="atual" 
              stackId="b" 
              radius={[0, 4, 4, 0]} 
              barSize={12}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={primaryColor} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </ChartContainer>

      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-end">
        <div>
          <p className="text-[10px] text-muted-foreground mb-1">Volume Total</p>
          <div className="flex items-baseline gap-1">
            <span className="text-xl font-bold text-white">
              {totalRealizado.toLocaleString('pt-BR')} 
              <span className="text-xs ml-1 text-muted-foreground font-normal">{unitLabel}</span>
            </span>
            {totalRealizado > totalMeta && (
              <span className="text-[10px] text-emerald-500 font-medium">
                +{ (totalRealizado - totalMeta).toLocaleString('pt-BR') }
              </span>
            )}
          </div>
        </div>
        
        <div className="flex flex-col items-end">
          <div className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
            <ArrowUpRight className="w-4 h-4" />
            <span>{percentual}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground italic text-right font-medium">
             {step === 0 ? "Eficiência Diária" : `Eficiência do Passo ${step}`}
          </p>
        </div>
      </div>
    </div>
  )
}