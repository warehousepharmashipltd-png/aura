/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { User as UserType, Product } from '../types';
import {
  User,
  MapPin,
  Save,
  LogOut,
  Moon,
  Sun,
  Camera,
  CheckCircle,
  Sparkles
} from 'lucide-react';

interface UserDashboardProps {
  user: UserType;
  onLogout: () => void;
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
}

export default function UserDashboard({
  user,
  onLogout,
  theme,
  onToggleTheme
}: UserDashboardProps) {
  // Editable customer shipping details
  const [addrName, setAddrName] = useState('');
  const [addrLine1, setAddrLine1] = useState('');
  const [addrCity, setAddrCity] = useState('Dhaka');
  const [addrState, setAddrState] = useState('Dhaka');
  const [addrZip, setAddrZip] = useState('1209');
  const [addrCountry, setAddrCountry] = useState('Bangladesh');
  const [addrPhone, setAddrPhone] = useState('');
  const [isEditingAddress, setIsEditingAddress] = useState(false);
  const [addressSavedMsg, setAddressSavedMsg] = useState('');

  const loadUserData = () => {
    const storedUser = localStorage.getItem('aura_current_user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        if (parsed.deliveryAddress) {
          const ad = parsed.deliveryAddress;
          setAddrName(ad.fullName || '');
          setAddrLine1(ad.addressLine1 || '');
          setAddrCity(ad.city || 'Dhaka');
          setAddrState(ad.state || 'Dhaka');
          setAddrZip(ad.postalCode || '1209');
          setAddrCountry(ad.country || 'Bangladesh');
          setAddrPhone(ad.phone || '');
        } else {
          setAddrName(parsed.fullName || '');
          setAddrPhone(parsed.phoneNumber || parsed.email || '');
          setAddrLine1('');
          setAddrCity('Dhaka');
          setAddrState('Dhaka');
          setAddrZip('1209');
          setAddrCountry('Bangladesh');
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  useEffect(() => {
    loadUserData();
    window.addEventListener('storage', loadUserData);
    return () => window.removeEventListener('storage', loadUserData);
  }, [user]);

  const handleSaveDeliveryDetails = () => {
    const storedUser = localStorage.getItem('aura_current_user');
    if (!storedUser) return;
    try {
      const parsedUser = JSON.parse(storedUser);
      const deliveryAddress = {
        fullName: addrName,
        addressLine1: addrLine1,
        city: addrCity,
        state: addrState,
        postalCode: addrZip,
        country: addrCountry,
        phone: addrPhone
      };

      // 1. Update current user
      parsedUser.deliveryAddress = deliveryAddress;
      localStorage.setItem('aura_current_user', JSON.stringify(parsedUser));

      // 2. Update users list
      const usersStr = localStorage.getItem('aura_users');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const matchIdx = users.findIndex((u: any) => u.email.toLowerCase() === parsedUser.email.toLowerCase());
        if (matchIdx > -1) {
          users[matchIdx].deliveryAddress = deliveryAddress;
          localStorage.setItem('aura_users', JSON.stringify(users));
        }
      }

      setIsEditingAddress(false);
      setAddressSavedMsg('Delivery coordinates updated successfully!');
      setTimeout(() => setAddressSavedMsg(''), 3000);
      
      // Notify other tabs/components
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  // Avatar presets
  const AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop'
  ];

  const [currentAvatar, setCurrentAvatar] = useState(user.avatarUrl);

  const handleSelectAvatar = (url: string) => {
    setCurrentAvatar(url);
    const storedUser = localStorage.getItem('aura_current_user');
    if (storedUser) {
      const parsed = JSON.parse(storedUser);
      parsed.avatarUrl = url;
      localStorage.setItem('aura_current_user', JSON.stringify(parsed));
    }
    // Update matching in database
    const usersString = localStorage.getItem('aura_users');
    if (usersString) {
      const allUsers = JSON.parse(usersString);
      const match = allUsers.find((u: any) => u.email.toLowerCase() === user.email.toLowerCase());
      if (match) {
        match.avatarUrl = url;
        localStorage.setItem('aura_users', JSON.stringify(allUsers));
      }
    }
    window.dispatchEvent(new Event('storage'));
  };

  return (
    <div className={`max-w-4xl mx-auto px-4 py-8 transition-colors duration-300 ${theme === 'dark' ? 'text-slate-100' : 'text-slate-800'}`}>
      
      {/* Toast Notification for Saved Address */}
      {addressSavedMsg && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2.5 text-xs font-black tracking-wide border border-emerald-500/50">
          <CheckCircle className="h-4 w-4 shrink-0 animate-bounce" />
          <span>{addressSavedMsg}</span>
        </div>
      )}

      {/* Main Grid Wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Identity & Mode Choice */}
        <div className={`p-8 rounded-[32px] border flex flex-col items-center justify-between text-center ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-100/45'}`}>
          <div className="w-full space-y-6">
            <div className="flex items-center justify-center gap-1.5 text-indigo-500">
              <Sparkles className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">Boutique Profile Mode</span>
            </div>

            {/* Picture Portrait & Preset Selectors */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative group">
                <div className="h-28 w-28 rounded-full overflow-hidden border-4 border-indigo-500/10 shadow-lg bg-slate-100">
                  <img
                    src={currentAvatar}
                    alt={user.fullName}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="absolute bottom-1 right-1 bg-indigo-600 text-white p-1.5 rounded-full border-2 border-white shadow-md">
                  <Camera className="h-3.5 w-3.5" />
                </div>
              </div>

              {/* Avatar Selector Sliders */}
              <div className="space-y-1.5 w-full">
                <span className="block text-[9px] font-black uppercase tracking-wider text-slate-400">Choose portrait preset</span>
                <div className="flex items-center justify-center gap-2.5">
                  {AVATARS.map((av, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectAvatar(av)}
                      className={`h-8 w-8 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${currentAvatar === av ? 'border-indigo-600 scale-110 shadow-md shadow-indigo-100' : 'border-slate-200 hover:border-indigo-600'}`}
                    >
                      <img src={av} alt="Preset selector" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name Input / Display */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100/50">
              <span className={`block text-[10px] font-black uppercase tracking-wider ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>Member Signature Identity</span>
              <h2 className={`text-xl font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{user.fullName}</h2>
              <p className="text-xs font-mono text-slate-400 font-bold">{user.phoneNumber || user.email}</p>
            </div>

            {/* MODE TOGGLE SWITCH (Light vs Dark) */}
            <div className={`p-4 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50 border-slate-200/50'} flex flex-col gap-2.5`}>
              <span className="block text-[9px] font-black uppercase tracking-widest text-slate-400 text-left">App View Style Mode</span>
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold text-left text-slate-500">
                  {theme === 'dark' ? '🌌 Cosmic Dimmed Background' : '☀️ Day Classic Light Theme'}
                </span>
                <button
                  onClick={onToggleTheme}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="h-3.5 w-3.5" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="h-3.5 w-3.5" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="mt-8 flex items-center justify-center gap-2 py-3 px-5 text-xs font-bold text-rose-500 bg-rose-50/10 hover:bg-rose-50/30 rounded-2xl transition-all cursor-pointer border border-rose-500/20"
          >
            <LogOut className="h-4 w-4" />
            <span>End Session</span>
          </button>
        </div>

        {/* Right Column: Premium Delivery Address Editor */}
        <div className={`p-8 rounded-[32px] border ${theme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-100 shadow-xl shadow-slate-100/45'}`}>
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-100/50 pb-4">
              <MapPin className="h-5 w-5 text-indigo-500 shrink-0" />
              <div>
                <h3 className={`text-sm font-black tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-950'}`}>Default Delivery Destination</h3>
                <span className="text-[9px] font-black tracking-wider text-slate-450 uppercase text-slate-400">Used automatically in secure invoices</span>
              </div>
            </div>

            {isEditingAddress ? (
              /* Editable Address Form Formulations */
              <div className="space-y-4 text-xs">
                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Receiver Name</label>
                  <input
                    type="text"
                    value={addrName}
                    onChange={(e) => setAddrName(e.target.value)}
                    className={`w-full px-4 py-2.5 font-bold border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                    placeholder="Recipient Full Name"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Street Address Line 1</label>
                  <input
                    type="text"
                    value={addrLine1}
                    onChange={(e) => setAddrLine1(e.target.value)}
                    className={`w-full px-4 py-2.5 font-bold border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                    placeholder="123 Boutique Blvd, apt 1A"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">City</label>
                    <input
                      type="text"
                      value={addrCity}
                      onChange={(e) => setAddrCity(e.target.value)}
                      className={`w-full px-4 py-2.5 font-bold border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                      placeholder="e.g. New York"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">State / Prov</label>
                    <input
                      type="text"
                      value={addrState}
                      onChange={(e) => setAddrState(e.target.value)}
                      className={`w-full px-4 py-2.5 font-bold border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                      placeholder="e.g. NY"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Postal ZIP</label>
                    <input
                      type="text"
                      value={addrZip}
                      onChange={(e) => setAddrZip(e.target.value)}
                      className={`w-full px-4 py-2.5 font-bold border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                      placeholder="e.g. 10024"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Country</label>
                    <input
                      type="text"
                      value={addrCountry}
                      onChange={(e) => setAddrCountry(e.target.value)}
                      className={`w-full px-4 py-2.5 font-bold border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                      placeholder="e.g. Bangladesh"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Contact Phone</label>
                  <input
                    type="text"
                    value={addrPhone}
                    onChange={(e) => setAddrPhone(e.target.value)}
                    className={`w-full px-4 py-2.5 font-bold border rounded-xl focus:outline-none focus:ring-1 focus:ring-indigo-600 ${theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-200' : 'bg-white border-slate-200 text-slate-800'}`}
                    placeholder="Recipient Phone Number"
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    onClick={handleSaveDeliveryDetails}
                    className="flex-grow flex items-center justify-center gap-1.5 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black transition-all cursor-pointer"
                  >
                    <Save className="h-4 w-4" />
                    <span>Save coordinates</span>
                  </button>
                  <button
                    onClick={() => setIsEditingAddress(false)}
                    className={`px-4 py-3 border rounded-xl text-xs font-bold cursor-pointer transition-all ${theme === 'dark' ? 'border-slate-800 hover:bg-slate-800' : 'border-slate-200 hover:bg-slate-50'}`}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              /* Display Address Block */
              <div className="space-y-6">
                {addrLine1 ? (
                  <div className="space-y-4">
                    <div className={`p-5 rounded-2xl border ${theme === 'dark' ? 'bg-slate-950 border-slate-850' : 'bg-slate-50 border-slate-150/45'} space-y-2.5 font-sans leading-relaxed text-xs`}>
                      <div>
                        <span className="block text-[9px] font-black uppercase text-slate-400">Receiver's Full Name</span>
                        <span className="font-extrabold text-slate-800 dark:text-slate-100">{addrName}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black uppercase text-slate-400">Street Route Delivery Destination</span>
                        <span className="font-bold text-slate-700 dark:text-slate-300">{addrLine1}</span>
                        <span className="block text-slate-500 font-medium">{addrCity}, {addrState} {addrZip}</span>
                        <span className="block text-slate-500 font-medium">{addrCountry}</span>
                      </div>
                      <div>
                        <span className="block text-[9px] font-black uppercase text-slate-400">Recipient contact number</span>
                        <span className="font-mono font-bold text-slate-700 dark:text-slate-300">{addrPhone}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className={`p-8 border border-dashed rounded-3xl text-center flex flex-col items-center justify-center gap-2.5 ${theme === 'dark' ? 'bg-slate-950/20 border-slate-800' : 'bg-slate-50 border-slate-200'}`}>
                    <MapPin className="h-8 w-8 text-slate-400 shrink-0" />
                    <p className="text-xs text-slate-404 font-bold text-slate-400">
                      You have not designated any localized delivery addresses yet.
                    </p>
                  </div>
                )}

                <button
                  onClick={() => setIsEditingAddress(true)}
                  className="w-full py-4.5 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg hover:shadow-indigo-100 dark:hover:shadow-none text-white text-xs font-black tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg"
                >
                  {addrLine1 ? 'Modify Address details' : 'Configure address details'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
