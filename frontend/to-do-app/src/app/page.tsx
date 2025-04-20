// "use client"

// import { useState, useEffect, type FormEvent } from "react"
// import { useAuth, UserButton, useUser } from "@clerk/nextjs"
// import { CheckCircle, Circle, Clock, Plus, Trash2 } from "lucide-react"

// interface Todo {
//   _id: string
//   text: string
//   status: "Pending" | "In Progress" | "Done"
//   userId: string
//   createdAt: string
//   updatedAt: string
// }

// // Helper function to render a single todo item (reusable)
// function TodoItem({
//   todo,
//   getStatusInfo,
//   onUpdateStatus,
//   onDeleteTodo,
//   isLastItem, // To handle bottom border
// }: {
//   todo: Todo
//   getStatusInfo: (status: Todo["status"]) => any // Replace 'any' with a more specific type if possible
//   onUpdateStatus: (id: string, newStatus: Todo["status"]) => void
//   onDeleteTodo: (id: string) => void
//   isLastItem: boolean
// }) {
//   const statusInfo = getStatusInfo(todo.status)
//   return (
//     <li
//       className={`p-4 flex flex-col @md:flex-row justify-between items-start @md:items-center gap-3 ${statusInfo.bgColor} ${
//         isLastItem ? "" : "border-b border-sky-100" // Apply border except for the last item in its section
//       } transition-all duration-200 hover:bg-opacity-70`}
//     >
//       <div className="flex items-center gap-3 flex-grow mr-4">
//         {statusInfo.icon}
//         <span
//           className={`${todo.status === "Done" ? "line-through text-gray-400" : statusInfo.textColor} text-pretty`} // Adjusted Done text color
//         >
//           {todo.text}
//         </span>
//       </div>
//       <div className="flex items-center gap-3 w-full @md:w-auto">
//         {/* Status Dropdown */}
//         <select
//           value={todo.status}
//           onChange={(e) => onUpdateStatus(todo._id, e.target.value as Todo["status"])}
//           className={`p-2 border rounded-lg text-sm ${statusInfo.borderColor} ${statusInfo.textColor} bg-white/80 focus:ring-2 focus:ring-sky-300 focus:outline-none transition-all duration-200 flex-1 @md:flex-none`}
//           // No need to disable, moving Done items visually separates them
//           // disabled={todo.status === "Done"}
//         >
//           <option value="Pending">Pending</option>
//           <option value="In Progress">In Progress</option>
//           <option value="Done">Done</option>
//         </select>
//         {/* Delete Button */}
//         <button
//           onClick={() => onDeleteTodo(todo._id)}
//           className="text-pink-500 hover:text-pink-700 text-sm font-medium p-2 rounded-lg hover:bg-pink-50 transition-all duration-200"
//           aria-label={`Delete todo: ${todo.text}`}
//         >
//           <Trash2 className="size-5" />
//         </button>
//       </div>
//     </li>
//   )
// }


// export default function HomePage() {
//   const [todos, setTodos] = useState<Todo[]>([])
//   const [newTodoText, setNewTodoText] = useState("")
//   const [isLoading, setIsLoading] = useState(true)
//   const [error, setError] = useState<string | null>(null)
//   const { getToken } = useAuth() // Hook to get the auth token
//   const { user } = useUser() // Hook to get user info

//   const API_URL = process.env.NEXT_PUBLIC_API_URL

//   // --- Fetch Todos ---
//   const fetchTodos = async () => {
//     setIsLoading(true)
//     setError(null)
//     try {
//       const token = await getToken() // Get JWT token from Clerk
//       if (!token) {
//         throw new Error("Authentication token not available.")
//       }

//       const response = await fetch(`${API_URL}/todos`, {
//         headers: {
//           Authorization: `Bearer ${token}`, // Send token to backend
//         },
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || `Error fetching todos: ${response.statusText}`)
//       }
//       const data: Todo[] = await response.json()
//       // Sort todos initially if desired (e.g., Pending/In Progress first, then Done)
//       // data.sort((a, b) => (a.status === 'Done' ? 1 : -1) - (b.status === 'Done' ? 1 : -1));
//       setTodos(data)
//     } catch (err: any) {
//       console.error("Fetch error:", err)
//       setError(err.message || "Failed to fetch todos.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   // --- Add Todo ---
//   const handleAddTodo = async (e: FormEvent) => {
//     e.preventDefault()
//     if (!newTodoText.trim()) return
//     setError(null)

