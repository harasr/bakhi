"use client";

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Trophy, X, Medal } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface LeaderboardEntry {
  displayName: string | null;
  photoUrl: string | null;
  highScore: number;
}

export function Leaderboard({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetch('/api/leaderboard')
        .then(res => res.json())
        .then(setData)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="w-full max-w-md bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <Trophy className="text-yellow-400" size={24} />
                <h2 className="text-xl font-bold text-white uppercase tracking-wider">Top 10 Rankings</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full text-white/50 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-4 max-h-[60vh] overflow-y-auto">
              {loading ? (
                <div className="flex justify-center p-8">
                  <div className="w-8 h-8 border-4 border-yellow-400/20 border-t-yellow-400 rounded-full animate-spin" />
                </div>
              ) : data.length > 0 ? (
                <div className="space-y-2">
                  {data.map((entry, i) => (
                    <motion.div 
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`flex items-center justify-between p-3 rounded-xl border ${
                        i === 0 ? 'bg-yellow-400/10 border-yellow-400/20' : 
                        i === 1 ? 'bg-gray-400/10 border-gray-400/20' :
                        i === 2 ? 'bg-orange-400/10 border-orange-400/20' :
                        'bg-white/5 border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-8 text-center font-bold text-white/40">
                          {i === 0 ? <Medal className="text-yellow-400 mx-auto" size={20} /> :
                           i === 1 ? <Medal className="text-gray-400 mx-auto" size={20} /> :
                           i === 2 ? <Medal className="text-orange-400 mx-auto" size={20} /> :
                           i + 1}
                        </div>
                        <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/10">
                          <Image 
                            src={entry.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${entry.displayName}`} 
                            alt={entry.displayName || "User"}
                            fill
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <span className="font-medium text-white/90">
                          {entry.displayName || "Anonymous Player"}
                        </span>
                      </div>
                      <span className="font-bold text-xl text-white">
                        {entry.highScore.toLocaleString()}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center p-8 text-white/30">
                  No scores recorded yet. Be the first!
                </div>
              )}
            </div>

            <div className="p-4 bg-white/5 text-center text-xs text-white/20 uppercase tracking-widest border-t border-white/5">
              Zero-Trust Secure Leaderboard Engine
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
