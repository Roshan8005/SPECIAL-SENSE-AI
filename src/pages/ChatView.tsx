import React, { useState, useEffect, useRef } from 'react';
import { db, handleFirestoreError, OperationType } from '../firebase';
import { collection, query, orderBy, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../components/FirebaseProvider';
import { Send } from 'lucide-react';
import { format } from 'date-fns';

export function ChatView({ projectId }: { projectId: string }) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const channelId = 'general';

  useEffect(() => {
    const q = query(
      collection(db, `projects/${projectId}/channels/${channelId}/messages`),
      orderBy('createdAt', 'asc')
    );

    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    }, (err) => handleFirestoreError(err, OperationType.LIST, 'messages'));

    return unsub;
  }, [projectId]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;
    const text = newMessage.trim();
    setNewMessage('');
    try {
      await addDoc(collection(db, `projects/${projectId}/channels/${channelId}/messages`), {
        text,
        senderId: user.uid,
        senderName: user.displayName || user.email,
        createdAt: serverTimestamp()
      });
    } catch(err) {
      handleFirestoreError(err, OperationType.CREATE, 'messages');
    }
  };

  return (
    <div className="flex flex-col h-full absolute inset-0">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-lg flex items-center gap-2">
          <span className="text-gray-400">#</span> general
        </h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map(msg => (
          <div key={msg.id} className="flex flex-col">
            <div className="flex items-baseline gap-2">
              <span className="font-bold text-gray-900">{msg.senderName}</span>
              <span className="text-xs text-gray-500">
                {msg.createdAt ? format(new Date(msg.createdAt), 'MMM d, h:mm a') : '...'}
              </span>
            </div>
            <p className="text-gray-800 break-words">{msg.text}</p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="p-4 bg-white border-t border-gray-200 shrink-0">
        <form onSubmit={handleSend} className="flex gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1 bg-gray-100 border-transparent focus:bg-white focus:border-indigo-500 rounded-lg px-4 py-2 border shadow-sm outline-none"
            placeholder="Message #general..."
          />
          <button type="submit" disabled={!newMessage.trim()} className="bg-indigo-600 text-white p-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50">
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
