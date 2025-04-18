"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useAuth, UserButton, useUser } from "@clerk/nextjs"
import { CheckCircle, Circle, Clock, Plus, Trash2 } from "lucide-react"

interface Todo {
  _id: string
  text: string
  status: "Pending" | "In Progress" | "Done"
  userId: string
  createdAt: string
  updatedAt: string
}

// Helper function to render a single todo item (reusable)
function TodoItem({
  todo,
  getStatusInfo,
  onUpdateStatus,
  onDeleteTodo,
  isLastItem, // To handle bottom border
}: {
  todo: Todo
  getStatusInfo: (status: Todo["status"]) => any // Replace 'any' with a more specific type if possible
  onUpdateStatus: (id: string, newStatus: Todo["status"]) => void
  onDeleteTodo: (id: string) => void
  isLastItem: boolean
}) {
  const statusInfo = getStatusInfo(todo.status)
  return (
    <li
      className={`p-4 flex flex-col @md:flex-row justify-between items-start @md:items-center gap-3 ${statusInfo.bgColor} ${
        isLastItem ? "" : "border-b border-sky-100" // Apply border except for the last item in its section
      } transition-all duration-200 hover:bg-opacity-70`}
    >
      <div className="flex items-center gap-3 flex-grow mr-4">
        {statusInfo.icon}
        <span
          className={`${todo.status === "Done" ? "line-through text-gray-400" : statusInfo.textColor} text-pretty`} // Adjusted Done text color
        >
          {todo.text}
        </span>
      </div>
      <div className="flex items-center gap-3 w-full @md:w-auto">
        {/* Status Dropdown */}
        <select
          value={todo.status}
          onChange={(e) => onUpdateStatus(todo._id, e.target.value as Todo["status"])}
          className={`p-2 border rounded-lg text-sm ${statusInfo.borderColor} ${statusInfo.textColor} bg-white/80 focus:ring-2 focus:ring-sky-300 focus:outline-none transition-all duration-200 flex-1 @md:flex-none`}
          // No need to disable, moving Done items visually separates them
          // disabled={todo.status === "Done"}
        >
          <option value="Pending">Pending</option>
          <option value="In Progress">In Progress</option>
          <option value="Done">Done</option>
        </select>
        {/* Delete Button */}
        <button
          onClick={() => onDeleteTodo(todo._id)}
          className="text-pink-500 hover:text-pink-700 text-sm font-medium p-2 rounded-lg hover:bg-pink-50 transition-all duration-200"
          aria-label={`Delete todo: ${todo.text}`}
        >
          <Trash2 className="size-5" />
        </button>
      </div>
    </li>
  )
}


