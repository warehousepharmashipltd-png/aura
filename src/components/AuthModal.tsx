/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Mail, Lock, User, Shield, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { hashPassword } from '../utils/crypto';
import { User as UserType } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: UserType) => void;
}

export default function AuthModal({ isOpen, onClose, onAuthSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // Clear states when toggled or closed
  useEffect(() => {
    setError('');
    setSuccess('');
    setEmail('');
    setPassword('');
    setFullName('');
  }, [mode, isOpen]);

  if (!isOpen) return null;

  // Initialize Default Users in localStorage if they don't exist yet
  // This allows instant testing with credentials
  const initializeDemoUsers = async () => {
    const existingUsers = localStorage.getItem('aura_users');
    if (!existingUsers) {
      const demoAdminHash = await hashPassword('admin123');
      const demoUserHash = await hashPassword('guest123');

      const initialUsers = [
        {
          id: 'u_admin',
          email: 'admin@aura.com',
          fullName: 'Alexander Vance (Admin)',
          passwordHash: demoAdminHash,
          joinedDate: 'Oct 2025',
          role: 'admin',
          avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop'
        },
        {
          id: 'u_guest',
          email: 'guest@aura.com',
          fullName: 'Jane Doe',
          passwordHash: demoUserHash,
          joinedDate: 'Jan 2026',
          role: 'customer',
          avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop'
        }
      ];
      localStorage.setItem('aura_users', JSON.stringify(initialUsers));
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credential fields.');
      return;
    }

    try {
      setLoading(true);
      setError('');
      
      // Seed if missing
      await initializeDemoUsers();

      const usersString = localStorage.getItem('aura_users') || '[]';
      const users = JSON.parse(usersString);
      
      const user = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (!user) {
        throw new Error('No user profile found matching this email address.');
      }

      const inputHash = await hashPassword(password);
      if (inputHash !== user.passwordHash) {
        throw new Error('Incorrect password. Please verify and try again.');
      }

      // Format clean auth user
      const authenticatedUser: UserType = {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        avatarUrl: user.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
        joinedDate: user.joinedDate,
        role: user.role
      };

      // Set user
      localStorage.setItem('aura_current_user', JSON.stringify(authenticatedUser));
      setSuccess(`Welcome back, ${user.fullName}!`);
      
      setTimeout(() => {
        onAuthSuccess(authenticatedUser);
        onClose();
      }, 900);

    } catch (err: any) {
      setError(err.message || 'Verification failed. Please check inputs.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !password) {
      setError('All fields are required to register a profile.');
      return;
    }
    if (password.length < 6) {
      setError('Security key must contain at least 6 characters.');
      return;
    }

    try {
      setLoading(true);
      setError('');

      await initializeDemoUsers();

      const usersString = localStorage.getItem('aura_users') || '[]';
      const users = JSON.parse(usersString);

      const checkDup = users.find((u: any) => u.email.toLowerCase() === email.toLowerCase().trim());
      if (checkDup) {
        throw new Error('This email address is already registered.');
      }

      const hash = await hashPassword(password);
      
      // Simple format date
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      // Create new user profile
      const newUserRecord = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        email: email.toLowerCase().trim(),
        fullName: fullName.trim(),
        passwordHash: hash,
        joinedDate: formattedDate,
        role: 'customer',
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?q=80&w=100&auto=format&fit=crop`
      };

      // Push and save
      users.push(newUserRecord);
      localStorage.setItem('aura_users', JSON.stringify(users));

      // Auto sign in user
      const authenticatedUser: UserType = {
        id: newUserRecord.id,
        email: newUserRecord.email,
        fullName: newUserRecord.fullName,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100&auto=format&fit=crop',
        joinedDate: newUserRecord.joinedDate,
        role: 'customer'
      };

      localStorage.setItem('aura_current_user', JSON.stringify(authenticatedUser));
      setSuccess('Profile successfully created! Signing in...');

      setTimeout(() => {
        onAuthSuccess(authenticatedUser);
        onClose();
      }, 900);

    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Please provide your registered email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess('Restoration pass-code link has been simulated to your inbox.');
    }, 800);
  };

  const autofillDemo = async (role: 'customer' | 'admin') => {
    await initializeDemoUsers();
    if (role === 'admin') {
      setEmail('admin@aura.com');
      setPassword('admin123');
    } else {
      setEmail('guest@aura.com');
      setPassword('guest123');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          id="auth_backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Window */}
        <motion.div
          id="auth_modal_box"
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-md overflow-hidden rounded-[32px] bg-white shadow-2xl border border-slate-100 z-10"
        >
          {/* Header Bar */}
          <div className="p-6 pb-0 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="h-2 w-2 rounded-full bg-indigo-600 animate-pulse"></span>
              <h3 className="text-lg font-black text-indigo-600 uppercase tracking-widest text-[10px]">
                {mode === 'login' ? 'MEMBERSHIP ACCESS' : mode === 'register' ? 'NEW ENROLLMENT' : 'PASSWORD RECOVERY'}
              </h3>
            </div>
            <button
              id="close_auth_modal"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-950 rounded-full hover:bg-slate-50 transition-colors cursor-pointer border border-slate-100/50"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="p-6">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-7">
              {mode === 'login' && 'Sign in to Aura'}
              {mode === 'register' && 'Create your account'}
              {mode === 'forgot' && 'Reset your password'}
            </h2>
            <p className="text-xs text-slate-455 text-slate-500 mt-1 mb-5 font-semibold">
              {mode === 'login' && 'Unlock order summaries, save coupons, and quick payouts.'}
              {mode === 'register' && 'Gain entry to members-only essentials.'}
              {mode === 'forgot' && 'Enter your email to receive recovery parameters.'}
            </p>

            {/* Notifications */}
            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  id="auth_error_alert"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 flex items-start gap-2 rounded-xl bg-rose-50 p-3 text-xs text-rose-700 border border-rose-100/60 font-bold"
                >
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </motion.div>
              )}
              {success && (
                <motion.div
                  id="auth_success_alert"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="mb-4 flex items-start gap-2 rounded-xl bg-indigo-50 p-3 text-xs text-indigo-800 border border-indigo-100/60 font-bold"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5 text-indigo-600" />
                  <span>{success}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Auth Form */}
            <form onSubmit={mode === 'login' ? handleLogin : mode === 'register' ? handleRegister : handleForgotPassword} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-650 text-slate-700 mb-1" htmlFor="auth_fullname">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="auth_fullname"
                      type="text"
                      required
                      placeholder="Jane Doe"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 transition-colors bg-white font-bold text-slate-800"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-650 text-slate-700 mb-1" htmlFor="auth_email">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    id="auth_email"
                    type="email"
                    required
                    placeholder="user@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 transition-colors bg-white font-bold text-slate-800"
                  />
                </div>
              </div>

              {mode !== 'forgot' && (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-650 text-slate-700" htmlFor="auth_password">
                      Security Password
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => setMode('forgot')}
                        className="text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                      >
                        Reset Password?
                      </button>
                    )}
                  </div>
                  <div className="relative bg-white">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      id="auth_password"
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-600/15 focus:border-indigo-600 transition-colors bg-white font-bold text-slate-800"
                    />
                  </div>
                </div>
              )}

              <button
                id="submit_auth_form"
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm transition-all cursor-pointer mt-6 disabled:opacity-50 shadow-md shadow-indigo-100"
              >
                {loading ? (
                  <span className="inline-block h-4.5 w-4.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                ) : (
                  <>
                    <span>
                      {mode === 'login' && 'Log In to Profile'}
                      {mode === 'register' && 'Register Membership'}
                      {mode === 'forgot' && 'Send recovery check'}
                    </span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Pre-seed Logins */}
            {mode === 'login' && (
              <div className="mt-6 border-t border-slate-100 pt-5">
                <p className="text-center text-[10px] font-bold text-slate-405 text-slate-400 mb-3 tracking-wider uppercase">
                  ⚡ INSTANT DEMO TESTING CREDENTIALS
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    id="autofill_customer"
                    type="button"
                    onClick={() => autofillDemo('customer')}
                    className="flex flex-col items-center justify-center py-2 px-3 border border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-slate-50 transition-all text-left text-xs text-slate-600 bg-white cursor-pointer"
                  >
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      👤 Demo Customer
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">guest@aura.com / guest123</span>
                  </button>
                  <button
                    id="autofill_admin"
                    type="button"
                    onClick={() => autofillDemo('admin')}
                    className="flex flex-col items-center justify-center py-2 px-3 border border-slate-100 rounded-2xl hover:border-indigo-600 hover:bg-slate-50 transition-all text-left text-xs text-slate-600 bg-white cursor-pointer"
                  >
                    <span className="font-extrabold text-slate-800 flex items-center gap-1">
                      🛡️ Demo Admin
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">admin@aura.com / admin123</span>
                  </button>
                </div>
              </div>
            )}

            {/* Toggle Modes Footer */}
            <div className="mt-6 text-center text-xs text-slate-500 font-bold">
              {mode === 'login' ? (
                <span>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('register')}
                    className="font-extrabold text-indigo-600 underline underline-offset-2 hover:text-indigo-700 transition-colors ml-1 cursor-pointer"
                  >
                    Set up Profile
                  </button>
                </span>
              ) : (
                <span>
                  Already a shopping member?{' '}
                  <button
                    type="button"
                    onClick={() => setMode('login')}
                    className="font-extrabold text-indigo-600 underline underline-offset-2 hover:text-indigo-700 transition-colors ml-1 cursor-pointer"
                  >
                    Access Membership
                  </button>
                </span>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
