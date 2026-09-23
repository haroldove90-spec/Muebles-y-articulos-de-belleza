import React, { useState } from 'react';
import { Branch, Product, Sale, UserRole, StockTransfer } from '../types';
import {
  Building2,
  Plus,
  Search,
  CheckCircle2,
  XCircle,
  Edit2,
  Trash2,
  ShieldCheck,
  Phone,
  MapPin,
  User,
  ShoppingBag,
  DollarSign,
  Package,
  Lock,
  Unlock,
  Store,
  ExternalLink,
  AlertCircle,
  X,
  ArrowLeftRight,
  ArrowRight,
  Printer,
  FileText,
} from 'lucide-react';
import { TransferReceiptModal } from './TransferReceiptModal';

interface BranchesModuleProps {
  branches: Branch[];
  activeBranchId: string;
  products?: Product[];
  sales?: Sale[];
  transfers?: StockTransfer[];
  currentRole: UserRole;
  onSelectActiveBranch?: (branchId: string) => void;
  onSelectBranch?: (branchId: string) => void;
  onAddBranch: (branch: Branch) => void;
  onUpdateBranch: (branch: Branch) => void;
  onDeleteBranch: (branchId: string) => void;
  onToggleBlockBranch?: (branchId: string) => void;
  onPerformTransfer?: (transfer: StockTransfer) => void;
  onNavigateToModule?: (module: 'pos' | 'products' | 'metrics') => void;
}

