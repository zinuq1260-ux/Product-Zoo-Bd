import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, ShieldCheck, Truck, RefreshCw, MessageSquare, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useProducts } from '../context/ProductContext';
import { useCart, Product } from '../context/CartContext';
import { supabase } from '../lib/supabase';

interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { products } = useProducts();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [shareCopied, setShareCopied] = useState(false);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  // Find product in context or fetch directly
  useEffect(() => {
    const findProduct = async () => {
      if (!id) return;

      const existingProduct = products.find(p => p.id === id);
      if (existingProduct) {
        setProduct(existingProduct);
        setLoading(false);
        return;
      }

      // If not in context, fetch directly from Supabase for speed
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single();

        if (error) throw error;
        if (data) {
          const formattedProduct = {
            ...data,
            category: Array.isArray(data.category) ? data.category : (data.category ? [data.category] : []),
            productCode: data.product_code,
            isFeatured: data.is_featured,
            isTrending: data.is_trending,
            image_url: data.image_url,
            additional_images: data.additional_images,
            delivery_info: data.delivery_info,
            warranty_info: data.warranty_info,
            return_policy: data.return_policy,
            rating: Number(data.rating) || 0,
            reviews: Number(data.reviews) || 0
          };
          setProduct(formattedProduct as Product);
        }
      } catch (err) {
        console.error('Error fetching product directly:', err);
      } finally {
        setLoading(false);
      }
    };

    findProduct();
  }, [id, products]);

  const handleShare = async () => {
    const shareData = {
      title: product?.name || 'Product',
      text: `Check out this product: ${product?.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        setShareCopied(true);
        setTimeout(() => setShareCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
      }
    }
  };

  if (loading) {
    return null;
  }

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
  
  // Calculate dynamic rating and reviews
  const averageRating = (Number(product.rating) || 0).toFixed(1);
  const displayReviewsCount = (Number(product.reviews) || 0);

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
            <div className="flex justify-between items-start gap-4 mb-4">
              <div>
                <div className="mb-2 text-sm font-bold text-emerald-600 uppercase tracking-wider">{product.category || 'Uncategorized'}</div>
                <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900">{product.name || 'Unknown Product'}</h1>
              </div>
              <button
                onClick={handleShare}
                className="p-3 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 transition-colors flex-shrink-0 border border-gray-200 relative"
                title="Share Product"
              >
                <Share2 className="w-5 h-5" />
                {shareCopied && (
                  <span className="absolute -bottom-8 right-0 bg-gray-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    Link copied!
                  </span>
                )}
              </button>
            </div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center bg-amber-50 px-3 py-1 rounded-full">
                <Star className="w-5 h-5 text-amber-500 fill-current" />
                <span className="ml-1.5 font-bold text-amber-700">{averageRating}</span>
              </div>
              <span className="text-gray-500 font-medium">{displayReviewsCount} Reviews</span>
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

            <div className="prose prose-sm max-w-none text-gray-600 leading-relaxed mb-8">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {product.description || 'No description available.'}
              </ReactMarkdown>
            </div>

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

      {/* Reviews Section - Removed as Firebase is disabled */}
    </div>
  );
};
