import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  X,
  CheckCircle2,
  RefreshCw,
  Package,
  Users,
  Building2,
  Receipt,
  Database,
  RotateCcw,
} from 'lucide-react';
import { SupabaseService } from '../lib/supabase';
import { Product, Customer, Supplier, Sale } from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_CUSTOMERS,
  INITIAL_SUPPLIERS,
  INITIAL_SALES,
} from '../data/initialData';

interface GlobalClearModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  customers: Customer[];
  suppliers: Supplier[];
  sales: Sale[];
  onClearAll: () => Promise<void> | void;
  onRestoreDefaults: (data: {
    products: Product[];
    customers: Customer[];
    suppliers: Supplier[];
    sales: Sale[];
  }) => Promise<void> | void;
}

export const GlobalClearModal: React.FC<GlobalClearModalProps> = ({
  isOpen,
  onClose,
  products,
  customers,
  suppliers,
  sales,
  onClearAll,
  onRestoreDefaults,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);
  const [confirmChecked, setConfirmChecked] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  if (!isOpen) return null;

  const totalRecords = products.length + customers.length + suppliers.length + sales.length;

  const handleExecuteClear = async () => {
    if (!confirmChecked && totalRecords > 0) {
      alert('Por favor marca la casilla de confirmación para autorizar el borrado.');
      return;
    }

    setIsDeleting(true);
    setStatusMessage(null);

    try {
      // 1. Borrar en Supabase
      const res = await SupabaseService.clearAllData();

      // 2. Borrar en la aplicación y LocalStorage
      await onClearAll();

      setStatusMessage({
        type: 'success',
        text: `Se borraron exitosamente ${totalRecords} registros de prueba del sistema y de Supabase. El sistema está ahora listo para datos reales.`,
      });
      setConfirmChecked(false);
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Ocurrió un error al procesar el borrado.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExecuteRestore = async () => {
    const ok = window.confirm(
      '¿Deseas restaurar el catálogo y registros de demostración iniciales de Palacio de Belleza?'
    );
    if (!ok) return;

    setIsRestoring(true);
    setStatusMessage(null);

    try {
      await onRestoreDefaults({
        products: INITIAL_PRODUCTS,
        customers: INITIAL_CUSTOMERS,
        suppliers: INITIAL_SUPPLIERS,
        sales: INITIAL_SALES,
      });

      setStatusMessage({
        type: 'success',
        text: 'Se restablecieron exitosamente los registros de prueba iniciales.',
      });
    } catch (err: any) {
      setStatusMessage({
        type: 'error',
        text: err?.message || 'Error al restaurar datos iniciales.',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  return (
    <div
      id="global-clear-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto"
    >
      <div
        id="global-clear-modal-content"
        className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto"
      >
        {/* Header */}
        <div className="bg-[#0F172A] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-red-600/90 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="text-base font-bold tracking-tight">Borrado Global de Registros</h3>
              <p className="text-xs text-slate-400">Limpieza de pruebas y preparación para producción</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg transition"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body Content */}
        <div className="p-5 sm:p-6 space-y-5 text-sm">
          {/* Status Alert if any */}
          {statusMessage && (
            <div
              className={`p-3.5 rounded-xl border flex items-start gap-2.5 text-xs sm:text-sm ${
                statusMessage.type === 'success'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                  : 'bg-red-50 border-red-200 text-red-900'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              )}
              <div className="flex-1 font-medium">{statusMessage.text}</div>
            </div>
          )}

          {/* Breakdown of Current System Data */}
          <div>
            <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2.5">
              Registros actuales en el sistema
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <Package className="w-4 h-4 text-[#E6007E] mx-auto mb-1" />
                <div className="text-lg font-black text-slate-800">{products.length}</div>
                <div className="text-[11px] text-slate-500">Productos</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <Users className="w-4 h-4 text-purple-600 mx-auto mb-1" />
                <div className="text-lg font-black text-slate-800">{customers.length}</div>
                <div className="text-[11px] text-slate-500">Clientes</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <Building2 className="w-4 h-4 text-blue-600 mx-auto mb-1" />
                <div className="text-lg font-black text-slate-800">{suppliers.length}</div>
                <div className="text-[11px] text-slate-500">Proveedores</div>
              </div>

              <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 text-center">
                <Receipt className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
                <div className="text-lg font-black text-slate-800">{sales.length}</div>
                <div className="text-[11px] text-slate-500">Ventas (POS)</div>
              </div>
            </div>
          </div>

          {/* Warning Banner */}
          <div className="bg-amber-50 border border-amber-200/90 rounded-xl p-3.5 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold">¿Qué sucederá al confirmar el borrado global?</span>
              <p className="mt-1">
                Se limpiarán las tablas tanto localmente en tu navegador como en la base de datos de 
                <span className="font-semibold text-slate-900"> Supabase</span> (productos, clientes, proveedores y ventas/tickets realizados durante las pruebas). Esto dejará el sistema en blanco y preparado para el inventario real.
              </p>
            </div>
          </div>

          {/* Confirmation Checkbox */}
          <label className="flex items-start gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-slate-50 cursor-pointer transition select-none">
            <input
              type="checkbox"
              checked={confirmChecked}
              onChange={(e) => setConfirmChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-300 text-red-600 focus:ring-red-500 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-800 leading-tight">
              Entiendo y confirmo que deseo vaciar todos los registros de prueba del sistema y Supabase.
            </span>
          </label>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-2 border-t border-slate-100">
            <button
              id="confirm-global-clear-btn"
              onClick={handleExecuteClear}
              disabled={isDeleting || isRestoring || (!confirmChecked && totalRecords > 0)}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-sm shadow-sm transition active:scale-98 cursor-pointer"
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Eliminando registros de prueba...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Proceder con el Borrado Global</span>
                </>
              )}
            </button>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleExecuteRestore}
                disabled={isDeleting || isRestoring}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 hover:text-slate-900 text-xs font-semibold transition active:scale-98 cursor-pointer"
                title="Vuelve a cargar los productos, clientes y ventas de demostración"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restaurar datos demo</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
