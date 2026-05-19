import React from 'react';
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate, NavLink } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import LandingPage from './app/LandingPage';
import Dashboard from './app/Dashboard';
import Transactions from './app/Transactions';
import Analytics from './app/Analytics';
import Savings from './app/Savings';
import AIChat from './app/AIChat';
import Settings from './app/Settings';
import Login from './app/Login';
import Register from './app/Register';
import Sidebar from './components/Sidebar';
import { AnimatePresence } from 'framer-motion';
import { LayoutDashboard, Wallet, PieChart, Target, Bot, Settings as SettingsIcon } from 'lucide-react';

import OnboardingTutorial from './components/OnboardingTutorial';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="h-screen w-screen flex items-center justify-center bg-dark-900 text-white">Loading...</div>;
  if (!user) return <Navigate to="/login" />;
  return (
    <div className="flex h-[100dvh] bg-dark-900 text-slate-50 overflow-hidden relative">
      <OnboardingTutorial />
      <Sidebar />
      <main className="flex-1 overflow-y-auto px-4 py-6 md:p-8">
        <AnimatePresence mode="wait">
          {children}
        </AnimatePresence>
      </main>

      {/* Mobile Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-[#0A0A0A] border-t border-white/10 flex justify-around p-3 pb-safe z-40">
        <NavLink id="nav-dashboard-mobile" to="/dashboard" className={({isActive}) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-brand-400' : 'text-slate-400'}`}><LayoutDashboard className="w-5 h-5" /><span className="text-[10px]">Home</span></NavLink>
        <NavLink id="nav-transactions-mobile" to="/transactions" className={({isActive}) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-brand-400' : 'text-slate-400'}`}><Wallet className="w-5 h-5" /><span className="text-[10px]">Trans</span></NavLink>
        <NavLink id="nav-analytics-mobile" to="/analytics" className={({isActive}) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-brand-400' : 'text-slate-400'}`}><PieChart className="w-5 h-5" /><span className="text-[10px]">Stats</span></NavLink>
        <NavLink id="nav-savings-goals-mobile" to="/savings" className={({isActive}) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-brand-400' : 'text-slate-400'}`}><Target className="w-5 h-5" /><span className="text-[10px]">Goals</span></NavLink>
        <NavLink id="nav-settings-mobile" to="/settings" className={({isActive}) => `flex flex-col items-center gap-1 p-2 ${isActive ? 'text-brand-400' : 'text-slate-400'}`}><SettingsIcon className="w-5 h-5" /><span className="text-[10px]">Settings</span></NavLink>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/transactions" element={<ProtectedRoute><Transactions /></ProtectedRoute>} />
          <Route path="/analytics" element={<ProtectedRoute><Analytics /></ProtectedRoute>} />
          <Route path="/savings" element={<ProtectedRoute><Savings /></ProtectedRoute>} />
          <Route path="/ai-chat" element={<ProtectedRoute><AIChat /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
