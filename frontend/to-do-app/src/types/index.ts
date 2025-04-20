// Status Enum/Type
export type Status = "To Do" | "In Progress" | "Done";

// List Type (Reflecting backend structure)
export type List = {
  _id: string;
  name: string;
  userId: string;
  createdAt?: string; // Optional: Keep raw API date string if needed elsewhere
  updatedAt?: string; // Optional
};

// Task Type (The single source of truth)
// Used for frontend state and props - use Date objects here
export type Task = {
  _id: string;
  topic: string;
  description: string | null;
  createdAt: Date; // Use Date object consistently in the frontend
  updatedAt: Date; // Use Date object consistently in the frontend
  listId: string | null;
  listName: string | null;
  status: Status;
  userId: string;
};