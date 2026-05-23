/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Sliders,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Package,
  Plus,
  Trash2,
  Edit2,
  Users,
  Search,
  Filter,
  Check,
  RotateCcw,
  CheckCircle2,
  Truck,
  AlertTriangle,
  FileCheck,
  ChevronDown,
  Tag,
  KeyRound,
  ShieldAlert,
  Save,
  Grid,
  Percent,
  Lock,
  Calendar,
  Sparkles,
  RefreshCw,
  Printer,
  Download,
  Eye,
  Settings,
  CreditCard
} from 'lucide-react';
import { Product, Order, Coupon, User } from '../types';
import { INITIAL_COUPONS } from '../data/products';
import { hashPassword } from '../utils/crypto';

interface HiddenAdminPanelProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
}

export default function HiddenAdminPanel({
  isOpen,
  onClose,
  products,
  onUpdateProducts
}: HiddenAdminPanelProps) {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<string>('kpis');

  // Load datasets dynamically
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [userRecords, setUserRecords] = useState<User[]>([]);

  // Non-blocking confirmation modal state
  const [modalConfirm, setModalConfirm] = useState<{
    message: string;
    onSafeConfirm: () => void;
  } | null>(null);

  // Selection & Editing states
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [productFormMode, setProductFormMode] = useState<'create' | 'edit'>('create');

  // Search parameters
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [userSearchQuery, setUserSearchQuery] = useState('');

  // Status Filters
  const [orderStatusFilter, setOrderStatusFilter] = useState('All');
  const [productCategoryFilter, setProductCategoryFilter] = useState('All');

  // Product Form states
  const [pId, setPId] = useState('');
  const [pName, setPName] = useState('');
  const [pPrice, setPPrice] = useState(0);
  const [pOriginalPrice, setPOriginalPrice] = useState<number | ''>('');
  const [pCategory, setPCategory] = useState('Electronics');
  const [pDescription, setPDescription] = useState('');
  const [pImages, setPImages] = useState<string[]>(['']);
  const [pStock, setPStock] = useState(10);
  const [pMaxStock, setPMaxStock] = useState(10);
  const [pFeatures, setPFeatures] = useState<string[]>(['']);
  const [pTags, setPTags] = useState<string[]>(['']);
  const [pColors, setPColors] = useState<{ name: string; hex: string }[]>([
    { name: 'Default Black', hex: '#000000' }
  ]);
  const [pSizes, setPSizes] = useState<string[]>(['Standard One-Size']);

  // Coupon Form state
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [cCode, setCCode] = useState('');
  const [cType, setCType] = useState<'percentage' | 'fixed'>('percentage');
  const [cValue, setCValue] = useState(10);
  const [cMinSpend, setCMinSpend] = useState<number | ''>('');
  const [cDescription, setCDescription] = useState('');

  // Selected Pending Orders states for batch selection/actions
  const [selectedPendingIds, setSelectedPendingIds] = useState<string[]>([]);

  // Boutique Custom Config States (Persistent and synced with local settings input boxes)
  const [companyName, setCompanyName] = useState(() => localStorage.getItem('aura_company_name') || 'PHARMA & AURA BOUTIQUE LTD.');
  const [companyAddress, setCompanyAddress] = useState(() => localStorage.getItem('aura_company_address') || 'Dhanmondi, Dhaka, Bangladesh');
  const [companyComplainPhone, setCompanyComplainPhone] = useState(() => localStorage.getItem('aura_company_complain_phone') || '+880 1711-234567');

  // Preview Order Modal trigger state
  const [previewOrder, setPreviewOrder] = useState<Order | null>(null);

  // Auto-sync settings states with localStorage
  useEffect(() => {
    localStorage.setItem('aura_company_name', companyName);
  }, [companyName]);

  useEffect(() => {
    localStorage.setItem('aura_company_address', companyAddress);
  }, [companyAddress]);

  useEffect(() => {
    localStorage.setItem('aura_company_complain_phone', companyComplainPhone);
  }, [companyComplainPhone]);

  // Admin passcode & Employee form states
  const [newAdminPasscode, setNewAdminPasscode] = useState(() => localStorage.getItem('aura_admin_passcode') || 'admin');
  const [empFullName, setEmpFullName] = useState('');
  const [empEmail, setEmpEmail] = useState('');
  const [empPassword, setEmpPassword] = useState('');
  const [empRole, setEmpRole] = useState<'admin' | 'customer'>('admin');

  // Notifications
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'warn'>('success');

  // Load and subscribe to localized state modifications
  const syncWorkspaceData = () => {
    // 1. Load system orders
    const rawOrders = localStorage.getItem('aura_orders') || '[]';
    setAllOrders(JSON.parse(rawOrders));

    // 2. Load system campaigns coupons
    const rawCoupons = localStorage.getItem('aura_coupons');
    if (rawCoupons) {
      setCoupons(JSON.parse(rawCoupons));
    } else {
      localStorage.setItem('aura_coupons', JSON.stringify(INITIAL_COUPONS));
      setCoupons(INITIAL_COUPONS);
    }

    // 3. Load user profiles list
    const rawUsers = localStorage.getItem('aura_users') || '[]';
    setUserRecords(JSON.parse(rawUsers));
  };

  useEffect(() => {
    if (isOpen) {
      syncWorkspaceData();
      // Auto toggle to KPI panel first
      setActiveTab('kpis');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const triggerToast = (msg: string, type: 'success' | 'warn' = 'success') => {
    setToastMessage(msg);
    setToastType(type);
    setTimeout(() => {
      setToastMessage('');
    }, 3000);
  };

  // Product Operations
  const openCreateProductForm = () => {
    setProductFormMode('create');
    // SKU starting at 10000 and incrementing by 1
    const numericIds = products
      .map((p) => {
        const idNum = parseInt(p.id, 10);
        return isNaN(idNum) ? 0 : idNum;
      })
      .filter((num) => num >= 10000);
    const maxId = numericIds.length > 0 ? Math.max(...numericIds) : 9999;
    const nextSkuId = String(maxId + 1);
    setPId(nextSkuId);
    setPName('');
    setPPrice(49);
    setPOriginalPrice('');
    setPCategory('Electronics');
    setPDescription('');
    setPImages(['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800']);
    setPStock(15);
    setPMaxStock(30);
    setPFeatures(['Hybrid Bluetooth connection', 'Precision premium drivers']);
    setPTags(['Aesthetic', 'Modern']);
    setPColors([{ name: 'Midnight Charcoal', hex: '#22252a' }]);
    setPSizes(['Standard Volume']);
    setIsProductFormOpen(true);
  };

  const openEditProductForm = (p: Product) => {
    setProductFormMode('edit');
    setPId(p.id);
    setPName(p.name);
    setPPrice(p.price);
    setPOriginalPrice(p.originalPrice || '');
    setPCategory(p.category);
    setPDescription(p.description);
    setPImages(p.images && p.images.length ? p.images : ['']);
    setPStock(p.stock);
    setPMaxStock(p.maxStock || p.stock * 2);
    setPFeatures(p.features && p.features.length ? p.features : ['']);
    setPTags(p.tags && p.tags.length ? p.tags : ['']);
    setPColors(p.colors && p.colors.length ? p.colors : [{ name: 'Default', hex: '#222222' }]);
    setPSizes(p.sizes && p.sizes.length ? p.sizes : ['Standard']);
    setIsProductFormOpen(true);
  };

  const deleteProductSKU = (id: string, name: string) => {
    setModalConfirm({
      message: `Are you sure you want to delete SKU [${id}] - ${name}? This action cannot be undone.`,
      onSafeConfirm: () => {
        const filtered = products.filter((p) => p.id !== id);
        onUpdateProducts(filtered);
        triggerToast(`Product SKU discarded successfully.`, 'warn');
      }
    });
  };

  const handleProductFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pName.trim() || !pCategory.trim() || pPrice <= 0) {
      alert('Please fill out all mandatory product inputs.');
      return;
    }

    const cleanProduct: Product = {
      id: pId,
      name: pName.trim(),
      price: Math.max(1, Number(pPrice)),
      originalPrice: pOriginalPrice ? Number(pOriginalPrice) : undefined,
      category: pCategory.trim(),
      description: pDescription.trim() || 'No product catalog details specified yet.',
      images: pImages.filter((img) => img.trim() !== ''),
      stock: Math.max(0, Number(pStock)),
      maxStock: Math.max(Number(pStock), Number(pMaxStock)),
      rating: productFormMode === 'create' ? 5.0 : 4.8,
      reviewsCount: productFormMode === 'create' ? 1 : 24,
      colors: pColors.filter((col) => col.name.trim() !== ''),
      sizes: pSizes.filter((sz) => sz.trim() !== ''),
      features: pFeatures.filter((feat) => feat.trim() !== ''),
      tags: pTags.filter((tg) => tg.trim() !== '')
    };

    let nextProducts = [...products];
    if (productFormMode === 'create') {
      nextProducts.unshift(cleanProduct);
      triggerToast(`SKU ${pName} registered and stocked!`);
    } else {
      nextProducts = products.map((p) => (p.id === pId ? cleanProduct : p));
      triggerToast(`SKU ${pName} parameters updated.`);
    }

    onUpdateProducts(nextProducts);
    setIsProductFormOpen(false);
  };

  // Order Operations
  const updateOrderShipment = (id: string, nextStatus: 'processing' | 'shipped' | 'delivered') => {
    const updated = allOrders.map((o) => {
      if (o.id === id) {
        return {
          ...o,
          status: nextStatus,
          trackingNumber: o.trackingNumber || 'UPS-' + Math.floor(100000 + Math.random() * 900000)
        };
      }
      return o;
    });
    localStorage.setItem('aura_orders', JSON.stringify(updated));
    setAllOrders(updated);
    triggerToast(`Order status set to: ${nextStatus.toUpperCase()}`);
  };

  const deleteOrderLedger = (id: string) => {
    setModalConfirm({
      message: `Void order archive ledger [${id}]? This transaction history details will be permanently removed.`,
      onSafeConfirm: () => {
        const filtered = allOrders.filter((o) => o.id !== id);
        localStorage.setItem('aura_orders', JSON.stringify(filtered));
        setAllOrders(filtered);
        triggerToast('Order transaction record voided.', 'warn');
      }
    });
  };

  const handleBulkAccept = () => {
    if (selectedPendingIds.length === 0) return;
    const updated = allOrders.map((o) => {
      if (selectedPendingIds.includes(o.id)) {
        return { ...o, status: 'Accepted' };
      }
      return o;
    });
    localStorage.setItem('aura_orders', JSON.stringify(updated));
    setAllOrders(updated);
    setSelectedPendingIds([]);
    triggerToast(`Bulk approved ${selectedPendingIds.length} orders successfully!`);
  };

  const handleAcceptSingleOrder = (id: string) => {
    const updated = allOrders.map((o) => {
      if (o.id === id) {
        return { ...o, status: 'Accepted' };
      }
      return o;
    });
    localStorage.setItem('aura_orders', JSON.stringify(updated));
    setAllOrders(updated);
    triggerToast(`Order approved & invoice generated.`);
  };

  const handleUpdateOrderStatus = (id: string, next: string) => {
    const updated = allOrders.map((o) => {
      if (o.id === id) {
        return { ...o, status: next };
      }
      return o;
    });
    localStorage.setItem('aura_orders', JSON.stringify(updated));
    setAllOrders(updated);
    triggerToast(`Order status set to: ${next}`);
  };

  const getStatusBadgeStyle = (status: string): string => {
    const s = status.toLowerCase();
    if (s === 'pending') return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
    if (s === 'accepted') return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
    if (s === 'ready to packaging') return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    if (s === 'on the way') return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (s === 'delivered') return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    if (s === 'fully return') return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
    if (s === 'cancelled' || s === 'canceled') return 'bg-red-500/10 text-red-400 border-red-500/20';
    if (s === 'complete') return 'bg-teal-500/10 text-teal-400 border-teal-500/20';
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  // Coupon campaign operations
  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    const codeClean = cCode.trim().toUpperCase();
    if (!codeClean) return;

    // Check duplicate
    if (coupons.some((c) => c.code === codeClean)) {
      alert('A campaign coupon with this code already exists!');
      return;
    }

    const newCoupon: Coupon = {
      code: codeClean,
      type: cType,
      value: Math.max(1, Number(cValue)),
      minSpend: cMinSpend ? Number(cMinSpend) : undefined,
      description: cDescription.trim() || `Campaign ${codeClean} promo voucher.`
    };

    const nextCoupons = [...coupons, newCoupon];
    localStorage.setItem('aura_coupons', JSON.stringify(nextCoupons));
    setCoupons(nextCoupons);
    setIsCouponFormOpen(false);
    setCCode('');
    setCDescription('');
    triggerToast(`Promo Coupon campaign ${codeClean} activated!`);
  };

  const deleteCouponCampaign = (code: string) => {
    setModalConfirm({
      message: `Retire coupon code campaign ${code}? The code will immediately become inactive for future checkout runs.`,
      onSafeConfirm: () => {
        const filtered = coupons.filter((c) => c.code !== code);
        localStorage.setItem('aura_coupons', JSON.stringify(filtered));
        setCoupons(filtered);
        triggerToast(`Coupon campaign ${code} deactivated.`, 'warn');
      }
    });
  };

  // Profile overrides operations
  const toggleUserRoleOverride = (email: string, currentRole: 'customer' | 'admin') => {
    const toggledRole = currentRole === 'admin' ? 'customer' : 'admin';
    const updated = userRecords.map((u) => {
      if (u.email.toLowerCase() === email.toLowerCase()) {
        return { ...u, role: toggledRole as 'customer' | 'admin' };
      }
      return u;
    });
    localStorage.setItem('aura_users', JSON.stringify(updated));
    setUserRecords(updated);
    triggerToast(`User credentials role overridden to ${toggledRole.toUpperCase()}`);
  };

  const deleteUserRecord = (email: string) => {
    setModalConfirm({
      message: `Are you sure you want to delete user account database record for ${email}? This user details will be cleared.`,
      onSafeConfirm: () => {
        const filtered = userRecords.filter((u) => u.email.toLowerCase() !== email.toLowerCase());
        localStorage.setItem('aura_users', JSON.stringify(filtered));
        setUserRecords(filtered);
        triggerToast(`User account records deleted.`, 'warn');
      }
    });
  };

  const handleSaveAdminPasscode = () => {
    if (!newAdminPasscode.trim()) {
      triggerToast('Passcode cannot be blank.', 'warn');
      return;
    }
    localStorage.setItem('aura_admin_passcode', newAdminPasscode.trim());
    triggerToast('Administrative bypass passcode updated successfully.');
  };

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanEmail = empEmail.trim();
    if (!cleanEmail || !empFullName.trim() || !empPassword) {
      triggerToast('All fields are required to create an employee account.', 'warn');
      return;
    }

    const emailLower = cleanEmail.toLowerCase();
    const alreadyExists = userRecords.some((u) => u.email.toLowerCase() === emailLower);
    if (alreadyExists) {
      triggerToast('An account with this mobile/email already exists.', 'warn');
      return;
    }

    try {
      const hash = await hashPassword(empPassword);
      const now = new Date();
      const formattedDate = now.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
      
      const newUser: User = {
        id: 'u_' + Math.random().toString(36).substr(2, 9),
        email: cleanEmail,
        fullName: empFullName.trim(),
        avatarUrl: `https://images.unsplash.com/photo-${1500000000000 + Math.floor(Math.random() * 500000)}?q=80&w=100&auto=format&fit=crop`,
        joinedDate: formattedDate,
        role: empRole,
        phoneNumber: cleanEmail
      };

      const updated = [newUser, ...userRecords];
      localStorage.setItem('aura_users', JSON.stringify(updated));
      setUserRecords(updated);
      triggerToast(`Account for ${empFullName} was successfully created!`);
      
      // Clear inputs
      setEmpFullName('');
      setEmpEmail('');
      setEmpPassword('');
    } catch (err: any) {
      triggerToast('Failed to securely hash system keys.', 'warn');
    }
  };

  // Business Analytics helpers
  const totalSystemRevenue = allOrders.reduce((sum, o) => sum + o.total, 0);
  const averageTicketValue = allOrders.length ? Math.round(totalSystemRevenue / allOrders.length) : 0;
  
  // Total units sold count
  const totalUnitsSold = allOrders.reduce((units, order) => {
    const itemQty = order.items.reduce((qtySum, i) => qtySum + i.quantity, 0);
    return units + itemQty;
  }, 0);

  // Filtered queries processing
  const filteredProducts = products.filter((p) => {
    const matchesCategory = productCategoryFilter === 'All' || p.category === productCategoryFilter;
    const matchesSearch =
      p.name.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.id.toLowerCase().includes(productSearchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(productSearchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const filteredOrders = allOrders.filter((o) => {
    const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter.toLowerCase();
    
    // Check lookup on ID, client email, or shipping fullName
    const matchesSearch =
      o.id.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (o as any).customerEmail?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      (o as any).userEmail?.toLowerCase().includes(orderSearchQuery.toLowerCase()) ||
      o.shippingAddress.fullName.toLowerCase().includes(orderSearchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const filteredUsers = userRecords.filter((u) => {
    const q = userSearchQuery.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      
      {/* TOAST SYSTEM POPUP */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            className={`fixed top-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl border flex items-center gap-2.5 text-xs font-black tracking-wide ${toastType === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-455 text-rose-400'}`}
          >
            {toastType === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ADMIN CONTROL HEADER PORTAL */}
      <header className="px-6 py-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <Sliders className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-rose-500 animate-pulse" />
              <h1 className="text-sm font-black tracking-widest text-slate-200 uppercase font-mono">
                Aura Advanced Executive Portal
              </h1>
            </div>
            <p className="text-[10px] text-slate-400 font-bold mt-0.5">
              Secure Master Controls • Live Local Sandbox Memory State
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="flex items-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl text-xs font-extrabold border border-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer"
        >
          <X className="h-4 w-4" />
          <span>Exit Interface</span>
        </button>
      </header>

      {/* MASTER CORE WORKSPACE PANELS */}
      <div className="flex-grow flex overflow-hidden">
        
        {/* SIDE BAR NAVIGATION LINKS */}
        <aside className="w-64 bg-slate-900/60 border-r border-slate-800 p-5 flex flex-col justify-between shrink-0">
          <div className="space-y-6">
            <p className="text-[9px] uppercase font-black text-slate-500 tracking-widest pl-2">
              Control Center Panels
            </p>

            <nav className="space-y-1.5">
              <button
                onClick={() => setActiveTab('kpis')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all text-left cursor-pointer ${activeTab === 'kpis' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <TrendingUp className="h-4.5 w-4.5" />
                <span>Executive Stats</span>
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all text-left cursor-pointer ${activeTab === 'products' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <Grid className="h-4.5 w-4.5" />
                <span>Boutique Catalog</span>
              </button>

              <button
                onClick={() => setActiveTab('pending')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all text-left cursor-pointer ${activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <ShoppingBag className="h-4.5 w-4.5" />
                <span>Pending Orders</span>
                {allOrders.filter((o) => o.status.toLowerCase() === 'pending').length > 0 && (
                  <span className="ml-auto bg-rose-500 text-white py-0.5 px-2 rounded-full text-[9px] font-black animate-pulse">
                    {allOrders.filter((o) => o.status.toLowerCase() === 'pending').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('invoices')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all text-left cursor-pointer ${activeTab === 'invoices' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <FileCheck className="h-4.5 w-4.5" />
                <span>Order Invoices</span>
                {allOrders.filter((o) => o.status.toLowerCase() !== 'pending').length > 0 && (
                  <span className="ml-auto bg-slate-950 text-emerald-400 py-0.5 px-2 rounded-full text-[9px] font-bold border border-emerald-500/20">
                    {allOrders.filter((o) => o.status.toLowerCase() !== 'pending').length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setActiveTab('coupons')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all text-left cursor-pointer ${activeTab === 'coupons' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <Tag className="h-4.5 w-4.5" />
                <span>Voucher Coupons</span>
              </button>

              <button
                onClick={() => setActiveTab('users')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-black transition-all text-left cursor-pointer ${activeTab === 'users' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/15' : 'text-slate-400 hover:bg-slate-850 hover:text-white'}`}
              >
                <Users className="h-4.5 w-4.5" />
                <span>System Profiles</span>
              </button>
            </nav>
          </div>

          {/* System metadata */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
            <span className="text-[8px] font-black uppercase text-slate-500 tracking-wider block">System Database Node</span>
            <div className="flex items-center gap-2 mt-1.5 justify-between">
              <span className="text-[10px] font-mono font-bold text-emerald-400 block">LOCALSTORAGE ACTIVE</span>
              <span className="p-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[8px] font-black">SYNC</span>
            </div>
            <button
               onClick={syncWorkspaceData}
               className="mt-3.5 w-full py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-xl text-[10px] font-black text-slate-300 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="h-3 w-3" />
              <span>Hard Reset Synced Memory</span>
            </button>
          </div>
        </aside>

        {/* CONTAINER WORK SPACE DISPLAY (SCROLLABLE TAB PANELS) */}
        <main className="flex-grow p-6 md:p-8 overflow-y-auto bg-slate-950">
          
          {/* TAB 1: EXECUTIVE KPIS SCREEN */}
          {activeTab === 'kpis' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Row metrics cards */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-slate-900 rounded-3xl border border-slate-850 p-5 flex items-center justify-between shadow-md">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 tracking-wider">AGGREGATED REVENUE SECURED</span>
                    <span className="text-2xl font-black text-slate-100 mt-1 block">৳{totalSystemRevenue.toLocaleString()} </span>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shadow-lg shadow-emerald-500/5">
                    <DollarSign className="h-5.5 w-5.5" />
                  </div>
                </div>

                <div className="bg-slate-900 rounded-3xl border border-slate-850 p-5 flex items-center justify-between shadow-md">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 tracking-wider">TRANSACTIONS LOGGED</span>
                    <span className="text-2xl font-black text-slate-100 mt-1 block">{allOrders.length} orders </span>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shadow-lg shadow-indigo-500/5">
                    <Package className="h-5.5 w-5.5" />
                  </div>
                </div>

                <div className="bg-slate-900 rounded-3xl border border-slate-850 p-5 flex items-center justify-between shadow-md">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 tracking-wider">UNITS SOLD IN TRANSIT</span>
                    <span className="text-2xl font-black text-slate-100 mt-1 block">{totalUnitsSold} products </span>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-pink-500/10 border border-pink-500/30 text-pink-400 flex items-center justify-center shadow-lg shadow-pink-500/5">
                    <ShoppingBag className="h-5.5 w-5.5" />
                  </div>
                </div>

                <div className="bg-slate-900 rounded-3xl border border-slate-850 p-5 flex items-center justify-between shadow-md">
                  <div>
                    <span className="block text-[10px] font-black text-slate-400 tracking-wider">AVERAGE ORDER TICKET</span>
                    <span className="text-2xl font-black text-slate-100 mt-1 block">৳{averageTicketValue} </span>
                  </div>
                  <div className="h-11 w-11 rounded-2xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 flex items-center justify-center shadow-lg shadow-yellow-500/5">
                    <TrendingUp className="h-5.5 w-5.5" />
                  </div>
                </div>
              </div>

              {/* Graphical Visual Trends Container */}
              <div className="bg-slate-900 rounded-[32px] border border-slate-850 p-6 shadow-xl space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono">Retail Analytics & Volume Flow Graph</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Custom dynamic mathematical projection vector</p>
                  </div>
                  <div className="flex items-center gap-1 text-[10px] font-mono text-indigo-400 bg-indigo-500/5 border border-indigo-500/10 py-1.5 px-3 rounded-full">
                    <span>Chart Metric</span> • <span className="text-slate-300 font-extrabold">Sales Over Time</span>
                  </div>
                </div>

                {/* SVG Trend Line graph */}
                <div className="h-56 w-full relative pt-2">
                  <svg className="w-full h-full text-indigo-500" viewBox="0 0 1000 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="chart_grad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                        <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    
                    {/* Background Grid Lines */}
                    <line x1="0" y1="35" x2="1000" y2="35" stroke="#1e293b" strokeWidth="1" strokeDasharray="5" />
                    <line x1="0" y1="90" x2="1000" y2="90" stroke="#1e293b" strokeWidth="1" strokeDasharray="5" />
                    <line x1="0" y1="145" x2="1000" y2="145" stroke="#1e293b" strokeWidth="1" strokeDasharray="5" />

                    {/* Area path */}
                    <path
                      d="M 0 180 C 100 120, 200 150, 300 80 C 400 40, 500 120, 600 90 C 700 30, 800 110, 900 60 C 950 35, 1000 20, 1000 20 L 1000 190 L 0 190 Z"
                      fill="url(#chart_grad)"
                    />
                    
                    {/* Glowing dynamic stroke path */}
                    <path
                      d="M 0 180 C 100 120, 200 150, 300 80 C 400 40, 500 120, 600 90 C 700 30, 800 110, 900 60 C 950 35, 1000 20, 1000 20"
                      fill="none"
                      stroke="#6366f1"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {/* Dot milestones */}
                    <circle cx="300" cy="80" r="5" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2.5" />
                    <circle cx="600" cy="90" r="5" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2.5" />
                    <circle cx="900" cy="60" r="5" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2.5" />
                  </svg>

                  {/* Axis labels */}
                  <div className="flex justify-between items-center text-[9px] font-mono font-bold text-slate-500 mt-2.5">
                    <span>Voucher Campaigns launched</span>
                    <span>Q2 Launch Window</span>
                    <span>Direct SECURED Checkouts Peak</span>
                    <span>Aura Launch Live</span>
                  </div>
                </div>
              </div>

              {/* Bottom splits: inventory safety warnings against sales categories distribution */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Out of Stock alerts grid */}
                <div className="bg-slate-900 rounded-[28px] border border-slate-850 p-5 space-y-4">
                  <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest font-mono flex items-center gap-1.5 text-yellow-500">
                    <AlertTriangle className="h-4 w-4" />
                    <span>Inventory Low Stock Alerts</span>
                  </h4>

                  <div className="space-y-2">
                    {products.filter((p) => p.stock <= 5).length === 0 ? (
                      <div className="py-8 text-center text-[10px] text-slate-500 font-extrabold">
                        ✓ All catalog SKU stocks are stable. Safe reserves threshold cleared.
                      </div>
                    ) : (
                      products
                        .filter((p) => p.stock <= 5)
                        .map((p) => (
                          <div key={p.id} className="p-3 bg-slate-950 border border-slate-850 rounded-xl flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <img src={p.images[0]} className="h-7 w-7 rounded object-cover border border-slate-800" referrerPolicy="no-referrer" />
                              <div>
                                <span className="font-extrabold text-slate-200 block max-w-[180px] truncate">{p.name}</span>
                                <span className="text-[9px] text-slate-500 font-bold block">{p.id}</span>
                              </div>
                            </div>
                            <span className="px-2.5 py-0.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-lg text-[9px] font-black">
                              Only {p.stock} units left
                            </span>
                          </div>
                        ))
                    )}
                  </div>
                </div>

                {/* Categories distribution list */}
                <div className="bg-slate-900 rounded-[28px] border border-slate-850 p-5 space-y-4">
                  <h4 className="text-xs font-black text-slate-100 uppercase tracking-widest font-mono flex items-center gap-1.5 text-indigo-400">
                    <Grid className="h-4 w-4" />
                    <span>Catalog Category Distribution</span>
                  </h4>

                  <div className="space-y-2 text-xs">
                    {Array.from(new Set(products.map((p) => p.category))).map((cat) => {
                      const count = products.filter((p) => p.category === cat).length;
                      const percentage = Math.round((count / products.length) * 100);
                      return (
                        <div key={cat} className="space-y-1">
                          <div className="flex justify-between items-center text-[11px] font-extrabold text-slate-300">
                            <span>{cat}</span>
                            <span>{count} SKUs ({percentage}%)</span>
                          </div>
                          
                          {/* Colored bar */}
                          <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                            <div className="h-full bg-indigo-500" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </motion.div>
          )}

          {/* TAB 2: PRODUCT SKUS CATALOG */}
          {activeTab === 'products' && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-900 p-5 rounded-3xl border border-slate-850">
                <div className="flex items-center gap-3">
                  <Sliders className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono">Boutique SKUs Catalog</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Define metadata tags, feature listings, price targets, and inventory reserves</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search SKUs..."
                      value={productSearchQuery}
                      onChange={(e) => setProductSearchQuery(e.target.value)}
                      className="pl-8.5 pr-3 py-1.5.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-200 focus:outline-none focus:border-indigo-505 focus:border-indigo-500 w-44 font-bold"
                    />
                  </div>

                  <button
                    onClick={openCreateProductForm}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create new SKU</span>
                  </button>
                </div>
              </div>

              {/* Product Inventory Catalog Table */}
              <div className="bg-slate-900 rounded-[32px] border border-slate-850 overflow-hidden shadow-lg">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[9px] font-black uppercase text-slate-500 tracking-wider bg-slate-900/80">
                        <th className="py-3 px-5">PRODUCT ESSENTIAL SKU</th>
                        <th className="py-3 px-5">CATEGORY DIVISION</th>
                        <th className="py-3 px-5">MSRP PRICE</th>
                        <th className="py-3 px-5">INVENTORY STOCK</th>
                        <th className="py-3 px-5 text-right">EXECUTIVE OPERATIONS</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-850">
                      {filteredProducts.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-850/30 transition-colors">
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-3">
                              <img src={p.images[0]} className="h-10 w-10 object-cover rounded-xl border border-slate-800 shrink-0" referrerPolicy="no-referrer" />
                              <div>
                                <span className="font-extrabold text-slate-100 block max-w-[210px] truncate">{p.name}</span>
                                <span className="text-[10px] font-mono text-slate-500 block mt-0.5">{p.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-slate-400 font-bold">{p.category}</td>
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-1">
                              <span className="font-black text-slate-100">৳{p.price}</span>
                              {p.originalPrice && (
                                <span className="text-[10px] line-through text-slate-500">৳{p.originalPrice}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-3 px-5">
                            <div className="flex items-center gap-2">
                              <span className={`h-1.5 w-1.5 rounded-full ${p.stock <= 5 ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'}`} />
                              <span className="font-extrabold text-slate-200">{p.stock} units / {p.maxStock} max</span>
                            </div>
                          </td>
                          <td className="py-3 px-5 text-right space-x-1 whitespace-nowrap">
                            <button
                              onClick={() => openEditProductForm(p)}
                              className="p-1 px-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg text-[10px] font-black cursor-pointer transition-colors inline-flex items-center gap-1"
                            >
                              <Edit2 className="h-3 w-3 text-indigo-400" />
                              <span>Edit Parameters</span>
                            </button>
                            <button
                              onClick={() => deleteProductSKU(p.id, p.name)}
                              className="p-1 px-2 bg-rose-500/10 hover:bg-rose-500 text-rose-400 hover:text-white border border-rose-500/20 rounded-lg text-[10px] font-black cursor-pointer transition-colors inline-flex items-center gap-1"
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}

          {/* TAB 3: PENDING ORDERS QUEUE */}
          {activeTab === 'pending' && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              {/* Heading section */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-900 p-5 rounded-3xl border border-slate-850">
                <div className="flex items-center gap-3">
                  <ShoppingBag className="h-5 w-5 text-rose-400" />
                  <div>
                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono">Pending Orders Queue</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Approve incoming customer checkouts, perform batch actions, generate invoices</p>
                  </div>
                </div>

                {/* Bulk Actions row */}
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-bold">
                    Selected: {selectedPendingIds.length} queue item(s)
                  </span>
                  <button
                    onClick={handleBulkAccept}
                    disabled={selectedPendingIds.length === 0}
                    className={`py-1.5 px-3.5 rounded-xl text-[10px] font-black tracking-wider uppercase transition-all flex items-center gap-1.5 cursor-pointer ${selectedPendingIds.length > 0 ? 'bg-indigo-650 text-white hover:bg-indigo-700 shadow-lg border border-indigo-505 bg-indigo-600' : 'bg-slate-955 border border-slate-800 text-slate-500 cursor-not-allowed'}`}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Accept Selected Orders</span>
                  </button>
                </div>
              </div>

              {/* List of Pending Orders in Systems */}
              {allOrders.filter((o) => o.status.toLowerCase() === 'pending').length === 0 ? (
                <div className="bg-slate-900 p-16 rounded-3xl text-center text-slate-500 font-extrabold text-xs">
                  ∅ Zero incoming pending orders. All boutique items successfully approved & invoiced!
                </div>
              ) : (
                <div className="space-y-4 font-medium">
                  {/* Select All Toggle Bar */}
                  <div className="bg-slate-950/40 border border-slate-850 p-3 px-5 rounded-2xl flex items-center justify-between">
                    <label className="flex items-center gap-3 text-xs font-black text-slate-350 cursor-pointer select-none font-sans">
                      <input
                        type="checkbox"
                        checked={
                          allOrders.filter((o) => o.status.toLowerCase() === 'pending').length > 0 &&
                          allOrders.filter((o) => o.status.toLowerCase() === 'pending').every((o) => selectedPendingIds.includes(o.id))
                        }
                        onChange={(e) => {
                          const pendIds = allOrders.filter((o) => o.status.toLowerCase() === 'pending').map((o) => o.id);
                          if (e.target.checked) {
                            setSelectedPendingIds(pendIds);
                          } else {
                            setSelectedPendingIds([]);
                          }
                        }}
                        className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 h-4 w-4 cursor-pointer"
                      />
                      <span>Select All In Queue</span>
                    </label>
                    <span className="text-[10px] text-slate-400 font-bold font-mono">
                      Queue Length: {allOrders.filter((o) => o.status.toLowerCase() === 'pending').length}
                    </span>
                  </div>
                  {allOrders
                    .filter((o) => o.status.toLowerCase() === 'pending')
                    .map((or) => (
                      <div
                        key={or.id}
                        className="bg-slate-900 rounded-3xl border border-slate-850 p-5 space-y-4 shadow-md transition-all hover:border-slate-800"
                      >
                        {/* Header metadata */}
                        <div className="flex items-start justify-between border-b border-slate-850 pb-3">
                          <div className="flex items-center gap-3">
                            <input
                              type="checkbox"
                              checked={selectedPendingIds.includes(or.id)}
                              onChange={() => {
                                if (selectedPendingIds.includes(or.id)) {
                                  setSelectedPendingIds(selectedPendingIds.filter((item) => item !== or.id));
                                } else {
                                  setSelectedPendingIds([...selectedPendingIds, or.id]);
                                }
                              }}
                              className="rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-0 h-4 w-4 cursor-pointer"
                            />
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-black text-white select-all">{or.id}</span>
                                <span className="text-[8.5px] font-black tracking-wider px-2 py-0.5 rounded-lg border border-rose-500/20 bg-rose-500/10 text-rose-450 uppercase">
                                  {or.status}
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 font-bold mt-1">
                                Client Email: <span className="font-mono text-indigo-400">{(or as any).customerEmail || (or as any).userEmail || 'registered@user.com'}</span> • Authorized {or.date}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => {
                                handleAcceptSingleOrder(or.id);
                              }}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black rounded-xl cursor-pointer transition-colors border border-indigo-500/10 hover:border-indigo-500/30 shadow-md flex items-center gap-1 font-sans"
                            >
                              <Check className="h-3 w-3" />
                              <span>Accept & Process</span>
                            </button>
                          </div>
                        </div>

                        {/* Order breakdown summary */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-350 pt-1">
                          {/* SKUs List */}
                          <div className="space-y-1.5">
                            <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">SKUs Ledger Items List</p>
                            <div className="space-y-1 max-h-[110px] overflow-y-auto pr-1">
                              {or.items.map((it, idx) => (
                                <div key={idx} className="flex gap-2 items-center justify-between p-1.5 bg-slate-950 border border-slate-850 rounded-xl leading-tight">
                                  <div className="flex items-center gap-1.5">
                                    <img src={it.productImage} className="h-5.5 w-5.5 object-cover rounded" referrerPolicy="no-referrer" />
                                    <span className="font-extrabold text-slate-200 text-[10.5px] truncate max-w-[120px]">{it.productName}</span>
                                  </div>
                                  <span className="font-mono text-[9px] text-slate-400 shrink-0 font-bold">
                                    {it.quantity}X ৳{it.price}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Consignee */}
                          <div className="space-y-1 border-l border-r border-slate-850 px-0 sm:px-4 animate-none">
                            <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Consignee Address</p>
                            <div className="text-[10.5px] font-bold space-y-0.5 mt-1 font-sans">
                              <p className="text-slate-100">{or.shippingAddress.fullName}</p>
                              <p className="text-slate-400 truncate">{or.shippingAddress.addressLine1}</p>
                              <p className="text-slate-400 font-medium">{or.shippingAddress.city}, {or.shippingAddress.state}</p>
                              <p className="text-indigo-400 font-mono font-bold">Contact Hotline: {or.shippingAddress.phone}</p>
                            </div>
                          </div>

                          {/* calculations */}
                          <div className="space-y-1.5 text-[10.5px] font-semibold">
                            <p className="text-[9px] uppercase font-black text-slate-500 tracking-wider text-right">Sum calculations</p>
                            <div className="space-y-1 mt-1">
                              <div className="flex justify-between">
                                <span className="text-slate-550 text-slate-500">Subtotal Price</span>
                                <span className="text-slate-300 font-bold">৳{or.subtotal}</span>
                              </div>
                              {or.discount > 0 && (
                                <div className="flex justify-between text-emerald-400">
                                  <span>Voucher Savings ({or.couponCodeUsed || "Promo"})</span>
                                  <span>-৳{or.discount}</span>
                                </div>
                              )}
                              <div className="flex justify-between">
                                <span className="text-slate-550 text-slate-500">Shipping Freight</span>
                                <span className="text-slate-300 font-bold">৳{or.shipping}</span>
                              </div>
                              <div className="flex justify-between text-[11px] font-black text-slate-100 border-t border-slate-850 pt-1.5 font-mono">
                                <span>TOTAL settled</span>
                                <span className="font-mono text-emerald-400 text-xs font-black">৳{or.total}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 3.5: MASTER ORDER INVOICES DETAIL PAGE */}
          {activeTab === 'invoices' && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* COMPANY DETAILS CONFIGURATION BOX */}
              <div className="bg-slate-900 border border-slate-850 rounded-3xl p-5 space-y-4">
                <div className="flex items-center gap-2.5">
                  <Settings className="h-4.5 w-4.5 text-indigo-400" />
                  <div>
                    <h3 className="text-xs font-black text-slate-100 tracking-wider uppercase font-mono">Boutique Configuration Panel</h3>
                    <p className="text-[9px] text-slate-400 font-bold">Configure letterhead address layout box & customer complaint mobile hotline box to customize invoices instantly</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-[8.5px] uppercase font-black text-slate-500 tracking-wider mb-1">Company Name</label>
                    <input
                      type="text"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="e.g. Pharma & Aura Boutique Ltd."
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-bold focus:outline-none focus:border-indigo-505"
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] uppercase font-black text-slate-500 tracking-wider mb-1">Company Address Layout Box</label>
                    <input
                      type="text"
                      value={companyAddress}
                      onChange={(e) => setCompanyAddress(e.target.value)}
                      placeholder="e.g. Area, Road, House, Dhaka, Bangladesh"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-bold focus:outline-none focus:border-indigo-550"
                    />
                  </div>
                  <div>
                    <label className="block text-[8.5px] uppercase font-black text-slate-500 tracking-wider mb-1">Complaint Mobile Hotline Box</label>
                    <input
                      type="text"
                      value={companyComplainPhone}
                      onChange={(e) => setCompanyComplainPhone(e.target.value)}
                      placeholder="e.g. +880 1711-234567"
                      className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-100 font-bold focus:outline-none focus:border-indigo-550"
                    />
                  </div>
                </div>
              </div>

              {/* FILTER BAR FOR MASTER INVOICES */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-900 p-4.5 rounded-3xl border border-slate-850 col-span-full">
                <div className="flex items-center gap-3">
                  <FileCheck className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono">Order Invoices Ledger</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">SL indexed lists • Instant status transitions • Professional document action buttons</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search invoices..."
                      value={orderSearchQuery}
                      onChange={(e) => setOrderSearchQuery(e.target.value)}
                      className="pl-8 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 w-44 font-bold"
                    />
                  </div>

                  <select
                    value={orderStatusFilter}
                    onChange={(e) => setOrderStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 text-[11px] font-extrabold text-slate-350 p-1.5 px-3.5 rounded-xl cursor-pointer"
                  >
                    <option value="All">All statuses</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Ready to Packaging">Ready to Packaging</option>
                    <option value="on the Way">on the Way</option>
                    <option value="Delivered">Delivered</option>
                    <option value="Fully Return">Fully Return</option>
                    <option value="Cancelled">Cancelled</option>
                    <option value="Complete">Complete</option>
                  </select>
                </div>
              </div>

              {/* TABLE LISTING */}
              {allOrders.filter((o) => {
                const matchesStatus = orderStatusFilter === 'All' || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
                const query = orderSearchQuery.toLowerCase();
                return matchesStatus && (
                  o.id.toLowerCase().includes(query) ||
                  o.shippingAddress.fullName.toLowerCase().includes(query) ||
                  o.shippingAddress.phone.toLowerCase().includes(query) ||
                  (o as any).customerEmail?.toLowerCase().includes(query) ||
                  (o as any).userEmail?.toLowerCase().includes(query)
                );
              }).length === 0 ? (
                <div className="bg-slate-900 p-16 rounded-3xl text-center text-slate-500 font-extrabold text-xs border border-slate-850">
                  ∅ No boutique invoices match search or status filters.
                </div>
              ) : (
                <div className="bg-slate-900 border border-slate-850 rounded-3xl overflow-hidden shadow-xl">
                  <div className="overflow-x-auto font-medium">
                    <table className="w-full text-left text-xs text-slate-300">
                      <thead>
                        <tr className="bg-slate-950 border-b border-slate-850 text-slate-400 font-sans font-black tracking-wider text-[9px] uppercase">
                          <th className="py-3 px-4.5 select-none font-sans">SL</th>
                          <th className="py-3 px-4 font-mono">Invoice ID</th>
                          <th className="py-3 px-4 font-sans">Customer Name</th>
                          <th className="py-3 px-4 font-mono">Mobile Number</th>
                          <th className="py-3 px-4 font-sans">Area Location</th>
                          <th className="py-3 px-4 font-sans">Current Status</th>
                          <th className="py-3 px-4 text-center font-sans font-black">Status Action Changer</th>
                          <th className="py-3 px-4.5 text-right font-sans">Professional Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-850/60 font-medium">
                        {allOrders
                          .filter((o) => {
                            const matchesStatus = orderStatusFilter === 'All' || o.status.toLowerCase() === orderStatusFilter.toLowerCase();
                            const query = orderSearchQuery.toLowerCase();
                            return matchesStatus && (
                              o.id.toLowerCase().includes(query) ||
                              o.shippingAddress.fullName.toLowerCase().includes(query) ||
                              o.shippingAddress.phone.toLowerCase().includes(query) ||
                              (o as any).customerEmail?.toLowerCase().includes(query) ||
                              (o as any).userEmail?.toLowerCase().includes(query)
                            );
                          })
                          .map((or, idx) => (
                            <tr key={or.id} className="hover:bg-slate-850/20 transition-all font-sans">
                              {/* Serial Number */}
                              <td className="py-3 px-4.5 font-sans font-bold text-indigo-400 text-[11px] select-none">
                                {String(idx + 1).padStart(2, '0')}
                              </td>

                              {/* Invoice ID */}
                              <td className="py-3 px-4 font-mono text-[11px] font-bold text-slate-100 select-all">
                                {or.id}
                              </td>

                              {/* Customer Name */}
                              <td className="py-3 px-4 font-sans font-bold text-slate-200 text-[11px] truncate max-w-[140px]">
                                {or.shippingAddress.fullName}
                              </td>

                              {/* Mobile Number */}
                              <td className="py-3 px-4 font-mono text-[11px] text-slate-300 font-bold">
                                {or.shippingAddress.phone}
                              </td>

                              {/* Area */}
                              <td className="py-3 px-4 text-[10.5px] text-slate-400 font-sans font-semibold truncate max-w-[130px]">
                                {or.shippingAddress.city}, {or.shippingAddress.state}
                              </td>

                              {/* Status Badge */}
                              <td className="py-3 px-4 font-sans">
                                <span className={`text-[8.5px] font-black tracking-wider px-2 py-0.5 rounded-lg border uppercase whitespace-nowrap block text-center max-w-[140px] font-sans ${getStatusBadgeStyle(or.status)}`}>
                                  {or.status}
                                </span>
                              </td>

                              {/* Status action button selector */}
                              <td className="py-3 px-4 text-center font-sans">
                                <select
                                  value={or.status}
                                  onChange={(e) => handleUpdateOrderStatus(or.id, e.target.value)}
                                  className="mx-auto bg-slate-950 border border-slate-850 text-[9.5px] font-black font-sans tracking-tight text-white p-1 px-2.5 rounded-lg focus:outline-none focus:border-indigo-650 cursor-pointer text-center block"
                                >
                                  <option value="Pending">Pending</option>
                                  <option value="Accepted">Accepted</option>
                                  <option value="Ready to Packaging">Ready to Packaging</option>
                                  <option value="on the Way">on the Way</option>
                                  <option value="Delivered">Delivered</option>
                                  <option value="Fully Return">Fully Return</option>
                                  <option value="Cancelled">Cancelled</option>
                                  <option value="Complete">Complete</option>
                                </select>
                              </td>

                              {/* Action buttons (Preview, PDF, Print, Void) */}
                              <td className="py-3 px-4.5 text-right whitespace-nowrap space-x-1 font-sans">
                                <button
                                  onClick={() => setPreviewOrder(or)}
                                  className="p-1 px-1.5 bg-slate-955 hover:bg-slate-800 border border-slate-805 text-slate-300 rounded-lg text-[10px] font-black cursor-pointer transition-colors inline-flex items-center gap-0.5"
                                  title="Preview Invoice"
                                >
                                  <Eye className="h-3 w-3 text-sky-400" />
                                  <span>Preview</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setPreviewOrder(or);
                                    setTimeout(() => {
                                      window.print();
                                    }, 180);
                                  }}
                                  className="p-1 px-1.5 bg-slate-955 hover:bg-slate-800 border border-slate-805 text-slate-300 rounded-lg text-[10px] font-black cursor-pointer transition-colors inline-flex items-center gap-0.5"
                                  title="Download invoice as PDF"
                                >
                                  <Download className="h-3 w-3 text-emerald-400" />
                                  <span>PDF</span>
                                </button>

                                <button
                                  onClick={() => {
                                    setPreviewOrder(or);
                                    setTimeout(() => {
                                      window.print();
                                    }, 180);
                                  }}
                                  className="p-1 px-1.5 bg-indigo-600/10 hover:bg-indigo-600 border border-indigo-500/10 hover:border-indigo-500 text-white hover:text-white rounded-lg text-[10px] font-black cursor-pointer transition-colors inline-flex items-center gap-0.5"
                                  title="Print Invoice Document"
                                >
                                  <Printer className="h-3 w-3 text-indigo-400 hover:text-white" />
                                  <span>Print</span>
                                </button>

                                <button
                                  onClick={() => deleteOrderLedger(or.id)}
                                  className="p-1 px-1.5 bg-rose-500/10 hover:bg-rose-550 border border-rose-500/10 hover:border-rose-550 text-rose-455 hover:text-white rounded-lg text-[10px] font-black cursor-pointer transition-colors inline-flex items-center"
                                  title="Void permanently"
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* TAB 4: CAMPAIGN VOUCHER COUPONS */}
          {activeTab === 'coupons' && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-5"
            >
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-900 p-5 rounded-3xl border border-slate-850">
                <div className="flex items-center gap-3">
                  <Tag className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono">Promo Campaign Coupons</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Activate or retire promotional coupon campaigns to discount baskets</p>
                  </div>
                </div>

                <button
                  onClick={() => setIsCouponFormOpen(true)}
                  className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-md"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Activate new code</span>
                </button>
              </div>

              {/* Coupon campaigns grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {coupons.map((c) => (
                  <div
                    key={c.code}
                    className="relative bg-slate-900 rounded-[24px] border border-slate-850 p-5 overflow-hidden shadow-md flex flex-col justify-between min-h-[140px]"
                  >
                    {/* Retro dashed divide */}
                    <div className="absolute top-0 right-0 w-2 h-full flex flex-col justify-between py-2 pointer-events-none opacity-25">
                      <div className="h-1 w-1 rounded-full bg-indigo-400" />
                      <div className="h-1 w-1 rounded-full bg-indigo-400" />
                      <div className="h-1 w-1 rounded-full bg-indigo-400" />
                      <div className="h-1 w-1 rounded-full bg-indigo-400" />
                      <div className="h-1 w-1 rounded-full bg-indigo-400" />
                    </div>

                    <div>
                      <div className="flex justify-between items-start">
                        <span className="font-mono text-sm font-black tracking-wider text-indigo-405 text-indigo-400 select-all p-1 px-2 border border-indigo-500/20 bg-indigo-500/5 rounded-xl block uppercase">
                          {c.code}
                        </span>
                        
                        <button
                          onClick={() => deleteCouponCampaign(c.code)}
                          className="text-slate-500 hover:text-rose-455 hover:text-rose-400 transition-colors cursor-pointer p-1 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <p className="text-xs text-slate-200 font-black mt-3 leading-tight">{c.description}</p>
                    </div>

                    <div className="flex justify-between items-baseline mt-4 border-t border-slate-850 pt-3 text-[10.5px]">
                      <span className="text-slate-500 font-bold">
                        {c.minSpend ? `Threshold: ৳{c.minSpend}+` : 'Universal Redeem'}
                      </span>
                      <span className="font-mono text-emerald-400 font-black text-sm">
                        {c.type === 'percentage' ? `${c.value}% OFF` : `৳{c.value} VOUCHER`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          )}

          {/* TAB 5: REGISTERED USERS SYSTEM */}
          {activeTab === 'users' && (
            <motion.div
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              {/* Settings and employee provisioning section */}
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                {/* 1. Change Secret Admin Passcode (Col span 2) */}
                <div className="lg:col-span-2 bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <KeyRound className="h-5 w-5 text-indigo-400" />
                    <div>
                      <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono">Secret Bypass Admin ID Key</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Bypass login for fast administrator panel inspection config</p>
                    </div>
                  </div>
                  <div className="space-y-3 pt-1">
                    <div>
                      <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">New administrative authorization key</label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                        <input
                          type="text"
                          placeholder="e.g. admin123"
                          value={newAdminPasscode}
                          onChange={(e) => setNewAdminPasscode(e.target.value)}
                          className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-200 font-bold font-mono focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>
                    <button
                      onClick={handleSaveAdminPasscode}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-[10.5px] uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                    >
                      Update Secret Key ID
                    </button>
                  </div>
                </div>

                {/* 2. Provision Employee Account (Col span 3) */}
                <div className="lg:col-span-3 bg-slate-900 border border-slate-850 p-5 rounded-3xl space-y-4 shadow-xl">
                  <div className="flex items-center gap-3">
                    <Plus className="h-5 w-5 text-emerald-400" />
                    <div>
                      <h4 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono">Create New Employee Credentials</h4>
                      <p className="text-[10px] text-slate-400 font-bold mt-0.5">Instantly save access profiles for staff or customer level bypass</p>
                    </div>
                  </div>

                  <form onSubmit={handleCreateEmployee} className="space-y-3.5">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Employee Name</label>
                        <input
                          type="text"
                          placeholder="e.g. Tanvir"
                          required
                          value={empFullName}
                          onChange={(e) => setEmpFullName(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[10.5px] text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Phone / Login ID</label>
                        <input
                          type="text"
                          placeholder="e.g. 019XXXXXXXX"
                          required
                          value={empEmail}
                          onChange={(e) => setEmpEmail(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[10.5px] text-slate-200 focus:outline-none focus:border-indigo-500 font-bold font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Pass Password</label>
                        <input
                          type="password"
                          placeholder="•••••"
                          required
                          value={empPassword}
                          onChange={(e) => setEmpPassword(e.target.value)}
                          className="w-full px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-xl text-[10.5px] text-slate-200 focus:outline-none focus:border-indigo-500 font-bold"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-3 justify-between pt-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] uppercase font-black text-slate-500 tracking-wider">Access Role</span>
                        <select
                          value={empRole}
                          onChange={(e) => setEmpRole(e.target.value as 'admin' | 'customer')}
                          className="px-2 py-1 bg-slate-950 border border-slate-800 text-[10.5px] text-slate-200 font-bold rounded-lg focus:outline-none cursor-pointer"
                        >
                          <option value="admin">Admin / Staff</option>
                          <option value="customer">Regular Customer</option>
                        </select>
                      </div>

                      <button
                        type="submit"
                        className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10.5px] uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                      >
                        Create Employee Profile
                      </button>
                    </div>
                  </form>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-900 p-5 rounded-3xl border border-slate-850">
                <div className="flex items-center gap-3">
                  <Users className="h-5 w-5 text-indigo-400" />
                  <div>
                    <h3 className="text-sm font-black text-slate-100 uppercase tracking-widest font-mono">Identity Profiles Accounts</h3>
                    <p className="text-[10px] text-slate-400 font-bold mt-0.5">Edit system authentication records, elevate roles to ADMIN, delete credentials</p>
                  </div>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearchQuery}
                    onChange={(e) => setUserSearchQuery(e.target.value)}
                    className="pl-8.5 pr-3 py-1.5.5 bg-slate-950 border border-slate-800 rounded-xl text-[11px] text-slate-200 focus:outline-none focus:border-indigo-500 w-44 font-bold"
                  />
                </div>
              </div>

              {/* Users list directory display */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredUsers.map((u) => (
                  <div
                    key={u.email}
                    className="bg-slate-900 border border-slate-850 rounded-[24px] p-5 shadow-sm space-y-4 flex flex-col justify-between"
                  >
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex items-center gap-2.5">
                        <img src={u.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=100'} className="h-9 w-9 rounded-full object-cover shrink-0 border border-slate-800" referrerPolicy="no-referrer" />
                        <div>
                          <span className="font-extrabold text-slate-100 block">{u.fullName}</span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{u.email}</span>
                        </div>
                      </div>

                      <span className={`text-[8.5px] font-black tracking-wider px-2.5 py-0.5 rounded-xl uppercase border ${u.role === 'admin' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-slate-950 border-slate-800 text-slate-405 text-slate-400'}`}>
                        {u.role}
                      </span>
                    </div>

                    <div className="flex justify-between items-center border-t border-slate-850 pt-3 text-[10px] font-bold">
                      <span className="text-slate-500">Registered: {u.joinedDate || 'Standard Session'}</span>
                      
                      <div className="flex gap-2">
                        <button
                          onClick={() => toggleUserRoleOverride(u.email, u.role)}
                          className={`p-1 px-3 border rounded-lg text-[9px] font-black cursor-pointer transition-colors ${u.role === 'admin' ? 'bg-slate-950 border-slate-800 hover:border-indigo-650 text-indigo-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-450 hover:bg-rose-500 hover:text-white'}`}
                        >
                          {u.role === 'admin' ? 'Demote Agent' : 'Promote Admin'}
                        </button>
                        <button
                          onClick={() => deleteUserRecord(u.email)}
                          className="p-1 px-2.5 bg-slate-955 hover:bg-rose-500/30 text-rose-455 hover:text-rose-400 border border-rose-500/10 rounded-lg text-[9px] font-black transition-colors"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

            </motion.div>
          )}

        </main>
      </div>

      {/* RENDER DYNAMIC POPUP MODAL DIALOGS SUBCHANNELS */}
      
      {/* 1. PRODUCT METADATA FORM DIALOG */}
      <AnimatePresence>
        {isProductFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsProductFormOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-lg rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl overflow-y-auto max-h-[90vh] z-10 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3.5 mb-5">
                <h3 className="text-sm font-black tracking-widest text-slate-100 uppercase font-mono">
                  {productFormMode === 'create' ? 'Stock New Catalog SKU' : 'Alter Product Parameter Records'}
                </h3>
                <button
                  onClick={() => setIsProductFormOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleProductFormSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">SKU identifier</label>
                    <input
                      type="text"
                      disabled
                      value={pId}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-455 text-slate-400 font-mono rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Catalog Category</label>
                    <select
                      value={pCategory}
                      onChange={(e) => setPCategory(e.target.value)}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-200 font-bold rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Accessories">Accessories</option>
                      <option value="Lifestyle">Lifestyle</option>
                      <option value="Home">Home</option>
                      <option value="Apparel">Apparel</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Product MSRP Name</label>
                  <input
                    type="text"
                    required
                    required-placeholder="e.g. Hale Insulated Flask"
                    value={pName}
                    onChange={(e) => setPName(e.target.value)}
                    className="w-full p-2.5 bg-slate-955 bg-slate-950 border border-slate-800 text-slate-100 font-bold rounded-xl focus:outline-none focus:border-indigo-505 focus:border-indigo-505"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Price (BDT ৳)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={pPrice}
                      onChange={(e) => setPPrice(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-100 font-black rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Strikethrough Price (MSRP Original)</label>
                    <input
                      type="number"
                      placeholder="Optional"
                      value={pOriginalPrice}
                      onChange={(e) => setPOriginalPrice(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-100 font-bold rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Starting Stock units</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={pStock}
                      onChange={(e) => setPStock(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-100 font-bold rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Reserves Max Limit</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={pMaxStock}
                      onChange={(e) => setPMaxStock(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-100 font-bold rounded-xl focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Cover Image Source (Unsplash URL)</label>
                  <input
                    type="text"
                    required
                    value={pImages[0]}
                    onChange={(e) => setPImages([e.target.value])}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-205 text-slate-200 font-mono rounded-xl focus:outline-none focus:border-indigo-505"
                  />
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Retail Description</label>
                  <textarea
                    rows={3}
                    value={pDescription}
                    onChange={(e) => setPDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-200 font-medium rounded-xl focus:outline-none focus:border-indigo-500 font-sans"
                    placeholder="Provide a detailed quiet luxury product narrative..."
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsProductFormOpen(false)}
                    className="w-1/2 py-3 bg-slate-955 bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 rounded-xl font-bold text-center cursor-pointer transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl text-center cursor-pointer transition-colors shadow-lg"
                  >
                    Confirm Changes
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 2. COUPON CAMPAIGN CREATION DIALOG */}
      <AnimatePresence>
        {isCouponFormOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCouponFormOpen(false)}
              className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="relative w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl z-10 text-xs text-slate-305"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <h3 className="text-sm font-black text-slate-100 uppercase font-mono tracking-widest text-[11px]">
                  Bake New Voucher Campaign
                </h3>
                <button
                  onClick={() => setIsCouponFormOpen(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-full cursor-pointer hover:bg-slate-800"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4">
                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Coupon Promo Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. OFF40"
                    value={cCode}
                    onChange={(e) => setCCode(e.target.value.toUpperCase())}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-100 font-black rounded-xl focus:outline-none focus:border-indigo-500 uppercase tracking-widest text-center"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Campaign Type</label>
                    <select
                      value={cType}
                      onChange={(e) => setCType(e.target.value as 'percentage' | 'fixed')}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-250 text-slate-200 font-bold rounded-xl focus:outline-none focus:border-indigo-500 cursor-pointer"
                    >
                      <option value="percentage">Percentage %</option>
                      <option value="fixed">Fixed Val (৳)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Discount Value</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={cValue}
                      onChange={(e) => setCValue(Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-100 font-black rounded-xl focus:outline-none focus:border-indigo-550"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Min required Basket Spend (৳)</label>
                    <input
                      type="number"
                      placeholder="Optional (e.g. 100)"
                      value={cMinSpend}
                      onChange={(e) => setCMinSpend(e.target.value === '' ? '' : Number(e.target.value))}
                      className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-100 font-bold rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1">Redeem Description Narrative</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Save 10% on your cart overall totals."
                    value={cDescription}
                    onChange={(e) => setCDescription(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 text-slate-200 font-bold rounded-xl focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => setIsCouponFormOpen(false)}
                    className="w-1/2 py-2.5 bg-slate-950 hover:bg-slate-800 text-slate-400 border border-slate-800 rounded-xl font-bold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl cursor-pointer"
                  >
                    Bake Campaign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {previewOrder && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:block">
          {/* Overlay background closer */}
          <div className="absolute inset-0 print:hidden" onClick={() => setPreviewOrder(null)} />
          
          {/* Printable Invoice Container Card */}
          <div className="relative w-full max-w-2xl bg-white text-slate-800 rounded-3xl p-8 print:p-0 print:shadow-none print:rounded-none shadow-2xl print:bg-white print:text-black print:max-w-full my-auto max-h-[90vh] overflow-y-auto print:max-h-none print:overflow-visible">
            
            {/* INVOICE LETTERHEAD */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b pb-6 print:border-b-2 print:border-slate-300">
              <div>
                <h2 className="text-xl font-mono font-black uppercase tracking-wider text-slate-900 print:text-black">
                  {companyName || 'AURA BOUTIQUE LTD.'}
                </h2>
                <p className="text-xs text-slate-500 font-medium font-sans mt-1 print:text-slate-700">
                  {companyAddress || 'Dhanmondi, Dhaka, Bangladesh'}
                </p>
                <p className="text-[11px] text-slate-400 font-semibold font-sans mt-0.5 print:text-slate-650">
                  Hotline Help Desk: <span className="font-mono text-indigo-650 text-[11px] font-bold">{companyComplainPhone || '+880 1711-234567'}</span>
                </p>
              </div>
              <div className="text-left sm:text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-[#a855f7] bg-[#fdf4ff] px-2.5 py-1 rounded-full print:border print:border-slate-300 print:text-black">
                  Tax Invoice
                </span>
                <p className="text-[11px] font-mono font-black text-slate-900 mt-2.5 print:text-black">
                  INVOICE: #{previewOrder.id}
                </p>
                <p className="text-[10.5px] text-slate-400 font-semibold mt-0.5 print:text-slate-605">
                  Issued: {previewOrder.date}
                </p>
              </div>
            </div>

            {/* CUSTOMER & SHIPMENT SPECIFICATIONS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-b print:border-b-2 print:border-slate-300 print:py-4">
              <div>
                <h4 className="text-[9px] uppercase font-black text-slate-400 tracking-wider">Bill To Consignee:</h4>
                <div className="mt-1.5 space-y-0.5 text-xs text-slate-700 font-medium">
                  <p className="text-sm font-black text-slate-900">{previewOrder.shippingAddress.fullName}</p>
                  <p className="text-slate-600">{previewOrder.shippingAddress.addressLine1}</p>
                  <p className="text-slate-600">{previewOrder.shippingAddress.city}, {previewOrder.shippingAddress.state}</p>
                  <p className="font-mono font-bold text-indigo-650 pt-0.5">Contact: {previewOrder.shippingAddress.phone}</p>
                </div>
              </div>

              <div className="md:text-right">
                <h4 className="text-[9px] uppercase font-black text-slate-400 tracking-wider md:text-right">Fulfillment Variables:</h4>
                <div className="mt-1.5 space-y-1 text-xs text-slate-700 font-medium">
                  <p className="text-slate-600">
                    Routing Channel: <span className="font-bold text-slate-800">Home Courier Delivery</span>
                  </p>
                  <p className="text-slate-600">
                    Order Status Indicator: <span className="font-bold uppercase text-[10.5px] text-indigo-600 font-mono">{previewOrder.status}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* LINE ITEMS DETAIL TABLE */}
            <div className="py-6 print:py-4">
              <table className="w-full text-left font-sans text-xs">
                <thead>
                  <tr className="border-b text-[9.5px] font-black uppercase text-slate-400 tracking-wider">
                    <th className="py-2.5 w-10">SL</th>
                    <th className="py-2.5">Product SKU description</th>
                    <th className="py-2.5 text-right">Unit Price</th>
                    <th className="py-2.5 text-center w-16">Qty</th>
                    <th className="py-2.5 text-right w-24">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y text-slate-700 font-medium">
                  {previewOrder.items.map((it, itemIdx) => (
                    <tr key={itemIdx} className="hover:bg-slate-50/20">
                      <td className="py-3 font-semibold text-slate-455 text-[11px]">
                        {String(itemIdx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3">
                        <span className="font-black text-slate-900">{it.productName}</span>
                        {it.selectedColor && (
                          <span className="text-[9.5px] text-slate-400 font-bold block mt-0.5">
                            Colorway: {typeof it.selectedColor === 'object' ? (it.selectedColor as any).name : it.selectedColor}
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right font-mono">৳{it.price}</td>
                      <td className="py-3 text-center font-bold">{it.quantity}</td>
                      <td className="py-3 text-right font-mono font-bold">৳{it.price * it.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* TOTALS LEDGER SUMMARY */}
            <div className="border-t pt-4 flex justify-end print:border-t-2 print:border-slate-300">
              <div className="w-full sm:w-64 space-y-1.5 text-xs text-slate-650 font-medium">
                <div className="flex justify-between">
                  <span>Cart Items Subtotal</span>
                  <span className="font-mono text-slate-800">৳{previewOrder.subtotal}</span>
                </div>
                {previewOrder.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 font-bold">
                    <span>Campaign Discount Saved</span>
                    <span className="font-mono">-৳{previewOrder.discount}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Standard Shipping Freight</span>
                  <span className="font-mono text-slate-800">৳{previewOrder.shipping}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 border-t pt-2 print:border-t p-1">
                  <span>TOTAL settled</span>
                  <span className="font-mono text-emerald-600 text-sm">৳{previewOrder.total}</span>
                </div>
              </div>
            </div>

            {/* LEGALESE & GREETING FOOTNOTE */}
            <div className="mt-8 border-t pt-6 text-center text-[10.5px] text-slate-400 font-sans leading-relaxed print:mt-12">
              <p className="font-bold text-slate-800">Thank you for checking out with {companyName || 'Aura Boutique'}!</p>
              <p className="text-[10px] mt-1 text-slate-400">If you have any feedback or package complaints, call hotline desk box anytime. This is an official secure system computer-generated bill.</p>
            </div>

            {/* PREVIEW DIALOG ACTIONS CONTROLS */}
            <div className="flex items-center gap-3 mt-8 pt-4 border-t print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 bg-indigo-650 text-white rounded-xl text-xs font-black hover:bg-indigo-700 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg bg-indigo-600"
              >
                <Printer className="h-4 w-4" />
                <span>Begin Print Run</span>
              </button>
              <button
                onClick={() => setPreviewOrder(null)}
                className="py-2.5 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Close Preview
              </button>
            </div>

          </div>
        </div>
      )}

      {modalConfirm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setModalConfirm(null)} />
          <div className="relative w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 text-slate-100 shadow-2xl space-y-5">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-500/10 text-rose-500 rounded-xl shrink-0">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white uppercase tracking-wider font-mono">System Confirmation</h4>
                <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">{modalConfirm.message}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => {
                  modalConfirm.onSafeConfirm();
                  setModalConfirm(null);
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black transition-colors cursor-pointer"
              >
                Confirm Action
              </button>
              <button
                onClick={() => setModalConfirm(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer border border-slate-750"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
