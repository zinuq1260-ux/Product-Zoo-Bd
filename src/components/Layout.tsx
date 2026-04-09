import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { ShoppingCart, User, Search, Store, Menu, X, Shield, Home as HomeIcon, Package } from 'lucide-react';
import { useCart } from '../context/CartContext';

export const Layout: React.FC = () => {
  const { totalItems } = useCart();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  
  const searchParams = new URLSearchParams(location.search);
  const initialSearch = searchParams.get('search') || '';
  const [searchQuery, setSearchQuery] = useState(initialSearch);

  useEffect(() => {
    setSearchQuery(searchParams.get('search') || '');
  }, [location.search]);

  const isActive = (path: string) => location.pathname === path;

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/');
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#f4f4f4] flex flex-col font-sans text-gray-900">
      {/* Top Header - Daraz Style */}
      <header className="bg-[#f85606] sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-4">
            {/* Logo */}
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <img 
                src="/logo.png" 
                alt="PRODUCT ZOO BD" 
                className="h-8 sm:h-10 w-auto object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                  (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                }}
              />
              <span className="text-lg sm:text-xl font-black tracking-tighter text-white uppercase italic hidden">PRODUCT ZOO BD</span>
            </Link>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex-1 max-w-2xl relative group hidden sm:flex">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-12 py-2 rounded-lg bg-white/90 focus:bg-white focus:outline-none text-sm placeholder-gray-400"
                placeholder="Search in PRODUCT ZOO BD"
              />
              <button type="submit" className="absolute right-0 top-0 h-full px-4 bg-[#eff0f5] rounded-r-lg text-gray-500 hover:text-[#f85606]">
                <Search className="h-5 w-5" />
              </button>
            </form>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-6 text-white text-sm font-medium">
              <Link to="/order-history" className="hover:opacity-80 flex flex-col items-center">
                <Package className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Orders</span>
              </Link>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="hover:opacity-80 flex flex-col items-center">
                <Menu className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Menu</span>
              </button>
              <Link to="/profile" className="hover:opacity-80 flex flex-col items-center">
                <User className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Account</span>
              </Link>
              <Link to="/cart" className="hover:opacity-80 flex flex-col items-center relative">
                <ShoppingCart className="h-5 w-5" />
                <span className="text-[10px] mt-0.5">Cart</span>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-[#f85606] text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full border border-[#f85606]">
                    {totalItems}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Icons */}
            <div className="flex items-center space-x-4 md:hidden text-white">
              <Link to="/cart" className="relative">
                <ShoppingCart className="h-6 w-6" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-white text-[#f85606] text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                    {totalItems}
                  </span>
                )}
              </Link>
              <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Search - Always visible on mobile header bottom */}
          <form onSubmit={handleSearch} className="pb-3 sm:hidden">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2 rounded-lg bg-white/90 text-sm"
                placeholder="Search in PRODUCT ZOO BD"
              />
              <button type="submit" className="absolute right-3 top-2.5">
                <Search className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </form>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setIsMobileMenuOpen(false)}>
          <div className="bg-white w-64 h-full p-6 shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-8 pb-4 border-b">
              <div className="flex items-center gap-3">
                <div className="bg-[#f85606] text-white p-2 rounded-lg">
                  <Store className="h-6 w-6" />
                </div>
                <span className="font-bold text-xl">Menu</span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)}>
                <X className="h-6 w-6 text-gray-500" />
              </button>
            </div>
            <nav className="space-y-4">
              <Link to="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 font-medium">
                <HomeIcon className="h-5 w-5" /> Home
              </Link>
              <Link to="/order-history" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 font-medium">
                <Package className="h-5 w-5" /> Order History
              </Link>
              <Link to="/profile" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 font-medium">
                <User className="h-5 w-5" /> My Account
              </Link>
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-3 text-gray-700 font-medium">
                <Shield className="h-5 w-5" /> Admin Panel
              </Link>
            </nav>
          </div>
        </div>
      )}

      <main className="flex-1 max-w-7xl w-full mx-auto pb-20 md:pb-10">
        <Outlet />
      </main>

      {/* Bottom Navigation - Mobile Only */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around items-center h-16 z-50 md:hidden">
        <Link to="/" className={`flex flex-col items-center gap-1 ${isActive('/') ? 'text-[#f85606]' : 'text-gray-500'}`}>
          <HomeIcon className="h-6 w-6" />
          <span className="text-[10px] font-bold">Home</span>
        </Link>
        <Link to="/order-history" className={`flex flex-col items-center gap-1 ${isActive('/order-history') ? 'text-[#f85606]' : 'text-gray-500'}`}>
          <Package className="h-6 w-6" />
          <span className="text-[10px] font-bold">Orders</span>
        </Link>
        <Link to="/profile" className={`flex flex-col items-center gap-1 ${isActive('/profile') ? 'text-[#f85606]' : 'text-gray-500'}`}>
          <User className="h-6 w-6" />
          <span className="text-[10px] font-bold">Account</span>
        </Link>
        <Link to="/cart" className={`flex flex-col items-center gap-1 ${isActive('/cart') ? 'text-[#f85606]' : 'text-gray-500'}`}>
          <div className="relative">
            <ShoppingCart className="h-6 w-6" />
            {totalItems > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#f85606] text-white text-[10px] font-bold h-4 w-4 flex items-center justify-center rounded-full">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold">Cart</span>
        </Link>

      </nav>

      {/* Floating Cart Button */}
      <Link
        to="/cart"
        className="fixed bottom-20 left-4 z-50 bg-[#f85606] text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all md:bottom-10 md:left-10 flex items-center justify-center"
        title="View Cart"
      >
        <div className="relative">
          <ShoppingCart className="h-6 w-6" />
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-white text-[#f85606] text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-[#f85606]">
              {totalItems}
            </span>
          )}
        </div>
      </Link>

      {/* Floating WhatsApp Button */}
      <a
        href="https://wa.me/8801816600419"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-20 right-4 z-50 bg-[#25D366] text-white p-3 rounded-full shadow-2xl hover:scale-110 transition-all animate-bounce-slow md:bottom-10 md:right-10"
        title="Chat on WhatsApp"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6 fill-current" xmlns="http://www.w3.org/2000/svg">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.94 3.659 1.437 5.634 1.437h.005c6.558 0 11.894-5.335 11.897-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      </a>

      {/* Desktop Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto hidden md:block">
        <div className="max-w-7xl mx-auto py-10 px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <img 
                  src="/logo.png" 
                  alt="PRODUCT ZOO BD" 
                  className="h-10 w-auto object-contain"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <span className="text-xl font-bold text-[#f85606] hidden">PRODUCT ZOO BD</span>
              </div>
              <p className="text-gray-500 text-sm max-w-sm">
                PRODUCT ZOO BD is your one-stop destination for premium products. We ensure quality and authenticity in every item we sell.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Customer Care</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link to="/profile" className="hover:text-[#f85606]">My Account</Link></li>
                <li><Link to="/cart" className="hover:text-[#f85606]">My Cart</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-gray-900 mb-4">Contact Us</h4>
              <p className="text-sm text-gray-600">Hotline: 01816600419</p>
              <p className="text-sm text-gray-600">Email: support@productzoobd.com</p>
            </div>
          </div>
          <div className="mt-10 pt-6 border-t text-center text-gray-400 text-xs">
            © 2026 PRODUCT ZOO BD. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};
