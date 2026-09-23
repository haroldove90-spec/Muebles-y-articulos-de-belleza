import React from 'react';
import { Sale, Branch } from '../types';
import { Printer, Calendar, X, Building2, Store } from 'lucide-react';
import { Logo } from './Logo';

interface ShiftCloseData {
  branchName: string;
  cashierName: string;
  date: string;
  totalSalesCount: number;
  totalRevenue: number;
  cashRevenue: number;
  cardRevenue: number;
  transferRevenue: number;
  averageTicket: number;
  firstFolio?: string;
  lastFolio?: string;
}

interface ShiftCloseReceiptModalProps {
  data: ShiftCloseData;
  onClose: () => void;
}

export const ShiftCloseReceiptModal: React.FC<ShiftCloseReceiptModalProps> = ({
  data,
  onClose,
}) => {
  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      id="shift-close-receipt-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto"
    >
      <div
        id="printable-shift-ticket"
        className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto"
      >
        {/* Top Header - Screen Only */}
        <div className="print:hidden bg-[#0F172A] p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center">
              <Calendar className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-sm font-bold">Corte de Caja Z (Reporte Oficial)</h3>
              <p className="text-xs text-slate-300">{data.branchName}</p>
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
            <p className="text-[11px] font-extrabold text-amber-900 bg-amber-100/70 py-1 px-2 rounded-md inline-block font-sans mt-1">
              *** CORTE DE CAJA / REPORTE Z ***
            </p>
          </div>

          {/* Shift Details */}
          <div className="space-y-1.5 text-[11px] border-b border-slate-200 pb-3">
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Sucursal:</span>
              <span className="font-bold text-[#0F172A]">{data.branchName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Responsable / Turno:</span>
              <span className="font-bold text-slate-800">{data.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-slate-600">Fecha de corte:</span>
              <span>{new Date(data.date).toLocaleString('es-MX')}</span>
            </div>
            {data.firstFolio && data.lastFolio && (
              <div className="flex justify-between">
                <span className="font-semibold text-slate-600">Folios incluidos:</span>
                <span className="font-mono text-slate-700">{data.firstFolio} a {data.lastFolio}</span>
              </div>
            )}
          </div>

          {/* Revenue Breakdown */}
          <div className="bg-white p-3.5 rounded-xl border border-slate-200 space-y-2">
            <p className="font-bold text-[10px] uppercase text-slate-500 tracking-wider">
              Desglose de Formas de Pago
            </p>
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">1. Efectivo en Caja:</span>
                <span className="font-bold font-mono text-slate-900">
                  ${data.cashRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">2. Tarjetas Bancarias:</span>
                <span className="font-bold font-mono text-slate-900">
                  ${data.cardRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600 font-semibold">3. Transferencias SPEI:</span>
                <span className="font-bold font-mono text-slate-900">
                  ${data.transferRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t-2 border-slate-300 text-sm font-black">
                <span className="text-slate-900">TOTAL INGRESOS:</span>
                <span className="text-[#E6007E] font-mono">
                  ${data.totalRevenue.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* Operational Metrics */}
          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold block">Total Transacciones</span>
              <span className="text-base font-black text-slate-900 font-mono">{data.totalSalesCount}</span>
            </div>
            <div className="bg-slate-100 p-2.5 rounded-lg border border-slate-200">
              <span className="text-[10px] text-slate-500 font-semibold block">Ticket Promedio</span>
              <span className="text-base font-black text-slate-900 font-mono">
                ${data.averageTicket.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
              </span>
            </div>
          </div>

          {/* Signatures Area for Physical Print */}
          <div className="pt-6 grid grid-cols-2 gap-4 text-center text-[9px] text-slate-500 font-sans">
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-700">Firma Cajero</p>
              <p className="text-[8px] text-slate-400">Entregó turno</p>
            </div>
            <div className="border-t border-slate-400 pt-1">
              <p className="font-bold text-slate-700">Firma Gerencia</p>
              <p className="text-[8px] text-slate-400">Auditó y validó</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-200 font-sans">
            Corte Z Generado por Sistema POS • Palacio de Belleza
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
            className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition active:scale-95 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Ticket Z</span>
          </button>
        </div>
      </div>
    </div>
  );
};
