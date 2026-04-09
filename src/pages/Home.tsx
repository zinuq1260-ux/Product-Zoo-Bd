import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Star, TrendingUp, Package, Zap, ChevronRight, Gift, Smartphone, Laptop, Watch, Shirt, Home as HomeIcon, AlertTriangle } from 'lucide-react';
import { useCart, Product } from '../context/CartContext';
import { useProducts } from '../context/ProductContext';

const ProductCard: React.FC<{ product: Product, addToCart: (p: Product) => void }> = ({ product, addToCart }) => {
  if (!product) return null;

  const price = Number(product.price) || 0;
  const discount = Number(product.discount) || 0;
  const discountedPrice = price * (1 - discount / 100);

  return (
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300 flex flex-col h-full border border-transparent hover:border-gray-100">
      <Link to={`/product/${product.id}`} className="relative aspect-square overflow-hidden bg-gray-50 block">
        <img 
          src={product.image_url} 
          alt={product.name} 
          className="w-full h-full object-cover"
          referrerPolicy="no-referrer"
          loading="lazy"
        />
        {discount > 0 && (
          <div className="absolute top-0 left-0 bg-[#f85606] text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg">
            -{discount}%
          </div>
        )}
      </Link>
      <div className="p-3 flex-1 flex flex-col">
        <Link to={`/product/${product.id}`}>
          <h3 className="text-sm text-gray-800 mb-1 line-clamp-2 leading-tight hover:text-[#f85606] transition-colors h-10">{product.name}</h3>
        </Link>
        <div className="mt-auto">
          <div className="flex flex-col">
            <span className="text-lg font-bold text-[#f85606]">৳{discountedPrice.toFixed(0)}</span>
            {discount > 0 && (
              <span className="text-xs text-gray-400 line-through">৳{price.toFixed(0)}</span>
            )}
          </div>
          <div className="flex items-center mt-1">
            <div className="flex items-center">
              <Star className="h-3 w-3 text-[#faca51] fill-current" />
              <span className="text-[10px] text-gray-500 ml-1">{product.rating || 4.5}</span>
            </div>
            <span className="text-[10px] text-gray-400 ml-1">({product.reviews || 0})</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Home: React.FC = () => {
  const { addToCart } = useCart();
  const { products, loading, error } = useProducts();
  const [categoryFilter, setCategoryFilter] = useState('All');
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const searchQuery = searchParams.get('search') || '';

  const categories = React.useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);
  const featuredProducts = React.useMemo(() => products.filter(p => p.isFeatured).reverse(), [products]);
  const flashSaleProducts = React.useMemo(() => products.filter(p => Number(p.discount) > 10).slice(0, 6), [products]);
  const trendingProducts = React.useMemo(() => products.filter(p => p.isTrending).slice(0, 6), [products]);
  
  const sliderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sliderRef.current || featuredProducts.length <= 1) return;
    
    const interval = setInterval(() => {
      const slider = sliderRef.current;
      if (slider) {
        const scrollLeft = slider.scrollLeft;
        const clientWidth = slider.clientWidth;
        const scrollWidth = slider.scrollWidth;
        
        if (scrollLeft + clientWidth >= scrollWidth - 10) {
          slider.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          slider.scrollTo({ left: scrollLeft + clientWidth, behavior: 'smooth' });
        }
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredProducts.length]);
  
  const categoryKeywords: Record<string, string[]> = React.useMemo(() => ({
    'Electronics': ['electronic', 'mobile', 'phone', 'smartphone', 'gadget', 'charger', 'headphone', 'earphone'],
    'Laptops': ['laptop', 'computer', 'pc', 'desktop', 'macbook', 'notebook'],
    'Fashion': ['fashion', 'clothing', 'cosmetic', 'juta', 'shoe', 'shirt', 'pant', 'dress', 'apparel', 'saree', 'panjabi', 't-shirt'],
    'Watches': ['watch', 'smartwatch', 'clock', 'band'],
    'Home': ['home', 'appliance', 'furniture', 'decor', 'kitchen', 'blender', 'fan'],
    'Offers': ['offer', 'discount', 'sale', 'bundle']
  }), []);

  const filteredProducts = React.useMemo(() => {
    return products.filter(p => {
      let matchesCategory = false;
      if (categoryFilter === 'All') {
        matchesCategory = true;
      } else {
        if (p.category === categoryFilter) {
          matchesCategory = true;
        } else {
          const keywords = categoryKeywords[categoryFilter] || [categoryFilter.toLowerCase()];
          const prodCatLower = (p.category || '').toLowerCase();
          const prodNameLower = (p.name || '').toLowerCase();
          matchesCategory = keywords.some(kw => 
            prodCatLower.includes(kw) || prodNameLower.includes(kw)
          );
        }
      }

      const searchLower = searchQuery.toLowerCase();
      const matchesSearch = 
        p.name.toLowerCase().includes(searchLower) || 
        (p.category && p.category.toLowerCase().includes(searchLower)) ||
        (p.description && p.description.toLowerCase().includes(searchLower));
        
      return matchesCategory && matchesSearch;
    });
  }, [products, categoryFilter, searchQuery, categoryKeywords]);

  if (loading && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#f85606]"></div>
        <p className="text-gray-500 animate-pulse">Loading products...</p>
      </div>
    );
  }

  if (error && products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 p-6 text-center">
        <div className="bg-red-50 p-4 rounded-full text-red-500">
          <AlertTriangle className="h-12 w-12" />
        </div>
        <h2 className="text-xl font-bold text-gray-900">Oops! Something went wrong</h2>
        <p className="text-gray-500 max-w-md">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="bg-[#f85606] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#d44a05] transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  const categoryIcons = [
    { name: 'Home', icon: HomeIcon, color: 'bg-green-100 text-green-600' },
    { name: 'Electronics', icon: Smartphone, color: 'bg-blue-100 text-blue-600' },
    { name: 'Laptops', icon: Laptop, color: 'bg-purple-100 text-purple-600' },
    { name: 'Fashion', icon: Shirt, color: 'bg-pink-100 text-pink-600' },
    { name: 'Watches', icon: Watch, color: 'bg-orange-100 text-orange-600' },
    { name: 'Offers', icon: Gift, color: 'bg-red-100 text-red-600' },
  ];

  if (searchQuery) {
    return (
      <div className="space-y-4 sm:space-y-6 mt-4">
        <div className="bg-white sm:rounded-xl p-4 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900">
            Search Results for "{searchQuery}"
          </h2>
          <p className="text-sm text-gray-500">{filteredProducts.length} products found</p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2 sm:px-0">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900">No products found</h3>
            <p className="text-xs text-gray-500">Try checking your spelling or use more general terms.</p>
          </div>
        )}
      </div>
    );
  }

  if (categoryFilter !== 'All') {
    return (
      <div className="space-y-4 sm:space-y-6 mt-4">
        {/* Category Grid */}
        <div className="bg-white sm:rounded-xl p-4 shadow-sm">
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
            {categoryIcons.map((cat, idx) => (
              <button 
                key={idx}
                onClick={() => cat.name === 'Home' ? setCategoryFilter('All') : setCategoryFilter(cat.name)}
                className={`flex flex-col items-center gap-2 group ${categoryFilter === cat.name ? 'opacity-100' : 'opacity-60 hover:opacity-100'}`}
              >
                <div className={`${cat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300 ${categoryFilter === cat.name ? 'ring-2 ring-offset-2 ring-[#f85606]' : ''}`}>
                  <cat.icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-gray-700">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white sm:rounded-xl p-4 shadow-sm flex justify-between items-center">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {categoryFilter} Products
            </h2>
            <p className="text-sm text-gray-500">{filteredProducts.length} products found</p>
          </div>
          <button onClick={() => setCategoryFilter('All')} className="text-sm font-medium text-[#f85606] hover:underline">
            Clear Filter
          </button>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 px-2 sm:px-0">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900">No products available in {categoryFilter}</h3>
            <p className="text-xs text-gray-500 mb-4">Please check back later or browse other categories.</p>
            <button onClick={() => setCategoryFilter('All')} className="bg-[#f85606] text-white px-6 py-2 rounded-lg font-bold hover:bg-[#d44a05] transition-colors">
              View All Products
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Hero Slider */}
      <div className="relative overflow-hidden sm:rounded-xl bg-gray-200 aspect-[21/9] sm:aspect-[3/1]">
        {featuredProducts.length > 0 ? (
          <div 
            ref={sliderRef}
            className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full"
          >
            {featuredProducts.map((product) => (
              <Link key={`hero-${product.id}`} to={`/product/${product.id}`} className="min-w-full snap-start relative h-full block">
                <img 
                  src={product.image_url} 
                  alt={product.name} 
                  className="absolute inset-0 w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-black/20"></div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center bg-gray-100 text-gray-400 p-6 text-center">
            <Package className="h-12 w-12 mb-2" />
            <p className="text-sm">Add featured products to display them here</p>
          </div>
        )}
      </div>

      {/* Category Grid */}
      <div className="bg-white sm:rounded-xl p-4 shadow-sm">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
          {categoryIcons.map((cat, idx) => (
            <button 
              key={idx}
              onClick={() => cat.name === 'Home' ? setCategoryFilter('All') : setCategoryFilter(cat.name)}
              className="flex flex-col items-center gap-2 group"
            >
              <div className={`${cat.color} p-3 rounded-2xl group-hover:scale-110 transition-transform duration-300`}>
                <cat.icon className="h-6 w-6" />
              </div>
              <span className="text-xs font-medium text-gray-700">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Flash Sale Section */}
      {flashSaleProducts.length > 0 && (
        <div className="bg-white sm:rounded-xl overflow-hidden shadow-sm">
          <div className="flex items-center justify-between p-4 border-b border-gray-50">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#f85606] fill-current" />
              <h2 className="font-bold text-gray-900">Flash Sale</h2>
              <div className="flex items-center gap-1 ml-4">
                <span className="bg-[#f85606] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">02</span>
                <span className="text-[#f85606] font-bold">:</span>
                <span className="bg-[#f85606] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">45</span>
                <span className="text-[#f85606] font-bold">:</span>
                <span className="bg-[#f85606] text-white text-[10px] font-bold px-1.5 py-0.5 rounded">12</span>
              </div>
            </div>
            <button className="text-[#f85606] text-xs font-bold flex items-center gap-1 uppercase">
              Shop More <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="p-4">
            <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-2">
              {flashSaleProducts.map((product) => (
                <div key={`flash-${product.id}`} className="min-w-[120px] sm:min-w-[160px]">
                  <ProductCard product={product} addToCart={addToCart} />
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Trending Section */}
      {trendingProducts.length > 0 && (
        <div className="bg-white sm:rounded-xl overflow-hidden shadow-sm p-4">
          <h2 className="font-bold text-gray-900 mb-4">Trending Now</h2>
          <div className="flex overflow-x-auto gap-4 scrollbar-hide pb-2">
            {trendingProducts.map((product) => (
              <div key={`trending-${product.id}`} className="min-w-[120px] sm:min-w-[160px]">
                <ProductCard product={product} addToCart={addToCart} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Product Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-lg font-bold text-gray-900">Just For You</h2>
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-1">
            {categories.slice(0, 4).map(cat => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
                  categoryFilter === cat 
                    ? 'bg-[#f85606] text-white border-[#f85606]' 
                    : 'bg-white text-gray-600 border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 px-2 sm:px-0">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} addToCart={addToCart} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <h3 className="font-bold text-gray-900">No products found</h3>
            <p className="text-xs text-gray-500">Try changing your filters or check back later.</p>
          </div>
        )}
      </div>
    </div>
  );
};