export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [newTodoText, setNewTodoText] = useState("")
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { getToken } = useAuth() // Hook to get the auth token
  const { user } = useUser() // Hook to get user info

  const API_URL = process.env.NEXT_PUBLIC_API_URL

  // --- Fetch Todos ---
  const fetchTodos = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const token = await getToken() // Get JWT token from Clerk
      if (!token) {
        throw new Error("Authentication token not available.")
      }

      const response = await fetch(`${API_URL}/todos`, {
        headers: {
          Authorization: `Bearer ${token}`, // Send token to backend
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error fetching todos: ${response.statusText}`)
      }
      const data: Todo[] = await response.json()
      // Sort todos initially if desired (e.g., Pending/In Progress first, then Done)
      // data.sort((a, b) => (a.status === 'Done' ? 1 : -1) - (b.status === 'Done' ? 1 : -1));
      setTodos(data)
    } catch (err: any) {
      console.error("Fetch error:", err)
      setError(err.message || "Failed to fetch todos.")
    } finally {
      setIsLoading(false)
    }
  }

  // --- Add Todo ---
  const handleAddTodo = async (e: FormEvent) => {
    e.preventDefault()
    if (!newTodoText.trim()) return
    setError(null)

    try {
      const token = await getToken()
      if (!token) {
        throw new Error("Authentication token not available.")
      }

      console.log("Adding todo via API:", API_URL)
      const response = await fetch(`${API_URL}/todos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newTodoText }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error adding todo: ${response.statusText}`)
      }

      const newTodo: Todo = await response.json()
      // Add new todo to the beginning of the list (it will be Pending)
      setTodos([newTodo, ...todos])
      setNewTodoText("") // Clear input field
    } catch (err: any) {
      console.error("Add error:", err)
      setError(err.message || "Failed to add todo.")
    }
  }

  // --- Update Todo Status ---
  const handleUpdateStatus = async (id: string, newStatus: Todo["status"]) => {
    setError(null)

    try {
      const token = await getToken()
      if (!token) {
        throw new Error("Authentication token not available.")
      }

      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error updating todo: ${response.statusText}`)
      }

      const updatedTodo: Todo = await response.json()
      // Update the todo in the local state based on server response
      setTodos(currentTodos =>
         currentTodos.map((todo) => (todo._id === id ? updatedTodo : todo))
      )
    } catch (err: any) {
      console.error("Update error:", err)
      setError(err.message || "Failed to update todo status.")
      // Rollback optimistic update if it failed (optional)
      // if (originalStatus) {
      //   setTodos(currentTodos =>
      //     currentTodos.map(todo =>
      //       todo._id === id ? { ...todo, status: originalStatus } : todo
      //     )
      //   );
      // }
    }
  }

  // --- Delete Todo ---
  const handleDeleteTodo = async (id: string) => {
    setError(null)
    if (!confirm("Are you sure you want to delete this todo?")) return // Confirmation dialog

    try {
      const token = await getToken()
      if (!token) {
        throw new Error("Authentication token not available.")
      }

      const response = await fetch(`${API_URL}/todos/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || `Error deleting todo: ${response.statusText}`)
      }

      // Remove the todo from the local state
      setTodos(todos.filter((todo) => todo._id !== id))
    } catch (err: any) {
      console.error("Delete error:", err)
      setError(err.message || "Failed to delete todo.")
    }
  }

  useEffect(() => {
    if (user) {
      fetchTodos()
    }
  }, [user]) 

  const getStatusInfo = (status: Todo["status"]) => {
    switch (status) {
      case "Done":
        return {
          icon: <CheckCircle className="size-5 text-teal-500" />,
          bgColor: "bg-teal-50/50", // Slightly more subtle background for done
          borderColor: "border-teal-200",
          textColor: "text-teal-700",
        }
      case "In Progress":
        return {
          icon: <Clock className="size-5 text-purple-500" />,
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
          textColor: "text-purple-700",
        }
      default: // Pending
        return {
          icon: <Circle className="size-5 text-blue-400" />,
          bgColor: "bg-blue-50",
          borderColor: "border-blue-100",
          textColor: "text-blue-700",
        }
    }
  }

  // --- Filtering Logic ---
  const activeTodos = todos.filter(todo => todo.status !== 'Done');
  const doneTodos = todos.filter(todo => todo.status === 'Done');

  return (
    <div className="min-h-dvh bg-gradient-to-br from-sky-50 to-violet-50">
      <div className="container mx-auto px-4 py-6 max-w-2xl">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-violet-200">
          {/* Header content... */}
           <div className="flex items-center gap-3">
            <div className="bg-gradient-to-r from-sky-400 to-violet-400 p-2 rounded-lg shadow-sm">
              <h1 className="text-3xl font-bold text-white text-balance">My Tasks</h1>
            </div>
          </div>
          <div>
            <UserButton afterSignOutUrl="/sign-in" />
          </div>
        </header>

        {/* Add Todo Form */}
        <form onSubmit={handleAddTodo} className="mb-8 bg-white p-4 rounded-xl shadow-sm border border-sky-100">
           {/* Form content... */}
           <div className="flex gap-2">
            <input
              type="text"
              value={newTodoText}
              onChange={(e) => setNewTodoText(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-grow p-3 border border-sky-200 rounded-lg shadow-sm focus:ring-2 focus:ring-sky-300 focus:outline-none transition-all duration-200"
              aria-label="New todo text"
            />
            <button
              type="submit"
              className="bg-gradient-to-r from-sky-400 to-violet-400 hover:from-sky-500 hover:to-violet-500 text-white font-medium py-3 px-6 rounded-lg shadow-sm transition-all duration-200 flex items-center gap-2 disabled:opacity-50"
              disabled={!newTodoText.trim()} // Disable button if input is empty
            >
              <Plus className="size-5" /> Add
            </button>
          </div>
        </form>

        {/* Loading State */}
        {isLoading && (
           <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-sky-100">
            {/* Loading content... */}
             <div
                className="size-3 rounded-full bg-sky-300 animate-[bounce_1s_infinite]"
                style={{ animationDelay: "0ms" }}
              ></div>
              <div
                className="size-3 rounded-full bg-violet-300 animate-[bounce_1s_infinite]"
                style={{ animationDelay: "150ms" }}
              ></div>
              <div
                className="size-3 rounded-full bg-pink-300 animate-[bounce_1s_infinite]"
                style={{ animationDelay: "300ms" }}
              ></div>
            <p className="text-violet-500 font-medium">Loading your tasks...</p>
          </div>
        )}

        {/* Error Display */}
        {error && (
           <div className="text-center text-red-600 bg-red-50 p-4 rounded-xl mb-6 border border-red-200 shadow-sm">
             {/* Error content... */}
             <p className="font-medium">{error}</p>
             <p className="text-sm mt-1 text-red-500">Please try again</p>
          </div>
        )}

        {/* Todo List Area */}
        {!isLoading && !error && (
          <div className="space-y-4">
            {/* Show message only if BOTH lists are empty */}
            {activeTodos.length === 0 && doneTodos.length === 0 ? (
              <div className="text-center p-12 bg-white rounded-xl shadow-sm border border-sky-100">
                 {/* Empty list content... */}
                 <div className="size-16 mx-auto mb-4 rounded-full bg-sky-100 flex items-center justify-center">
                  <CheckCircle className="size-8 text-sky-400" />
                 </div>
                 <p className="text-violet-500 font-medium">Your task list is empty</p>
                 <p className="text-sky-400 text-sm mt-1">Add your first task above</p>
              </div>
            ) : (
              <div className="@container space-y-6"> {/* Add space between sections */}
                {/* Active Todos Section */}
                {activeTodos.length > 0 && (
                  <div className="bg-white rounded-xl shadow-sm border border-sky-100 overflow-hidden">
                    <ul>
                      {activeTodos.map((todo, index) => (
                        <TodoItem
                          key={todo._id}
                          todo={todo}
                          getStatusInfo={getStatusInfo}
                          onUpdateStatus={handleUpdateStatus}
                          onDeleteTodo={handleDeleteTodo}
                          isLastItem={index === activeTodos.length - 1}
                        />
                      ))}
                    </ul>
                  </div>
                )}

                {/* Separator Line */}
                {activeTodos.length > 0 && doneTodos.length > 0 && (
                  <hr className="border-t border-violet-200 my-4" /> // Added margin top/bottom
                )}

                {/* Done Todos Section */}
                {doneTodos.length > 0 && (
                  <div> {/* Wrapper div for heading + list */}
                    <h2 className="text-lg font-semibold text-violet-500 mb-3">
                       Completed Tasks ({doneTodos.length})
                    </h2>
                    <div className="bg-white/70 rounded-xl shadow-sm border border-sky-100/50 overflow-hidden"> {/* Slightly different style for done section */}
                       <ul>
                         {doneTodos.map((todo, index) => (
                          <TodoItem
                             key={todo._id}
                             todo={todo}
                             getStatusInfo={getStatusInfo}
                             onUpdateStatus={handleUpdateStatus}
                             onDeleteTodo={handleDeleteTodo}
                             isLastItem={index === doneTodos.length - 1}
                           />
                         ))}
                       </ul>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <footer className="mt-8 text-center text-violet-400 text-sm">
           {/* Footer content... */}
           <p>Organize your day with ease</p>
        </footer>
      </div>
    </div>
  )
}