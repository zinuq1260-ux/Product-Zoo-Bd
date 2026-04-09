import React, { useState } from 'react';
import { Package, Clock, CheckCircle, AlertCircle, AlertTriangle, LogOut } from 'lucide-react';
import { useOrders } from '../context/OrderContext';
import { useAuth } from '../context/AuthContext';
import { Login } from '../components/Login';

export const Profile: React.FC = () => {
  const { orders, loading: ordersLoading, updateOrderReply } = useOrders();
  const { user, logout } = useAuth();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [newTxid, setNewTxid] = useState('');
  const [isSubmittingReply, setIsSubmittingReply] = useState(false);

  if (!user) {
    return <Login />;
  }

  // Filter orders for the current user
  const userOrders = orders.filter(order => order.mobileNumber === user.phoneNumber);

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
    <div className="max-w-4xl mx-auto px-4 sm:px-0 mt-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Order History for {user.name} ({user.phoneNumber})</h2>
        <button onClick={logout} className="flex items-center gap-2 text-red-600 font-bold hover:text-red-700">
          <LogOut className="h-5 w-5" /> Logout
        </button>
      </div>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {ordersLoading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f85606] mx-auto"></div>
            <p className="mt-4 text-gray-500">Loading your orders...</p>
          </div>
        ) : userOrders.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {userOrders.map((order) => (
              <li key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                    <span className="font-bold text-gray-900">Order #{order.id.slice(0, 8)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 w-fit ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span>{getStatusText(order.status)}</span>
                    </span>
                  </div>
                  <span className="text-xl font-black text-gray-900">৳{order.total.toFixed(2)}</span>
                </div>
                
                {order.status === 'Invalid Transaction' && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
                    <p className="text-sm text-red-700 font-bold mb-3 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      আপনার ট্রানজেকশন আইডিটি সঠিক নয়। অনুগ্রহ করে সঠিক আইডিটি দিয়ে রিপ্লাই করুন।
                    </p>
                    {replyingTo === order.id ? (
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={newTxid}
                          onChange={(e) => setNewTxid(e.target.value)}
                          placeholder="সঠিক Transaction ID লিখুন"
                          className="w-full px-4 py-2 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleReplySubmit(order.id)}
                            disabled={isSubmittingReply}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 disabled:bg-gray-400"
                          >
                            {isSubmittingReply ? 'পাঠানো হচ্ছে...' : 'রিপ্লাই দিন'}
                          </button>
                          <button
                            onClick={() => setReplyingTo(null)}
                            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-bold hover:bg-gray-300"
                          >
                            বাতিল
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(order.id)}
                        className="text-red-600 text-sm font-bold underline hover:text-red-700"
                      >
                        সঠিক ট্রানজেকশন আইডি দিয়ে রিপ্লাই দিন
                      </button>
                    )}
                  </div>
                )}
                
                <div className="space-y-3">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                      {item.image_url && (
                        <img src={item.image_url} alt={item.name} className="h-12 w-12 object-cover rounded-md" referrerPolicy="no-referrer" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">{item.quantity} x ৳{item.price}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap justify-between items-center text-xs text-gray-500 pt-4 border-t border-gray-100 gap-2">
                  <div className="flex gap-4">
                    <span>Ordered on: <span className="font-bold text-gray-700">{order.date}</span></span>
                    <span>Payment: <span className="font-bold text-gray-700 uppercase">{order.paymentMethod}</span></span>
                  </div>
                  {order.transactionId && (
                    <span className="bg-gray-100 px-2 py-1 rounded font-mono">TXID: {order.transactionId}</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-12 text-center flex flex-col items-center">
            <Package className="h-12 w-12 text-gray-300 mb-4" />
            <p className="text-gray-500 font-medium">You haven't placed any orders yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};