//     try {
//       const token = await getToken()
//       if (!token) {
//         throw new Error("Authentication token not available.")
//       }

//       console.log("Adding todo via API:", API_URL)
//       const response = await fetch(`${API_URL}/todos`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ text: newTodoText }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || `Error adding todo: ${response.statusText}`)
//       }

//       const newTodo: Todo = await response.json()
//       // Add new todo to the beginning of the list (it will be Pending)
//       setTodos([newTodo, ...todos])
//       setNewTodoText("") // Clear input field
//     } catch (err: any) {
//       console.error("Add error:", err)
//       setError(err.message || "Failed to add todo.")
//     }
//   }

//   // --- Update Todo Status ---
//   const handleUpdateStatus = async (id: string, newStatus: Todo["status"]) => {
//     setError(null)

//     try {
//       const token = await getToken()
//       if (!token) {
//         throw new Error("Authentication token not available.")
//       }

//       const response = await fetch(`${API_URL}/todos/${id}`, {
//         method: "PUT",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify({ status: newStatus }),
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || `Error updating todo: ${response.statusText}`)
//       }

//       const updatedTodo: Todo = await response.json()
//       // Update the todo in the local state based on server response
//       setTodos(currentTodos =>
//          currentTodos.map((todo) => (todo._id === id ? updatedTodo : todo))
//       )
//     } catch (err: any) {
//       console.error("Update error:", err)
//       setError(err.message || "Failed to update todo status.")
//       // Rollback optimistic update if it failed (optional)
//       // if (originalStatus) {
//       //   setTodos(currentTodos =>
//       //     currentTodos.map(todo =>
//       //       todo._id === id ? { ...todo, status: originalStatus } : todo
//       //     )
//       //   );
//       // }
//     }
//   }

//   // --- Delete Todo ---
//   const handleDeleteTodo = async (id: string) => {
//     setError(null)
//     if (!confirm("Are you sure you want to delete this todo?")) return // Confirmation dialog

//     try {
//       const token = await getToken()
//       if (!token) {
//         throw new Error("Authentication token not available.")
//       }

//       const response = await fetch(`${API_URL}/todos/${id}`, {
//         method: "DELETE",
//         headers: {
//           Authorization: `Bearer ${token}`,
//         },
//       })

//       if (!response.ok) {
//         const errorData = await response.json()
//         throw new Error(errorData.error || `Error deleting todo: ${response.statusText}`)
//       }

//       // Remove the todo from the local state
//       setTodos(todos.filter((todo) => todo._id !== id))
//     } catch (err: any) {
//       console.error("Delete error:", err)
//       setError(err.message || "Failed to delete todo.")
//     }
//   }

//   useEffect(() => {
//     if (user) {
//       fetchTodos()
//     }
//   }, [user]) 

//   const getStatusInfo = (status: Todo["status"]) => {
//     switch (status) {
//       case "Done":
//         return {
//           icon: <CheckCircle className="size-5 text-teal-500" />,
//           bgColor: "bg-teal-50/50", // Slightly more subtle background for done
//           borderColor: "border-teal-200",
//           textColor: "text-teal-700",
//         }
//       case "In Progress":
//         return {
//           icon: <Clock className="size-5 text-purple-500" />,
//           bgColor: "bg-purple-50",
//           borderColor: "border-purple-200",
//           textColor: "text-purple-700",
//         }
//       default: // Pending
//         return {
//           icon: <Circle className="size-5 text-blue-400" />,
//           bgColor: "bg-blue-50",
//           borderColor: "border-blue-100",
//           textColor: "text-blue-700",
//         }
//     }
//   }

//   // --- Filtering Logic ---
//   const activeTodos = todos.filter(todo => todo.status !== 'Done');
//   const doneTodos = todos.filter(todo => todo.status === 'Done');

