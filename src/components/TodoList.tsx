import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

interface Todo {
  id: number;
  task: string;
  is_complete: boolean;
  user_id: string;
}

export default function TodoList({ userId }: { userId: string }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTask, setNewTask] = useState('');

  useEffect(() => {
    fetchTodos();
  }, []);

  async function fetchTodos() {
    const { data, error } = await supabase
      .from('todos')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching todos:', error);
    } else {
      setTodos(data || []);
    }
  }

  async function addTodo(e: React.FormEvent) {
    e.preventDefault();
    if (!newTask.trim()) return;

    const { error } = await supabase
      .from('todos')
      .insert([{ task: newTask, user_id: userId }]);

    if (error) {
      console.error('Error adding todo:', error);
    } else {
      setNewTask('');
      fetchTodos();
    }
  }

  async function toggleTodo(id: number, is_complete: boolean) {
    const { error } = await supabase
      .from('todos')
      .update({ is_complete: !is_complete })
      .eq('id', id);

    if (error) {
      console.error('Error updating todo:', error);
    } else {
      fetchTodos();
    }
  }

  async function deleteTodo(id: number) {
    const { error } = await supabase
      .from('todos')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting todo:', error);
    } else {
      fetchTodos();
    }
  }

  async function handleLogout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Todo List</h1>
        <button
          onClick={handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>

      <form onSubmit={addTodo} className="mb-6">
        <div className="flex gap-2">
          <input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Add
          </button>
        </div>
      </form>

      <ul className="space-y-3">
        {todos.map((todo) => (
          <li
            key={todo.id}
            className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={todo.is_complete}
                onChange={() => toggleTodo(todo.id, todo.is_complete)}
                className="h-5 w-5 rounded border-gray-300"
              />
              <span className={todo.is_complete ? 'line-through text-gray-500' : ''}>
                {todo.task}
              </span>
            </div>
            <button
              onClick={() => deleteTodo(todo.id)}
              className="text-red-500 hover:text-red-700"
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}