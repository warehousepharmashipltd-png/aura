/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Star, Plus, Minus, ShieldCheck, Truck, RefreshCw, ShoppingBag } from 'lucide-react';
import { Product } from '../types';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, color: { name: string; hex: string }, size?: string) => void;
}

export default function ProductDetailModal({ product, onClose, onAddToCart }: ProductDetailModalProps) {
  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const [selectedColor, setSelectedColor] = useState<{ name: string; hex: string } | null>(null);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(undefined);
  const [quantity, setQuantity] = useState(1);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (product) {
      setActiveImageIdx(0);
      setSelectedColor(product.colors[0]);
      setSelectedSize(product.sizes ? product.sizes[0] : undefined);
      setQuantity(1);
      setSuccessMsg('');
    }
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.stock === 0;

  const handleIncrement = () => {
    if (quantity < product.stock) {
      setQuantity((prev) => prev + 1);
    }
  };

  const handleDecrement = () => {
    if (quantity > 1) {
      setQuantity((prev) => prev - 1);
    }
  };

  const handleAddAction = () => {
    if (!selectedColor) return;
    onAddToCart(product, quantity, selectedColor, selectedSize);
    setSuccessMsg(`Added ${quantity}x ${product.name} to card!`);
    setTimeout(() => {
      setSuccessMsg('');
    }, 2500);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          id="detail_backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-slate-900/45 backdrop-blur-xs"
          onClick={onClose}
        />

        {/* Modal Window Container */}
        <motion.div
          id="detail_modal_container"
          initial={{ opacity: 0, scale: 0.95, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 30 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-4xl bg-white rounded-[32px] md:rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden text-slate-800 z-10 flex flex-col md:flex-row max-h-[90vh]"
        >
          {/* Close Action Button */}
          <button
            id="close_detail_modal"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-slate-400 hover:text-slate-950 bg-white/80 hover:bg-slate-50 rounded-full transition-colors border border-slate-100 cursor-pointer"
          >
            <X className="h-5.5 w-5.5" />
          </button>

          {/* Left Block: Image Viewer System */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-100 overflow-y-auto">
            <div className="flex-grow flex items-center justify-center min-h-[220px] max-h-[380px] bg-slate-50 rounded-2xl overflow-hidden relative border border-slate-100/50">
              <img
                src={product.images[activeImageIdx]}
                alt={`${product.name} alternate view`}
                className="max-h-[360px] max-w-full object-contain transition-all duration-300"
                referrerPolicy="no-referrer"
              />
              <span className="absolute bottom-3 right-3 px-2.5 py-1 text-[9px] font-bold tracking-widest bg-slate-900/90 text-white rounded-lg">
                IMAGE {activeImageIdx + 1} OF {product.images.length}
              </span>
            </div>

            {/* Thumbnail Navigation Carousel */}
            {product.images.length > 1 && (
              <div className="flex gap-2.5 mt-4 overflow-x-auto pb-1 scrollbar-hide">
                {product.images.map((img, idx) => (
                  <button
                    id={`thumb_${idx}`}
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`h-16 w-16 min-w-16 rounded-xl border-2 overflow-hidden transition-all bg-slate-50 flex-shrink-0 cursor-pointer ${
                      activeImageIdx === idx ? 'border-indigo-600 scale-95 shadow-xs' : 'border-slate-100 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt="Product thumbnail"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Confidence Metrics grid */}
            <div className="grid grid-cols-3 gap-2.5 mt-6 border-t border-slate-150/40 pt-5">
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50/70 border border-slate-100/55">
                <Truck className="h-4.5 w-4.5 text-indigo-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800 tracking-tight">Express Mail</span>
                <span className="text-[8px] text-slate-400 mt-0.5">Ships within 24 hours</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50/70 border border-slate-100/55">
                <ShieldCheck className="h-4.5 w-4.5 text-indigo-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800 tracking-tight">Secured checkout</span>
                <span className="text-[8px] text-slate-400 mt-0.5">TLS Cryptography</span>
              </div>
              <div className="flex flex-col items-center text-center p-3 rounded-2xl bg-slate-50/70 border border-slate-100/55">
                <RefreshCw className="h-4.5 w-4.5 text-indigo-600 mb-1" />
                <span className="text-[10px] font-bold text-slate-800 tracking-tight">Returns policy</span>
                <span className="text-[8px] text-slate-400 mt-0.5">30-day trial period</span>
              </div>
            </div>
          </div>

          {/* Right Block: Content Details Control center */}
          <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col justify-between overflow-y-auto">
            <div>
              {/* Category */}
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {product.category}
              </div>

              {/* Title Header */}
              <h2 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight leading-8">
                {product.name}
              </h2>

              {/* Rating Review Summary */}
              <div className="flex items-center gap-2 mt-2 mb-4">
                <div className="flex items-center text-amber-500">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-4 w-4 ${
                        i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-slate-200'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-xs text-slate-605 text-slate-600 font-bold">
                  {product.rating} Rating
                </span>
                <span className="text-slate-200">|</span>
                <span className="text-xs text-slate-400 font-medium">
                  {product.reviewsCount} customer audits
                </span>
              </div>

              {/* Retail Price Panel */}
              <div className="flex items-baseline gap-2 mb-5">
                <span className="text-2xl font-black text-slate-900">
                  ৳{product.price}
                </span>
                {product.originalPrice && (
                  <>
                    <span className="text-sm text-slate-400 line-through font-medium">
                      ৳{product.originalPrice}
                    </span>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-rose-50 text-rose-600 border border-rose-100/60 shadow-xs">
                      SAVE ৳{product.originalPrice - product.price}
                    </span>
                  </>
                )}
              </div>

              {/* Long form Description */}
              <p className="text-xs text-slate-500 leading-relaxed border-t border-b border-slate-150/40 py-4 mb-5">
                {product.description}
              </p>

              {/* Selection Section: Colors */}
              <div className="mb-4">
                <div className="flex justify-between text-xs font-bold text-slate-700 mb-1.5">
                  <span>SELECT COLORWAY</span>
                  <span className="font-extrabold text-indigo-600">
                    {selectedColor?.name || 'Please select'}
                  </span>
                </div>
                <div className="flex gap-2">
                  {product.colors.map((color, i) => (
                    <button
                      id={`color_swatch_${i}`}
                      key={i}
                      onClick={() => setSelectedColor(color)}
                      className={`h-7 w-7 rounded-full flex items-center justify-center border transition-all cursor-pointer ${
                        selectedColor?.name === color.name ? 'ring-2 ring-indigo-650 ring-indigo-600 ring-offset-2 border-indigo-600 scale-105' : 'border-slate-200 hover:border-slate-400'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    >
                      {selectedColor?.name === color.name && (
                        <div
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: color.hex === '#F8FAFC' || color.hex === '#E2E8F0' ? '#1E1E1E' : '#FFFFFF' }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selection Section: Sizes */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-5">
                  <div className="text-xs font-bold text-slate-700 mb-1.5">
                    SELECT PROPORTIONS / SIZES
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => (
                      <button
                        id={`size_chip_${size.replace(/\s+/g, '')}`}
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-3 py-1.5 rounded-xl border text-xs tracking-tight font-bold transition-all cursor-pointer ${
                          selectedSize === size
                            ? 'border-indigo-600 bg-indigo-600 text-white shadow-sm shadow-indigo-100'
                            : 'border-slate-200 text-slate-600 hover:border-indigo-600 hover:bg-slate-50'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Bullet Features listing */}
              <div className="mb-5">
                <div className="text-xs font-bold text-slate-500 mb-2 uppercase tracking-wide text-[10px]">
                  PRODUCT SPECIFICATIONS
                </div>
                <ul className="space-y-1.5">
                  {product.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start text-[11px] text-slate-500 gap-1.5">
                      <span className="h-1 w-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Bottom Panel: Quantity and dynamic CART addition */}
            <div className="mt-4 border-t border-slate-100 pt-5">
              {/* Added Notification */}
              <AnimatePresence>
                {successMsg && (
                  <motion.div
                    id="add_success_bar"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="mb-4 p-3 text-xs text-center bg-indigo-50 text-indigo-850 text-indigo-800 rounded-xl border border-indigo-100 font-bold flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <span>{successMsg}</span>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex gap-4">
                {/* Quantity adjustments */}
                <div className="flex items-center justify-between border border-slate-200 rounded-xl px-2 py-1.5 bg-slate-50/50 min-w-[110px]">
                  <button
                    id="qty_minus_btn"
                    onClick={handleDecrement}
                    disabled={quantity <= 1 || isOutOfStock}
                    className="p-1 text-slate-550 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="text-sm font-bold text-slate-900 w-8 text-center">
                    {quantity}
                  </span>
                  <button
                    id="qty_plus_btn"
                    onClick={handleIncrement}
                    disabled={quantity >= product.stock || isOutOfStock}
                    className="p-1 text-slate-550 text-slate-500 hover:text-slate-900 disabled:opacity-30 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>

                {/* Add Action or Sold Out indicator */}
                <button
                  id="add_to_cart_detailed_btn"
                  disabled={isOutOfStock}
                  onClick={handleAddAction}
                  className={`flex-grow flex items-center justify-center gap-2 py-4 px-6 rounded-2xl text-xs tracking-wider font-extrabold shadow-md transition-all cursor-pointer select-none active:scale-[0.98] ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                      : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-150 shadow-indigo-100 hover:shadow-lg'
                  }`}
                >
                  <ShoppingBag className="h-4.5 w-4.5" />
                  <span>{isOutOfStock ? 'TEMPORARILY OUT OF STOCK' : `ADD TO CART`}</span>
                </button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
