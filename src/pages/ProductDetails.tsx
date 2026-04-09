import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Star, ArrowLeft, ShieldCheck, Truck, RefreshCw, MessageSquare, User, Share2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useProducts } from '../context/ProductContext';
import { useCart } from '../context/CartContext';
import { db, auth } from '../firebase';
import { collection, addDoc, query, where, getDocs, orderBy, onSnapshot } from 'firebase/firestore';

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
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [reviewsList, setReviewsList] = useState<Review[]>([]);
  const [newReviewRating, setNewReviewRating] = useState(5);
  const [newReviewComment, setNewReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  // Scroll to top when product changes
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const q = query(collection(db, 'reviews'), where('productId', '==', id));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReviews: Review[] = [];
      snapshot.forEach((doc) => {
        fetchedReviews.push({ id: doc.id, ...doc.data() } as Review);
      });
      // Sort by date descending locally since we didn't create a composite index
      fetchedReviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReviewsList(fetchedReviews);
    });
    return () => unsubscribe();
  }, [id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!auth.currentUser) {
      alert('Please log in to submit a review.');
      return;
    }
    if (!newReviewComment.trim()) {
      alert('Please write a comment.');
      return;
    }

    setIsSubmittingReview(true);
    try {
      await addDoc(collection(db, 'reviews'), {
        productId: id,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName || auth.currentUser.email?.split('@')[0] || 'Anonymous',
        rating: newReviewRating,
        comment: newReviewComment.trim(),
        createdAt: new Date().toISOString()
      });
      setNewReviewComment('');
      setNewReviewRating(5);
      alert('Review submitted successfully!');
    } catch (error) {
      console.error('Error submitting review:', error);
      alert('Failed to submit review. Please try again.');
    } finally {
      setIsSubmittingReview(false);
    }
  };

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
  
  // Calculate dynamic rating and reviews
  const reviewsCount = reviewsList.length;
  const averageRating = reviewsCount > 0 
    ? (reviewsList.reduce((acc, curr) => acc + curr.rating, 0) / reviewsCount).toFixed(1)
    : (Number(product.rating) || 0).toFixed(1);
  const displayReviewsCount = reviewsCount > 0 ? reviewsCount : (Number(product.reviews) || 0);

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

      {/* Reviews Section */}
      <div className="mt-8 bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-10">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-emerald-500" />
          Customer Reviews
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Review Form */}
          <div className="lg:col-span-1">
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4">Write a Review</h3>
              {auth.currentUser ? (
                <form onSubmit={handleReviewSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setNewReviewRating(star)}
                          className="focus:outline-none"
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= newReviewRating
                                ? 'text-amber-400 fill-current'
                                : 'text-gray-300'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Comment</label>
                    <textarea
                      value={newReviewComment}
                      onChange={(e) => setNewReviewComment(e.target.value)}
                      rows={4}
                      className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
                      placeholder="Share your experience with this product..."
                      required
                    ></textarea>
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingReview}
                    className="w-full bg-emerald-600 text-white py-3 rounded-xl font-bold hover:bg-emerald-700 transition-colors disabled:bg-gray-400"
                  >
                    {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                  </button>
                </form>
              ) : (
                <div className="text-center py-6">
                  <p className="text-gray-500 mb-4">Please log in to share your review.</p>
                  <Link to="/profile" className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold hover:bg-slate-800 transition-colors inline-block">
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Reviews List */}
          <div className="lg:col-span-2">
            {reviewsList.length > 0 ? (
              <div className="space-y-6">
                {reviewsList.map((review) => (
                  <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold">
                          {review.userName.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{review.userName}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric'
                            })}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-0.5">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= review.rating ? 'text-amber-400 fill-current' : 'text-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <p className="text-gray-600 mt-3">{review.comment}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <Star className="w-16 h-16 text-gray-200 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No reviews yet</h3>
                <p className="text-gray-500">Be the first to review this product!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
