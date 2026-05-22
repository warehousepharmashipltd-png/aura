/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  User as UserType,
  Order,
  Product
} from '../types';
import {
  User,
  ShoppingBag,
  TrendingUp,
  Package,
  LogOut,
  Sliders,
  Sparkles,
  MapPin,
  Calendar,
  Lock,
  Plus,
  Compass,
  FileCheck,
  TrendingDown,
  Tag,
  BadgeAlert,
  Save,
  Activity
} from 'lucide-react';

interface UserDashboardProps {
  user: UserType;
  onLogout: () => void;
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
  activeTab: 'orders' | 'admin';
  onChangeTab: (tab: 'orders' | 'admin') => void;
}

export default function UserDashboard({
  user,
  onLogout,
  products,
  onUpdateProducts,
  activeTab,
  onChangeTab
}: UserDashboardProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  // Editable administrative values
  const [editingProdId, setEditingProdId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editStock, setEditStock] = useState<number>(0);

  // Avatar presets
  const AVATARS = [
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=100&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=100&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=100&auto=format&fit=crop'
  ];

  const [currentAvatar, setCurrentAvatar] = useState(user.avatarUrl);

  const isAdmin = user.role === 'admin';

  // Fetch orders from LocalStorage linked to email
  useEffect(() => {
    const fetchOrders = () => {
      const allOrdersString = localStorage.getItem('aura_orders') || '[]';
      const allOrders: any[] = JSON.parse(allOrdersString);
      
      // Filter orders by active customer's email
      const customerEmail = user.email.toLowerCase().trim();
      const filtered = allOrders.filter((o) => o?.customerEmail === customerEmail);
      setOrders(filtered);
      if (filtered.length > 0) {
        setSelectedOrder(filtered[0]);
      } else {
        setSelectedOrder(null);
      }
    };

    fetchOrders();

    // Set up local storage listening to update instantly when a checkout occurs
    window.addEventListener('storage', fetchOrders);
    return () => window.removeEventListener('storage', fetchOrders);
  }, [user.email]);

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
  };

  // Metrics (Admin mode)
  const calculateTotalSales = () => {
    const allOrdersString = localStorage.getItem('aura_orders') || '[]';
    const allOrders: Order[] = JSON.parse(allOrdersString);
    return allOrders.reduce((sum, order) => sum + order.total, 0);
  };

  const calculateTotalOrdersCount = () => {
    const allOrdersString = localStorage.getItem('aura_orders') || '[]';
    return JSON.parse(allOrdersString).length;
  };

  const handleStartEditing = (prod: Product) => {
    setEditingProdId(prod.id);
    setEditPrice(prod.price);
    setEditStock(prod.stock);
  };

  const handleSaveProduct = (prodId: string) => {
    const updated = products.map((p) => {
      if (p.id === prodId) {
        return {
          ...p,
          price: Math.max(1, editPrice),
          stock: Math.max(0, editStock)
        };
      }
      return p;
    });

    onUpdateProducts(updated);
    setEditingProdId(null);
  };

  return (
    <div id="user_dashboard_page" className="grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 md:p-6 max-w-7xl mx-auto">
      
      {/* LEFT COLUMN: Customer Card Profile summary */}
      <div className="lg:col-span-4 space-y-5">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-[32px] border border-slate-150/60 bg-white p-6 shadow-xl shadow-slate-100/30 flex flex-col items-center text-center relative overflow-hidden"
        >
          {/* Admin Tag ribbon */}
          {isAdmin && (
            <div className="absolute top-4 right-4 flex items-center gap-1 text-[9px] font-black text-rose-750 text-rose-700 bg-rose-50 px-2.5 py-1 rounded-xl border border-rose-100 tracking-wider">
              <Compass className="h-3 w-3 animate-spin text-rose-600" />
              <span>SHOP SYSTEM ADMIN</span>
            </div>
          )}

          {/* Avatar Panel details */}
          <div className="relative group mt-6 mb-4">
            <div className="h-20 w-20 rounded-full overflow-hidden border-2 border-indigo-600 shadow-lg shadow-indigo-105-10 shadow-indigo-100">
              <img
                src={currentAvatar}
                alt="Profile Avatar"
                className="h-full w-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="absolute inset-0 bg-indigo-900/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-white font-black cursor-pointer pointer-events-none uppercase tracking-wider">
              Configure
            </div>
          </div>

          <h2 className="text-lg font-black text-slate-900 tracking-tight">{user.fullName}</h2>
          <p className="text-xs text-slate-400 font-bold mt-0.5">{user.email}</p>

          <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-500 bg-slate-50 px-3.5 py-1.5 rounded-full border border-slate-100">
            <Calendar className="h-3.5 w-3.5 text-indigo-600" />
            <span>Member Enrollment: <span className="font-extrabold text-slate-800">{user.joinedDate}</span></span>
          </div>

          {/* Quick interactive Avatar change grid */}
          <div className="w-full mt-6 border-t border-slate-100 pt-5">
            <span className="block text-[9px] uppercase font-black text-slate-400 tracking-widest mb-2">
              SELECT PROFILE COLORWAY:
            </span>
            <div className="flex justify-center gap-2">
              {AVATARS.map((av, idx) => (
                <button
                  id={`avatar_picker_${idx}`}
                  key={idx}
                  onClick={() => handleSelectAvatar(av)}
                  className={`h-7 w-7 rounded-full overflow-hidden border-2 transition-all cursor-pointer ${currentAvatar === av ? 'border-indigo-600 scale-110 shadow-md shadow-indigo-100' : 'border-slate-200 hover:border-indigo-600 grayscale filter hover:grayscale-0'}`}
                >
                  <img src={av} alt="Avatar Selection" className="h-full w-full object-cover" referrerPolicy="no-referrer" />
                </button>
              ))}
            </div>
          </div>

          {/* Switch tab options */}
          <div className="w-full space-y-2 mt-6 pt-5 border-t border-slate-100">
            {isAdmin && (
              <div className="grid grid-cols-2 gap-2 p-1.5 bg-indigo-50/50 rounded-2xl border border-indigo-100/10">
                <button
                  id="tab_orders_btn"
                  onClick={() => onChangeTab('orders')}
                  className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${activeTab === 'orders' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/50' : 'text-slate-500 hover:text-indigo-600'}`}
                >
                  My Orders
                </button>
                <button
                  id="tab_admin_btn"
                  onClick={() => onChangeTab('admin')}
                  className={`py-2 text-xs font-black rounded-xl transition-all cursor-pointer ${activeTab === 'admin' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/50' : 'text-slate-500 hover:text-indigo-600'}`}
                >
                  Manage Shop
                </button>
              </div>
            )}

            <button
              id="dashboard_logout_btn"
              onClick={onLogout}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-extrabold border border-slate-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-700 text-slate-600 transition-all cursor-pointer bg-white"
            >
              <LogOut className="h-4 w-4" />
              <span>Log out from boutique</span>
            </button>
          </div>
        </motion.div>
      </div>

      {/* RIGHT COLUMN: Tab displays */}
      <div className="lg:col-span-8">
        <AnimatePresence mode="wait">
          
          {/* TAB 1: ORDER HISTORIES PANEL */}
          {activeTab === 'orders' && (
            <motion.div
              key="orders_tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              <div className="rounded-[32px] border border-slate-150/60 bg-white p-6 shadow-xl shadow-slate-100/30">
                <div className="flex items-center space-x-2 border-b border-slate-100 pb-4">
                  <ShoppingBag className="h-5 w-5 text-indigo-600" />
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-wide">
                    Purchase Order History logs ({orders.length})
                  </h2>
                </div>

                {orders.length === 0 ? (
                  /* Empty state orders */
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="h-12 w-12 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 mb-4 border border-slate-100">
                      <ShoppingBag className="h-6 w-6 text-indigo-600" />
                    </div>
                    <h3 className="text-sm font-black text-slate-800">No transactions recorded yet</h3>
                    <p className="text-xs text-slate-455 text-slate-400 max-w-[280px] mt-1 font-semibold">
                      Once you finish checking out items, your receipts and freight shipping links will appear here instantly!
                    </p>
                  </div>
                ) : (
                  /* Double column Split order display */
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mt-6">
                    {/* Left Invoice menu selection */}
                    <div className="md:col-span-2 space-y-2 max-h-[460px] overflow-y-auto pr-1">
                      {orders.map((or) => (
                        <button
                          id={`select_order_${or.id}`}
                          key={or.id}
                          onClick={() => setSelectedOrder(or)}
                          className={`w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between cursor-pointer ${selectedOrder?.id === or.id ? 'border-indigo-600 bg-indigo-50/20' : 'border-slate-105 border-slate-100 hover:border-indigo-600 hover:bg-slate-50'}`}
                        >
                          <div className="flex justify-between items-center w-full">
                            <span className="text-[11px] font-mono font-bold text-slate-900 shrink-0">{or.id}</span>
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded-lg border uppercase ${or.status === 'delivered' ? 'bg-emerald-50 text-emerald-800 border-emerald-100' : 'bg-indigo-600 text-white border-indigo-600'}`}>
                              {or.status}
                            </span>
                          </div>
                          
                          <div className="flex justify-between items-baseline w-full mt-3">
                            <span className="text-[10px] text-slate-400 font-bold">{or.date}</span>
                            <span className="text-sm font-black text-slate-950">${or.total}</span>
                          </div>
                        </button>
                      ))}
                    </div>

                    {/* Right active selected Order Details card */}
                    <div className="md:col-span-3">
                      {selectedOrder && (
                        <div className="rounded-[24px] border border-slate-150/60 bg-slate-50/40 p-5 space-y-5 shadow-xs">
                          {/* Invoice Meta details inside card */}
                          <div className="flex justify-between items-start border-b border-slate-100 pb-4">
                            <div>
                              <span className="block text-[11px] font-bold text-slate-900 font-mono tracking-wide">{selectedOrder.id}</span>
                              <span className="block text-[10px] text-slate-400 mt-0.5 font-bold">Checkout Completed: {selectedOrder.date}</span>
                            </div>
                            <div className="text-right">
                              <span className="block text-[9px] uppercase font-black text-slate-400 tracking-wider">Estimated Transit</span>
                              <span className="block text-xs font-extrabold text-slate-800 mt-0.5">UPS Direct Track</span>
                            </div>
                          </div>

                          {/* Shipment status checklist visualizer */}
                          <div>
                            <span className="block text-[9.5px] uppercase font-black text-slate-400 tracking-widest mb-3">Transit Milestone:</span>
                            <div className="grid grid-cols-3 text-center text-[9px] font-sans relative">
                              {/* Connector background */}
                              <div className="absolute top-[34%] left-[16%] right-[16%] h-[2px] bg-slate-200 z-0" />
                              
                              <div className="flex flex-col items-center z-10">
                                <span className="h-5 w-5 rounded-full flex items-center justify-center bg-indigo-600 text-white text-[8px] font-bold border-2 border-white shadow-md shadow-indigo-100">
                                  <FileCheck className="h-2.5 w-2.5" />
                                </span>
                                <span className="font-extrabold text-slate-800 mt-1">Confirmed</span>
                              </div>
                              <div className="flex flex-col items-center z-10">
                                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-white shadow-xs ${selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-200 text-slate-500'}`}>
                                  <Package className="h-2.5 w-2.5" />
                                </span>
                                <span className={selectedOrder.status === 'shipped' || selectedOrder.status === 'delivered' ? 'font-extrabold text-slate-800 mt-1' : 'font-bold text-slate-400 mt-1'}>Dispatched</span>
                              </div>
                              <div className="flex flex-col items-center z-10">
                                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[8px] font-bold border-2 border-white shadow-xs ${selectedOrder.status === 'delivered' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100' : 'bg-slate-200 text-slate-500'}`}>
                                  ✓
                                </span>
                                <span className={selectedOrder.status === 'delivered' ? 'font-extrabold text-emerald-700 mt-1' : 'font-bold text-slate-400 mt-1'}>Arrived</span>
                              </div>
                            </div>
                          </div>

                          {/* Items List details */}
                          <div className="space-y-3">
                            <span className="block text-[9.5px] uppercase font-black text-slate-400 tracking-widest">Purchased items</span>
                            <div className="space-y-2 max-h-[160px] overflow-y-auto">
                              {selectedOrder.items.map((it, i) => (
                                <div key={i} className="flex gap-2.5 items-center justify-between text-xs bg-white p-2 border border-slate-100 rounded-xl">
                                  <div className="flex items-center gap-2">
                                    <img src={it.productImage} className="h-8 w-8 object-cover rounded-lg border border-slate-50" referrerPolicy="no-referrer" />
                                    <div>
                                      <span className="font-black text-slate-800 block leading-tight">{it.productName}</span>
                                      <span className="text-[9px] text-slate-400 font-bold block mt-0.5">Color: {it.selectedColor} {it.selectedSize ? `| Size: ${it.selectedSize}` : ''}</span>
                                    </div>
                                  </div>
                                  <span className="font-extrabold text-slate-700 font-mono text-[10px] shrink-0">
                                    {it.quantity}x ${it.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Delivery address Summary */}
                          <div className="grid grid-cols-2 gap-4 text-[10px] border-t border-slate-100 pt-3">
                            <div>
                              <span className="block font-black text-slate-455 text-slate-400 uppercase tracking-widest text-[8px] mb-1">CONSIGNEE RECIPIENT</span>
                              <span className="font-black text-slate-800 block leading-tight">{selectedOrder.shippingAddress.fullName}</span>
                              <span className="text-slate-500 font-semibold mt-0.5 block leading-tight">{selectedOrder.shippingAddress.addressLine1}, {selectedOrder.shippingAddress.city}</span>
                              <span className="text-slate-500 font-bold font-mono block mt-0.5">Tel: {selectedOrder.shippingAddress.phone}</span>
                            </div>
                            <div>
                              <span className="block font-black text-slate-455 text-slate-400 uppercase tracking-widest text-[8px] mb-1">CARRIER PARAMETERS</span>
                              <span className="font-black text-slate-800 block leading-tight">UPS Express Priority</span>
                              <span className="text-slate-500 font-semibold mt-0.5 block">Log ID: <span className="font-mono font-bold text-slate-800 select-all">{selectedOrder.trackingNumber}</span></span>
                            </div>
                          </div>

                          {/* Order math table ledger */}
                          <div className="border-t border-slate-150 pt-3 text-[10.5px] space-y-1">
                            <div className="flex justify-between text-slate-500 font-medium">
                              <span>Items subtotal price</span>
                              <span className="font-bold">${selectedOrder.subtotal}</span>
                            </div>
                            {selectedOrder.discount > 0 && (
                              <div className="flex justify-between text-emerald-700 font-bold">
                                <span>Promo Coupon Deducted {selectedOrder.couponCodeUsed ? `(${selectedOrder.couponCodeUsed})` : ''}</span>
                                <span>-${selectedOrder.discount}</span>
                              </div>
                            )}
                            <div className="flex justify-between text-slate-500 font-medium">
                              <span>Shipping Handling</span>
                              <span className="font-bold">${selectedOrder.shipping}</span>
                            </div>
                            <div className="flex justify-between text-slate-500 font-medium font-bold">
                              <span>Freight Surcharges (5%)</span>
                              <span className="font-bold">${selectedOrder.tax || Math.round(selectedOrder.subtotal * 0.05)}</span>
                            </div>
                            <div className="flex justify-between font-black text-sm border-t border-dashed border-slate-200 pt-3 text-slate-900 mt-2.5">
                              <span>TOTAL INVOICED REVENUE</span>
                              <span>${selectedOrder.total}</span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* TAB 2: ADMINISTRATIVE CONTROLS DASHBOARD */}
          {activeTab === 'admin' && isAdmin && (
            <motion.div
              key="admin_tab"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {/* Executive Sales KPI Row */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-2xl border border-slate-150/60 bg-white p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 tracking-widest uppercase">AGGREGATED BOUTIQUE SALES</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5 block">${calculateTotalSales().toLocaleString()}</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <TrendingUp className="h-5 w-5" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-150/60 bg-white p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 tracking-widest uppercase">LEDGER INVOICES ISSUED</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5 block">{calculateTotalOrdersCount()} purchases</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-650 bg-indigo-600 text-white flex items-center justify-center">
                    <Package className="h-5 w-5" />
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-150/60 bg-white p-5 shadow-xs flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 tracking-widest uppercase">CATALOG ITEM SKUS</span>
                    <span className="text-xl font-black text-slate-900 mt-0.5 block">{products.length} products</span>
                  </div>
                  <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                    <Sliders className="h-5 w-5" />
                  </div>
                </div>
              </div>

              {/* Central Catalog SKU Inventory adjust table */}
              <div className="rounded-[32px] border border-slate-150/60 bg-white p-6 shadow-xl shadow-slate-100/30">
                <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Sliders className="h-4.5 w-4.5 text-indigo-600" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide">
                      Interactive Inventory Stock & Pricing Portal
                    </h3>
                  </div>
                  <span className="text-[10px] font-bold text-slate-400">
                    Changes here alter main listings instantly!
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-600 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                        <th className="py-2.5">SKU Product</th>
                        <th className="py-2.5">Category</th>
                        <th className="py-2.5">Price MSRP</th>
                        <th className="py-2.5">Inventory Stock</th>
                        <th className="py-2.5 text-right">Operations</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {products.map((p) => {
                        const isEditing = editingProdId === p.id;
                        return (
                           <tr key={p.id} className="hover:bg-slate-50/40 transition-colors">
                            <td className="py-3">
                              <div className="flex items-center gap-2.5">
                                <img src={p.images[0]} className="h-9 w-9 object-cover rounded-xl border border-slate-100 shrink-0" referrerPolicy="no-referrer" />
                                <span className="font-extrabold text-slate-900 tracking-tight block max-w-[190px] truncate">{p.name}</span>
                              </div>
                            </td>
                            <td className="py-3 text-[11px] text-slate-550 text-slate-500 font-bold">{p.category}</td>
                            
                            <td className="py-3">
                              {isEditing ? (
                                <div className="flex items-center border border-slate-200 rounded-lg px-2 w-20 bg-white focus-within:border-indigo-650 focus-within:ring-1 focus-within:ring-indigo-650">
                                  <span className="text-slate-400 font-bold mr-0.5">$</span>
                                  <input
                                    id={`input_edit_price_${p.id}`}
                                    type="number"
                                    value={editPrice}
                                    onChange={(e) => setEditPrice(Number(e.target.value))}
                                    className="w-full focus:outline-none text-xs font-black py-1"
                                  />
                                </div>
                              ) : (
                                <span className="font-black text-slate-950">${p.price}</span>
                              )}
                            </td>

                            <td className="py-3">
                              {isEditing ? (
                                <input
                                  id={`input_edit_stock_${p.id}`}
                                  type="number"
                                  value={editStock}
                                  onChange={(e) => setEditStock(Number(e.target.value))}
                                  className="w-16 border border-slate-200 rounded-lg px-2 py-1 text-xs font-black bg-white focus:border-indigo-650"
                                />
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <span className={`h-1.5 w-1.5 rounded-full ${p.stock <= 5 ? 'bg-rose-500 animate-pulse' : 'bg-slate-900'}`} />
                                  <span className="font-bold text-slate-800">{p.stock} units left</span>
                                </div>
                              )}
                            </td>

                            <td className="py-3 text-right">
                              {isEditing ? (
                                <button
                                  id={`save_prod_btn_${p.id}`}
                                  onClick={() => handleSaveProduct(p.id)}
                                  className="py-1.5 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-[10px] font-extrabold transition-all inline-flex items-center gap-1 cursor-pointer shadow-xs"
                                >
                                  <Save className="h-3.5 w-3.5" />
                                  <span>Save SKU</span>
                                </button>
                              ) : (
                                <button
                                  id={`edit_prod_btn_${p.id}`}
                                  onClick={() => handleStartEditing(p)}
                                  className="py-1.5 px-3 border border-slate-200 hover:border-indigo-600 text-slate-700 hover:text-indigo-600 rounded-xl text-[10px] font-extrabold transition-all cursor-pointer bg-white"
                                >
                                  Manage
                                </button>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </div>

    </div>
  );
}
