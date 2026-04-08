import React, { useMemo } from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';

export const Dashboard: React.FC = () => {
  const { orders } = useOrders();
  const { products } = useProducts();

  const totalRevenue = useMemo(() => {
    return (orders || []).reduce((sum, order) => {
      // Only count 'Delivered' orders for revenue as requested
      if (order?.status !== 'Delivered') return sum;
      return sum + (Number(order?.total) || 0);
    }, 0);
  }, [orders]);

  const totalOrders = (orders || []).length;
  const totalProducts = (products || []).length;
  const totalItemsSold = useMemo(() => {
    return (orders || []).reduce((sum, order) => {
      // Only count items from 'Delivered' orders
      if (order?.status !== 'Delivered') return sum;
      return sum + (Number(order?.quantity) || 0);
    }, 0);
  }, [orders]);

  // Calculate sales data for the chart based on delivered orders
  const salesData = useMemo(() => {
    const last7Days = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      return d.toISOString().split('T')[0];
    });

    return last7Days.map(date => {
      const dayOrders = (orders || []).filter(o => o?.date === date && o?.status === 'Delivered');
      const sales = dayOrders.reduce((sum, o) => sum + (Number(o?.total) || 0), 0);
      return {
        name: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        sales
      };
    });
  }, [orders]);

  const stats = [
    { name: 'Total Revenue', value: `৳${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, change: 'Delivered Only', positive: true },
    { name: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, change: 'All Time', positive: true },
    { name: 'Items Delivered', value: totalItemsSold.toString(), icon: Package, change: 'Total Units', positive: true },
    { name: 'Avg Order Value', value: totalOrders > 0 ? `৳${(totalRevenue / totalOrders).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '৳0.00', icon: TrendingUp, change: 'Delivered Avg', positive: true },
  ];

  const handleClearAllData = () => {
    if (window.confirm('Are you sure you want to clear all data? This will delete all products, orders, and cart items to free up space.')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Dashboard Overview</h1>
          <p className="text-slate-500 text-sm">Welcome back! Here's what's happening with your store.</p>
        </div>
        <button 
          onClick={handleClearAllData}
          className="text-xs font-bold bg-white text-red-600 px-4 py-2 rounded-xl hover:bg-red-50 transition-all border border-red-100 shadow-sm flex items-center gap-2"
        >
          <Package className="h-3.5 w-3.5" />
          Clear All Data
        </button>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div key={item.name} className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-4">
              <div className="bg-slate-50 p-3 rounded-2xl">
                <item.icon className="h-6 w-6 text-slate-600" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                {item.change}
              </span>
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">{item.name}</p>
              <h3 className="text-2xl font-extrabold text-slate-900">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-slate-900">Revenue Analytics</h2>
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-emerald-500"></div>
              <span className="text-xs font-bold text-slate-500">Sales (Last 7 Days)</span>
            </div>
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                    padding: '12px'
                  }}
                  itemStyle={{ fontWeight: 'bold', color: '#0f172a' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  strokeWidth={4} 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Store Stats</h2>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <Package className="h-5 w-5 text-slate-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">Total Products</span>
              </div>
              <span className="text-lg font-extrabold text-slate-900">{totalProducts}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-xl shadow-sm">
                  <ShoppingBag className="h-5 w-5 text-slate-600" />
                </div>
                <span className="text-sm font-bold text-slate-700">Active Orders</span>
              </div>
              <span className="text-lg font-extrabold text-slate-900">
                {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length}
              </span>
            </div>

            <div className="pt-4">
              <div className="flex justify-between text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">
                <span>Inventory Health</span>
                <span>{totalProducts > 0 ? 'Good' : 'N/A'}</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[85%] rounded-full"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
