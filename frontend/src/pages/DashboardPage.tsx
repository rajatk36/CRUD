import { useEffect, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../state/AuthContext';

type Task = {
  _id: string;
  title: string;
  description?: string;
  completed: boolean;
  createdAt: string;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';

const DashboardPage = () => {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'completed' | 'pending'>('all');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // Navbar menu state
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const hasActiveEdit = useMemo(() => Boolean(editingTaskId), [editingTaskId]);

  const fetchTasks = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set('search', search.trim());
      if (statusFilter !== 'all') params.set('status', statusFilter);

      const res = await fetch(`${API_BASE_URL}/tasks?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to load tasks');
      }
      setTasks(data.tasks);
    } catch (err: any) {
      setError(err.message || 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchTasks();
  }, [statusFilter]);

  const startCreate = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
  };

  const startEdit = (task: Task) => {
    setEditingTaskId(task._id);
    setTitle(task.title);
    setDescription(task.description || '');
  };

  const resetForm = () => {
    setEditingTaskId(null);
    setTitle('');
    setDescription('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setError(null);

    if (!title.trim()) {
      setError('Title is required.');
      return;
    }

    try {
      const method = editingTaskId ? 'PUT' : 'POST';
      const url = editingTaskId
        ? `${API_BASE_URL}/tasks/${editingTaskId}`
        : `${API_BASE_URL}/tasks`;

      const res = await fetch(url, {
        method,
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to save task');
      }

      if (editingTaskId) {
        setTasks((prev) => prev.map((t) => (t._id === data.task._id ? data.task : t)));
      } else {
        setTasks((prev) => [data.task, ...prev]);
      }
      resetForm();
    } catch (err: any) {
      setError(err.message || 'Failed to save task');
    }
  };

  const toggleCompleted = async (task: Task) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${task._id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ completed: !task.completed }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.message || 'Failed to update task');
      }
      setTasks((prev) => prev.map((t) => (t._id === data.task._id ? data.task : t)));
    } catch (err: any) {
      setError(err.message || 'Failed to update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    if (!token) return;
    try {
      const res = await fetch(`${API_BASE_URL}/tasks/${taskId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok && res.status !== 204) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to delete task');
      }
      setTasks((prev) => prev.filter((t) => t._id !== taskId));
      if (editingTaskId === taskId) {
        resetForm();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete task');
    }
  };

  const handleSearchSubmit = async (e: FormEvent) => {
    e.preventDefault();
    void fetchTasks();
  };

  const handleToggleMenu = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleProfileClick = () => {
    setIsMenuOpen(false);
    navigate('/profile');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Dashboard</h1>
            <p className="text-xs text-slate-500">
              Workspace with profile and task management.
            </p>
          </div>
          <div className="relative">
            <button
              type="button"
              onClick={handleToggleMenu}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2 focus:ring-offset-white"
              aria-label="User menu"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 6H17M3 10H17M3 14H11"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 mt-2 w-40 rounded-lg border border-slate-200 bg-white py-1 text-xs shadow-lg z-20">
                <button
                  type="button"
                  onClick={handleProfileClick}
                  className="block w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50"
                >
                  Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6 grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section className="space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              {hasActiveEdit ? 'Edit task' : 'Create a new task'}
            </h2>
            {error && (
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}
            <form className="space-y-3" onSubmit={handleSubmit} noValidate>
              <div className="space-y-1">
                <label className="block text-xs font-medium text-slate-700" htmlFor="title">
                  Title
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  placeholder="Plan sprint review"
                  required
                />
              </div>
              <div className="space-y-1">
                <label
                  className="block text-xs font-medium text-slate-700"
                  htmlFor="description"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  rows={3}
                  placeholder="Add relevant details, links, or acceptance criteria."
                />
              </div>
              <div className="flex items-center justify-between gap-3 pt-1">
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  {hasActiveEdit ? 'Save changes' : 'Add task'}
                </button>
                {hasActiveEdit && (
                  <button
                    type="button"
                    onClick={startCreate}
                    className="text-xs text-slate-500 hover:text-slate-700"
                  >
                    Cancel edit
                  </button>
                )}
              </div>
            </form>
          </div>

        </section>

        <section className="space-y-4">
          <div className="rounded-xl bg-white p-4 shadow-sm border border-slate-100">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
              <form
                onSubmit={handleSearchSubmit}
                className="flex w-full max-w-md items-center gap-2"
              >
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs shadow-sm focus:border-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                  placeholder="Search by title or description"
                />
                <button
                  type="submit"
                  className="rounded-lg border border-slate-200 bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
                >
                  Search
                </button>
              </form>
            </div>
            <div className="flex flex-wrap items-center gap-2 mb-3 text-xs">
              <button
                type="button"
                onClick={() => setStatusFilter('all')}
                className={`rounded-full px-3 py-1 border ${
                  statusFilter === 'all'
                    ? 'border-slate-900 bg-slate-900 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('pending')}
                className={`rounded-full px-3 py-1 border ${
                  statusFilter === 'pending'
                    ? 'border-amber-500 bg-amber-500 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Pending
              </button>
              <button
                type="button"
                onClick={() => setStatusFilter('completed')}
                className={`rounded-full px-3 py-1 border ${
                  statusFilter === 'completed'
                    ? 'border-emerald-600 bg-emerald-600 text-white'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                Completed
              </button>
            </div>

            {loading ? (
              <div className="py-8 text-center text-xs text-slate-500">Loading tasks…</div>
            ) : tasks.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                No tasks yet. Create your first task on the left.
              </div>
            ) : (
              <ul className="divide-y divide-slate-100 text-xs">
                {tasks.map((task) => (
                  <li key={task._id} className="py-3 flex items-start gap-3">
                    <button
                      type="button"
                      onClick={() => toggleCompleted(task)}
                      className={`mt-1 h-4 w-4 rounded border flex items-center justify-center ${
                        task.completed
                          ? 'border-emerald-600 bg-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {task.completed && <span className="text-[10px]">✓</span>}
                    </button>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <p
                          className={`font-medium text-slate-900 ${
                            task.completed ? 'line-through text-slate-400' : ''
                          }`}
                        >
                          {task.title}
                        </p>
                        <span className="text-[10px] text-slate-400">
                          {new Date(task.createdAt).toLocaleString()}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-slate-600">{task.description}</p>
                      )}
                      <div className="flex gap-2 pt-1">
                        <button
                          type="button"
                          onClick={() => startEdit(task)}
                          className="rounded border border-slate-200 px-2 py-1 text-[11px] text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteTask(task._id)}
                          className="rounded border border-red-200 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default DashboardPage;



