import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, ShieldCheck, Truck, RefreshCw } from 'lucide-react';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Scroll to top when product changes
  React.useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  const product = products.find(p => p.id === id);

  if (!product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Product not found</h2>
        <button onClick={() => navigate('/')} className="text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Home
        </button>
      </div>
    );
  }

  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const stock = Number(product.stock) || 0;
  const rating = Number(product.rating) || 0;
  const reviews = Number(product.reviews) || 0;
  const discountedPrice = price * (1 - discount / 100);

  const allImages = [product.image_url, ...(product.additional_images || [])].filter(Boolean);
  const currentImage = selectedImage || product.image_url || 'https://picsum.photos/seed/product/800/800';

  return (
    <div className="max-w-7xl mx-auto py-4">
      <button onClick={() => navigate(-1)} className="mb-6 text-gray-500 hover:text-gray-900 flex items-center gap-2 transition-colors font-medium">
        <ArrowLeft className="w-5 h-5" /> Back
      </button>
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 p-6 md:p-10">
          {/* Image Section */}
          <div className="flex flex-col gap-4">
            <div className="relative rounded-2xl overflow-hidden bg-gray-50 aspect-square flex items-center justify-center">
              <img 
                src={currentImage} 
                alt={product.name || 'Product'} 
                className="w-full h-full object-cover transition-opacity duration-300"
                referrerPolicy="no-referrer"
                loading="lazy"
              />
              {discount > 0 && (
                <div className="absolute top-4 left-4 bg-red-500 text-white text-sm font-bold px-4 py-2 rounded-full shadow-lg">
                  {discount}% OFF
                </div>
              )}
            </div>
            
            {/* Thumbnails Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 snap-x">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`relative flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-all snap-start ${
                      currentImage === img ? 'border-emerald-500 shadow-md scale-105' : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img 
                      src={img} 
                      alt={`${product.name || 'Product'} thumbnail ${idx + 1}`} 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                      loading="lazy"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="flex flex-col justify-center">
            <div className="mb-2 text-sm font-bold text-emerald-600 uppercase tracking-wider">{product.category || 'Uncategorized'}</div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">{product.name || 'Unknown Product'}</h1>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                <Star className="w-5 h-5 text-amber-500 fill-current" />
                <span className="ml-1.5 font-bold text-amber-700">{rating}</span>
              </div>
              <span className="text-gray-500 font-medium">{reviews} Reviews</span>
              <span className="text-gray-300">|</span>
              <span className={`font-medium ${stock > 10 ? 'text-green-600' : stock > 0 ? 'text-yellow-600' : 'text-red-600'}`}>
                {stock > 0 ? `${stock} in stock` : 'Out of stock'}
              </span>
            </div>

            <div className="mb-8">
              {discount > 0 ? (
                <div className="flex items-end gap-3">
                  <span className="text-4xl font-extrabold text-gray-900">
                    ৳{discountedPrice.toFixed(2)}
                  </span>
                  <span className="text-xl text-gray-400 line-through font-medium mb-1">
                    ৳{price.toFixed(2)}
                  </span>
                </div>
              ) : (
                <span className="text-4xl font-extrabold text-gray-900">
                  ৳{price.toFixed(2)}
                </span>
              )}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed mb-8">
              {product.description || 'No description available.'}
            </p>

            <div className="space-y-4 mb-8">
              {product.delivery_info && (
                <div className="flex items-center gap-3 text-gray-600">
                  <Truck className="w-5 h-5 text-emerald-500" />
                  <span>{product.delivery_info}</span>
                </div>
              )}
              {product.warranty_info && (
                <div className="flex items-center gap-3 text-gray-600">
                  <ShieldCheck className="w-5 h-5 text-emerald-500" />
                  <span>{product.warranty_info}</span>
                </div>
              )}
              {product.return_policy && (
                <div className="flex items-center gap-3 text-gray-600">
                  <RefreshCw className="w-5 h-5 text-emerald-500" />
                  <span>{product.return_policy}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => addToCart(product)}
              disabled={stock === 0}
              className={`w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 ${
                stock > 0 
                  ? 'bg-slate-900 text-white hover:bg-emerald-600 shadow-xl hover:shadow-2xl hover:-translate-y-1' 
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <ShoppingCart className="w-6 h-6" />
              {stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
