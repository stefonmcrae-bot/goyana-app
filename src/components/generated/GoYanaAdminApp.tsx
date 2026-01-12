import React, { useState, useMemo } from 'react';
import { Users, Store, Truck, TrendingUp, DollarSign, Package, AlertCircle, CheckCircle2, Clock, MapPin, Search, Filter, ChevronRight, Eye, X, BarChart3, ShoppingBag, Star, Phone, Mail, Settings, Bell, Download, Edit, Trash2, Plus, Navigation2, MapPinned } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CategoryAuditScreen } from './CategoryAuditScreen';

// --- Types ---
type DashboardView = 'overview' | 'orders' | 'drivers' | 'stores' | 'customers';
type OrderStatus = 'pending' | 'accepted' | 'in_transit' | 'delivered' | 'cancelled';
interface DashboardStats {
  totalOrders: number;
  activeOrders: number;
  totalRevenue: number;
  activeDrivers: number;
  totalDrivers: number;
  totalStores: number;
  totalCustomers: number;
  avgDeliveryTime: number;
}
interface Order {
  id: string;
  customerName: string;
  storeName: string;
  driverName: string;
  status: OrderStatus;
  orderTotal: number;
  deliveryFee: number;
  timestamp: string;
  area: string;
  items: number;
}
interface Driver {
  id: string;
  name: string;
  phone: string;
  rating: number;
  deliveries: number;
  earnings: number;
  status: 'online' | 'offline';
  vehicle: string;
  active: boolean;
}
interface StoreData {
  id: string;
  name: string;
  category: string;
  orders: number;
  revenue: number;
  rating: number;
  status: 'active' | 'inactive';
  deliveryFee: number;
  deliveryTimeMin: number;
  deliveryTimeMax: number;
  imageUrl: string;
  productCount: number;
}
interface Product {
  id: string;
  storeId: string;
  name: string;
  price: number;
  category: string;
  unit: string;
  description: string;
  imageUrl: string;
  inStock: boolean;
}
interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  orders: number;
  totalSpent: number;
  joinDate: string;
}

