import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { motion } from 'framer-motion';
import { ArrowRight, Bot, PieChart, Shield, Zap } from 'lucide-react';

export default function LandingPage() {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (user) return <Navigate to="/dashboard" />;

  return (
    <div className="min-h-screen bg-dark-900 text-white overflow-hidden selection:bg-brand-500/30">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-brand-600/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] pointer-events-none" />

      <nav className="relative z-10 flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <span className="font-bold text-white text-2xl">I</span>
          </div>
          <span className="font-bold text-2xl tracking-tight">IntelliCash</span>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-slate-300 hover:text-white font-medium transition">Login</Link>
          <Link to="/register" className="bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full font-medium transition shadow-lg shadow-brand-500/25">Get Started</Link>
        </div>
      </nav>

      <main className="relative z-10 max-w-7xl mx-auto px-6 md:px-12 pt-20 pb-32">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-500/10 border border-brand-500/20 text-brand-400 text-sm font-medium mb-6">
              <Zap className="w-4 h-4" />
              <span>Smart Finance Tracker 2.0</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] tracking-tight mb-6">
              Master your money with <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-purple-400">AI precision.</span>
            </h1>
            <p className="text-lg md:text-xl text-slate-400 mb-8 leading-relaxed max-w-lg">
              Take control of your personal finances. Track expenses, set savings goals, and get intelligent insights powered by Gemini AI.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-8 py-4 rounded-full font-semibold transition text-lg shadow-xl shadow-brand-500/20">
                Start Tracking Free
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="glass-card rounded-2xl p-2 shadow-2xl border border-white/10 transform rotate-2 hover:rotate-0 transition-all duration-500">
              <img src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop" alt="Dashboard Preview" className="rounded-xl opacity-80" />
              <div className="absolute top-4 right-4 glass-card px-4 py-3 rounded-xl flex items-center gap-3 shadow-xl animate-bounce">
                <Bot className="text-brand-400" />
                <div>
                  <p className="text-sm font-medium">Insight Generated</p>
                  <p className="text-xs text-slate-400">You saved Rp300.000 this week!</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mt-32">
          {[
            { icon: PieChart, title: 'Smart Analytics', desc: 'Beautiful charts and deep dives into your spending habits.' },
            { icon: Bot, title: 'AI Assistant', desc: 'Chat with your personal financial advisor 24/7 for tailored advice.' },
            { icon: Shield, title: 'Secure & Private', desc: 'Enterprise-grade security powered by Firebase infrastructure.' }
          ].map((feature, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 + (i * 0.1) }}
              className="glass-card p-8 rounded-2xl border border-white/10 hover:border-brand-500/50 transition-colors"
            >
              <div className="w-12 h-12 bg-brand-500/20 rounded-xl flex items-center justify-center mb-6">
                <feature.icon className="w-6 h-6 text-brand-400" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
              <p className="text-slate-400">{feature.desc}</p>
            </motion.div>
          ))}
        </div>
      </main>
    </div>
  );
}
