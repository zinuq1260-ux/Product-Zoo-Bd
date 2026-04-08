import React, { useMemo } from 'react';
import { DollarSign, ShoppingBag, Package, TrendingUp, AlertTriangle, ArrowUpRight, Activity } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useOrders } from '../../context/OrderContext';
import { useProducts } from '../../context/ProductContext';

export const Dashboard: React.FC = () => {
  const { orders } = useOrders();
  const { products, loading, error: productsError } = useProducts();

  const totalRevenue = useMemo(() => {
    return (orders || []).reduce((sum, order) => {
      if (order?.status !== 'Delivered') return sum;
      return sum + (Number(order?.total) || 0);
    }, 0);
  }, [orders]);

  const totalOrders = (orders || []).length;
  const totalProducts = (products || []).length;
  const totalItemsSold = useMemo(() => {
    return (orders || []).reduce((sum, order) => {
      if (order?.status !== 'Delivered') return sum;
      return sum + (Number(order?.quantity) || 0);
    }, 0);
  }, [orders]);

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
    { name: 'Total Revenue', value: `৳${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, icon: DollarSign, change: 'Delivered Only', color: 'from-emerald-500 to-teal-400', lightColor: 'bg-emerald-50 text-emerald-600' },
    { name: 'Total Orders', value: totalOrders.toString(), icon: ShoppingBag, change: 'All Time', color: 'from-indigo-500 to-blue-400', lightColor: 'bg-indigo-50 text-indigo-600' },
    { name: 'Items Delivered', value: totalItemsSold.toString(), icon: Package, change: 'Total Units', color: 'from-amber-500 to-orange-400', lightColor: 'bg-amber-50 text-amber-600' },
    { name: 'Avg Order Value', value: totalOrders > 0 ? `৳${(totalRevenue / totalOrders).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '৳0.00', icon: TrendingUp, change: 'Delivered Avg', color: 'from-pink-500 to-rose-400', lightColor: 'bg-pink-50 text-pink-600' },
  ];

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {productsError && (
        <div className="p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm flex items-center gap-2 shadow-sm">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <span className="font-medium">{productsError}</span>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            Dashboard Overview
            <span className="inline-flex items-center justify-center px-2 py-1 bg-indigo-100 text-indigo-700 text-xs font-bold rounded-lg uppercase tracking-wider">Live</span>
          </h1>
          <p className="text-slate-500 font-medium mt-1">Welcome back! Here's what's happening with your store today.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item, idx) => (
          <div key={item.name} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-lg transition-all hover:-translate-y-1 group relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110`}></div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <div className={`${item.lightColor} p-3.5 rounded-2xl shadow-sm`}>
                <item.icon className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg border border-slate-200">
                {item.change}
              </span>
            </div>
            <div className="relative z-10">
              <p className="text-sm font-bold text-slate-500 mb-1">{item.name}</p>
              <h3 className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <Activity className="h-5 w-5 text-indigo-500" /> Revenue Analytics
              </h2>
              <p className="text-sm text-slate-500 font-medium mt-1">Sales performance over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <div className="h-2.5 w-2.5 rounded-full bg-indigo-500 animate-pulse"></div>
              <span className="text-xs font-bold text-slate-600">Live Data</span>
            </div>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={salesData}
                margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
              >
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="name" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fill: '#64748b', fontSize: 12, fontWeight: 600 }} 
                />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: '1px solid #e2e8f0', 
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
                    padding: '12px 16px',
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(4px)'
                  }}
                  itemStyle={{ fontWeight: '900', color: '#0f172a', fontSize: '16px' }}
                  labelStyle={{ color: '#64748b', fontWeight: '600', marginBottom: '4px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="sales" 
                  stroke="#6366f1" 
                  fillOpacity={1} 
                  fill="url(#colorSales)" 
                  strokeWidth={4} 
                  activeDot={{ r: 6, strokeWidth: 0, fill: '#4f46e5' }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 flex flex-col">
          <h2 className="text-xl font-extrabold text-slate-900 mb-6 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" /> Store Stats
          </h2>
          <div className="space-y-4 flex-1">
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <Package className="h-6 w-6 text-indigo-600" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-500">Total Products</span>
                  <span className="block text-xl font-black text-slate-900">{totalProducts}</span>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-300" />
            </div>
            
            <div className="flex items-center justify-between p-5 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-colors">
              <div className="flex items-center gap-4">
                <div className="bg-white p-3 rounded-xl shadow-sm border border-slate-100">
                  <ShoppingBag className="h-6 w-6 text-emerald-600" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-slate-500">Active Orders</span>
                  <span className="block text-xl font-black text-slate-900">
                    {orders.filter(o => o.status !== 'Delivered' && o.status !== 'Cancelled').length}
                  </span>
                </div>
              </div>
              <ArrowUpRight className="h-5 w-5 text-slate-300" />
            </div>

            <div className="pt-6 mt-auto">
              <div className="flex justify-between text-xs font-bold text-slate-500 uppercase tracking-widest mb-3">
                <span>Inventory Health</span>
                <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">{totalProducts > 0 ? 'Good' : 'N/A'}</span>
              </div>
              <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                <div className="bg-gradient-to-r from-emerald-400 to-emerald-500 h-full w-[85%] rounded-full relative">
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
