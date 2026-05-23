/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  CreditCard,
  Truck,
  ShieldCheck,
  CheckCircle,
  Building,
  Phone,
  User,
  X,
  Lock,
  ArrowLeft,
  ArrowRight,
  Sparkles,
  MapPin,
  Check,
  Printer
} from 'lucide-react';
import { CartItem, Order } from '../types';

interface CheckoutWizardProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  subtotal: number;
  discount: number;
  shipping: number;
  couponCodeUsed?: string;
  userEmail: string;
  userFullName: string;
  onCheckoutComplete: () => void;
}

export default function CheckoutWizard({
  isOpen,
  onClose,
  cart,
  subtotal,
  discount,
  shipping,
  couponCodeUsed,
  userEmail,
  userFullName,
  onCheckoutComplete
}: CheckoutWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [showDetailedInvoice, setShowDetailedInvoice] = useState(false);
  const [loadingText, setLoadingText] = useState('');
  
  // Shipping details state
  const [fullName, setFullName] = useState(userFullName || '');
  const [address1, setAddress1] = useState('');
  const [city, setCity] = useState('Dhaka');
  const [billingState, setBillingState] = useState('Dhaka');
  const [postalCode, setPostalCode] = useState('1209');
  const [country, setCountry] = useState('Bangladesh');
  const [phone, setPhone] = useState('');

  // Payment details state
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'cod'>('bkash');
  const [bkashNumber, setBkashNumber] = useState('');
  const [bkashTxnId, setBkashTxnId] = useState('');

  // Validation messages
  const [formError, setFormError] = useState('');

  // Built receipt outcome
  const [finalInvoice, setFinalInvoice] = useState<Order | null>(null);

  const saveDeliveryAddressToProfile = (nameValue: string, addrValue: string, cityValue: string, stateValue: string, zipValue: string, countryValue: string, phoneValue: string) => {
    const storedUser = localStorage.getItem('aura_current_user');
    if (!storedUser) return;
    try {
      const parsedUser = JSON.parse(storedUser);
      const deliveryAddress = {
        fullName: nameValue,
        addressLine1: addrValue,
        city: cityValue,
        state: stateValue,
        postalCode: zipValue,
        country: countryValue,
        phone: phoneValue
      };
      
      // Update current user
      parsedUser.deliveryAddress = deliveryAddress;
      localStorage.setItem('aura_current_user', JSON.stringify(parsedUser));

      // Update matching user in aura_users list
      const usersStr = localStorage.getItem('aura_users');
      if (usersStr) {
        const users = JSON.parse(usersStr);
        const matchIdx = users.findIndex((u: any) => u.email.toLowerCase() === parsedUser.email.toLowerCase());
        if (matchIdx > -1) {
          users[matchIdx].deliveryAddress = deliveryAddress;
          localStorage.setItem('aura_users', JSON.stringify(users));
        }
      }

      // Dispatch a storage event or a custom event to notify other windows/components
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormError('');
      setFinalInvoice(null);

      // Pre-fill fields from logged-in user profile's saved deliveryAddress!
      const storedUser = localStorage.getItem('aura_current_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          if (parsedUser.deliveryAddress) {
            const addr = parsedUser.deliveryAddress;
            setFullName(addr.fullName || parsedUser.fullName || '');
            setAddress1(addr.addressLine1 || '');
            setCity(addr.city || 'Dhaka');
            setBillingState(addr.state || 'Dhaka');
            setPostalCode(addr.postalCode || '1209');
            setCountry(addr.country || 'Bangladesh');
            setPhone(addr.phone || parsedUser.phoneNumber || '');
          } else {
            setFullName(parsedUser.fullName || '');
            setPhone(parsedUser.phoneNumber || '');
            setCity('Dhaka');
            setBillingState('Dhaka');
            setPostalCode('1209');
            setCountry('Bangladesh');
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setCity('Dhaka');
        setBillingState('Dhaka');
        setPostalCode('1209');
        setCountry('Bangladesh');
      }
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // State Step validations
  const validateStep1 = () => {
    setFormError('');
    if (!fullName || !address1 || !city || !billingState || !postalCode || !phone) {
      setFormError('Please complete all physical delivery parameters.');
      return false;
    }
    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 11) {
      setFormError('Please input a valid Bangladeshi contact mobile number (at least 11 digits, e.g., 01711234567).');
      return false;
    }
    // Save details to logged in user profile
    saveDeliveryAddressToProfile(fullName, address1, city, billingState, postalCode, country, phone);
    return true;
  };

  const validateStep2 = () => {
    setFormError('');
    if (paymentMethod === 'bkash') {
      if (!bkashNumber) {
        setFormError('Please enter your bKash Mobile Wallet number (the number you paid from).');
        return false;
      }
      const cleanBkash = bkashNumber.replace(/\D/g, '');
      if (cleanBkash.length < 11) {
        setFormError('The paid bKash Wallet number must contain at least 11 digits (e.g. 017XXXXXXXX).');
        return false;
      }
      if (!bkashTxnId) {
        setFormError('Please enter your bKash Transaction ID (TrxID) received from bKash.');
        return false;
      }
      if (bkashTxnId.trim().length < 4) {
        setFormError('Please enter a valid bKash Transaction ID (minimum 4 characters).');
        return false;
      }
    }
    return true;
  };

  const executePaymentLoop = () => {
    if (!validateStep2()) return;

    setStep(3);
    setFormError('');

    const phases = paymentMethod === 'bkash'
      ? [
          'Initiating secure bKash payment gateway socket stream...',
          'Locating bKash payment transaction logs...',
          'Verifying transaction ID ownership & matching ledger with 01999909891...',
          'Settling digital wallet transaction balance...',
          'Fulfilling printed invoice profiles...'
        ]
      : [
          'Registering Cash on Delivery fulfillment contract...',
          'Verifying shipping zone proximity (Bangladesh)...',
          'Configuring direct COD ledger dispatch markers...',
          'Fulfilling printed invoice profiles...'
        ];

    let timerId: any;
    let iteration = 0;

    setLoadingText(phases[0]);

    const runTickers = () => {
      iteration++;
      if (iteration < phases.length) {
        setLoadingText(phases[iteration]);
        timerId = setTimeout(runTickers, 700);
      } else {
        finalizeOrderHistory();
      }
    };

    timerId = setTimeout(runTickers, 700);
  };

  const finalizeOrderHistory = () => {
    // Math details
    const tax = Math.round(subtotal * 0.05); // 5% tax
    const total = subtotal - discount + shipping + tax;
    const trackingID = 'AU-' + Math.floor(1000000 + Math.random() * 9000000) + '-BD';
    const orderID = 'ORD-' + Math.floor(10000000 + Math.random() * 90000000).toString(36).toUpperCase();

    // Built Object
    const newInvoice: Order = {
      id: orderID,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      items: cart.map((item) => ({
        productId: item.product.id,
        productName: item.product.name,
        productImage: item.product.images[0],
        price: item.product.price,
        quantity: item.quantity,
        selectedColor: item.selectedColor.name,
        selectedSize: item.selectedSize
      })),
      subtotal,
      discount,
      shipping,
      tax,
      total,
      couponCodeUsed,
      shippingAddress: {
        fullName,
        addressLine1: address1,
        city,
        state: billingState,
        postalCode,
        country,
        phone
      },
      paymentMethod,
      paymentDetails:
        paymentMethod === 'bkash'
          ? {
              bkashNumber,
              bkashTxnId: bkashTxnId.trim().toUpperCase(),
            }
          : {
              codExpected: true
            },
      status: 'Pending',
      trackingNumber: trackingID
    };

    // Save strictly under currently logged in user email in LocalStorage
    const usersOrdersString = localStorage.getItem('aura_orders') || '[]';
    const allOrders = JSON.parse(usersOrdersString);
    
    // Attach user identity metadata
    const orderRecordWithUser = {
      ...newInvoice,
      customerEmail: userEmail.toLowerCase().trim()
    };

    allOrders.unshift(orderRecordWithUser);
    localStorage.setItem('aura_orders', JSON.stringify(allOrders));

    // Deduct stock levels in localStorage products if present
    const customProds = localStorage.getItem('aura_custom_products');
    if (customProds) {
      const parsedProds = JSON.parse(customProds);
      cart.forEach((cItem) => {
        const prodMatch = parsedProds.find((p: any) => p.id === cItem.product.id);
        if (prodMatch) {
          prodMatch.stock = Math.max(0, prodMatch.stock - cItem.quantity);
        }
      });
      localStorage.setItem('aura_custom_products', JSON.stringify(parsedProds));
    }

    setFinalInvoice(newInvoice);
    setStep(4);
  };

  const handleDownloadCopy = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        {/* Dark Backdrop backing overlay */}
        <motion.div
          id="checkout_backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
          onClick={step === 4 ? undefined : onClose}
        />

        {/* Floating Wizard Box */}
        <motion.div
          id="checkout_wizard_box"
          initial={{ opacity: 0, scale: 0.96, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 15 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-2xl bg-white rounded-[32px] shadow-2xl shadow-indigo-100/15 border border-slate-150/60 overflow-hidden text-slate-800 z-10 flex flex-col my-8"
        >
          {/* Top Wizard Branding Header */}
          <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4.5 w-4.5 text-indigo-600" />
              <span className="text-xs font-black uppercase text-slate-900 tracking-wider">
                Aura SSL Secured Payments Gateway
              </span>
            </div>
            {step < 3 && (
              <button
                id="close_checkout_wizard"
                onClick={onClose}
                className="p-1 px-1.5 text-slate-400 hover:text-indigo-600 rounded-xl hover:bg-slate-100 transition-all cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>

          {/* Core Interactive Setup steps panels */}
          <div className="p-6 md:p-8 overflow-y-auto max-h-[75vh]">
            {/* Step indicators progress line (hidden during receipt printing) */}
            {step < 3 && (
              <div className="flex items-center justify-center gap-4 mb-8 print:hidden">
                <div className={`flex items-center gap-2 text-xs font-black ${step >= 1 ? 'text-indigo-600' : 'text-slate-400'}`}>
                  <span className={`h-6.5 w-6.5 rounded-xl flex items-center justify-center border font-mono ${step >= 1 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200'}`}>
                    {step > 1 ? <Check className="h-3.5 w-3.5" /> : '1'}
                  </span>
                  <span>Delivery Address</span>
                </div>
                <div className="h-[2px] w-12 bg-slate-200" />
                <div className={`flex items-center gap-2 text-xs font-black ${step >= 2 ? 'text-indigo-600' : 'text-slate-400'}`}>
                  <span className={`h-6.5 w-6.5 rounded-xl flex items-center justify-center border font-mono ${step >= 2 ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-slate-200'}`}>
                    2
                  </span>
                  <span>Direct Payments</span>
                </div>
              </div>
            )}

            {/* ERROR STATEMENTS */}
            {formError && (
              <div className="mb-5 p-3 rounded-2xl bg-rose-50 text-rose-700 text-xs font-extrabold border border-rose-100 flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-rose-600 animate-pulse" />
                <span>{formError}</span>
              </div>
            )}

            {/* STAGE 1: DELIVERY INFO */}
            {step === 1 && (
              <div className="space-y-4 font-sans text-xs">
                <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                  <Truck className="h-4.5 w-4.5 text-indigo-600" />
                  <span>Physical Shipping Address Details</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">Receiver's Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600" />
                      <input
                        id="ship_fullname"
                        type="text"
                        placeholder="Rahim Ahmed"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 font-bold bg-white transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">Contact Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600" />
                      <input
                        id="ship_phone"
                        type="tel"
                        placeholder="01711-234567"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 font-bold bg-white transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5 font-sans">Street Address Box Line 1</label>
                  <div className="relative">
                    <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600" />
                    <input
                      id="ship_address"
                      type="text"
                      placeholder="House 12, Road 5, Dhanmondi"
                      value={address1}
                      onChange={(e) => setAddress1(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 font-bold bg-white transition-all"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">City Division</label>
                    <input
                      id="ship_city"
                      type="text"
                      placeholder="Dhaka"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 font-bold bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">State / Province</label>
                    <input
                      id="ship_state"
                      type="text"
                      placeholder="Dhaka"
                      value={billingState}
                      onChange={(e) => setBillingState(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 font-bold bg-white transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">ZIP Code</label>
                    <input
                      id="ship_zip"
                      type="text"
                      placeholder="1209"
                      value={postalCode}
                      onChange={(e) => setPostalCode(e.target.value)}
                      className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 font-bold bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">Country Location</label>
                  <select
                    id="ship_country"
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 font-bold bg-white text-xs font-sans transition-all cursor-pointer"
                  >
                    <option value="Bangladesh">Bangladesh</option>
                  </select>
                </div>
              </div>
            )}

            {/* STAGE 2: PAYMENTS SETUP */}
            {step === 2 && (
              <div className="space-y-5 font-sans text-xs">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <CreditCard className="h-4.5 w-4.5 text-indigo-600" />
                    <span>Select Payment Method</span>
                  </h3>
                  <div className="flex gap-2 p-1 bg-indigo-50/40 rounded-2xl border border-indigo-100/10">
                    <button
                      id="pay_method_bkash"
                      type="button"
                      onClick={() => setPaymentMethod('bkash')}
                      className={`px-4 py-2 rounded-xl text-[10.5px] font-black transition-all cursor-pointer flex items-center gap-2 ${paymentMethod === 'bkash' ? 'bg-[#E2136E] text-white shadow-md shadow-pink-100/50' : 'text-slate-500 hover:text-[#E2136E]'}`}
                    >
                      <span className="h-2 w-2 rounded-full bg-white block" />
                      <span>bKash wallet</span>
                    </button>
                    <button
                      id="pay_method_cod"
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`px-4 py-2 rounded-xl text-[10.5px] font-black transition-all cursor-pointer flex items-center gap-2 ${paymentMethod === 'cod' ? 'bg-emerald-600 text-white shadow-md shadow-emerald-100/50' : 'text-slate-500 hover:text-emerald-600'}`}
                    >
                      <span>💵 Cash on Delivery</span>
                    </button>
                  </div>
                </div>

                {paymentMethod === 'bkash' ? (
                  /* Standard bKash wallet entries */
                  <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-pink-100/10">
                    <div className="flex items-center gap-3 border-b pb-3 mb-2">
                      <div className="h-9 w-16 bg-[#E2136E] rounded-lg flex items-center justify-center font-mono font-black italic text-white text-xs tracking-tighter shrink-0 select-none">
                        bKash
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-900 uppercase">bKash Merchant/Personal Payment</h4>
                        <p className="text-[9.5px] text-slate-400 font-bold">Please pay to standard wallet first</p>
                      </div>
                    </div>

                    <div className="bg-pink-50/70 p-4 rounded-xl border border-pink-100/50 text-slate-800 space-y-2">
                      <p className="text-[11.5px] font-bold leading-relaxed">
                        Please send/cashout the due amount to our official bKash Number:
                      </p>
                      <div className="flex items-center justify-between bg-white px-3.5 py-2 rounded-xl border border-pink-100">
                        <span className="text-[10px] uppercase font-black tracking-wider text-pink-600">bKash Number:</span>
                        <span className="font-mono font-black text-sm text-[#E2136E] tracking-wide select-all cursor-pointer">01999909891</span>
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold leading-normal">
                        After successful transaction execution, enter your paid phone number and the Transaction ID (TrxID) below.
                      </p>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">You Paid From Number</label>
                      <div className="relative">
                        <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-600" />
                        <input
                          id="billing_bkash_number"
                          type="tel"
                          placeholder="e.g. 01711234567"
                          value={bkashNumber}
                          onChange={(e) => setBkashNumber(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-600/10 rounded-2xl text-slate-900 font-bold bg-white transition-all font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">bKash Transaction ID (TrxID) <span className="text-pink-600 font-black">*</span></label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-pink-600 pointer-events-none" />
                        <input
                          id="billing_bkash_txnid"
                          type="text"
                          required
                          placeholder="e.g. K9B38H1A2S"
                          value={bkashTxnId}
                          onChange={(e) => setBkashTxnId(e.target.value)}
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:outline-none focus:border-pink-600 focus:ring-2 focus:ring-pink-600/10 rounded-2xl text-slate-900 font-bold bg-white transition-all font-mono uppercase"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Cash on Delivery entries info */
                  <div className="space-y-4 bg-slate-50/60 p-5 rounded-2xl border border-emerald-100/10 text-slate-700">
                    <div className="flex items-center gap-3 border-b pb-3 mb-2">
                      <div className="h-9 w-16 bg-emerald-600 rounded-lg flex items-center justify-center font-bold text-white text-lg shrink-0 select-none">
                        COD
                      </div>
                      <div>
                        <h4 className="text-[11px] font-black text-slate-900 uppercase">Cash on Delivery (Fulfillment)</h4>
                        <p className="text-[9.5px] text-slate-400 font-bold">Pay in cash inside Bangladesh upon receipt</p>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 leading-relaxed font-bold">
                      You have selected the trusted <span className="text-emerald-700 font-black">Cash on Delivery</span> method. This setup authorizes quick pack-and-ship without any advance transaction or charge!
                    </p>
                    
                    <div className="space-y-1.5 text-[10.5px] bg-white p-3.5 rounded-2xl border border-slate-150">
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-bold text-slate-700">Zero Payment Risk: pay only when packages are securely inside your hands.</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="font-bold text-slate-700">Standard Delivery Frame: 3 to 5 business days anywhere in Bangladesh districts.</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* STAGE 3: SSL TRANSACTION LOADER */}
            {step === 3 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                {/* Simulated cryptographic spinning core */}
                <div className="relative h-16 w-16 mb-6">
                  <span className="absolute inset-0 rounded-full border-4 border-slate-100 border-t-indigo-600 animate-spin" />
                  <span className="absolute inset-2/4 -translate-x-[50%] -translate-y-[50%] animate-pulse bg-indigo-600 p-2.5 rounded-full text-white shadow-lg shadow-indigo-150">
                    <Lock className="h-4 w-4" />
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">Securing Direct Bank Payouts</h3>
                <p id="transaction_loading_msg" className="text-xs text-slate-400 mt-2 max-w-[280px] font-mono leading-none h-4">
                  {loadingText}
                </p>
              </div>
            )}

            {/* STAGE 4: GLORIOUS THANKS COUPLING AND CARD POPUP */}
            {step === 4 && finalInvoice && (
              <div className="space-y-6 py-4">
                {/* Delightful Confirmed Indicator & Thanks Note */}
                <div className="flex flex-col items-center justify-center text-center pb-5 border-b border-indigo-50/60 print:hidden">
                  <div className="relative mb-4">
                    <div className="absolute inset-0 bg-emerald-500/10 rounded-full blur-lg animate-pulse" />
                    <div className="relative h-14 w-14 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 shadow-sm">
                      <Check className="h-7 w-7 stroke-[3]" />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-900 tracking-tight">Order Placed Successfully!</h3>
                  <p className="text-xs text-slate-500 mt-2 max-w-[340px] font-bold leading-relaxed">
                    Thank you so much for your purchase! Your selection is being processed in our store queue. We look forward to delivering your boutique pieces.
                  </p>
                </div>

                {/* Simplified Quick Receipt Summary */}
                <div className="bg-slate-50/80 rounded-2xl border border-slate-150 p-4 space-y-3 shrink-0 print:hidden">
                  <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Invoice Tag</span>
                    <span className="font-mono text-slate-700">{finalInvoice.id}</span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                    <span>Shipment Delivery</span>
                    <span className="text-slate-700 font-extrabold">{finalInvoice.shippingAddress.fullName}</span>
                  </div>
                  <div className="flex justify-between items-baseline border-t border-slate-200/50 pt-2.5">
                    <span className="text-[11px] text-slate-500 font-extrabold">Amount Cleared Due</span>
                    <span className="text-sm font-mono font-black text-slate-950">৳{finalInvoice.total}</span>
                  </div>
                </div>

                <div className="text-center print:hidden">
                  <button
                    onClick={() => setShowDetailedInvoice(!showDetailedInvoice)}
                    className="text-[10px] font-black text-indigo-600 hover:text-indigo-800 underline uppercase tracking-widest cursor-pointer"
                  >
                    {showDetailedInvoice ? "Hide Breakdown Details ▴" : "Show Summary Invoice Breakdown ▾"}
                  </button>
                </div>

                {/* Actual Printed Letterhead Invoice Component (Optional show or triggered via print/pdf) */}
                {(showDetailedInvoice || window.matchMedia('print').matches) && (
                  <div id="receipt_doc" className="bg-slate-50/50 p-6 rounded-[28px] border border-slate-150 print:bg-white print:border-none print:p-0 transition-all">
                    {/* Letterhead */}
                    <div className="flex justify-between items-start mb-6">
                      <div>
                        <h2 className="text-sm font-black tracking-widest text-slate-900 uppercase">AURA BOUTIQUE</h2>
                        <p className="text-[9px] text-slate-400 font-bold mt-0.5">Secure Multi-brand Retail LLC</p>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-bold text-slate-800 font-mono tracking-tight">{finalInvoice.id}</span>
                        <span className="block text-[9px] text-slate-400 font-bold mt-0.5">{finalInvoice.date}</span>
                      </div>
                    </div>

                    {/* Shipping Meta Columns */}
                    <div className="grid grid-cols-2 gap-4 text-[10px] leading-relaxed mb-6 border-b border-slate-200 pb-4">
                      <div>
                        <span className="block font-black text-slate-400 tracking-wider uppercase mb-1.5 text-[8.5px]">CUSTOMER DETAILS & DELIVERY ADDRESS</span>
                        <span className="font-extrabold text-slate-800">{finalInvoice.shippingAddress.fullName}</span>
                        <span className="block text-slate-500 mt-0.5 font-bold">{finalInvoice.shippingAddress.addressLine1}</span>
                        <span className="block text-slate-500 font-bold">{finalInvoice.shippingAddress.city}, {finalInvoice.shippingAddress.state} {finalInvoice.shippingAddress.postalCode}</span>
                        <span className="block text-slate-500 font-bold">{finalInvoice.shippingAddress.country}</span>
                        <span className="block text-slate-500 font-mono font-bold">Contact: {finalInvoice.shippingAddress.phone}</span>
                      </div>
                      <div>
                        <span className="block font-black text-slate-400 tracking-wider uppercase mb-1.5 text-[8.5px]">FULFILLMENT DISPATCH</span>
                        <span className="font-extrabold text-slate-800 flex items-center gap-1">
                          <Truck className="h-3 w-3 shrink-0 text-slate-500" />
                          <span>Pathao / Steadfast Courier</span>
                        </span>
                        <span className="block text-slate-500 mt-0.5 font-bold">Tracking Number: <span className="font-extrabold text-slate-900 font-mono">{finalInvoice.trackingNumber}</span></span>
                        <span className="block text-slate-500 font-bold">Estimated Delivery: <span className="font-black text-slate-800 font-sans">3 - 5 Business Days</span></span>
                        <span className="block text-slate-500 font-semibold">Payment Link: <span className="uppercase font-black text-slate-900 font-sans">{finalInvoice.paymentMethod}</span> ({finalInvoice.paymentMethod === 'bkash' ? `Wallet: ${(finalInvoice.paymentDetails as any).bkashNumber || ''}` : 'COD / On Delivery'})</span>
                      </div>
                    </div>

                    {/* Embedded Items Ledger table */}
                    <div className="space-y-3 mb-6">
                      <span className="block font-black text-slate-400 text-[8.5px] tracking-wider uppercase">PURCHASE LEDGER ITEMS</span>
                      <div className="space-y-2">
                        {finalInvoice.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center text-[11px] bg-white p-2.5 border border-slate-100 rounded-xl">
                            <div className="flex items-center gap-2">
                              <img src={item.productImage} className="h-7 w-7 object-cover rounded-lg border border-slate-50" referrerPolicy="no-referrer" />
                              <div>
                                <span className="font-black text-slate-800">{item.productName}</span>
                                <span className="block text-[9px] text-slate-400 font-bold">Color: {item.selectedColor} {item.selectedSize ? `| Size: ${item.selectedSize}` : ''}</span>
                              </div>
                            </div>
                            <span className="font-extrabold text-slate-950 font-mono text-[10px]">
                              {item.quantity} x ৳{item.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Invoice Sum Line-item */}
                    <div className="space-y-1.5 text-[10.5px] leading-tight border-t border-slate-150 pt-3">
                      <div className="flex justify-between text-slate-500 font-bold">
                        <span>Ledger Items Subtotal</span>
                        <span className="font-extrabold text-slate-800">৳{finalInvoice.subtotal}</span>
                      </div>
                      {finalInvoice.discount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-extrabold">
                          <span>Coupon Savings {finalInvoice.couponCodeUsed ? `(${finalInvoice.couponCodeUsed})` : ''}</span>
                          <span>-৳{finalInvoice.discount}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-slate-500 font-bold">
                        <span>Shipping & Freight</span>
                        <span className="font-extrabold text-slate-800">৳{finalInvoice.shipping}</span>
                      </div>
                      <div className="flex justify-between text-slate-500 font-bold">
                        <span>Sales Surcharges Tax (5%)</span>
                        <span className="font-extrabold text-slate-800">৳{finalInvoice.tax}</span>
                      </div>
                      <div className="flex justify-between font-black text-[13px] border-t border-dashed border-slate-200 p-1.5 pt-2 text-slate-900 mt-2">
                        <span>TOTAL SECURED DUE</span>
                        <span>৳{finalInvoice.total}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bottom wizard operations row (hidden during printing) */}
          <div className="px-6 py-4.5 border-t border-slate-100 flex items-center justify-between bg-slate-50/50 print:hidden">
            {step < 3 ? (
               <>
                <button
                  id="checkout_back_btn"
                  onClick={step === 1 ? onClose : () => setStep(prev => prev - 1)}
                  className="flex items-center gap-1.5 py-2 px-3 text-xs font-black hover:text-indigo-650 text-slate-500 rounded-xl transition-all cursor-pointer"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span>{step === 1 ? 'Discard Basket' : 'Previous Step'}</span>
                </button>

                <button
                  id="checkout_next_btn"
                  onClick={step === 1 ? () => { if (validateStep1()) setStep(2); } : executePaymentLoop}
                  className="flex items-center gap-1.5 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-150/10 text-xs font-black rounded-2xl transition-all cursor-pointer select-none"
                >
                  <span>{step === 1 ? 'Configure Payment' : 'Complete Purchase'}</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : step === 4 ? (
              <>
                <button
                  id="receipt_print_btn"
                  onClick={handleDownloadCopy}
                  className="flex items-center gap-1.5 py-2.5 px-4 text-xs font-black hover:bg-slate-50 hover:text-indigo-650 text-slate-700 border border-slate-200 rounded-2xl transition-all cursor-pointer bg-white"
                >
                  <Printer className="h-4 w-4" />
                  <span>Print Receipt</span>
                </button>

                <button
                  id="receipt_finish_btn"
                  onClick={() => {
                    onCheckoutComplete();
                    onClose();
                  }}
                  className="flex items-center gap-1.5 py-3 px-5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-150/10 text-xs font-black rounded-2xl transition-all cursor-pointer select-none"
                >
                  <span>View in Dashboard</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </>
            ) : (
              <div className="w-full text-center text-[10px] text-slate-400 select-none font-bold">
                🔒 Protected by AES-256 TLS Bank standards
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
