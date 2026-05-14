import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { Routes, Route, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../components/FirebaseProvider';
import { FileText, Plus } from 'lucide-react';
import { format } from 'date-fns';
import { DocumentEditor } from './DocumentEditor';

export function DocumentsView({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    const q = query(collection(db, `projects/${projectId}/documents`));
    const unsub = onSnapshot(q, snap => {
      setDocuments(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, err => handleFirestoreError(err, OperationType.LIST, 'documents'));
    return unsub;
  }, [projectId]);

  const createDoc = async () => {
    try {
      const docRef = await addDoc(collection(db, `projects/${projectId}/documents`), {
        title: 'Untitled Document',
        content: '',
        lastEditedBy: user?.uid,
        updatedAt: serverTimestamp()
      });
      navigate(`${docRef.id}`);
    } catch(err) {
      handleFirestoreError(err, OperationType.CREATE, 'documents');
    }
  };

  return (
    <Routes>
      <Route path="/" element={
        <div className="p-8 absolute inset-0 overflow-y-auto w-full">
          <div className="flex justify-between items-center mb-8 max-w-4xl mx-auto">
             <h3 className="text-2xl font-bold text-gray-900">Documents</h3>
             <button onClick={createDoc} className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-indigo-700">
               <Plus size={20} /> New Document
             </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {documents.map(doc => (
              <Link key={doc.id} to={doc.id} className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow group flex flex-col h-40">
                <div className="flex items-center gap-3 mb-2 text-gray-700 group-hover:text-indigo-600 transition-colors">
                  <FileText size={24} />
                  <h4 className="font-semibold text-lg truncate">{doc.title}</h4>
                </div>
                <p className="text-sm text-gray-500 line-clamp-2 mt-2 break-words text-left">
                  {doc.content || 'Empty document.'}
                </p>
                <div className="mt-auto pt-4 text-xs text-gray-400">
                  Last edited: {doc.updatedAt ? format(new Date(doc.updatedAt), 'MMM d, yyyy') : '...'}
                </div>
              </Link>
            ))}
          </div>
        </div>
      } />
      <Route path=":documentId" element={<DocumentEditor projectId={projectId} />} />
    </Routes>
  );
}
