/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { ProductProvider } from './context/ProductContext';
import { OrderProvider } from './context/OrderContext';
import { AuthProvider } from './context/AuthContext';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';

// Lazy load pages for better performance
const Home = React.lazy(() => import('./pages/Home').then(module => ({ default: module.Home })));
const Cart = React.lazy(() => import('./pages/Cart').then(module => ({ default: module.Cart })));
const Checkout = React.lazy(() => import('./pages/Checkout').then(module => ({ default: module.Checkout })));
const Profile = React.lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })));
const ProductDetails = React.lazy(() => import('./pages/ProductDetails').then(module => ({ default: module.ProductDetails })));
const OrderHistory = React.lazy(() => import('./pages/OrderHistory').then(module => ({ default: module.OrderHistory })));
const Dashboard = React.lazy(() => import('./pages/admin/Dashboard').then(module => ({ default: module.Dashboard })));
const ProductManagement = React.lazy(() => import('./pages/admin/ProductManagement').then(module => ({ default: module.ProductManagement })));
const OrderManagement = React.lazy(() => import('./pages/admin/OrderManagement').then(module => ({ default: module.OrderManagement })));
const Inventory = React.lazy(() => import('./pages/admin/Inventory').then(module => ({ default: module.Inventory })));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[60vh]">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f85606]"></div>
  </div>
);

export default function App() {
  return (
    <AuthProvider>
      <ProductProvider>
        <CartProvider>
          <OrderProvider>
            <Router>
              <Suspense fallback={<LoadingFallback />}>
                <Routes>
                  {/* Customer Routes */}
                  <Route path="/" element={<Layout />}>
                    <Route index element={<Home />} />
                    <Route path="product/:id" element={<ProductDetails />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="profile" element={<Profile />} />
                    <Route path="order-history" element={<OrderHistory />} />
                  </Route>

                  {/* Admin Routes */}
                  <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<Dashboard />} />
                    <Route path="products" element={<ProductManagement />} />
                    <Route path="orders" element={<OrderManagement />} />
                    <Route path="inventory" element={<Inventory />} />
                  </Route>
                </Routes>
              </Suspense>
            </Router>
          </OrderProvider>
        </CartProvider>
      </ProductProvider>
    </AuthProvider>
  );
}

