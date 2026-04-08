import React, { createContext, useContext, useState, useEffect } from 'react';
import { CartItem } from './CartContext';
import { supabase } from '../lib/supabase';

export interface Order {
  id: string;
  customerName: string;
  mobileNumber: string;
  district: string;
  thana: string;
  village: string;
  quantity: number;
  paymentMethod: string;
  transactionId?: string;
  items: CartItem[];
  total: number;
  date: string;
  status: 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
}

interface OrderContextType {
  orders: Order[];
  loading: boolean;
  error: string | null;
  addOrder: (order: Omit<Order, 'id' | 'date' | 'status'>) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  refreshOrders: () => Promise<void>;
}

const OrderContext = createContext<OrderContextType | undefined>(undefined);

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch orders and their items
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*, order_items(*)')
        .order('created_at', { ascending: false });

      if (ordersError) throw ordersError;

      if (ordersData) {
        const formattedOrders: Order[] = ordersData.map(o => ({
          id: o.id,
          customerName: o.customer_name,
          mobileNumber: o.mobile_number,
          district: o.district,
          thana: o.thana,
          village: o.village,
          quantity: o.quantity,
          paymentMethod: o.payment_method,
          transactionId: o.transaction_id,
          total: o.total,
          date: o.created_at.split('T')[0],
          status: o.status,
          items: o.order_items.map((item: any) => ({
            id: item.product_id,
            productCode: item.product_code,
            name: item.product_name,
            price: item.price,
            quantity: item.quantity,
            image_url: item.image_url
          }))
        }));
        setOrders(formattedOrders);
      }
    } catch (err: any) {
      console.error('Error fetching orders:', err);
      setError(err.message || 'Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (orderData: Omit<Order, 'id' | 'date' | 'status'>) => {
    try {
      // 1. Insert the order
      const { data: newOrder, error: orderError } = await supabase
        .from('orders')
        .insert([{
          customer_name: orderData.customerName,
          mobile_number: orderData.mobileNumber,
          district: orderData.district,
          thana: orderData.thana,
          village: orderData.village,
          quantity: orderData.quantity,
          payment_method: orderData.paymentMethod,
          transaction_id: orderData.transactionId,
          total: orderData.total,
          status: 'Pending'
        }])
        .select()
        .single();

      if (orderError) throw orderError;
      if (!newOrder) throw new Error('Failed to create order record.');

      // 2. Insert order items
      const orderItems = orderData.items.map(item => ({
        order_id: newOrder.id,
        product_id: item.id,
        product_code: item.productCode || '',
        product_name: item.name,
        price: item.price,
        quantity: item.quantity,
        image_url: item.image_url
      }));

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      await fetchOrders();
    } catch (err: any) {
      console.error('Error adding order:', err);
      throw err;
    }
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;
      await fetchOrders();
    } catch (err: any) {
      console.error('Error updating order status:', err);
      throw err;
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      const { error: deleteError } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (deleteError) throw deleteError;
      await fetchOrders();
    } catch (err: any) {
      console.error('Error deleting order:', err);
      throw err;
    }
  };

  return (
    <OrderContext.Provider value={{ orders, loading, error, addOrder, updateOrderStatus, deleteOrder, refreshOrders: fetchOrders }}>
      {children}
    </OrderContext.Provider>
  );
};

export const useOrders = () => {
  const context = useContext(OrderContext);
  if (context === undefined) {
    throw new Error('useOrders must be used within an OrderProvider');
  }
  return context;
};
