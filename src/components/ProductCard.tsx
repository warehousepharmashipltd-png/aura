/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { motion } from 'motion/react';
import { Star, Eye, ShoppingCart, Info } from 'lucide-react';
import { Product } from '../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCartDirect: (product: Product) => void;
}

export default function ProductCard({ product, onSelect, onAddToCartDirect }: ProductCardProps) {
  const isOutOfStock = product.stock === 0;
  const isLowStock = product.stock > 0 && product.stock <= 8;
  const discountRate = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <motion.div
      id={`product_${product.id}`}
      whileHover={{ y: -6, transition: { duration: 0.2, ease: 'easeOut' } }}
      className="group relative flex flex-col rounded-3xl bg-white border border-slate-100 p-4 shadow-sm hover:shadow-md hover:border-indigo-100 transition-all h-full"
    >
      {/* Product Image Panel with Overlays */}
      <div className="relative aspect-[4/3] bg-slate-50 rounded-2xl overflow-hidden cursor-pointer mb-3" onClick={() => onSelect(product)}>
        <img
          src={product.images[0]}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          referrerPolicy="no-referrer"
        />

        {/* Floating Tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 pointer-events-none">
          {product.tags.map((tag, i) => (
            <span
              key={i}
              className="px-2 py-0.5 rounded bg-slate-900/80 backdrop-blur-xs text-[10px] font-bold text-white tracking-wider uppercase"
            >
              {tag}
            </span>
          ))}
          {discountRate > 0 && (
            <span className="px-2 py-0.5 rounded bg-rose-500 font-bold text-[10px] text-white tracking-wider uppercase">
              SAVE {discountRate}%
            </span>
          )}
        </div>

        {/* Hover Quick View Overlays */}
        <div className="absolute inset-0 bg-slate-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
          <motion.button
            id={`quick_view_${product.id}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(product);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-900 font-bold text-xs shadow-lg cursor-pointer transition-colors border border-slate-100"
          >
            <Eye className="h-4 w-4 text-indigo-600" />
            <span>Interactive Specs</span>
          </motion.button>
        </div>
      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-grow">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">
          {product.category}
        </div>

        <h3
          onClick={() => onSelect(product)}
          className="font-bold text-sm text-slate-800 hover:text-indigo-600 cursor-pointer limit-text-2 transition-colors mb-1 tracking-tight"
        >
          {product.name}
        </h3>

        {/* Ratings Review Star */}
        <div className="flex items-center gap-1 mb-3">
          <div className="flex items-center text-amber-505 text-amber-500">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(product.rating) ? 'fill-amber-500 text-amber-500' : 'text-slate-250 text-slate-200'
                }`}
              />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-bold">({product.reviewsCount})</span>
        </div>

        {/* Inventory Progress Bar */}
        <div className="mt-auto mb-4">
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span>Inventory Stock</span>
            <span className={isLowStock ? 'text-amber-600 font-bold' : isOutOfStock ? 'text-rose-500' : 'text-slate-400 font-bold'}>
              {isOutOfStock ? 'Out of Stock' : `${product.stock} left`}
            </span>
          </div>
          <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                isOutOfStock ? 'w-0' : isLowStock ? 'bg-amber-400' : 'bg-indigo-600'
              }`}
              style={{ width: `${(product.stock / product.maxStock) * 100}%` }}
            />
          </div>
        </div>

        {/* Price & Action button */}
        <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3 mt-1">
          <div className="flex flex-col">
            {product.originalPrice && (
              <span className="text-[11px] text-slate-405 text-slate-400 line-through leading-none">
                ${product.originalPrice}
              </span>
            )}
            <span className="text-base font-black text-indigo-600 tracking-tight leading-none">
              ${product.price}
            </span>
          </div>

          <button
            id={`add_to_cart_btn_${product.id}`}
            disabled={isOutOfStock}
            onClick={(e) => {
              e.stopPropagation();
              onAddToCartDirect(product);
            }}
            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer active:scale-95 ${
              isOutOfStock
                ? 'bg-slate-50 border border-slate-100 text-slate-300 cursor-not-allowed'
                : 'bg-slate-900 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-100'
            }`}
            title={isOutOfStock ? 'Sold' : 'Grab'}
          >
            <ShoppingCart className="h-4 w-4" />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
