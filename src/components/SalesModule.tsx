import React, { useState } from 'react';
import { Sale, UserRole } from '../types';
import {
  ReceiptText,
  Search,
  Printer,
  RotateCcw,
  Calendar,
  DollarSign,
  CreditCard,
  Banknote,
  Send,
  AlertCircle,
  CheckCircle,
  FileSpreadsheet,
  X,
} from 'lucide-react';

interface SalesModuleProps {
  sales: Sale[];
  currentRole: UserRole;
  onReprintSale: (sale: Sale) => void;
  onCancelSale: (saleId: string, reason: string) => void;
}

export const SalesModule: React.FC<SalesModuleProps> = ({
  sales,
  currentRole,
  onReprintSale,
  onCancelSale,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todos' | 'Completada' | 'Cancelada'>('Todos');
  const [cancelModalSale, setCancelModalSale] = useState<Sale | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [showShiftCloseModal, setShowShiftCloseModal] = useState(false);

  const filtered = sales.filter((s) => {
    const matchStatus = statusFilter === 'Todos' || s.status === statusFilter;
    const matchSearch =
      s.folio.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.cashierName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchSearch;
  });

  // Calculate Metrics for Shift / Day
  const activeSales = sales.filter((s) => s.status === 'Completada');
  const totalRevenue = activeSales.reduce((acc, s) => acc + s.total, 0);
  const cashRevenue = activeSales
    .filter((s) => s.paymentMethod === 'Efectivo')
    .reduce((acc, s) => acc + s.total, 0);
  const cardRevenue = activeSales
    .filter((s) => s.paymentMethod === 'Tarjeta de Crédito / Débito')
    .reduce((acc, s) => acc + s.total, 0);
  const transferRevenue = activeSales
    .filter((s) => s.paymentMethod === 'Transferencia SPEI')
    .reduce((acc, s) => acc + s.total, 0);

  const averageTicket = activeSales.length > 0 ? totalRevenue / activeSales.length : 0;

  const handleConfirmCancel = () => {
    if (!cancelModalSale) return;
    if (!cancelReason.trim()) {
      alert('Por favor ingresa el motivo de la cancelación / reembolso.');
      return;
    }
    onCancelSale(cancelModalSale.id, cancelReason);
    setCancelModalSale(null);
    setCancelReason('');
  };

  return (
    <div id="sales-module" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#F4F5F7]">
      {/* Header with Shift Closing CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Historial de Ventas y Corte de Caja
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Auditoría de tickets, reembolsos, métodos de cobro y corte Z de turno.
          </p>
        </div>

        {/* Amarillo / Ámbar: Precaución para cierre de turno */}
        <button
          id="btn-shift-close"
          onClick={() => setShowShiftCloseModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-sm shadow-sm transition active:scale-95 cursor-pointer"
        >
          <Calendar className="w-4 h-4" />
          <span>Realizar Corte Z / Cierre</span>
        </button>
      </div>

      {/* Metrics Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Total Recaudado</span>
          <p className="text-2xl font-black text-[#16A34A] mt-1">
            ${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500">{activeSales.length} ventas completadas</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Efectivo en Caja</span>
          <p className="text-2xl font-black text-[#0F172A] mt-1">
            ${cashRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500">Disponible en gaveta</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Tarjeta y Bancos</span>
          <p className="text-2xl font-black text-blue-700 mt-1">
            ${(cardRevenue + transferRevenue).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500">Depósito en cuenta</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200/90 shadow-2xs">
          <span className="text-xs font-bold text-slate-400 uppercase">Ticket Promedio</span>
          <p className="text-2xl font-black text-purple-700 mt-1">
            ${averageTicket.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
          </p>
          <span className="text-[11px] text-slate-500">Por transacción</span>
        </div>
      </div>

      {/* Search & Status Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por folio (#PB-...), cliente o cajero..."
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:border-[#E6007E] bg-slate-50"
          />
        </div>

        <div className="flex items-center gap-1.5 text-xs font-semibold">
          {(['Todos', 'Completada', 'Cancelada'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                statusFilter === st
                  ? 'bg-[#E6007E] text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Sales Transactions List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Folio</th>
                <th className="py-3.5 px-3">Fecha y Hora</th>
                <th className="py-3.5 px-3">Cliente</th>
                <th className="py-3.5 px-3">Cajero / Rol</th>
                <th className="py-3.5 px-3">Forma de Pago</th>
                <th className="py-3.5 px-3 text-right">Total</th>
                <th className="py-3.5 px-3 text-center">Estado</th>
                <th className="py-3.5 px-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-slate-400">
                    No se encontraron transacciones con los filtros seleccionados
                  </td>
                </tr>
              ) : (
                filtered.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-[#0F172A]">
                      {s.folio}
                    </td>
                    <td className="py-3.5 px-3 text-slate-500 text-xs">
                      {new Date(s.date).toLocaleDateString('es-MX', {
                        day: '2-digit',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-800 truncate max-w-[180px]">
                      {s.customerName}
                    </td>
                    <td className="py-3.5 px-3 text-slate-600">
                      <span className="font-medium">{s.cashierName}</span>
                      <span className="text-[10px] text-slate-400 block">{s.cashierRole}</span>
                    </td>
                    <td className="py-3.5 px-3 text-slate-700 font-medium">
                      {s.paymentMethod}
                    </td>
                    <td className="py-3.5 px-3 text-right font-mono font-extrabold text-sm text-[#0F172A]">
                      ${s.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          s.status === 'Completada'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Azul (Informativo / Reimprimir ticket) */}
                        <button
                          onClick={() => onReprintSale(s)}
                          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition"
                          title="Reimprimir ticket de venta"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Ticket</span>
                        </button>

                        {/* Rojo (Destructivo / Cancelar orden / Reembolso) */}
                        {s.status === 'Completada' && (currentRole === 'Admin' || currentRole === 'Gerente') && (
                          <button
                            onClick={() => setCancelModalSale(s)}
                            className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            title="Cancelar / Reembolsar venta"
                          >
                            <RotateCcw className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CANCEL / REFUND SALE MODAL: ROJO DESTRUCTIVO */}
      {cancelModalSale && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-[#0F172A]">
                  Cancelar / Reembolsar Venta
                </h3>
                <p className="text-xs text-slate-500 font-mono">Folio: {cancelModalSale.folio}</p>
              </div>
            </div>

            <div className="bg-rose-50 p-3.5 rounded-xl border border-rose-200 text-xs text-rose-900 space-y-1">
              <p className="font-bold">Total a reembolsar: ${cancelModalSale.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</p>
              <p>Esta acción reintegrará el stock vendido al almacén de Palacio de Belleza.</p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Motivo de la Cancelación / Devolución *
              </label>
              <textarea
                rows={3}
                required
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="Ej. Devolución de producto por garantía, error en cobro..."
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-rose-500"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setCancelModalSale(null)}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold"
              >
                Regresar
              </button>
              <button
                onClick={handleConfirmCancel}
                className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs"
              >
                Confirmar Cancelación
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SHIFT CLOSE (CORTE Z) MODAL */}
      {showShiftCloseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold">Corte de Caja / Cierre de Turno</h3>
              </div>
              <button onClick={() => setShowShiftCloseModal(false)} className="p-1 text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs sm:text-sm text-slate-700">
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 space-y-2">
                <p className="font-bold text-amber-900 text-sm">Resumen del Turno Actual</p>
                <div className="space-y-1.5 text-xs text-amber-950">
                  <div className="flex justify-between">
                    <span>Efectivo contado en caja:</span>
                    <span className="font-bold font-mono">${cashRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tarjeta bancaria:</span>
                    <span className="font-bold font-mono">${cardRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Transferencias SPEI:</span>
                    <span className="font-bold font-mono">${transferRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-amber-300 font-extrabold text-sm">
                    <span>Gran Total Turno:</span>
                    <span className="text-[#E6007E] font-mono">${totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500">
                Al confirmar el corte Z, se generará el balance del turno para contabilidad y el supervisor en turno.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => setShowShiftCloseModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-semibold"
                >
                  Volver
                </button>
                <button
                  onClick={() => {
                    alert('Corte de caja Z completado con éxito. Balance guardado e impreso.');
                    setShowShiftCloseModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold shadow-sm"
                >
                  Imprimir Corte Z
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
