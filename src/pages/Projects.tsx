import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, where, onSnapshot, doc, setDoc, serverTimestamp, writeBatch } from 'firebase/firestore';
import { useAuth } from '../components/FirebaseProvider';
import { Link } from 'react-router-dom';
import { Plus, Folder } from 'lucide-react';

export function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [newProjectName, setNewProjectName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'projects'),
      where('memberIds', 'array-contains', user.uid)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const projData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(projData);
    }, (err) => {
      handleFirestoreError(err, OperationType.LIST, 'projects');
    });

    return unsubscribe;
  }, [user]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !user) return;

    setIsCreating(true);
    try {
      const projectId = crypto.randomUUID();
      const projectRef = doc(db, 'projects', projectId);
      
      const batch = writeBatch(db);
      batch.set(projectRef, {
        name: newProjectName.trim(),
        ownerId: user.uid,
        memberIds: [user.uid],
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      const memberRef = doc(db, `projects/${projectId}/members`, user.uid);
      batch.set(memberRef, {
        role: 'editor',
        joinedAt: serverTimestamp()
      });

      await batch.commit();
      setNewProjectName('');
    } catch (err) {
      handleFirestoreError(err, OperationType.CREATE, 'projects');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto w-full p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Projects</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Create Project Card */}
        <div className="bg-white border text-center border-dashed border-gray-300 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-gray-50 transition-colors">
          <form onSubmit={handleCreateProject} className="w-full flex flex-col items-center gap-4">
             <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
               <Plus size={24} />
             </div>
             <input 
               type="text" 
               placeholder="New project name..." 
               value={newProjectName}
               onChange={(e) => setNewProjectName(e.target.value)}
               className="border border-gray-300 px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 w-full text-center"
               disabled={isCreating}
             />
             <button 
               type="submit" 
               disabled={isCreating || !newProjectName.trim()} 
               className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 w-full font-medium"
             >
               Create Project
             </button>
          </form>
        </div>

        {/* Project List */}
        {projects.map(project => (
          <Link 
            key={project.id} 
            to={`/projects/${project.id}/chat`} 
            className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group flex flex-col"
          >
            <div className="flex items-center gap-3 mb-4 text-gray-700 group-hover:text-indigo-600 transition-colors">
              <Folder size={24} />
              <h2 className="text-xl font-semibold truncate">{project.name}</h2>
            </div>
            <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500 border-t border-gray-100">
              <span>{project.memberIds?.length || 1} members</span>
              <span>{project.ownerId === user?.uid ? 'Owner' : 'Member'}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
