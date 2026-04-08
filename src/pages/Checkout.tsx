import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useOrders } from '../context/OrderContext';
import { CheckCircle, CreditCard, Smartphone, X, Loader2, AlertTriangle } from 'lucide-react';

export const Checkout: React.FC = () => {
  const { cart, totalPrice, totalItems, clearCart } = useCart();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showPaymentGateway, setShowPaymentGateway] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'initial' | 'processing' | 'success'>('initial');

  const [formData, setFormData] = useState({
    customerName: '',
    mobileNumber: '',
    district: '',
    thana: '',
    village: '',
    paymentMethod: 'cod',
    transactionId: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const [error, setError] = useState<string | null>(null);

  const processOrder = async () => {
    setError(null);
    try {
      await addOrder({
        customerName: formData.customerName,
        mobileNumber: formData.mobileNumber,
        district: formData.district,
        thana: formData.thana,
        village: formData.village,
        quantity: totalItems,
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId,
        items: cart,
        total: totalPrice,
      });
      setIsSubmitting(false);
      setIsSuccess(true);
      clearCart();
    } catch (err: any) {
      console.error('Failed to place order:', err);
      setError(err.message || 'অর্ডার দিতে সমস্যা হয়েছে। অনুগ্রহ করে আপনার ইন্টারনেট কানেকশন চেক করুন এবং আবার চেষ্টা করুন।');
      setIsSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.paymentMethod === 'cod') {
      setIsSubmitting(true);
      await processOrder();
    } else if (formData.paymentMethod === 'bkash') {
      setShowPaymentGateway(true);
      setPaymentStep('initial');
    } else {
      // For SSLCommerz or others
      setShowPaymentGateway(true);
      setPaymentStep('initial');
    }
  };

  const handleSimulatePayment = async () => {
    if (formData.paymentMethod === 'bkash' && !formData.transactionId) {
      alert('Please enter your Transaction ID');
      return;
    }

    setPaymentStep('processing');
    
    // Simulate a brief processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setPaymentStep('success');
    
    // Brief delay to show success state before processing order
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setShowPaymentGateway(false);
    await processOrder();
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
        <div className="bg-green-100 p-6 rounded-full mb-6">
          <CheckCircle className="h-16 w-16 text-green-600" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Order Placed Successfully!</h2>
        <p className="text-gray-600 mb-8 max-w-md">
          {formData.paymentMethod === 'bkash' 
            ? "আপনার অর্ডারটি পেন্ডিং অবস্থায় আছে। আমরা আপনার ট্রানজেকশন আইডি যাচাই করে অর্ডারটি কনফার্ম করবো।"
            : "আপনার অর্ডারটি সফলভাবে গ্রহণ করা হয়েছে। শীঘ্রই আমাদের প্রতিনিধি আপনার সাথে যোগাযোগ করবেন।"}
        </p>
        <button
          onClick={() => navigate('/')}
          className="bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-all shadow-lg hover:shadow-emerald-200 hover:-translate-y-1"
        >
          Continue Shopping
        </button>
      </div>
    );
  }

  if (cart.length === 0) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-8 relative pb-20">
      {/* Payment Gateway Modal */}
      {showPaymentGateway && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-300">
            <div className={`p-4 flex justify-between items-center text-white ${formData.paymentMethod === 'bkash' ? 'bg-pink-600' : 'bg-indigo-600'}`}>
              <div className="flex items-center gap-2 font-bold text-lg">
                {formData.paymentMethod === 'bkash' ? <Smartphone className="h-5 w-5" /> : <CreditCard className="h-5 w-5" />}
                {formData.paymentMethod === 'bkash' ? 'bKash Payment' : 'SSLCommerz Secure Pay'}
              </div>
              {paymentStep === 'initial' && (
                <button onClick={() => setShowPaymentGateway(false)} className="text-white/80 hover:text-white transition-colors">
                  <X className="h-6 w-6" />
                </button>
              )}
            </div>
            
            <div className="p-8 flex flex-col items-center text-center">
              {paymentStep === 'initial' && (
                <>
                  <div className="text-gray-500 mb-2">Total Amount</div>
                  <div className="text-4xl font-extrabold text-gray-900 mb-6">৳{totalPrice.toFixed(2)}</div>
                  
                  <div className="w-full space-y-4">
                    {formData.paymentMethod === 'bkash' ? (
                      <div className="text-left bg-pink-50 p-4 rounded-xl border border-pink-100">
                        <h4 className="font-bold text-pink-700 mb-2">Payment Instructions:</h4>
                        <ol className="text-sm text-pink-800 space-y-2 list-decimal ml-4">
                          <li>আপনার বিকাশ অ্যাপ থেকে <strong>01816600419</strong> নাম্বারে <strong>Send Money</strong> করুন।</li>
                          <li>টাকা পাঠানোর পর বিকাশ থেকে প্রাপ্ত <strong>Transaction ID</strong> টি নিচের বক্সে লিখুন।</li>
                        </ol>
                        <div className="mt-6">
                          <label className="block text-xs font-bold text-pink-600 uppercase mb-1">Transaction ID</label>
                          <input 
                            type="text" 
                            name="transactionId"
                            value={formData.transactionId}
                            onChange={handleChange}
                            placeholder="e.g. 8N7A6D5C" 
                            className="w-full px-4 py-3 border-2 border-pink-200 rounded-lg text-center text-lg font-mono focus:ring-2 focus:ring-pink-500 focus:border-pink-500 outline-none" 
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <input type="text" placeholder="Card Number" className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" defaultValue="4242 4242 4242 4242" />
                        <div className="flex gap-3">
                          <input type="text" placeholder="MM/YY" className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" defaultValue="12/28" />
                          <input type="text" placeholder="CVC" className="w-1/2 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none" defaultValue="123" />
                        </div>
                      </div>
                    )}
                    
                    <button 
                      onClick={handleSimulatePayment}
                      className={`w-full py-4 rounded-xl font-bold text-white text-lg mt-4 transition-all shadow-lg hover:shadow-xl ${formData.paymentMethod === 'bkash' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                    >
                      {formData.paymentMethod === 'bkash' ? 'Confirm Order' : 'Confirm Payment'}
                    </button>
                  </div>
                </>
              )}
              
              {paymentStep === 'processing' && (
                <div className="py-12 flex flex-col items-center">
                  <Loader2 className={`h-16 w-16 animate-spin mb-4 ${formData.paymentMethod === 'bkash' ? 'text-pink-600' : 'text-indigo-600'}`} />
                  <h3 className="text-xl font-bold text-gray-900">Verifying...</h3>
                  <p className="text-gray-500 mt-2">Please wait while we process your request</p>
                </div>
              )}
              
              {paymentStep === 'success' && (
                <div className="py-12 flex flex-col items-center">
                  <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">Request Received!</h3>
                  <p className="text-gray-500 mt-2">Redirecting to confirmation...</p>
                </div>
              )}
            </div>
            
            <div className="bg-gray-50 p-4 text-center text-xs text-gray-400 border-t border-gray-100">
              {formData.paymentMethod === 'bkash' ? 'Secure Payment via bKash' : 'Secured by SSLCommerz'}
            </div>
          </div>
        </div>
      )}

      <div className="md:col-span-7">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Checkout Details</h2>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-2xl text-sm flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-300">
            <AlertTriangle className="h-5 w-5 flex-shrink-0" />
            <div>
              <p className="font-bold">Error Occurred:</p>
              <p>{error}</p>
              <p className="mt-1 text-xs opacity-80">টিপস: আপনার Supabase Anon Key এবং টেবিলগুলো ঠিক আছে কি না চেক করুন।</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 md:p-8 rounded-3xl shadow-sm border border-gray-100">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">নাম (Name)</label>
              <input
                required
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleChange}
                placeholder="আপনার পূর্ণ নাম লিখুন"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">জেলা (District)</label>
                <input
                  required
                  type="text"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  placeholder="জেলার নাম"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">থানা (Thana)</label>
                <input
                  required
                  type="text"
                  name="thana"
                  value={formData.thana}
                  onChange={handleChange}
                  placeholder="থানার নাম"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1.5">গ্রাম/রাস্তা/বাসা (Village/Road/House)</label>
              <input
                required
                type="text"
                name="village"
                value={formData.village}
                onChange={handleChange}
                placeholder="বিস্তারিত ঠিকানা লিখুন"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1.5">মোবাইল নাম্বার (Mobile Number)</label>
                <input
                  required
                  type="tel"
                  name="mobileNumber"
                  value={formData.mobileNumber}
                  onChange={handleChange}
                  placeholder="01XXXXXXXXX"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none transition-all"
                />
              </div>
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100">
            <h3 className="text-lg font-bold text-gray-900 mb-4">পেমেন্ট পদ্ধতি (Payment Method)</h3>
            <div className="grid grid-cols-1 gap-3">
              <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'cod' ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="cod"
                  checked={formData.paymentMethod === 'cod'}
                  onChange={handleChange}
                  className="h-5 w-5 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                />
                <div className="ml-4">
                  <span className="block font-bold text-gray-900">Cash on Delivery</span>
                  <span className="text-xs text-gray-500">পণ্য হাতে পেয়ে টাকা পরিশোধ করুন</span>
                </div>
              </label>
              
              <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'bkash' ? 'border-pink-500 bg-pink-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="bkash"
                  checked={formData.paymentMethod === 'bkash'}
                  onChange={handleChange}
                  className="h-5 w-5 text-pink-600 focus:ring-pink-500 border-gray-300"
                />
                <div className="ml-4">
                  <span className="block font-bold text-gray-900">bKash (বিকাশ)</span>
                  <span className="text-xs text-gray-500">বিকাশ পেমেন্ট করে ট্রানজেকশন আইডি দিন</span>
                </div>
              </label>

              <label className={`flex items-center p-4 border-2 rounded-2xl cursor-pointer transition-all ${formData.paymentMethod === 'sslcommerz' ? 'border-indigo-500 bg-indigo-50' : 'border-gray-100 hover:border-gray-200'}`}>
                <input
                  type="radio"
                  name="paymentMethod"
                  value="sslcommerz"
                  checked={formData.paymentMethod === 'sslcommerz'}
                  onChange={handleChange}
                  className="h-5 w-5 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                />
                <div className="ml-4">
                  <span className="block font-bold text-gray-900">SSLCommerz</span>
                  <span className="text-xs text-gray-500">Cards, Net Banking, Mobile Banking</span>
                </div>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-2xl font-bold text-white text-xl transition-all shadow-xl hover:-translate-y-1 ${
              isSubmitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-slate-900 hover:bg-emerald-600'
            }`}
          >
            {isSubmitting ? 'প্রসেসিং হচ্ছে...' : `অর্ডার কনফার্ম করুন (৳${totalPrice.toFixed(2)})`}
          </button>
        </form>
      </div>

      <div className="md:col-span-5">
        <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 sticky top-24">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Order Summary</h3>
          <ul className="divide-y divide-gray-200 mb-4">
            {cart.map((item) => (
              <li key={item.id} className="py-3 flex justify-between">
                <div className="flex items-center">
                  <span className="text-gray-600">{item.quantity}x</span>
                  <span className="ml-2 text-gray-900 font-medium truncate max-w-[150px]">{item.name}</span>
                </div>
                <span className="text-gray-900 font-medium">
                  ৳{(item.price * (1 - item.discount / 100) * item.quantity).toFixed(2)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-t border-gray-200 pt-4 space-y-2">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>৳{totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="flex justify-between text-xl font-bold text-gray-900 pt-2 border-t border-gray-200">
              <span>Total</span>
              <span>৳{totalPrice.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
