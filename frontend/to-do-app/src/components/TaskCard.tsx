"use client"

import { useState, useEffect } from "react"
import { Pencil, Trash2, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

// Types
type Status = "To Do" | "In Progress" | "Done"
type Task = {
  id: string
  topic: string
  description: string
  createdAt: Date
  listName: string | null
  status: Status
  imageUrl?: string
}

type List = {
  id: string
  name: string
}


export default function TaskCard({
    task,
    onDelete,
    onEdit,
    onChangeStatus,
    formatDate,
    getStatusBadgeColor,
  }: {
    task: Task
    onDelete: (id: string) => void
    onEdit: () => void
    onChangeStatus: (id: string, status: Status) => void
    formatDate: (date: Date) => string
    getStatusBadgeColor: (status: Status) => string
  }) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 relative">
        <div className="flex justify-between items-start">
          <h4 className="font-semibold text-lg">{task.topic}</h4>
          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Badge className={getStatusBadgeColor(task.status)}>
                    {task.status} <ChevronDown className="ml-1 h-3 w-3" />
                  </Badge>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onChangeStatus(task.id, "To Do")}>To Do</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeStatus(task.id, "In Progress")}>In Progress</DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeStatus(task.id, "Done")}>Done</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
  
        <p className="text-sm text-gray-600 mt-2 line-clamp-3">{task.description}</p>
  
        <div className="mt-4 pt-2 border-t flex flex-col gap-1">
          {task.listName && (
            <div className="flex items-center text-xs">
              <span className="font-medium mr-1">List:</span>
              <Badge variant="outline" className="font-normal">
                {task.listName}
              </Badge>
            </div>
          )}
          <div className="flex items-center text-xs">
            <span className="font-medium mr-1">Created At:</span>
            <span className="text-gray-600">{formatDate(task.createdAt)}</span>
          </div>
        </div>
  
        <div className="absolute bottom-4 right-4 flex gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onDelete(task.id)}
            className="h-8 w-8 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }
  