import React, { useState, useMemo, useEffect } from 'react';
import { ShoppingBag, MapPin, Search, ChevronRight, Star, Clock, TrendingUp, Heart, Navigation, ArrowLeft, Filter, ShoppingCart, Plus, Minus, MessageSquare, Truck, Package, CheckCircle2, Store, User, History, CreditCard, Settings, X, MapPinned, Home, StickyNote, RefreshCw, Wallet, DollarSign, Bell, Smartphone, Wifi, Edit, Utensils, Pill, Wine, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types & Data ---

type Category = 'Supermarket' | 'Pharmacy' | 'Mini Mart' | 'Local Market' | 'Restaurant';
type TopShortcut = 'groceries' | 'restaurants' | 'pharmacy' | 'alcohol' | 'courier';
type GrocerySection = 'freshProduce' | 'meatSeafood' | 'importedFoods' | 'snacks' | 'household';

// Full grocery category tree
type MainCategory = 'Fresh Produce' | 'Meat, Poultry & Seafood' | 'Dairy & Eggs' | 'Bakery & Bread' | 'Pantry & Dry Goods' | 'Frozen Foods' | 'Snacks & Sweets' | 'Beverages' | 'Cooking Oils, Sauces & Spices' | 'Breakfast & Cereals' | 'Imported & International Foods' | 'Organic & Health Foods' | 'Baby & Kids' | 'Household Essentials' | 'Personal Care & Beauty' | 'Pharmacy' | 'Alcohol' | 'Pet Supplies';
interface StoreType {
  id: string;
  name: string;
  category: Category;
  rating: number;
  deliveryTime: string;
  deliveryFee: number;
  imageUrl: string;
  distance: string;
  featured?: boolean;
}
interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  storeId: string;
  category: string;
  mainCategory: MainCategory;
  unit: string;
  description: string;
  // Product tags for filtering
  imported?: boolean;
  organic?: boolean;
  glutenFree?: boolean;
  halal?: boolean;
  kosher?: boolean;
  americanBrand?: boolean;
}
interface CartItem extends Product {
  quantity: number;
}

// Filter state
interface FilterState {
  importedOnly: boolean;
  organic: boolean;
  glutenFree: boolean;
  halal: boolean;
  kosher: boolean;
  americanBrands: boolean;
}

// Checkout types
type AddressMode = 'saved' | 'live' | 'new';
type AddressLabel = 'Home' | 'Work' | 'Other';
interface AddressForm {
  fullName: string;
  phone: string;
  addressLine: string;
  area: string;
  isPinned: boolean;
  label?: AddressLabel;
  saveToProfile?: boolean;
  savePersonalInfo?: boolean;
}
interface DeliveryNotesForm {
  instructions: string;
  leaveAtDoor: boolean;
  callOnArrival: boolean;
  deliveryTime: 'asap' | 'schedule';
  scheduledTime: string;
}
interface SubstitutionForm {
  allowSubstitutions: boolean;
  substitutionPreference: 'contact' | 'auto';
}
interface PaymentForm {
  method: 'cash' | 'mmg' | 'card';
  tip: number;
}

// Profile types
type ProfileScreen = 'main' | 'orderHistory' | 'paymentMethods' | 'savedAddresses' | 'settings';
interface SavedAddress {
  id: string;
  label: string;
  fullName: string;
  phone: string;
  addressLine: string;
  area: string;
  isDefault: boolean;
}
interface OrderHistoryItem {
  id: string;
  storeName: string;
  date: string;
  itemCount: number;
  total: number;
  status: 'Delivered' | 'In Transit';
  items: string[];
}

// Customer Profile
interface CustomerProfile {
  fullName: string;
  phone: string;
  defaultAddressId: string | null;
  savedAddresses: SavedAddress[];
}
const DELIVERY_FEE_GYD = 500;
const SERVICE_FEE_GYD = 150;

// Top Shortcuts Configuration
const TOP_SHORTCUTS: {
  id: TopShortcut;
  icon: React.ReactNode;
  label: string;
}[] = [{
  id: 'groceries',
  icon: <ShoppingBag size={18} />,
  label: 'Groceries'
}, {
  id: 'restaurants',
  icon: <Utensils size={18} />,
  label: 'Restaurants'
}, {
  id: 'pharmacy',
  icon: <Pill size={18} />,
  label: 'Pharmacy'
}, {
  id: 'alcohol',
  icon: <Wine size={18} />,
  label: 'Alcohol'
}, {
  id: 'courier',
  icon: <FileText size={18} />,
  label: 'Courier'
}];