// Mock Data
const INITIAL_STATS: DashboardStats = {
  totalOrders: 1247,
  activeOrders: 23,
  totalRevenue: 1854250,
  activeDrivers: 12,
  totalDrivers: 28,
  totalStores: 45,
  totalCustomers: 892,
  avgDeliveryTime: 32
};
const MOCK_ORDERS: Order[] = [{
  id: 'ORD-1001',
  customerName: 'Johnathan Persaud',
  storeName: 'Bounty Supermarket',
  driverName: 'Kevon Williams',
  status: 'in_transit',
  orderTotal: 4250,
  deliveryFee: 500,
  timestamp: '10 mins ago',
  area: 'Georgetown',
  items: 4
}, {
  id: 'ORD-1002',
  customerName: 'Sarah Johnson',
  storeName: 'Survival Pharmacy',
  driverName: 'Michael Chen',
  status: 'pending',
  orderTotal: 1800,
  deliveryFee: 300,
  timestamp: '5 mins ago',
  area: 'Kitty',
  items: 3
}, {
  id: 'ORD-1003',
  customerName: 'David Kumar',
  storeName: 'Massy Stores',
  driverName: 'Lisa Wong',
  status: 'delivered',
  orderTotal: 6850,
  deliveryFee: 450,
  timestamp: '1 hour ago',
  area: 'Alberttown',
  items: 8
}, {
  id: 'ORD-1004',
  customerName: 'Patricia Lewis',
  storeName: 'Stabroek Market',
  driverName: 'Not assigned',
  status: 'pending',
  orderTotal: 3200,
  deliveryFee: 600,
  timestamp: '2 mins ago',
  area: 'Diamond',
  items: 5
}];
const MOCK_DRIVERS: Driver[] = [{
  id: 'DRV-5847',
  name: 'Kevon Williams',
  phone: '+592 612-3456',
  rating: 4.9,
  deliveries: 342,
  earnings: 171000,
  status: 'online',
  vehicle: 'White Axio',
  active: true
}, {
  id: 'DRV-5848',
  name: 'Michael Chen',
  phone: '+592 623-7890',
  rating: 4.8,
  deliveries: 298,
  earnings: 149000,
  status: 'online',
  vehicle: 'Red Fielder',
  active: true
}, {
  id: 'DRV-5849',
  name: 'Lisa Wong',
  phone: '+592 634-5678',
  rating: 4.7,
  deliveries: 256,
  earnings: 128000,
  status: 'offline',
  vehicle: 'Blue Vitz',
  active: true
}, {
  id: 'DRV-5850',
  name: 'Rajesh Singh',
  phone: '+592 645-9012',
  rating: 4.9,
  deliveries: 412,
  earnings: 206000,
  status: 'offline',
  vehicle: 'Black Premio',
  active: false
}];
const MOCK_STORES: StoreData[] = [{
  id: 's1',
  name: 'Bounty Supermarket',
  category: 'Supermarket',
  orders: 456,
  revenue: 684500,
  rating: 4.8,
  status: 'active',
  deliveryFee: 500,
  deliveryTimeMin: 25,
  deliveryTimeMax: 35,
  imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400',
  productCount: 234
}, {
  id: 's2',
  name: 'Survival Pharmacy',
  category: 'Pharmacy',
  orders: 312,
  revenue: 234600,
  rating: 4.9,
  status: 'active',
  deliveryFee: 300,
  deliveryTimeMin: 15,
  deliveryTimeMax: 20,
  imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=400',
  productCount: 156
}, {
  id: 's3',
  name: 'Massy Stores',
  category: 'Supermarket',
  orders: 389,
  revenue: 523400,
  rating: 4.7,
  status: 'active',
  deliveryFee: 450,
  deliveryTimeMin: 20,
  deliveryTimeMax: 30,
  imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
  productCount: 198
}, {
  id: 's4',
  name: 'Stabroek Market',
  category: 'Local Market',
  orders: 178,
  revenue: 178900,
  rating: 4.5,
  status: 'inactive',
  deliveryFee: 800,
  deliveryTimeMin: 40,
  deliveryTimeMax: 60,
  imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=400',
  productCount: 89
}];
const MOCK_PRODUCTS: Product[] = [{
  id: 'p1',
  storeId: 's1',
  name: 'Premium Jasmine Rice',
  price: 1250,
  category: 'Grains',
  unit: '2kg',
  description: 'Long-grain fragrant rice perfect for daily use.',
  imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
  inStock: true
}, {
  id: 'p2',
  storeId: 's1',
  name: 'Whole Milk',
  price: 650,
  category: 'Dairy',
  unit: '1L',
  description: 'Fresh full cream milk from local farms.',
  imageUrl: 'https://images.unsplash.com/photo-1550583724-125581cc258b?auto=format&fit=crop&q=80&w=400',
  inStock: true
}, {
  id: 'p3',
  storeId: 's2',
  name: 'Paracetamol 500mg',
  price: 200,
  category: 'Medicine',
  unit: 'Pack of 10',
  description: 'Fast relief from pain and fever.',
  imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
  inStock: true
}];
const MOCK_CUSTOMERS: Customer[] = [{
  id: 'C001',
  name: 'Johnathan Persaud',
  phone: '+592 612-3456',
  email: 'jpersaud@email.com',
  orders: 28,
  totalSpent: 42850,
  joinDate: 'Jan 2024'
}, {
  id: 'C002',
  name: 'Sarah Johnson',
  phone: '+592 623-7890',
  email: 'sjohnson@email.com',
  orders: 15,
  totalSpent: 21400,
  joinDate: 'Feb 2024'
}, {
  id: 'C003',
  name: 'David Kumar',
  phone: '+592 634-5678',
  email: 'dkumar@email.com',
  orders: 42,
  totalSpent: 68200,
  joinDate: 'Dec 2023'
}];
const formatCurrency = (amount: number) => `GYD $${amount.toLocaleString()}`;
const OrderStatusBadge = ({
  status
}: {
  status: OrderStatus;
}) => {
  const config = {
    pending: {
      bg: 'bg-yellow-100',
      text: 'text-yellow-700',
      label: 'Pending'
    },
    accepted: {
      bg: 'bg-blue-100',
      text: 'text-blue-700',
      label: 'Accepted'
    },
    in_transit: {
      bg: 'bg-purple-100',
      text: 'text-purple-700',
      label: 'In Transit'
    },
    delivered: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Delivered'
    },
    cancelled: {
      bg: 'bg-red-100',
      text: 'text-red-700',
      label: 'Cancelled'
    }
  };
  const {
    bg,
    text,
    label
  } = config[status];
  return <span className={`${bg} ${text} px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
      {label}
    </span>;
};
const DriverStatusBadge = ({
  status
}: {
  status: 'online' | 'offline';
}) => {
  const config = {
    online: {
      bg: 'bg-green-100',
      text: 'text-green-700',
      label: 'Online'
    },
    offline: {
      bg: 'bg-gray-100',
      text: 'text-gray-500',
      label: 'Offline'
    }
  };
  const {
    bg,
    text,
    label
  } = config[status];
  return <span className={`${bg} ${text} px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider`}>
      {label}
    </span>;
};

// @component: GoYanaAdminApp
export const GoYanaAdminApp = () => {
  const [activeView, setActiveView] = useState<DashboardView>('overview');
  const [stats, setStats] = useState<DashboardStats>(INITIAL_STATS);
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
  const [stores, setStores] = useState<StoreData[]>(MOCK_STORES);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [customers, setCustomers] = useState<Customer[]>(MOCK_CUSTOMERS);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showOrderDetail, setShowOrderDetail] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCategoryAudit, setShowCategoryAudit] = useState(false);

  // Driver Management States
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDriverDetail, setShowDriverDetail] = useState(false);
  const [showDriverForm, setShowDriverForm] = useState(false);
  const [editingDriver, setEditingDriver] = useState<Driver | null>(null);
  const [showDeleteDriverConfirm, setShowDeleteDriverConfirm] = useState(false);
  const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
  const [driverFilter, setDriverFilter] = useState<'all' | 'online'>('all');
  const [driverForm, setDriverForm] = useState({
    name: '',
    phone: '',
    vehicle: '',
    active: true
  });

  // Store Management States
  const [selectedStore, setSelectedStore] = useState<StoreData | null>(null);
  const [showStoreDetail, setShowStoreDetail] = useState(false);
  const [showStoreForm, setShowStoreForm] = useState(false);
  const [editingStore, setEditingStore] = useState<StoreData | null>(null);
  const [showDeleteStoreConfirm, setShowDeleteStoreConfirm] = useState(false);
  const [storeToDelete, setStoreToDelete] = useState<StoreData | null>(null);
  const [storeForm, setStoreForm] = useState({
    name: '',
    category: 'Supermarket',
    rating: 4.5,
    deliveryFee: 500,
    deliveryTimeMin: 20,
    deliveryTimeMax: 30,
    imageUrl: '',
    status: 'active' as 'active' | 'inactive'
  });

  // Product Management States
  const [showProductManagement, setShowProductManagement] = useState(false);
  const [manageProductsStoreId, setManageProductsStoreId] = useState<string | null>(null);
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [showDeleteProductConfirm, setShowDeleteProductConfirm] = useState(false);
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [productSearchQuery, setProductSearchQuery] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productStockFilter, setProductStockFilter] = useState<'all' | 'inStock' | 'outOfStock'>('all');
  const [productForm, setProductForm] = useState({
    name: '',
    price: 0,
    category: '',
    unit: '',
    description: '',
    imageUrl: '',
    inStock: true
  });

  // Toast notification state
  const [toast, setToast] = useState<{
    show: boolean;
    message: string;
    type: 'success' | 'error';
  }>({
    show: false,
    message: '',
    type: 'success'
  });
  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({
      show: true,
      message,
      type
    });
    setTimeout(() => setToast({
      show: false,
      message: '',
      type: 'success'
    }), 3000);
  };

  // Valid categories for the platform
  const VALID_CATEGORIES = ['Grains', 'Dairy', 'Medicine', 'Fruits', 'Vegetables', 'Meats', 'Seafood', 'Bakery', 'Snacks', 'Beverages', 'Household', 'Personal Care', 'Baby Products', 'Pet Supplies', 'Frozen Foods', 'Condiments', 'Spices'];

  // Calculate products needing category fix
  const productsNeedingCategoryFixCount = useMemo(() => {
    return products.filter(product => {
      // Missing category
      if (!product.category || product.category.trim() === '') {
        return true;
      }
      // Invalid category (not in allowed list)
      if (!VALID_CATEGORIES.includes(product.category)) {
        return true;
      }
      return false;
    }).length;
  }, [products]);

  // Handle category fix
  const handleFixCategory = (productId: string, newCategory: string) => {
    setProducts(prev => prev.map(p => p.id === productId ? {
      ...p,
      category: newCategory
    } : p));
    showToast('Category updated successfully');
  };
  const filteredOrders = useMemo(() => {
    return orders.filter(order => order.id.toLowerCase().includes(searchQuery.toLowerCase()) || order.customerName.toLowerCase().includes(searchQuery.toLowerCase()) || order.storeName.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [orders, searchQuery]);
  const filteredDrivers = useMemo(() => {
    return drivers.filter(driver => {
      const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) || driver.phone.includes(searchQuery);
      const matchesFilter = driverFilter === 'all' || driver.status === 'online';
      return matchesSearch && matchesFilter;
    });
  }, [drivers, searchQuery, driverFilter]);
  const filteredStores = useMemo(() => {
    return stores.filter(store => store.name.toLowerCase().includes(searchQuery.toLowerCase()) || store.category.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [stores, searchQuery]);
  const filteredProducts = useMemo(() => {
    if (!manageProductsStoreId) return [];
    return products.filter(product => {
      const matchesStore = product.storeId === manageProductsStoreId;
      const matchesSearch = product.name.toLowerCase().includes(productSearchQuery.toLowerCase());
      const matchesCategory = productCategoryFilter === 'all' || product.category === productCategoryFilter;
      const matchesStock = productStockFilter === 'all' || (productStockFilter === 'inStock' ? product.inStock : !product.inStock);
      return matchesStore && matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, manageProductsStoreId, productSearchQuery, productCategoryFilter, productStockFilter]);
  const productCategories = useMemo(() => {
    const cats = new Set(products.filter(p => p.storeId === manageProductsStoreId).map(p => p.category));
    return Array.from(cats);
  }, [products, manageProductsStoreId]);

  // Driver Management Functions
  const handleAddDriver = () => {
    setEditingDriver(null);
    setDriverForm({
      name: '',
      phone: '+592 ',
      vehicle: '',
      active: true
    });
    setShowDriverForm(true);
  };
  const handleEditDriver = (driver: Driver) => {
    setEditingDriver(driver);
    setDriverForm({
      name: driver.name,
      phone: driver.phone,
      vehicle: driver.vehicle,
      active: driver.active
    });
    setShowDriverForm(true);
    setShowDriverDetail(false);
  };
  const handleSaveDriver = () => {
    if (!driverForm.name || !driverForm.phone || !driverForm.vehicle) {
      showToast('Please fill all fields', 'error');
      return;
    }
    if (editingDriver) {
      setDrivers(prev => prev.map(d => d.id === editingDriver.id ? {
        ...d,
        name: driverForm.name,
        phone: driverForm.phone,
        vehicle: driverForm.vehicle,
        active: driverForm.active
      } : d));
      showToast('Driver updated successfully');
    } else {
      const newDriver: Driver = {
        id: `DRV-${Date.now()}`,
        name: driverForm.name,
        phone: driverForm.phone,
        vehicle: driverForm.vehicle,
        active: driverForm.active,
        rating: 5.0,
        deliveries: 0,
        earnings: 0,
        status: 'offline'
      };
      setDrivers(prev => [...prev, newDriver]);
      showToast('Driver added successfully');
    }
    setShowDriverForm(false);
    setEditingDriver(null);
  };
  const handleDeleteDriver = (driver: Driver) => {
    setDriverToDelete(driver);
    setShowDeleteDriverConfirm(true);
  };
  const confirmDeleteDriver = () => {
    if (driverToDelete) {
      setDrivers(prev => prev.filter(d => d.id !== driverToDelete.id));
      showToast('Driver deleted successfully');
      setShowDeleteDriverConfirm(false);
      setDriverToDelete(null);
      setShowDriverDetail(false);
    }
  };
  const toggleDriverStatus = (driver: Driver, field: 'active' | 'status') => {
    setDrivers(prev => prev.map(d => d.id === driver.id ? {
      ...d,
      [field]: field === 'active' ? !d.active : d.status === 'online' ? 'offline' : 'online'
    } : d));
    if (selectedDriver?.id === driver.id) {
      setSelectedDriver({
        ...driver,
        [field]: field === 'active' ? !driver.active : driver.status === 'online' ? 'offline' : 'online'
      });
    }
  };

  // Store Management Functions
  const handleAddStore = () => {
    setEditingStore(null);
    setStoreForm({
      name: '',
      category: 'Supermarket',
      rating: 4.5,
      deliveryFee: 500,
      deliveryTimeMin: 20,
      deliveryTimeMax: 30,
      imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400',
      status: 'active'
    });
    setShowStoreForm(true);
  };
  const handleEditStore = (store: StoreData) => {
    setEditingStore(store);
    setStoreForm({
      name: store.name,
      category: store.category,
      rating: store.rating,
      deliveryFee: store.deliveryFee,
      deliveryTimeMin: store.deliveryTimeMin,
      deliveryTimeMax: store.deliveryTimeMax,
      imageUrl: store.imageUrl,
      status: store.status
    });
    setShowStoreForm(true);
    setShowStoreDetail(false);
  };
  const handleSaveStore = () => {
    if (!storeForm.name || storeForm.deliveryFee <= 0) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (editingStore) {
      setStores(prev => prev.map(s => s.id === editingStore.id ? {
        ...s,
        name: storeForm.name,
        category: storeForm.category,
        rating: storeForm.rating,
        deliveryFee: storeForm.deliveryFee,
        deliveryTimeMin: storeForm.deliveryTimeMin,
        deliveryTimeMax: storeForm.deliveryTimeMax,
        imageUrl: storeForm.imageUrl,
        status: storeForm.status
      } : s));
      showToast('Store updated successfully');
    } else {
      const newStore: StoreData = {
        id: `s${Date.now()}`,
        name: storeForm.name,
        category: storeForm.category,
        rating: storeForm.rating,
        deliveryFee: storeForm.deliveryFee,
        deliveryTimeMin: storeForm.deliveryTimeMin,
        deliveryTimeMax: storeForm.deliveryTimeMax,
        imageUrl: storeForm.imageUrl,
        status: storeForm.status,
        orders: 0,
        revenue: 0,
        productCount: 0
      };
      setStores(prev => [...prev, newStore]);
      showToast('Store added successfully');
    }
    setShowStoreForm(false);
    setEditingStore(null);
  };
  const handleDeleteStore = (store: StoreData) => {
    setStoreToDelete(store);
    setShowDeleteStoreConfirm(true);
  };
  const confirmDeleteStore = () => {
    if (storeToDelete) {
      setStores(prev => prev.filter(s => s.id !== storeToDelete.id));
      showToast('Store deleted successfully');
      setShowDeleteStoreConfirm(false);
      setStoreToDelete(null);
      setShowStoreDetail(false);
    }
  };
  const toggleStoreStatus = (store: StoreData) => {
    setStores(prev => prev.map(s => s.id === store.id ? {
      ...s,
      status: s.status === 'active' ? 'inactive' : 'active'
    } : s));
    if (selectedStore?.id === store.id) {
      setSelectedStore({
        ...store,
        status: store.status === 'active' ? 'inactive' : 'active'
      });
    }
  };
  const handleManageProducts = (store: StoreData) => {
    setManageProductsStoreId(store.id);
    setShowProductManagement(true);
    setShowStoreDetail(false);
  };

  // Product Management Functions
  const handleAddProduct = () => {
    setEditingProduct(null);
    setProductForm({
      name: '',
      price: 0,
      category: '',
      unit: '',
      description: '',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
      inStock: true
    });
    setShowProductForm(true);
  };
  const handleEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      price: product.price,
      category: product.category,
      unit: product.unit,
      description: product.description,
      imageUrl: product.imageUrl,
      inStock: product.inStock
    });
    setShowProductForm(true);
  };
  const handleSaveProduct = () => {
    if (!productForm.name || productForm.price <= 0 || !productForm.category || !productForm.unit) {
      showToast('Please fill all required fields', 'error');
      return;
    }
    if (editingProduct) {
      setProducts(prev => prev.map(p => p.id === editingProduct.id ? {
        ...p,
        name: productForm.name,
        price: productForm.price,
        category: productForm.category,
        unit: productForm.unit,
        description: productForm.description,
        imageUrl: productForm.imageUrl,
        inStock: productForm.inStock
      } : p));
      showToast('Product updated successfully');
    } else {
      if (!manageProductsStoreId) return;
      const newProduct: Product = {
        id: `p${Date.now()}`,
        storeId: manageProductsStoreId,
        name: productForm.name,
        price: productForm.price,
        category: productForm.category,
        unit: productForm.unit,
        description: productForm.description,
        imageUrl: productForm.imageUrl,
        inStock: productForm.inStock
      };
      setProducts(prev => [...prev, newProduct]);
      showToast('Product added successfully');
    }
    setShowProductForm(false);
    setEditingProduct(null);
  };
  const handleDeleteProduct = (product: Product) => {
    setProductToDelete(product);
    setShowDeleteProductConfirm(true);
  };
  const confirmDeleteProduct = () => {
    if (productToDelete) {
      setProducts(prev => prev.filter(p => p.id !== productToDelete.id));
      showToast('Product deleted successfully');
      setShowDeleteProductConfirm(false);
      setProductToDelete(null);
    }
  };
  return <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* Header */}
      <header className="px-6 pt-12 pb-4 bg-gradient-to-br from-green-600 to-green-700 text-white sticky top-0 z-30 shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-3">
            <div className="bg-white/20 backdrop-blur-sm p-2 rounded-xl">
              <BarChart3 size={24} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight">GoYana Admin</h1>
              <p className="text-xs text-green-100 font-medium">Dashboard & Analytics</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <Bell size={20} />
            </button>
            <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
              <Settings size={20} />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-2">
          <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl text-center">
            <p className="text-2xl font-black">{stats.activeOrders}</p>
            <p className="text-[9px] text-green-100 uppercase tracking-wider font-medium">Active</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl text-center">
            <p className="text-2xl font-black">{stats.activeDrivers}</p>
            <p className="text-[9px] text-green-100 uppercase tracking-wider font-medium">Drivers</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl text-center">
            <p className="text-2xl font-black">{stats.totalStores}</p>
            <p className="text-[9px] text-green-100 uppercase tracking-wider font-medium">Stores</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm p-2 rounded-xl text-center">
            <p className="text-2xl font-black">{stats.avgDeliveryTime}m</p>
            <p className="text-[9px] text-green-100 uppercase tracking-wider font-medium">Avg Time</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto pb-20 px-6 py-6">
        {/* Overview Screen */}
        {activeView === 'overview' && <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold mb-4">Revenue Overview</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <DollarSign size={24} className="text-green-600 mb-2" />
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Revenue</p>
                  <p className="text-xl font-black text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
                </div>

                <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm">
                  <Package size={24} className="text-blue-600 mb-2" />
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Total Orders</p>
                  <p className="text-xl font-black text-gray-900">{stats.totalOrders}</p>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold mb-4">Platform Stats</h2>
              <div className="space-y-3">
                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-xl mr-3">
                      <Truck size={20} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Drivers</p>
                      <p className="text-xs text-gray-500">
                        {stats.activeDrivers} online / {stats.totalDrivers} total
                      </p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 cursor-pointer hover:text-gray-600" onClick={() => setActiveView('drivers')} />
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-xl mr-3">
                      <Store size={20} className="text-green-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Stores</p>
                      <p className="text-xs text-gray-500">{stats.totalStores} registered</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 cursor-pointer hover:text-gray-600" onClick={() => setActiveView('stores')} />
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="bg-purple-100 p-3 rounded-xl mr-3">
                      <Users size={20} className="text-purple-600" />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Customers</p>
                      <p className="text-xs text-gray-500">{stats.totalCustomers} active users</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 cursor-pointer hover:text-gray-600" onClick={() => setActiveView('customers')} />
                </div>

                <div className="bg-white p-4 rounded-2xl border border-gray-100 flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`${productsNeedingCategoryFixCount > 0 ? 'bg-red-100' : 'bg-gray-100'} p-3 rounded-xl mr-3`}>
                      <AlertCircle size={20} className={`${productsNeedingCategoryFixCount > 0 ? 'text-red-600' : 'text-gray-500'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-sm">Category Audit</p>
                      <p className="text-xs text-gray-500">
                        {productsNeedingCategoryFixCount > 0 ? `${productsNeedingCategoryFixCount} need review` : 'All categories valid'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {productsNeedingCategoryFixCount > 0 && <span className="bg-red-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full">
                        {productsNeedingCategoryFixCount}
                      </span>}
                    <ChevronRight size={20} className="text-gray-300 cursor-pointer hover:text-gray-600" onClick={() => setShowCategoryAudit(true)} />
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Recent Orders</h2>
                <button onClick={() => setActiveView('orders')} className="text-green-600 text-sm font-bold hover:underline">
                  View All
                </button>
              </div>
              <div className="space-y-2">
                {orders.slice(0, 5).map(order => <div key={order.id} className="bg-white p-3 rounded-2xl border border-gray-100 flex items-center justify-between cursor-pointer hover:border-green-200 transition-colors" onClick={() => {
              setSelectedOrder(order);
              setShowOrderDetail(true);
            }}>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-bold text-sm">{order.id}</p>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-gray-600">{order.customerName}</p>
                      <p className="text-[10px] text-gray-500">{order.storeName}</p>
                    </div>
                    <div className="text-right ml-3">
                      <p className="font-bold text-sm text-green-600">{formatCurrency(order.orderTotal)}</p>
                      <p className="text-[10px] text-gray-500">{order.timestamp}</p>
                    </div>
                  </div>)}
              </div>
            </div>
          </div>}

        {/* Orders Screen */}
        {activeView === 'orders' && <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">All Orders</h2>
              <button className="p-2 bg-white rounded-xl border border-gray-200">
                <Download size={18} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search orders..." className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div className="space-y-2">
              {filteredOrders.map(order => <div key={order.id} className="bg-white p-4 rounded-2xl border border-gray-100 cursor-pointer hover:border-green-200 transition-colors" onClick={() => {
            setSelectedOrder(order);
            setShowOrderDetail(true);
          }}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="font-bold text-sm">{order.id}</p>
                      <p className="text-xs text-gray-500">{order.timestamp}</p>
                    </div>
                    <OrderStatusBadge status={order.status} />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mb-3">
                    <div>
                      <p className="text-gray-500">Customer</p>
                      <p className="font-bold text-gray-700">{order.customerName}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Store</p>
                      <p className="font-bold text-gray-700">{order.storeName}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center space-x-3 text-xs text-gray-600">
                      <span>{order.items} items</span>
                      <span>•</span>
                      <span>{order.area}</span>
                    </div>
                    <p className="font-bold text-green-600">{formatCurrency(order.orderTotal)}</p>
                  </div>
                </div>)}
            </div>
          </div>}

        {/* Drivers Screen */}
        {activeView === 'drivers' && <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Drivers</h2>
              <button onClick={handleAddDriver} className="p-2 bg-green-600 text-white rounded-xl">
                <Plus size={18} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search drivers..." className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div className="flex space-x-2">
              <button onClick={() => setDriverFilter('all')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${driverFilter === 'all' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                All
              </button>
              <button onClick={() => setDriverFilter('online')} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${driverFilter === 'online' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                Online Only
              </button>
            </div>

            <div className="space-y-3">
              {filteredDrivers.map(driver => <div key={driver.id} className="bg-white p-4 rounded-2xl border border-gray-100 cursor-pointer hover:border-green-200 transition-colors" onClick={() => {
            setSelectedDriver(driver);
            setShowDriverDetail(true);
          }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center flex-1">
                      <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                        <Truck size={20} className="text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{driver.name}</p>
                        <p className="text-xs text-gray-500">{driver.phone}</p>
                      </div>
                    </div>
                    <DriverStatusBadge status={driver.status} />
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">Rating</p>
                      <div className="flex items-center">
                        <Star size={12} className="text-yellow-500 fill-yellow-500 mr-1" />
                        <p className="font-bold">{driver.rating}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-gray-500">Deliveries</p>
                      <p className="font-bold text-gray-700">{driver.deliveries}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Today</p>
                      <p className="font-bold text-gray-700">{Math.floor(Math.random() * 15)}</p>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>}

        {/* Stores Screen */}
        {activeView === 'stores' && <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Stores</h2>
              <button onClick={handleAddStore} className="p-2 bg-green-600 text-white rounded-xl">
                <Plus size={18} />
              </button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input type="text" placeholder="Search stores..." className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>

            <div className="space-y-3">
              {filteredStores.map(store => <div key={store.id} className="bg-white p-4 rounded-2xl border border-gray-100 cursor-pointer hover:border-green-200 transition-colors" onClick={() => {
            setSelectedStore(store);
            setShowStoreDetail(true);
          }}>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center flex-1">
                      <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center mr-3">
                        <Store size={20} className="text-green-600" />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-sm">{store.name}</p>
                        <p className="text-xs text-gray-500">{store.category}</p>
                      </div>
                    </div>
                    <span className={`${store.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'} px-2 py-1 rounded-full text-[10px] font-bold uppercase`}>
                      {store.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-3 text-xs">
                    <div>
                      <p className="text-gray-500">Fee</p>
                      <p className="font-bold text-gray-700">{formatCurrency(store.deliveryFee)}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Products</p>
                      <p className="font-bold text-gray-700">{store.productCount}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Rating</p>
                      <div className="flex items-center">
                        <Star size={12} className="text-yellow-500 fill-yellow-500 mr-1" />
                        <p className="font-bold">{store.rating}</p>
                      </div>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>}

        {/* Customers Screen */}
        {activeView === 'customers' && <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Customers</h2>
              <p className="text-sm text-gray-500 font-medium">{stats.totalCustomers} total</p>
            </div>

            <div className="space-y-3">
              {customers.map(customer => <div key={customer.id} className="bg-white p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                        <Users size={20} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="font-bold text-sm">{customer.name}</p>
                        <p className="text-xs text-gray-500">{customer.id}</p>
                      </div>
                    </div>
                    <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-[10px] font-bold">
                      {customer.joinDate}
                    </span>
                  </div>

                  <div className="space-y-2 mb-3 text-xs">
                    <div className="flex items-center text-gray-600">
                      <Phone size={12} className="mr-2" />
                      <span>{customer.phone}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <Mail size={12} className="mr-2" />
                      <span>{customer.email}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-gray-100 text-xs">
                    <div>
                      <p className="text-gray-500">Orders</p>
                      <p className="font-bold text-gray-700">{customer.orders}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Total Spent</p>
                      <p className="font-bold text-green-600">{formatCurrency(customer.totalSpent)}</p>
                    </div>
                  </div>
                </div>)}
            </div>
          </div>}
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 flex justify-between items-center z-50 max-w-md mx-auto">
        {[{
        id: 'overview',
        icon: <TrendingUp size={24} />,
        label: 'Overview'
      }, {
        id: 'orders',
        icon: <Package size={24} />,
        label: 'Orders'
      }, {
        id: 'drivers',
        icon: <Truck size={24} />,
        label: 'Drivers'
      }, {
        id: 'stores',
        icon: <Store size={24} />,
        label: 'Stores'
      }, {
        id: 'customers',
        icon: <Users size={24} />,
        label: 'Customers'
      }].map(tab => <button key={tab.id} onClick={() => {
        setActiveView(tab.id as DashboardView);
        setSearchQuery('');
      }} className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${activeView === tab.id ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
            {tab.icon}
            <span className="text-[9px] font-medium mt-1">{tab.label}</span>
            {activeView === tab.id && <motion.div layoutId="admin-nav-pill" className="h-1 w-1 bg-green-600 rounded-full mt-1" />}
          </button>)}
      </nav>

      {/* Modals */}
      <AnimatePresence>
        {/* Order Detail Modal */}
        {showOrderDetail && selectedOrder && <motion.div initial={{
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
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</p>
                    <p className="font-bold text-lg">{selectedOrder.id}</p>
                  </div>
                  <OrderStatusBadge status={selectedOrder.status} />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Customer</p>
                    <p className="font-bold text-sm">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Store</p>
                    <p className="font-bold text-sm">{selectedOrder.storeName}</p>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Driver</p>
                  <p className="font-bold text-sm">{selectedOrder.driverName}</p>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delivery Area</p>
                  <p className="font-bold text-sm">{selectedOrder.area}</p>
                </div>

                <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Items ({selectedOrder.items})</span>
                    <span className="font-bold">{formatCurrency(selectedOrder.orderTotal)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-bold">{formatCurrency(selectedOrder.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between text-base pt-2 border-t border-gray-200">
                    <span className="font-bold">Total</span>
                    <span className="font-black text-green-600">
                      {formatCurrency(selectedOrder.orderTotal + selectedOrder.deliveryFee)}
                    </span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Timestamp</p>
                  <p className="text-sm text-gray-700">{selectedOrder.timestamp}</p>
                </div>
              </div>
            </motion.div>
          </motion.div>}

        {/* Driver Detail Modal */}
        {showDriverDetail && selectedDriver && <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200
      }} className="fixed inset-0 bg-white z-[60] flex flex-col">
            <div className="px-6 pt-12 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <button onClick={() => setShowDriverDetail(false)} className="mr-4 p-2 text-gray-400">
                    <X size={24} />
                  </button>
                  <h2 className="text-xl font-bold">Driver Details</h2>
                </div>
                <button onClick={() => handleEditDriver(selectedDriver)} className="p-2 text-green-600">
                  <Edit size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
              <div className="bg-white p-5 rounded-3xl border border-gray-100">
                <div className="flex items-center mb-4">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mr-4">
                    <Truck size={28} className="text-gray-500" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold">{selectedDriver.name}</h3>
                    <p className="text-sm text-gray-500">{selectedDriver.id}</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <Phone size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm font-bold">{selectedDriver.phone}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <div className="flex items-center">
                      <Truck size={16} className="text-gray-500 mr-2" />
                      <span className="text-sm font-bold">{selectedDriver.vehicle}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Status Controls</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-bold">Active Driver</span>
                    <button onClick={() => toggleDriverStatus(selectedDriver, 'active')} className={`w-12 h-6 rounded-full transition-colors relative ${selectedDriver.active ? 'bg-green-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${selectedDriver.active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                    <span className="text-sm font-bold">Online Status (Override)</span>
                    <button onClick={() => toggleDriverStatus(selectedDriver, 'status')} className={`w-12 h-6 rounded-full transition-colors relative ${selectedDriver.status === 'online' ? 'bg-green-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${selectedDriver.status === 'online' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Location (Mock)</h4>
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="flex items-center mb-2">
                    <MapPinned size={16} className="text-green-600 mr-2" />
                    <span className="text-sm font-bold">Current Location</span>
                  </div>
                  <p className="text-xs text-gray-600">Lat: 6.8013° N</p>
                  <p className="text-xs text-gray-600">Lng: 58.1551° W</p>
                </div>
              </div>

              <div className="bg-white p-5 rounded-3xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Assigned Orders (Mock)</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-gray-50 rounded-xl">
                    <p className="text-sm font-bold">ORD-1001</p>
                    <p className="text-xs text-gray-500">To: Georgetown</p>
                  </div>
                  <p className="text-xs text-gray-500 text-center py-2">1 active order</p>
                </div>
              </div>

              <div className="bg-green-50 p-5 rounded-3xl border border-green-200">
                <h4 className="text-sm font-bold text-green-700 uppercase tracking-wider mb-2">Earnings Summary (Mock)</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-green-600">Today</p>
                    <p className="font-bold text-green-700">{formatCurrency(Math.floor(Math.random() * 5000))}</p>
                  </div>
                  <div>
                    <p className="text-xs text-green-600">Total</p>
                    <p className="font-bold text-green-700">{formatCurrency(selectedDriver.earnings)}</p>
                  </div>
                </div>
              </div>

              <button onClick={() => handleDeleteDriver(selectedDriver)} className="w-full py-4 bg-white text-red-500 font-bold rounded-2xl border-2 border-red-50 border-dashed hover:bg-red-50 transition-colors">
                Delete Driver
              </button>
            </div>
          </motion.div>}

        {/* Driver Form Modal */}
        {showDriverForm && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center px-6" onClick={() => setShowDriverForm(false)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{editingDriver ? 'Edit Driver' : 'Add Driver'}</h2>
                  <button onClick={() => setShowDriverForm(false)} className="p-2 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" value={driverForm.name} onChange={e => setDriverForm({
                ...driverForm,
                name: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="Enter driver name" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input type="tel" value={driverForm.phone} onChange={e => setDriverForm({
                ...driverForm,
                phone: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="+592 XXX-XXXX" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Vehicle Type (bike/car)</label>
                  <input type="text" value={driverForm.vehicle} onChange={e => setDriverForm({
                ...driverForm,
                vehicle: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="e.g. White Axio" />
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                  <span className="font-bold text-sm">Active</span>
                  <button onClick={() => setDriverForm({
                ...driverForm,
                active: !driverForm.active
              })} className={`w-12 h-6 rounded-full transition-colors relative ${driverForm.active ? 'bg-green-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${driverForm.active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button onClick={() => setShowDriverForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">
                    Cancel
                  </button>
                  <button onClick={handleSaveDriver} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200">
                    {editingDriver ? 'Save Changes' : 'Add Driver'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>}

        {/* Delete Driver Confirmation */}
        {showDeleteDriverConfirm && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] flex items-center justify-center px-6" onClick={() => setShowDeleteDriverConfirm(false)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-2">Delete Driver?</h3>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete {driverToDelete?.name}? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button onClick={() => setShowDeleteDriverConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">
                  Cancel
                </button>
                <button onClick={confirmDeleteDriver} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>}

        {/* Store Detail Modal */}
        {showStoreDetail && selectedStore && <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200
      }} className="fixed inset-0 bg-white z-[60] flex flex-col">
            <div className="relative h-48 shrink-0">
              <img src={selectedStore.imageUrl} alt={selectedStore.name} className="w-full h-full object-cover" />
              <button onClick={() => setShowStoreDetail(false)} className="absolute top-12 left-6 bg-white/20 backdrop-blur-md p-2 rounded-full text-white border border-white/30">
                <X size={24} />
              </button>
              <button onClick={() => handleEditStore(selectedStore)} className="absolute top-12 right-6 bg-white/20 backdrop-blur-md p-2 rounded-full text-white border border-white/30">
                <Edit size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 bg-white rounded-t-[32px] -mt-4 relative z-10 shadow-xl">
              <div>
                <h2 className="text-2xl font-bold">{selectedStore.name}</h2>
                <p className="text-sm text-gray-500">{selectedStore.category}</p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Status</h4>
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-xl">
                  <span className="text-sm font-bold">Active Store</span>
                  <button onClick={() => toggleStoreStatus(selectedStore)} className={`w-12 h-6 rounded-full transition-colors relative ${selectedStore.status === 'active' ? 'bg-green-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${selectedStore.status === 'active' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Store Info</h4>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category</span>
                    <span className="font-bold">{selectedStore.category}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Fee</span>
                    <span className="font-bold">{formatCurrency(selectedStore.deliveryFee)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Delivery Time</span>
                    <span className="font-bold">{selectedStore.deliveryTimeMin}-{selectedStore.deliveryTimeMax} mins</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Rating</span>
                    <div className="flex items-center">
                      <Star size={14} className="text-yellow-500 fill-yellow-500 mr-1" />
                      <span className="font-bold">{selectedStore.rating}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-gray-100">
                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3">Performance (Mock)</h4>
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-xs text-gray-500">Orders</p>
                    <p className="font-bold">{selectedStore.orders}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Revenue</p>
                    <p className="font-bold">{formatCurrency(selectedStore.revenue)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Products</p>
                    <p className="font-bold">{selectedStore.productCount}</p>
                  </div>
                </div>
              </div>

              <button onClick={() => handleManageProducts(selectedStore)} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200">
                Manage Products
              </button>

              <button onClick={() => handleDeleteStore(selectedStore)} className="w-full py-4 bg-white text-red-500 font-bold rounded-2xl border-2 border-red-50 border-dashed hover:bg-red-50 transition-colors">
                Delete Store
              </button>
            </div>
          </motion.div>}

        {/* Store Form Modal */}
        {showStoreForm && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center px-6" onClick={() => setShowStoreForm(false)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{editingStore ? 'Edit Store' : 'Add Store'}</h2>
                  <button onClick={() => setShowStoreForm(false)} className="p-2 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Store Name</label>
                  <input type="text" value={storeForm.name} onChange={e => setStoreForm({
                ...storeForm,
                name: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="Enter store name" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <select value={storeForm.category} onChange={e => setStoreForm({
                ...storeForm,
                category: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100">
                    <option value="Supermarket">Supermarket</option>
                    <option value="Pharmacy">Pharmacy</option>
                    <option value="Mini Mart">Mini Mart</option>
                    <option value="Local Market">Local Market</option>
                    <option value="Restaurant">Restaurant</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Rating (0-5)</label>
                  <input type="number" min="0" max="5" step="0.1" value={storeForm.rating} onChange={e => setStoreForm({
                ...storeForm,
                rating: parseFloat(e.target.value)
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Fee (GYD)</label>
                  <input type="number" min="0" value={storeForm.deliveryFee} onChange={e => setStoreForm({
                ...storeForm,
                deliveryFee: parseInt(e.target.value) || 0
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Min (mins)</label>
                    <input type="number" min="0" value={storeForm.deliveryTimeMin} onChange={e => setStoreForm({
                  ...storeForm,
                  deliveryTimeMin: parseInt(e.target.value) || 0
                })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Max (mins)</label>
                    <input type="number" min="0" value={storeForm.deliveryTimeMax} onChange={e => setStoreForm({
                  ...storeForm,
                  deliveryTimeMax: parseInt(e.target.value) || 0
                })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                  <input type="url" value={storeForm.imageUrl} onChange={e => setStoreForm({
                ...storeForm,
                imageUrl: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="https://..." />
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                  <span className="font-bold text-sm">Active</span>
                  <button onClick={() => setStoreForm({
                ...storeForm,
                status: storeForm.status === 'active' ? 'inactive' : 'active'
              })} className={`w-12 h-6 rounded-full transition-colors relative ${storeForm.status === 'active' ? 'bg-green-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${storeForm.status === 'active' ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button onClick={() => setShowStoreForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">
                    Cancel
                  </button>
                  <button onClick={handleSaveStore} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200">
                    {editingStore ? 'Save Changes' : 'Add Store'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>}

        {/* Delete Store Confirmation */}
        {showDeleteStoreConfirm && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] flex items-center justify-center px-6" onClick={() => setShowDeleteStoreConfirm(false)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-2">Delete Store?</h3>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete {storeToDelete?.name}? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button onClick={() => setShowDeleteStoreConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">
                  Cancel
                </button>
                <button onClick={confirmDeleteStore} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>}

        {/* Product Management Modal */}
        {showProductManagement && <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200
      }} className="fixed inset-0 bg-white z-[70] flex flex-col">
            <div className="px-6 pt-12 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <button onClick={() => {
                setShowProductManagement(false);
                setManageProductsStoreId(null);
                setProductSearchQuery('');
                setProductCategoryFilter('all');
                setProductStockFilter('all');
              }} className="mr-4 p-2 text-gray-400">
                    <X size={24} />
                  </button>
                  <div>
                    <h2 className="text-xl font-bold">Products</h2>
                    <p className="text-xs text-gray-500">{stores.find(s => s.id === manageProductsStoreId)?.name}</p>
                  </div>
                </div>
                <button onClick={handleAddProduct} className="p-2 bg-green-600 text-white rounded-xl">
                  <Plus size={18} />
                </button>
              </div>

              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" value={productSearchQuery} onChange={e => setProductSearchQuery(e.target.value)} />
              </div>

              <div className="flex space-x-2">
                <select value={productCategoryFilter} onChange={e => setProductCategoryFilter(e.target.value)} className="flex-1 px-3 py-2 bg-white rounded-xl text-xs font-bold border border-gray-200">
                  <option value="all">All Categories</option>
                  {productCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                </select>
                <select value={productStockFilter} onChange={e => setProductStockFilter(e.target.value as 'all' | 'inStock' | 'outOfStock')} className="flex-1 px-3 py-2 bg-white rounded-xl text-xs font-bold border border-gray-200">
                  <option value="all">All Stock</option>
                  <option value="inStock">In Stock</option>
                  <option value="outOfStock">Out of Stock</option>
                </select>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              <div className="space-y-3">
                {filteredProducts.map(product => <div key={product.id} className="bg-white p-4 rounded-2xl border border-gray-100">
                    <div className="flex">
                      <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
                      <div className="ml-3 flex-1">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-sm">{product.name}</h4>
                            <p className="text-xs text-gray-500">{product.category} • {product.unit}</p>
                            <p className="text-sm font-bold text-green-600 mt-1">{formatCurrency(product.price)}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button onClick={() => handleEditProduct(product)} className="p-2 text-gray-400 hover:text-gray-600">
                              <Edit size={16} />
                            </button>
                            <button onClick={() => handleDeleteProduct(product)} className="p-2 text-red-400 hover:text-red-600">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2">
                          <span className={`${product.inStock ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} px-2 py-1 rounded-full text-[10px] font-bold uppercase`}>
                            {product.inStock ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>)}
                {filteredProducts.length === 0 && <div className="text-center py-10">
                    <Package size={48} className="mx-auto text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500">No products found</p>
                  </div>}
              </div>
            </div>
          </motion.div>}

        {/* Product Form Modal */}
        {showProductForm && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[80] flex items-center justify-center px-6" onClick={() => setShowProductForm(false)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">{editingProduct ? 'Edit Product' : 'Add Product'}</h2>
                  <button onClick={() => setShowProductForm(false)} className="p-2 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Product Name</label>
                  <input type="text" value={productForm.name} onChange={e => setProductForm({
                ...productForm,
                name: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="Enter product name" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Price (GYD)</label>
                  <input type="number" min="0" value={productForm.price} onChange={e => setProductForm({
                ...productForm,
                price: parseInt(e.target.value) || 0
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Category</label>
                  <input type="text" value={productForm.category} onChange={e => setProductForm({
                ...productForm,
                category: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="e.g. Grains, Dairy, Medicine" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Unit</label>
                  <input type="text" value={productForm.unit} onChange={e => setProductForm({
                ...productForm,
                unit: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="e.g. 2kg, 1L, Pack of 10" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Description</label>
                  <textarea value={productForm.description} onChange={e => setProductForm({
                ...productForm,
                description: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100 min-h-[80px]" placeholder="Product description" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Image URL</label>
                  <input type="url" value={productForm.imageUrl} onChange={e => setProductForm({
                ...productForm,
                imageUrl: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="https://..." />
                </div>

                <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                  <span className="font-bold text-sm">In Stock</span>
                  <button onClick={() => setProductForm({
                ...productForm,
                inStock: !productForm.inStock
              })} className={`w-12 h-6 rounded-full transition-colors relative ${productForm.inStock ? 'bg-green-600' : 'bg-gray-200'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${productForm.inStock ? 'translate-x-6' : 'translate-x-0.5'}`} />
                  </button>
                </div>

                <div className="flex space-x-3">
                  <button onClick={() => setShowProductForm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">
                    Cancel
                  </button>
                  <button onClick={handleSaveProduct} className="flex-1 py-3 bg-green-600 text-white font-bold rounded-2xl shadow-lg shadow-green-200">
                    {editingProduct ? 'Save Changes' : 'Add Product'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>}

        {/* Delete Product Confirmation */}
        {showDeleteProductConfirm && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90] flex items-center justify-center px-6" onClick={() => setShowDeleteProductConfirm(false)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl p-6" onClick={e => e.stopPropagation()}>
              <h3 className="text-xl font-bold mb-2">Delete Product?</h3>
              <p className="text-sm text-gray-600 mb-6">Are you sure you want to delete {productToDelete?.name}? This action cannot be undone.</p>
              <div className="flex space-x-3">
                <button onClick={() => setShowDeleteProductConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">
                  Cancel
                </button>
                <button onClick={confirmDeleteProduct} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl">
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>}

        {/* Category Audit Screen */}
        {showCategoryAudit && <CategoryAuditScreen products={products} stores={stores} onBack={() => setShowCategoryAudit(false)} onFixCategory={handleFixCategory} />}
      </AnimatePresence>

      {/* Toast Notification */}
      <AnimatePresence>
        {toast.show && <motion.div initial={{
        y: 100,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} exit={{
        y: 100,
        opacity: 0
      }} className={`fixed bottom-24 left-4 right-4 ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'} text-white px-6 py-4 rounded-2xl shadow-xl z-[100] flex items-center justify-center`}>
            <CheckCircle2 size={20} className="mr-2" />
            <span className="font-bold">{toast.message}</span>
          </motion.div>}
      </AnimatePresence>
    </div>;
};