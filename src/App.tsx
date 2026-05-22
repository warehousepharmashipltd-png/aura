/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ShoppingCart,
  User as UserIcon,
  Search,
  Sparkles,
  ArrowRight,
  Filter,
  ArrowUpDown,
  Layers,
  Store,
  Compass,
  CheckCircle,
  Clock,
  ExternalLink
} from 'lucide-react';

import { Product, CartItem, User } from './types';
import { INITIAL_PRODUCTS } from './data/products';
import AuthModal from './components/AuthModal';
import ProductCard from './components/ProductCard';
import ProductDetailModal from './components/ProductDetailModal';
import CartDrawer from './components/CartDrawer';
import CheckoutWizard from './components/CheckoutWizard';
import UserDashboard from './components/UserDashboard';

export default function App() {
  // Products listing - state loaded from local storage if existing
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('aura_custom_products');
    if (saved) return JSON.parse(saved);
    localStorage.setItem('aura_custom_products', JSON.stringify(INITIAL_PRODUCTS));
    return INITIAL_PRODUCTS;
  });

  const handleUpdateProducts = (updatedProds: Product[]) => {
    setProducts(updatedProds);
    localStorage.setItem('aura_custom_products', JSON.stringify(updatedProds));
  };

  // Cart Management State
  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('aura_cart');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('aura_cart', JSON.stringify(cart));
  }, [cart]);

  // Session user profile state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('aura_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Toggles and Modals
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Filters & Search Parameters
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('default');

  // Dashboard toggles
  const [viewingDashboard, setViewingDashboard] = useState(false);
  const [dashboardTab, setDashboardTab] = useState<'orders' | 'admin'>('orders');

  // Checkout math presets
  const [checkoutMath, setCheckoutMath] = useState({
    subtotal: 0,
    discount: 0,
    shipping: 15,
    couponUsed: ''
  });

  // Unique category extraction from listing
  const categories = ['All', ...Array.from(new Set(INITIAL_PRODUCTS.map((p) => p.category)))];

  // Cart operations
  const handleAddToCart = (product: Product, quantity: number, color: { name: string; hex: string }, size?: string) => {
    setCart((prevCart) => {
      // Look for identical configurations
      const existingIdx = prevCart.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedColor.name === color.name &&
          item.selectedSize === size
      );

      if (existingIdx > -1) {
        const updated = [...prevCart];
        const newQty = Math.min(product.stock, updated[existingIdx].quantity + quantity);
        updated[existingIdx] = { ...updated[existingIdx], quantity: newQty };
        return updated;
      } else {
        return [...prevCart, { product, quantity, selectedColor: color, selectedSize: size }];
      }
    });
  };

  const handleAddToCartDirect = (product: Product) => {
    // Pick first color way and dimensions if clicking quick-add
    const color = product.colors[0];
    const size = product.sizes ? product.sizes[0] : undefined;
    handleAddToCart(product, 1, color, size);

    // Prompt slide cart instantly for visual feedback
    setIsCartOpen(true);
  };

  const handleUpdateCartQty = (idx: number, newQty: number) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      if (newQty <= 0) {
        updated.splice(idx, 1);
      } else {
        const item = updated[idx];
        const constrainedQty = Math.min(item.product.stock, newQty);
        updated[idx] = { ...item, quantity: constrainedQty };
      }
      return updated;
    });
  };

  const handleRemoveCartItem = (idx: number) => {
    setCart((prevCart) => {
      const updated = [...prevCart];
      updated.splice(idx, 1);
      return updated;
    });
  };

  const handleInitiateSecureCheckout = (subtotal: number, discount: number, shipping: number, couponUsed?: string) => {
    setCheckoutMath({ subtotal, discount, shipping, couponUsed: couponUsed || '' });
    setIsCartOpen(false);
    setIsCheckoutOpen(true);
  };

  const handleCheckoutWizardComplete = () => {
    // Order successful, purge shopping cart
    setCart([]);
    setIsCheckoutOpen(false);
    // Display dashboard history tab instantly
    setDashboardTab('orders');
    setViewingDashboard(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('aura_current_user');
    setCurrentUser(null);
    setViewingDashboard(false);
  };

  const handleAuthSuccess = (user: User) => {
    setCurrentUser(user);
    if (user.role === 'admin') {
      setDashboardTab('admin');
    } else {
      setDashboardTab('orders');
    }
  };

  // Filter & Sort Calculation
  const filteredProducts = products.filter((p) => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'price-low-high') return a.price - b.price;
    if (sortBy === 'price-high-low') return b.price - a.price;
    if (sortBy === 'rating') return b.rating - a.rating;
    return 0; // default initial layout sequence
  });

  return (
    <div className="min-h-screen bg-sky-50 flex flex-col font-sans antialiased text-slate-800">
      
      {/* GLOBAL BILLBOARD HEADER */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-100 px-4 md:px-8 py-4 transition-all print:hidden">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          
          {/* Brand Logo Title */}
          <div
            onClick={() => setViewingDashboard(false)}
            className="flex items-center gap-2.5 cursor-pointer select-none group"
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-md shadow-indigo-150 group-hover:scale-105 transition-all">
              <svg className="w-5.5 h-5.5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
              AURA
            </h1>
          </div>

          {/* Quick-actions right-aligned tools */}
          <div className="flex items-center gap-3">
            
            {/* Catalog Navigate Switcher */}
            {viewingDashboard && (
              <button
                id="header_shop_cta"
                onClick={() => setViewingDashboard(false)}
                className="flex items-center gap-1.5 py-2 px-4 bg-indigo-50 text-indigo-600 rounded-full text-xs font-bold hover:bg-indigo-100 cursor-pointer transition-colors"
              >
                <Store className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Storefront</span>
              </button>
            )}

            {/* Shopping Cart Trigger icon */}
            <button
              id="header_cart_trigger"
              onClick={() => setIsCartOpen(true)}
              className="relative p-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 rounded-full transition-colors cursor-pointer"
              title="Open Checkout Cart"
            >
              <ShoppingCart className="h-4.5 w-4.5" />
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center border-2 border-white animate-pulse">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>

            {/* Personal credentials trigger option */}
            {currentUser ? (
              <button
                id="header_dashboard_trigger"
                onClick={() => setViewingDashboard(!viewingDashboard)}
                className={`flex items-center gap-2 border rounded-full p-0.5 pr-2.5 bg-white cursor-pointer hover:shadow-xs hover:border-indigo-300 transition-all ${viewingDashboard ? 'border-indigo-600 ring-2 ring-indigo-600/20' : 'border-slate-200'}`}
                title="Your Personal Dashboard"
              >
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="h-6 w-6 rounded-full object-cover shrink-0"
                  referrerPolicy="no-referrer"
                />
                <span className="text-[11px] font-bold text-slate-700 hidden sm:inline">
                  {currentUser.fullName.split(' ')[0]}
                </span>
              </button>
            ) : (
              <button
                id="header_login_trigger"
                onClick={() => setIsAuthOpen(true)}
                className="px-5 py-2 bg-slate-900 text-white rounded-full font-bold text-xs shadow-lg hover:shadow-indigo-200 hover:bg-indigo-600 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <UserIcon className="h-3.5 w-3.5" />
                <span>Join / Login</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* CORE FRAME LAYOUT */}
      <main className="flex-grow">
        <AnimatePresence mode="wait">
          
          {/* SCREEN LAYOUT A: AUTHENTICATED CUSTOMER / ADMIN DASHBOARD */}
          {viewingDashboard && currentUser ? (
            <motion.div
              key="dashboard_screen"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Back breadcrumb panel block */}
              <div className="bg-neutral-900 text-white p-5 border-b border-neutral-800">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-xs font-mono font-medium text-neutral-300 tracking-wider">
                      MEMBERSHIP SESSION LIVE
                    </span>
                  </div>
                  <button
                    id="dashboard_back_store_cta"
                    onClick={() => setViewingDashboard(false)}
                    className="text-xs font-semibold text-neutral-200 hover:text-white underline underline-offset-4 cursor-pointer"
                  >
                    ← Back to retail storefront
                  </button>
                </div>
              </div>

              {/* Central user workspace panels */}
              <UserDashboard
                user={currentUser}
                onLogout={handleLogout}
                products={products}
                onUpdateProducts={handleUpdateProducts}
                activeTab={dashboardTab}
                onChangeTab={setDashboardTab}
              />
            </motion.div>
          ) : (
            /* SCREEN LAYOUT B: CATALOG RETAIL STOREFRONT (DEFAULT SINGLE-SCREEN LAYOUT) */
            <motion.div
              key="storefront_screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="space-y-6 pb-20"
            >
              
              {/* LANDING MARKETING HERO CARD */}
              <section id="store_hero_section" className="px-4 md:px-8 pt-8">
                <div className="max-w-7xl mx-auto bg-indigo-600 rounded-[2.5rem] text-white p-8 md:p-12 relative overflow-hidden flex flex-col justify-between min-h-[320px] shadow-xl shadow-indigo-100/50">
                  
                  {/* Absolute visual mesh patterns backing */}
                  <div className="absolute right-0 top-0 h-full w-1/3 bg-indigo-500/20 rounded-l-full pointer-events-none" />
                  
                  {/* Floating Yellow Promo Circle Badge */}
                  <div className="hidden md:flex absolute right-16 top-1/2 -translate-y-1/2 w-28 h-28 bg-yellow-400 rounded-full flex-col items-center justify-center animate-pulse text-indigo-950 font-black shadow-lg transform rotate-12 select-none z-10">
                    <span className="text-xs uppercase tracking-wider font-extrabold text-indigo-900">Summer</span>
                    <span className="text-2xl font-black leading-none">-40%</span>
                    <span className="text-[9px] uppercase tracking-widest font-bold">Promo</span>
                  </div>

                  <div className="max-w-xl z-10 space-y-4">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 backdrop-blur-md text-yellow-300 text-[10px] font-bold tracking-widest uppercase">
                      <Sparkles className="h-3.5 w-3.5 text-yellow-300 animate-pulse" />
                      <span>Quiet Luxury Tactile Goods</span>
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black tracking-tight leading-tight">
                      Aesthetic Essentials, <span className="text-yellow-300">Designed for Pause</span>.
                    </h2>
                    
                    <p className="text-sm text-indigo-100 leading-relaxed font-medium max-w-lg">
                      Invest in longevity. Hand-selected accessories, electronics, and daily essentials engineered with mathematical precision, rich carbon inlays, and durable solid brass frames.
                    </p>
                  </div>

                  {/* Built search query input wrapper in hero dock */}
                  <div className="mt-8 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white/10 backdrop-blur-md p-2.5 rounded-2xl border border-white/10 z-10 max-w-2xl font-sans">
                    
                    {/* Filter Search Input Box */}
                    <div className="sm:col-span-3 relative bg-black/20 rounded-xl border border-white/5">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-200" />
                      <input
                        id="hero_search_input"
                        type="text"
                        placeholder="Search headphones, cardholders, lighting..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-9 pr-3 py-2 text-xs text-white focus:outline-none placeholder-indigo-200 bg-transparent"
                      />
                    </div>

                    {/* Quick clear filter option */}
                    {(searchQuery || activeCategory !== 'All') ? (
                      <button
                        id="hero_clear_filters_btn"
                        onClick={() => {
                          setSearchQuery('');
                          setActiveCategory('All');
                        }}
                        className="py-2 px-3 hover:bg-white hover:text-indigo-600 transition-all text-xs font-bold text-white bg-transparent border border-white/15 rounded-xl cursor-pointer"
                      >
                        Reset Terms
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          // Focus input or trigger alert
                          const inputEle = document.getElementById('hero_search_input');
                          if (inputEle) inputEle.focus();
                        }}
                        className="py-2 px-3 bg-white text-indigo-600 hover:bg-slate-50 transition-all text-xs font-bold rounded-xl cursor-pointer"
                      >
                        Search Shop
                      </button>
                    )}
                  </div>
                </div>
              </section>

              {/* DYNAMIC COLLECTIONS AND COLLECTION FILTERS TABLE ROW */}
              <section id="catalog_filters_section" className="px-4 md:px-8">
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between border-b border-slate-200/50 pb-5">
                  
                  {/* Category Pill select row */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 sm:pb-0 w-full sm:w-auto scrollbar-hide">
                    <Filter className="h-3.5 w-3.5 text-slate-400 mr-1.5 shrink-0 hidden sm:inline" />
                    {categories.map((cat) => (
                      <button
                        id={`category_pill_${cat.replace(/\s+/g, '')}`}
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-2 rounded-full text-xs font-bold tracking-tight whitespace-nowrap transition-all cursor-pointer ${
                          activeCategory === cat
                            ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100'
                            : 'bg-white border border-slate-200 text-slate-500 hover:text-indigo-600 hover:border-indigo-200 hover:bg-indigo-50/50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>

                  {/* Ordering sorting Drop-down selector */}
                  <div className="flex items-center gap-1.5 shrink-0 ml-auto sm:ml-0">
                    <ArrowUpDown className="h-3.5 w-3.5 text-slate-400" />
                    <select
                      id="catalog_sorter"
                      value={sortBy}
                      onChange={(e) => setSortBy(e.target.value)}
                      className="px-3 py-2 bg-white border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 rounded-xl text-xs font-bold text-slate-600 cursor-pointer transition-all hover:border-slate-350"
                    >
                      <option value="default">Default Catalog Sorting</option>
                      <option value="price-low-high">MSRP Price: Low to High</option>
                      <option value="price-high-low">MSRP Price: High to Low</option>
                      <option value="rating">Customer Satisfaction Rating</option>
                    </select>
                  </div>
                </div>
              </section>

              {/* CORE METRIC PRODUCTS COLLECTION GRID */}
              <section id="catalog_grid_section" className="px-4 md:px-8">
                <div className="max-w-7xl mx-auto">
                  {sortedProducts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-neutral-200 rounded-3xl bg-white p-8">
                      <div className="h-10 w-10 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-400 mb-3 border border-neutral-100">
                        <Search className="h-5 w-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-neutral-800">No products match your filter search</h3>
                      <p className="text-xs text-neutral-400 max-w-[280px] mt-1 mb-5">
                        Try modifying your keyword inputs or categories to explore alternative boutique essentials!
                      </p>
                      <button
                        id="reset_filtering_cta"
                        onClick={() => {
                          setSearchQuery('');
                          setActiveCategory('All');
                        }}
                        className="py-2 px-5 bg-indigo-600 text-white rounded-full text-xs font-bold hover:bg-indigo-700 cursor-pointer shadow-md shadow-indigo-100 transition-all"
                      >
                        Show All SKUs
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                      {sortedProducts.map((p) => (
                        <ProductCard
                          key={p.id}
                          product={p}
                          onSelect={setSelectedProduct}
                          onAddToCartDirect={handleAddToCartDirect}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>

            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* FOOTER BLOCK CREDITS */}
      <footer className="px-8 py-5 bg-white flex flex-col sm:flex-row justify-between items-center gap-4 border-t border-slate-100 print:hidden mt-auto">
        <div className="flex space-x-6 text-[11px] font-bold text-slate-400 uppercase tracking-tight">
          <span>Terms</span>
          <span>Privacy</span>
          <span>Support</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">Secure Checkout Enabled</span>
        </div>
      </footer>

      {/* REUSABLE INTEGRATED MODAL CHANNELS */}

      {/* 1. Cryptographically verified Auth dialog */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={handleAuthSuccess}
      />

      {/* 2. Slide cart side drawers panel */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        onUpdateQuantity={handleUpdateCartQty}
        onRemoveItem={handleRemoveCartItem}
        onInitiateCheckout={handleInitiateSecureCheckout}
        isLoggedIn={!!currentUser}
        onPromptLogin={() => {
          setIsCartOpen(false);
          setIsAuthOpen(true);
        }}
      />

      {/* 3. Product detailed features overlay modal */}
      <ProductDetailModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(product, qty, color, size) => {
          handleAddToCart(product, qty, color, size);
          setSelectedProduct(null);
          setIsCartOpen(true);
        }}
      />

      {/* 4. Payment clearing secure checkout portal */}
      {currentUser && (
        <CheckoutWizard
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          cart={cart}
          subtotal={checkoutMath.subtotal}
          discount={checkoutMath.discount}
          shipping={checkoutMath.shipping}
          couponCodeUsed={checkoutMath.couponUsed}
          userEmail={currentUser.email}
          userFullName={currentUser.fullName}
          onCheckoutComplete={handleCheckoutWizardComplete}
        />
      )}

    </div>
  );
}