//   return (
//     <div className="min-h-dvh bg-gradient-to-br from-sky-50 to-violet-50">
//       <div className="container mx-auto px-4 py-6 max-w-2xl">
//         <header className="flex justify-between items-center mb-8 pb-4 border-b border-violet-200">
//           {/* Header content... */}
//            <div className="flex items-center gap-3">
//             <div className="bg-gradient-to-r from-sky-400 to-violet-400 p-2 rounded-lg shadow-sm">
//               <h1 className="text-3xl font-bold text-white text-balance">My Tasks</h1>
//             </div>
//           </div>
//           <div>
//             <UserButton afterSignOutUrl="/sign-in" />
//           </div>
//         </header>

//         {/* Add Todo Form */}
//         <form onSubmit={handleAddTodo} className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-sky-100">
//            {/* Form content... */}
//            <div className="flex gap-2">
//             <input
//               type="text"
//               value={newTodoText}
//               onChange={(e) => setNewTodoText(e.target.value)}
//               placeholder="What needs to be done?"
//               className="flex-grow p-3 border border-sky-200 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-300 focus:outline-none transition-all duration-200"
//               aria-label="New todo text"
//             />
//             <button
//               type="submit"
//               className="bg-gradient-to-r from-sky-400 to-violet-400 hover:from-sky-500 hover:to-violet-500 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
//               disabled={!newTodoText.trim()} // Disable button if input is empty
//             >
//               <Plus className="size-5" /> Add
//             </button>
//           </div>
//         </form>

//         {/* Loading State */}
//         {isLoading && (
//            <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-sky-100">
//             {/* Loading content... */}
//              <div
//                 className="size-3 rounded-full bg-sky-300 animate-[bounce_1s_infinite]"
//                 style={{ animationDelay: "0ms" }}
//               ></div>
//               <div
//                 className="size-3 rounded-full bg-violet-300 animate-[bounce_1s_infinite]"
//                 style={{ animationDelay: "150ms" }}
//               ></div>
//               <div
//                 className="size-3 rounded-full bg-pink-300 animate-[bounce_1s_infinite]"
//                 style={{ animationDelay: "300ms" }}
//               ></div>
//             <p className="text-violet-500 font-medium">Loading your tasks...</p>
//           </div>
//         )}

//         {/* Error Display */}
//         {error && (
//            <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl mb-6 border border-red-200 shadow-sm">
//              {/* Error content... */}
//              <p className="font-medium">{error}</p>
//              <p className="text-sm mt-1 text-red-500">Please try again</p>
//           </div>
//         )}

//         {/* Todo List Area */}
//         {!isLoading && !error && (
//           <div className="space-y-4">
//             {/* Show message only if BOTH lists are empty */}
//             {activeTodos.length === 0 && doneTodos.length === 0 ? (
//               <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-sky-100">
//                  {/* Empty list content... */}
//                  <div className="size-16 mx-auto mb-4 rounded-full bg-sky-100 flex items-center justify-center">
//                   <CheckCircle className="size-8 text-sky-400" />
//                  </div>
//                  <p className="text-violet-500 font-medium">Your task list is empty</p>
//                  <p className="text-sky-400 text-sm mt-1">Add your first task above</p>
//               </div>
//             ) : (
//               <div className="@container space-y-6"> {/* Add space between sections */}
//                 {/* Active Todos Section */}
//                 {activeTodos.length > 0 && (
//                   <div className="bg-white rounded-xl shadow-sm border border-sky-100 overflow-hidden">
//                     <ul>
//                       {activeTodos.map((todo, index) => (
//                         <TodoItem
//                           key={todo._id}
//                           todo={todo}
//                           getStatusInfo={getStatusInfo}
//                           onUpdateStatus={handleUpdateStatus}
//                           onDeleteTodo={handleDeleteTodo}
//                           isLastItem={index === activeTodos.length - 1}
//                         />
//                       ))}
//                     </ul>
//                   </div>
//                 )}

//                 {/* Separator Line */}
//                 {activeTodos.length > 0 && doneTodos.length > 0 && (
//                   <hr className="border-t border-violet-200 my-4" /> // Added margin top/bottom
//                 )}

