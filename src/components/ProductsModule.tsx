import React, { useState, useRef } from 'react';
import { Product, ProductCategory } from '../types';
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
} from 'lucide-react';

interface ProductsModuleProps {
  products: Product[];
  onAddProduct: (product: Product) => void;
  onUpdateProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
}

export const ProductsModule: React.FC<ProductsModuleProps> = ({
  products,
  onAddProduct,
  onUpdateProduct,
  onDeleteProduct,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // File Upload & Drag-and-Drop State
  const [isDragging, setIsDragging] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Form State
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    sku: '',
    category: 'Mobiliario',
    price: 0,
    costPrice: 0,
    wholesalePrice: 0,
    stock: 10,
    minStock: 3,
    image: '',
    description: '',
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
    setFormData({
      name: '',
      sku: `PB-${Math.floor(100 + Math.random() * 900)}`,
      category: 'Mobiliario',
      price: 1500,
      costPrice: 850,
      wholesalePrice: 1350,
      stock: 10,
      minStock: 3,
      image: '',
      description: '',
    });
    setShowModal(true);
  };

  // Open modal for Edit
  const handleOpenEdit = (p: Product) => {
    setEditingProduct(p);
    setShowUrlInput(false);
    setFormData({ ...p });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.sku || !formData.price) {
      alert('Por favor completa los campos requeridos (Nombre, SKU, Precio).');
      return;
    }

    if (editingProduct) {
      onUpdateProduct({
        ...editingProduct,
        ...formData,
        price: Number(formData.price),
        costPrice: Number(formData.costPrice || 0),
        wholesalePrice: Number(formData.wholesalePrice || 0),
        stock: Number(formData.stock || 0),
        minStock: Number(formData.minStock || 0),
      } as Product);
    } else {
      const newProd: Product = {
        id: `prod-${Date.now()}`,
        name: formData.name || '',
        sku: formData.sku || `PB-${Date.now()}`,
        category: (formData.category as ProductCategory) || 'Mobiliario',
        price: Number(formData.price),
        costPrice: Number(formData.costPrice || 0),
        wholesalePrice: Number(formData.wholesalePrice || 0),
        stock: Number(formData.stock || 0),
        minStock: Number(formData.minStock || 0),
        image: formData.image || 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        description: formData.description || '',
      };
      onAddProduct(newProd);
    }

    setShowModal(false);
  };

  const filtered = products.filter((p) => {
    const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchTerm.toLowerCase());
    return matchCat && matchSearch;
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

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs font-semibold">
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
                <th className="py-3.5 px-3">P. Venta</th>
                <th className="py-3.5 px-3">P. Mayoreo</th>
                <th className="py-3.5 px-3 text-center">Stock</th>
                <th className="py-3.5 px-3 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => {
                const isOutOfStock = item.stock <= 0;
                const isLowStock = item.stock > 0 && item.stock <= item.minStock;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition">
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
                          <p className="text-[10px] font-mono text-slate-500">{item.sku}</p>
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
                    <td className="py-3 px-3 font-mono font-bold text-[#0F172A]">
                      ${item.price.toLocaleString('es-MX')}
                    </td>
                    <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">
                      {item.wholesalePrice ? `$${item.wholesalePrice.toLocaleString('es-MX')}` : '—'}
                    </td>
                    <td className="py-3 px-3 text-center font-bold text-sm">
                      {item.stock}
                      <span className="text-[10px] text-slate-400 block">mín. {item.minStock}</span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      {isOutOfStock ? (
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
                        <button
                          onClick={() => handleOpenEdit(item)}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Editar producto"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`¿Eliminar producto "${item.name}" del catálogo?`)) {
                              onDeleteProduct(item.id);
                            }
                          }}
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
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
                  <label className="font-bold text-slate-700 block mb-1">Precio Venta Público ($) *</label>
                  <input
                    type="number"
                    required
                    value={formData.price || 0}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm font-bold text-[#E6007E] focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Precio Mayoreo / Salón ($)</label>
                  <input
                    type="number"
                    value={formData.wholesalePrice || 0}
                    onChange={(e) => setFormData({ ...formData, wholesalePrice: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Stock Actual (piezas)</label>
                  <input
                    type="number"
                    value={formData.stock || 0}
                    onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
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
