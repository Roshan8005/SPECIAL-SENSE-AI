import React, { useState, useEffect, useCallback } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { doc, onSnapshot, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { useAuth } from '../components/FirebaseProvider';

export function DocumentEditor({ projectId }: { projectId: string }) {
  const { documentId } = useParams<{ documentId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  // Track remote vs local sync to prevent cursor jumping as much as possible
  // In a real app we'd use Yjs/Quill, but this serves as a basic implementation
  
  useEffect(() => {
    if (!documentId) return;
    const unsub = onSnapshot(doc(db, `projects/${projectId}/documents/${documentId}`), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        setTitle(data.title);
        // Only update content if we aren't the one actively typing it (basic conflict avoidance)
        // For better experience without a CRDT library, we just blindly overwrite,
        // which might cause cursor jumps if edited concurrently but keeps them in sync.
        setContent(data.content || '');
      }
    }, err => handleFirestoreError(err, OperationType.GET, 'documents'));
    return unsub;
  }, [projectId, documentId]);

  const saveToFirebase = useCallback(async (newTitle: string, newContent: string) => {
    if (!documentId || !user) return;
    setIsSaving(true);
    try {
      await updateDoc(doc(db, `projects/${projectId}/documents/${documentId}`), {
        title: newTitle,
        content: newContent,
        lastEditedBy: user.uid,
        updatedAt: serverTimestamp()
      });
    } catch(err) {
      handleFirestoreError(err, OperationType.UPDATE, 'documents');
    } finally {
      setIsSaving(false);
    }
  }, [projectId, documentId, user]);

  useEffect(() => {
    const handler = setTimeout(() => {
      saveToFirebase(title, content);
    }, 1000);
    return () => clearTimeout(handler);
  }, [title, content, saveToFirebase]);

  return (
    <div className="flex flex-col h-full absolute inset-0 bg-white">
      <div className="flex items-center gap-4 p-4 border-b border-gray-200 shrink-0">
        <button onClick={() => navigate('..')} className="text-gray-500 hover:text-gray-900 p-2 rounded-lg hover:bg-gray-100">
          <ArrowLeft size={20} />
        </button>
        <input 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="text-xl font-bold bg-transparent border-none outline-none focus:ring-2 focus:ring-indigo-500 rounded px-2 w-full max-w-lg"
          placeholder="Document Title"
        />
        <div className="ml-auto text-sm text-gray-500 flex items-center gap-2">
          {isSaving ? <span className="flex items-center gap-1"><Save size={14} className="animate-pulse" /> Saving...</span> : 'Saved'}
        </div>
      </div>
      <div className="flex-1 w-full max-w-4xl mx-auto p-8 overflow-y-auto">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full h-full min-h-[500px] resize-none border-none outline-none text-gray-800 leading-relaxed text-lg"
          placeholder="Start typing your document here..."
        />
      </div>
    </div>
  );
}
