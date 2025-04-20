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

// Types - Should match the type definition used in TodoApp where TaskCard is called
type Status = "To Do" | "In Progress" | "Done";

// Update Task type to use _id and match TodoApp's structure
type Task = {
  _id: string; // Changed from id
  topic: string;
  description: string | null; // Allow null description
  createdAt: Date; // Expect Date object
  updatedAt: Date; // Expect Date object
  listId: string | null;
  listName: string | null; // Keep for display
  status: Status;
  userId: string;
  // imageUrl?: string; // Keep if used
};

// List type (if needed internally, otherwise remove)
// type List = {
//   id: string // or _id if consistent
//   name: string
// }


export default function TaskCard({
    task,
    onDelete,
    onEdit,
    onChangeStatus,
    formatDate, // Expects (date: Date) => string
    getStatusBadgeColor,
  }: {
    task: Task;
    onDelete: (id: string) => void;
    onEdit: () => void;
    onChangeStatus: (id: string, status: Status) => void; // ID here is _id
    formatDate: (date: Date) => string;
    getStatusBadgeColor: (status: Status) => string;
  }) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-4 relative transition-shadow hover:shadow-md">
        <div className="flex justify-between items-start mb-2"> {/* Added margin-bottom */}
          <h4 className="font-semibold text-md text-gray-800">{task.topic}</h4> {/* Adjusted size/color */}
           {/* Status Dropdown */}
           {/* Consider moving status change to the Edit dialog for consistency? Or keep dropdown */}
           <DropdownMenu>
              <DropdownMenuTrigger asChild>
                 {/* Use Badge directly inside trigger for better click area */}
                <Button variant="ghost" size="sm" className={cn("h-auto px-2 py-0.5", getStatusBadgeColor(task.status))}>
                    {task.status} <ChevronDown className="ml-1 h-3 w-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Use task._id for actions */}
                <DropdownMenuItem disabled={task.status === 'To Do'} onClick={() => onChangeStatus(task._id, "To Do")}>To Do</DropdownMenuItem>
                <DropdownMenuItem disabled={task.status === 'In Progress'} onClick={() => onChangeStatus(task._id, "In Progress")}>In Progress</DropdownMenuItem>
                <DropdownMenuItem disabled={task.status === 'Done'} onClick={() => onChangeStatus(task._id, "Done")}>Done</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
        </div>

        {/* Ensure description is displayed even if null/empty */}
        <p className="text-sm text-gray-600 mt-1 mb-4 line-clamp-3 min-h-[20px]"> {/* Added min-height and margin */}
            {task.description || <span className="italic text-gray-400">No description</span>}
        </p>

        {/* Footer section for metadata and actions */}
        <div className="mt-2 pt-2 border-t flex justify-between items-end">
             {/* Metadata */}
            <div className="flex flex-col gap-1 text-xs">
                {task.listName && (
                    <div className="flex items-center">
                    <span className="font-medium mr-1 text-gray-500">List:</span>
                    <Badge variant="secondary" className="font-normal px-1.5 py-0.5 text-xs"> {/* Adjusted Badge style */}
                        {task.listName}
                    </Badge>
                    </div>
                )}
                <div className="flex items-center">
                    <span className="font-medium mr-1 text-gray-500">Created:</span>
                    {/* Pass the Date object directly */}
                    <span className="text-gray-500">{formatDate(task.createdAt)}</span>
                </div>
                {/* Optional: Show Updated At
                <div className="flex items-center">
                    <span className="font-medium mr-1 text-gray-500">Updated:</span>
                    <span className="text-gray-500">{formatDate(task.updatedAt)}</span>
                </div>
                 */}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={onEdit} className="h-7 w-7 text-gray-500 hover:text-blue-600 hover:bg-blue-50">
                    <Pencil className="h-4 w-4" />
                    <span className="sr-only">Edit Task</span>
                </Button>
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(task._id)} // Use task._id
                    className="h-7 w-7 text-gray-500 hover:text-red-600 hover:bg-red-50"
                >
                    <Trash2 className="h-4 w-4" />
                     <span className="sr-only">Delete Task</span>
                </Button>
            </div>
        </div>
      </div>
    )
  }