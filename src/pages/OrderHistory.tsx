import React, { useState } from 'react';
import { useOrders } from '../context/OrderContext';
import { Search, Package, Clock, CheckCircle, AlertTriangle, AlertCircle, ArrowRight, RefreshCw } from 'lucide-react';

export const OrderHistory: React.FC = () => {
  const { orders, loading, updateOrderReply, refreshOrders } = useOrders();
  const [mobileNumber, setMobileNumber] = useState('');
  const [lastSearchedNumber, setLastSearchedNumber] = useState('');
  const [searchedOrders, setSearchedOrders] = useState<any[] | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newTxid, setNewTxid] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  // Make search results reactive to orders data
  React.useEffect(() => {
    if (hasSearched && lastSearchedNumber) {
      const filtered = orders.filter(order => order.mobileNumber === lastSearchedNumber);
      setSearchedOrders(filtered);
    }
  }, [orders, hasSearched, lastSearchedNumber]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedNumber = mobileNumber.trim();
    if (!trimmedNumber) return;

    setLastSearchedNumber(trimmedNumber);
    const filtered = orders.filter(order => order.mobileNumber === trimmedNumber);
    setSearchedOrders(filtered);
    setHasSearched(true);
  };

  const handleReplySubmit = async (orderId: string) => {
    if (!newTxid.trim()) return;
    setIsSubmittingReply(true);
    try {
      await updateOrderReply(orderId, `New Transaction ID: ${newTxid}`);
      setReplyingTo(null);
      setNewTxid('');
      alert('আপনার নতুন ট্রানজেকশন আইডি সফলভাবে পাঠানো হয়েছে। আমরা পুনরায় যাচাই করে স্ট্যাটাস আপডেট করে দেব।');
    } catch (err: any) {
      alert('রিপ্লাই পাঠাতে সমস্যা হয়েছে। আবার চেষ্টা করুন।');
    } finally {
      setIsSubmittingReply(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Received': return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case 'Processing': return <Clock className="h-5 w-5 text-yellow-500" />;
      case 'Pending': return <Clock className="h-5 w-5 text-orange-500" />;
      case 'Invalid Transaction': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      case 'Cancelled': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Received': return 'bg-emerald-100 text-emerald-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Invalid Transaction': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    if (status === 'Invalid Transaction') {
      return 'আপনার ট্রানজেকশন নাম্বার ভুল, আবার ট্রাই করুন';
    }
    return status;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-black text-gray-900 mb-2">অর্ডার হিস্ট্রি চেক করুন</h1>
        <p className="text-gray-500">আপনার মোবাইল নাম্বার দিয়ে আপনার সব অর্ডার দেখুন</p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <input
              type="tel"
              value={mobileNumber}
              onChange={(e) => setMobileNumber(e.target.value)}
              placeholder="আপনার মোবাইল নাম্বার লিখুন (01XXXXXXXXX)"
              className="w-full pl-12 pr-4 py-4 bg-gray-50 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-[#f85606] focus:border-[#f85606] outline-none transition-all font-bold"
              required
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
          </div>
          <button
            type="submit"
            className="bg-[#f85606] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#e04b05] transition-all shadow-lg hover:shadow-[#f85606]/20 flex items-center justify-center gap-2"
          >
            অর্ডার খুঁজুন <ArrowRight className="h-5 w-5" />
          </button>
        </form>
      </div>

      {loading && !hasSearched && (
        <div className="text-center py-10">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#f85606] mx-auto"></div>
        </div>
      )}

      {hasSearched && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Package className="h-6 w-6 text-[#f85606]" />
              সার্চ রেজাল্ট ({searchedOrders?.length || 0})
            </h2>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
                <div className="animate-spin h-3 w-3 border-b border-[#f85606] rounded-full"></div>
                আপডেট হচ্ছে...
              </div>
            ) : (
              <button 
                onClick={() => refreshOrders()}
                className="flex items-center gap-1.5 text-xs text-[#f85606] font-bold hover:underline"
              >
                <RefreshCw className="h-3 w-3" />
                রিফ্রেশ করুন
              </button>
            )}
          </div>

          {searchedOrders && searchedOrders.length > 0 ? (
            <div className="grid gap-6">
              {searchedOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                        <span className="font-black text-gray-900 text-lg">Order #{order.id.slice(0, 8)}</span>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span>{getStatusText(order.status)}</span>
                        </span>
                      </div>
                      <span className="text-2xl font-black text-[#f85606]">৳{order.total.toFixed(2)}</span>
                    </div>

                    {order.status === 'Invalid Transaction' && (
                      <div className="mb-6 p-5 bg-red-50 border border-red-100 rounded-2xl">
                        <p className="text-sm text-red-700 font-bold mb-4 flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5" />
                          আপনার ট্রানজেকশন আইডিটি সঠিক নয়। অনুগ্রহ করে সঠিক আইডিটি দিয়ে রিপ্লাই করুন।
                        </p>
                        {replyingTo === order.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={newTxid}
                              onChange={(e) => setNewTxid(e.target.value)}
                              placeholder="সঠিক Transaction ID লিখুন"
                              className="w-full px-4 py-3 border-2 border-red-200 rounded-xl focus:ring-2 focus:ring-red-500 outline-none font-mono"
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleReplySubmit(order.id)}
                                disabled={isSubmittingReply}
                                className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 disabled:bg-gray-400 transition-all"
                              >
                                {isSubmittingReply ? 'পাঠানো হচ্ছে...' : 'রিপ্লাই দিন'}
                              </button>
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="bg-gray-200 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-gray-300 transition-all"
                              >
                                বাতিল
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => setReplyingTo(order.id)}
                            className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-red-700 transition-all shadow-sm"
                          >
                            সঠিক ট্রানজেকশন আইডি দিয়ে রিপ্লাই দিন
                          </button>
                        )}
                      </div>
                    )}

                    <div className="space-y-3 mb-6">
                      {order.items.map((item: any, idx: number) => (
                        <div key={idx} className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-100">
                          {item.image_url && (
                            <img src={item.image_url} alt={item.name} className="h-16 w-16 object-cover rounded-xl shadow-sm" referrerPolicy="no-referrer" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                            <p className="text-xs text-gray-500 font-medium">{item.quantity} x ৳{item.price}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex flex-wrap justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-100 gap-4">
                      <div className="flex flex-wrap gap-x-6 gap-y-2">
                        <div className="flex flex-col">
                          <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Date</span>
                          <span className="font-bold text-gray-700">{order.date}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Payment</span>
                          <span className="font-bold text-gray-700 uppercase">{order.paymentMethod}</span>
                        </div>
                        {order.transactionId && (
                          <div className="flex flex-col">
                            <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">TXID</span>
                            <span className="font-mono font-bold text-[#f85606]">{order.transactionId}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-gray-400 uppercase tracking-wider text-[10px] font-bold">Customer</span>
                        <span className="font-bold text-gray-700">{order.customerName}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl shadow-sm border border-gray-100 text-center">
              <div className="bg-gray-50 h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Package className="h-10 w-10 text-gray-300" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">কোনো অর্ডার পাওয়া যায়নি</h3>
              <p className="text-gray-500">আপনার দেওয়া মোবাইল নাম্বারটি সঠিক কি না চেক করুন।</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
