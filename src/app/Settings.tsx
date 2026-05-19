import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Settings as SettingsIcon, Save, Heart, Shield, User as UserIcon, Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { updatePassword, updateProfile, getAuth } from 'firebase/auth';

export default function Settings() {
  const { user } = useAuth();
  
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [profileMessage, setProfileMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [securityMessage, setSecurityMessage] = useState('');
  const [securityLoading, setSecurityLoading] = useState(false);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [smsNotifs, setSmsNotifs] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    setProfileLoading(true);
    try {
      await updateProfile(user, { displayName });
      setProfileMessage('Profile updated successfully!');
      setTimeout(() => setProfileMessage(''), 3000);
    } catch (err: any) {
      setProfileMessage(err.message || 'Failed to update profile');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newPassword) return;
    setSecurityLoading(true);
    try {
      await updatePassword(user, newPassword);
      setSecurityMessage('Password updated successfully!');
      setNewPassword('');
      setTimeout(() => setSecurityMessage(''), 3000);
    } catch (err: any) {
      if (err.code === 'auth/requires-recent-login') {
        setSecurityMessage('Please sign out and sign in again to change password.');
      } else {
        setSecurityMessage(err.message || 'Failed to update password');
      }
    } finally {
      setSecurityLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
             <SettingsIcon className="w-8 h-8 text-brand-400" /> Settings
           </h1>
           <p className="text-slate-400 mt-1">Manage your account profile, security, and preferences.</p>
        </div>
      </header>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-6">
          
          {/* Profile Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-6 rounded-2xl relative overflow-hidden">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <UserIcon className="w-5 h-5 text-brand-400" /> 
              Profile Details
            </h2>
            <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Display Name</label>
                  <input value={displayName} onChange={e=>setDisplayName(e.target.value)} type="text" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 focus:ring-brand-500 focus:border-brand-500 transition outline-none" placeholder="Your Name" />
                </div>
                <div>
                  <label className="block text-sm mb-1 text-slate-400">Email Address</label>
                  <input value={user?.email || ''} readOnly disabled type="email" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 opacity-50 cursor-not-allowed" />
                </div>
              </div>
              
              {profileMessage && <div className="text-sm text-green-400 bg-green-400/10 p-3 rounded-xl border border-green-400/20">{profileMessage}</div>}

              <div className="pt-2">
                <button disabled={profileLoading} type="submit" className="bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition flex items-center gap-2 w-full justify-center md:w-auto">
                  <Save className="w-5 h-5" /> {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          </motion.div>

          {/* Security Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-card p-6 rounded-2xl relative overflow-hidden bg-gradient-to-br from-red-500/5 to-transparent">
             <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
               <Shield className="w-5 h-5 text-red-400" />
               Account Security
             </h2>
             <form onSubmit={handlePasswordSave} className="space-y-4">
               <div>
                  <label className="block text-sm mb-1 text-slate-400">New Password</label>
                  <input value={newPassword} onChange={e=>setNewPassword(e.target.value)} type="password" minLength={6} placeholder="Enter a new password (min. 6 characters)" className="w-full bg-[#111] border border-white/10 rounded-xl px-4 py-2.5 focus:ring-red-500 focus:border-red-500 transition outline-none" />
                </div>

                {securityMessage && <div className="text-sm text-red-400 bg-red-400/10 p-3 rounded-xl border border-red-400/20">{securityMessage}</div>}

                <div className="pt-2">
                  <button disabled={securityLoading || !newPassword} type="submit" className="bg-red-500 hover:bg-red-600 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl font-medium transition flex items-center gap-2 w-full justify-center md:w-auto">
                    <Shield className="w-5 h-5" /> {securityLoading ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
             </form>
          </motion.div>

          {/* Notifications Section */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="glass-card p-6 rounded-2xl relative overflow-hidden">
             <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
               <Bell className="w-5 h-5 text-blue-400" />
               Notifications
             </h2>
             
             <div className="space-y-4">
               <label className="flex items-center gap-3 cursor-pointer">
                 <input type="checkbox" checked={emailNotifs} onChange={e=>setEmailNotifs(e.target.checked)} className="w-5 h-5 rounded border-white/10 bg-[#111] text-brand-500 focus:ring-brand-500 focus:ring-offset-[#111]" />
                 <div>
                   <p className="text-slate-200 font-medium">Email Alerts</p>
                   <p className="text-xs text-slate-400">Receive weekly summaries and savings goal updates.</p>
                 </div>
               </label>
               <label className="flex items-center gap-3 cursor-pointer">
                 <input type="checkbox" checked={smsNotifs} onChange={e=>setSmsNotifs(e.target.checked)} className="w-5 h-5 rounded border-white/10 bg-[#111] text-brand-500 focus:ring-brand-500 focus:ring-offset-[#111]" />
                 <div>
                   <p className="text-slate-200 font-medium">SMS Alerts</p>
                   <p className="text-xs text-slate-400">Get text messages for large expense warnings.</p>
                 </div>
               </label>
             </div>
          </motion.div>

        </div>

        <div className="space-y-6">
          <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass-card p-6 rounded-2xl bg-gradient-to-b from-brand-500/20 to-transparent border-t border-brand-500/30">
            <h3 className="font-semibold mb-2 flex items-center gap-2 text-brand-300">
              <Heart className="w-5 h-5" /> IntelliCash Pro
            </h3>
            <p className="text-sm text-slate-400 mb-4">Upgrade to Pro for advanced analytics, unlimited AI chat, and family sharing.</p>
            <button className="w-full bg-brand-500 text-white px-4 py-2 rounded-xl text-sm font-medium shadow-lg shadow-brand-500/20 hover:bg-brand-600 transition">
              Upgrade Now
            </button>
          </motion.div>

          <div className="glass-card p-6 rounded-2xl text-center">
             <p className="text-sm text-slate-500 mb-2">IntelliCash - v1.0.0</p>
             <button onClick={() => {
               import('../firebase/config').then(m => m.auth.signOut());
             }} className="text-sm text-red-400 hover:text-red-300 transition w-full py-2 bg-white/5 rounded-xl border border-white/10 font-medium mt-2">Sign Out</button>
          </div>
        </div>
      </div>
    </div>
  );
}
