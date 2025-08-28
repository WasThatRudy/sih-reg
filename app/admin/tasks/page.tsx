'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdminLayout from '@/components/admin/AdminLayout';

interface Task {
  _id: string;
  title: string;
  description: string;
  fields: TaskField[];
  assignedTo: string[];
  dueDate?: string;
  isActive: boolean;
  createdBy: string;
  createdAt: string;
}

interface TaskField {
  name: string;
  type: 'text' | 'file' | 'url' | 'number' | 'date';
  required: boolean;
  description?: string;
}

interface Team {
  _id: string;
  teamName: string;
  leader: { name: string; email: string };
  status: string;
}

export default function TasksManagement() {
  // Remove unused admin variable
  const [tasks, setTasks] = useState<Task[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    fields: [] as TaskField[],
    assignedTo: [] as string[],
    dueDate: '',
  });

  useEffect(() => {
    fetchTasks();
    fetchTeams();
  }, []);

  const fetchTasks = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/admin/tasks', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTasks(data.tasks || []);
      } else {
        console.error('Failed to fetch tasks:', response.status);
      }
    } catch (error) {
      console.error('Error fetching tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    
    try {
      const response = await fetch('/api/admin/teams', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const data = await response.json();
        setTeams(data.teams || []);
      } else {
        console.error('Failed to fetch teams:', response.status);
      }
    } catch (error) {
      console.error('Error fetching teams:', error);
    }
  };

  const addField = () => {
    setNewTask(prev => ({
      ...prev,
      fields: [...prev.fields, { name: '', type: 'text', required: false }]
    }));
  };

  const updateField = (index: number, field: Partial<TaskField>) => {
    setNewTask(prev => ({
      ...prev,
      fields: prev.fields.map((f, i) => i === index ? { ...f, ...field } : f)
    }));
  };

  const removeField = (index: number) => {
    setNewTask(prev => ({
      ...prev,
      fields: prev.fields.filter((_, i) => i !== index)
    }));
  };

  const createTask = async () => {
    const token = localStorage.getItem('adminToken');
    if (!token || !newTask.title.trim()) return;
    
    setSubmitting(true);
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(newTask)
      });

      if (response.ok) {
        await fetchTasks(); // Refresh tasks
        setShowCreateForm(false);
        setNewTask({
          title: '',
          description: '',
          fields: [],
          assignedTo: [],
          dueDate: '',
        });
        alert('Task created and assigned successfully!');
      } else {
        const error = await response.json();
        alert(`Failed to create task: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('An error occurred while creating the task');
    } finally {
      setSubmitting(false);
    }
  };

  const toggleTaskStatus = async (taskId: string, currentStatus: boolean) => {
    const token = localStorage.getItem('adminToken');
    if (!token) return;
    
    try {
      const response = await fetch('/api/admin/tasks', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ taskId, isActive: !currentStatus })
      });

      if (response.ok) {
        setTasks(tasks.map(task => 
          task._id === taskId ? { ...task, isActive: !currentStatus } : task
        ));
      } else {
        console.error('Failed to update task status:', response.status);
      }
    } catch (error) {
      console.error('Error updating task status:', error);
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-display text-heading mb-2">Task Management</h1>
            <p className="text-subheading font-body">Create and assign tasks to teams</p>
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-2 bg-heading/20 border border-heading/30 text-heading rounded-lg hover:bg-heading/30 transition-colors"
          >
            Create New Task
          </button>
        </div>

        {/* Tasks List */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-heading mx-auto mb-4"></div>
              <p className="text-gray-400">Loading tasks...</p>
            </div>
          ) : tasks.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <p className="text-gray-400 text-lg">No tasks created yet</p>
              <p className="text-gray-500 text-sm mt-2">Create your first task to get started</p>
            </div>
          ) : (
            tasks.map((task) => (
              <motion.div
                key={task._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-gray-900/50 backdrop-blur-sm border border-gray-800 rounded-2xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-display text-heading mb-2">{task.title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <span>Assigned to {task.assignedTo.length} teams</span>
                      {task.dueDate && (
                        <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                      )}
                      <span>Created: {new Date(task.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => toggleTaskStatus(task._id, task.isActive)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      task.isActive ? 'bg-green-600' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        task.isActive ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>

                {/* Task Fields */}
                {task.fields.length > 0 && (
                  <div className="border-t border-gray-700 pt-4">
                    <h4 className="text-sm font-medium text-subheading mb-3">Task Fields:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {task.fields.map((field, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-3">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white text-sm font-medium">{field.name}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              field.type === 'file' ? 'bg-blue-500/20 text-blue-400' :
                              field.type === 'url' ? 'bg-green-500/20 text-green-400' :
                              field.type === 'date' ? 'bg-purple-500/20 text-purple-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {field.type}
                            </span>
                            {field.required && (
                              <span className="text-xs text-red-400">Required</span>
                            )}
                          </div>
                          {field.description && (
                            <p className="text-xs text-gray-400">{field.description}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Create Task Modal */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowCreateForm(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-display text-heading">Create New Task</h2>
                  <button
                    onClick={() => setShowCreateForm(false)}
                    className="text-gray-400 hover:text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Basic Info */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-subheading text-sm font-medium mb-2">Task Title *</label>
                      <input
                        type="text"
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-heading"
                        placeholder="Enter task title"
                      />
                    </div>
                    <div>
                      <label className="block text-subheading text-sm font-medium mb-2">Due Date</label>
                      <input
                        type="date"
                        value={newTask.dueDate}
                        onChange={(e) => setNewTask(prev => ({ ...prev, dueDate: e.target.value }))}
                        className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-heading"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-subheading text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={newTask.description}
                      onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                      className="w-full px-4 py-2 bg-gray-800/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-heading"
                      placeholder="Describe the task requirements"
                    />
                  </div>

                  {/* Assign to Teams */}
                  <div>
                    <label className="block text-subheading text-sm font-medium mb-2">Assign to Teams</label>
                    <div className="bg-gray-800/50 border border-gray-600 rounded-lg p-4 max-h-40 overflow-y-auto">
                      <div className="space-y-2">
                        {teams.map((team) => (
                          <label key={team._id} className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={newTask.assignedTo.includes(team._id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setNewTask(prev => ({ ...prev, assignedTo: [...prev.assignedTo, team._id] }));
                                } else {
                                  setNewTask(prev => ({ ...prev, assignedTo: prev.assignedTo.filter(id => id !== team._id) }));
                                }
                              }}
                              className="w-4 h-4 text-heading focus:ring-heading border-gray-600 rounded"
                            />
                            <span className="text-white text-sm">{team.teamName}</span>
                            <span className="text-gray-400 text-xs">({team.leader.name})</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Task Fields */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <label className="block text-subheading text-sm font-medium">Task Fields</label>
                      <button
                        onClick={addField}
                        className="text-sm px-3 py-1 bg-heading/20 text-heading border border-heading/30 rounded hover:bg-heading/30"
                      >
                        Add Field
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {newTask.fields.map((field, index) => (
                        <div key={index} className="bg-gray-800/50 border border-gray-600 rounded-lg p-4">
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                            <input
                              type="text"
                              value={field.name}
                              onChange={(e) => updateField(index, { name: e.target.value })}
                              placeholder="Field name"
                              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-heading"
                            />
                            <select
                              value={field.type}
                              onChange={(e) => updateField(index, { type: e.target.value as TaskField['type'] })}
                              className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-heading"
                            >
                              <option value="text">Text</option>
                              <option value="file">File Upload</option>
                              <option value="url">URL</option>
                              <option value="number">Number</option>
                              <option value="date">Date</option>
                            </select>
                            <div className="flex items-center gap-2">
                              <label className="flex items-center gap-2">
                                <input
                                  type="checkbox"
                                  checked={field.required}
                                  onChange={(e) => updateField(index, { required: e.target.checked })}
                                  className="w-4 h-4 text-heading focus:ring-heading border-gray-600 rounded"
                                />
                                <span className="text-white text-sm">Required</span>
                              </label>
                              <button
                                onClick={() => removeField(index)}
                                className="text-red-400 hover:text-red-300 ml-auto"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                </svg>
                              </button>
                            </div>
                          </div>
                          <input
                            type="text"
                            value={field.description || ''}
                            onChange={(e) => updateField(index, { description: e.target.value })}
                            placeholder="Field description (optional)"
                            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-heading"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-6 border-t border-gray-700">
                    <button
                      onClick={() => setShowCreateForm(false)}
                      className="px-6 py-2 bg-gray-800 border border-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={createTask}
                      disabled={submitting || !newTask.title.trim() || newTask.assignedTo.length === 0}
                      className="px-6 py-2 bg-heading/20 border border-heading/30 text-heading rounded-lg hover:bg-heading/30 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {submitting ? 'Creating...' : 'Create Task'}
                    </button>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AdminLayout>
  );
}
