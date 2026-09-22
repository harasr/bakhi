"use client";

import React, { useState } from 'react';
import { User, ShieldCheck, X, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useAuth } from '@/hooks/use-auth';

export function ProfileModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  const [phone, setPhone] = useState('');
  const [idCard, setIdCard] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setStatus(null);

    try {
      const idToken = await user.getIdToken();
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${idToken}`
        },
        body: JSON.stringify({ phone, idCard })
      });

      const data = await res.json();
      if (data.success) {
        setStatus({ type: 'success', msg: 'Profile synced securely with Zero-Trust backend!' });
        setTimeout(onClose, 2000);
      } else {
        throw new Error(data.error?.message || 'Sync failed');
      }
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-[#0a0a0a] border border-white/20 rounded-3xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-8">
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-white/10 rounded-2xl">
                    <User className="text-white" size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Secure Profile</h2>
                </div>
                <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </div>

              <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-3">
                <ShieldCheck className="text-green-400 shrink-0" size={20} />
                <p className="text-sm text-white/60">
                  Your sensitive data (Phone, ID Card) is encrypted using <span className="text-white font-mono">AES-256-GCM</span> before being stored in our Zero-Trust Cloud SQL.
                </p>
              </div>

              <form onSubmit={handleSync} className="space-y-6">
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">Phone Number (Encrypted)</label>
                  <input 
                    type="tel" 
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    placeholder="+84 90..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-white/40 uppercase tracking-widest mb-2 ml-1">ID Card / CCCD (Encrypted)</label>
                  <input 
                    type="text" 
                    value={idCard}
                    onChange={e => setIdCard(e.target.value)}
                    placeholder="001..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-white placeholder:text-white/20 focus:outline-none focus:border-white/40 transition-colors"
                  />
                </div>

                {status && (
                  <div className={`p-4 rounded-2xl text-sm font-medium ${
                    status.type === 'success' ? 'bg-green-400/10 text-green-400 border border-green-400/20' : 'bg-red-400/10 text-red-400 border border-red-400/20'
                  }`}>
                    {status.msg}
                  </div>
                )}

                <button 
                  disabled={loading}
                  className="w-full bg-white text-black font-bold p-5 rounded-2xl hover:bg-white/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : "Securely Sync Profile"}
                </button>
              </form>
            </div>

            <div className="p-6 bg-white/5 border-t border-white/10 text-center">
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em]">Zero-Trust Security Engine v2.0</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
