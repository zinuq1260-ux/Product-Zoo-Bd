import React from 'react';
import { Package, Clock, CheckCircle, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Login } from '../components/Login';
import { auth, signOut } from '../firebase';

export const Profile: React.FC = () => {
  const { user, loading } = useAuth();

  // Mock order history
  const orders = [
    {
      id: 'ORD-2026-001',
      date: '2026-04-01',
      total: 349.99,
      status: 'Delivered',
      items: 2,
    },
    {
      id: 'ORD-2026-045',
      date: '2026-04-05',
      total: 125.00,
      status: 'Processing',
      items: 1,
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'Processing': return <Clock className="h-5 w-5 text-yellow-500" />;
      default: return <Package className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Error signing out', error);
    }
  };

  if (loading) {
    return <div className="text-center py-10">Loading...</div>;
  }

  if (!user) {
    return <Login />;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-0 mt-8">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden mb-8">
        <div className="p-6 sm:p-8 border-b border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-6">
            {user.photoURL ? (
              <img src={user.photoURL} alt="Profile" className="h-24 w-24 rounded-full border-4 border-indigo-50" referrerPolicy="no-referrer" />
            ) : (
              <div className="h-24 w-24 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-3xl font-bold">
                {user.email?.charAt(0).toUpperCase() || 'U'}
              </div>
            )}
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.displayName || 'User'}</h1>
              <p className="text-gray-500">{user.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium hover:bg-red-100 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </button>
        </div>
      </div>

      <h2 className="text-xl font-bold text-gray-900 mb-4">Order History</h2>
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        {orders.length > 0 ? (
          <ul className="divide-y divide-gray-200">
            {orders.map((order) => (
              <li key={order.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-gray-900">{order.id}</span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="ml-1">{order.status}</span>
                    </span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">৳{order.total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Ordered on {order.date}</span>
                  <span>{order.items} item(s)</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-8 text-center text-gray-500">
            You haven't placed any orders yet.
          </div>
        )}
      </div>
    </div>
  );
};
