/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/FirebaseProvider';
import { loginWithGoogle, logout } from './firebase';
import { LogIn, Loader2, LayoutDashboard, LogOut } from 'lucide-react';
import { Projects } from './pages/Projects';
import { ProjectDetails } from './pages/ProjectDetails';

function PrivateRoute() {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-gray-500 w-12 h-12" /></div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-900 font-sans">
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10 w-full shrink-0">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 rounded-md p-1.5 text-white">
            <LayoutDashboard size={20} />
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-900">CollabAI</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <img src={user.photoURL || `https://ui-avatars.com/api/?name=${user.email}`} alt="Avatar" className="w-8 h-8 rounded-full border border-gray-200" />
            <span className="text-sm font-medium hidden md:block">{user.displayName || user.email}</span>
          </div>
          <button onClick={logout} className="text-gray-500 hover:text-gray-900 transition-colors p-2 rounded-md hover:bg-gray-100 flex items-center gap-2">
             <LogOut size={18} />
             <span className="sr-only">Logout</span>
          </button>
        </div>
      </header>
      <main className="flex-1 overflow-hidden flex flex-col h-[calc(100vh-65px)]">
        <Outlet />
      </main>
    </div>
  );
}

function Login() {
  const { user, loading } = useAuth();

  if (loading) {
    return null;
  }

  if (user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center text-center border border-gray-100">
        <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-indigo-500/30 shadow-lg mb-6">
          <LayoutDashboard size={32} />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to CollabAI</h1>
        <p className="text-gray-500 mb-8 max-w-sm">
          Your real-time workspace for teams. Edit docs, chat, and track projects seamlessly.
        </p>
        <button
          onClick={loginWithGoogle}
          className="flex items-center gap-3 bg-white border border-gray-300 text-gray-700 px-6 py-3 rounded-xl hover:bg-gray-50 hover:border-gray-400 transition-all font-medium shadow-sm w-full justify-center group"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5 group-hover:scale-110 transition-transform" />
          Continue with Google
        </button>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route path="/" element={<Projects />} />
            <Route path="/projects/:projectId/*" element={<ProjectDetails />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

