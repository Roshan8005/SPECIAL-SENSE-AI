import React, { useEffect, useState } from 'react';
import { Routes, Route, Link, useParams, useLocation, Navigate } from 'react-router-dom';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { MessageSquare, CheckSquare, FileText, Settings, Users } from 'lucide-react';
import { cn } from '../lib/utils';
import { ChatView } from './ChatView';
import { TasksView } from './TasksView';
import { DocumentsView } from './DocumentsView';
import { MembersView } from './MembersView';

export function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const [project, setProject] = useState<any>(null);
  const location = useLocation();

  useEffect(() => {
    if (!projectId) return;
    const unsub = onSnapshot(doc(db, 'projects', projectId), (docSnap) => {
      if (docSnap.exists()) setProject({ id: docSnap.id, ...docSnap.data() });
    }, (err) => handleFirestoreError(err, OperationType.GET, `projects/${projectId}`));
    return unsub;
  }, [projectId]);

  if (!project) return null;

  const tabs = [
    { name: 'Chat', path: `/projects/${projectId}/chat`, icon: MessageSquare },
    { name: 'Tasks', path: `/projects/${projectId}/tasks`, icon: CheckSquare },
    { name: 'Documents', path: `/projects/${projectId}/documents`, icon: FileText },
    { name: 'Members', path: `/projects/${projectId}/members`, icon: Users },
  ];

  return (
    <div className="flex h-full overflow-hidden flex-col md:flex-row">
      <div className="w-full md:w-64 bg-gray-900 text-gray-300 flex-shrink-0 md:h-full overflow-y-auto">
        <div className="p-6">
          <h2 className="text-white font-bold text-lg mb-1 truncate">{project.name}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-400">
            <Users size={14} />
            <span>{project.memberIds?.length || 1} members</span>
          </div>
        </div>
        <nav className="px-4 space-y-1">
          {tabs.map(tab => {
            const isActive = location.pathname.startsWith(tab.path);
            return (
              <Link 
                key={tab.name} 
                to={tab.path} 
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors",
                  isActive ? "bg-gray-800 text-white" : "hover:bg-gray-800 hover:text-white"
                )}
              >
                <tab.icon size={18} className={isActive ? "text-indigo-400" : "text-gray-400"} />
                {tab.name}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="flex-1 bg-white overflow-hidden relative">
        <Routes>
          <Route path="chat" element={<ChatView projectId={projectId!} />} />
          <Route path="tasks" element={<TasksView projectId={projectId!} />} />
          <Route path="documents/*" element={<DocumentsView projectId={projectId!} />} />
          <Route path="members" element={<MembersView projectId={projectId!} project={project} />} />
          <Route path="*" element={<Navigate to="chat" replace />} />
        </Routes>
      </div>
    </div>
  );
}
