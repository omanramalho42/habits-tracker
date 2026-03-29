import React from 'react'

import { RadarChart } from 'recharts'

import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card'

import ChartAreaInteractive from '@/components/charts/chart-area'
import ChartBarInteractive from '@/components/charts/bar-chart'
import ChartPieLabel from '@/components/charts/pie-chart'
import ChartRadarDots from '@/components/charts/radar-chart'
import ChartRadialGrid from '@/components/charts/radial-chart'

import type {
  Categories,
  Counter,
  Goals,
  Task,
  TaskCompletion,
  TaskMetric,
  TaskSchedule,
} from '@prisma/client'

import {
  AreaChart,
  BarChart,
  PieChart,
  Radical
} from 'lucide-react'

interface MultiGraphsChartProps {
  tasks: (Task & {
    completions?: TaskCompletion[],
    schedules?: TaskSchedule[],
    counter?: Counter,
    metrics?: TaskMetric[],
    goals?: Goals[]
    categories?: Categories[]
  })[]
}

const MultiGraphsChart:React.FC<MultiGraphsChartProps> = ({
  tasks
}) => {
  return (
    <Tabs defaultValue='area'>
      <TabsList className='w-full bg-card'>
        <TabsTrigger value='area'>
          <div className='flex flex-row items-center gap-2'>
            <AreaChart className='w-4 h-4' />
            <p className='text-sm font-bold tracking-tighter truncate'>
              Area
            </p>
          </div>
        </TabsTrigger>

        <TabsTrigger value='bar'>
          <div className='flex flex-row items-center gap-2'>
            <BarChart className='w-4 h-4' />
            <p className='text-sm font-bold tracking-tighter truncate'>
              Bar
            </p>
          </div>
        </TabsTrigger>

        <TabsTrigger value='pie'>
          <div className='flex flex-row items-center gap-2'>
            <PieChart className='w-4 h-4' />
            <p className='text-sm font-bold tracking-tighter truncate'>
              Pie
            </p>
          </div>
        </TabsTrigger>

        <TabsTrigger value='radar'>
          <div className='flex flex-row items-center gap-2'>
            <RadarChart className='w-4 h-4' />
            <p className='text-sm font-bold tracking-tighter truncate'>
              Radar
            </p>
          </div>
        </TabsTrigger>

        <TabsTrigger value='radial'>
          <div className='flex flex-row items-center gap-2'>
            <Radical className='w-4 h-4' />
            <p className='text-sm font-bold tracking-tighter truncate'>
              Radial
            </p>
          </div>
        </TabsTrigger>
      </TabsList>

      <TabsContent value='area'>
        <Card>
          <CardHeader>
            <CardTitle>Evolução das Tarefas</CardTitle>
            <CardDescription>
              Acompanhe o progresso das suas tarefas ao longo do tempo. 
              Visualize padrões, consistência e evolução da sua produtividade diária.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartAreaInteractive
              tasks={tasks}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='bar'>
        <Card>
          <CardHeader>
            <CardTitle>Comparativo de Tarefas</CardTitle>
            <CardDescription>
              Compare o desempenho entre suas tarefas. 
              Identifique quais atividades recebem mais foco e quais precisam de atenção.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartBarInteractive
              tasks={tasks}
            />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='pie'>
        <Card>
          <CardHeader>
            <CardTitle>Distribuição por Categorias e Objetivos</CardTitle>
            <CardDescription>
              Entenda como suas tarefas estão distribuídas entre categorias e objetivos. 
              Tenha uma visão clara do seu foco atual.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartPieLabel tasks={tasks} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='radar'>
        <Card>
          <CardHeader>
            <CardTitle>Equilíbrio de Categorias e Objetivos</CardTitle>
            <CardDescription>
              Visualize o equilíbrio entre diferentes áreas da sua vida. 
              Identifique excessos ou falta de atenção em determinados objetivos.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartRadarDots tasks={tasks} />
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value='radial'>
        <Card>
          <CardHeader>
            <CardTitle>Performance Geral</CardTitle>
            <CardDescription>
              Tenha uma visão consolidada do seu desempenho. 
              Acompanhe métricas-chave e seu progresso geral.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartRadialGrid tasks={tasks} />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}

export default MultiGraphsChart