// Grocery Sections Configuration
const GROCERY_SECTIONS: {
  id: GrocerySection;
  label: string;
  mainCategories: MainCategory[];
}[] = [{
  id: 'freshProduce',
  label: 'Fresh Produce',
  mainCategories: ['Fresh Produce']
}, {
  id: 'meatSeafood',
  label: 'Meat & Seafood',
  mainCategories: ['Meat, Poultry & Seafood']
}, {
  id: 'importedFoods',
  label: 'Imported Foods',
  mainCategories: ['Imported & International Foods']
}, {
  id: 'snacks',
  label: 'Snacks',
  mainCategories: ['Snacks & Sweets']
}, {
  id: 'household',
  label: 'Household',
  mainCategories: ['Household Essentials', 'Personal Care & Beauty']
}];
const CATEGORIES: {
  name: Category;
  icon: React.ReactNode;
  color: string;
}[] = [{
  name: 'Supermarket',
  icon: <ShoppingBag size={20} />,
  color: 'bg-green-100 text-green-700'
}, {
  name: 'Pharmacy',
  icon: <Plus size={20} />,
  color: 'bg-red-100 text-red-700'
}, {
  name: 'Mini Mart',
  icon: <Store size={20} />,
  color: 'bg-yellow-100 text-yellow-700'
}, {
  name: 'Local Market',
  icon: <TrendingUp size={20} />,
  color: 'bg-orange-100 text-orange-700'
}, {
  name: 'Restaurant',
  icon: <TrendingUp size={20} />,
  color: 'bg-blue-100 text-blue-700'
}];
const MOCK_STORES: StoreType[] = [{
  id: 's1',
  name: 'Bounty Supermarket',
  category: 'Supermarket',
  rating: 4.8,
  deliveryTime: '25-35',
  deliveryFee: 500,
  imageUrl: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&q=80&w=400',
  distance: '1.2 km',
  featured: true
}, {
  id: 's2',
  name: 'Survival Pharmacy',
  category: 'Pharmacy',
  rating: 4.9,
  deliveryTime: '15-20',
  deliveryFee: 300,
  imageUrl: 'https://images.unsplash.com/photo-1587854692152-cbe660dbbb88?auto=format&fit=crop&q=80&w=400',
  distance: '0.8 km'
}, {
  id: 's3',
  name: 'Gifts & More Mini Mart',
  category: 'Mini Mart',
  rating: 4.2,
  deliveryTime: '30-45',
  deliveryFee: 600,
  imageUrl: 'https://images.unsplash.com/photo-1604719312563-8912e9223c6a?auto=format&fit=crop&q=80&w=400',
  distance: '2.5 km'
}, {
  id: 's4',
  name: 'Stabroek Market',
  category: 'Local Market',
  rating: 4.5,
  deliveryTime: '40-60',
  deliveryFee: 800,
  imageUrl: 'https://images.unsplash.com/photo-1533900298318-6b8da08a523e?auto=format&fit=crop&q=80&w=400',
  distance: '3.1 km'
}, {
  id: 's5',
  name: 'Massy Stores',
  category: 'Supermarket',
  rating: 4.7,
  deliveryTime: '20-30',
  deliveryFee: 450,
  imageUrl: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400',
  distance: '1.5 km'
}, {
  id: 's6',
  name: 'The Grill House',
  category: 'Restaurant',
  rating: 4.6,
  deliveryTime: '35-45',
  deliveryFee: 600,
  imageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&q=80&w=400',
  distance: '2.0 km',
  featured: true
}];
const MOCK_PRODUCTS: Product[] = [
// Fresh Produce
{
  id: 'p1',
  name: 'Organic Bananas',
  price: 450,
  image: 'https://images.unsplash.com/photo-1571771894821-ad9958a35c47?auto=format&fit=crop&q=80&w=400',
  storeId: 's4',
  category: 'Fruits',
  mainCategory: 'Fresh Produce',
  unit: 'Bunch',
  description: 'Freshly harvested local bananas.',
  organic: true
}, {
  id: 'p2',
  name: 'Fresh Tomatoes',
  price: 350,
  image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?auto=format&fit=crop&q=80&w=400',
  storeId: 's1',
  category: 'Vegetables',
  mainCategory: 'Fresh Produce',
  unit: 'lb',
  description: 'Fresh vine-ripened tomatoes.'
},
// Pantry & Dry Goods
{
  id: 'p3',
  name: 'Premium Jasmine Rice',
  price: 1250,
  image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
  storeId: 's1',
  category: 'Rice & Grains',
  mainCategory: 'Pantry & Dry Goods',
  unit: '2kg',
  description: 'Long-grain fragrant rice perfect for daily use.',
  imported: true
},
// Dairy & Eggs
{
  id: 'p4',
  name: 'Whole Milk',
  price: 650,
  image: 'https://images.unsplash.com/photo-1550583724-125581cc258b?auto=format&fit=crop&q=80&w=400',
  storeId: 's1',
  category: 'Milk',
  mainCategory: 'Dairy & Eggs',
  unit: '1L',
  description: 'Fresh full cream milk from local farms.'
}, {
  id: 'p5',
  name: 'Local Eggs',
  price: 1100,
  image: 'https://images.unsplash.com/photo-1582722872445-44ad5c7cf04d?auto=format&fit=crop&q=80&w=400',
  storeId: 's4',
  category: 'Eggs',
  mainCategory: 'Dairy & Eggs',
  unit: '30 pack',
  description: 'Farm fresh large eggs.'
},
// Pharmacy
{
  id: 'p6',
  name: 'Paracetamol 500mg',
  price: 200,
  image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&q=80&w=400',
  storeId: 's2',
  category: 'OTC Medicine',
  mainCategory: 'Pharmacy',
  unit: 'Pack of 10',
  description: 'Fast relief from pain and fever.'
},
// Snacks & Sweets
{
  id: 'p7',
  name: 'Lays Potato Chips',
  price: 450,
  image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?auto=format&fit=crop&q=80&w=400',
  storeId: 's1',
  category: 'Chips',
  mainCategory: 'Snacks & Sweets',
  unit: '150g',
  description: 'Classic salted potato chips.',
  americanBrand: true,
  imported: true
}, {
  id: 'p8',
  name: 'Cadbury Dairy Milk',
  price: 380,
  image: 'https://images.unsplash.com/photo-1511381939415-e44015466834?auto=format&fit=crop&q=80&w=400',
  storeId: 's3',
  category: 'Chocolate',
  mainCategory: 'Snacks & Sweets',
  unit: '100g',
  description: 'Classic milk chocolate bar.',
  imported: true
},
// Imported & International Foods
{
  id: 'p9',
  name: 'Kelloggs Corn Flakes',
  price: 850,
  image: 'https://images.unsplash.com/photo-1517686468506-a8da13d82791?auto=format&fit=crop&q=80&w=400',
  storeId: 's1',
  category: 'Cereal',
  mainCategory: 'Imported & International Foods',
  unit: '500g',
  description: 'Classic breakfast cereal.',
  americanBrand: true,
  imported: true
}, {
  id: 'p10',
  name: 'Heinz Tomato Ketchup',
  price: 550,
  image: 'https://images.unsplash.com/photo-1584949091598-c31daaaa4aa9?auto=format&fit=crop&q=80&w=400',
  storeId: 's1',
  category: 'Sauces',
  mainCategory: 'Imported & International Foods',
  unit: '400ml',
  description: 'Classic American ketchup.',
  americanBrand: true,
  imported: true
},
// Meat, Poultry & Seafood
{
  id: 'p11',
  name: 'Fresh Chicken Breast',
  price: 1350,
  image: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&q=80&w=400',
  storeId: 's1',
  category: 'Chicken',
  mainCategory: 'Meat, Poultry & Seafood',
  unit: '1kg',
  description: 'Fresh boneless chicken breast.',
  halal: true
}, {
  id: 'p12',
  name: 'Atlantic Salmon Fillet',
  price: 2200,
  image: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&q=80&w=400',
  storeId: 's1',
  category: 'Fish & Shrimp',
  mainCategory: 'Meat, Poultry & Seafood',
  unit: '500g',
  description: 'Premium fresh salmon.',
  imported: true
},
// Household Essentials
{
  id: 'p13',
  name: 'Tide Laundry Detergent',
  price: 1250,
  image: 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=400',
  storeId: 's1',
  category: 'Laundry',
  mainCategory: 'Household Essentials',
  unit: '1kg',
  description: 'Powerful cleaning detergent.',
  americanBrand: true,
  imported: true
}, {
  id: 'p14',
  name: 'Charmin Toilet Paper',
  price: 950,
  image: 'https://images.unsplash.com/photo-1584556326561-c8c2c2c67ce8?auto=format&fit=crop&q=80&w=400',
  storeId: 's3',
  category: 'Toilet Paper',
  mainCategory: 'Household Essentials',
  unit: '12 rolls',
  description: 'Soft and strong toilet paper.',
  americanBrand: true,
  imported: true
},
// Organic & Health Foods
{
  id: 'p15',
  name: 'Organic Quinoa',
  price: 1450,
  image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=400',
  storeId: 's1',
  category: 'Grains',
  mainCategory: 'Organic & Health Foods',
  unit: '500g',
  description: 'Premium organic quinoa.',
  organic: true,
  glutenFree: true,
  imported: true
}, {
  id: 'p16',
  name: 'Almond Milk',
  price: 850,
  image: 'https://images.unsplash.com/photo-1550583724-125581cc258b?auto=format&fit=crop&q=80&w=400',
  storeId: 's1',
  category: 'Dairy Alternatives',
  mainCategory: 'Organic & Health Foods',
  unit: '1L',
  description: 'Unsweetened almond milk.',
  organic: true,
  glutenFree: true
}];
const MOCK_ORDER_HISTORY: OrderHistoryItem[] = [{
  id: 'o1',
  storeName: 'Massy Stores',
  date: 'Mar 12, 2024',
  itemCount: 4,
  total: 4250,
  status: 'Delivered',
  items: ['Premium Jasmine Rice', 'Whole Milk', 'Local Eggs', 'Organic Bananas']
}, {
  id: 'o2',
  storeName: 'Bounty Supermarket',
  date: 'Mar 8, 2024',
  itemCount: 6,
  total: 6850,
  status: 'Delivered',
  items: ['Premium Jasmine Rice', 'Whole Milk', 'Local Eggs', 'Organic Bananas', 'Bread', 'Chicken']
}, {
  id: 'o3',
  storeName: 'Survival Pharmacy',
  date: 'Mar 5, 2024',
  itemCount: 2,
  total: 1200,
  status: 'In Transit',
  items: ['Paracetamol 500mg', 'Vicks Vaporub']
}];
const AREAS = ['Georgetown', 'Kitty', 'Alberttown', 'Ruimveldt', 'Sophia', 'Eccles', 'Diamond', 'Grove', 'Friendship'];
const formatCurrency = (amount: number) => `GYD $${amount.toLocaleString()}`;
const BottomNav = ({
  activeTab,
  setActiveTab
}: {
  activeTab: string;
  setActiveTab: (t: string) => void;
}) => {
  const tabs = [{
    id: 'home',
    icon: <ShoppingBag size={24} />,
    label: 'Shop'
  }, {
    id: 'search',
    icon: <Search size={24} />,
    label: 'Search'
  }, {
    id: 'orders',
    icon: <History size={24} />,
    label: 'Orders'
  }, {
    id: 'profile',
    icon: <User size={24} />,
    label: 'Profile'
  }];
  return <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-2 flex justify-between items-center z-50">
      {tabs.map(tab => <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center p-2 rounded-xl transition-all duration-200 ${activeTab === tab.id ? 'text-green-600' : 'text-gray-400 hover:text-gray-600'}`}>
          {tab.icon}
          <span className="text-[10px] font-medium mt-1">{tab.label}</span>
          {activeTab === tab.id && <motion.div layoutId="nav-pill" className="h-1 w-1 bg-green-600 rounded-full mt-1" />}
        </button>)}
    </div>;
};

// @component: GoYanaApp
export const GoYanaApp = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [orderStep, setOrderStep] = useState<'browsing' | 'tracking'>('browsing');

  // New state for shortcuts and filters
  const [topShortcut, setTopShortcut] = useState<TopShortcut>('groceries');
  const [grocerySection, setGrocerySection] = useState<GrocerySection>('freshProduce');
  const [filters, setFilters] = useState<FilterState>({
    importedOnly: false,
    organic: false,
    glutenFree: false,
    halal: false,
    kosher: false,
    americanBrands: false
  });
  const [showFilters, setShowFilters] = useState(false);

  // Profile navigation state
  const [profileScreen, setProfileScreen] = useState<ProfileScreen>('main');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutToast, setLogoutToast] = useState(false);

  // Add to cart confirmation toast
  const [addToCartToast, setAddToCartToast] = useState<string | null>(null);

  // Customer Profile (Mock logged-in user)
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile>({
    fullName: 'Johnathan Persaud',
    phone: '+592 612-3456',
    defaultAddressId: 'a1',
    savedAddresses: [{
      id: 'a1',
      label: 'Home',
      fullName: 'Johnathan Persaud',
      phone: '+592 612-3456',
      addressLine: '24 Brickdam Street',
      area: 'Georgetown',
      isDefault: true
    }, {
      id: 'a2',
      label: 'Work',
      fullName: 'Johnathan Persaud',
      phone: '+592 612-3456',
      addressLine: '10 Waterloo Street',
      area: 'Alberttown',
      isDefault: false
    }, {
      id: 'a3',
      label: 'Other',
      fullName: 'Johnathan Persaud',
      phone: '+592 612-3456',
      addressLine: '5 Lamaha Street',
      area: 'Kitty',
      isDefault: false
    }]
  });
  const isLoggedIn = true; // Assume logged in

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddressForm, setNewAddressForm] = useState({
    label: '',
    fullName: '',
    phone: '',
    addressLine: '',
    area: ''
  });

  // Settings state
  const [settingsState, setSettingsState] = useState({
    notifications: true,
    smsUpdates: true,
    lowDataMode: false
  });

  // Checkout state
  const [checkoutStep, setCheckoutStep] = useState(0); // 0 = cart review, 1-5 = checkout steps
  const [addressMode, setAddressMode] = useState<AddressMode>('saved');
  const [selectedSavedAddressId, setSelectedSavedAddressId] = useState<string | null>(null);
  const [addressSource, setAddressSource] = useState<string>(''); // Track where address came from
  const [addressForm, setAddressForm] = useState<AddressForm>({
    fullName: '',
    phone: '',
    addressLine: '',
    area: '',
    isPinned: false,
    label: 'Home',
    saveToProfile: true,
    savePersonalInfo: true
  });
  const [deliveryNotesForm, setDeliveryNotesForm] = useState<DeliveryNotesForm>({
    instructions: '',
    leaveAtDoor: false,
    callOnArrival: true,
    deliveryTime: 'asap',
    scheduledTime: '30mins'
  });
  const [substitutionForm, setSubstitutionForm] = useState<SubstitutionForm>({
    allowSubstitutions: true,
    substitutionPreference: 'contact'
  });
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    method: 'cash',
    tip: 0
  });
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [isLoadingLiveLocation, setIsLoadingLiveLocation] = useState(false);

  // Auto-populate on opening checkout address step
  useEffect(() => {
    if (checkoutStep === 1 && isLoggedIn) {
      // Pre-fill name and phone from customer profile
      setAddressForm(prev => ({
        ...prev,
        fullName: customerProfile.fullName,
        phone: customerProfile.phone
      }));

      // Auto-select default saved address if available
      if (customerProfile.defaultAddressId) {
        const defaultAddress = customerProfile.savedAddresses.find(addr => addr.id === customerProfile.defaultAddressId);
        if (defaultAddress) {
          setSelectedSavedAddressId(defaultAddress.id);
          setAddressForm({
            fullName: defaultAddress.fullName,
            phone: defaultAddress.phone,
            addressLine: defaultAddress.addressLine,
            area: defaultAddress.area,
            isPinned: false,
            label: defaultAddress.label as AddressLabel,
            saveToProfile: true,
            savePersonalInfo: true
          });
          setAddressSource('Saved');
        }
      }
    }
  }, [checkoutStep, isLoggedIn, customerProfile]);
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item => item.id === product.id ? {
          ...item,
          quantity: item.quantity + 1
        } : item);
      }
      return [...prev, {
        ...product,
        quantity: 1
      }];
    });

    // Show confirmation toast
    setAddToCartToast(product.name);
    setTimeout(() => setAddToCartToast(null), 2000);
  };
  const removeFromCart = (productId: string) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === productId);
      if (existing && existing.quantity > 1) {
        return prev.map(item => item.id === productId ? {
          ...item,
          quantity: item.quantity - 1
        } : item);
      }
      return prev.filter(item => item.id !== productId);
    });
  };
  const cartTotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((sum, item) => sum + item.quantity, 0), [cart]);

  // Filtered stores based on top shortcut
  const filteredStores = useMemo(() => {
    let stores = MOCK_STORES;

    // Filter by top shortcut
    switch (topShortcut) {
      case 'groceries':
        stores = stores.filter(s => s.category === 'Supermarket' || s.category === 'Mini Mart' || s.category === 'Local Market');
        break;
      case 'restaurants':
        stores = stores.filter(s => s.category === 'Restaurant');
        break;
      case 'pharmacy':
        stores = stores.filter(s => s.category === 'Pharmacy');
        break;
      case 'alcohol':
        // Scaffold: placeholder for alcohol stores
        stores = [];
        break;
      case 'courier':
        // Scaffold: placeholder for courier services
        stores = [];
        break;
    }

    // Apply search query
    if (searchQuery) {
      stores = stores.filter(store => store.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return stores;
  }, [topShortcut, searchQuery]);

  // Filtered products for store catalog
  const storeProducts = useMemo(() => {
    if (!selectedStore) return [];
    let products = MOCK_PRODUCTS.filter(p => p.storeId === selectedStore.id);

    // Apply grocery section filter if grocery store
    if (topShortcut === 'groceries' && (selectedStore.category === 'Supermarket' || selectedStore.category === 'Mini Mart' || selectedStore.category === 'Local Market')) {
      const section = GROCERY_SECTIONS.find(s => s.id === grocerySection);
      if (section) {
        products = products.filter(p => section.mainCategories.includes(p.mainCategory));
      }
    }

    // Apply filters
    if (filters.importedOnly) {
      products = products.filter(p => p.imported);
    }
    if (filters.organic) {
      products = products.filter(p => p.organic);
    }
    if (filters.glutenFree) {
      products = products.filter(p => p.glutenFree);
    }
    if (filters.halal) {
      products = products.filter(p => p.halal);
    }
    if (filters.kosher) {
      products = products.filter(p => p.kosher);
    }
    if (filters.americanBrands) {
      products = products.filter(p => p.americanBrand);
    }
    return products;
  }, [selectedStore, grocerySection, filters, topShortcut]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some(v => v === true);
  }, [filters]);

  // Validation
  const isAddressValid = addressForm.fullName.trim() !== '' && addressForm.phone.trim() !== '' && addressForm.addressLine.trim() !== '' && addressForm.area !== '';
  const canProceedToNextStep = () => {
    if (checkoutStep === 1) return isAddressValid;
    return true; // Other steps have no hard validation
  };
  const handleNextStep = () => {
    if (checkoutStep === 5) {
      // Confirm order
      setIsCartOpen(false);
      setSelectedStore(null);
      setSelectedProduct(null);
      setOrderStep('tracking');
      setActiveTab('orders');
      setCart([]);
      setCheckoutStep(0);
      // Reset forms
      setAddressForm({
        fullName: '',
        phone: '',
        addressLine: '',
        area: '',
        isPinned: false,
        label: 'Home',
        saveToProfile: true,
        savePersonalInfo: true
      });
      setDeliveryNotesForm({
        instructions: '',
        leaveAtDoor: false,
        callOnArrival: true,
        deliveryTime: 'asap',
        scheduledTime: '30mins'
      });
      setSubstitutionForm({
        allowSubstitutions: true,
        substitutionPreference: 'contact'
      });
      setPaymentForm({
        method: 'cash',
        tip: 0
      });
      setAddressMode('saved');
      setSelectedSavedAddressId(null);
      setAddressSource('');
    } else if (checkoutStep === 0) {
      setCheckoutStep(1);
    } else if (checkoutStep === 1) {
      // Save to profile if enabled
      if (addressMode === 'new' && addressForm.saveToProfile) {
        const newAddress: SavedAddress = {
          id: `a${Date.now()}`,
          label: addressForm.label || 'Home',
          fullName: addressForm.fullName,
          phone: addressForm.phone,
          addressLine: addressForm.addressLine,
          area: addressForm.area,
          isDefault: false
        };
        setCustomerProfile(prev => ({
          ...prev,
          fullName: addressForm.savePersonalInfo ? addressForm.fullName : prev.fullName,
          phone: addressForm.savePersonalInfo ? addressForm.phone : prev.phone,
          savedAddresses: [...prev.savedAddresses, newAddress]
        }));
      }
      setCheckoutStep(prev => Math.min(5, prev + 1));
    } else {
      setCheckoutStep(prev => Math.min(5, prev + 1));
    }
  };
  const handleBackStep = () => {
    if (checkoutStep === 1) {
      setCheckoutStep(0);
    } else {
      setCheckoutStep(prev => Math.max(1, prev - 1));
    }
  };
  const grandTotal = cartTotal + DELIVERY_FEE_GYD + SERVICE_FEE_GYD + paymentForm.tip;

  // Profile handlers
  const handleReorder = (order: OrderHistoryItem) => {
    // Mock reorder: add a few items to cart
    const itemsToAdd = MOCK_PRODUCTS.slice(0, 2);
    itemsToAdd.forEach(product => addToCart(product));
    setProfileScreen('main');
    setActiveTab('home');
    setIsCartOpen(true);
  };
  const handleLogout = () => {
    setShowLogoutConfirm(false);
    // Reset state to initial values
    setCart([]);
    setSelectedStore(null);
    setSelectedProduct(null);
    setOrderStep('browsing');
    setProfileScreen('main');
    setIsCartOpen(false);
    setCheckoutStep(0);
    // Show logout toast
    setLogoutToast(true);
    setTimeout(() => setLogoutToast(false), 3000);
  };
  const handleAddAddress = () => {
    if (newAddressForm.fullName && newAddressForm.phone && newAddressForm.addressLine && newAddressForm.area) {
      const newAddress: SavedAddress = {
        id: `a${Date.now()}`,
        label: newAddressForm.label || 'Other',
        fullName: newAddressForm.fullName,
        phone: newAddressForm.phone,
        addressLine: newAddressForm.addressLine,
        area: newAddressForm.area,
        isDefault: false
      };
      setCustomerProfile(prev => ({
        ...prev,
        savedAddresses: [...prev.savedAddresses, newAddress]
      }));
      setShowAddAddressModal(false);
      setNewAddressForm({
        label: '',
        fullName: '',
        phone: '',
        addressLine: '',
        area: ''
      });
    }
  };
  const handleSetDefaultAddress = (addressId: string) => {
    setCustomerProfile(prev => ({
      ...prev,
      defaultAddressId: addressId,
      savedAddresses: prev.savedAddresses.map(addr => ({
        ...addr,
        isDefault: addr.id === addressId
      }))
    }));
  };

  // Address mode handlers
  const handleSelectSavedAddress = (addressId: string) => {
    const address = customerProfile.savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      setSelectedSavedAddressId(addressId);
      setAddressForm({
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        area: address.area,
        isPinned: false,
        label: address.label as AddressLabel,
        saveToProfile: true,
        savePersonalInfo: true
      });
      setAddressSource('Saved');
    }
  };
  const handleUseLiveLocation = () => {
    setIsLoadingLiveLocation(true);
    // Mock GPS loading
    setTimeout(() => {
      setAddressForm({
        fullName: customerProfile.fullName,
        phone: customerProfile.phone,
        addressLine: '47 Main Street (Current Location)',
        area: 'Georgetown',
        isPinned: true,
        label: 'Home',
        saveToProfile: true,
        savePersonalInfo: true
      });
      setAddressSource('Live');
      setIsLoadingLiveLocation(false);
    }, 1500);
  };
  const handleSwitchToNewMode = () => {
    setAddressMode('new');
    setAddressForm({
      fullName: customerProfile.fullName,
      phone: customerProfile.phone,
      addressLine: '',
      area: '',
      isPinned: false,
      label: 'Home',
      saveToProfile: true,
      savePersonalInfo: true
    });
    setAddressSource('');
  };
  const handleEditAddress = (addressId: string) => {
    const address = customerProfile.savedAddresses.find(addr => addr.id === addressId);
    if (address) {
      setEditingAddressId(addressId);
      setNewAddressForm({
        label: address.label,
        fullName: address.fullName,
        phone: address.phone,
        addressLine: address.addressLine,
        area: address.area
      });
      setShowEditAddressModal(true);
    }
  };
  const handleSaveEditedAddress = () => {
    if (editingAddressId && newAddressForm.fullName && newAddressForm.phone && newAddressForm.addressLine && newAddressForm.area) {
      setCustomerProfile(prev => ({
        ...prev,
        savedAddresses: prev.savedAddresses.map(addr => addr.id === editingAddressId ? {
          ...addr,
          label: newAddressForm.label || 'Other',
          fullName: newAddressForm.fullName,
          phone: newAddressForm.phone,
          addressLine: newAddressForm.addressLine,
          area: newAddressForm.area
        } : addr)
      }));
      setShowEditAddressModal(false);
      setEditingAddressId(null);
      setNewAddressForm({
        label: '',
        fullName: '',
        phone: '',
        addressLine: '',
        area: ''
      });
    }
  };

  // Filter handlers
  const toggleFilter = (filterKey: keyof FilterState) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey]
    }));
  };
  const clearAllFilters = () => {
    setFilters({
      importedOnly: false,
      organic: false,
      glutenFree: false,
      halal: false,
      kosher: false,
      americanBrands: false
    });
  };

  // Check if store is grocery type
  const isGroceryStore = (store: StoreType | null) => {
    if (!store) return false;
    return store.category === 'Supermarket' || store.category === 'Mini Mart' || store.category === 'Local Market';
  };

  // @return
  return <div className="flex flex-col min-h-screen bg-gray-50 text-gray-900 font-sans max-w-md mx-auto shadow-2xl relative overflow-hidden">
      {/* --- Top Bar --- */}
      <header className="px-6 pt-12 pb-4 bg-white sticky top-0 z-30 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center space-x-2">
            <div className="bg-green-600 text-white p-2 rounded-xl">
              <Package size={20} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-green-700 tracking-tight leading-tight">
                GoYana
              </h1>
              <div className="flex items-center text-gray-500 text-xs font-medium">
                <MapPin size={12} className="mr-1 text-green-600" />
                <span>Georgetown, GY</span>
              </div>
            </div>
          </div>

          <button onClick={() => setIsCartOpen(true)} className="relative p-2 bg-gray-100 rounded-full text-gray-700">
            <ShoppingCart size={22} />
            {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-yellow-400 text-yellow-950 text-[10px] font-bold h-5 w-5 flex items-center justify-center rounded-full border-2 border-white">
                {cartCount}
              </span>}
          </button>
        </div>

        {activeTab === 'home' && <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input type="text" placeholder="Search items or stores..." className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-all" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
          </div>}
      </header>

      {/* --- Main Content Area --- */}
      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        {activeTab === 'home' && <div className="space-y-6">
            {/* Top Row Shortcuts */}
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
              {TOP_SHORTCUTS.map(shortcut => <button key={shortcut.id} onClick={() => {
            setTopShortcut(shortcut.id);
          }} className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${topShortcut === shortcut.id ? 'bg-green-600 text-white shadow-md' : 'bg-white text-gray-600 shadow-sm'}`}>
                  {shortcut.icon}
                  <span>{shortcut.label}</span>
                </button>)}
            </div>

            {/* Grocery Sections (shown when groceries shortcut is active) */}
            {topShortcut === 'groceries' && <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-hide">
                {GROCERY_SECTIONS.map(section => <button key={section.id} onClick={() => setGrocerySection(section.id)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${grocerySection === section.id ? 'bg-yellow-400 text-yellow-950 shadow-md' : 'bg-white text-gray-600 border border-gray-200'}`}>
                    {section.label}
                  </button>)}
              </div>}

            {/* Placeholder for Alcohol */}
            {topShortcut === 'alcohol' && <div className="text-center py-12 space-y-4">
                <Wine size={64} className="mx-auto text-gray-300" />
                <div>
                  <h3 className="font-bold text-lg text-gray-700">Alcohol Delivery</h3>
                  <p className="text-sm text-gray-500 mt-2">Coming soon to GoYana</p>
                </div>
              </div>}

            {/* Placeholder for Courier */}
            {topShortcut === 'courier' && <div className="text-center py-12 space-y-4">
                <FileText size={64} className="mx-auto text-gray-300" />
                <div>
                  <h3 className="font-bold text-lg text-gray-700">Courier Services</h3>
                  <p className="text-sm text-gray-500 mt-2">Send packages across Georgetown</p>
                  <p className="text-xs text-gray-400 mt-1">Coming soon</p>
                </div>
              </div>}

            {/* Featured Section */}
            {!searchQuery && topShortcut !== 'alcohol' && topShortcut !== 'courier' && <section>
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-lg font-bold">Featured Today</h2>
                  <button className="text-green-600 text-sm font-semibold">See All</button>
                </div>

                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                  {MOCK_STORES.filter(s => s.featured).map(store => <motion.div key={store.id} whileTap={{
              scale: 0.98
            }} onClick={() => setSelectedStore(store)} className="min-w-[280px] bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer">
                      <div className="h-36 relative">
                        <img src={store.imageUrl} alt={store.name} className="w-full h-full object-cover" />
                        <div className="absolute top-3 left-3 bg-yellow-400 text-yellow-950 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
                          Recommended
                        </div>
                      </div>

                      <div className="p-4">
                        <div className="flex justify-between items-start">
                          <h3 className="font-bold text-lg">{store.name}</h3>
                          <div className="flex items-center bg-green-50 px-2 py-1 rounded-lg">
                            <Star size={14} className="text-yellow-500 fill-yellow-500 mr-1" />
                            <span className="text-xs font-bold">{store.rating}</span>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-500 text-xs mt-1 space-x-2 font-medium">
                          <span>{store.category}</span>
                          <span>•</span>
                          <span className="flex items-center">
                            <Clock size={12} className="mr-1" /> {store.deliveryTime} min
                          </span>
                          <span>•</span>
                          <span>{formatCurrency(store.deliveryFee)} fee</span>
                        </div>
                      </div>
                    </motion.div>)}
                </div>
              </section>}

            {/* Stores List */}
            {topShortcut !== 'alcohol' && topShortcut !== 'courier' && <section className="space-y-4">
                <h2 className="text-lg font-bold">
                  Near Georgetown
                </h2>

                {filteredStores.length === 0 && <div className="text-center py-12 text-gray-500">
                    <Store size={48} className="mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No stores found</p>
                  </div>}

                {filteredStores.map(store => <motion.div key={store.id} layout onClick={() => setSelectedStore(store)} className="flex bg-white p-3 rounded-2xl shadow-sm border border-gray-100 hover:border-green-200 transition-colors cursor-pointer">
                    <img src={store.imageUrl} alt={store.name} className="w-20 h-20 rounded-xl object-cover" />
                    <div className="ml-4 flex-1 flex flex-col justify-center">
                      <div className="flex justify-between items-start">
                        <h3 className="font-bold text-gray-900">{store.name}</h3>
                        <button className="text-gray-300">
                          <Heart size={18} />
                        </button>
                      </div>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {store.category} • {store.distance}
                      </p>
                      <div className="flex items-center mt-2 space-x-3">
                        <div className="flex items-center text-xs font-bold text-green-700">
                          <Clock size={14} className="mr-1" />
                          {store.deliveryTime}m
                        </div>
                        <div className="flex items-center text-xs font-bold text-yellow-600">
                          <Star size={14} className="mr-1 fill-yellow-500" />
                          {store.rating}
                        </div>
                      </div>
                    </div>
                  </motion.div>)}
              </section>}
          </div>}

        {activeTab === 'search' && <div className="space-y-6">
            <h2 className="text-xl font-bold">Popular Categories</h2>
            <div className="grid grid-cols-2 gap-4">
              {CATEGORIES.map(cat => <div key={cat.name} className={`${cat.color} p-6 rounded-3xl flex flex-col items-center justify-center text-center space-y-2 cursor-pointer hover:opacity-90 transition-opacity`} onClick={() => {
            // Navigate to home and let top shortcuts handle the filtering
            setActiveTab('home');
          }}>
                  <div className="bg-white/40 p-3 rounded-2xl">{cat.icon}</div>
                  <span className="font-bold">{cat.name}</span>
                </div>)}
            </div>

            <h2 className="text-xl font-bold mt-8">Recent Searches</h2>
            <div className="flex flex-wrap gap-2">
              {['Milo', 'Bread', 'Chicken', 'Vicks Vaporub', 'Coke 2L'].map(tag => <button key={tag} className="px-4 py-2 bg-white rounded-full text-sm font-medium border border-gray-100 text-gray-600 active:bg-gray-100">
                  {tag}
                </button>)}
            </div>
          </div>}

        {activeTab === 'orders' && <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-6">Your Orders</h2>

            {orderStep === 'tracking' && <div className="bg-green-50 border-2 border-green-200 rounded-3xl p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Truck size={80} className="text-green-800" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center space-x-2 text-green-800 font-bold mb-2">
                    <span className="flex h-3 w-3 rounded-full bg-green-600 animate-pulse" />
                    <span>Order In Transit</span>
                  </div>
                  <h3 className="text-lg font-bold text-green-900">Arriving in 12 mins</h3>
                  <p className="text-sm text-green-700 mb-4">Driver: Kevon (White Axio)</p>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-green-600 text-white py-2 rounded-xl text-sm font-bold flex items-center justify-center">
                      <Navigation size={16} className="mr-2" /> Track
                    </button>
                    <button className="bg-white text-green-700 px-4 py-2 rounded-xl border border-green-200">
                      <MessageSquare size={18} />
                    </button>
                  </div>
                </div>
              </div>}

            <div className="space-y-4">
              {[1, 2].map(i => <div key={i} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-500 mr-3">
                        <Store size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-sm">Massy Stores</h4>
                        <p className="text-[10px] text-gray-500 font-medium">Mar 12, 2024 • 4 items</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-green-600">Delivered</p>
                      <p className="text-[10px] text-gray-500 font-bold tracking-tight">GYD $4,250</p>
                    </div>
                  </div>
                  <button className="w-full py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl border border-gray-100 hover:bg-gray-100 transition-colors">
                    Order Details
                  </button>
                </div>)}
            </div>
          </div>}

        {activeTab === 'profile' && profileScreen === 'main' && <div className="space-y-8">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-green-100 rounded-full border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                <img src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100" alt="profile" className="w-full h-full object-cover" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Johnathan Persaud</h2>
                <p className="text-sm text-gray-500">+592 612-3456</p>
                <div className="flex items-center mt-1">
                  <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    Gold Member
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs font-medium">Credits</p>
                <p className="text-xl font-bold text-green-600">GYD $1,200</p>
              </div>
              <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <p className="text-gray-500 text-xs font-medium">Points</p>
                <p className="text-xl font-bold text-yellow-600">850</p>
              </div>
            </div>

            <div className="space-y-2">
              {[{
            icon: <History size={20} />,
            label: 'Order History',
            color: 'text-blue-500',
            screen: 'orderHistory' as ProfileScreen
          }, {
            icon: <CreditCard size={20} />,
            label: 'Payment Methods',
            color: 'text-purple-500',
            screen: 'paymentMethods' as ProfileScreen
          }, {
            icon: <MapPin size={20} />,
            label: 'Saved Addresses',
            color: 'text-red-500',
            screen: 'savedAddresses' as ProfileScreen
          }, {
            icon: <Settings size={20} />,
            label: 'Settings',
            color: 'text-gray-500',
            screen: 'settings' as ProfileScreen
          }].map((item, idx) => <button key={idx} onClick={() => setProfileScreen(item.screen)} className="w-full flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 group">
                  <div className="flex items-center">
                    <div className={`${item.color} bg-opacity-10 p-2 rounded-lg mr-3`}>{item.icon}</div>
                    <span className="font-bold text-gray-700">{item.label}</span>
                  </div>
                  <ChevronRight size={20} className="text-gray-300 group-hover:text-gray-600 transition-colors" />
                </button>)}
            </div>

            <button onClick={() => setShowLogoutConfirm(true)} className="w-full py-4 bg-white text-red-500 font-bold rounded-2xl border-2 border-red-50 border-dashed hover:bg-red-50 transition-colors">
              Log Out
            </button>
          </div>}
      </main>

      {/* --- Overlay Modals --- */}
      <AnimatePresence>
        {/* Profile Screens */}
        {profileScreen !== 'main' && activeTab === 'profile' && <motion.div initial={{
        x: '100%'
      }} animate={{
        x: 0
      }} exit={{
        x: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200
      }} className="fixed inset-0 bg-white z-[60] flex flex-col">
            <div className="px-6 pt-12 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
              <div className="flex items-center">
                <button onClick={() => setProfileScreen('main')} className="mr-4 p-2 text-gray-400">
                  <ArrowLeft size={24} />
                </button>
                <h2 className="text-xl font-bold">
                  {profileScreen === 'orderHistory' && 'Order History'}
                  {profileScreen === 'paymentMethods' && 'Payment Methods'}
                  {profileScreen === 'savedAddresses' && 'Saved Addresses'}
                  {profileScreen === 'settings' && 'Settings'}
                </h2>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-6">
              {/* Order History Screen */}
              {profileScreen === 'orderHistory' && <div className="space-y-4">
                  {MOCK_ORDER_HISTORY.map(order => <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex items-center">
                          <div className="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-500 mr-3">
                            <Store size={24} />
                          </div>
                          <div>
                            <h4 className="font-bold text-base">{order.storeName}</h4>
                            <p className="text-xs text-gray-500 font-medium">{order.date} • {order.itemCount} items</p>
                          </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold ${order.status === 'Delivered' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>
                          {order.status}
                        </span>
                      </div>
                      
                      <div className="mb-3">
                        <p className="text-xs text-gray-500 mb-1">Items:</p>
                        <p className="text-sm text-gray-700">{order.items.join(', ')}</p>
                      </div>

                      <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                        <span className="font-bold text-sm text-green-600">GYD $4,250</span>
                        <button onClick={() => handleReorder(order)} className="px-4 py-2 bg-green-600 text-white text-xs font-bold rounded-xl hover:bg-green-700 transition-colors">
                          Reorder
                        </button>
                      </div>
                    </div>)}
                </div>}

              {/* Payment Methods Screen */}
              {profileScreen === 'paymentMethods' && <div className="space-y-4">
                  <div className="bg-white p-4 rounded-2xl border-2 border-green-200">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-xl mr-3 text-green-600">
                          <DollarSign size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-base">Cash on Delivery</p>
                          <p className="text-xs text-gray-500">Default payment method</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-3 rounded-xl mr-3 text-blue-600">
                          <Wallet size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-base">MMG / Wallet</p>
                          <p className="text-xs text-gray-500">Coming soon</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 opacity-60">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-3 rounded-xl mr-3 text-purple-600">
                          <CreditCard size={24} />
                        </div>
                        <div>
                          <p className="font-bold text-base">Credit/Debit Card</p>
                          <p className="text-xs text-gray-500">Coming soon</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-2xl">
                    <p className="text-sm text-blue-800 font-medium">
                      💳 More payment options coming soon
                    </p>
                  </div>
                </div>}

              {/* Saved Addresses Screen */}
              {profileScreen === 'savedAddresses' && <div className="space-y-4">
                  {customerProfile.savedAddresses.map(address => <div key={address.id} className={`bg-white p-4 rounded-2xl border-2 ${address.isDefault ? 'border-green-200' : 'border-gray-100'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center">
                          <div className={`${address.isDefault ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'} p-2 rounded-lg mr-3`}>
                            <MapPin size={20} />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <p className="font-bold text-base">{address.label}</p>
                              {address.isDefault && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                  Default
                                </span>}
                            </div>
                            <p className="text-sm text-gray-700 mt-1">{address.fullName}</p>
                          </div>
                        </div>
                        <button onClick={() => handleEditAddress(address.id)} className="p-1 text-gray-400 hover:text-gray-600">
                          <Edit size={16} />
                        </button>
                      </div>
                      
                      <div className="ml-11">
                        <p className="text-sm text-gray-600">{address.addressLine}</p>
                        <p className="text-sm text-gray-600">{address.area}</p>
                        <p className="text-sm text-gray-600">{address.phone}</p>
                      </div>

                      {!address.isDefault && <button onClick={() => handleSetDefaultAddress(address.id)} className="ml-11 mt-3 text-xs font-bold text-green-600 hover:underline">
                          Set as default
                        </button>}
                    </div>)}

                  <button onClick={() => setShowAddAddressModal(true)} className="w-full py-4 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors">
                    + Add New Address
                  </button>
                </div>}

              {/* Settings Screen */}
              {profileScreen === 'settings' && <div className="space-y-6">
                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest mb-3">Notifications</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                      <div className="flex items-center">
                        <Bell size={20} className="text-gray-500 mr-3" />
                        <span className="font-bold text-sm">Push Notifications</span>
                      </div>
                      <button onClick={() => setSettingsState({
                  ...settingsState,
                  notifications: !settingsState.notifications
                })} className={`w-12 h-6 rounded-full transition-colors relative ${settingsState.notifications ? 'bg-green-600' : 'bg-gray-200'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settingsState.notifications ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                      <div className="flex items-center">
                        <Smartphone size={20} className="text-gray-500 mr-3" />
                        <span className="font-bold text-sm">SMS Updates</span>
                      </div>
                      <button onClick={() => setSettingsState({
                  ...settingsState,
                  smsUpdates: !settingsState.smsUpdates
                })} className={`w-12 h-6 rounded-full transition-colors relative ${settingsState.smsUpdates ? 'bg-green-600' : 'bg-gray-200'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settingsState.smsUpdates ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest mb-3">Data</h3>
                    
                    <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                      <div className="flex items-center">
                        <Wifi size={20} className="text-gray-500 mr-3" />
                        <span className="font-bold text-sm">Low Data Mode</span>
                      </div>
                      <button onClick={() => setSettingsState({
                  ...settingsState,
                  lowDataMode: !settingsState.lowDataMode
                })} className={`w-12 h-6 rounded-full transition-colors relative ${settingsState.lowDataMode ? 'bg-green-600' : 'bg-gray-200'}`}>
                        <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settingsState.lowDataMode ? 'translate-x-6' : 'translate-x-0.5'}`} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-gray-200">
                    <p className="text-sm text-gray-500 text-center">
                      App Version: <span className="font-bold text-gray-700">1.0.2</span>
                    </p>
                  </div>
                </div>}
            </div>
          </motion.div>}

        {/* Add Address Modal */}
        {showAddAddressModal && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center px-6" onClick={() => setShowAddAddressModal(false)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Add New Address</h2>
                  <button onClick={() => setShowAddAddressModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Label (Home, Work, etc.)</label>
                  <input type="text" value={newAddressForm.label} onChange={e => setNewAddressForm({
                ...newAddressForm,
                label: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="e.g. Home" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" value={newAddressForm.fullName} onChange={e => setNewAddressForm({
                ...newAddressForm,
                fullName: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="Enter your full name" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input type="tel" value={newAddressForm.phone} onChange={e => setNewAddressForm({
                ...newAddressForm,
                phone: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="+592 XXX-XXXX" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address Line</label>
                  <input type="text" value={newAddressForm.addressLine} onChange={e => setNewAddressForm({
                ...newAddressForm,
                addressLine: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="Street address" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Area / Village</label>
                  <select value={newAddressForm.area} onChange={e => setNewAddressForm({
                ...newAddressForm,
                area: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100">
                    <option value="">Select area</option>
                    {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                </div>

                <button onClick={handleAddAddress} disabled={!newAddressForm.fullName || !newAddressForm.phone || !newAddressForm.addressLine || !newAddressForm.area} className={`w-full py-4 font-bold rounded-2xl transition-colors ${newAddressForm.fullName && newAddressForm.phone && newAddressForm.addressLine && newAddressForm.area ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  Save Address
                </button>
              </div>
            </motion.div>
          </motion.div>}

        {/* Edit Address Modal */}
        {showEditAddressModal && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center px-6" onClick={() => setShowEditAddressModal(false)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Edit Address</h2>
                  <button onClick={() => setShowEditAddressModal(false)} className="p-2 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Label (Home, Work, etc.)</label>
                  <input type="text" value={newAddressForm.label} onChange={e => setNewAddressForm({
                ...newAddressForm,
                label: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="e.g. Home" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input type="text" value={newAddressForm.fullName} onChange={e => setNewAddressForm({
                ...newAddressForm,
                fullName: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="Enter your full name" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                  <input type="tel" value={newAddressForm.phone} onChange={e => setNewAddressForm({
                ...newAddressForm,
                phone: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="+592 XXX-XXXX" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Address Line</label>
                  <input type="text" value={newAddressForm.addressLine} onChange={e => setNewAddressForm({
                ...newAddressForm,
                addressLine: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="Street address" />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Area / Village</label>
                  <select value={newAddressForm.area} onChange={e => setNewAddressForm({
                ...newAddressForm,
                area: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100">
                    <option value="">Select area</option>
                    {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                  </select>
                </div>

                <button onClick={handleSaveEditedAddress} disabled={!newAddressForm.fullName || !newAddressForm.phone || !newAddressForm.addressLine || !newAddressForm.area} className={`w-full py-4 font-bold rounded-2xl transition-colors ${newAddressForm.fullName && newAddressForm.phone && newAddressForm.addressLine && newAddressForm.area ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}`}>
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>}

        {/* Logout Confirmation Modal */}
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
                <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button onClick={handleLogout} className="flex-1 py-3 bg-red-500 text-white font-bold rounded-2xl hover:bg-red-600 transition-colors">
                  Log Out
                </button>
              </div>
            </motion.div>
          </motion.div>}

        {/* Store Detail Modal */}
        {selectedStore && <motion.div initial={{
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
            <div className="relative h-64 shrink-0">
              <img src={selectedStore.imageUrl} alt={selectedStore.name} className="w-full h-full object-cover" />
              <button onClick={() => setSelectedStore(null)} className="absolute top-12 left-6 bg-white/90 backdrop-blur-md p-3 rounded-full text-gray-800 border border-white/30 shadow-lg hover:bg-white transition-all">
                <ArrowLeft size={24} />
              </button>
              <div className="absolute bottom-0 left-0 right-0 px-6 pb-6 pt-16 bg-gradient-to-t from-black/80 to-transparent text-white">
                <h2 className="text-2xl font-bold">{selectedStore.name}</h2>
                <div className="flex items-center text-sm font-medium mt-1 space-x-3 text-white/90">
                  <span className="bg-green-500 text-white px-2 py-1 rounded text-xs font-bold">Open Now</span>
                  <span className="flex items-center">
                    <Star size={14} className="mr-1 fill-yellow-400 text-yellow-400" /> {selectedStore.rating}
                  </span>
                  <span>•</span>
                  <span>{selectedStore.deliveryTime} mins</span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-6 pt-8 bg-white rounded-t-[32px] -mt-4 relative z-10 shadow-xl">
              {/* Filters UI (only for grocery stores) */}
              {isGroceryStore(selectedStore) && <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-700">Filters</h3>
                    {hasActiveFilters && <button onClick={clearAllFilters} className="text-xs font-bold text-green-600 hover:underline">
                        Clear All
                      </button>}
                  </div>
                  
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => toggleFilter('importedOnly')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filters.importedOnly ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      Imported
                    </button>
                    <button onClick={() => toggleFilter('organic')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filters.organic ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      Organic
                    </button>
                    <button onClick={() => toggleFilter('glutenFree')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filters.glutenFree ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      Gluten-Free
                    </button>
                    <button onClick={() => toggleFilter('halal')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filters.halal ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      Halal
                    </button>
                    <button onClick={() => toggleFilter('kosher')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filters.kosher ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      Kosher
                    </button>
                    <button onClick={() => toggleFilter('americanBrands')} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${filters.americanBrands ? 'bg-green-600 text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                      American Brands
                    </button>
                  </div>
                </div>}

              <div className="mb-6 pb-20">
                <h3 className="text-lg font-bold mb-4">Store Catalog</h3>
                
                {storeProducts.length === 0 && <div className="text-center text-sm text-gray-500 py-10">
                    No products match your filters
                  </div>}

                <div className="grid grid-cols-2 gap-4">
                  {storeProducts.map(product => <motion.div key={product.id} onClick={() => setSelectedProduct(product)} className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex flex-col cursor-pointer">
                      <img src={product.image} alt={product.name} className="w-full h-24 object-cover rounded-xl mb-2" />
                      
                      {/* Product tags */}
                      <div className="flex flex-wrap gap-1 mb-1">
                        {product.organic && <span className="text-[8px] px-1.5 py-0.5 bg-green-100 text-green-700 rounded font-bold">Organic</span>}
                        {product.imported && <span className="text-[8px] px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-bold">Imported</span>}
                        {product.americanBrand && <span className="text-[8px] px-1.5 py-0.5 bg-red-100 text-red-700 rounded font-bold">US</span>}
                        {product.glutenFree && <span className="text-[8px] px-1.5 py-0.5 bg-yellow-100 text-yellow-700 rounded font-bold">GF</span>}
                        {product.halal && <span className="text-[8px] px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded font-bold">Halal</span>}
                      </div>

                      <h4 className="font-bold text-sm line-clamp-1">{product.name}</h4>
                      <p className="text-[10px] text-gray-500">{product.unit}</p>
                      <div className="flex justify-between items-center mt-3">
                        <span className="text-xs font-bold">{formatCurrency(product.price)}</span>
                        <button onClick={e => {
                    e.stopPropagation();
                    addToCart(product);
                  }} className="bg-green-600 text-white p-1.5 rounded-lg shadow-sm active:scale-90 transition-transform">
                          <Plus size={16} />
                        </button>
                      </div>
                    </motion.div>)}
                </div>
              </div>
            </div>
          </motion.div>}

        {/* Product Details Modal */}
        {selectedProduct && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center px-6" onClick={() => setSelectedProduct(null)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="h-56 relative">
                <img src={selectedProduct.image} alt={selectedProduct.name} className="w-full h-full object-cover" />
                <button onClick={() => setSelectedProduct(null)} className="absolute top-4 right-4 bg-white p-2 rounded-full text-gray-800 shadow-md">
                  <X size={20} />
                </button>
              </div>

              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h2 className="text-2xl font-bold">{selectedProduct.name}</h2>
                  <span className="text-xl font-black text-green-700">{formatCurrency(selectedProduct.price)}</span>
                </div>
                <p className="text-xs font-bold text-gray-400 mb-4">{selectedProduct.unit}</p>

                {/* Product tags in modal */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedProduct.organic && <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-bold">Organic</span>}
                  {selectedProduct.imported && <span className="text-xs px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-bold">Imported</span>}
                  {selectedProduct.americanBrand && <span className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded-full font-bold">American Brand</span>}
                  {selectedProduct.glutenFree && <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full font-bold">Gluten-Free</span>}
                  {selectedProduct.halal && <span className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full font-bold">Halal</span>}
                  {selectedProduct.kosher && <span className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded-full font-bold">Kosher</span>}
                </div>

                <p className="text-sm text-gray-600 leading-relaxed mb-6">{selectedProduct.description}</p>

                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-4 bg-gray-100 p-2 rounded-2xl flex-1 justify-between px-4">
                    <button onClick={() => removeFromCart(selectedProduct.id)} className="p-2 text-gray-500">
                      <Minus size={20} />
                    </button>
                    <span className="text-xs font-bold">
                      {cart.find(i => i.id === selectedProduct.id)?.quantity || 0}
                    </span>
                    <button onClick={() => addToCart(selectedProduct)} className="p-2 text-green-600">
                      <Plus size={20} />
                    </button>
                  </div>

                  <button onClick={() => {
                addToCart(selectedProduct);
                setSelectedProduct(null);
              }} className="flex-[2] bg-green-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-green-100">
                    Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>}

        {/* Cart Slide-up with Checkout Flow - PRESERVED EXISTING IMPLEMENTATION */}
        {isCartOpen && <motion.div initial={{
        y: '100%'
      }} animate={{
        y: 0
      }} exit={{
        y: '100%'
      }} transition={{
        type: 'spring',
        damping: 25,
        stiffness: 200
      }} className="fixed inset-0 bg-white z-[80] flex flex-col">
            <div className="px-6 pt-12 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <button onClick={() => setIsCartOpen(false)} className="mr-4 p-2 text-gray-400">
                    <ArrowLeft size={24} />
                  </button>
                  <h2 className="text-xl font-bold">
                    {checkoutStep === 0 && 'Review Order'}
                    {checkoutStep === 1 && 'Address'}
                    {checkoutStep === 2 && 'Delivery Notes'}
                    {checkoutStep === 3 && 'Substitutions'}
                    {checkoutStep === 4 && 'Payment'}
                    {checkoutStep === 5 && 'Confirm'}
                  </h2>
                </div>
                {checkoutStep === 0 && <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                  {cartCount} items
                </span>}
              </div>

              {/* Step Indicator */}
              {checkoutStep > 0 && <div className="flex items-center justify-center space-x-2">
                {[1, 2, 3, 4, 5].map(step => <div key={step} className={`h-2 rounded-full transition-all ${step === checkoutStep ? 'w-8 bg-green-600' : 'w-2 bg-gray-200'}`} />)}
              </div>}
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Step 0: Cart Review */}
              {checkoutStep === 0 && <div className="space-y-6">
                  {cart.length === 0 ? <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50 py-20">
                      <ShoppingBag size={80} className="text-gray-300" />
                      <p className="font-bold text-lg">Your basket is empty</p>
                      <button onClick={() => setIsCartOpen(false)} className="text-green-600 font-bold underline">
                        Go shopping
                      </button>
                    </div> : <>
                      <div className="space-y-4">
                        {cart.map(item => <div key={item.id} className="flex items-center">
                            <img src={item.image} alt={item.name} className="w-16 h-16 rounded-xl object-cover" />
                            <div className="ml-4 flex-1">
                              <h4 className="font-bold text-sm">{item.name}</h4>
                              <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <span className="text-xs font-bold">{formatCurrency(item.price * item.quantity)}</span>
                          </div>)}
                      </div>

                      <div className="bg-gray-50 p-4 rounded-3xl space-y-3">
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Subtotal</span>
                          <span className="font-bold">{formatCurrency(cartTotal)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Delivery Fee</span>
                          <span className="font-bold">{formatCurrency(DELIVERY_FEE_GYD)}</span>
                        </div>
                        <div className="flex justify-between text-sm text-gray-600">
                          <span>Service Fee</span>
                          <span className="font-bold">{formatCurrency(SERVICE_FEE_GYD)}</span>
                        </div>
                        {paymentForm.tip > 0 && <div className="flex justify-between text-sm text-gray-600">
                            <span>Tip</span>
                            <span className="font-bold">{formatCurrency(paymentForm.tip)}</span>
                          </div>}
                        <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                          <span className="font-bold text-lg">Total</span>
                          <span className="font-black text-2xl text-green-700">
                            {formatCurrency(grandTotal)}
                          </span>
                        </div>
                      </div>
                    </>}
                </div>}

              {/* Steps 1-5: PRESERVED EXISTING CHECKOUT IMPLEMENTATION */}
              {checkoutStep === 1 && <div className="space-y-4">
                  {/* Helper text */}
                  {isLoggedIn && addressMode === 'saved' && <div className="p-3 bg-blue-50 border border-blue-200 rounded-2xl">
                      <p className="text-xs text-blue-800 font-medium">
                        ✓ Using your saved profile details. Edit if needed.
                      </p>
                    </div>}

                  {/* Address Mode Selector */}
                  <div className="flex space-x-2">
                    <button onClick={() => {
                setAddressMode('saved');
                if (customerProfile.defaultAddressId) {
                  handleSelectSavedAddress(customerProfile.defaultAddressId);
                }
              }} className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-colors ${addressMode === 'saved' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                      Saved
                    </button>
                    <button onClick={() => setAddressMode('live')} className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-colors ${addressMode === 'live' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                      Live
                    </button>
                    <button onClick={handleSwitchToNewMode} className={`flex-1 py-3 rounded-2xl font-bold text-sm transition-colors ${addressMode === 'new' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                      New
                    </button>
                  </div>

                  {/* Saved Mode */}
                  {addressMode === 'saved' && <div className="space-y-3">
                      {customerProfile.savedAddresses.map(address => <button key={address.id} onClick={() => handleSelectSavedAddress(address.id)} className={`w-full p-4 rounded-2xl border-2 text-left transition-colors ${selectedSavedAddressId === address.id ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'}`}>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <div className={`${selectedSavedAddressId === address.id ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-500'} p-2 rounded-lg mr-3`}>
                                {address.label === 'Home' ? <Home size={18} /> : address.label === 'Work' ? <Store size={18} /> : <MapPin size={18} />}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <p className="font-bold text-sm">{address.label}</p>
                                  {address.isDefault && <span className="bg-green-100 text-green-700 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                      Default
                                    </span>}
                                </div>
                                <p className="text-sm text-gray-700 mt-1">{address.fullName}</p>
                              </div>
                            </div>
                            {selectedSavedAddressId === address.id && <div className="h-5 w-5 rounded-full bg-green-600 flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full" />
                              </div>}
                          </div>
                        </button>)}

                      <button onClick={handleSwitchToNewMode} className="w-full py-3 bg-green-600 text-white font-bold rounded-2xl hover:bg-green-700 transition-colors">
                        + Add New Address
                      </button>

                      {selectedSavedAddressId && <button onClick={() => handleEditAddress(selectedSavedAddressId)} className="w-full py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
                          <Edit size={16} />
                          <span>Edit Selected Address</span>
                        </button>}
                    </div>}

                  {/* Live Mode */}
                  {addressMode === 'live' && <div className="space-y-4">
                      <button onClick={handleUseLiveLocation} disabled={isLoadingLiveLocation} className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center space-x-2 ${isLoadingLiveLocation ? 'bg-gray-200 text-gray-500 cursor-wait' : 'bg-green-600 text-white hover:bg-green-700'}`}>
                        <MapPinned size={20} />
                        <span>{isLoadingLiveLocation ? 'Getting location...' : 'Use my current location'}</span>
                      </button>

                      {addressForm.addressLine && addressSource === 'Live' && <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                            <input type="text" value={addressForm.fullName} onChange={e => setAddressForm({
                    ...addressForm,
                    fullName: e.target.value
                  })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                            <input type="tel" value={addressForm.phone} onChange={e => setAddressForm({
                    ...addressForm,
                    phone: e.target.value
                  })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Address</label>
                            <input type="text" value={addressForm.addressLine} onChange={e => setAddressForm({
                    ...addressForm,
                    addressLine: e.target.value
                  })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" />
                          </div>

                          <div>
                            <label className="block text-sm font-bold text-gray-700 mb-2">Area</label>
                            <select value={addressForm.area} onChange={e => setAddressForm({
                    ...addressForm,
                    area: e.target.value
                  })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100">
                              <option value="">Select area</option>
                              {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                            </select>
                          </div>

                          <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded-2xl">
                            <MapPinned size={18} className="text-green-600 mr-2" />
                            <span className="text-xs font-bold text-green-700">Location pinned</span>
                          </div>
                        </div>}
                    </div>}

                  {/* New Mode */}
                  {addressMode === 'new' && <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                        <input type="text" value={addressForm.fullName} onChange={e => setAddressForm({
                  ...addressForm,
                  fullName: e.target.value
                })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="Enter your full name" />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Phone</label>
                        <input type="tel" value={addressForm.phone} onChange={e => setAddressForm({
                  ...addressForm,
                  phone: e.target.value
                })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="+592 XXX-XXXX" />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Address Line</label>
                        <input type="text" value={addressForm.addressLine} onChange={e => setAddressForm({
                  ...addressForm,
                  addressLine: e.target.value
                })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" placeholder="Street address" />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Area / Village</label>
                        <select value={addressForm.area} onChange={e => setAddressForm({
                  ...addressForm,
                  area: e.target.value
                })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100">
                          <option value="">Select area</option>
                          {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Label</label>
                        <div className="flex space-x-2">
                          {(['Home', 'Work', 'Other'] as AddressLabel[]).map(labelOption => <button key={labelOption} onClick={() => setAddressForm({
                    ...addressForm,
                    label: labelOption
                  })} className={`flex-1 py-2 rounded-xl font-bold text-sm transition-colors ${addressForm.label === labelOption ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                              {labelOption}
                            </button>)}
                        </div>
                      </div>

                      <button onClick={() => setAddressForm({
                ...addressForm,
                isPinned: !addressForm.isPinned
              })} className={`w-full flex items-center justify-center space-x-2 py-3 rounded-2xl border-2 font-bold transition-colors ${addressForm.isPinned ? 'bg-green-50 border-green-500 text-green-700' : 'bg-white border-gray-200 text-gray-600'}`}>
                        <MapPinned size={20} />
                        <span>{addressForm.isPinned ? 'Location Pinned' : 'Pin Location'}</span>
                      </button>

                      <div className="space-y-2 pt-2 border-t border-gray-200">
                        <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl">
                          <span className="text-sm font-bold text-gray-700">Save this address to my profile</span>
                          <button onClick={() => setAddressForm({
                    ...addressForm,
                    saveToProfile: !addressForm.saveToProfile
                  })} className={`w-12 h-6 rounded-full transition-colors relative ${addressForm.saveToProfile ? 'bg-green-600' : 'bg-gray-200'}`}>
                              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${addressForm.saveToProfile ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                        </div>

                        {addressForm.saveToProfile && <div className="flex items-center justify-between p-3 bg-white border border-gray-100 rounded-2xl">
                            <span className="text-sm font-bold text-gray-700">Save name & phone to profile</span>
                            <button onClick={() => setAddressForm({
                    ...addressForm,
                    savePersonalInfo: !addressForm.savePersonalInfo
                  })} className={`w-12 h-6 rounded-full transition-colors relative ${addressForm.savePersonalInfo ? 'bg-green-600' : 'bg-gray-200'}`}>
                              <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${addressForm.savePersonalInfo ? 'translate-x-6' : 'translate-x-0.5'}`} />
                            </button>
                          </div>}
                      </div>
                    </div>}
                </div>}

              {/* Step 2: Delivery Notes */}
              {checkoutStep === 2 && <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Delivery Instructions</label>
                    <textarea value={deliveryNotesForm.instructions} onChange={e => setDeliveryNotesForm({
                ...deliveryNotesForm,
                instructions: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100 min-h-[100px]" placeholder="Add any special instructions for the driver..." />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                    <div className="flex items-center">
                      <Home size={20} className="text-gray-500 mr-3" />
                      <span className="font-bold text-sm">Leave at door</span>
                    </div>
                    <button onClick={() => setDeliveryNotesForm({
                ...deliveryNotesForm,
                leaveAtDoor: !deliveryNotesForm.leaveAtDoor
              })} className={`w-12 h-6 rounded-full transition-colors relative ${deliveryNotesForm.leaveAtDoor ? 'bg-green-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${deliveryNotesForm.leaveAtDoor ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-white border border-gray-100 rounded-2xl">
                    <div className="flex items-center">
                      <MessageSquare size={20} className="text-gray-500 mr-3" />
                      <span className="font-bold text-sm">Call on arrival</span>
                    </div>
                    <button onClick={() => setDeliveryNotesForm({
                ...deliveryNotesForm,
                callOnArrival: !deliveryNotesForm.callOnArrival
              })} className={`w-12 h-6 rounded-full transition-colors relative ${deliveryNotesForm.callOnArrival ? 'bg-green-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${deliveryNotesForm.callOnArrival ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">Preferred Delivery Time</label>
                    <div className="flex space-x-3 mb-3">
                      <button onClick={() => setDeliveryNotesForm({
                  ...deliveryNotesForm,
                  deliveryTime: 'asap'
                })} className={`flex-1 py-3 rounded-2xl font-bold transition-colors ${deliveryNotesForm.deliveryTime === 'asap' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                        ASAP
                      </button>
                      <button onClick={() => setDeliveryNotesForm({
                  ...deliveryNotesForm,
                  deliveryTime: 'schedule'
                })} className={`flex-1 py-3 rounded-2xl font-bold transition-colors ${deliveryNotesForm.deliveryTime === 'schedule' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                        Schedule
                      </button>
                    </div>

                    {deliveryNotesForm.deliveryTime === 'schedule' && <select value={deliveryNotesForm.scheduledTime} onChange={e => setDeliveryNotesForm({
                ...deliveryNotesForm,
                scheduledTime: e.target.value
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100">
                        <option value="30mins">In 30 minutes</option>
                        <option value="1hr">In 1 hour</option>
                        <option value="2hrs">In 2 hours</option>
                      </select>}
                  </div>
                </div>}

              {/* Step 3: Substitutions */}
              {checkoutStep === 3 && <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-white border-2 border-gray-200 rounded-2xl">
                    <div className="flex items-center">
                      <RefreshCw size={20} className="text-gray-500 mr-3" />
                      <span className="font-bold text-sm">Allow substitutions</span>
                    </div>
                    <button onClick={() => setSubstitutionForm({
                ...substitutionForm,
                allowSubstitutions: !substitutionForm.allowSubstitutions
              })} className={`w-12 h-6 rounded-full transition-colors relative ${substitutionForm.allowSubstitutions ? 'bg-green-600' : 'bg-gray-200'}`}>
                      <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${substitutionForm.allowSubstitutions ? 'translate-x-6' : 'translate-x-0.5'}`} />
                    </button>
                  </div>

                  {substitutionForm.allowSubstitutions ? <div className="space-y-3">
                      <p className="text-xs text-gray-500 font-medium">Choose how to handle out-of-stock items:</p>
                      <button onClick={() => setSubstitutionForm({
                ...substitutionForm,
                substitutionPreference: 'contact'
              })} className={`w-full p-4 rounded-2xl border-2 text-left transition-colors ${substitutionForm.substitutionPreference === 'contact' ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">Contact me for substitutions</p>
                            <p className="text-xs text-gray-500 mt-1">We'll call you to confirm replacements</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${substitutionForm.substitutionPreference === 'contact' ? 'border-green-600 bg-green-600' : 'border-gray-300'} flex items-center justify-center`}>
                            {substitutionForm.substitutionPreference === 'contact' && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </div>
                      </button>

                      <button onClick={() => setSubstitutionForm({
                ...substitutionForm,
                substitutionPreference: 'auto'
              })} className={`w-full p-4 rounded-2xl border-2 text-left transition-colors ${substitutionForm.substitutionPreference === 'auto' ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'}`}>
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-sm">Auto-approve similar item</p>
                            <p className="text-xs text-gray-500 mt-1">We'll pick a similar replacement</p>
                          </div>
                          <div className={`w-5 h-5 rounded-full border-2 ${substitutionForm.substitutionPreference === 'auto' ? 'border-green-600 bg-green-600' : 'border-gray-300'} flex items-center justify-center`}>
                            {substitutionForm.substitutionPreference === 'auto' && <div className="w-2 h-2 bg-white rounded-full" />}
                          </div>
                        </div>
                      </button>
                    </div> : <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl">
                      <p className="text-sm font-bold text-yellow-800 mb-1">⚠️ No Substitutions</p>
                      <p className="text-xs text-yellow-700">
                        If items are unavailable, they will be removed from the order.
                      </p>
                    </div>}
                </div>}

              {/* Step 4: Payment */}
              {checkoutStep === 4 && <div className="space-y-6">
                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest">Payment Method</h3>
                    <button onClick={() => setPaymentForm({
                ...paymentForm,
                method: 'cash'
              })} className={`w-full flex items-center justify-between p-4 rounded-2xl border-2 transition-colors ${paymentForm.method === 'cash' ? 'bg-white border-green-200' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-center">
                        <div className="bg-green-100 p-2 rounded-lg mr-3 text-green-600">
                          <DollarSign size={20} />
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-sm block">Cash on Delivery</span>
                          <span className="text-xs text-gray-500">Coming soon</span>
                        </div>
                      </div>
                    </button>

                    <button disabled className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl opacity-60 cursor-not-allowed">
                      <div className="flex items-center">
                        <div className="bg-blue-100 p-2 rounded-lg mr-3 text-blue-600">
                          <Wallet size={20} />
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-sm block">MMG / Wallet</span>
                          <span className="text-xs text-gray-500">Coming soon</span>
                        </div>
                      </div>
                    </button>

                    <button disabled className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl opacity-60 cursor-not-allowed">
                      <div className="flex items-center">
                        <div className="bg-purple-100 p-2 rounded-lg mr-3 text-purple-600">
                          <CreditCard size={20} />
                        </div>
                        <div className="text-left">
                          <span className="font-bold text-sm block">Card</span>
                          <span className="text-xs text-gray-500">Coming soon</span>
                        </div>
                      </div>
                    </button>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-bold text-gray-500 text-xs uppercase tracking-widest">Add Tip</h3>
                    <div className="flex space-x-2">
                      {[0, 200, 500, 1000].map(amount => <button key={amount} onClick={() => setPaymentForm({
                  ...paymentForm,
                  tip: amount
                })} className={`flex-1 py-3 rounded-2xl font-bold transition-colors ${paymentForm.tip === amount ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                          {amount === 0 ? 'No Tip' : `$${amount}`}
                        </button>)}
                    </div>
                    <input type="number" placeholder="Custom tip amount" value={paymentForm.tip > 1000 ? paymentForm.tip : ''} onChange={e => setPaymentForm({
                ...paymentForm,
                tip: parseInt(e.target.value) || 0
              })} className="w-full px-4 py-3 bg-gray-50 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-3xl space-y-3">
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span className="font-bold">{formatCurrency(cartTotal)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Delivery Fee</span>
                      <span className="font-bold">{formatCurrency(DELIVERY_FEE_GYD)}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Service Fee</span>
                      <span className="font-bold">{formatCurrency(SERVICE_FEE_GYD)}</span>
                    </div>
                    {paymentForm.tip > 0 && <div className="flex justify-between text-sm text-gray-600">
                        <span>Tip</span>
                        <span className="font-bold">{formatCurrency(paymentForm.tip)}</span>
                      </div>}
                    <div className="pt-3 border-t border-gray-200 flex justify-between items-center">
                      <span className="font-bold text-lg">Total</span>
                      <span className="font-black text-2xl text-green-700">
                        {formatCurrency(grandTotal)}
                      </span>
                    </div>
                  </div>
                </div>}

              {/* Step 5: Confirm */}
              {checkoutStep === 5 && <div className="space-y-6 pb-8">
                  <div className="bg-green-50 p-4 rounded-3xl border-2 border-green-200">
                    <h3 className="font-bold text-green-800 mb-3">Order Summary</h3>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-green-700">Items</span>
                        <span className="font-bold text-green-900">{cartCount} items</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-green-700">Total</span>
                        <span className="font-bold text-green-900">{formatCurrency(grandTotal)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {cart.map(item => <div key={item.id} className="flex items-center">
                        <img src={item.image} alt={item.name} className="w-12 h-12 rounded-xl object-cover" />
                        <div className="ml-3 flex-1">
                          <h4 className="font-bold text-sm">{item.name}</h4>
                          <p className="text-[10px] text-gray-500">Qty: {item.quantity}</p>
                        </div>
                        <span className="text-xs font-bold">{formatCurrency(item.price * item.quantity)}</span>
                      </div>)}
                  </div>

                  <div className="p-4 bg-white border border-gray-100 rounded-2xl space-y-3">
                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delivery Address</h4>
                      {addressSource && <p className="text-xs text-green-600 font-bold mb-1">Source: {addressSource}</p>}
                      <p className="text-sm font-bold">{addressForm.fullName}</p>
                      <p className="text-xs text-gray-600">{addressForm.addressLine}</p>
                      <p className="text-xs text-gray-600">{addressForm.area}</p>
                      <p className="text-xs text-gray-600">{addressForm.phone}</p>
                    </div>

                    {deliveryNotesForm.instructions && <div>
                        <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Delivery Notes</h4>
                        <p className="text-sm text-gray-600">{deliveryNotesForm.instructions}</p>
                      </div>}

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Substitutions</h4>
                      <p className="text-sm text-gray-600">
                        {substitutionForm.allowSubstitutions ? substitutionForm.substitutionPreference === 'contact' ? 'Contact me for substitutions' : 'Auto-approve similar items' : 'No substitutions allowed'}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Payment</h4>
                      <p className="text-sm text-gray-600">
                        Cash on Delivery {paymentForm.tip > 0 && `+ ${formatCurrency(paymentForm.tip)} tip`}
                      </p>
                    </div>
                  </div>
                </div>}
            </div>

            {/* Bottom Navigation Controls */}
            {cart.length > 0 && <div className="p-6 bg-white border-t border-gray-100 shrink-0">
                <div className="flex space-x-3">
                  {checkoutStep > 0 && <button onClick={handleBackStep} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">
                      Back
                    </button>}
                  <motion.button whileTap={{
              scale: 0.95
            }} onClick={handleNextStep} disabled={checkoutStep > 0 && !canProceedToNextStep()} className={`flex-1 font-black py-5 rounded-[24px] shadow-xl text-lg flex justify-between items-center px-8 transition-opacity ${checkoutStep > 0 && !canProceedToNextStep() ? 'bg-gray-300 text-gray-500 opacity-50 cursor-not-allowed' : 'bg-green-600 text-white shadow-green-100'}`}>
                    <span>
                      {checkoutStep === 0 && 'Checkout'}
                      {checkoutStep > 0 && checkoutStep < 5 && 'Next'}
                      {checkoutStep === 5 && 'Confirm Order'}
                    </span>
                    <ChevronRight size={24} />
                  </motion.button>
                </div>
              </div>}
          </motion.div>}
      </AnimatePresence>

      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Floating Cart Indicator */}
      {!isCartOpen && cartCount > 0 && !selectedStore && activeTab === 'home' && <motion.button initial={{
      y: 50,
      opacity: 0
    }} animate={{
      y: 0,
      opacity: 1
    }} onClick={() => setIsCartOpen(true)} className="fixed bottom-20 left-4 right-4 bg-green-700 text-white px-6 py-4 rounded-2xl shadow-xl z-40 flex justify-between items-center">
          <div className="flex items-center">
            <div className="bg-white/20 p-2 rounded-xl mr-3">
              <ShoppingBag size={20} />
            </div>
            <div>
              <p className="text-[10px] uppercase font-black tracking-widest opacity-80">View Basket</p>
              <p className="text-xs font-bold">{cartCount} items</p>
            </div>
          </div>
          <span className="font-black text-lg">{formatCurrency(cartTotal)}</span>
        </motion.button>}

      {/* Logout Toast */}
      <AnimatePresence>
        {logoutToast && <motion.div initial={{
        y: 100,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} exit={{
        y: 100,
        opacity: 0
      }} className="fixed bottom-24 left-4 right-4 bg-gray-800 text-white px-6 py-4 rounded-2xl shadow-xl z-[100] flex items-center justify-center">
            <CheckCircle2 size={20} className="mr-2 text-green-400" />
            <span className="font-bold">Logged out</span>
          </motion.div>}
      </AnimatePresence>

      {/* Add to Cart Toast */}
      <AnimatePresence>
        {addToCartToast && <motion.div initial={{
        y: 100,
        opacity: 0
      }} animate={{
        y: 0,
        opacity: 1
      }} exit={{
        y: 100,
        opacity: 0
      }} className="fixed bottom-24 left-4 right-4 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-xl z-[100] flex items-center justify-center">
            <CheckCircle2 size={20} className="mr-2" />
            <span className="font-bold">{addToCartToast} added to cart</span>
          </motion.div>}
      </AnimatePresence>
    </div>;
};