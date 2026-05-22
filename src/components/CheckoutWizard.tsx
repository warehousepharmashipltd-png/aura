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
  const [loadingText, setLoadingText] = useState('');
  
  // Shipping details state
  const [fullName, setFullName] = useState(userFullName || '');
  const [address1, setAddress1] = useState('');
  const [city, setCity] = useState('');
  const [billingState, setBillingState] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [country, setCountry] = useState('United States');
  const [phone, setPhone] = useState('');

  // Payment details state
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'paypal'>('card');
  const [cardHolder, setCardHolder] = useState(userFullName || '');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [paypalEmail, setPaypalEmail] = useState(userEmail || '');

  // Validation messages
  const [formError, setFormError] = useState('');

  // Built receipt outcome
  const [finalInvoice, setFinalInvoice] = useState<Order | null>(null);

  useEffect(() => {
    if (isOpen) {
      setStep(1);
      setFormError('');
      setFinalInvoice(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Real-time Card Branding Detectors
  const getCardBrand = (number: string) => {
    const cleanNum = number.replace(/\s+/g, '');
    if (cleanNum.startsWith('4')) return 'Visa';
    if (/^5[1-5]/.test(cleanNum)) return 'Mastercard';
    if (/^3[47]/.test(cleanNum)) return 'American Express';
    if (cleanNum.startsWith('6')) return 'Discover';
    return 'Card';
  };

  // Card formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = '';
    for (let i = 0; i < value.length && i < 16; i++) {
      if (i > 0 && i % 4 === 0) {
        formatted += ' ';
      }
      formatted += value[i];
    }
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    let formatted = '';
    if (value.length > 0) {
      formatted += value.substring(0, 2);
      if (value.length > 2) {
        formatted += '/' + value.substring(2, 4);
      }
    }
    setCardExpiry(formatted);
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').substring(0, 4);
    setCardCvv(value);
  };

  // State Step validations
  const validateStep1 = () => {
    setFormError('');
    if (!fullName || !address1 || !city || !billingState || !postalCode || !phone) {
      setFormError('Please complete all physical delivery parameters.');
      return false;
    }
    if (phone.length < 8) {
      setFormError('Please input a valid customer contact number.');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    setFormError('');
    if (paymentMethod === 'card') {
      if (!cardHolder || !cardNumber || !cardExpiry || !cardCvv) {
        setFormError('Please fill in some test checkout credentials.');
        return false;
      }
      if (cardNumber.replace(/\s+/g, '').length < 15) {
        setFormError('Card length is insufficient or invalid range.');
        return false;
      }
      if (cardCvv.length < 3) {
        setFormError('Security code (CVV) parameter is incomplete.');
        return false;
      }
    } else {
      if (!paypalEmail) {
        setFormError('PayPal account identifier is required.');
        return false;
      }
    }
    return true;
  };

  const executePaymentLoop = () => {
    if (!validateStep2()) return;

    setStep(3);
    setFormError('');

    const phases = [
      'Configuring server tls socket layers...',
      'Verifying credential card tokenization...',
      'Validating sandbox account deposits...',
      'Reducing catalog stocks & locking reservation IDs...',
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
    const trackingID = 'AU-' + Math.floor(1000000 + Math.random() * 9000000) + '-US';
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
        paymentMethod === 'card'
          ? {
              cardBrand: getCardBrand(cardNumber),
              last4: cardNumber.replace(/\s+/g, '').slice(-4)
            }
          : {
              paypalEmail
            },
      status: 'processing',
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
                        placeholder="Elizabeth Bennett"
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
                        placeholder="+1 (555) 019-2834"
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
                      placeholder="452 West End Ave, apt 3B"
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
                      placeholder="New York"
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
                      placeholder="NY"
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
                      placeholder="10024"
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
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                    <option value="Germany">Germany</option>
                  </select>
                </div>
              </div>
            )}

            {/* STAGE 2: PAYMENTS SETUP */}
            {step === 2 && (
              <div className="space-y-5 font-sans text-xs">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-black text-slate-950 flex items-center gap-2">
                    <CreditCard className="h-4.5 w-4.5 text-indigo-600" />
                    <span>Select Payment Provider Method</span>
                  </h3>
                  <div className="flex gap-2 p-1 bg-indigo-50/40 rounded-2xl border border-indigo-100/10">
                    <button
                      id="pay_method_card"
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${paymentMethod === 'card' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/50' : 'text-slate-500 hover:text-indigo-600'}`}
                    >
                      Credit Card
                    </button>
                    <button
                      id="pay_method_paypal"
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer ${paymentMethod === 'paypal' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200/50' : 'text-slate-500 hover:text-indigo-600'}`}
                    >
                      PayPal
                    </button>
                  </div>
                </div>

                {paymentMethod === 'card' ? (
                  /* Standard credit card entries */
                  <div className="space-y-4">
                    <div>
                      <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">Cardholder Name</label>
                      <input
                        id="billing_cardholder"
                        type="text"
                        placeholder="ELIZABETH BENNETT"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
                        className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 font-bold uppercase bg-white transition-all"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider">Card Number Parameters</label>
                        <span className="text-[10px] font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-xl font-mono uppercase">
                          Detected: {getCardBrand(cardNumber)}
                        </span>
                      </div>
                      <div className="relative">
                        <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-indigo-600" />
                        <input
                          id="billing_card_num"
                          type="text"
                          required
                          placeholder="4111 2222 3333 4444"
                          value={cardNumber}
                          onChange={handleCardNumberChange}
                          className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 tracking-wider font-mono bg-white font-bold transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">Expiry Date</label>
                        <input
                          id="billing_card_expiry"
                          type="text"
                          placeholder="MM/YY"
                          value={cardExpiry}
                          onChange={handleExpiryChange}
                          className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 text-center font-mono font-bold bg-white transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">CVV Code</label>
                        <div className="relative">
                          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-indigo-600 pointer-events-none" />
                          <input
                            id="billing_card_cvv"
                            type="password"
                            placeholder="•••"
                            maxLength={4}
                            value={cardCvv}
                            onChange={handleCvvChange}
                            className="w-full pl-10 pr-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 text-center font-mono tracking-widest font-bold bg-white transition-all"
                          />
                        </div>
                      </div>
                    </div>

                    <p className="text-[10px] text-slate-500 mt-2 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 font-bold leading-relaxed">
                      🔒 <span className="font-black text-slate-700">Sandbox Safety Note</span>: This is a completely sandboxed checkout. Any card credentials formatted like a real Mastercard/Visa (e.g. 4111...) will clear successfully! Personal card details should **never** be inputted here.
                    </p>
                  </div>
                ) : (
                  /* PayPal entries integration */
                  <div className="space-y-3">
                    <p className="text-xs text-slate-500 leading-relaxed font-bold">
                      You are completing the transaction through PayPal Express. Confirm your account PayPal identification credentials below:
                    </p>
                    <div>
                      <label className="block text-[9px] uppercase font-black text-slate-500 tracking-wider mb-1.5">PayPal Account Email</label>
                      <input
                        id="billing_paypal_email"
                        type="email"
                        placeholder="paypal-user@wallet.com"
                        value={paypalEmail}
                        onChange={(e) => setPaypalEmail(e.target.value)}
                        className="w-full px-4 py-3 border border-slate-200 focus:outline-none focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/10 rounded-2xl text-slate-900 font-bold bg-white transition-all"
                      />
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

            {/* STAGE 4: PRINTABLE ORDER CONFIRMATION INVOICE */}
            {step === 4 && finalInvoice && (
              <div className="space-y-6">
                {/* Delightful Confirmed Indicator */}
                <div className="flex flex-col items-center justify-center text-center pb-5 border-b border-slate-100 print:hidden">
                  <div className="h-12 w-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600 mb-3 shadow-xs">
                    <Check className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-black text-slate-900">Payment Cleared Successfully!</h3>
                  <p className="text-xs text-slate-400 mt-1 max-w-[290px] font-bold">
                    Your dynamic checkout clearance has passed, tracking records have been linked to your user history.
                  </p>
                </div>

                {/* Actual Printed Letterhead Invoice Component */}
                <div id="receipt_doc" className="bg-slate-50 p-6 rounded-[28px] border border-slate-150/65 print:bg-white print:border-none print:p-0">
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
                      <span className="block font-black text-slate-400 tracking-wider uppercase mb-1.5 text-[8.5px]">RECEIVER BILLING MATCH</span>
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
                        <span>UPS Ground Transit Link</span>
                      </span>
                      <span className="block text-slate-500 mt-0.5 font-bold">Tracking Number: <span className="font-extrabold text-slate-900 font-mono">{finalInvoice.trackingNumber}</span></span>
                      <span className="block text-slate-500 font-bold">Estimated Delivery: <span className="font-black text-slate-800 font-sans">3 - 5 Business Days</span></span>
                      <span className="block text-slate-500 font-semibold">Payment Link: <span className="capitalize font-black text-slate-900 font-sans">{finalInvoice.paymentMethod}</span> ({finalInvoice.paymentDetails.cardBrand || 'PayPal'})</span>
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
                            {item.quantity} x ${item.price}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Invoice Sum Line-item */}
                  <div className="space-y-1.5 text-[10.5px] leading-tight border-t border-slate-150 pt-3">
                    <div className="flex justify-between text-slate-500 font-bold text-slate-550">
                      <span>Ledger Items Subtotal</span>
                      <span className="font-extrabold text-slate-800">${finalInvoice.subtotal}</span>
                    </div>
                    {finalInvoice.discount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-extrabold">
                        <span>Coupon Savings {finalInvoice.couponCodeUsed ? `(${finalInvoice.couponCodeUsed})` : ''}</span>
                        <span>-${finalInvoice.discount}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-slate-500 font-bold text-slate-550">
                      <span>Shipping & Freight</span>
                      <span className="font-extrabold text-slate-800">${finalInvoice.shipping}</span>
                    </div>
                    <div className="flex justify-between text-slate-500 font-bold text-slate-550">
                      <span>Sales Surcharges Tax (5%)</span>
                      <span className="font-extrabold text-slate-800">${finalInvoice.tax}</span>
                    </div>
                    <div className="flex justify-between font-black text-[13px] border-t border-dashed border-slate-200 p-1.5 pt-2 text-slate-900 mt-2">
                      <span>TOTAL SECURED DUE</span>
                      <span>${finalInvoice.total}</span>
                    </div>
                  </div>
                </div>
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
