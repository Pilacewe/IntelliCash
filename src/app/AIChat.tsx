import React from 'react';
import { useState, useRef, useEffect } from 'react';
import { useFinanceData } from '../hooks/useFinanceData';
import { sendAIChatMessage } from '../services/gemini';
import { motion } from 'framer-motion';
import { Send, Bot, User } from 'lucide-react';
import { auth } from '../firebase/config';

export default function AIChat() {
  const { transactions, savingsGoals } = useFinanceData();
  const [messages, setMessages] = useState<{role: 'user'|'model', content: string}[]>([
    { role: 'model', content: 'Halo! Saya IntelliCash, asisten finansial pintar Anda. Ada pertanyaan atau bantuan yang Anda butuhkan tentang pengeluaran atau tabungan Anda?' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const newMsgs = [...messages, { role: 'user' as const, content: input }];
    setMessages(newMsgs);
    setInput('');
    setLoading(true);

    try {
      const response = await sendAIChatMessage(newMsgs, transactions, savingsGoals);
      setMessages([...newMsgs, { role: 'model', content: response }]);
    } catch (err) {
      console.error(err);
      setMessages([...newMsgs, { role: 'model', content: "Maaf, terjadi kesalahan saat menghubungi AI." }]);
    }
    setLoading(false);
  };

  return (
    <div className="h-full flex flex-col pt-2 pb-20 md:pb-6">
      <header className="mb-6 shrink-0">
        <h1 className="text-3xl font-bold tracking-tight">AI Assistant</h1>
        <p className="text-slate-400">Chat with Gemini about your finances.</p>
      </header>

      <div className="flex-1 glass-card rounded-2xl flex flex-col overflow-hidden relative">
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6">
          {messages.map((msg, i) => (
            <motion.div 
              key={i} 
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-4 max-w-[85%] ${msg.role === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <div className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-slate-700 text-slate-300' : 'bg-brand-500/20 text-brand-400'}`}>
                {msg.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div className={`p-4 rounded-2xl text-sm md:text-base leading-relaxed ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-none' : 'bg-[#161616] border border-white/10 text-slate-200 rounded-tl-none'}`} dangerouslySetInnerHTML={{ __html: msg.content.replace(/\\n/g, '<br/>') }} />
            </motion.div>
          ))}
          {loading && (
             <div className="flex gap-4">
                <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center bg-brand-500/20 text-brand-400">
                  <Bot className="w-5 h-5" />
                </div>
                <div className="p-4 rounded-2xl bg-[#161616] border border-white/10 text-slate-400 rounded-tl-none flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce" />
                  <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-75" />
                  <div className="w-2 h-2 rounded-full bg-slate-500 animate-bounce delay-150" />
                </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <div className="p-4 bg-black/60 border-t border-white/10 backdrop-blur-lg rounded-b-2xl">
          <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex gap-2">
            <input 
              id="ai-chat-input"
              value={input} onChange={e=>setInput(e.target.value)}
              placeholder="Ask me anything..." 
              className="flex-1 bg-[#111] border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-brand-500 pr-12 text-slate-100"
            />
            <button disabled={loading || !input.trim()} className="absolute right-2 top-1.5 bottom-1.5 px-3 bg-brand-500 hover:bg-brand-600 text-white rounded-lg transition disabled:opacity-50 flex items-center justify-center">
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
