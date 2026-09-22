import React, { useState } from 'react';
import { Supplier } from '../types';
import {
  Truck,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  Edit2,
  Trash2,
  X,
  Building2,
  Power,
  Eye,
  EyeOff,
} from 'lucide-react';

interface SuppliersModuleProps {
  suppliers: Supplier[];
  onAddSupplier: (supplier: Supplier) => void;
  onUpdateSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplierId: string) => void;
}

export const SuppliersModule: React.FC<SuppliersModuleProps> = ({
  suppliers,
  onAddSupplier,
  onUpdateSupplier,
  onDeleteSupplier,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Activos' | 'Inactivos'>('Todos');
  const [showModal, setShowModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [formData, setFormData] = useState<Partial<Supplier>>({
    companyName: '',
    contactPerson: '',
    phone: '',
    email: '',
    category: 'Mobiliario para Peluquería y Estética',
    city: '',
    creditDays: 30,
    isActive: true,
  });

  const handleOpenCreate = () => {
    setEditingSupplier(null);
    setFormData({
      companyName: '',
      contactPerson: '',
      phone: '',
      email: '',
      category: 'Mobiliario para Peluquería y Estética',
      city: '',
      creditDays: 30,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (s: Supplier) => {
    setEditingSupplier(s);
    setFormData({ ...s, isActive: s.isActive !== false });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.companyName || !formData.phone) {
      alert('Por favor ingresa la empresa y teléfono del proveedor.');
      return;
    }

    if (editingSupplier) {
      onUpdateSupplier({
        ...editingSupplier,
        ...formData,
        creditDays: Number(formData.creditDays || 0),
        isActive: formData.isActive !== false,
      } as Supplier);
    } else {
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        companyName: formData.companyName || '',
        contactPerson: formData.contactPerson || '',
        phone: formData.phone || '',
        email: formData.email || '',
        category: formData.category || 'Mobiliario',
        city: formData.city || 'Ciudad de México',
        creditDays: Number(formData.creditDays || 0),
        isActive: formData.isActive !== false,
      };
      onAddSupplier(newSup);
    }

    setShowModal(false);
  };

  const filtered = suppliers.filter((s) => {
    const isAct = s.isActive !== false;
    const matchStatus =
      statusFilter === 'Todos' ||
      (statusFilter === 'Activos' && isAct) ||
      (statusFilter === 'Inactivos' && !isAct);
    const matchSearch =
      s.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.city.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });


  return (
    <div id="suppliers-module" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#F4F5F7]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Proveedores y Fabricantes
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gestión de cadenas de suministro de mobiliario, químicos de belleza y aparatos.
          </p>
        </div>

        <button
          id="btn-new-supplier"
          onClick={handleOpenCreate}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E6007E] hover:bg-[#D60072] text-white font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Registrar Proveedor</span>
        </button>
      </div>

      {/* Search and Status Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por empresa, contacto, ciudad o categoría..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#E6007E] bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-1.5 w-full sm:w-auto">
          {/* Status filters */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {(['Todos', 'Activos', 'Inactivos'] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg transition cursor-pointer text-xs font-bold ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <span className="text-xs text-slate-500 font-semibold hidden lg:inline ml-2">
            {filtered.length} registrados
          </span>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {filtered.map((s) => {
          const isActive = s.isActive !== false;

          return (
            <div
              key={s.id}
              className={`p-5 rounded-2xl border shadow-xs flex flex-col justify-between hover:shadow-md transition space-y-4 ${
                isActive
                  ? 'bg-white border-slate-200/90'
                  : 'bg-slate-50/70 border-slate-200 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-[#0F172A] leading-tight">{s.companyName}</h3>
                    <p className="text-xs text-slate-500 mt-1 font-medium">{s.contactPerson}</p>
                  </div>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                      isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <div className="mt-3">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-pink-50 text-[#E6007E] text-xs font-semibold border border-pink-100">
                    {s.category}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="font-mono">{s.phone}</span>
                  </div>
                  {s.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{s.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{s.city}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>Crédito de pago: <strong>{s.creditDays} días</strong></span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1.5">
                {/* Activar / Desactivar Toggle */}
                <button
                  onClick={() => {
                    onUpdateSupplier({
                      ...s,
                      isActive: !isActive,
                    });
                  }}
                  className={`p-2 rounded-lg transition cursor-pointer ${
                    isActive
                      ? 'text-slate-500 hover:text-amber-700 hover:bg-amber-50'
                      : 'text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50'
                  }`}
                  title={isActive ? 'Desactivar proveedor' : 'Activar proveedor'}
                >
                  {isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>

                <button
                  onClick={() => handleOpenEdit(s)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition cursor-pointer"
                  title="Editar proveedor"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    if (confirm(`¿Eliminar proveedor "${s.companyName}" definitivamente?`)) {
                      onDeleteSupplier(s.id);
                    }
                  }}
                  className="p-2 text-rose-600 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                  title="Eliminar proveedor"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>


      {/* MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingSupplier ? 'Editar Proveedor' : 'Registrar Nuevo Proveedor'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Nombre de la Empresa / Razón Social *</label>
                  <input
                    type="text"
                    required
                    value={formData.companyName || ''}
                    onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Ej. Muebles Spa & Salón de México"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contacto / Ejecutivo</label>
                  <input
                    type="text"
                    value={formData.contactPerson || ''}
                    onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    placeholder="Ej. Ing. Roberto Fuentes"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono Directo *</label>
                  <input
                    type="tel"
                    required
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Ej. 55-5566-7788"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={formData.email || ''}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="ventas@proveedor.com"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ciudad / Origen</label>
                  <input
                    type="text"
                    value={formData.city || ''}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    placeholder="Ej. Guadalajara, Jal."
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-bold text-slate-700 block mb-1">Giro / Categoría que Suministra</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Ej. Sillones hidráulicos y lavacabezas italianos"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Días de Crédito Otorgados</label>
                  <input
                    type="number"
                    value={formData.creditDays || 30}
                    onChange={(e) => setFormData({ ...formData, creditDays: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div className="sm:col-span-2 bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-slate-800 block">Estado del Proveedor</span>
                    <span className="text-[11px] text-slate-500">
                      {formData.isActive !== false ? 'Proveedor Activo (En cartera de compras)' : 'Proveedor Inactivo'}
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
                  {editingSupplier ? 'Guardar Cambios' : 'Registrar Proveedor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
