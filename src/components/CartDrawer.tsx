/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trash2, Tag, Ticket, HelpCircle, ArrowRight, ShoppingCart, Plus, Minus, Check } from 'lucide-react';
import { CartItem, Coupon } from '../types';
import { INITIAL_COUPONS } from '../data/products';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onUpdateQuantity: (idx: number, newQty: number) => void;
  onRemoveItem: (idx: number) => void;
  onInitiateCheckout: (subtotal: number, discount: number, shipping: number, couponUsed?: string) => void;
  isLoggedIn: boolean;
  onPromptLogin: () => void;
}

export default function CartDrawer({
  isOpen,
  onClose,
  cart,
  onUpdateQuantity,
  onRemoveItem,
  onInitiateCheckout,
  isLoggedIn,
  onPromptLogin
}: CartDrawerProps) {
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');
  const [activeCoupon, setActiveCoupon] = useState<Coupon | null>(null);

  if (!isOpen) return null;

  // Calculate prices
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Free shipping on subtotal > $150
  const isFreeShipping = subtotal > 150;
  let baseShipping = subtotal === 0 ? 0 : 15;

  // Coupon evaluation
  let discount = 0;
  if (activeCoupon) {
    if (activeCoupon.minSpend && subtotal < activeCoupon.minSpend) {
      // Deactivate coupon automatically if spend drops below minimum threshold
      setCouponError(`Spend limit of ৳${activeCoupon.minSpend} required.`);
      setActiveCoupon(null);
    } else {
      if (activeCoupon.type === 'percentage') {
        discount = Math.round(subtotal * (activeCoupon.value / 100));
      } else if (activeCoupon.type === 'fixed') {
        if (activeCoupon.code === 'FREESHIP') {
          // Free shipping coupon overrides shipping to 0
          baseShipping = 0;
          discount = 0;
        } else {
          discount = activeCoupon.value;
        }
      }
    }
  }

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    setCouponError('');
    const code = couponInput.trim().toUpperCase();

    if (!code) return;

    const couponsString = localStorage.getItem('aura_coupons');
    const couponsList: Coupon[] = couponsString ? JSON.parse(couponsString) : INITIAL_COUPONS;
    const foundCoupon = couponsList.find((c) => c.code === code);
    if (!foundCoupon) {
      setCouponError('This coupon is invalid.');
      return;
    }

    if (foundCoupon.minSpend && subtotal < foundCoupon.minSpend) {
      setCouponError(`Min purchase of ৳${foundCoupon.minSpend} required.`);
      return;
    }

    setActiveCoupon(foundCoupon);
    setCouponInput('');
    setCouponError('');
  };

  const handleRemoveCoupon = () => {
    setActiveCoupon(null);
    setCouponError('');
  };

  const grandTotal = Math.max(0, subtotal - discount + baseShipping);

  const handleCheckoutClick = () => {
    if (!isLoggedIn) {
      onPromptLogin();
    } else {
      onInitiateCheckout(subtotal, discount, baseShipping, activeCoupon?.code);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop background */}
        <motion.div
          id="cart_backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-neutral-900/40 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Sliding Panel Window */}
        <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            id="cart_panel"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="w-screen max-w-md bg-white rounded-l-[40px] shadow-2xl flex flex-col justify-between border-l border-slate-100 overflow-hidden"
          >
            {/* Header section */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <ShoppingCart className="h-5.5 w-5.5 text-indigo-600" />
                <h2 className="text-base font-black text-slate-900 tracking-wider">
                  YOUR CART ({cart.reduce((sum, item) => sum + item.quantity, 0)})
                </h2>
              </div>
              <button
                id="close_cart_btn"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-full transition-colors cursor-pointer"
                title="Keep Shopping"
              >
                <X className="h-5.5 w-5.5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-grow overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full py-10 text-center">
                  <div className="h-16 w-16 bg-indigo-50 rounded-full flex items-center justify-center text-indigo-600 mb-4 border border-indigo-100/30">
                    <ShoppingCart className="h-7 w-7" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-805">Your shopping cart is empty</h3>
                  <p className="text-xs text-slate-400 max-w-[240px] mt-1 mb-5">
                    Start adding items from our premium essentials collection to build your order!
                  </p>
                  <button
                    id="cart_empty_shop_cta"
                    onClick={onClose}
                    className="py-2 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-bold text-white transition-all cursor-pointer"
                  >
                    Explore Catalog
                  </button>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div
                    id={`cart_item_${idx}`}
                    key={`${item.product.id}_${idx}`}
                    className="flex gap-4 p-3 border border-slate-100 bg-slate-55/30 bg-slate-50/30 rounded-2xl relative group hover:border-indigo-100 transition-colors"
                  >
                    {/* Item Thumbnail */}
                    <div className="h-20 w-20 rounded-xl overflow-hidden bg-slate-55 bg-slate-50 shrink-0 border border-slate-100">
                      <img
                        src={item.product.images[0]}
                        alt={item.product.name}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    </div>

                    {/* Meta Details */}
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start gap-1">
                          <h4 className="text-xs font-bold text-slate-805 limit-text-1 leading-tight tracking-tight">
                            {item.product.name}
                          </h4>
                          <span className="text-xs font-bold text-slate-900 shrink-0">
                            ৳{item.product.price * item.quantity}
                          </span>
                        </div>
                        {/* Selected configuration highlights */}
                        <div className="flex flex-wrap items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded-md font-sans">
                            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: item.selectedColor.hex }} />
                            <span>{item.selectedColor.name}</span>
                          </span>
                          {item.selectedSize && (
                            <span className="text-[10px] text-slate-400 bg-white border border-slate-100 px-1.5 py-0.5 rounded-md font-sans">
                              Size: {item.selectedSize}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Controls Row */}
                      <div className="flex items-center justify-between mt-2.5">
                        <div className="flex items-center border border-slate-200 rounded-lg px-2 py-0.5 bg-white scale-90 -ml-1">
                          <button
                            id={`cart_dec_${idx}`}
                            onClick={() => onUpdateQuantity(idx, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="p-1 text-slate-400 hover:text-slate-950 disabled:opacity-20 transition-opacity cursor-pointer"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="text-xs font-bold text-slate-800 w-6 text-center">
                            {item.quantity}
                          </span>
                          <button
                            id={`cart_inc_${idx}`}
                            onClick={() => onUpdateQuantity(idx, item.quantity + 1)}
                            disabled={item.quantity >= item.product.stock}
                            className="p-1 text-slate-400 hover:text-slate-950 disabled:opacity-20 transition-opacity cursor-pointer"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>

                        <button
                          id={`cart_trash_${idx}`}
                          onClick={() => onRemoveItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-500 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
                          title="Remove product"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Calculations and Coupon module */}
            {cart.length > 0 && (
              <div className="border-t border-slate-100 bg-slate-50/70 p-5 space-y-4 rounded-b-[40px]">
                {/* Promo Code Applied Label */}
                {activeCoupon ? (
                  <div
                    id="applied_coupon_badge"
                    className="flex items-center justify-between px-3 py-2.5 bg-indigo-50 text-indigo-800 text-xs border border-indigo-100 rounded-xl"
                  >
                    <div className="flex items-center gap-1.5">
                      <Tag className="h-3.5 w-3.5 text-indigo-600 animate-pulse" />
                      <span className="font-extrabold tracking-wide uppercase">{activeCoupon.code}</span>
                      <span className="text-[10px] text-indigo-600 font-bold">({activeCoupon.description})</span>
                    </div>
                    <button
                      id="remove_coupon_btn"
                      onClick={handleRemoveCoupon}
                      className="text-indigo-700 hover:text-red-650 text-xs font-bold cursor-pointer underline underline-offset-2"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  /* Coupon code input form */
                  <form onSubmit={handleApplyCoupon} className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-grow">
                        <Ticket className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          id="coupon_code_input"
                          type="text"
                          placeholder="PROMO CODE (WELCOME10)"
                          value={couponInput}
                          onChange={(e) => {
                            setCouponInput(e.target.value);
                            setCouponError('');
                          }}
                          className="w-full pl-8 pr-3 py-2 border border-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-600 rounded-xl text-xs uppercase tracking-wider bg-white font-bold text-slate-800"
                        />
                      </div>
                      <button
                        id="apply_coupon_btn"
                        type="submit"
                        className="px-3.5 py-2 hover:bg-slate-900 hover:text-white transition-all text-xs font-bold text-slate-900 rounded-xl cursor-pointer bg-white border border-slate-300"
                      >
                        Apply
                      </button>
                    </div>
                    {couponError && (
                      <p id="coupon_error_text" className="text-[10px] text-red-600 font-medium pl-1">
                        {couponError}
                      </p>
                    )}
                    <span className="block text-[9px] text-slate-400 pl-1 font-medium select-none">
                      💡 Active Codes: <span className="font-bold">WELCOME10</span> (10% Off) | <span className="font-bold">FREESHIP</span> (Free S&H)
                    </span>
                  </form>
                )}

                {/* Receipt Line Ledger */}
                <div className="space-y-2 text-xs text-slate-500 border-b border-slate-150/40 pb-3">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-bold text-slate-900">৳{subtotal}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-indigo-600 font-bold">
                      <span>Promo Savings</span>
                      <span>-৳{discount}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping & Handling</span>
                    {baseShipping === 0 ? (
                      <span className="text-indigo-600 font-bold">Free S&H</span>
                    ) : (
                      <span className="font-bold text-slate-900">৳{baseShipping}</span>
                    )}
                  </div>
                </div>

                {/* Grand Total */}
                <div className="flex justify-between items-baseline pt-1">
                  <span className="text-sm font-bold text-slate-900">Total Due</span>
                  <span className="text-xl font-black text-indigo-650 text-indigo-600">৳{grandTotal}</span>
                </div>

                {/* Authenticated Checkout or Prompt Login */}
                <button
                  id="checkout_nav_btn"
                  onClick={handleCheckoutClick}
                  className="w-full flex items-center justify-center gap-2 py-4 bg-indigo-600 hover:bg-indigo-700 hover:shadow-lg text-white text-sm font-black tracking-wider rounded-2xl shadow-lg shadow-indigo-100/55 transition-all cursor-pointer mt-4"
                >
                  <span>
                    {!isLoggedIn
                      ? 'Access Membership to Checkout'
                      : 'Checkout Now'}
                  </span>
                  <ArrowRight className="h-4 w-4" />
                </button>
                <p className="text-center text-[10px] text-slate-400 mt-4 uppercase tracking-widest font-bold">
                  Secure Payment Powered by Stripe
                </p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
}
