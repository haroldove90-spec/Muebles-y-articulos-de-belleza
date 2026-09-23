import React from 'react';
import { StockTransfer } from '../types';
import { Printer, Check, X, ArrowRight, ArrowLeftRight } from 'lucide-react';
import { Logo } from './Logo';

interface TransferReceiptModalProps {
  transfer: StockTransfer;
  onClose: () => void;
}

export const TransferReceiptModal: React.FC<TransferReceiptModalProps> = ({
  transfer,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="transfer-receipt-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="printable-transfer-ticket"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
      >
        {/* Top Header - Screen Only */}
        <div className="print:hidden bg-[#0F172A] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-pink-500/20 text-[#E6007E] flex items-center justify-center">
              <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Comprobante de Traspaso</h3>
              <p className="text-xs text-slate-300 font-mono">Folio: {transfer.folio}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Paper Area */}
        <div className="p-6 text-slate-800 text-xs font-mono space-y-4 bg-[#FAFAFA] border-b border-dashed border-slate-300">
          {/* Brand Heading */}
          <div className="text-center space-y-1 pb-3 border-b border-slate-300">
            <div className="flex justify-center mb-1">
              <Logo size="sm" showSubtitle={false} />
            </div>
            <p className="font-bold text-sm text-[#0F172A] font-sans tracking-wide">
              PALACIO DE BELLEZA
            </p>
            <p className="text-[11px] text-[#E6007E] font-sans italic font-medium">
              Muebles y artículos de belleza
            </p>
            <p className="text-[10px] text-slate-500 font-sans">
              VALE OFICIAL DE TRASPASO DE INVENTARIO
            </p>
          </div>

          {/* Transfer Metadata */}
          <div className="space-y-1.5 text-[11px] border-b border-slate-200 pb-3">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Folio:</span>
              <span className="font-bold text-[#0F172A] font-mono">{transfer.folio}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Fecha y hora:</span>
              <span>{new Date(transfer.date).toLocaleString('es-MX')}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Autorizado por:</span>
              <span className="font-bold text-slate-800">{transfer.performedBy}</span>
            </div>
          </div>

          {/* Route: Origin -> Destination */}
          <div className="bg-slate-100 p-3 rounded-xl border border-slate-200 space-y-2">
            <div className="flex items-center gap-1.5 text-[10px] uppercase font-bold text-slate-500 tracking-wider">
              <span>Ruta del Movimiento</span>
            </div>
            <div className="space-y-1 text-[11px]">
              <div className="flex items-start justify-between">
                <span className="text-slate-500 font-semibold">Origen:</span>
                <span className="font-bold text-rose-800 text-right">{transfer.sourceBranchName}</span>
              </div>
              <div className="flex items-center justify-center my-0.5 text-slate-400">
                <ArrowRight className="w-3.5 h-3.5 text-[#E6007E]" />
              </div>
              <div className="flex items-start justify-between">
                <span className="text-slate-500 font-semibold">Destino:</span>
                <span className="font-bold text-emerald-800 text-right">{transfer.targetBranchName}</span>
              </div>
            </div>
          </div>

          {/* Product Items Details */}
          <div>
            <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider pb-1 mb-2 border-b border-slate-200">
              Mercancía Transferida
            </div>
            <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1.5">
              <p className="font-bold text-slate-900 text-xs leading-tight font-sans">
                {transfer.productName}
              </p>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>SKU: <strong className="font-mono">{transfer.productSku}</strong></span>
                <span>Cantidad: <strong className="font-bold text-[#E6007E] text-xs font-mono">{transfer.quantity} pzas</strong></span>
              </div>
            </div>
          </div>

          {/* Reason / Notes */}
          {transfer.reason && (
            <div className="text-[11px] bg-amber-50/70 p-2.5 rounded-lg border border-amber-200/70">
              <span className="font-bold text-amber-900 block mb-0.5">Motivo / Observaciones:</span>
              <p className="text-amber-950 font-sans italic">{transfer.reason}</p>
            </div>
          )}

          {/* Signatures Area for Physical Print */}
          <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[9px] text-slate-500 font-sans">
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-700">Entrega (Origen)</p>
              <p className="text-[8px] text-slate-400">Nombre y Firma</p>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-700">Recibe (Destino)</p>
              <p className="text-[8px] text-slate-400">Nombre y Firma</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 font-sans">
            Sistema Multi-Sucursal • Palacio de Belleza
          </div>
        </div>

        {/* Bottom Actions - Screen Only */}
        <div className="print:hidden p-4 bg-white flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-3 border border-slate-200 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 transition cursor-pointer"
          >
            Cerrar
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 py-2 px-3 bg-[#0F172A] hover:bg-slate-800 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Vale</span>
          </button>
        </div>
      </div>
    </div>
  );
};
