"use client"

import { useState, useEffect, useCallback, useMemo, type FormEvent } from "react"
import Image from "next/image";
import axios , { type AxiosRequestConfig, type AxiosError, type InternalAxiosRequestConfig } from "axios";;
// Import Clerk hooks and components
import { useAuth, UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Trash2, Loader2, Plus, ListPlus, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import TaskCard from "@/components/TaskCard";
import { type Status, type List, type Task } from "@/types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5050/api";

// --- Component ---
export default function TodoApp() {
  const { getToken, isSignedIn, userId } = useAuth(); // Get token, signed-in status, and userId

  // State
  const [tasks, setTasks] = useState<Task[]>([])
  const [lists, setLists] = useState<List[]>([])
  const [selectedListId, setSelectedListId] = useState<string | null>(null) // null for 'All Tasks'
  const [isLoadingTasks, setIsLoadingTasks] = useState(false) // Start false until signed in
  const [isLoadingLists, setIsLoadingLists] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Dialog states
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false)
  const [isAddListOpen, setIsAddListOpen] = useState(false)
  const [isEditTaskOpen, setIsEditTaskOpen] = useState(false)
  const [currentTask, setCurrentTask] = useState<Task | null>(null)

  // Form states
  const [newTask, setNewTask] = useState({ topic: "", description: "", listId: "" })
  const [newList, setNewList] = useState({ name: "" })

  const apiClient = useMemo(() => {
    const client = axios.create({ baseURL: API_BASE_URL });

    client.interceptors.request.use(
      async (config: InternalAxiosRequestConfig): Promise<InternalAxiosRequestConfig> => {
        const token: string | null = await getToken();
        if (token) {
          config.headers = config.headers ?? {}; 
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError): Promise<AxiosError> => {
        console.error("Axios request error:", error);
        return Promise.reject(error);
      }
    );
    console.log("API Client created/memoized");
    return client;
  }, [getToken]);

      const fetchLists = useCallback(async () => {
        if (!isSignedIn) return; 
        console.log("CALLBACK: fetchLists running");
        setIsLoadingLists(true);
        setError(null);
        try {
            const response = await apiClient.get<List[]>('/lists');
            setLists(response.data);
        } catch (err: any) {
            console.error("Failed to fetch lists:", err);
            const errorMsg = axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : "Failed to fetch lists.";
            setError(errorMsg);
        } finally {
            setIsLoadingLists(false);
        }
    }, [isSignedIn, apiClient]); 
  
    const fetchTasks = useCallback(async (listIdToFetch: string | null) => { 
        if (!isSignedIn) return; 
        console.log(`CALLBACK: fetchTasks running for listId: ${listIdToFetch}`);
        setIsLoadingTasks(true);
        setError(null); 
        const params = new URLSearchParams();
          if (listIdToFetch === '') {
            params.append('listId', 'null');
        } else if (listIdToFetch) {
            params.append('listId', listIdToFetch);
        }
  
        try {
            const response = await apiClient.get<any[]>('/tasks', { params });
            const rawTasks = response.data;
            const formattedTasks: Task[] = rawTasks.map((task: any) => ({
                ...task,
                createdAt: new Date(task.createdAt),
                updatedAt: new Date(task.updatedAt),
            }));
            setTasks(formattedTasks);
        } catch (err: any) {
            console.error("Failed to fetch tasks:", err);
              const errorMsg = axios.isAxiosError(err) && err.response?.data?.error ? err.response.data.error : "Failed to fetch tasks.";
            setError(errorMsg);
            setTasks([]); 
        } finally {
            setIsLoadingTasks(false);
        }
    }, [isSignedIn, apiClient]);

    useEffect(() => {
        console.log("EFFECT 1: isSignedIn changed:", isSignedIn);
        if (isSignedIn) {
            setSelectedListId(null); 
            setError(null); 
            fetchLists(); 
        } else {
            setTasks([]);
            setLists([]);
            setSelectedListId(null);
            setError(null);
            setCurrentTask(null); 
            setIsAddTaskOpen(false);
            setIsAddListOpen(false);
            setIsEditTaskOpen(false);
        }
    }, [isSignedIn, fetchLists]);

    useEffect(() => {
      if (isSignedIn) {
            console.log(`EFFECT 2: Triggered by list change. Fetching tasks for listId: ${selectedListId}`);
            fetchTasks(selectedListId);
      }
    }, [selectedListId, isSignedIn, fetchTasks]); 

  const handleAddTask = async () => {
    if (!newTask.topic.trim()) { alert("Task topic is required."); return; }
    setError(null);
    try {
      const response = await apiClient.post('/tasks', {
        topic: newTask.topic.trim(),
        description: newTask.description.trim() || null,
        listId: newTask.listId || null,
      });
      setTasks(prevTasks => [response.data, ...prevTasks].sort((a,b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())); // Keep sorted
      setNewTask({ topic: "", description: "", listId: "" });
      setIsAddTaskOpen(false);
    } catch (err: any) {
      console.error("Failed to add task:", err);
      setError(err.response?.data?.error || "Failed to add task.");
    }
  };

  const handleAddList = async () => {
    if (!newList.name.trim()) { alert("List name is required."); return; }
     setError(null);
    try {
      const response = await apiClient.post('/lists', { name: newList.name.trim() });
      setLists(prevLists => [...prevLists, response.data].sort((a,b) => a.name.localeCompare(b.name))); // Keep sorted
      setNewList({ name: "" });
      setIsAddListOpen(false);
    } catch (err: any) {
      console.error("Failed to add list:", err);
      setError(err.response?.data?.error || "Failed to add list.");
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
     setError(null);
    try {
      await apiClient.delete(`/tasks/${id}`);
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (err: any) {
      console.error("Failed to delete task:", err);
      setError(err.response?.data?.error || "Failed to delete task.");
    }
  };

  const handleDeleteList = async (listId: string) => {
    const listToDelete = lists.find(l => l._id === listId);
    if (!listToDelete || !window.confirm(`Delete list "${listToDelete.name}"? Tasks will be unassigned.`)) return;
     setError(null);
    try {
      await apiClient.delete(`/lists/${listId}`);
      setLists(lists.filter((list) => list._id !== listId));
      setTasks(tasks.map((task) => (task.listId === listId ? { ...task, listId: null, listName: null } : task)));
      if (selectedListId === listId) {
        setSelectedListId(null);
      }
    } catch (err: any) {
      console.error("Failed to delete list:", err);
      setError(err.response?.data?.error || "Failed to delete list.");
    }
  };

  const handleEditTask = async () => {
    if (!currentTask || !currentTask.topic.trim()) { alert("Task topic cannot be empty."); return; }
     setError(null);
    try {
       const response = await apiClient.put(`/tasks/${currentTask._id}`, {
        topic: currentTask.topic.trim(),
        description: currentTask.description?.trim() || null,
        listId: currentTask.listId || null,
        status: currentTask.status,
      });
      setTasks(tasks.map((task) => (task._id === currentTask._id ? response.data : task)));
      setCurrentTask(null);
      setIsEditTaskOpen(false);
    } catch (err: any) {
      console.error("Failed to edit task:", err);
      setError(err.response?.data?.error || "Failed to edit task.");
    }
  };

  const handleChangeStatus = async (taskId: string, newStatus: Status) => {
    const originalTasks = [...tasks]; 
    setTasks(tasks.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task)));
    setError(null);
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
    } catch (err: any) {
      console.error("Failed to change status:", err);
      setError(err.response?.data?.error || "Failed to change task status.");
      setTasks(originalTasks);
    }
  };


  const formatDate = (date: Date): string => {
    if (!date) return "Invalid Date"; 
    try {
      return date.toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          day: 'numeric',
          month: 'short',
          year: 'numeric' 
      });
    } catch (e) {
        console.error("Date formatting error:", e);
        return "Invalid Date";
    }
};
  const getStatusColumnColor = (status: Status) => {
    switch (status) {
      case "To Do": return "bg-amber-50/80 border-amber-200";
      case "In Progress": return "bg-blue-50/80 border-blue-200";
      case "Done": return "bg-green-50/80 border-green-200";
      default: return "bg-gray-50/80 border-gray-200";
    }
  };
  const getStatusBadgeColor = (status: Status) => { 
    switch (status) {
      case "To Do": return "bg-amber-100 text-amber-800 border border-amber-300";
      case "In Progress": return "bg-blue-100 text-blue-800 border border-blue-300";
      case "Done": return "bg-green-100 text-green-800 border border-green-300";
      default: return "bg-gray-100 text-gray-800 border border-gray-300";
    }
  };

  // --- Render Logic ---
  const currentListName = selectedListId
    ? lists.find(l => l._id === selectedListId)?.name ?? "List Tasks"
    : "All Tasks";


  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3">
           {/* Replace with your logo/icon */}
           <Image
            alt="Kitty Logo"
            src="/kitty_logo.png" 
            width={50}           
            height={50}          
          />
           <h1 className="text-2xl font-bold text-gray-800 font-sans tracking-tight">My Task Manager</h1>
        </div>
         {/* Display Error Messages Globally */}
        {error && <Badge variant="destructive" className="mx-auto">{error}</Badge>}
        <div>
          <SignedIn>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
          <SignedOut>
            <SignInButton mode="modal">
              <Button variant="outline">
                <LogIn className="mr-2 h-4 w-4"/> Sign In
              </Button>
            </SignInButton>
          </SignedOut>
        </div>
      </header>

       {/* Content Area: Show based on SignedIn status */}
       <SignedIn>
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 border-r border-gray-200 bg-white/60 backdrop-blur-sm p-4 flex flex-col space-y-4">
                <h2 className="text-lg font-semibold text-gray-700 font-mono uppercase tracking-wider">Task Lists</h2>
                {isLoadingLists ? (
                    <div className="flex items-center justify-center text-gray-500"><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading Lists...</div>
                ) : (
                    <>
                     <Button variant="outline" className="w-full justify-start bg-pink-50 hover:bg-pink-100 border-pink-200 text-pink-700" onClick={() => {setIsAddListOpen(true); setError(null);}}>
                        <ListPlus className="mr-2 h-4 w-4" /> Add New List
                     </Button>
                        <nav className="flex-1 overflow-y-auto space-y-1 pr-1">
                            {/* "All Tasks" Button */}
                            <button
                                className={cn(
                                    "w-full text-left p-2 rounded-md transition-colors duration-150 ease-in-out text-gray-700 flex items-center group",
                                    selectedListId === null ? "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 font-semibold shadow-sm" : "hover:bg-gray-100",
                                )}
                                onClick={() => { setSelectedListId(null); fetchTasks(null); }}
                            >
                                <span className="flex-1">All Tasks</span>
                            </button>
                            {/* Optional: Add "Tasks without list" filter */}
                            <button
                                className={cn(
                                    "w-full text-left p-2 rounded-md transition-colors duration-150 ease-in-out text-gray-700 flex items-center group",
                                    selectedListId === '' ? "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 font-semibold shadow-sm" : "hover:bg-gray-100",
                                )}
                                onClick={() => { setSelectedListId(''); fetchTasks(''); }} // Use empty string for "no list" filter
                            >
                                <span className="flex-1">Tasks without list</span>
                            </button>

                            <div className="border-t my-2 border-gray-200"></div>
                            {/* Lists */}
                            {lists.length > 0 && lists.map((list) => (
                                <div key={list._id} className="flex items-center group relative">
                                    <button
                                        className={cn( "flex-1 text-left p-2 rounded-md transition-colors duration-150 ease-in-out text-gray-600", selectedListId === list._id ? "bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 font-semibold shadow-sm" : "hover:bg-gray-100")}
                                        onClick={() => { setSelectedListId(list._id); fetchTasks(list._id); }}
                                    >
                                    {list.name}
                                    </button>
                                    <Button variant="ghost" size="icon" className="h-7 w-7 absolute right-1 top-1/2 transform -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-600 hover:bg-red-100" onClick={(e) => { e.stopPropagation(); handleDeleteList(list._id); }}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {lists.length === 0 && <p className="text-sm text-gray-500 px-2">No lists yet.</p>}
                        </nav>
                    </>
                )}
                </aside>

                {/* Main Task Area */}
                <main className="flex-1 overflow-auto p-6">
                      <div className="flex justify-between items-center mb-6">
                          <h2 className="text-2xl font-semibold text-gray-800">{currentListName}</h2>
                          <Button className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow hover:shadow-md transition-all duration-150" onClick={() => {setIsAddTaskOpen(true); setError(null);}}>
                              <Plus className="mr-2 h-4 w-4" /> Add New Task
                          </Button>
                      </div>

                      {isLoadingTasks && (
                          <div className="flex items-center justify-center h-64 text-gray-500"><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Loading tasks...</div>
                      )}

                      {!isLoadingTasks && tasks.length > 0 && ( // Only show grid if tasks exist
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                              {/* To Do Column */}
                              <div className={cn("rounded-lg p-4 border min-h-[200px]", getStatusColumnColor("To Do"))}>
                                  {/* === ADDED HEADER === */}
                                  <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center justify-between">
                                      <span>To Do</span>
                                      <Badge variant="outline" className="border-amber-300 text-amber-800 bg-white/50">
                                          {tasks.filter(t => t.status === "To Do").length}
                                      </Badge>
                                  </h3>
                                  {/* === END HEADER === */}
                                  <div className="space-y-4">
                                      {tasks.filter(t => t.status === "To Do").map(task =>
                                          <TaskCard
                                              key={task._id}
                                              task={task}
                                              onDelete={handleDeleteTask}
                                              onEdit={() => { setCurrentTask(task); setIsEditTaskOpen(true); setError(null);}}
                                              onChangeStatus={handleChangeStatus}
                                              formatDate={formatDate}
                                              getStatusBadgeColor={getStatusBadgeColor}
                                          />
                                      )}
                                      {tasks.filter(t => t.status === "To Do").length === 0 && <p className="text-sm text-center text-gray-500 pt-4">No tasks here!</p>}
                                  </div>
                              </div>

                              {/* In Progress Column */}
                              <div className={cn("rounded-lg p-4 border min-h-[200px]", getStatusColumnColor("In Progress"))}>
                                  {/* === ADDED HEADER === */}
                                    <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center justify-between">
                                      <span>In Progress</span>
                                        {/* Optional: Count Badge */}
                                      <Badge variant="outline" className="border-blue-300 text-blue-800 bg-white/50">
                                          {tasks.filter(t => t.status === "In Progress").length}
                                      </Badge>
                                  </h3>
                                  {/* === END HEADER === */}
                                  <div className="space-y-4">
                                      {tasks.filter(t => t.status === "In Progress").map(task =>
                                          <TaskCard
                                              key={task._id}
                                              task={task}
                                              onDelete={handleDeleteTask}
                                              onEdit={() => { setCurrentTask(task); setIsEditTaskOpen(true); setError(null);}}
                                              onChangeStatus={handleChangeStatus}
                                              formatDate={formatDate}
                                              getStatusBadgeColor={getStatusBadgeColor}
                                          />
                                      )}
                                      {tasks.filter(t => t.status === "In Progress").length === 0 && <p className="text-sm text-center text-gray-500 pt-4">No tasks here!</p>}
                                  </div>
                              </div>

                              {/* Done Column */}
                              <div className={cn("rounded-lg p-4 border min-h-[200px]", getStatusColumnColor("Done"))}>
                                    {/* === ADDED HEADER === */}
                                  <h3 className="text-lg font-semibold text-green-800 mb-4 flex items-center justify-between">
                                      <span>Done</span>
                                        {/* Optional: Count Badge */}
                                      <Badge variant="outline" className="border-green-300 text-green-800 bg-white/50">
                                          {tasks.filter(t => t.status === "Done").length}
                                      </Badge>
                                  </h3>
                                    {/* === END HEADER === */}
                                  <div className="space-y-4">
                                      {tasks.filter(t => t.status === "Done").map(task =>
                                          <TaskCard
                                              key={task._id}
                                              task={task}
                                              onDelete={handleDeleteTask}
                                              onEdit={() => { setCurrentTask(task); setIsEditTaskOpen(true); setError(null);}}
                                              onChangeStatus={handleChangeStatus}
                                              formatDate={formatDate}
                                              getStatusBadgeColor={getStatusBadgeColor}
                                          />
                                      )}
                                      {tasks.filter(t => t.status === "Done").length === 0 && <p className="text-sm text-center text-gray-500 pt-4">No tasks here!</p>}
                                  </div>
                              </div>
                          </div>
                      )}

                      {/* Message for when there are NO tasks at all */}
                      {!isLoadingTasks && tasks.length === 0 && (
                          <div className="text-center text-gray-500 mt-10 bg-white/50 p-10 rounded-lg border border-gray-200">
                              <p className="text-lg font-medium">No tasks found{selectedListId === null ? "" : ` in "${currentListName}"`}.</p>
                              <p className="mt-2">Ready to add your first one?</p>
                              <Button variant="link" className="mt-2 text-pink-600" onClick={() => {setIsAddTaskOpen(true); setError(null);}}>Add a task!</Button>
                          </div>
                      )}
                  </main>
            </div>
        </SignedIn>

        {/* Show Sign in prompt when signed out */}
        <SignedOut>
            <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
                <h2 className="text-2xl font-semibold text-gray-700 mb-4">Welcome to your Task Manager!</h2>
                <p className="text-gray-500 mb-6">Please sign in to manage your tasks and lists.</p>
                <SignInButton mode="modal">
                    <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white shadow hover:shadow-md">
                        <LogIn className="mr-2 h-5 w-5"/> Sign In
                    </Button>
                </SignInButton>
            </div>
        </SignedOut>


      {/* Add Task Dialog */}
      <Dialog open={isAddTaskOpen} onOpenChange={(isOpen) => { setIsAddTaskOpen(isOpen); if (!isOpen) setError(null); }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Add New Task</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
             {/* Topic */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="topic" className="text-right">Topic *</Label>
                <Input id="topic" value={newTask.topic} onChange={(e) => setNewTask({ ...newTask, topic: e.target.value })} placeholder="What needs to be done?" className="col-span-3" required/>
              </div>
              {/* Description */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">Description</Label>
                <Textarea id="description" value={newTask.description} onChange={(e) => setNewTask({ ...newTask, description: e.target.value })} placeholder="Add more details (optional)" className="col-span-3 min-h-[80px]" rows={3}/>
              </div>
              {/* List */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="list" className="text-right">List</Label>
                <Select value={newTask.listId} onValueChange={(value) => setNewTask({ ...newTask, listId: value })}>
                    <SelectTrigger className="col-span-3"><SelectValue placeholder="Assign to a list (optional)" /></SelectTrigger>
                    <SelectContent>
                       <SelectItem value="No List">- No List -</SelectItem>
                       {lists.map((list) => <SelectItem key={list._id} value={list._id}>{list.name}</SelectItem>)}
                    </SelectContent>
                </Select>
              </div>
          </div>
          <DialogFooter>
            {error && <p className="text-sm text-red-600 mr-auto">{error}</p>}
            <DialogClose asChild><Button variant="outline" onClick={() => setError(null)}>Cancel</Button></DialogClose>
            <Button onClick={handleAddTask} className="bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white">Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add List Dialog */}
       <Dialog open={isAddListOpen} onOpenChange={(isOpen) => { setIsAddListOpen(isOpen); if (!isOpen) setError(null); }}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Add New List</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
             <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="listName" className="text-right">Name *</Label>
                <Input id="listName" value={newList.name} onChange={(e) => setNewList({ ...newList, name: e.target.value })} placeholder="e.g., Work, Personal" className="col-span-3" required/>
             </div>
          </div>
           <DialogFooter>
             {error && <p className="text-sm text-red-600 mr-auto">{error}</p>}
            <DialogClose asChild><Button variant="outline" onClick={() => setError(null)}>Cancel</Button></DialogClose>
            <Button onClick={handleAddList} className="bg-pink-500 hover:bg-pink-600 text-white">Add List</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
       <Dialog open={isEditTaskOpen} onOpenChange={(isOpen) => { setIsEditTaskOpen(isOpen); if (!isOpen) {setCurrentTask(null); setError(null);} }}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader><DialogTitle>Edit Task</DialogTitle></DialogHeader>
          {currentTask && (
            <div className="grid gap-4 py-4">
                 {/* Topic */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-topic" className="text-right">Topic *</Label>
                <Input id="edit-topic" value={currentTask.topic} onChange={(e) => setCurrentTask({ ...currentTask, topic: e.target.value })} placeholder="What needs to be done?" className="col-span-3" required/>
              </div>
              {/* Description */}
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="edit-description" className="text-right pt-2">Description</Label>
                <Textarea id="edit-description" value={currentTask.description ?? ""} onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value || null })} placeholder="Add more details (optional)" className="col-span-3 min-h-[80px]" rows={3}/>
              </div>
               {/* List */}
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-list" className="text-right">List</Label>
                <Select value={currentTask.listId ?? ""} onValueChange={(value) => setCurrentTask({ ...currentTask, listId: value || null })}>
                  <SelectTrigger className="col-span-3"><SelectValue placeholder="Assign to a list (optional)" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="No List">- No List -</SelectItem>
                    {lists.map((list) => <SelectItem key={list._id} value={list._id}>{list.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {/* Status */}
               <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-status" className="text-right">Status</Label>
                <Select value={currentTask.status} onValueChange={(value: Status) => setCurrentTask({ ...currentTask, status: value })}>
                  <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="To Do">To Do</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
             {error && <p className="text-sm text-red-600 mr-auto">{error}</p>}
             <DialogClose asChild><Button variant="outline" onClick={() => setError(null)}>Cancel</Button></DialogClose>
            <Button onClick={handleEditTask} className="bg-purple-500 hover:bg-purple-600 text-white">Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </div>
  )
}