//                 {/* Done Todos Section */}
//                 {doneTodos.length > 0 && (
//                   <div> {/* Wrapper div for heading + list */}
//                     <h2 className="text-lg font-semibold text-violet-500 mb-3">
//                        Completed Tasks ({doneTodos.length})
//                     </h2>
//                     <div className="bg-white/70 rounded-xl shadow-sm border border-sky-100/50 overflow-hidden"> {/* Slightly different style for done section */}
//                        <ul>
//                          {doneTodos.map((todo, index) => (
//                           <TodoItem
//                              key={todo._id}
//                              todo={todo}
//                              getStatusInfo={getStatusInfo}
//                              onUpdateStatus={handleUpdateStatus}
//                              onDeleteTodo={handleDeleteTodo}
//                              isLastItem={index === doneTodos.length - 1}
//                            />
//                          ))}
//                        </ul>
//                     </div>
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         )}

//         {/* Footer */}
//         <footer className="mt-8 text-center text-violet-400 text-sm">
//            {/* Footer content... */}
//            <p>Organize your day with ease</p>
//         </footer>
//       </div>
//     </div>
//   )
// }

"use client"

import { useState, useEffect, useCallback, useMemo, type FormEvent } from "react"
import axios , { type AxiosRequestConfig, type AxiosError, type InternalAxiosRequestConfig } from "axios";;
// Import Clerk hooks and components
import { useAuth, UserButton, SignedIn, SignedOut, SignInButton } from "@clerk/nextjs"
import { Pencil, Trash2, Loader2, Plus, ListPlus, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
        // getToken might be null initially or if not signed in
        const token: string | null = await getToken();
        if (token) {
          config.headers = config.headers ?? {}; // Ensure headers object exists
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error: AxiosError): Promise<AxiosError> => {
        console.error("Axios request error:", error);
        return Promise.reject(error);
      }
    );
    console.log("API Client created/memoized"); // Add log for debugging
    return client;
    // Add getToken to dependency array IF getToken itself isn't stable
    // If useAuth guarantees getToken is stable, [] is fine.
    // If getToken *might* change identity (e.g., if useAuth re-renders), include it.
    // For Clerk, getToken is generally stable, so [] might be okay, but adding it is safer.
  }, [getToken]);


      // --- API Fetching Functions (Keep useCallback) ---
      const fetchLists = useCallback(async () => {
        if (!isSignedIn) return; // Guard against running when signed out
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
    }, [isSignedIn, apiClient]); // Depends on sign-in status and stable apiClient

  
    const fetchTasks = useCallback(async (listIdToFetch: string | null) => { // Accept listId explicitly
        if (!isSignedIn) return; // Guard
        console.log(`CALLBACK: fetchTasks running for listId: ${listIdToFetch}`);
        setIsLoadingTasks(true);
        setError(null); // Clear previous task errors
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
            setTasks([]); // Clear tasks on error
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
      // Add task optimistically or based on response
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
      // Remove list from state
      setLists(lists.filter((list) => list._id !== listId));
      // Update tasks locally that were in this list
      setTasks(tasks.map((task) => (task.listId === listId ? { ...task, listId: null, listName: null } : task)));
      // If the deleted list was selected, switch back to 'All Tasks'
      if (selectedListId === listId) {
        setSelectedListId(null);
        // Refetch tasks for 'All Tasks' view might be needed if local update isn't sufficient
        // await fetchTasks(null);
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
    const originalTasks = [...tasks]; // For rollback
    // Optimistic Update
    setTasks(tasks.map((task) => (task._id === taskId ? { ...task, status: newStatus } : task)));
    setError(null);
    try {
      await apiClient.patch(`/tasks/${taskId}/status`, { status: newStatus });
      // If successful, state is already updated optimistically
    } catch (err: any) {
      console.error("Failed to change status:", err);
      setError(err.response?.data?.error || "Failed to change task status.");
      setTasks(originalTasks); // Rollback on error
    }
  };


  const formatDate = (date: Date): string => {
    if (!date) return "Invalid Date"; // Check if date is valid
    try {
      // Use the Date object directly
      return date.toLocaleString('en-US', {
          hour: 'numeric',
          minute: '2-digit',
          hour12: true,
          day: 'numeric',
          month: 'short',
          // year: 'numeric' // Optional: include year if needed
      });
    } catch (e) {
        console.error("Date formatting error:", e);
        return "Invalid Date";
    }
};
  const getStatusColumnColor = (status: Status) => { /* ... keep implementation ... */
    switch (status) {
      case "To Do": return "bg-amber-50/80 border-amber-200";
      case "In Progress": return "bg-blue-50/80 border-blue-200";
      case "Done": return "bg-green-50/80 border-green-200";
      default: return "bg-gray-50/80 border-gray-200";
    }
  };
  const getStatusBadgeColor = (status: Status) => { /* ... keep implementation ... */
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
    // Apply base font and background
    <div className="flex flex-col h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50 font-sans">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm p-4 flex items-center justify-between border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3">
           {/* Replace with your logo/icon */}
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-pink-500">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
           </svg>
           <h1 className="text-2xl font-bold text-gray-800 font-serif tracking-tight">My Task Manager</h1>
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

                    {!isLoadingTasks && (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                {/* To Do Column */}
                                <div className={cn("rounded-lg p-4 border min-h-[200px]", getStatusColumnColor("To Do"))}>
                                    {/* ... heading ... */}
                                    <div className="space-y-4">
                                        {tasks.filter(t => t.status === "To Do").map(task =>
                                            <TaskCard
                                                key={task._id}
                                                task={task} // Pass the task object (now with Date objects)
                                                onDelete={handleDeleteTask}
                                                onEdit={() => { setCurrentTask(task); setIsEditTaskOpen(true); setError(null);}}
                                                onChangeStatus={handleChangeStatus}
                                                formatDate={formatDate} // Pass the correct formatDate function
                                                getStatusBadgeColor={getStatusBadgeColor}
                                            />
                                        )}
                                        {tasks.filter(t => t.status === "To Do").length === 0 && <p className="text-sm text-center text-gray-500 pt-4">No tasks here!</p>}
                                    </div>
                                </div>
                                {/* In Progress Column */}
                                <div className={cn("rounded-lg p-4 border min-h-[200px]", getStatusColumnColor("In Progress"))}>
                                    {/* ... heading ... */}
                                    <div className="space-y-4">
                                        {tasks.filter(t => t.status === "In Progress").map(task =>
                                            <TaskCard
                                                key={task._id}
                                                task={task} // Pass the task object
                                                onDelete={handleDeleteTask}
                                                onEdit={() => { setCurrentTask(task); setIsEditTaskOpen(true); setError(null);}}
                                                onChangeStatus={handleChangeStatus}
                                                formatDate={formatDate} // Pass the correct formatDate function
                                                getStatusBadgeColor={getStatusBadgeColor}
                                            />
                                        )}
                                        {tasks.filter(t => t.status === "In Progress").length === 0 && <p className="text-sm text-center text-gray-500 pt-4">No tasks here!</p>}
                                    </div>
                                </div>
                                {/* Done Column */}
                                <div className={cn("rounded-lg p-4 border min-h-[200px]", getStatusColumnColor("Done"))}>
                                    {/* ... heading ... */}
                                    <div className="space-y-4">
                                        {tasks.filter(t => t.status === "Done").map(task =>
                                            <TaskCard
                                                key={task._id}
                                                task={task} // Pass the task object
                                                onDelete={handleDeleteTask}
                                                onEdit={() => { setCurrentTask(task); setIsEditTaskOpen(true); setError(null);}}
                                                onChangeStatus={handleChangeStatus}
                                                formatDate={formatDate} // Pass the correct formatDate function
                                                getStatusBadgeColor={getStatusBadgeColor}
                                            />
                                        )}
                                        {tasks.filter(t => t.status === "Done").length === 0 && <p className="text-sm text-center text-gray-500 pt-4">No tasks here!</p>}
                                    </div>
                                </div>
                            </div>
                    )}
                     {!isLoadingTasks && tasks.length === 0 && (
                        <div className="text-center text-gray-500 mt-10">
                            <p>No tasks found{selectedListId === null ? "" : ` in "${currentListName}"`}.</p>
                            <Button variant="link" onClick={() => {setIsAddTaskOpen(true); setError(null);}}>Add your first task!</Button>
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


      {/* --- Dialogs --- (Keep structure from previous response, ensure they clear errors on open/close) */}
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
                       <SelectItem value=" ">- No List -</SelectItem>
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
                    <SelectItem value="">- No List -</SelectItem>
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