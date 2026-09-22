import React, { useState, useMemo } from 'react';
import {
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
} from 'lucide-react';

interface POSModuleProps {
  products: Product[];
  customers: Customer[];
  currentRole: UserRole;
  onCompleteSale: (newSale: Sale) => void;
}

export const POSModule: React.FC<POSModuleProps> = ({
  products,
  customers,
  currentRole,
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

  // Filtered products list
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
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
    if (product.stock <= 0) {
      alert(`El producto "${product.name}" está agotado en inventario.`);
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`No hay suficiente stock disponible (${product.stock} unidades en existencia).`);
          return prev;
        }
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Wholesale pricing for wholesale customers
        const unitPrice =
          selectedCustomer.tier === 'Mayorista' && product.wholesalePrice
            ? product.wholesalePrice
            : product.price;

        return [...prev, { product, quantity: 1, unitPrice }];
      }
    });
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
  };

  // Calculations
  const rawSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
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
    <div id="pos-module-container" className="flex-1 flex flex-col lg:flex-row h-[calc(100vh-65px)] overflow-hidden bg-[#F4F5F7]">
      {/* LEFT SECTION: PRODUCT CATALOG WITH LARGE TACTILE BUTTONS */}
      <div className="flex-1 flex flex-col min-w-0 border-r border-slate-200 overflow-hidden">
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
        <div className="flex-1 p-3 sm:p-4 overflow-y-auto">
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
                const isOutOfStock = product.stock <= 0;
                const isLowStock = product.stock > 0 && product.stock <= product.minStock;

                return (
                  <button
                    key={product.id}
                    id={`pos-item-${product.id}`}
                    onClick={() => addToCart(product)}
                    disabled={isOutOfStock}
                    className={`group relative flex flex-col text-left rounded-2xl border p-2.5 sm:p-3 transition-all duration-150 active:scale-97 cursor-pointer shadow-xs ${style.bg} ${
                      isOutOfStock ? 'opacity-50 grayscale cursor-not-allowed' : 'hover:shadow-md'
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

                      {/* Stock Warning Badge */}
                      {isOutOfStock ? (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-rose-600 text-white text-[10px] font-bold uppercase tracking-wider shadow-xs">
                          Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="absolute top-1.5 left-1.5 px-2 py-0.5 rounded-md bg-amber-500 text-white text-[10px] font-bold shadow-xs flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Bajo: {product.stock}</span>
                        </span>
                      ) : (
                        <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-black/50 backdrop-blur-xs text-white text-[10px] font-medium">
                          Stock: {product.stock}
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

                    {/* SKU & Price */}
                    <div className="mt-2 pt-2 border-t border-slate-200/60 flex items-center justify-between">
                      <span className="text-[10px] font-mono text-slate-500 truncate max-w-[80px]">
                        {product.sku}
                      </span>
                      <span className={`text-sm sm:text-base font-extrabold ${style.priceColor}`}>
                        ${product.price.toLocaleString('es-MX')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SECTION: CART, CUSTOMER SELECTOR, DISCOUNTS & TOTALS */}
      <div className="w-full lg:w-[420px] bg-white flex flex-col border-t lg:border-t-0 shadow-lg shrink-0">
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

        {/* Cart Items List */}
        <div className="flex-1 p-3 overflow-y-auto space-y-2">
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
            cart.map((item) => (
              <div
                key={item.product.id}
                className="p-2.5 rounded-xl border border-slate-200 bg-[#FAFAFA] flex items-center gap-2.5 transition-all hover:border-slate-300"
              >
                {/* Thumb */}
                <img
                  src={item.product.image}
                  alt={item.product.name}
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 rounded-lg object-cover bg-slate-200 shrink-0"
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
            ))
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
                {discountPercent > 0 ? `Descuento ${discountPercent}%` : 'Aplicar Descuento'}
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
            disabled={cart.length === 0}
            className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-base flex items-center justify-center gap-2 text-white shadow-md transition-all duration-150 active:scale-98 cursor-pointer ${
              cart.length === 0
                ? 'bg-slate-300 cursor-not-allowed shadow-none'
                : 'bg-[#16A34A] hover:bg-[#15803D] shadow-emerald-200'
            }`}
          >
            <DollarSign className="w-5 h-5 stroke-[2.5]" />
            <span>COBRAR ${totalAmount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
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
