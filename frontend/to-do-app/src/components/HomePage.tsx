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
import TaskCard from "./TaskCard"

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

export default function TodoApp() {
  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [lists, setLists] = useState<List[]>([
    { id: "1", name: "Software Arch" },
    { id: "2", name: "Mobile Dev" },
  ])
  const [selectedList, setSelectedList] = useState<string | null>(null)
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isAddListOpen, setIsAddListOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)
  const [newTask, setNewTask] = useState({
    topic: "",
    description: "",
    listName: "",
  })
  const [newList, setNewList] = useState({
    name: "",
  })

  // Load initial data
  useEffect(() => {
    // Mock data - in a real app, this would come from an API or local storage
    const initialTasks: Task[] = [
      {
        id: "1",
        topic: "HW 1",
        description: "Description Description DescriptionDescription Description Description",
        createdAt: new Date("2025-05-12T12:23:00"),
        listName: "Software Arch",
        status: "To Do",
      },
      {
        id: "2",
        topic: "HW 2",
        description: "Description Description DescriptionDescription Description Description",
        createdAt: new Date("2025-05-12T12:23:00"),
        listName: "Mobile Dev",
        status: "In Progress",
      },
      {
        id: "3",
        topic: "HW 3",
        description: "Description Description DescriptionDescription Description Description",
        createdAt: new Date("2025-05-12T12:23:00"),
        listName: "Mobile Dev",
        status: "In Progress",
      },
      {
        id: "4",
        topic: "HW 1",
        description: "Description Description DescriptionDescription Description Description",
        createdAt: new Date("2025-05-12T12:23:00"),
        listName: "Software Arch",
        status: "Done",
      },
    ]
    setTasks(initialTasks)
  }, [])

  // Handlers
  const handleAddTask = () => {
    if (!newTask.topic.trim()) return

    const task: Task = {
      id: Date.now().toString(),
      topic: newTask.topic,
      description: newTask.description,
      createdAt: new Date(),
      listName: newTask.listName || null,
      status: "To Do",
    }

    setTasks([...tasks, task])
    setNewTask({ topic: "", description: "", listName: "" })
    setIsAddTaskOpen(false)
  }

  const handleAddList = () => {
    if (!newList.name.trim()) return

    const list: List = {
      id: Date.now().toString(),
      name: newList.name,
    }

    setLists([...lists, list])
    setNewList({ name: "" })
    setIsAddListOpen(false)
  }

  const handleDeleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const handleDeleteList = (listName: string) => {
    setLists(lists.filter((list) => list.name !== listName))
    // Also update tasks that were in this list
    setTasks(tasks.map((task) => (task.listName === listName ? { ...task, listName: null } : task)))
  }

  const handleEditTask = () => {
    if (!currentTask || !currentTask.topic.trim()) return

    setTasks(tasks.map((task) => (task.id === currentTask.id ? currentTask : task)))

    setCurrentTask(null)
    setIsEditTaskOpen(false)
  }

  const handleChangeStatus = (taskId: string, newStatus: Status) => {
    setTasks(tasks.map((task) => (task.id === taskId ? { ...task, status: newStatus } : task)))
  }

  const filteredTasks = selectedList ? tasks.filter((task) => task.listName === selectedList) : tasks

  const formatDate = (date: Date) => {
    return `${date.getHours()}:${date.getMinutes().toString().padStart(2, "0")} ${date.getHours() >= 12 ? "PM" : "AM"} ${date.getDate()}/${date.toLocaleString("default", { month: "short" })}/${date.getFullYear()}`
  }

  const getStatusColor = (status: Status) => {
    switch (status) {
      case "To Do":
        return "bg-amber-50"
      case "In Progress":
        return "bg-blue-50"
      case "Done":
        return "bg-green-50"
      default:
        return "bg-gray-50"
    }
  }

  const getStatusBadgeColor = (status: Status) => {
    switch (status) {
      case "To Do":
        return "bg-amber-100 text-amber-800"
      case "In Progress":
        return "bg-blue-100 text-blue-800"
      case "Done":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100"
    }
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <header className="bg-pink-100 p-4 flex items-center">
        <div className="w-8 h-8 mr-2">
          <img src="/placeholder.svg?height=32&width=32" alt="Hello Kitty Logo" className="w-full h-full" />
        </div>
        <h1 className="text-2xl font-bold">To Do List</h1>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className="w-64 border-r p-4 flex flex-col">
          <h2 className="text-xl font-semibold mb-2">You List(s)</h2>

          <Button
            variant="outline"
            className="mb-4 bg-gray-200 hover:bg-gray-300"
            onClick={() => setIsAddListOpen(true)}
          >
            Add new list
          </Button>

          <div className="space-y-2">
            <button
              className={cn(
                "w-full text-left p-2 rounded-md transition-colors",
                selectedList === null ? "bg-pink-200" : "hover:bg-gray-100",
              )}
              onClick={() => setSelectedList(null)}
            >
              All Tasks
            </button>

            <div className="border-t my-2"></div>

            {lists.map((list) => (
              <div key={list.id} className="flex items-center group">
                <button
                  className={cn(
                    "flex-1 text-left p-2 rounded-md transition-colors",
                    selectedList === list.name ? "bg-pink-200" : "hover:bg-gray-100",
                  )}
                  onClick={() => setSelectedList(list.name)}
                >
                  {list.name}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => handleDeleteList(list.name)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <div className="p-4 flex justify-between items-center">
            <h2 className="text-xl font-semibold">All Tasks</h2>
            <Button className="bg-gray-200 hover:bg-gray-300 text-black" onClick={() => setIsAddTaskOpen(true)}>
              Add New Task
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4">
            {/* To Do Column */}
            <div className={cn("rounded-lg p-4", getStatusColor("To Do"))}>
              <h3 className="text-xl font-semibold text-center mb-4">To Do</h3>
              <div className="space-y-4">
                {filteredTasks
                  .filter((task) => task.status === "To Do")
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={handleDeleteTask}
                      onEdit={() => {
                        setCurrentTask(task)
                        setIsEditTaskOpen(true)
                      }}
                      onChangeStatus={handleChangeStatus}
                      formatDate={formatDate}
                      getStatusBadgeColor={getStatusBadgeColor}
                    />
                  ))}
              </div>
            </div>

            {/* In Progress Column */}
            <div className={cn("rounded-lg p-4", getStatusColor("In Progress"))}>
              <h3 className="text-xl font-semibold text-center mb-4">In Progress</h3>
              <div className="space-y-4">
                {filteredTasks
                  .filter((task) => task.status === "In Progress")
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={handleDeleteTask}
                      onEdit={() => {
                        setCurrentTask(task)
                        setIsEditTaskOpen(true)
                      }}
                      onChangeStatus={handleChangeStatus}
                      formatDate={formatDate}
                      getStatusBadgeColor={getStatusBadgeColor}
                    />
                  ))}
              </div>
            </div>

            {/* Done Column */}
            <div className={cn("rounded-lg p-4", getStatusColor("Done"))}>
              <h3 className="text-xl font-semibold text-center mb-4">Done</h3>
              <div className="space-y-4">
                {filteredTasks
                  .filter((task) => task.status === "Done")
                  .map((task) => (
                    <TaskCard
                      key={task.id}
                      task={task}
                      onDelete={handleDeleteTask}
                      onEdit={() => {
                        setCurrentTask(task)
                        setIsEditTaskOpen(true)
                      }}
                      onChangeStatus={handleChangeStatus}
                      formatDate={formatDate}
                      getStatusBadgeColor={getStatusBadgeColor}
                    />
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={setIsAddTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="topic">Topic *</Label>
              <Input
                id="topic"
                value={newTask.topic}
                onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })}
                placeholder="Enter task topic"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={newTask.description}
                onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                placeholder="Enter task description"
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="list">List</Label>
              <Select value={newTask.listName} onValueChange={(value) => setNewTask({ ...newTask, listName: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a list" />
                </SelectTrigger>
                <SelectContent>
                  {lists.map((list) => (
                    <SelectItem key={list.id} value={list.name}>
                      {list.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddTaskOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddTask}>Add Task</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Add List Dialog */}
      <Dialog open={isAddListOpen} onOpenChange={setIsAddListOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New List</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="listName">List Name *</Label>
              <Input
                id="listName"
                value={newList.name}
                onChange={(e) => setNewList({ ...newList, name: e.target.value })}
                placeholder="Enter list name"
                required
              />
            </div>
            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={() => setIsAddListOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddList}>Add List</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditTaskOpen} onOpenChange={setIsEditTaskOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {currentTask && (
            <div className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="edit-topic">Topic *</Label>
                <Input
                  id="edit-topic"
                  value={currentTask.topic}
                  onChange={(e) => setCurrentTask({ ...currentTask, topic: e.target.value })}
                  placeholder="Enter task topic"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={currentTask.description}
                  onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                  placeholder="Enter task description"
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-list">List</Label>
                <Select
                  value={currentTask.listName || ""}
                  onValueChange={(value) => setCurrentTask({ ...currentTask, listName: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a list" />
                  </SelectTrigger>
                  <SelectContent>
                    {lists.map((list) => (
                      <SelectItem key={list.id} value={list.name}>
                        {list.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={currentTask.status}
                  onValueChange={(value: Status) => setCurrentTask({ ...currentTask, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline" onClick={() => setIsEditTaskOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleEditTask}>Save Changes</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
