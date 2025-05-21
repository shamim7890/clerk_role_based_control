'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@clerk/nextjs'

// Define a Task type for better type safety
type Task = {
  id: number
  name: string
  user_id: string
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // The `useUser()` hook is used to ensure that Clerk has loaded data about the signed in user
  const { user, isLoaded } = useUser()

  // Fetch tasks from our API route
  useEffect(() => {
    // Only fetch tasks if user is logged in and user data is loaded
    if (!isLoaded || !user) {
      if (isLoaded && !user) {
        setLoading(false) // Stop loading if user is not logged in
      }
      return
    }

    async function loadTasks() {
      setLoading(true)
      setError(null)
      
      try {
        const response = await fetch('/api/tasks')
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Failed to load tasks')
        }
        
        const data = await response.json()
        setTasks(data || [])
      } catch (err) {
        console.error('Error loading tasks:', err)
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    loadTasks()
  }, [user, isLoaded])

  async function createTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    
    if (!name.trim()) {
      setError('Task name cannot be empty')
      return
    }
    
    if (!user) {
      setError('You must be logged in to create tasks')
      return
    }
    
    setSubmitting(true)
    setError(null)
    
    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: name.trim() }),
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create task')
      }
      
      const newTask = await response.json()
      
      // Add the new task to the tasks list
      setTasks([newTask, ...tasks])
      
      // Clear the input field
      setName('')
    } catch (err) {
      console.error('Error creating task:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    } finally {
      setSubmitting(false)
    }
  }

  async function deleteTask(taskId: number) {
    if (!user) return
    
    try {
      const response = await fetch(`/api/tasks?id=${taskId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to delete task')
      }
      
      // Remove the task from the local state
      setTasks(tasks.filter(task => task.id !== taskId))
    } catch (err) {
      console.error('Error deleting task:', err)
      setError(err instanceof Error ? err.message : 'An unexpected error occurred')
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Tasks</h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <form onSubmit={createTask} className="mb-6">
        <div className="flex">
          <input
            autoFocus
            type="text"
            name="name"
            placeholder="Enter new task"
            onChange={(e) => setName(e.target.value)}
            value={name}
            disabled={submitting}
            className="flex-grow border border-gray-300 rounded-l px-4 py-2"
          />
          <button 
            type="submit" 
            disabled={submitting || !name.trim()}
            className="bg-blue-500 hover:bg-blue-600 text-white rounded-r px-4 py-2 disabled:bg-blue-300"
          >
            {submitting ? 'Adding...' : 'Add'}
          </button>
        </div>
      </form>

      {loading ? (
        <p className="text-center">Loading tasks...</p>
      ) : tasks.length > 0 ? (
        <ul className="space-y-2">
          {tasks.map((task) => (
            <li key={task.id} className="flex justify-between items-center border-b pb-2">
              <span>{task.name}</span>
              <button
                onClick={() => deleteTask(task.id)}
                className="text-red-500 hover:text-red-700"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-center text-gray-500">No tasks found</p>
      )}
      
      {isLoaded && !user && (
        <p className="text-center mt-4 text-gray-500">
          Please sign in to manage your tasks
        </p>
      )}
    </div>
  )
}