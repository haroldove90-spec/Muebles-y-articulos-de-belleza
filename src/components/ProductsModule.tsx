import React, { useState, useRef } from 'react';
import { Branch, Product, ProductCategory } from '../types';
import {
  Package,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  DollarSign,
  TrendingUp,
  X,
  UploadCloud,
  ImageIcon,
  Power,
  Eye,
  EyeOff,
  Building2,
  Store,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface ProductsModuleProps {
  products: Product[];
  branches: Branch[];
  activeBranchId?: string;
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductsModule: React.FC<ProductsModuleProps> = ({
  products,
  branches,
  activeBranchId,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activos' | 'Inactivos'>('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // File Upload & Drag-and-Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State with fixed price tiers and branch stocks
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: 'Mobiliario',
    price: 65,
    price1: 65,
    price2: 60,
    price3: 57,
    costPrice: 35,
    wholesalePrice: 60,
    stock: 20,
    minStock: 3,
    branchStocks: {},
    image: '',
    description: '',
    isActive: true,
  });

  const categories: (ProductCategory | 'Todos')[] = [
    'Todos',
    'Mobiliario',
    'Aparatos',
    'Tintes y Cuidado',
    'Combos y Promos',
    'Uñas y Estética',
  ];

  // Process uploaded image file with canvas optimization
  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('La imagen no debe superar los 10 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      if (!rawResult) return;

      const img = new Image();
      img.onload = () => {
        const maxDim = 850;
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressed = canvas.toDataURL('image/jpeg', 0.86);
          setFormData((prev) => ({ ...prev, image: compressed }));
        } else {
          setFormData((prev) => ({ ...prev, image: rawResult }));
        }
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processImageFile(e.dataTransfer.files[0]);
    }
  };

  // Open modal for Create
  const handleOpenCreate = () => {
    setEditingProduct(null);
    setShowUrlInput(false);
    const initialBranchStocks: Record<string, number> = {};
    branches.forEach((b) => {
      initialBranchStocks[b.id] = 10;
    });
    const calculatedTotalStock = branches.length * 10;

    setFormData({
      name: '',
      sku: `PB-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Mobiliario',
      price: 65,
      price1: 65,
      price2: 60,
      price3: 57,
      costPrice: 35,
      wholesalePrice: 60,
      stock: calculatedTotalStock || 10,
      minStock: 3,
      branchStocks: initialBranchStocks,
      image: '',
      description: '',
      isActive: true,
    });
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setShowUrlInput(false);
    const branchStocks: Record<string, number> = { ...(p.branchStocks || {}) };
    branches.forEach((b) => {
      if (branchStocks[b.id] === undefined) {
        branchStocks[b.id] = 0;
      }
    });

    const p1 = p.price1 ?? p.price;
    const p2 = p.price2 ?? p.wholesalePrice ?? Math.round(p.price * 0.9);
    const p3 = p.price3 ?? Math.round(p.price * 0.84);

    setFormData({
      ...p,
      price: p1,
      price1: p1,
      price2: p2,
      price3: p3,
      wholesalePrice: p2,
      branchStocks,
      isActive: p.isActive !== false,
    });
    setShowModal(true);
  };

  // Update stock for an individual branch in the form
  const handleBranchStockChange = (branchId: string, qty: number) => {
    const cleanQty = Math.max(0, isNaN(qty) ? 0 : qty);
    const currentStocks = { ...(formData.branchStocks || {}) };
    currentStocks[branchId] = cleanQty;

    // Sum total stock from all branches
    const total = Object.values(currentStocks).reduce((sum, v) => sum + (Number(v) || 0), 0);

    setFormData((prev) => ({
      ...prev,
      branchStocks: currentStocks,
      stock: total,
    }));
  };

  // Bulk stock helper
  const handleApplyStockToAllBranches = (qty: number) => {
    const updatedStocks: Record<string, number> = {};
    branches.forEach((b) => {
      updatedStocks[b.id] = qty;
    });
    const total = branches.length * qty;

    setFormData((prev) => ({
      ...prev,
      branchStocks: updatedStocks,
      stock: total,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const p1 = Number(formData.price1 || formData.price || 0);
    const p2 = Number(formData.price2 || formData.wholesalePrice || p1);
    const p3 = Number(formData.price3 || p2);

    if (!formData.name || !formData.sku || !p1) {
      alert('Por favor completa los campos requeridos (Nombre, SKU, Precio 1).');
      return;
    }

    // Ensure total stock matches branchStocks sum if branches exist
    const branchStocks = { ...(formData.branchStocks || {}) };
    let totalStock = Number(formData.stock || 0);
    if (branches.length > 0) {
      totalStock = branches.reduce((sum, b) => sum + (Number(branchStocks[b.id]) || 0), 0);
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...formData,
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        price: p1,
        price1: p1,
        price2: p2,
        price3: p3,
        costPrice: Number(formData.costPrice || 0),
        wholesalePrice: p2,
        stock: totalStock,
        branchStocks,
        minStock: Number(formData.minStock || 0),
        isActive: formData.isActive !== false,
      } as Product);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name.trim(),
        sku: formData.sku.trim(),
        category: (formData.category as ProductCategory) || 'Mobiliario',
        price: p1,
        price1: p1,
        price2: p2,
        price3: p3,
        costPrice: Number(formData.costPrice || 0),
        wholesalePrice: p2,
        stock: totalStock,
        branchStocks,
        minStock: Number(formData.minStock || 0),
        image: formData.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        description: formData.description || '',
        isActive: formData.isActive !== false,
      };
      onAddProduct(newProd);
    }

    setShowModal(false);
  };

  const filtered = products.filter((p) => {
    const isAct = p.isActive !== false;
    const matchStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'Activos' && isAct) ||
      (statusFilter === 'Inactivos' && !isAct);
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchCat && matchSearch;
  });


  // KPI Metrics
  const totalStockItems = products.reduce((acc, p) => acc + p.stock, 0);
  const totalValuation = products.reduce((acc, p) => acc + p.stock * p.price, 0);
  const lowStockCount = products.filter((p) => p.stock > 0 && p.stock <= p.minStock).length;
  const outOfStockCount = products.filter((p) => p.stock <= 0).length;

  return (
    <div id="products-module" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#F4F5F7]">
      {/* Header & New Product CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Gestión de Inventario y Productos
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Control de existencias, costos, precios mayoristas y alertas de reorden.
          </p>
        </div>

        <button
          id="btn-new-product"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E6007E] hover:bg-[#D60072] text-white font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Producto</span>
        </button>
      </div>

      {/* KPI Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Productos Registrados</span>
          <p className="text-2xl font-black text-[#0F172A] mt-1">{products.length}</p>
          <span className="text-[11px] text-slate-500">{totalStockItems} unidades en bodega</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Valor de Inventario</span>
          <p className="text-2xl font-black text-emerald-700 mt-1">
            ${totalValuation.toLocaleString('es-MX')}
          </p>
          <span className="text-[11px] text-slate-500">Valuación a precio de venta</span>
        </div>

        {/* Amarillo / Ámbar (Precaución: Stock bajo) */}
        <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 uppercase">Stock Bajo</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-black text-amber-900 mt-1">{lowStockCount}</p>
          <span className="text-[11px] text-amber-800">Por debajo del mínimo</span>
        </div>

        {/* Rojo (Alerta / Agotado) */}
        <div className="bg-rose-50/70 p-4 rounded-2xl border border-rose-200 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 uppercase">Agotados</span>
            <XCircle className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-black text-rose-900 mt-1">{outOfStockCount}</p>
          <span className="text-[11px] text-rose-800">Sin unidades disponibles</span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o SKU..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#E6007E] bg-slate-50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
          {/* Status filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl mr-2">
            {(['Todos', 'Activos', 'Inactivos'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-2.5 py-1 rounded-lg transition cursor-pointer text-[11px] font-bold ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition cursor-pointer ${
                selectedCategory === c
                  ? 'bg-[#E6007E] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table (Responsive) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Producto</th>
                <th className="py-3.5 px-3">Categoría</th>
                <th className="py-3.5 px-3">Costo</th>
                <th className="py-3.5 px-3">Precios (P1, P2, P3)</th>
                <th className="py-3.5 px-3 text-center">Existencias</th>
                <th className="py-3.5 px-3 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const isActive = item.isActive !== false;
                const isOutOfStock = item.stock <= 0;
                const isLowStock = item.stock > 0 && item.stock <= item.minStock;

                const p1 = item.price1 ?? item.price;
                const p2 = item.price2 ?? item.wholesalePrice ?? Math.round(item.price * 0.9);
                const p3 = item.price3 ?? Math.round(item.price * 0.84);

                // Stock in currently active branch
                const activeBranchStock = activeBranchId && item.branchStocks
                  ? (item.branchStocks[activeBranchId] ?? 0)
                  : undefined;

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/80 transition ${
                      !isActive ? 'bg-slate-50/60 opacity-75' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-lg object-cover bg-slate-100 shrink-0"
                        />
                        <div className="min-w-0">
                          <p className="font-bold text-[#0F172A] truncate max-w-xs">{item.name}</p>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-slate-500">{item.sku}</span>
                            {!isActive && (
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-200 text-slate-600">
                                Desactivado
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-xs font-medium">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-500">
                      ${item.costPrice.toLocaleString('es-MX')}
                    </td>
                    {/* Fixed Price Tiers (Precio 1, 2, 3) */}
                    <td className="py-3 px-3">
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 font-mono text-xs">
                          <span className="px-1.5 py-0.5 rounded bg-pink-100 text-[#E6007E] font-extrabold text-[10px]">
                            P1
                          </span>
                          <span className="font-black text-[#0F172A]">
                            ${p1.toLocaleString('es-MX')}
                          </span>
                          <span className="text-[10px] text-slate-400">Menudeo</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                          <span className="px-1.5 py-0.2 rounded bg-blue-100 text-blue-700 font-bold text-[9px]">
                            P2
                          </span>
                          <span className="font-semibold">${p2.toLocaleString('es-MX')}</span>
                          <span className="text-[10px] text-slate-400">Mayoreo</span>
                        </div>
                        <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-600">
                          <span className="px-1.5 py-0.2 rounded bg-purple-100 text-purple-700 font-bold text-[9px]">
                            P3
                          </span>
                          <span className="font-semibold">${p3.toLocaleString('es-MX')}</span>
                          <span className="text-[10px] text-slate-400">Especial</span>
                        </div>
                      </div>
                    </td>
                    {/* Multi-Branch Inventory Stock */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        {activeBranchStock !== undefined ? (
                          <div className="flex items-center gap-1 text-xs font-black text-[#0F172A]">
                            <Store className="w-3.5 h-3.5 text-[#E6007E]" />
                            <span>{activeBranchStock} pzs</span>
                            <span className="text-[10px] font-normal text-slate-500">(en tienda)</span>
                          </div>
                        ) : null}
                        <span className="text-[11px] font-bold text-slate-700">
                          Global: {item.stock} pzs
                        </span>
                        <span className="text-[10px] text-slate-400">mín. {item.minStock}</span>
                        {/* Quick branch pill indicator */}
                        {item.branchStocks && Object.keys(item.branchStocks).length > 0 && (
                          <div className="flex items-center gap-1 mt-1 justify-center flex-wrap max-w-[140px]">
                            {branches.map((b) => {
                              const bStock = item.branchStocks?.[b.id] ?? 0;
                              return (
                                <span
                                  key={b.id}
                                  title={`${b.name}: ${bStock} piezas`}
                                  className={`text-[9px] px-1 py-0.2 rounded border font-mono ${
                                    b.id === activeBranchId
                                      ? 'bg-pink-50 border-pink-300 text-[#E6007E] font-bold'
                                      : 'bg-slate-50 border-slate-200 text-slate-600'
                                  }`}
                                >
                                  {b.code}: {bStock}
                                </span>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {!isActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                          <Power className="w-3 h-3 text-slate-400" />
                          Inactivo
                        </span>
                      ) : isOutOfStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                          Agotado
                        </span>
                      ) : isLowStock ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          Stock Bajo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <CheckCircle2 className="w-3 h-3" />
                          Disponible
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Activar / Desactivar Toggle */}
                        <button
                          onClick={() => {
                            onUpdateProduct({
                              ...item,
                              isActive: !isActive,
                            });
                          }}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            isActive
                              ? 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                              : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                          }`}
                          title={isActive ? 'Desactivar producto (ocultar de venta en POS)' : 'Reactivar producto en catálogo'}
                        >
                          {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                        </button>

                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar producto "${item.name}" definitivamente del catálogo?`)) {
                              onDeleteProduct(item.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingProduct ? 'Editar Producto / Mueble' : 'Registrar Nuevo Producto'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nombre del Producto / Mueble *</label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej. Sillón Hidráulico Roma Reclinable"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código SKU *</label>
                  <input
                    type="text"
                    required
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Categoría</label>
                  <select
                    value={formData.category || 'Mobiliario'}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                  >
                    <option value="Mobiliario">Mobiliario (Sillones, Lavacabezas)</option>
                    <option value="Aparatos">Aparatos (Secadoras, Planchas)</option>
                    <option value="Tintes y Cuidado">Tintes y Cuidado Capilar</option>
                    <option value="Combos y Promos">Combos y Promociones</option>
                    <option value="Uñas y Estética">Uñas y Estética</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Costo Proveedor ($)</label>
                  <input
                    type="number"
                    value={formData.costPrice || 0}
                    onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Mínimo Alerta</label>
                  <input
                    type="number"
                    value={formData.minStock || 3}
                    onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                {/* 3 Listas de Precios Fijos (P1, P2, P3) */}
                <div className="sm:col-span-2 bg-gradient-to-r from-pink-50/60 via-blue-50/40 to-purple-50/40 p-4 rounded-2xl border border-pink-200/70">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-[#E6007E]" />
                        <span>Listas de Precios Fijos (Precio 1, 2, 3)</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Precios netos independientes (sin cálculos porcentuales en caja).
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-white p-3 rounded-xl border border-pink-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-extrabold text-[#E6007E] text-xs">
                          Precio 1 *
                        </label>
                        <span className="text-[10px] text-pink-600 font-bold bg-pink-50 px-1.5 py-0.2 rounded">
                          Menudeo
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                        <input
                          type="number"
                          required
                          value={formData.price1 ?? formData.price ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData({ ...formData, price: val, price1: val });
                          }}
                          placeholder="65"
                          className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 text-sm font-black text-[#0F172A] focus:outline-none focus:border-[#E6007E]"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-extrabold text-blue-700 text-xs">
                          Precio 2
                        </label>
                        <span className="text-[10px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.2 rounded">
                          Mayoreo
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                        <input
                          type="number"
                          value={formData.price2 ?? formData.wholesalePrice ?? 0}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            setFormData({ ...formData, price2: val, wholesalePrice: val });
                          }}
                          placeholder="60"
                          className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 text-sm font-black text-[#0F172A] focus:outline-none focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-2xs">
                      <div className="flex items-center justify-between mb-1">
                        <label className="font-extrabold text-purple-700 text-xs">
                          Precio 3
                        </label>
                        <span className="text-[10px] text-purple-600 font-bold bg-purple-50 px-1.5 py-0.2 rounded">
                          Especial
                        </span>
                      </div>
                      <div className="relative">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                        <input
                          type="number"
                          value={formData.price3 ?? 0}
                          onChange={(e) => setFormData({ ...formData, price3: Number(e.target.value) })}
                          placeholder="57"
                          className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-slate-300 text-sm font-black text-[#0F172A] focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Subir Imagen de Producto (Archivo, Arrastrar y Soltar o Selector de Archivos) */}
                <div className="sm:col-span-2 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="font-bold text-slate-700 block">
                      Fotografía del Producto / Mueble
                    </label>
                    <button
                      type="button"
                      onClick={() => setShowUrlInput(!showUrlInput)}
                      className="text-xs text-[#E6007E] hover:underline font-medium"
                    >
                      {showUrlInput ? 'Cerrar entrada URL' : 'O usar link URL'}
                    </button>
                  </div>

                  {formData.image ? (
                    <div className="border border-slate-200 rounded-2xl p-3 bg-slate-50 flex items-center gap-4">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0 flex items-center justify-center">
                        <img
                          src={formData.image}
                          alt="Vista previa"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0 space-y-1.5">
                        <p className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span>Foto lista para guardar</span>
                        </p>
                        <p className="text-[11px] text-slate-500 truncate">
                          La imagen se almacenará con el registro del producto.
                        </p>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                          >
                            Cambiar foto
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData({ ...formData, image: '' })}
                            className="px-2.5 py-1 rounded-lg bg-red-50 border border-red-200 text-xs font-semibold text-red-600 hover:bg-red-100 transition cursor-pointer"
                          >
                            Quitar foto
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                        isDragging
                          ? 'border-[#E6007E] bg-pink-50/70 scale-[1.01]'
                          : 'border-slate-300 hover:border-[#E6007E] hover:bg-slate-50'
                      }`}
                    >
                      <UploadCloud className="w-9 h-9 text-[#E6007E] mx-auto mb-2" />
                      <p className="text-xs sm:text-sm font-bold text-slate-800">
                        Haz clic para subir una imagen o arrástrala aquí
                      </p>
                      <p className="text-[11px] text-slate-500 mt-1">
                        Formatos: PNG, JPG, JPEG, WEBP (se optimiza automáticamente)
                      </p>
                    </div>
                  )}

                  {/* Input de archivo oculto accesible vía click o drag */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        processImageFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {/* Campo de URL alternativo */}
                  {showUrlInput && (
                    <div className="pt-1">
                      <input
                        type="url"
                        value={formData.image || ''}
                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                        placeholder="https://ejemplo.com/foto-producto.jpg"
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-[#E6007E]"
                      />
                    </div>
                  )}
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Descripción / Especificaciones</label>
                  <textarea
                    rows={2}
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Materiales, garantía, dimensiones..."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Estado del Producto</span>
                    <span className="text-[11px] text-slate-500">
                      {formData.isActive !== false ? 'Activo (Visible para venta en mostrador/POS)' : 'Inactivo (Oculto en catálogo POS)'}
                    </span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.isActive !== false}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#16A34A]"></div>
                  </label>
                </div>

                {/* Asignación de Stock Inicial por Sucursal */}
                <div className="sm:col-span-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                        <Building2 className="w-4 h-4 text-[#E6007E]" />
                        <span>Distribución de Inventario por Sucursal</span>
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Captura de una sola vez la cantidad de stock para cada sucursal:
                      </p>
                    </div>

                    {/* Acciones rápidas de llenado masivo */}
                    <div className="flex items-center gap-1">
                      <span className="text-[10px] font-bold text-slate-400 mr-1">Rápido:</span>
                      <button
                        type="button"
                        onClick={() => handleApplyStockToAllBranches(10)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-[10px] font-bold text-slate-700 cursor-pointer"
                      >
                        10 a todas
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyStockToAllBranches(20)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-[10px] font-bold text-slate-700 cursor-pointer"
                      >
                        20 a todas
                      </button>
                      <button
                        type="button"
                        onClick={() => handleApplyStockToAllBranches(0)}
                        className="px-2 py-0.5 rounded-md bg-white border border-slate-300 hover:bg-slate-100 text-[10px] font-bold text-slate-700 cursor-pointer"
                      >
                        0 a todas
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                    {branches.map((b) => {
                      const branchQty = formData.branchStocks?.[b.id] ?? 0;
                      return (
                        <div
                          key={b.id}
                          className="bg-white p-2.5 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-2"
                        >
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="font-mono text-[10px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                {b.code}
                              </span>
                              {b.isMain && (
                                <span className="text-[9px] font-bold text-[#E6007E]">
                                  (Matriz)
                                </span>
                              )}
                            </div>
                            <p className="text-xs font-bold text-[#0F172A] truncate mt-0.5" title={b.name}>
                              {b.name}
                            </p>
                          </div>

                          <div className="w-20 shrink-0">
                            <input
                              type="number"
                              min="0"
                              value={branchQty}
                              onChange={(e) => handleBranchStockChange(b.id, parseInt(e.target.value) || 0)}
                              className="w-full text-center px-2 py-1.5 rounded-lg border border-slate-300 font-extrabold text-sm text-[#0F172A] focus:outline-none focus:border-[#E6007E]"
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Barra de Suma Global Calculada */}
                  <div className="mt-2 pt-2.5 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-600">
                      Total Inventario Global (Suma automática):
                    </span>
                    <span className="text-sm sm:text-base font-black text-[#E6007E] bg-pink-50 px-3 py-1 rounded-xl border border-pink-200">
                      {formData.stock || 0} piezas
                    </span>
                  </div>
                </div>
              </div>


              <div className="flex gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-[#E6007E] hover:bg-[#D60072] text-white font-bold"
                >
                  {editingProduct ? 'Guardar Cambios' : 'Registrar Producto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
