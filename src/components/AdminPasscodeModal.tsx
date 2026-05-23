/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Lock, X, Fingerprint, Eye, EyeOff, Terminal } from 'lucide-react';

interface AdminPasscodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AdminPasscodeModal({ isOpen, onClose, onSuccess }: AdminPasscodeModalProps) {
  const [passcode, setPasscode] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setPasscode('');
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const key = passcode.trim().toLowerCase();
    
    if (!key) {
      setError('Administrative credential identifier is required.');
      return;
    }

    setLoading(true);

    // Simulate database lookup of crypto token and custom stored passcode
    setTimeout(() => {
      setLoading(false);
      const storedPasscode = localStorage.getItem('aura_admin_passcode') || 'admin';
      const defaultKeys = ['admin', 'admin123', 'aura-admin', 'warehouse'];
      
      if (key === storedPasscode.trim().toLowerCase() || defaultKeys.includes(key)) {
        onSuccess();
        onClose();
      } else {
        setError('Clearance ID mismatch. Administrative privileges denied.');
      }
    }, 750);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Dark blurred background mesh */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          onClick={onClose}
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative w-full max-w-sm rounded-[24px] bg-slate-900 border border-slate-800 text-white p-6 shadow-2xl overflow-hidden z-10"
        >
          {/* Cyber accents */}
          <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-indigo-500 via-rose-500 to-indigo-500" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-1.5 hover:bg-slate-800 rounded-full cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="flex flex-col items-center text-center mt-3">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 shadow-lg shadow-indigo-500/5">
              <Fingerprint className="h-6 w-6 animate-pulse" />
            </div>

            <h3 className="text-base font-black tracking-wider text-slate-100 uppercase text-[11px] flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-indigo-400" />
              <span>Administrative Clearance</span>
            </h3>
            
            <h2 className="text-lg font-black text-white mt-1">Enter Secret Admin ID</h2>
            <p className="text-[10px] text-slate-400 font-bold mt-1.5 max-w-[240px]">
              Provide authorization key parameters to bypass Retails. Use <code className="text-indigo-400 font-mono px-1 py-0.5 rounded bg-slate-950">admin</code> for prompt login.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div>
              <label htmlFor="admin_secret_key" className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-2">
                Verification Token ID Pass
              </label>
              
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                <input
                  id="admin_secret_key"
                  type={showPass ? 'text' : 'password'}
                  required
                  autoFocus
                  placeholder="••••••••"
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-slate-950 border border-slate-800 rounded-xl focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 text-slate-200 font-bold transition-all text-sm tracking-widest text-center"
                />

                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-305 transition-colors cursor-pointer"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <p className="text-[10px] text-rose-450 text-rose-400 font-bold bg-rose-500/5 border border-rose-500/20 rounded-lg p-2.5 text-center leading-normal">
                ⚠️ {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="h-4 w-4 border-2 border-white/30 border-t-white animate-spin rounded-full" />
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4" />
                  <span>Authenticate Admin</span>
                </>
              )}
            </button>
          </form>

          {/* Absolute decorative background mesh */}
          <div className="absolute -right-16 -bottom-16 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-16 -top-16 w-32 h-32 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
