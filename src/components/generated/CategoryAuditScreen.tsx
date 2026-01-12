import React, { useState, useMemo } from 'react';
import { X, AlertCircle, CheckCircle2, ChevronRight, Search, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
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
interface Store {
  id: string;
  name: string;
}
type AuditFilterType = 'all' | 'missing' | 'invalid';
interface CategoryAuditScreenProps {
  products: Product[];
  stores: Store[];
  onBack: () => void;
  onFixCategory: (productId: string, newCategory: string) => void;
}

// Valid categories for the platform
const VALID_CATEGORIES = ['Grains', 'Dairy', 'Medicine', 'Fruits', 'Vegetables', 'Meats', 'Seafood', 'Bakery', 'Snacks', 'Beverages', 'Household', 'Personal Care', 'Baby Products', 'Pet Supplies', 'Frozen Foods', 'Condiments', 'Spices'];
const formatCurrency = (amount: number) => `GYD $${amount.toLocaleString()}`;

// @component: CategoryAuditScreen
export const CategoryAuditScreen: React.FC<CategoryAuditScreenProps> = ({
  products,
  stores,
  onBack,
  onFixCategory
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<AuditFilterType>('all');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');

  // Determine if a product needs fixing
  const needsCategoryFix = (product: Product): {
    needsFix: boolean;
    reason: string;
  } => {
    // Missing category
    if (!product.category || product.category.trim() === '') {
      return {
        needsFix: true,
        reason: 'Missing category'
      };
    }

    // Invalid category (not in allowed list)
    if (!VALID_CATEGORIES.includes(product.category)) {
      return {
        needsFix: true,
        reason: 'Invalid category'
      };
    }
    return {
      needsFix: false,
      reason: ''
    };
  };

  // Get products needing fixes
  const productsNeedingFix = useMemo(() => {
    return products.map(p => ({
      ...p,
      audit: needsCategoryFix(p)
    })).filter(p => p.audit.needsFix);
  }, [products]);

  // Apply filters and search
  const filteredProducts = useMemo(() => {
    let filtered = productsNeedingFix;

    // Apply filter type
    if (filterType === 'missing') {
      filtered = filtered.filter(p => p.audit.reason === 'Missing category');
    } else if (filterType === 'invalid') {
      filtered = filtered.filter(p => p.audit.reason === 'Invalid category');
    }

    // Apply search
    if (searchQuery) {
      filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [productsNeedingFix, filterType, searchQuery]);
  const handleFixProduct = (product: Product) => {
    setSelectedProduct(product);
    setSelectedCategory(product.category || '');
    setShowCategoryPicker(true);
  };
  const handleSaveCategory = () => {
    if (selectedProduct && selectedCategory) {
      onFixCategory(selectedProduct.id, selectedCategory);
      setShowCategoryPicker(false);
      setSelectedProduct(null);
      setSelectedCategory('');
    }
  };
  const getStoreName = (storeId: string) => {
    const store = stores.find(s => s.id === storeId);
    return store ? store.name : 'Unknown Store';
  };
  return <motion.div initial={{
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
      {/* Header */}
      <div className="px-6 pt-12 pb-4 border-b border-gray-100 bg-white sticky top-0 z-10 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <button onClick={onBack} className="mr-4 p-2 text-gray-400">
              <X size={24} />
            </button>
            <div>
              <h2 className="text-xl font-bold">Category Audit</h2>
              <p className="text-xs text-gray-500">
                {productsNeedingFix.length} product{productsNeedingFix.length !== 1 ? 's' : ''} need review
              </p>
            </div>
          </div>
          {productsNeedingFix.length > 0 && <span className="bg-red-100 text-red-700 px-3 py-1 rounded-full text-xs font-bold">
              {productsNeedingFix.length}
            </span>}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input type="text" placeholder="Search products..." className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 border border-gray-100" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
        </div>

        {/* Filters */}
        <div className="flex space-x-2">
          <button onClick={() => setFilterType('all')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors ${filterType === 'all' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            All Issues
          </button>
          <button onClick={() => setFilterType('missing')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors ${filterType === 'missing' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            Missing
          </button>
          <button onClick={() => setFilterType('invalid')} className={`flex-1 py-2 rounded-xl font-bold text-xs transition-colors ${filterType === 'invalid' ? 'bg-green-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
            Invalid
          </button>
        </div>
      </div>

      {/* Products List */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {filteredProducts.length === 0 ? <div className="text-center py-16">
            <CheckCircle2 size={64} className="mx-auto text-green-300 mb-3" />
            <h3 className="font-bold text-lg text-gray-700 mb-2">
              {productsNeedingFix.length === 0 ? 'All Products Have Valid Categories' : 'No Products Match Filters'}
            </h3>
            <p className="text-sm text-gray-500">
              {productsNeedingFix.length === 0 ? 'Great job! All products are properly categorized.' : 'Try adjusting your filters or search query.'}
            </p>
          </div> : <div className="space-y-3">
            {filteredProducts.map(product => <div key={product.id} className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
                <div className="flex">
                  <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-xl object-cover" />
                  <div className="ml-3 flex-1">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <h4 className="font-bold text-sm">{product.name}</h4>
                        <p className="text-xs text-gray-500">{getStoreName(product.storeId)}</p>
                        <p className="text-sm font-bold text-green-600 mt-1">
                          {formatCurrency(product.price)}
                        </p>
                      </div>
                    </div>

                    {/* Issue Badge */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center">
                        <AlertCircle size={14} className="text-red-500 mr-1" />
                        <span className="text-xs text-red-600 font-bold">
                          {product.audit.reason}
                        </span>
                      </div>
                    </div>

                    {/* Current Category */}
                    <div className="mb-3">
                      <p className="text-xs text-gray-500">Current category:</p>
                      <p className="text-sm font-bold text-gray-700">
                        {product.category || '(None)'}
                      </p>
                    </div>

                    {/* Fix Button */}
                    <button onClick={() => handleFixProduct(product)} className="w-full py-2 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-colors">
                      Fix Category
                    </button>
                  </div>
                </div>
              </div>)}
          </div>}
      </div>

      {/* Category Picker Modal */}
      <AnimatePresence>
        {showCategoryPicker && selectedProduct && <motion.div initial={{
        opacity: 0
      }} animate={{
        opacity: 1
      }} exit={{
        opacity: 0
      }} className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[70] flex items-center justify-center px-6" onClick={() => setShowCategoryPicker(false)}>
            <motion.div initial={{
          scale: 0.9,
          y: 20
        }} animate={{
          scale: 1,
          y: 0
        }} className="bg-white w-full max-w-sm rounded-[32px] overflow-hidden shadow-2xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="p-6 border-b border-gray-100 sticky top-0 bg-white z-10">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold">Select Category</h2>
                  <button onClick={() => setShowCategoryPicker(false)} className="p-2 text-gray-400 hover:text-gray-600">
                    <X size={20} />
                  </button>
                </div>
                <p className="text-sm text-gray-500 mt-1">{selectedProduct.name}</p>
              </div>

              <div className="p-6 space-y-2">
                {VALID_CATEGORIES.map(category => <button key={category} onClick={() => setSelectedCategory(category)} className={`w-full p-4 rounded-2xl border-2 text-left transition-colors ${selectedCategory === category ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200 hover:border-green-200'}`}>
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm">{category}</span>
                      {selectedCategory === category && <div className="w-5 h-5 rounded-full bg-green-600 flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full" />
                        </div>}
                    </div>
                  </button>)}

                <div className="flex space-x-3 pt-4">
                  <button onClick={() => setShowCategoryPicker(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-2xl">
                    Cancel
                  </button>
                  <button onClick={handleSaveCategory} disabled={!selectedCategory} className={`flex-1 py-3 font-bold rounded-2xl shadow-lg transition-colors ${selectedCategory ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-200' : 'bg-gray-200 text-gray-400 cursor-not-allowed shadow-none'}`}>
                    Save Category
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>}
      </AnimatePresence>
    </motion.div>;
};