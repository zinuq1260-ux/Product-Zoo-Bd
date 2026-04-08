import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShoppingCart } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Cart: React.FC = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice } = useCart();
  const navigate = useNavigate();

  if (!cart || !Array.isArray(cart) || cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="bg-gray-100 p-6 rounded-full mb-4">
          <ShoppingCart className="h-12 w-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Looks like you haven't added anything to your cart yet.</p>
        <Link
          to="/"
          className="bg-indigo-600 text-white px-6 py-3 rounded-md font-medium hover:bg-indigo-700 transition-colors"
        >
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
      
      <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
        <ul className="divide-y divide-gray-200">
          {cart.map((item) => {
            if (!item) return null;
            const price = Number(item.price) || 0;
            const discount = Number(item.discount) || 0;
            const quantity = Number(item.quantity) || 1;
            const discountedPrice = price * (1 - discount / 100);

            return (
              <li key={item.id || Math.random()} className="p-6 flex flex-col sm:flex-row items-center">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt={item.name || 'Product'}
                    className="w-24 h-24 object-cover rounded-md mb-4 sm:mb-0 sm:mr-6"
                    referrerPolicy="no-referrer"
                  />
                )}
                <div className="flex-1 text-center sm:text-left">
                  <h3 className="text-lg font-medium text-gray-900">{item.name || 'Unknown Product'}</h3>
                  <p className="text-sm text-gray-500 mb-2">{item.category || 'Uncategorized'}</p>
                  <div className="text-lg font-bold text-gray-900">
                    ৳{discountedPrice.toFixed(2)}
                  </div>
                </div>
                
                <div className="flex items-center mt-4 sm:mt-0 sm:ml-6 space-x-4">
                  <div className="flex items-center border border-gray-300 rounded-md">
                    <button
                      onClick={() => updateQuantity(item.id, quantity - 1)}
                      className="p-2 text-gray-600 hover:bg-gray-50"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="px-4 font-medium text-gray-900">{quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, quantity + 1)}
                      className="p-2 text-gray-600 hover:bg-gray-50"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-md"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
        
        <div className="bg-gray-50 p-6 border-t border-gray-200">
          <div className="flex justify-between items-center mb-4">
            <span className="text-lg font-medium text-gray-900">Subtotal</span>
            <span className="text-2xl font-bold text-gray-900">৳{(Number(totalPrice) || 0).toFixed(2)}</span>
          </div>
          <p className="text-sm text-gray-500 mb-6">Shipping and taxes calculated at checkout.</p>
          <button
            onClick={() => navigate('/checkout')}
            className="w-full bg-indigo-600 text-white px-6 py-4 rounded-md font-medium hover:bg-indigo-700 transition-colors flex justify-center items-center"
          >
            Proceed to Checkout
            <ArrowRight className="ml-2 h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
};