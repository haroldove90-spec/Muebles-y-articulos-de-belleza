import React, { useState } from 'react';
import { Branch, Product, StockTransfer, UserAccount, UserRole, ActiveModule } from '../types';
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building2,
  Package,
  Store,
  ArrowRight,
  Filter,
  Check,
  X,
  Truck,
  Download,
  Printer,
  Sparkles,
  Info,
} from 'lucide-react';
import { TransferReceiptModal } from './TransferReceiptModal';

interface TransfersModuleProps {
  transfers: StockTransfer[];
  branches: Branch[];
  products: Product[];
  activeBranchId: string;
  currentRole: UserRole;
  currentUser?: UserAccount | null;
  onPerformTransfer: (transfer: StockTransfer) => void;
  onAcceptTransfer: (transferId: string, receivedBy: string) => void;
  onRejectTransfer: (transferId: string, reason: string) => void;
  onNavigateToModule?: (module: ActiveModule) => void;
}

export const TransfersModule: React.FC<TransfersModuleProps> = ({
  transfers,
  branches,
  products,
  activeBranchId,
  currentRole,
  currentUser,
  onPerformTransfer,
  onAcceptTransfer,
  onRejectTransfer,
  onNavigateToModule,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterTab, setFilterTab] = useState<'all' | 'incoming' | 'outgoing' | 'transit' | 'received' | 'rejected'>('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [viewingReceipt, setViewingReceipt] = useState<StockTransfer | null>(null);

  // New Transfer Form State
  const [sourceBranchId, setSourceBranchId] = useState<string>(
    activeBranchId || branches[0]?.id || ''
  );
  const [targetBranchId, setTargetBranchId] = useState<string>(
    branches.find((b) => b.id !== (activeBranchId || branches[0]?.id))?.id || branches[1]?.id || ''
  );
  const [productId, setProductId] = useState<string>(products[0]?.id || '');
  const [productSearch, setProductSearch] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Reabastecimiento de piso de venta');
  const [customReason, setCustomReason] = useState('');
  const [notes, setNotes] = useState<string>('');

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  // Incoming shipments pending acceptance for this active branch
  const pendingIncomingForActiveBranch = transfers.filter(
    (t) => t.targetBranchId === activeBranchId && t.status === 'En tránsito'
  );

  // Filtered transfers
  const filteredTransfers = transfers.filter((t) => {
    // Tab filter
    if (filterTab === 'incoming' && t.targetBranchId !== activeBranchId) return false;
    if (filterTab === 'outgoing' && t.sourceBranchId !== activeBranchId) return false;
    if (filterTab === 'transit' && t.status !== 'En tránsito') return false;
    if (filterTab === 'received' && t.status !== 'Recibido') return false;
    if (filterTab === 'rejected' && t.status !== 'Rechazado') return false;

    // Search filter
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      t.folio.toLowerCase().includes(term) ||
      t.productName.toLowerCase().includes(term) ||
      t.productSku.toLowerCase().includes(term) ||
      t.sourceBranchName.toLowerCase().includes(term) ||
      t.targetBranchName.toLowerCase().includes(term) ||
      t.performedBy.toLowerCase().includes(term) ||
      (t.receivedBy && t.receivedBy.toLowerCase().includes(term)) ||
      (t.reason && t.reason.toLowerCase().includes(term))
    );
  });

  // Calculate selected product stock in source branch
  const selectedProduct = products.find((p) => p.id === productId);
  const availableSourceStock = selectedProduct
    ? (selectedProduct.branchStocks?.[sourceBranchId] ?? selectedProduct.stock)
    : 0;

  // Open Create Modal with clean values
  const handleOpenCreateModal = (prefillProductId?: string) => {
    if (branches.length < 2) {
      alert('Se requieren al menos 2 sucursales para realizar traspasos de inventario.');
      return;
    }
    const srcId = activeBranchId || branches[0]?.id;
    const tgtId = branches.find((b) => b.id !== srcId)?.id || branches[1]?.id;
    setSourceBranchId(srcId);
    setTargetBranchId(tgtId);
    if (prefillProductId) {
      setProductId(prefillProductId);
    } else if (products.length > 0) {
      setProductId(products[0].id);
    }
    setQuantity(1);
    setReason('Reabastecimiento de piso de venta');
    setCustomReason('');
    setNotes('');
    setShowCreateModal(true);
  };

  const handleConfirmCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sourceBranchId || !targetBranchId) {
      alert('Selecciona tanto la sucursal de origen como la de destino.');
      return;
    }
    if (sourceBranchId === targetBranchId) {
      alert('La sucursal de origen y destino no pueden ser la misma.');
      return;
    }
    if (!selectedProduct) {
      alert('Selecciona un producto válido del catálogo.');
      return;
    }
    if (quantity <= 0) {
      alert('La cantidad a transferir debe ser de al menos 1 pieza.');
      return;
    }
    if (quantity > availableSourceStock) {
      alert(
        `Existencias insuficientes. La sucursal de origen solo tiene ${availableSourceStock} piezas disponibles de este producto.`
      );
      return;
    }

    const srcBranch = branches.find((b) => b.id === sourceBranchId);
    const tgtBranch = branches.find((b) => b.id === targetBranchId);

    const operatorName = currentUser?.name
      ? `${currentUser.name} (${currentUser.role})`
      : currentRole === 'Admin'
      ? 'Emilio (Admin)'
      : `${currentRole} de ${srcBranch?.name || 'Origen'}`;

    const effectiveReason = reason === 'Otro' ? customReason.trim() || 'Traspaso de inventario' : reason;

    const newTransfer: StockTransfer = {
      id: `trf-${Date.now()}`,
      folio: `TRF-${String(transfers.length + 1).padStart(3, '0')}`,
      sourceBranchId,
      sourceBranchName: srcBranch?.name || 'Sucursal Origen',
      targetBranchId,
      targetBranchName: tgtBranch?.name || 'Sucursal Destino',
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productSku: selectedProduct.sku,
      productImage: selectedProduct.image,
      quantity: Number(quantity),
      date: new Date().toISOString(),
      reason: effectiveReason,
      notes: notes.trim() || undefined,
      performedBy: operatorName,
      status: 'En tránsito',
    };

    onPerformTransfer(newTransfer);
    setShowCreateModal(false);
    setViewingReceipt(newTransfer);
  };

  // Direct quick accept from row or modal
  const handleDirectAccept = (transfer: StockTransfer) => {
    const receiverName = currentUser?.name
      ? `${currentUser.name} (${currentUser.role})`
      : currentRole === 'Admin'
      ? 'Emilio (Admin)'
      : 'Gerente Receptor';

    onAcceptTransfer(transfer.id, receiverName);

    // If modal is open for this transfer, update viewing receipt
    if (viewingReceipt?.id === transfer.id) {
      setViewingReceipt({
        ...viewingReceipt,
        status: 'Recibido',
        receivedBy: receiverName,
        receivedDate: new Date().toISOString(),
      });
    }
  };

  const handleDirectReject = (transfer: StockTransfer) => {
    const userReason = window.prompt('Ingresa el motivo del rechazo del traslado:');
    if (!userReason || !userReason.trim()) return;

    onRejectTransfer(transfer.id, userReason.trim());

    if (viewingReceipt?.id === transfer.id) {
      setViewingReceipt({
        ...viewingReceipt,
        status: 'Rechazado',
        rejectionReason: userReason.trim(),
      });
    }
  };

  return (
    <div id="transfers-module" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#F4F5F7]">
      {/* Header and Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
              <ArrowLeftRight className="w-6 h-6 text-purple-600 stroke-[2.5]" />
              <span>Traslados Intersucursales</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-200">
              Control de Inventario & Vales Oficiales
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Traspasa productos entre sucursales con aprobación del gerente receptor, salida inmediata de stock y órdenes descargables en PDF.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            id="btn-create-transfer"
            type="button"
            onClick={() => handleOpenCreateModal()}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>Nuevo Traslado</span>
          </button>
        </div>
      </div>

      {/* Active Branch and Incoming Shipments Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 sm:p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center text-purple-300 shrink-0">
            <Store className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Tu Sucursal Activa:</span>
              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-white/10 text-pink-300">
                {activeBranch.code}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white">{activeBranch.name}</h3>
            <p className="text-xs text-slate-300 mt-0.5">
              Sesión activa: <strong className="text-pink-300">{currentUser?.name || currentRole}</strong> • Rol: {currentRole}
            </p>
          </div>
        </div>

        {pendingIncomingForActiveBranch.length > 0 ? (
          <div className="bg-amber-500/20 border border-amber-400/40 p-3 rounded-xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0 animate-pulse">
              <Truck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-black text-amber-200">
                ¡{pendingIncomingForActiveBranch.length} {pendingIncomingForActiveBranch.length === 1 ? 'traslado pendiente' : 'traslados pendientes'} por recibir!
              </p>
              <p className="text-[11px] text-amber-100">
                Hay mercancía en tránsito hacia esta tienda esperando tu aceptación.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setFilterTab('incoming')}
              className="ml-auto px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-900 font-extrabold text-xs shrink-0 cursor-pointer shadow-xs transition"
            >
              Ver Traslado
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-400 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Al día: No tienes mercancía pendiente por recibir</span>
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Traslados</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{transfers.length}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Operaciones registradas</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
            <ArrowLeftRight className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-amber-600 uppercase tracking-wider">En Tránsito</p>
            <p className="text-2xl font-black text-amber-600 mt-1">
              {transfers.filter((t) => t.status === 'En tránsito').length}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Pendientes de recibir</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-wider">Recibidos</p>
            <p className="text-2xl font-black text-emerald-600 mt-1">
              {transfers.filter((t) => t.status === 'Recibido').length}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Aceptados por gerentes</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Piezas Movilizadas</p>
            <p className="text-2xl font-black text-[#E6007E] mt-1">
              {transfers.reduce((acc, t) => acc + t.quantity, 0)}{' '}
              <span className="text-sm font-semibold text-slate-400">pzas</span>
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Control de almacén</p>
          </div>
          <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-[#E6007E]">
            <Package className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white p-3 sm:p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3 overflow-x-auto">
          <button
            type="button"
            onClick={() => setFilterTab('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterTab === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Todos ({transfers.length})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('incoming')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              filterTab === 'incoming'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            <span>📥 Entrantes a esta Tienda</span>
            {pendingIncomingForActiveBranch.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-900 text-[10px] font-black">
                {pendingIncomingForActiveBranch.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('outgoing')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterTab === 'outgoing'
                ? 'bg-purple-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            📤 Salientes de esta Tienda
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('transit')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterTab === 'transit'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            En Tránsito ({transfers.filter((t) => t.status === 'En tránsito').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('received')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterTab === 'received'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Recibidos ({transfers.filter((t) => t.status === 'Recibido').length})
          </button>

          <button
            type="button"
            onClick={() => setFilterTab('rejected')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer whitespace-nowrap ${
              filterTab === 'rejected'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Rechazados ({transfers.filter((t) => t.status === 'Rechazado').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por folio (ej. TRF-001), producto, SKU, sucursal origen/destino o responsable..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs sm:text-sm focus:outline-none focus:border-purple-600 bg-white"
          />
        </div>
      </div>

      {/* Transfers List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-black text-[#0F172A] text-sm sm:text-base">
              Registro y Trazabilidad de Traslados
            </h3>
            <p className="text-xs text-slate-400">
              {filteredTransfers.length} {filteredTransfers.length === 1 ? 'operación encontrada' : 'operaciones encontradas'}
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-600 border-b border-slate-200 font-bold">
                <th className="py-3 px-4">Folio / Fecha</th>
                <th className="py-3 px-4">Ruta (Origen &rarr; Destino)</th>
                <th className="py-3 px-4">Producto en Traspaso</th>
                <th className="py-3 px-4 text-center">Cantidad</th>
                <th className="py-3 px-4 text-center">Estado</th>
                <th className="py-3 px-4">Operador / Recepción</th>
                <th className="py-3 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    <ArrowLeftRight className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                    <p className="font-bold text-sm text-slate-600">No se encontraron traslados</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      Intenta con otros filtros o crea un nuevo traslado entre sucursales.
                    </p>
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((t) => {
                  const isPending = t.status === 'En tránsito';
                  const isTargetBranch = activeBranchId === t.targetBranchId;
                  const canAccept = isPending && (currentRole === 'Admin' || isTargetBranch || currentRole === 'Gerente');

                  return (
                    <tr
                      key={t.id}
                      className={`hover:bg-purple-50/40 transition ${
                        isPending && isTargetBranch ? 'bg-amber-50/30' : ''
                      }`}
                    >
                      {/* Folio & Date */}
                      <td className="py-3.5 px-4">
                        <span className="font-mono font-black text-purple-700 block text-xs">
                          {t.folio}
                        </span>
                        <span className="text-[11px] text-slate-400 block mt-0.5">
                          {new Date(t.date).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </td>

                      {/* Route */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-slate-400 text-[10px] font-bold uppercase">De:</span>
                            <span className="font-extrabold text-slate-800">{t.sourceBranchName}</span>
                          </div>
                          <div className="flex items-center gap-1.5 text-xs">
                            <span className="text-emerald-600 text-[10px] font-bold uppercase">A:</span>
                            <span className="font-extrabold text-emerald-800">{t.targetBranchName}</span>
                          </div>
                        </div>
                      </td>

                      {/* Product */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {t.productImage && (
                            <img
                              src={t.productImage}
                              alt={t.productName}
                              className="w-10 h-10 rounded-lg object-cover border border-slate-200 shrink-0"
                            />
                          )}
                          <div className="min-w-0">
                            <p className="font-black text-slate-900 leading-tight truncate max-w-xs">
                              {t.productName}
                            </p>
                            <span className="font-mono text-[10px] text-slate-400 block mt-0.5">
                              SKU: {t.productSku}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Quantity */}
                      <td className="py-3.5 px-4 text-center">
                        <span className="inline-block px-3 py-1 rounded-full bg-purple-100 text-purple-900 font-black text-xs font-mono">
                          {t.quantity} pzas
                        </span>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black ${
                            t.status === 'Recibido'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : t.status === 'Rechazado'
                              ? 'bg-rose-100 text-rose-800 border border-rose-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                          }`}
                        >
                          {t.status === 'Recibido' && <CheckCircle2 className="w-3.5 h-3.5" />}
                          {t.status === 'En tránsito' && <Clock className="w-3.5 h-3.5" />}
                          {t.status === 'Rechazado' && <AlertCircle className="w-3.5 h-3.5" />}
                          <span>{t.status}</span>
                        </span>
                      </td>

                      {/* Operator / Receiver */}
                      <td className="py-3.5 px-4">
                        <p className="text-slate-700 text-xs">
                          <span className="text-slate-400">Envió:</span> <strong>{t.performedBy}</strong>
                        </p>
                        {t.receivedBy ? (
                          <p className="text-emerald-700 text-[11px] mt-0.5">
                            <span className="text-slate-400">Recibió:</span> <strong>{t.receivedBy}</strong>
                          </p>
                        ) : (
                          <span className="text-[11px] text-amber-600 font-semibold block mt-0.5">
                            Pendiente de recepción
                          </span>
                        )}
                        {t.reason && (
                          <p className="text-[10px] text-slate-400 italic mt-0.5 truncate max-w-xs">
                            Motivo: {t.reason}
                          </p>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5 flex-wrap">
                          {/* Accept button right from row if can accept */}
                          {canAccept && (
                            <button
                              type="button"
                              onClick={() => handleDirectAccept(t)}
                              title="Aceptar y sumar piezas al inventario"
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Aceptar</span>
                            </button>
                          )}

                          {canAccept && (
                            <button
                              type="button"
                              onClick={() => handleDirectReject(t)}
                              title="Rechazar traslado"
                              className="p-1.5 rounded-lg border border-rose-300 text-rose-700 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* View Voucher / Order Modal */}
                          <button
                            type="button"
                            onClick={() => setViewingReceipt(t)}
                            title="Ver Orden de Traslado oficial y descargar en PDF"
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-purple-700 font-bold text-xs transition flex items-center gap-1 cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Orden / PDF</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE NEW TRANSFER MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 my-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
                  <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
                </div>
                <div>
                  <h3 className="font-black text-base text-[#0F172A]">Nuevo Traspaso Intersucursal</h3>
                  <p className="text-xs text-slate-400">
                    Despacha mercancía de una sucursal hacia otra con remisión oficial
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmCreate} className="space-y-4">
              {/* Origin and Target Branches */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sucursal Origen (Salida de stock) *
                  </label>
                  <select
                    value={sourceBranchId}
                    onChange={(e) => {
                      const newSrc = e.target.value;
                      setSourceBranchId(newSrc);
                      if (targetBranchId === newSrc) {
                        const other = branches.find((b) => b.id !== newSrc);
                        if (other) setTargetBranchId(other.id);
                      }
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-600 bg-white"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-emerald-800 mb-1">
                    Sucursal Destino (Recepción) *
                  </label>
                  <select
                    value={targetBranchId}
                    onChange={(e) => setTargetBranchId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-emerald-300 text-xs font-semibold focus:outline-none focus:border-emerald-600 bg-white"
                  >
                    {branches
                      .filter((b) => b.id !== sourceBranchId)
                      .map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.name} ({b.code})
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Product Selector with stock preview */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Producto a Trasladar *
                </label>
                <select
                  value={productId}
                  onChange={(e) => {
                    setProductId(e.target.value);
                    setQuantity(1);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-600 bg-white"
                >
                  {products.map((p) => {
                    const st = p.branchStocks?.[sourceBranchId] ?? p.stock;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} (SKU: {p.sku}) — Stock disponible: {st} pzas
                      </option>
                    );
                  })}
                </select>

                {/* Stock info badge */}
                {selectedProduct && (
                  <div className="mt-2 p-2.5 rounded-xl bg-purple-50/70 border border-purple-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      {selectedProduct.image && (
                        <img
                          src={selectedProduct.image}
                          alt={selectedProduct.name}
                          className="w-8 h-8 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="font-black text-slate-900">{selectedProduct.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">SKU: {selectedProduct.sku}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Disponible Origen</span>
                      <span
                        className={`font-black text-xs font-mono ${
                          availableSourceStock > 0 ? 'text-emerald-700' : 'text-rose-600'
                        }`}
                      >
                        {availableSourceStock} piezas
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Quantity */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Cantidad de Piezas a Despachar *
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min="1"
                    max={availableSourceStock}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-32 px-3 py-2 rounded-xl border border-slate-200 text-sm font-black font-mono focus:outline-none focus:border-purple-600"
                  />
                  <span className="text-xs text-slate-500">
                    {availableSourceStock > 0
                      ? `Máximo permitido: ${availableSourceStock} pzas`
                      : '⚠️ Sin stock en la sucursal origen'}
                  </span>
                </div>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Motivo del Traslado
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold focus:outline-none focus:border-purple-600 bg-white mb-2"
                >
                  <option value="Reabastecimiento de piso de venta">Reabastecimiento de piso de venta</option>
                  <option value="Pedido urgente de cliente / Salón">Pedido urgente de cliente / Salón</option>
                  <option value="Apoyo de inventario entre sucursales">Apoyo de inventario entre sucursales</option>
                  <option value="Rotación estratégica de existencias">Rotación estratégica de existencias</option>
                  <option value="Exhibición o demostración en tienda">Exhibición o demostración en tienda</option>
                  <option value="Otro">Otro motivo personalizado...</option>
                </select>

                {reason === 'Otro' && (
                  <input
                    type="text"
                    required
                    value={customReason}
                    onChange={(e) => setCustomReason(e.target.value)}
                    placeholder="Escribe el motivo del traslado..."
                    className="w-full px-3 py-2 rounded-xl border border-purple-300 text-xs focus:outline-none focus:border-purple-600"
                  />
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Observaciones / Instrucciones de Envío (Opcional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Enviar en camioneta matriz, verificar empaque cerrado..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-purple-600 resize-none"
                />
              </div>

              {/* Notice */}
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
                <Info className="w-4 h-4 text-purple-600 shrink-0 mt-0.5" />
                <p>
                  Al confirmar, las piezas se <strong>descontarán inmediatamente</strong> del inventario de la sucursal de origen. La sucursal de destino recibirá la notificación y el gerente receptor deberá <strong>aceptar la orden</strong> para incorporar las existencias a su tienda.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={availableSourceStock <= 0}
                  className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-black shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <ArrowLeftRight className="w-4 h-4" />
                  <span>Despachar y Generar Orden</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW ORDER / PRINT / PDF MODAL */}
      {viewingReceipt && (
        <TransferReceiptModal
          transfer={viewingReceipt}
          currentUser={currentUser}
          currentRole={currentRole}
          activeBranchId={activeBranchId}
          onClose={() => setViewingReceipt(null)}
          onAcceptTransfer={(id, receivedBy) => {
            onAcceptTransfer(id, receivedBy);
            setViewingReceipt((prev) =>
              prev
                ? {
                    ...prev,
                    status: 'Recibido',
                    receivedBy,
                    receivedDate: new Date().toISOString(),
                  }
                : null
            );
          }}
          onRejectTransfer={(id, rejectReason) => {
            onRejectTransfer(id, rejectReason);
            setViewingReceipt((prev) =>
              prev
                ? {
                    ...prev,
                    status: 'Rechazado',
                    rejectionReason: rejectReason,
                  }
                : null
            );
          }}
        />
      )}
    </div>
  );
};
