/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Product {
  id: string;
  name: string;
  price: number;
  originalPrice?: number;
  category: string;
  description: string;
  images: string[];
  stock: number;
  maxStock: number;
  rating: number;
  reviewsCount: number;
  colors: { name: string; hex: string }[];
  sizes?: string[];
  features: string[];
  tags: string[];
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedColor: { name: string; hex: string };
  selectedSize?: string;
}

export interface User {
  id: string;
  email: string;
  fullName: string;
  avatarUrl: string;
  joinedDate: string;
  role: 'customer' | 'admin';
}

export interface Order {
  id: string;
  date: string;
  items: {
    productId: string;
    productName: string;
    productImage: string;
    price: number;
    quantity: number;
    selectedColor: string;
    selectedSize?: string;
  }[];
  subtotal: number;
  discount: number;
  shipping: number;
  tax: number;
  total: number;
  couponCodeUsed?: string;
  shippingAddress: {
    fullName: string;
    addressLine1: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
    phone: string;
  };
  paymentMethod: 'card' | 'paypal';
  paymentDetails: {
    cardBrand?: string;
    last4?: string;
    paypalEmail?: string;
  };
  status: 'processing' | 'shipped' | 'delivered';
  trackingNumber: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minSpend?: number;
  description: string;
}
