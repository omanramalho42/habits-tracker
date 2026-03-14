import React from 'react'

import { Card } from '@/components/ui/card'

import type { Task } from '@prisma/client'
import { Button } from '../ui/button'
import { Check } from 'lucide-react'

interface ActiveTaskCardProps {
  task: Task
  selectedDate?: Date
}

const ActiveTaskCard = ({ task, selectedDate }: ActiveTaskCardProps) => {
  return (
    <Card className='flex flex-row justify-between items-center px-2'>
      <div className="flex flex-row gap-2">
        <p className='text-sm'>
          {task.emoji}
        </p>
        <p className='text-sm'>
          {task.name}
        </p>
      </div>
      
      <Button
        className='p-4 rounded-full'
        size="icon"
        variant="outline"
        type='button'
      >
        <Check className='w-2 h-2' />
      </Button>
    </Card>
  )
}

export default ActiveTaskCard