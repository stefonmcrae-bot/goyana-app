import React, { useState, useMemo } from 'react';
import { Navigation, MapPin, Phone, MessageSquare, CheckCircle2, X, Clock, Package, DollarSign, Camera, Menu, Settings, User, LogOut, TrendingUp, Star, ChevronRight, AlertCircle, Truck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
type OrderStatus = 'pending' | 'accepted' | 'picked_up' | 'delivered';
interface Order {
  id: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  area: string;
  items: {
    name: string;
    quantity: number;
  }[];
  itemCount: number;
  orderTotal: number;
  deliveryFee: number;
  status: OrderStatus;
  storeName: string;
  storeAddress: string;
  estimatedTime: string;
  distance: string;
  specialInstructions?: string;
  paymentMethod: 'cash' | 'mmg' | 'card';
}
interface DriverStats {
  todayEarnings: number;
  weekEarnings: number;
  todayDeliveries: number;
  weekDeliveries: number;
  rating: number;
  completionRate: number;
}
type AppScreen = 'home' | 'active' | 'stats' | 'profile';

// Mock data
const MOCK_ORDERS: Order[] = [{
  id: 'ORD-1001',
  customerName: 'Johnathan Persaud',
  customerPhone: '+592 612-3456',
  deliveryAddress: '24 Brickdam Street',
  area: 'Georgetown',
  items: [{
    name: 'Premium Jasmine Rice',
    quantity: 1
  }, {
    name: 'Whole Milk',
    quantity: 2
  }, {
    name: 'Local Eggs',
    quantity: 1
  }],
  itemCount: 4,
  orderTotal: 4250,
  deliveryFee: 500,
  status: 'pending',
  storeName: 'Bounty Supermarket',
  storeAddress: '10 Robb Street',
  estimatedTime: '15 mins',
  distance: '2.3 km',
  specialInstructions: 'Call on arrival. Gate is usually locked.',
  paymentMethod: 'cash'
}, {
  id: 'ORD-1002',
  customerName: 'Sarah Johnson',
  customerPhone: '+592 623-7890',
  deliveryAddress: '5 Lamaha Street',
  area: 'Kitty',
  items: [{
    name: 'Paracetamol 500mg',
    quantity: 2
  }, {
    name: 'Vicks Vaporub',
    quantity: 1
  }],
  itemCount: 3,
  orderTotal: 1800,
  deliveryFee: 300,
  status: 'pending',
  storeName: 'Survival Pharmacy',
  storeAddress: '15 Regent Street',
  estimatedTime: '10 mins',
  distance: '1.5 km',
  paymentMethod: 'cash'
}, {
  id: 'ORD-1003',
  customerName: 'Michael Chen',
  customerPhone: '+592 634-5678',
  deliveryAddress: '10 Waterloo Street',
  area: 'Alberttown',
  items: [{
    name: 'Organic Bananas',
    quantity: 2
  }, {
    name: 'Fresh Vegetables',
    quantity: 1
  }],
  itemCount: 3,
  orderTotal: 2100,
  deliveryFee: 450,
  status: 'pending',
  storeName: 'Stabroek Market',
  storeAddress: 'Water Street',
  estimatedTime: '20 mins',
  distance: '3.1 km',
  specialInstructions: 'Leave at door if not home',
  paymentMethod: 'cash'
}];
const INITIAL_STATS: DriverStats = {
  todayEarnings: 2450,
  weekEarnings: 18750,
  todayDeliveries: 8,
  weekDeliveries: 42,
  rating: 4.9,
  completionRate: 98
};
const formatCurrency = (amount: number) => `GYD $${amount.toLocaleString()}`;
const StatusBadge = ({
  status
}: {
  status: OrderStatus;
}) => {
  const config = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'New Order'
    },
    accepted: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      label: 'Accepted'
    },
    picked_up: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      label: 'Picked Up'
    },
    delivered: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Delivered'
    }
  };
  const {
    bg,
    text,
    label
  } = config[status];
  return <span className={`${bg} ${text} px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
      {label}
    </span>;
};

// @component: GoYanaDriverApp
export const GoYanaDriverApp = () => {
  const [activeScreen, setActiveScreen] = useState<AppScreen>('home');
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [activeOrder, setActiveOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [isOnline, setIsOnline] = useState(true);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [stats, setStats] = useState<DriverStats>(INITIAL_STATS);
  const availableOrders = useMemo(() => orders.filter(o => o.status === 'pending'), [orders]);
  const activeOrders = useMemo(() => orders.filter(o => o.status === 'accepted' || o.status === 'picked_up'), [orders]);
  const completedOrders = useMemo(() => orders.filter(o => o.status === 'delivered'), [orders]);
  const handleAcceptOrder = (order: Order) => {
    setOrders(prev => prev.map(o => o.id === order.id ? {
      ...o,
      status: 'accepted'
    } : o));
    setActiveOrder(order);
    setShowOrderDetail(false);
    setActiveScreen('active');
  };
  const handlePickup = () => {
    if (activeOrder) {
      setOrders(prev => prev.map(o => o.id === activeOrder.id ? {
        ...o,
        status: 'picked_up'
      } : o));
      setActiveOrder({
        ...activeOrder,
        status: 'picked_up'
      });
    }
  };
  const handleDeliver = () => {
    if (activeOrder) {
      setOrders(prev => prev.map(o => o.id === activeOrder.id ? {
        ...o,
        status: 'delivered'
      } : o));
      setStats(prev => ({
        ...prev,
        todayEarnings: prev.todayEarnings + activeOrder.deliveryFee,
        todayDeliveries: prev.todayDeliveries + 1
      }));
      setActiveOrder(null);
      setActiveScreen('home');
    }
  };
  const handleDeclineOrder = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setShowOrderDetail(false);
  };
  return <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 bg-green-600 text-white sticky top-0 z-30 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <Truck size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">GoYana Driver</h1>
              <p className="text-xs text-green-100 font-medium">Deliver & Earn</p>
            </div>
          </div>

          <button onClick={() => setIsOnline(!isOnline)} className={`px-4 py-2 rounded-full font-bold text-sm transition-all ${isOnline ? 'bg-white text-green-600 shadow-lg' : 'bg-white/20 text-white border-2 border-white/50'}`}>
            {isOnline ? '● Online' : '○ Offline'}
          </button>
        </div>

        {/* Quick Stats Bar */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
            <p className="text-[10px] text-green-100 font-medium uppercase tracking-wider">Today</p>
            <p className="text-lg font-black">{formatCurrency(stats.todayEarnings)}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
            <p className="text-[10px] text-green-100 font-medium uppercase tracking-wider">Deliveries</p>
            <p className="text-lg font-black">{stats.todayDeliveries}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-3 rounded-2xl">
            <p className="text-[10px] text-green-100 font-medium uppercase tracking-wider">Rating</p>
            <p className="text-lg font-black flex items-center">
              <Star size={16} className="mr-1 fill-yellow-400 text-yellow-400" />
              {stats.rating}
            </p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 px-6 py-6">
        {/* Home Screen - Available Orders */}
        {activeScreen === 'home' && <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Available Orders</h2>
              {!isOnline && <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-1 rounded-full">
                  <AlertCircle size={14} />
                  <span className="text-xs font-bold">You're Offline</span>
                </div>}
            </div>

            {!isOnline && <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 text-center">
                <p className="text-sm font-bold text-yellow-800 mb-2">Go Online to Accept Orders</p>
                <button onClick={() => setIsOnline(true)} className="bg-green-600 text-white px-6 py-2 rounded-xl font-bold text-sm">
                  Go Online
                </button>
              </div>}

            {isOnline && availableOrders.length === 0 && <div className="text-center py-16 space-y-3">
                <Package size={64} className="mx-auto text-gray-300" />
                <p className="font-bold text-lg text-gray-400">No orders available</p>
                <p className="text-sm text-gray-400">New orders will appear here</p>
              </div>}

            {isOnline && availableOrders.map(order => <motion.div key={order.id} initial={{
          opacity: 0,
          y: 20
        }} animate={{
          opacity: 1,
          y: 0
        }} className="bg-white p-4 rounded-3xl border-2 border-green-200 shadow-md">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-gray-500 font-bold">{order.id}</p>
                      <h3 className="text-lg font-bold">{order.storeName}</h3>
                      <p className="text-sm text-gray-600">{order.storeAddress}</p>
                    </div>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="bg-gray-50 rounded-2xl p-3 mb-3">
                    <div className="flex items-center text-sm space-x-2 mb-1">
                      <MapPin size={14} className="text-green-600" />
                      <span className="font-bold">{order.customerName}</span>
                    </div>
                    <p className="text-xs text-gray-600 ml-5">{order.deliveryAddress}</p>
                    <p className="text-xs text-gray-500 ml-5">{order.area}</p>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center text-gray-600">
                        <Package size={14} className="mr-1" />
                        <span className="font-bold">{order.itemCount} items</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Navigation size={14} className="mr-1" />
                        <span className="font-bold">{order.distance}</span>
                      </div>
                      <div className="flex items-center text-gray-600">
                        <Clock size={14} className="mr-1" />
                        <span className="font-bold">{order.estimatedTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500">You'll earn</p>
                      <p className="text-xl font-black text-green-600">{formatCurrency(order.deliveryFee)}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => {
                setActiveOrder(order);
                setShowOrderDetail(true);
              }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-bold text-sm">
                        Details
                      </button>
                      <button onClick={() => handleAcceptOrder(order)} className="px-6 py-2 bg-green-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-green-200">
                        Accept
                      </button>
                    </div>
                  </div>
                </motion.div>)}
          </div>}

        {/* Active Screen - Current Delivery */}
        {activeScreen === 'active' && <div className="space-y-6">
            <h2 className="text-xl font-bold">Active Delivery</h2>

            {activeOrders.length === 0 && !activeOrder && <div className="text-center py-16 space-y-3">
                <Truck size={64} className="mx-auto text-gray-300" />
                <p className="font-bold text-lg text-gray-400">No active deliveries</p>
                <button onClick={() => setActiveScreen('home')} className="text-green-600 font-bold underline">
                  View available orders
                </button>
              </div>}

            {activeOrder && <div className="space-y-4">
                <div className="bg-white p-5 rounded-3xl border-2 border-green-200 shadow-lg">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <p className="text-xs text-gray-500 font-bold">{activeOrder.id}</p>
                      <h3 className="text-xl font-bold">{activeOrder.customerName}</h3>
                    </div>
                    <StatusBadge status={activeOrder.status} />
                  </div>

                  {/* Progress Steps */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeOrder.status === 'picked_up' || activeOrder.status === 'delivered' ? 'bg-green-600 text-white' : 'bg-green-200 text-green-700'}`}>
                          {activeOrder.status === 'picked_up' || activeOrder.status === 'delivered' ? <CheckCircle2 size={16} /> : '1'}
                        </div>
                        <div className="ml-3">
                          <p className="font-bold text-sm">Pick up from store</p>
                          <p className="text-xs text-gray-500">{activeOrder.storeName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 border-l-2 border-gray-200 h-8" />

                    <div className="flex items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${activeOrder.status === 'delivered' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                        {activeOrder.status === 'delivered' ? <CheckCircle2 size={16} /> : '2'}
                      </div>
                      <div className="ml-3">
                        <p className="font-bold text-sm">Deliver to customer</p>
                        <p className="text-xs text-gray-500">{activeOrder.deliveryAddress}</p>
                      </div>
                    </div>
                  </div>

                  {/* Customer Info */}
                  <div className="bg-gray-50 rounded-2xl p-4 mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <MapPin size={16} className="text-green-600 mr-2" />
                        <span className="font-bold text-sm">Delivery Address</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 ml-6">{activeOrder.deliveryAddress}</p>
                    <p className="text-sm text-gray-600 ml-6">{activeOrder.area}</p>

                    {activeOrder.specialInstructions && <div className="mt-3 pt-3 border-t border-gray-200">
                        <p className="text-xs font-bold text-gray-500 mb-1">Special Instructions:</p>
                        <p className="text-sm text-gray-700 ml-1">{activeOrder.specialInstructions}</p>
                      </div>}
                  </div>

                  {/* Items */}
                  <div className="mb-4">
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Order Items</p>
                    <div className="space-y-1">
                      {activeOrder.items.map((item, idx) => <div key={idx} className="flex justify-between text-sm">
                          <span className="text-gray-700">{item.name}</span>
                          <span className="font-bold text-gray-500">x{item.quantity}</span>
                        </div>)}
                    </div>
                  </div>

                  {/* Payment Info */}
                  <div className="bg-green-50 rounded-2xl p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-gray-600">Payment Method</p>
                        <p className="font-bold text-sm capitalize">{activeOrder.paymentMethod}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600">Order Total</p>
                        <p className="font-bold text-lg text-green-700">
                          {formatCurrency(activeOrder.orderTotal)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2">
                    <div className="flex space-x-2">
                      <a href={`tel:${activeOrder.customerPhone}`} className="flex-1 bg-blue-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center">
                        <Phone size={16} className="mr-2" />
                        Call
                      </a>
                      <a href={`sms:${activeOrder.customerPhone}`} className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center">
                        <MessageSquare size={16} className="mr-2" />
                        SMS
                      </a>
                    </div>

                    <button className="w-full bg-gray-800 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center">
                      <Navigation size={16} className="mr-2" />
                      Navigate
                    </button>

                    {activeOrder.status === 'accepted' && <button onClick={handlePickup} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-green-200">
                        Confirm Pickup
                      </button>}

                    {activeOrder.status === 'picked_up' && <button onClick={handleDeliver} className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-green-200">
                        Confirm Delivery
                      </button>}
                  </div>
                </div>
              </div>}
          </div>}

        {/* Stats Screen */}
        {activeScreen === 'stats' && <div className="space-y-6">
            <h2 className="text-xl font-bold">Your Stats</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <DollarSign size={24} className="text-green-600 mb-2" />
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Week Earnings</p>
                <p className="text-2xl font-black text-gray-900">{formatCurrency(stats.weekEarnings)}</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <Package size={24} className="text-blue-600 mb-2" />
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Week Deliveries</p>
                <p className="text-2xl font-black text-gray-900">{stats.weekDeliveries}</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <Star size={24} className="text-yellow-500 fill-yellow-500 mb-2" />
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Rating</p>
                <p className="text-2xl font-black text-gray-900">{stats.rating}</p>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                <TrendingUp size={24} className="text-purple-600 mb-2" />
                <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Completion</p>
                <p className="text-2xl font-black text-gray-900">{stats.completionRate}%</p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
              <h3 className="font-bold text-lg mb-4">Recent Deliveries</h3>
              <div className="space-y-3">
                {completedOrders.slice(0, 5).map(order => <div key={order.id} className="flex justify-between items-center pb-3 border-b border-gray-100 last:border-0">
                    <div>
                      <p className="font-bold text-sm">{order.customerName}</p>
                      <p className="text-xs text-gray-500">{order.area}</p>
                    </div>
                    <p className="font-bold text-green-600">{formatCurrency(order.deliveryFee)}</p>
                  </div>)}
                {completedOrders.length === 0 && <p className="text-center text-sm text-gray-400 py-4">No completed deliveries yet</p>}
              </div>
            </div>
          </div>}

        {/* Profile Screen */}
        {activeScreen === 'profile' && <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden">
                <User size={40} className="text-gray-400" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Kevon Williams</h2>
                <p className="text-sm text-gray-500">Driver ID: DRV-5847</p>
                <div className="flex items-center mt-1">
                  <Star size={14} className="text-yellow-500 fill-yellow-500 mr-1" />
                  <span className="font-bold text-sm">{stats.rating}</span>
                  <span className="text-xs text-gray-500 ml-1">({stats.weekDeliveries} deliveries)</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                <div className="flex items-center">
                  <Settings size={20} className="text-gray-500 mr-3" />
                  <span className="font-bold text-sm">Settings</span>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </button>

              <button className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                <div className="flex items-center">
                  <Package size={20} className="text-gray-500 mr-3" />
                  <span className="font-bold text-sm">Delivery History</span>
                </div>
                <ChevronRight size={20} className="text-gray-300" />
              </button>

              <button onClick={() => setShowLogoutConfirm(true)} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-red-100 text-red-600">
                <div className="flex items-center">
                  <LogOut size={20} className="mr-3" />
                  <span className="font-bold text-sm">Log Out</span>
                </div>
              </button>
            </div>
          </div>}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 flex justify-between items-center z-50 max-w-md mx-auto">
        {[{
        id: 'home',
        icon: <Package size={24} />,
        label: 'Orders'
      }, {
        id: 'active',
        icon: <Navigation size={24} />,
        label: 'Active'
      }, {
        id: 'stats',
        icon: <TrendingUp size={24} />,
        label: 'Stats'
      }, {
        id: 'profile',
        icon: <User size={24} />,
        label: 'Profile'
      }].map(tab => <button key={tab.id} onClick={() => setActiveScreen(tab.id as AppScreen)} className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${activeScreen === tab.id ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
            {tab.icon}
            <span className="text-[10px] font-medium mt-1">{tab.label}</span>
            {activeScreen === tab.id && <motion.div layoutId="driver-nav-pill" className="h-1 w-1 bg-green-600 rounded-full mt-1" />}
          </button>)}
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {/* Order Detail Modal */}
        {showOrderDetail && activeOrder && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center px-6" onClick={() => setShowOrderDetail(false)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Order Details</h2>
                  <button onClick={() => setShowOrderDetail(false)} className="p-2 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Order ID</p>
                  <p className="font-bold">{activeOrder.id}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Pickup</p>
                  <p className="font-bold">{activeOrder.storeName}</p>
                  <p className="text-sm text-gray-600">{activeOrder.storeAddress}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Deliver To</p>
                  <p className="font-bold">{activeOrder.customerName}</p>
                  <p className="text-sm text-gray-600">{activeOrder.deliveryAddress}</p>
                  <p className="text-sm text-gray-600">{activeOrder.area}</p>
                  <p className="text-sm text-gray-600">{activeOrder.customerPhone}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Items</p>
                  {activeOrder.items.map((item, idx) => <div key={idx} className="flex justify-between text-sm mb-1">
                      <span>{item.name}</span>
                      <span className="font-bold">x{item.quantity}</span>
                    </div>)}
                </div>

                {activeOrder.specialInstructions && <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                      Special Instructions
                    </p>
                    <p className="text-sm text-gray-700">{activeOrder.specialInstructions}</p>
                  </div>}

                <div className="bg-green-50 p-4 rounded-2xl">
                  <div className="flex justify-between items-center">
                    <span className="font-bold">Your Earnings</span>
                    <span className="text-2xl font-black text-green-600">
                      {formatCurrency(activeOrder.deliveryFee)}
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <button onClick={() => handleDeclineOrder(activeOrder.id)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">
                    Decline
                  </button>
                  <button onClick={() => handleAcceptOrder(activeOrder)} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200">
                    Accept Order
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>}

        {/* Logout Confirmation */}
        {showLogoutConfirm && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] flex items-center justify-center px-6" onClick={() => setShowLogoutConfirm(false)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-2">Log Out?</h3>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to log out?</p>
              <div className="flex space-x-3">
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">
                  Cancel
                </button>
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl">
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </div>;
};