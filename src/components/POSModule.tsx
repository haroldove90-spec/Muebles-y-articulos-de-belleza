import React, { useState, useMemo } from 'react';
import {
  Branch,
  CartItem,
  Customer,
  PaymentMethod,
  Product,
  ProductCategory,
  Sale,
  UserRole,
} from '../types';
import {
  Search,
  Plus,
  Minus,
  Trash2,
  DollarSign,
  Tag,
  UserCheck,
  CreditCard,
  Banknote,
  Send,
  Sparkles,
  AlertTriangle,
  Receipt,
  X,
  RotateCcw,
  ArrowRight,
  ChevronLeft,
  ShoppingCart,
  ShoppingBag,
  Building2,
  Store,
  Lock,
  ChevronDown,
} from 'lucide-react';

interface POSModuleProps {
  products: Product[];
  customers: Customer[];
  branches: Branch[];
  activeBranchId: string;
  currentRole: UserRole;
  onSelectBranch: (branchId: string) => void;
  onCompleteSale: (newSale: Sale) => void;
}

export const POSModule: React.FC<POSModuleProps> = ({
  products,
  customers,
  branches,
  activeBranchId,
  currentRole,
  onSelectBranch,
  onCompleteSale,
}) => {
  // POS State
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<Customer>(
    customers[4] || customers[0]
  );
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Active Branch Context & Status
  const activeBranch = useMemo(() => {
    return branches.find((b) => b.id === activeBranchId) || branches[0] || {
      id: 'branch-1',
      name: 'Sucursal Matriz',
      code: 'SUC-01',
      address: 'Matriz',
      phone: '',
      isActive: true,
      isMain: true,
      createdAt: '',
    };
  }, [branches, activeBranchId]);

  const isBranchBlocked = !activeBranch.isActive;

  // Mobile View Tab: 'catalog' or 'cart' (eliminates forced scrolling on mobile)
  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  // Modals inside POS
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [showDiscountModal, setShowDiscountModal] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  // Payment Form State
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Efectivo');
  const [amountReceived, setAmountReceived] = useState<string>('');

  // Categories list
  const categories: (ProductCategory | 'Todos')[] = [
    'Todos',
    'Mobiliario',
    'Aparatos',
    'Tintes y Cuidado',
    'Combos y Promos',
    'Uñas y Estética',
  ];

  // Helper for Category Color Theme (Soft Pastels with High Contrast Text)
  const getCategoryCardStyle = (category: ProductCategory) => {
    switch (category) {
      case 'Mobiliario':
        return {
          bg: 'bg-sky-50/90 border-sky-200 hover:border-sky-400 hover:shadow-sky-100',
          badge: 'bg-sky-200/70 text-sky-950 font-bold',
          priceColor: 'text-sky-900',
        };
      case 'Aparatos':
        return {
          bg: 'bg-orange-50/90 border-orange-200 hover:border-orange-400 hover:shadow-orange-100',
          badge: 'bg-orange-200/70 text-orange-950 font-bold',
          priceColor: 'text-orange-950',
        };
      case 'Tintes y Cuidado':
        return {
          bg: 'bg-pink-50/90 border-pink-200 hover:border-pink-400 hover:shadow-pink-100',
          badge: 'bg-pink-200/70 text-pink-950 font-bold',
          priceColor: 'text-pink-950',
        };
      case 'Combos y Promos':
        return {
          bg: 'bg-purple-50/90 border-purple-200 hover:border-purple-400 hover:shadow-purple-100',
          badge: 'bg-purple-200/70 text-purple-950 font-bold',
          priceColor: 'text-purple-950',
        };
      case 'Uñas y Estética':
        return {
          bg: 'bg-teal-50/90 border-teal-200 hover:border-teal-400 hover:shadow-teal-100',
          badge: 'bg-teal-200/70 text-teal-950 font-bold',
          priceColor: 'text-teal-950',
        };
      default:
        return {
          bg: 'bg-slate-50 border-slate-200 hover:border-slate-300',
          badge: 'bg-slate-200 text-slate-900',
          priceColor: 'text-slate-900',
        };
    }
  };

  // Stock available for product in current branch
  const getProductBranchStock = (product: Product): number => {
    if (product.branchStocks && product.branchStocks[activeBranch.id] !== undefined) {
      return product.branchStocks[activeBranch.id];
    }
    return product.stock;
  };

  // Filtered products list (Excludes deactivated products from POS sales)
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (p.isActive === false) return false;
      const matchCat =
        selectedCategory === 'Todos' || p.category === selectedCategory;
      const matchSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sku.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, searchTerm]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (isBranchBlocked) {
      alert(`La sucursal "${activeBranch.name}" está bloqueada temporalmente. No es posible agregar artículos ni cobrar en esta sucursal.`);
      return;
    }

    const availableStock = getProductBranchStock(product);
    if (availableStock <= 0) {
      alert(`El producto "${product.name}" no tiene piezas disponibles en "${activeBranch.name}".`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= availableStock) {
          alert(`Stock máximo alcanzado en esta sucursal (${availableStock} piezas disponibles).`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Fixed price tier default: Tier 2 if Mayorista, else Tier 1
        const defaultTier: 1 | 2 | 3 = selectedCustomer.tier === 'Mayorista' ? 2 : 1;
        const p1 = product.price1 ?? product.price;
        const p2 = product.price2 ?? product.wholesalePrice ?? Math.round(p1 * 0.9);
        const unitPrice = defaultTier === 2 ? p2 : p1;

        return [...prev, { product, quantity: 1, unitPrice, priceTier: defaultTier }];
      }
    });
  };

  // Update item price tier (Precio 1, 2 o 3)
  const updateItemPriceTier = (productId: string, tier: 1 | 2 | 3) => {
    setCart((prev) =>
      prev.map((item) => {
        if (item.product.id !== productId) return item;
        const p1 = item.product.price1 ?? item.product.price;
        const p2 = item.product.price2 ?? item.product.wholesalePrice ?? Math.round(p1 * 0.9);
        const p3 = item.product.price3 ?? Math.round(p1 * 0.84);
        const newPrice = tier === 1 ? p1 : tier === 2 ? p2 : p3;
        return {
          ...item,
          priceTier: tier,
          unitPrice: newPrice,
        };
      })
    );
  };

  // Bulk apply price tier to all cart items
  const applyGlobalPriceTier = (tier: 1 | 2 | 3) => {
    setCart((prev) =>
      prev.map((item) => {
        const p1 = item.product.price1 ?? item.product.price;
        const p2 = item.product.price2 ?? item.product.wholesalePrice ?? Math.round(p1 * 0.9);
        const p3 = item.product.price3 ?? Math.round(p1 * 0.84);
        const newPrice = tier === 1 ? p1 : tier === 2 ? p2 : p3;
        return {
          ...item,
          priceTier: tier,
          unitPrice: newPrice,
        };
      })
    );
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            if (newQty > item.product.stock) {
              alert(`Stock máximo alcanzado (${item.product.stock} piezas).`);
              return item;
            }
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
    setDiscountPercent(0);
    setShowCancelConfirm(false);
    setMobileTab('catalog');
  };

  // Calculations
  const rawSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  }, [cart]);

  const totalCartItems = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return (rawSubtotal * discountPercent) / 100;
  }, [rawSubtotal, discountPercent]);

  const taxableSubtotal = rawSubtotal - discountAmount;
  const taxAmount = taxableSubtotal * 0.16; // IVA 16%
  const totalAmount = taxableSubtotal + taxAmount;

  // Amount received parsed
  const numAmountReceived = parseFloat(amountReceived) || 0;
  const changeDue = Math.max(0, numAmountReceived - totalAmount);

  // Open Payment modal
  const handleOpenPayment = () => {
    if (cart.length === 0) return;
    setAmountReceived(Math.ceil(totalAmount).toString());
    setShowPaymentModal(true);
  };

  // Confirm Sale
  const handleConfirmSale = () => {
    if (isBranchBlocked) {
      alert(`No se pueden registrar ventas porque la sucursal "${activeBranch.name}" está bloqueada.`);
      return;
    }

    if (paymentMethod === 'Efectivo' && numAmountReceived < totalAmount) {
      alert('El monto recibido en efectivo es menor al total a cobrar.');
      return;
    }

    const folioNumber = `PB-${Math.floor(1000 + Math.random() * 9000)}`;
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      folio: folioNumber,
      date: new Date().toISOString(),
      cashierRole: currentRole,
      cashierName: currentRole === 'Admin' ? 'Administrador' : currentRole === 'Gerente' ? 'Gerente en Turno' : 'Cajero POS',
      customerName: selectedCustomer ? `${selectedCustomer.name} (${selectedCustomer.businessName})` : 'Público General',
      customerId: selectedCustomer?.id,
      branchId: activeBranch.id,
      branchName: activeBranch.name,
      items: [...cart],
      subtotal: rawSubtotal,
      discountTotal: discountAmount,
      tax: taxAmount,
      total: totalAmount,
      paymentMethod,
      amountPaid: paymentMethod === 'Efectivo' ? numAmountReceived : totalAmount,
      changeDue: paymentMethod === 'Efectivo' ? changeDue : 0,
      status: 'Completada',
    };

    onCompleteSale(newSale);
    setShowPaymentModal(false);
    clearCart();
  };

  return (
    <div id="pos-module-container" className="flex-1 flex flex-col lg:flex-row h-full lg:h-[calc(100vh-65px)] overflow-hidden bg-[#F4F5F7]">
      {/* Alerta de Sucursal Bloqueada */}
      {isBranchBlocked && (
        <div className="bg-rose-600 text-white px-3 sm:px-4 py-2 flex flex-wrap items-center justify-between text-xs font-bold shrink-0 shadow-sm gap-2">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 shrink-0 text-white" />
            <span>
              ⚠️ <strong>{activeBranch.name}</strong> ({activeBranch.code}) se encuentra <strong>BLOQUEADA</strong> o fuera de servicio. No se pueden procesar cobros hasta ser reactivada por el Administrador.
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] opacity-90 hidden md:inline">Cambiar sucursal:</span>
            <select
              value={activeBranchId}
              onChange={(e) => onSelectBranch(e.target.value)}
              className="bg-white text-slate-900 rounded-lg px-2.5 py-1 text-xs font-bold border-none focus:outline-none cursor-pointer"
            >
              {branches.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} {!b.isActive ? '(Bloqueada)' : b.isMain ? '(Matriz)' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Mobile Top Segmented View Switcher: Catálogo vs Carrito */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-3 py-2 flex items-center gap-2 shrink-0 z-10 shadow-xs">
        <button
          type="button"
          id="mobile-tab-catalog-btn"
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
            mobileTab === 'catalog'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Catálogo ({filteredProducts.length})</span>
        </button>

        <button
          type="button"
          id="mobile-tab-cart-btn"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 relative py-2 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer ${
            mobileTab === 'cart'
              ? 'bg-[#E6007E] text-white shadow-xs'
              : 'bg-pink-50 text-[#E6007E] hover:bg-pink-100 border border-pink-200'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          <span>Carrito ({totalCartItems})</span>
          {cart.length > 0 && (
            <span className="ml-1 text-[11px] font-black">
              ${totalAmount.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
            </span>
          )}
        </button>
      </div>

      {/* LEFT SECTION: PRODUCT CATALOG WITH LARGE TACTILE BUTTONS */}
      <div
        className={`flex-1 flex-col min-w-0 border-r border-slate-200 overflow-hidden relative ${
          mobileTab === 'catalog' ? 'flex' : 'hidden lg:flex'
        }`}
      >
        {/* Branch Context Selector & Operational Status Bar */}
        <div className="px-3 sm:px-4 py-2 bg-slate-900 text-white flex items-center justify-between gap-2 text-xs shrink-0">
          <div className="flex items-center gap-2 min-w-0">
            <Store className="w-4 h-4 text-[#E6007E] shrink-0" />
            <span className="text-slate-400 font-semibold hidden sm:inline">Operando en:</span>
            <span className="font-extrabold text-white truncate">{activeBranch.name}</span>
            <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
              {activeBranch.code}
            </span>
            {activeBranch.isMain && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-pink-500/20 text-[#E6007E] border border-pink-500/40">
                Matriz
              </span>
            )}
            {isBranchBlocked && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-rose-500 text-white flex items-center gap-1">
                <Lock className="w-2.5 h-2.5" /> Bloqueada
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <label className="text-[11px] text-slate-400 font-medium hidden md:inline">Cambiar Sucursal:</label>
            <div className="relative">
              <select
                value={activeBranchId}
                onChange={(e) => onSelectBranch(e.target.value)}
                className="bg-slate-800 text-white text-xs font-bold rounded-lg pl-2.5 pr-7 py-1 border border-slate-700 focus:outline-none focus:border-[#E6007E] cursor-pointer appearance-none"
              >
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {!b.isActive ? '🔒 (Bloqueada)' : b.isMain ? '⭐ (Matriz)' : ''}
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Top Search and Category Color Filters */}
        <div className="p-3 sm:p-4 bg-white border-b border-slate-200/90 space-y-3">
          {/* Quick Search Input (Azul / Bordes Seleccionados) */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              id="pos-product-search"
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por mueble, artículo, código o SKU..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] focus:ring-2 focus:ring-pink-100 text-sm bg-[#FAFAFA] text-[#1E293B]"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            {categories.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-semibold transition-all active:scale-95 cursor-pointer ${
                    isActive
                      ? 'bg-[#E6007E] text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Grid: Large Touch Buttons with Images and Pastel Category Backgrounds */}
        <div className="flex-1 p-3 sm:p-4 pb-28 sm:pb-32 lg:pb-4 overflow-y-auto">
          {filteredProducts.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <Search className="w-12 h-12 text-slate-300 mb-2" />
              <p className="font-semibold text-slate-700">No se encontraron productos</p>
              <p className="text-xs text-slate-400 mt-1">Intenta con otro término o categoría</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
              {filteredProducts.map((product) => {
                const style = getCategoryCardStyle(product.category);
                const branchStock = getProductBranchStock(product);
                const isOutOfStock = branchStock <= 0;
                const isLowStock = branchStock > 0 && branchStock <= product.minStock;

                const p1 = product.price1 ?? product.price;
                const p2 = product.price2 ?? product.wholesalePrice ?? Math.round(p1 * 0.9);
                const p3 = product.price3 ?? Math.round(p1 * 0.84);

                return (
                  <button
                    key={product.id}
                    id={`pos-item-${product.id}`}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock || isBranchBlocked}
                    className={`group relative flex flex-col text-left rounded-2xl border p-2.5 sm:p-3 transition-all duration-150 active:scale-97 cursor-pointer shadow-xs ${style.bg} ${
                      isOutOfStock || isBranchBlocked ? 'opacity-55 grayscale cursor-not-allowed' : 'hover:shadow-md'
                    }`}
                  >
                    {/* Image Box */}
                    <div className="relative w-full aspect-4/3 rounded-xl overflow-hidden bg-slate-200 mb-2.5">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />

                      {/* Stock Warning Badge for Active Branch */}
                      {isOutOfStock ? (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          Agotado aquí
                        </span>
                      ) : isLowStock ? (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Bajo: {branchStock}</span>
                        </span>
                      ) : (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold">
                          Stock: {branchStock}
                        </span>
                      )}

                      {/* Category Label Chip */}
                      <span
                        className={`absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded text-[10px] ${style.badge}`}
                      >
                        {product.category}
                      </span>
                    </div>

                    {/* Product Name (High Contrast dark charcoal) */}
                    <h4 className="text-xs sm:text-sm font-bold text-[#1E293B] line-clamp-2 leading-tight min-h-[2.5rem]">
                      {product.name}
                    </h4>

                    {/* SKU & 3 Fixed Prices */}
                    <div className="mt-2 pt-2 border-t border-slate-200/60">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono text-slate-500 truncate max-w-[80px]">
                          {product.sku}
                        </span>
                        <span className={`text-sm sm:text-base font-extrabold ${style.priceColor}`}>
                          ${p1.toLocaleString('es-MX')}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-0.5 font-medium">
                        <span>P2: ${p2}</span>
                        <span>P3: ${p3}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Quick-Checkout Bar on Mobile Catalog - elevated safely above BottomBar */}
        {cart.length > 0 && mobileTab === 'catalog' && (
          <aside
            id="mobile-floating-cart-card"
            aria-label="Resumen flotante del carrito"
            className="lg:hidden fixed bottom-[74px] sm:bottom-[78px] left-3 right-3 max-w-lg mx-auto z-30 pointer-events-auto animate-in slide-in-from-bottom-3 duration-200"
          >
            <div className="bg-[#0F172A]/95 backdrop-blur-md text-white p-3 sm:p-3.5 rounded-2xl shadow-[0_12px_36px_rgba(0,0,0,0.4)] border border-slate-700/80 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-[#E6007E] flex items-center justify-center text-white shrink-0 font-black text-xs shadow-md">
                  {totalCartItems}
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] text-slate-400 font-bold truncate uppercase tracking-wider">
                    Total Ticket ({totalCartItems} {totalCartItems === 1 ? 'pieza' : 'piezas'})
                  </p>
                  <p className="text-base sm:text-lg font-black text-white leading-tight">
                    ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>

              <button
                id="mobile-quick-checkout-btn"
                type="button"
                onClick={() => setMobileTab('cart')}
                className="py-2.5 px-4 rounded-xl bg-[#16A34A] hover:bg-[#15803D] active:scale-95 text-white font-extrabold text-xs shadow-md shadow-emerald-950/40 transition flex items-center gap-1.5 shrink-0 cursor-pointer"
              >
                <span>Ver Carrito / Cobrar</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </aside>
        )}
      </div>

      {/* RIGHT SECTION: CART, CUSTOMER SELECTOR, DISCOUNTS & TOTALS */}
      <div
        className={`w-full lg:w-[420px] bg-white flex-col border-t lg:border-t-0 shadow-lg shrink-0 ${
          mobileTab === 'cart' ? 'flex h-full min-h-0' : 'hidden lg:flex'
        }`}
      >
        {/* Mobile-Only Return to Catalog Banner */}
        <div className="lg:hidden px-3 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between shrink-0">
          <button
            type="button"
            onClick={() => setMobileTab('catalog')}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-slate-900 px-2 py-1 rounded-lg hover:bg-slate-200 transition cursor-pointer active:scale-95"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>← Seguir agregando productos</span>
          </button>
          <span className="text-[11px] font-semibold text-slate-500">
            {totalCartItems} artículos
          </span>
        </div>

        {/* Cart Header */}
        <div className="p-3 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-pink-100 flex items-center justify-center text-[#E6007E]">
              <Receipt className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A]">Ticket de Venta</h3>
              <p className="text-[11px] text-slate-500">{cart.length} productos agregados</p>
            </div>
          </div>

          {/* Destructive Action: Red for Canceling Order */}
          {cart.length > 0 && (
            <button
              id="cancel-order-button"
              onClick={() => setShowCancelConfirm(true)}
              title="Cancelar orden y vaciar carrito"
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-600 hover:bg-rose-50 border border-rose-200 transition cursor-pointer active:scale-95"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Vaciar</span>
            </button>
          )}
        </div>

        {/* Customer Bar: Blue (Informativo / Buscar Cliente) */}
        <div className="px-4 py-2.5 bg-blue-50/50 border-b border-blue-100 flex items-center justify-between">
          <div className="flex items-center gap-2 min-w-0">
            <UserCheck className="w-4 h-4 text-blue-600 shrink-0" />
            <div className="min-w-0">
              <p className="text-xs font-bold text-blue-950 truncate">
                {selectedCustomer.name}
              </p>
              <p className="text-[10px] text-blue-700 truncate">
                {selectedCustomer.businessName} •{' '}
                <span className="font-semibold text-[#E6007E]">{selectedCustomer.tier}</span>
              </p>
            </div>
          </div>

          <button
            id="change-customer-button"
            onClick={() => setShowCustomerModal(true)}
            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-2xs transition active:scale-95 cursor-pointer"
          >
            Cambiar
          </button>
        </div>

        {/* Fast Price Tier Selector for Entire Cart */}
        {cart.length > 0 && (
          <div className="px-3 py-1.5 bg-slate-100 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
              Aplicar a todo:
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => applyGlobalPriceTier(1)}
                className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-white hover:bg-slate-200 text-slate-800 border border-slate-300 transition cursor-pointer"
                title="Cambiar todos los artículos a Precio 1"
              >
                P1 (General)
              </button>
              <button
                type="button"
                onClick={() => applyGlobalPriceTier(2)}
                className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 transition cursor-pointer"
                title="Cambiar todos los artículos a Precio 2"
              >
                P2 (Mayoreo)
              </button>
              <button
                type="button"
                onClick={() => applyGlobalPriceTier(3)}
                className="px-2 py-0.5 rounded text-[10px] font-extrabold bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 transition cursor-pointer"
                title="Cambiar todos los artículos a Precio 3"
              >
                P3 (Especial)
              </button>
            </div>
          </div>
        )}

        {/* Cart Items List */}
        <div className="flex-1 min-h-0 p-3 overflow-y-auto space-y-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400 space-y-2">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-300">
                <Receipt className="w-8 h-8" />
              </div>
              <p className="text-sm font-semibold text-slate-600">Ticket vacío</p>
              <p className="text-xs text-slate-400 max-w-[200px]">
                Toca cualquier producto de la botonera para comenzar la venta
              </p>
            </div>
          ) : (
            cart.map((item) => {
              const p1 = item.product.price1 ?? item.product.price;
              const p2 = item.product.price2 ?? item.product.wholesalePrice ?? Math.round(p1 * 0.9);
              const p3 = item.product.price3 ?? Math.round(p1 * 0.84);
              const activeTier = item.priceTier || 1;

              return (
                <div
                  key={item.product.id}
                  className="p-2.5 rounded-xl border border-slate-200 bg-[#FAFAFA] flex flex-col gap-2 transition-all hover:border-slate-300"
                >
                  <div className="flex items-center gap-2.5">
                    {/* Thumb */}
                    <img
                      src={item.product.image}
                      alt={item.product.name}
                      referrerPolicy="no-referrer"
                      className="w-11 h-11 rounded-lg object-cover bg-slate-200 shrink-0"
                    />

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-[#1E293B] truncate leading-tight">
                        {item.product.name}
                      </p>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                        ${item.unitPrice.toLocaleString('es-MX')} c/u
                      </p>
                    </div>

                    {/* Qty Controls */}
                    <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold text-[#0F172A]">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded flex items-center justify-center text-slate-600 hover:bg-slate-100 active:scale-90"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Subtotal & Delete */}
                    <div className="text-right shrink-0">
                      <p className="text-xs font-extrabold text-[#0F172A]">
                        ${(item.unitPrice * item.quantity).toLocaleString('es-MX')}
                      </p>
                      <button
                        onClick={() => removeFromCart(item.product.id)}
                        className="text-slate-400 hover:text-rose-600 text-[10px] transition mt-0.5"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>

                  {/* 3 Fixed Prices Pill Selector (P1, P2, P3) */}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[10px]">
                    <span className="text-slate-400 font-semibold">Precio aplicado:</span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => updateItemPriceTier(item.product.id, 1)}
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold border transition cursor-pointer ${
                          activeTier === 1
                            ? 'bg-[#E6007E] text-white border-[#E6007E] shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                        title="Precio 1: General"
                      >
                        P1: ${p1}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItemPriceTier(item.product.id, 2)}
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold border transition cursor-pointer ${
                          activeTier === 2
                            ? 'bg-blue-600 text-white border-blue-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                        title="Precio 2: Mayoreo"
                      >
                        P2: ${p2}
                      </button>
                      <button
                        type="button"
                        onClick={() => updateItemPriceTier(item.product.id, 3)}
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold border transition cursor-pointer ${
                          activeTier === 3
                            ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                            : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
                        }`}
                        title="Precio 3: Especial"
                      >
                        P3: ${p3}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Totals & Action Controls */}
        <div className="p-4 bg-white border-t border-slate-200 space-y-3 shadow-inner">
          {/* Discount and Summary Row */}
          <div className="flex items-center justify-between text-xs pb-2 border-b border-slate-100">
            <button
              id="apply-discount-button"
              onClick={() => setShowDiscountModal(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold transition cursor-pointer"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>
                {discountPercent > 0 ? `Descuento ${discountPercent}%` : 'Aplicar Descuento (%)'}
              </span>
            </button>

            {discountPercent > 0 && (
              <span className="text-emerald-600 font-bold">
                -${discountAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            )}
          </div>

          <div className="space-y-1.5 text-xs text-slate-600">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="font-semibold text-[#1E293B]">
                ${rawSubtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span>IVA (16%):</span>
              <span className="font-semibold text-[#1E293B]">
                ${taxAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-[#0F172A] pt-1">
              <span>TOTAL A COBRAR:</span>
              <span className="text-xl font-black text-[#E6007E]">
                ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* PRIMARY ACTION: VERDE ÉXITO / COBRO */}
          <button
            id="pos-charge-button"
            onClick={handleOpenPayment}
            disabled={cart.length === 0 || isBranchBlocked}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 text-white shadow-md transition-all duration-150 active:scale-98 cursor-pointer ${
              cart.length === 0 || isBranchBlocked
                ? 'bg-slate-300 text-slate-500 cursor-not-allowed shadow-none'
                : 'bg-[#16A34A] hover:bg-[#15803D] hover:shadow-lg hover:shadow-emerald-900/20'
            }`}
          >
            <DollarSign className="w-5 h-5 stroke-[2.5]" />
            <span>
              {isBranchBlocked
                ? 'Sucursal Bloqueada para Cobro'
                : `Cobrar $${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}`}
            </span>
          </button>
        </div>
      </div>

      {/* MODAL: COBRO / PAGO (VERDE ÉXITO / CALCULADORA DE CAMBIO) */}
      {showPaymentModal && (
        <div
          id="payment-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold">Procesar Cobro de Venta</h3>
                <p className="text-xs text-slate-300">
                  Cliente: {selectedCustomer.name} ({selectedCustomer.tier})
                </p>
              </div>
              <button
                onClick={() => setShowPaymentModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Grand Total Display */}
              <div className="bg-pink-50/70 p-4 rounded-2xl border border-pink-200 text-center">
                <span className="text-xs font-bold uppercase tracking-wider text-pink-900">
                  Total a Pagar
                </span>
                <p className="text-3xl font-black text-[#E6007E] mt-0.5">
                  ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </p>
              </div>

              {/* Payment Method Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wide mb-2">
                  Selecciona Método de Pago
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(
                    [
                      { id: 'Efectivo', icon: <Banknote className="w-4 h-4" /> },
                      { id: 'Tarjeta de Crédito / Débito', icon: <CreditCard className="w-4 h-4" /> },
                      { id: 'Transferencia SPEI', icon: <Send className="w-4 h-4" /> },
                      { id: 'Crédito Tienda', icon: <Sparkles className="w-4 h-4" /> },
                    ] as const
                  ).map((m) => {
                    const isSelected = paymentMethod === m.id;
                    return (
                      <button
                        key={m.id}
                        onClick={() => setPaymentMethod(m.id)}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-xs font-bold transition active:scale-95 cursor-pointer ${
                          isSelected
                            ? 'border-[#E6007E] bg-pink-50 text-[#E6007E] shadow-xs'
                            : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                        }`}
                      >
                        <div className="mb-1">{m.icon}</div>
                        <span className="text-center leading-tight">{m.id.split(' ')[0]}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Cash Denominations and Change Calculator */}
              {paymentMethod === 'Efectivo' && (
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700">Monto Recibido ($):</label>
                    <button
                      onClick={() => setAmountReceived(Math.ceil(totalAmount).toString())}
                      className="text-xs text-blue-600 hover:underline font-semibold"
                    >
                      Pago exacto
                    </button>
                  </div>

                  <input
                    type="number"
                    value={amountReceived}
                    onChange={(e) => setAmountReceived(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-bold text-lg text-slate-900 bg-white focus:outline-none focus:border-[#E6007E]"
                    placeholder="0.00"
                  />

                  {/* Quick Cash Buttons */}
                  <div className="flex gap-2">
                    {[100, 200, 500, 1000].map((val) => (
                      <button
                        key={val}
                        onClick={() => setAmountReceived(val.toString())}
                        className="flex-1 py-1.5 rounded-lg bg-white hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800"
                      >
                        +${val}
                      </button>
                    ))}
                  </div>

                  {/* Change Calculation Feedback */}
                  <div className="pt-2 flex justify-between items-center text-sm font-bold border-t border-slate-200">
                    <span className="text-slate-600">Cambio / Vuelto:</span>
                    <span
                      className={`text-lg ${
                        numAmountReceived >= totalAmount ? 'text-[#16A34A]' : 'text-rose-600'
                      }`}
                    >
                      ${changeDue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => setShowPaymentModal(false)}
                  className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-sm hover:bg-slate-50 transition cursor-pointer"
                >
                  Regresar
                </button>

                <button
                  id="confirm-payment-btn"
                  onClick={handleConfirmSale}
                  className="flex-2 py-3 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  <DollarSign className="w-5 h-5 stroke-[2.5]" />
                  <span>Confirmar y Generar Ticket</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: SELECT CUSTOMER */}
      {showCustomerModal && (
        <div
          id="customer-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold">Asignar Cliente a la Venta</h3>
              <button
                onClick={() => setShowCustomerModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 space-y-2 overflow-y-auto flex-1">
              {customers.map((c) => {
                const isSelected = selectedCustomer?.id === c.id;
                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setSelectedCustomer(c);
                      setShowCustomerModal(false);
                    }}
                    className={`w-full p-3 rounded-xl border text-left flex items-center justify-between transition cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 shadow-xs'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div>
                      <p className="font-bold text-sm text-[#0F172A]">{c.name}</p>
                      <p className="text-xs text-slate-500">{c.businessName}</p>
                      <p className="text-[11px] text-slate-400">{c.phone}</p>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-bold ${
                        c.tier === 'VIP'
                          ? 'bg-purple-100 text-purple-800'
                          : c.tier === 'Mayorista'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {c.tier}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: APPLY DISCOUNT */}
      {showDiscountModal && (
        <div
          id="discount-modal-backdrop"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
        >
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-base font-bold text-[#0F172A] flex items-center gap-2">
              <Tag className="w-4 h-4 text-blue-600" />
              <span>Aplicar Descuento a la Orden</span>
            </h3>

            <div className="grid grid-cols-4 gap-2">
              {[0, 5, 10, 15, 20].map((pct) => (
                <button
                  key={pct}
                  onClick={() => setDiscountPercent(pct)}
                  className={`py-2 rounded-xl text-xs font-bold border transition cursor-pointer ${
                    discountPercent === pct
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  {pct === 0 ? 'Sin desc.' : `${pct}%`}
                </button>
              ))}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-600 block mb-1">
                O ingresa porcentaje personalizado (%):
              </label>
              <input
                type="number"
                min="0"
                max="100"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.min(100, Math.max(0, Number(e.target.value))))}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-slate-800 focus:outline-none focus:border-blue-600"
              />
            </div>

            <button
              onClick={() => setShowDiscountModal(false)}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-sm transition"
            >
              Aplicar Descuento
            </button>
          </div>
        </div>
      )}

      {/* CONFIRM ORDER CANCEL: RED DESTRUCTIVE ACTION */}
      {showCancelConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 p-5 space-y-3 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-[#0F172A]">¿Cancelar orden actual?</h3>
            <p className="text-xs text-slate-500">
              Se vaciarán todos los artículos del ticket de venta. Esta acción es destructiva e inmediata.
            </p>
            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowCancelConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Continuar Venta
              </button>
              <button
                onClick={clearCart}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold"
              >
                Sí, Cancelar Orden
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
