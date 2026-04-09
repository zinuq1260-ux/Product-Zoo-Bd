import React from 'react';
import { Eye, AlertTriangle, Loader2 } from 'lucide-react';
import { useOrders, Order } from '../../context/OrderContext';

export const OrderManagement: React.FC = () => {
  const { orders, loading, error, updateOrderStatus } = useOrders();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Delivered': return 'bg-green-100 text-green-800';
      case 'Received': return 'bg-emerald-100 text-emerald-800';
      case 'Processing': return 'bg-yellow-100 text-yellow-800';
      case 'Shipped': return 'bg-blue-100 text-blue-800';
      case 'Pending': return 'bg-orange-100 text-orange-800';
      case 'Invalid Transaction': return 'bg-red-100 text-red-800';
      case 'Cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <Loader2 className="h-12 w-12 animate-spin text-slate-900" />
        <p className="text-gray-500 font-medium">Loading orders...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Order Management</h2>
        {loading && <Loader2 className="h-5 w-5 animate-spin text-slate-900" />}
      </div>

      {error && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="bg-white shadow-sm rounded-2xl border border-gray-100 overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <p className="text-lg font-medium">No orders found yet.</p>
            <p className="text-sm">New orders will appear here as they are placed.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID & Date</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer & Contact</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Payment Info</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order Details</th>
                  <th className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">{order.id}</div>
                      <div className="text-xs text-gray-500">{order.date}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{order.customerName}</div>
                      <div className="text-xs text-emerald-600 font-bold">{order.mobileNumber}</div>
                      <div className="text-[10px] text-gray-400 truncate max-w-[150px]">{order.village}, {order.thana}, {order.district}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full w-fit mb-1 ${
                          order.paymentMethod === 'bkash' ? 'bg-pink-100 text-pink-700' : 
                          order.paymentMethod === 'cod' ? 'bg-emerald-100 text-emerald-700' : 
                          'bg-indigo-100 text-indigo-700'
                        }`}>
                          {order.paymentMethod === 'bkash' ? 'bKash' : order.paymentMethod === 'cod' ? 'COD' : 'SSLCommerz'}
                        </span>
                        {order.transactionId && (
                          <div className="text-xs font-mono bg-gray-100 px-2 py-1 rounded border border-gray-200 text-gray-700">
                            TXID: {order.transactionId}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-gray-900">৳{order.total.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{order.quantity} items</div>
                      <div className="mt-1 space-y-1">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="text-[10px] text-slate-600 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 flex justify-between">
                            <span>{item.name}</span>
                            <span className="font-bold text-slate-900 ml-2">Code: {item.productCode || 'N/A'}</span>
                          </div>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <select 
                        className={`text-xs font-bold rounded-xl px-3 py-1.5 border-none focus:ring-2 focus:ring-slate-200 cursor-pointer transition-all ${getStatusColor(order.status)}`}
                        value={order.status}
                        onChange={async (e) => {
                          try {
                            await updateOrderStatus(order.id, e.target.value as Order['status']);
                          } catch (err: any) {
                            alert(`Failed to update status: ${err.message}`);
                          }
                        }}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Received">Received (পেমেন্ট পেয়েছি)</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Invalid Transaction">Invalid Transaction (ভুল ট্রানজেকশন)</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="p-2 text-gray-400 hover:text-slate-900 transition-colors">
                        <Eye className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
