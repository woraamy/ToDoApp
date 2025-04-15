// app/page.tsx
'use client'; // This component needs client-side interactivity

import { useState, useEffect, FormEvent } from 'react';
import { useAuth, UserButton, useUser } from "@clerk/nextjs";

interface Todo {
  _id: string;
  text: string;
  status: 'Pending' | 'In Progress' | 'Done';
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function HomePage() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoText, setNewTodoText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { getToken } = useAuth(); // Hook to get the auth token
  const { user } = useUser(); // Hook to get user info

  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  // --- Fetch Todos ---
  const fetchTodos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const token = await getToken(); // Get JWT token from Clerk
      if (!token) {
         throw new Error("Authentication token not available.");
      }

      const response = await fetch(`${API_URL}/todos`, {
        headers: {
          'Authorization': `Bearer ${token}`, // Send token to backend
        },
      });

      if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || `Error fetching todos: ${response.statusText}`);
      }
      const data: Todo[] = await response.json();
      setTodos(data);
    } catch (err: any) {
      console.error("Fetch error:", err);
      setError(err.message || "Failed to fetch todos.");
    } finally {
      setIsLoading(false);
    }
  };

  // --- Add Todo ---
  const handleAddTodo = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTodoText.trim()) return;
    setError(null);

    try {
       const token = await getToken();
        if (!token) {
         throw new Error("Authentication token not available.");
        }

      const response = await fetch(`${API_URL}/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ text: newTodoText }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error adding todo: ${response.statusText}`);
      }

      const newTodo: Todo = await response.json();
      setTodos([newTodo, ...todos]); // Add to the top of the list
      setNewTodoText(''); // Clear input field
    } catch (err: any) {
      console.error("Add error:", err);
      setError(err.message || "Failed to add todo.");
    }
  };

  // --- Update Todo Status ---
  const handleUpdateStatus = async (id: string, newStatus: Todo['status']) => {
     setError(null);
     try {
        const token = await getToken();
         if (!token) {
            throw new Error("Authentication token not available.");
        }

        const response = await fetch(`<span class="math-inline">\{API\_URL\}/todos/</span>{id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({ status: newStatus }),
        });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error updating todo: ${response.statusText}`);
        }

        const updatedTodo: Todo = await response.json();
        // Update the todo in the local state
        setTodos(todos.map(todo => (todo._id === id ? updatedTodo : todo)));

     } catch(err: any) {
         console.error("Update error:", err);
         setError(err.message || "Failed to update todo status.");
     }
  };


  // --- Delete Todo ---
  const handleDeleteTodo = async (id: string) => {
      setError(null);
      if (!confirm("Are you sure you want to delete this todo?")) return; // Confirmation dialog

      try {
         const token = await getToken();
         if (!token) {
            throw new Error("Authentication token not available.");
        }

        const response = await fetch(`<span class="math-inline">\{API\_URL\}/todos/</span>{id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`,
            },
        });

         if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `Error deleting todo: ${response.statusText}`);
        }

        // Remove the todo from the local state
        setTodos(todos.filter(todo => todo._id !== id));

      } catch (err: any) {
         console.error("Delete error:", err);
         setError(err.message || "Failed to delete todo.");
      }
  };


  // Fetch todos when the component mounts or user changes
  useEffect(() => {
    if (user) { // Only fetch if user is loaded
        fetchTodos();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // Re-fetch if the user object changes (e.g., after login)

  return (
    <div className="container mx-auto p-4 max-w-2xl">
      <header className="flex justify-between items-center mb-6 pb-4 border-b">
        <h1 className="text-3xl font-bold">My Todos</h1>
        <UserButton afterSignOutUrl="/sign-in"/>
      </header>

      {/* Add Todo Form */}
      <form onSubmit={handleAddTodo} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newTodoText}
          onChange={(e) => setNewTodoText(e.target.value)}
          placeholder="Add a new todo..."
          className="flex-grow p-2 border rounded shadow-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          aria-label="New todo text"
        />
        <button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded shadow-sm transition duration-150 ease-in-out"
        >
          Add Todo
        </button>
      </form>

      {/* Loading State */}
      {isLoading && <p className="text-center text-gray-500">Loading todos...</p>}

      {/* Error Display */}
       {error && <p className="text-center text-red-500 bg-red-100 p-3 rounded mb-4">{error}</p>}


      {/* Todo List */}
      {!isLoading && !error && (
        <ul className="space-y-3">
          {todos.length === 0 ? (
             <p className="text-center text-gray-500">No todos yet. Add one above!</p>
          ) : (
            todos.map((todo) => (
              <li
                key={todo._id}
                className={`p-4 rounded shadow-sm border flex justify-between items-center ${
                  todo.status === 'Done' ? 'bg-green-100 border-green-200' : 'bg-white border-gray-200'
                }`}
              >
                <span className={`flex-grow mr-4 ${todo.status === 'Done' ? 'line-through text-gray-500' : ''}`}>
                   {todo.text}
                </span>
                 <div className="flex items-center gap-2 flex-shrink-0">
                     {/* Status Dropdown/Buttons */}
                    <select
                        value={todo.status}
                        onChange={(e) => handleUpdateStatus(todo._id, e.target.value as Todo['status'])}
                        className={`p-1 border rounded text-sm ${
                            todo.status === 'Done' ? 'bg-green-200 border-green-300' :
                            todo.status === 'In Progress' ? 'bg-yellow-100 border-yellow-300' :
                            'bg-gray-100 border-gray-300'
                        }`}
                        disabled={todo.status === 'Done'} // Optional: disable changing from "Done" via dropdown
                    >
                        <option value="Pending">Pending</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Done">Done</option>
                    </select>
                    {/* Delete Button */}
                    <button
                        onClick={() => handleDeleteTodo(todo._id)}
                        className="text-red-500 hover:text-red-700 text-sm font-medium px-2 py-1 rounded hover:bg-red-100 transition duration-150 ease-in-out"
                        aria-label={`Delete todo: ${todo.text}`}
                    >
                        Delete
                    </button>
                 </div>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}