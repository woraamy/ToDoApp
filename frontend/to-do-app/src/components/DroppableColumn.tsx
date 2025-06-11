"use client"

import { useDroppable } from '@dnd-kit/core'
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import Image from "next/image"
import { type Status } from "@/types"

interface DroppableColumnProps {
  id: Status
  title: string
  icon: string
  color: string
  badgeColor: string
  count: number
  children: React.ReactNode
}

export default function DroppableColumn({
  id,
  title,
  icon,
  color,
  badgeColor,
  count,
  children
}: DroppableColumnProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
    data: {
      type: 'column',
      status: id,
    },
  })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "rounded-lg p-4 border min-h-[200px] transition-all duration-200",
        color,
        isOver && "ring-2 ring-blue-400 ring-opacity-50 bg-blue-50/50"
      )}
    >
      <h3 className={cn("text-lg font-semibold mb-4 flex items-center justify-between", 
        id === "To Do" ? "text-amber-800" :
        id === "In Progress" ? "text-blue-800" :
        "text-green-800"
      )}>
        <div className="flex items-center gap-2">
          <span>{title}</span>
          <Image
            alt={`${title} section kitty icon`}
            src={icon}
            width={35}
            height={35}
            className="inline-block"
          />
        </div>
        <Badge variant="outline" className={badgeColor}>
          {count}
        </Badge>
      </h3>
      <div className="space-y-4">
        {children}
        {count === 0 && (
          <p className="text-sm text-center text-gray-500 pt-4">
            No tasks here!
          </p>
        )}
      </div>
    </div>
  )
}