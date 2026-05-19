import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Wallet, PieChart, Target, Bot, LogOut, Settings } from 'lucide-react';
import { auth } from '../firebase/config';
import { signOut } from 'firebase/auth';
import { motion } from 'framer-motion';

export default function Sidebar() {
  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Transactions', path: '/transactions', icon: Wallet },
    { name: 'Analytics', path: '/analytics', icon: PieChart },
    { name: 'Savings Goals', path: '/savings', icon: Target },
    { name: 'AI Assistant', path: '/ai-chat', icon: Bot },
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  const handleLogout = () => {
    signOut(auth);
  };

  return (
    <motion.aside 
      initial={{ x: -250 }}
      animate={{ x: 0 }}
      className="w-64 bg-dark-800 border-r border-white/10 flex flex-col hidden md:flex"
    >
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="font-bold text-white text-xl">V</span>
          </div>
          <span className="font-bold text-xl tracking-tight">IntelliCash</span>
        </div>
      </div>

      <nav className="flex-1 py-6 px-3 space-y-1 mt-2">
        {navItems.map((item) => (
          <NavLink
            key={item.name}
            to={item.path}
            id={`nav-${item.name.toLowerCase().replace(/\s+/g, '-')}`}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                isActive 
                  ? 'bg-white/5 border border-white/10 text-white font-medium' 
                  : 'text-slate-400 hover:text-white border border-transparent'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`w-5 h-5 ${isActive ? 'opacity-80' : ''}`} />
                {item.name}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-white/5">
        <button 
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200 w-full"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </motion.aside>
  );
}
