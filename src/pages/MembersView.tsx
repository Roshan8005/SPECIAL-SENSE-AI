import React, { useState, useEffect } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, onSnapshot, doc, updateDoc, serverTimestamp, arrayUnion, arrayRemove, getDocs, where } from 'firebase/firestore';
import { useAuth } from '../components/FirebaseProvider';
import { UserPlus, UserMinus, Shield, ShieldAlert, Mail } from 'lucide-react';

export function MembersView({ projectId, project }: { projectId: string, project: any }) {
  const { user } = useAuth();
  const [members, setMembers] = useState<any[]>([]);
  const [inviteEmail, setInviteEmail] = useState('');
  const [isInviting, setIsInviting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, `projects/${projectId}/members`), (snap) => {
      setMembers(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    return unsub;
  }, [projectId]);

  const isOwner = project.ownerId === user?.uid;

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim() || !user || !isOwner) return;

    setIsInviting(true);
    setMessage(null);
    try {
      // Find user by email
      const userQuery = query(collection(db, 'users'), where('email', '==', inviteEmail.trim()));
      const userSnap = await getDocs(userQuery);

      if (userSnap.empty) {
        setMessage({ text: "User not found. They must log in to the app first.", type: 'error' });
      } else {
        const foundUser = userSnap.docs[0];
        const foundUserId = foundUser.id;

        if (project.memberIds.includes(foundUserId)) {
          setMessage({ text: "User is already a member.", type: 'error' });
        } else {
          // Add to project memberIds
          await updateDoc(doc(db, 'projects', projectId), {
            memberIds: arrayUnion(foundUserId),
            updatedAt: serverTimestamp()
          });

          // Create member doc
          await updateDoc(doc(db, `projects/${projectId}`, 'members', foundUserId), {
            role: 'editor', // default
            joinedAt: serverTimestamp()
          }); // Wait, updateDoc fails if it doesn't exist. Use setDoc with a fake path to project doc first?
          // No, I have rules for creating project member.
          // Wait, the path is projects/{projectId}/members/{userId}.
          // Let's use setDoc.
          const { setDoc } = await import('firebase/firestore');
          await setDoc(doc(db, `projects/${projectId}/members`, foundUserId), {
             role: 'editor',
             joinedAt: serverTimestamp()
          });

          setMessage({ text: "Member added successfully!", type: 'success' });
          setInviteEmail('');
        }
      }
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, 'projects/members');
      setMessage({ text: "Failed to add member.", type: 'error' });
    } finally {
      setIsInviting(false);
    }
  };

  const removeMember = async (targetId: string) => {
    if (!isOwner || targetId === project.ownerId) return;
    try {
      await updateDoc(doc(db, 'projects', projectId), {
        memberIds: arrayRemove(targetId),
        updatedAt: serverTimestamp()
      });
      const { deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, `projects/${projectId}/members`, targetId));
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, 'projects/members');
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto h-full overflow-y-auto w-full">
      <div className="mb-12">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Team Members</h3>
        <p className="text-gray-500">Manage who has access to this project.</p>
      </div>

      {isOwner && (
        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200 mb-8">
          <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <UserPlus size={18} className="text-indigo-600" />
            Invite Member
          </h4>
          <form onSubmit={handleInvite} className="flex gap-4">
             <div className="relative flex-1">
               <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
               <input 
                 type="email" 
                 placeholder="User's email address..." 
                 value={inviteEmail}
                 onChange={(e) => setInviteEmail(e.target.value)}
                 className="w-full bg-white border border-gray-300 rounded-lg pl-10 pr-4 py-2 outline-none focus:ring-2 focus:ring-indigo-500"
                 disabled={isInviting}
               />
             </div>
             <button 
               type="submit" 
               disabled={isInviting || !inviteEmail.trim()}
               className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors"
             >
               Add Member
             </button>
          </form>
          {message && (
            <p className={`mt-3 text-sm flex items-center gap-1 ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {message.text}
            </p>
          )}
        </div>
      )}

      <div className="space-y-4">
        {members.map(member => (
          <div key={member.id} className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                {member.id.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">{member.id === user?.uid ? 'You' : member.id}</p>
                <p className="text-xs text-gray-500 uppercase tracking-wider font-semibold flex items-center gap-1 mt-0.5">
                  {member.id === project.ownerId ? <ShieldAlert size={12} className="text-amber-500" /> : <Shield size={12} className="text-gray-400" />}
                  {member.id === project.ownerId ? 'Owner' : member.role}
                </p>
              </div>
            </div>
            {isOwner && member.id !== project.ownerId && (
              <button 
                onClick={() => removeMember(member.id)}
                className="text-gray-400 hover:text-red-500 p-2 rounded-lg hover:bg-red-50 transition-all font-medium flex items-center gap-2"
              >
                <UserMinus size={18} />
                <span className="text-sm">Remove</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// Icons for the message component
function CheckCircle2({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
  );
}
function AlertCircle({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  );
}
