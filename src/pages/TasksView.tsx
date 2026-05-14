import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../components/FirebaseProvider';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { cn } from '../lib/utils';

export function TasksView({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<any[]>([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');

  useEffect(() => {
    const q = query(collection(db, `projects/${projectId}/tasks`));
    const unsub = onSnapshot(q, snap => {
      setTasks(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => handleFirestoreError(err, OperationType.LIST, 'tasks'));
    return unsub;
  }, [projectId]);

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !user) return;
    try {
      await addDoc(collection(db, `projects/${projectId}/tasks`), {
        title: newTaskTitle.trim(),
        status: 'todo',
        createdBy: user.uid,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setNewTaskTitle('');
    } catch(err) {
      handleFirestoreError(err, OperationType.CREATE, 'tasks');
    }
  };

  const updateStatus = async (taskId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, `projects/${projectId}/tasks`, taskId), { 
        status: newStatus,
        updatedAt: serverTimestamp()
      });
    } catch(err) {
      handleFirestoreError(err, OperationType.UPDATE, 'tasks');
    }
  };

  const Columns = ['todo', 'in_progress', 'done'];

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-gray-50">
      <div className="p-4 border-b border-gray-200 bg-white flex justify-between items-center shrink-0">
        <h3 className="font-semibold text-lg">Project Tasks</h3>
        <form onSubmit={addTask} className="flex gap-2">
          <input 
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="New task title..."
            className="border border-gray-300 rounded px-2 py-1 text-sm outline-none focus:border-indigo-500"
          />
          <button type="submit" disabled={!newTaskTitle.trim()} className="bg-indigo-600 text-white rounded p-1 hover:bg-indigo-700 disabled:opacity-50">
            <Plus size={20} />
          </button>
        </form>
      </div>

      <div className="flex-1 overflow-x-auto p-6">
        <div className="flex gap-6 h-full items-start">
          {Columns.map(status => {
            const colTasks = tasks.filter(t => t.status === status);
            return (
              <div key={status} className="bg-gray-100 rounded-lg w-80 shrink-0 flex flex-col max-h-full">
                <div className="p-3 border-b border-gray-200">
                  <h4 className="font-semibold text-gray-700 uppercase text-xs tracking-wider">
                    {status.replace('_', ' ')} <span className="text-gray-400 font-normal ml-1">({colTasks.length})</span>
                  </h4>
                </div>
                <div className="p-2 flex-1 overflow-y-auto space-y-2">
                  {colTasks.map(task => (
                    <div key={task.id} className="bg-white p-3 rounded shadow-sm border border-gray-200 group relative">
                      <p className="text-sm font-medium text-gray-900 mb-3 pr-6">{task.title}</p>
                      
                      <div className="flex justify-between items-end">
                        <select 
                          value={task.status}
                          onChange={(e) => updateStatus(task.id, e.target.value)}
                          className="text-xs bg-gray-50 border border-gray-200 rounded px-1 py-1"
                        >
                          <option value="todo">To Do</option>
                          <option value="in_progress">In Progress</option>
                          <option value="done">Done</option>
                        </select>
                      </div>

                      {user?.uid === task.createdBy && (
                         <button 
                           onClick={() => deleteDoc(doc(db, `projects/${projectId}/tasks`, task.id))}
                           className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                         >
                           <Trash2 size={16} />
                         </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
