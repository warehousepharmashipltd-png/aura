/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product, Coupon } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod_1',
    name: 'Aura SoundWave Pro',
    price: 299,
    originalPrice: 349,
    category: 'Electronics',
    description: 'Immerse yourself in pure studio sound with the SoundWave Pro. Engineered with hybrid active noise cancellation, custom acoustic drivers, and luxurious memory foam earcups for unmatched all-day listening.',
    images: [
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1484704849700-f032a568e944?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 12,
    maxStock: 30,
    rating: 4.8,
    reviewsCount: 148,
    colors: [
      { name: 'Matte Charcoal', hex: '#1E1E1E' },
      { name: 'Alabaster Gray', hex: '#E2E8F0' },
      { name: 'Sienna Bronze', hex: '#8C6239' }
    ],
    sizes: ['Standard One-Size'],
    features: [
      'Active Hybrid Noise Cancellation up to 40dB',
      'Custom liquid-crystal polymer 40mm drivers',
      'Up to 45 hours of high-fidelity wireless playtime',
      'Triple microphone array for crystal-clear voice calls',
      'Smart Ambient pass-through mode'
    ],
    tags: ['Premium', 'Best Seller', 'Audio']
  },
  {
    id: 'prod_2',
    name: 'Aura Horizon Chrono',
    price: 450,
    originalPrice: 499,
    category: 'Accessories',
    description: 'A structural blend of luxury watchmaking and minimalist design. Featuring a polished stainless steel casing, precision sapphire crystal dial, and a supple, sustainably sourced vegetable-tanned Italian leather band.',
    images: [
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1524805444758-089113d48a6d?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 6,
    maxStock: 15,
    rating: 4.9,
    reviewsCount: 84,
    colors: [
      { name: 'Sable Silver', hex: '#64748B' },
      { name: 'Obsidian Gold', hex: '#D97706' }
    ],
    sizes: ['40mm Frame', '42mm Frame'],
    features: [
      'Japanese Quartz chronograph movement',
      'Scratch-resistant Dome Sapphire Glass',
      '5 ATM Water Resistance classification',
      'Interchangeable premium quick-release strap',
      'Signature luminescent hands and sub-dials'
    ],
    tags: ['Luxury', 'Limited Edition', 'Watch']
  },
  {
    id: 'prod_3',
    name: 'Aura Leather Weekender',
    price: 189,
    category: 'Lifestyle',
    description: 'Your elegant travel companion designed to fit standard overhead compartments. Handcrafted from premium water-resistant full-grain leather, fitted with YKK solid brass zippers and an expandable tech chamber.',
    images: [
      'https://images.unsplash.com/photo-1479064555552-3ef4979f8908?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1547949003-9792a18a2601?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 18,
    maxStock: 40,
    rating: 4.7,
    reviewsCount: 92,
    colors: [
      { name: 'Caramel Leather', hex: '#B45309' },
      { name: 'Slate Onyx', hex: '#0F172A' }
    ],
    sizes: ['Small (35L)', 'Medium (45L)', 'Large (55L)'],
    features: [
      'Handcrafted full-grain calfskin leather',
      'Reinforced handles with dual-button grip',
      'Vented water-resistant quick-access shoe slot',
      'Internal neoprene padded sleeve up to 16in laptop',
      'Removable adjustable canvas shoulder strap'
    ],
    tags: ['Travel', 'New Arrival', 'Luggage']
  },
  {
    id: 'prod_4',
    name: 'Hale Thermal Insulated Flask',
    price: 35,
    originalPrice: 45,
    category: 'Lifestyle',
    description: 'Sip beautifully wherever life takes you. Constructed with food-grade double-walled vacuum insulation to lock temperatures. Guaranteed condensation-free with an ultra-matte exterior grip.',
    images: [
      'https://images.unsplash.com/photo-1602143407151-7111542de6e8?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1618605201643-4c5434d31fbe?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 45,
    maxStock: 100,
    rating: 4.6,
    reviewsCount: 310,
    colors: [
      { name: 'Muted Sage', hex: '#86EFAC' },
      { name: 'Desert Clay', hex: '#FCA5A5' },
      { name: 'Carbon Black', hex: '#000000' }
    ],
    sizes: ['20 oz (590ml)', '32 oz (950ml)'],
    features: [
      'TempShield™ double-wall vacuum protection',
      'Keeps liquids cold for 24 hours, hot for 12 hours',
      'Pro-grade 18/8 stainless steel construction',
      'BPA-Free and Phthalate-Free food grade material',
      'Lifetime leaks-free warranty protection'
    ],
    tags: ['Everyday', 'Eco', 'Active']
  },
  {
    id: 'prod_5',
    name: 'Dusk Handcrafted Sunglasses',
    price: 120,
    category: 'Accessories',
    description: 'Timeless vintage aviator contouring meet high-grade lens performance. Hand-polished acetate framing is weighted perfectly for lightweight comfort, paired with polarized lenses to deflect blinding glares.',
    images: [
      'https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 4,
    maxStock: 20,
    rating: 4.8,
    reviewsCount: 57,
    colors: [
      { name: 'Amber Tortoise', hex: '#D97706' },
      { name: 'Crystal Slate', hex: '#94A3B8' }
    ],
    sizes: ['Narrow Comfort', 'Regular Standard'],
    features: [
      '100% UV400 polarized optical clarity lenses',
      'Handmade hypoallergenic cellulose acetate frame',
      'Reinforced seven-barrel solid German metal hinges',
      'Anti-fog, anti-scratch double coat finish',
      'Vegan protective hard case and microfiber cleaning fabric'
    ],
    tags: ['Aesthetic', 'Style', 'Summer']
  },
  {
    id: 'prod_6',
    name: 'Lumina Arc Ambient Lamp',
    price: 89,
    originalPrice: 110,
    category: 'Home',
    description: 'Transform your workspaces with Lumina. Features organic arch structural styling, stepless touch-to-dim warm illumination (2200K-4000K), and custom integrated smart flickerless diffuser guards.',
    images: [
      'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1565814636199-ae8133055c1c?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 15,
    maxStock: 25,
    rating: 4.5,
    reviewsCount: 68,
    colors: [
      { name: 'Brushed Brass', hex: '#EAB308' },
      { name: 'Off-White Oyster', hex: '#F8FAFC' }
    ],
    sizes: ['Compact 12 in'],
    features: [
      'Eco-efficient warm spectrum flickerless LED diodes',
      'Smooth high-grade solid aluminum frame structure',
      'Stepless dimming slider button trigger memory',
      'Type-C low consumption battery or direct plug-in',
      'Calming circadian rhythm sleep fade feature'
    ],
    tags: ['Living', 'Minimalist', 'Lumina']
  },
  {
    id: 'prod_7',
    name: 'Nomad Knit Seamless Sneaker',
    price: 140,
    category: 'Apparel',
    description: 'Experience true comfort with the Nomad Knit. Built using single-thread recycled plastic weaving, dynamic arch-support base, and highly responsive foam cushioning to absorb surface shocks smoothly.',
    images: [
      'https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 8,
    maxStock: 30,
    rating: 4.7,
    reviewsCount: 191,
    colors: [
      { name: 'Glacier Blue', hex: '#93C5FD' },
      { name: 'Oatmeal Khaki', hex: '#DDB892' },
      { name: 'Onyx Black', hex: '#111827' }
    ],
    sizes: ['US 8', 'US 9', 'US 10', 'US 11'],
    features: [
      'Ultra-breathable weave elastic dynamic upper mesh',
      'Super-soft bioaligned supportive dynamic orthopedic insoles',
      'Recycled ocean-bound plastic components',
      'Anti-slip dual-grip custom pattern track sole',
      'Machine washable easy care instruction fabric'
    ],
    tags: ['Sports', 'Comfort', 'Eco']
  },
  {
    id: 'prod_8',
    name: 'Aura Core Charging Pad',
    price: 79,
    category: 'Electronics',
    description: 'Declutter your workspace elegantly. Features pure solid premium American walnut inlay, high-speed triple induction copper coils to charge up to three gear units simultaneously without alignment friction.',
    images: [
      'https://images.unsplash.com/photo-1622445262465-2481c4574875?q=80&w=800&auto=format&fit=crop',
      'https://images.unsplash.com/photo-1586495777744-4413f21062fa?q=80&w=800&auto=format&fit=crop'
    ],
    stock: 3,
    maxStock: 15,
    rating: 4.9,
    reviewsCount: 42,
    colors: [
      { name: 'Dark Walnut', hex: '#4B3621' },
      { name: 'Light White Oak', hex: '#F5F5DC' }
    ],
    sizes: ['Standard Pad'],
    features: [
      'Premium solid CNC-milled walnut and felt design',
      'Triple coil structure supporting 15W fast charge rates',
      'Built-in overheating protection hardware chip safeguards',
      'Compatible with Qi standard smart phones, buds, wearables',
      'Includes high-quality braided USB-C power connection cord (4ft)'
    ],
    tags: ['Office', 'Design', 'Power']
  }
];

export const INITIAL_COUPONS: Coupon[] = [
  {
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    description: 'Enjoy 10% off on your initial purchase.'
  },
  {
    code: 'FREESHIP',
    type: 'fixed',
    value: 15,
    minSpend: 50,
    description: 'Get ৳15 off on shipping & handling costs (Orders above ৳50).'
  },
  {
    code: 'AURA20',
    type: 'fixed',
    value: 20,
    minSpend: 150,
    description: 'Save ৳20 on premium cart totals above ৳150.'
  }
];