export const BranchesModule: React.FC<BranchesModuleProps> = ({
  branches,
  activeBranchId,
  products = [],
  sales = [],
  transfers = [],
  currentRole,
  onSelectActiveBranch,
  onSelectBranch,
  onAddBranch,
  onUpdateBranch,
  onDeleteBranch,
  onToggleBlockBranch,
  onPerformTransfer,
  onNavigateToModule,
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'transfers'>('branches');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todas' | 'Activas' | 'Bloqueadas'>('Todas');
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Transfer State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSourceId, setTransferSourceId] = useState<string>(branches[0]?.id || '');
  const [transferTargetId, setTransferTargetId] = useState<string>(branches[1]?.id || branches[0]?.id || '');
  const [transferProductId, setTransferProductId] = useState<string>(products[0]?.id || '');
  const [transferQuantity, setTransferQuantity] = useState<number>(1);
  const [transferReason, setTransferReason] = useState<string>('Reabastecimiento de piso de venta');
  const [transferPerformedBy, setTransferPerformedBy] = useState<string>(currentRole);
  const [viewingTransferReceipt, setViewingTransferReceipt] = useState<StockTransfer | null>(null);

  const handleSelectBranch = (id: string) => {
    if (onSelectActiveBranch) onSelectActiveBranch(id);
    else if (onSelectBranch) onSelectBranch(id);
  };

  // Form State
  const [formData, setFormData] = useState<Partial<Branch>>({
    name: '',
    code: '',
    address: '',
    phone: '',
    managerName: '',
    isMain: false,
    isActive: true,
  });

  const handleOpenCreate = () => {
    setEditingBranch(null);
    const nextNum = branches.length + 1;
    setFormData({
      name: `Sucursal ${nextNum}`,
      code: `SUC-0${nextNum}`,
      address: '',
      phone: '',
      managerName: '',
      isMain: branches.length === 0,
      isActive: true,
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b: Branch) => {
    setEditingBranch(b);
    setFormData({ ...b });
    setShowModal(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.code) {
      alert('Por favor proporciona al menos el nombre y código de la sucursal.');
      return;
    }

    if (editingBranch) {
      onUpdateBranch({
        ...editingBranch,
        ...formData,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        address: formData.address?.trim() || '',
        phone: formData.phone?.trim() || '',
        managerName: formData.managerName?.trim() || undefined,
        isMain: formData.isMain ?? editingBranch.isMain,
        isActive: formData.isActive ?? true,
      } as Branch);
    } else {
      const newBranch: Branch = {
        id: `branch-${Date.now()}`,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        address: formData.address?.trim() || '',
        phone: formData.phone?.trim() || '',
        managerName: formData.managerName?.trim() || undefined,
        isMain: formData.isMain ?? false,
        isActive: formData.isActive ?? true,
        createdAt: new Date().toISOString(),
      };
      onAddBranch(newBranch);
    }

    setShowModal(false);
  };

  const handleToggleBlock = (branch: Branch) => {
    if (branch.isMain && branch.isActive) {
      const confirmDeact = window.confirm(
        'Esta es la Sucursal Principal. ¿Deseas suspender/bloquear sus operaciones momentáneamente?'
      );
      if (!confirmDeact) return;
    }
    if (onToggleBlockBranch) {
      onToggleBlockBranch(branch.id);
    } else {
      onUpdateBranch({
        ...branch,
        isActive: !branch.isActive,
      });
    }
  };

  const handleDelete = (branch: Branch) => {
    if (branch.isMain) {
      alert('La Sucursal Principal / Maestra no puede ser eliminada.');
      return;
    }

    const confirmDelete = window.confirm(
      `¿Estás seguro de eliminar permanentemente la sucursal "${branch.name}"? Los productos mantendrán su catálogo general.`
    );
    if (!confirmDelete) return;

    onDeleteBranch(branch.id);
  };

  // Transfer Handlers
  const handleOpenTransferModal = (prefillSourceId?: string, prefillProductId?: string) => {
    if (branches.length < 2) {
      alert('Se requieren al menos 2 sucursales registradas para realizar traspasos de inventario.');
      return;
    }
    const srcId = prefillSourceId || activeBranchId || branches[0]?.id;
    const tgtId = branches.find((b) => b.id !== srcId)?.id || branches[1]?.id;
    setTransferSourceId(srcId);
    setTransferTargetId(tgtId);
    if (prefillProductId) {
      setTransferProductId(prefillProductId);
    } else if (products.length > 0) {
      setTransferProductId(products[0].id);
    }
    setTransferQuantity(1);
    setTransferReason('Reabastecimiento de piso de venta');
    setTransferPerformedBy(currentRole);
    setShowTransferModal(true);
  };

  const handleConfirmTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!transferSourceId || !transferTargetId) {
      alert('Debes seleccionar sucursal de origen y sucursal de destino.');
      return;
    }
    if (transferSourceId === transferTargetId) {
      alert('La sucursal de origen y de destino no pueden ser la misma.');
      return;
    }
    const selectedProd = products.find((p) => p.id === transferProductId);
    if (!selectedProd) {
      alert('Selecciona un producto válido para transferir.');
      return;
    }
    const currentSourceStock = selectedProd.branchStocks?.[transferSourceId] ?? 0;
    if (transferQuantity <= 0) {
      alert('La cantidad a transferir debe ser al menos 1 pieza.');
      return;
    }
    if (transferQuantity > currentSourceStock) {
      alert(`Stock insuficiente en origen. La sucursal solo cuenta con ${currentSourceStock} piezas disponibles de este producto.`);
      return;
    }

    const srcBranch = branches.find((b) => b.id === transferSourceId);
    const tgtBranch = branches.find((b) => b.id === transferTargetId);

    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      folio: `TRF-${String(transfers.length + 1).padStart(3, '0')}`,
      sourceBranchId: transferSourceId,
      sourceBranchName: srcBranch?.name || 'Sucursal Origen',
      targetBranchId: transferTargetId,
      targetBranchName: tgtBranch?.name || 'Sucursal Destino',
      productId: selectedProd.id,
      productName: selectedProd.name,
      productSku: selectedProd.sku,
      quantity: Number(transferQuantity),
      date: new Date().toISOString(),
      reason: transferReason.trim() || 'Traspaso de inventario',
      performedBy: transferPerformedBy.trim() || currentRole,
    };

    if (onPerformTransfer) {
      onPerformTransfer(newTransfer);
    }
    setShowTransferModal(false);
    setViewingTransferReceipt(newTransfer);
  };

  // Filtered branches
  const filteredBranches = branches.filter((b) => {
    const matchesSearch =
      b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (b.managerName && b.managerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      b.address.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'Todas' ||
      (statusFilter === 'Activas' && b.isActive) ||
      (statusFilter === 'Bloqueadas' && !b.isActive);

    return matchesSearch && matchesStatus;
  });

  // Calculate stats per branch
  const getBranchStats = (branchId: string) => {
    // Total stock in this branch
    const branchStockCount = products.reduce((acc, p) => {
      const count = p.branchStocks?.[branchId] ?? 0;
      return acc + count;
    }, 0);

    // Sales in this branch
    const branchSales = sales.filter((s) => s.branchId === branchId);
    const branchSalesTotal = branchSales.reduce((acc, s) => acc + s.total, 0);

    return {
      stock: branchStockCount,
      salesCount: branchSales.length,
      salesTotal: branchSalesTotal,
    };
  };

  const totalGlobalBranches = branches.length;
  const activeBranchesCount = branches.filter((b) => b.isActive).length;
  const blockedBranchesCount = branches.filter((b) => !b.isActive).length;

  return (
    <div id="branches-module" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#F4F5F7]">
      {/* Header & New Branch / Transfer CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
              Control de Sucursales y Traspasos
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-[#E6007E] border border-pink-200">
              {branches.length} {branches.length === 1 ? 'Sucursal' : 'Sucursales'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administra tus tiendas físicas, inventarios independientes, transferencias entre sucursales y puntos de venta.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {branches.length >= 2 && (
            <button
              id="btn-new-transfer"
              onClick={() => handleOpenTransferModal()}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Traspaso</span>
            </button>
          )}

          {currentRole === 'Admin' && (
            <button
              id="btn-new-branch"
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E6007E] hover:bg-[#D60072] text-white font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>Crear Sucursal</span>
            </button>
          )}
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'branches'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tiendas y Sucursales ({branches.length})</span>
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transfers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'transfers'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Traspasos de Inventario ({transfers.length})</span>
        </button>
      </div>

      {activeTab === 'branches' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sucursales</p>
                <p className="text-2xl font-black text-[#0F172A] mt-1">{totalGlobalBranches}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-[#E6007E]">
                <Store className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sucursales Activas</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{activeBranchesCount}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Bloqueadas / Pausa</p>
                <p className="text-2xl font-black text-amber-600 mt-1">{blockedBranchesCount}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
                <Lock className="w-6 h-6" />
              </div>
            </div>
          </div>

      {/* Search and Filter Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar sucursal por nombre, código, responsable o dirección..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#E6007E]"
          />
        </div>

        <div className="flex items-center gap-1.5 self-end md:self-auto">
          {(['Todas', 'Activas', 'Bloqueadas'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setStatusFilter(filter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                statusFilter === filter
                  ? 'bg-[#0F172A] text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Branches Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredBranches.map((branch) => {
          const stats = getBranchStats(branch.id);
          const isCurrentActive = branch.id === activeBranchId;

          return (
            <div
              key={branch.id}
              className={`bg-white rounded-2xl border transition-all duration-200 shadow-2xs overflow-hidden flex flex-col justify-between ${
                isCurrentActive
                  ? 'border-[#E6007E] ring-2 ring-pink-100 shadow-md'
                  : 'border-slate-200 hover:border-slate-300'
              } ${!branch.isActive ? 'bg-slate-50/80 opacity-90' : ''}`}
            >
              {/* Card Header */}
              <div className="p-4 sm:p-5 border-b border-slate-100">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {branch.code}
                    </span>
                    {branch.isMain && (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-[#E6007E] border border-pink-200">
                        <ShieldCheck className="w-3 h-3" />
                        <span>Principal / Maestra</span>
                      </span>
                    )}
                    {isCurrentActive && (
                      <span className="flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Sucursal Activa</span>
                      </span>
                    )}
                  </div>

                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0 ${
                      branch.isActive
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {branch.isActive ? (
                      <>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        <span>Operativa</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3 h-3 text-amber-600" />
                        <span>Bloqueada</span>
                      </>
                    )}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-black text-[#0F172A] leading-tight">
                  {branch.name}
                </h3>

                {/* Info contact */}
                <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {branch.address && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{branch.address}</span>
                    </div>
                  )}
                  {branch.phone && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{branch.phone}</span>
                    </div>
                  )}
                  {branch.managerName && (
                    <div className="flex items-center gap-2 text-slate-500">
                      <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">Encargado: {branch.managerName}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Stats Sub-row */}
              <div className="px-4 py-3 bg-slate-50/70 border-b border-slate-100 grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-[#E6007E]" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Stock en tienda</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      {stats.stock} <span className="text-[11px] font-normal text-slate-500">piezas</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-600" />
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-bold block">Ventas</span>
                    <span className="font-extrabold text-slate-900 text-sm">
                      ${stats.salesTotal.toLocaleString('es-MX')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="p-3 sm:p-4 bg-white flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectBranch(branch.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                    isCurrentActive
                      ? 'bg-pink-50 text-[#E6007E] border border-pink-200'
                      : 'bg-[#0F172A] text-white hover:bg-slate-800 shadow-2xs'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>{isCurrentActive ? 'Sucursal Seleccionada' : 'Navegar en Sucursal'}</span>
                </button>

                {currentRole === 'Admin' && (
                  <div className="flex items-center gap-1">
                    {/* Toggle Lock / Unlock */}
                    <button
                      type="button"
                      onClick={() => handleToggleBlock(branch)}
                      title={branch.isActive ? 'Bloquear sucursal' : 'Desbloquear sucursal'}
                      className={`p-2 rounded-xl border text-xs font-bold transition active:scale-95 cursor-pointer ${
                        branch.isActive
                          ? 'border-slate-200 text-slate-600 hover:text-amber-700 hover:bg-amber-50 hover:border-amber-200'
                          : 'border-amber-300 text-amber-700 bg-amber-50 hover:bg-amber-100'
                      }`}
                    >
                      {branch.isActive ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    </button>

                    {/* Edit */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(branch)}
                      title="Editar datos de la sucursal"
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-[#0F172A] hover:bg-slate-100 transition active:scale-95 cursor-pointer"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    {/* Delete (disabled for main branch) */}
                    {!branch.isMain && (
                      <button
                        type="button"
                        onClick={() => handleDelete(branch)}
                        title="Eliminar sucursal"
                        className="p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition active:scale-95 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      </>
      )}

      {/* TRANSFERS VIEW TAB */}
      {activeTab === 'transfers' && (
        <div className="space-y-6">
          {/* Transfer KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Traspasos</p>
                <p className="text-2xl font-black text-purple-700 mt-1">{transfers.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Operaciones registradas</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <ArrowLeftRight className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Piezas Movilizadas</p>
                <p className="text-2xl font-black text-[#0F172A] mt-1">
                  {transfers.reduce((acc, t) => acc + t.quantity, 0)} <span className="text-sm font-semibold text-slate-400">pzas</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Control de existencias</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                <Package className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sucursales Conectadas</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">{branches.length}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Red de distribución</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <Building2 className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Transfers Table Card */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-black text-[#0F172A] text-base">Historial de Traspasos de Mercancía</h3>
                <p className="text-xs text-slate-400">
                  Control de auditoría y remisiones de movimiento entre almacenes de sucursales.
                </p>
              </div>
              {branches.length >= 2 && (
                <button
                  type="button"
                  onClick={() => handleOpenTransferModal()}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs transition active:scale-95 cursor-pointer self-start sm:self-auto"
                >
                  <ArrowLeftRight className="w-3.5 h-3.5" />
                  <span>Crear Nuevo Traspaso</span>
                </button>
              )}
            </div>

            {transfers.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-700 text-sm">No hay traspasos registrados</h4>
                <p className="text-xs text-slate-400 max-w-sm mx-auto">
                  Mueve inventario entre sucursales para abastecer los puntos de venta con mayor demanda.
                </p>
                {branches.length >= 2 && (
                  <button
                    type="button"
                    onClick={() => handleOpenTransferModal()}
                    className="px-4 py-2 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700"
                  >
                    Hacer Traspaso Ahora
                  </button>
                )}
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-600">
                  <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                    <tr>
                      <th className="py-3 px-4">Folio Vale</th>
                      <th className="py-3 px-4">Fecha y Hora</th>
                      <th className="py-3 px-4">Ruta (Origen → Destino)</th>
                      <th className="py-3 px-4">Producto / SKU</th>
                      <th className="py-3 px-4 text-center">Cantidad</th>
                      <th className="py-3 px-4">Motivo</th>
                      <th className="py-3 px-4">Responsable</th>
                      <th className="py-3 px-4 text-right">Comprobante</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-slate-50/70 transition">
                        <td className="py-3 px-4 font-mono font-bold text-purple-700">
                          {t.folio}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {new Date(t.date).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-2 py-0.5 rounded bg-slate-100 font-bold text-slate-700 text-[11px]">
                              {t.sourceBranchName}
                            </span>
                            <ArrowRight className="w-3 h-3 text-purple-500 shrink-0" />
                            <span className="px-2 py-0.5 rounded bg-purple-50 font-bold text-purple-700 text-[11px]">
                              {t.targetBranchName}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 line-clamp-1">{t.productName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">SKU: {t.productSku}</p>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black bg-purple-100 text-purple-800">
                            {t.quantity} pzas
                          </span>
                        </td>
                        <td className="py-3 px-4 text-slate-600 max-w-xs truncate" title={t.reason}>
                          {t.reason}
                        </td>
                        <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                          {t.performedBy}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setViewingTransferReceipt(t)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 font-bold text-xs transition cursor-pointer active:scale-95"
                            title="Ver e imprimir vale oficial"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Vale</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL NUEVO TRASPASO DE INVENTARIO */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F172A]">Nuevo Traspaso entre Sucursales</h3>
                  <p className="text-xs text-slate-500">Mueve existencias de almacén con registro de vale oficial</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowTransferModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="mt-4 space-y-4 text-xs">
              {/* Origen y Destino */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sucursal Origen (Salida) *</label>
                  <select
                    value={transferSourceId}
                    onChange={(e) => {
                      const newSrc = e.target.value;
                      setTransferSourceId(newSrc);
                      if (transferTargetId === newSrc) {
                        const fallbackTgt = branches.find((b) => b.id !== newSrc)?.id || '';
                        setTransferTargetId(fallbackTgt);
                      }
                    }}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-purple-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} {!b.isActive ? '(Bloqueada)' : ''}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sucursal Destino (Entrada) *</label>
                  <select
                    value={transferTargetId}
                    onChange={(e) => setTransferTargetId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-purple-500"
                  >
                    {branches
                      .filter((b) => b.id !== transferSourceId)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} {!b.isActive ? '(Bloqueada)' : ''}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Producto a Transferir */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Producto a Traspasar *</label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold focus:outline-none focus:border-purple-500"
                >
                  {products.map((p) => {
                    const currentStock = p.branchStocks?.[transferSourceId] ?? 0;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} (Disp: {currentStock} pzas) - {p.sku}
                      </option>
                    );
                  })}
                </select>
              </div>

              {/* Indicador de Disponibilidad */}
              {(() => {
                const prod = products.find((p) => p.id === transferProductId);
                const available = prod?.branchStocks?.[transferSourceId] ?? 0;
                return (
                  <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Existencias actuales en origen:</span>
                    <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                      available > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                    }`}>
                      {available} piezas disponibles
                    </span>
                  </div>
                );
              })()}

              {/* Cantidad y Motivo */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Cantidad de Piezas *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={transferQuantity}
                    onChange={(e) => setTransferQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-bold focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Autorizado por</label>
                  <input
                    type="text"
                    required
                    value={transferPerformedBy}
                    onChange={(e) => setTransferPerformedBy(e.target.value)}
                    placeholder="Nombre o rol"
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-purple-500"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Motivo o Justificación del Traspaso *</label>
                <input
                  type="text"
                  required
                  value={transferReason}
                  onChange={(e) => setTransferReason(e.target.value)}
                  placeholder="Ej: Pedido urgente de cliente, reabastecimiento..."
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTransferModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold shadow-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Confirmar y Generar Vale</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL IMPRESIÓN DE VALE DE TRASPASO */}
      {viewingTransferReceipt && (
        <TransferReceiptModal
          transfer={viewingTransferReceipt}
          onClose={() => setViewingTransferReceipt(null)}
        />
      )}

      {/* Modal Crear / Editar Sucursal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-[#0F172A]">
                  {editingBranch ? 'Editar Sucursal' : 'Registrar Nueva Sucursal'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Los productos y módulos se integrarán automáticamente para esta sucursal.
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre de la Sucursal *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Sucursal 4 - Perisur"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código Identificador *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej: SUC-04"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#E6007E]"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Teléfono Directo</label>
                  <input
                    type="text"
                    placeholder="Ej: +52 55 1234 5678"
                    value={formData.phone || ''}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Dirección / Ubicación Física</label>
                <input
                  type="text"
                  placeholder="Ej: Centro Comercial Perisur Local 210, CDMX"
                  value={formData.address || ''}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Encargado o Gerente de Sucursal</label>
                <input
                  type="text"
                  placeholder="Ej: Lic. Carlos Almonte"
                  value={formData.managerName || ''}
                  onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                />
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive ?? true}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="w-4 h-4 rounded text-[#E6007E] focus:ring-[#E6007E]"
                  />
                  <span className="font-bold text-slate-800">
                    Sucursal Operativa / Abierta para ventas
                  </span>
                </label>

                {currentRole === 'Admin' && (!editingBranch || !editingBranch.isMain) && (
                  <label className="flex items-center gap-2 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.isMain ?? false}
                      onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                      className="w-4 h-4 rounded text-[#E6007E] focus:ring-[#E6007E]"
                    />
                    <span className="font-bold text-slate-800">
                      Establecer como Sucursal Principal / Maestra
                    </span>
                  </label>
                )}
              </div>

              <div className="pt-4 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-[#E6007E] hover:bg-[#D60072] text-white font-extrabold shadow-sm transition active:scale-95 cursor-pointer"
                >
                  {editingBranch ? 'Guardar Cambios' : 'Crear Sucursal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
