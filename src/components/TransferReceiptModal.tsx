import React, { useRef, useState } from 'react';
import { StockTransfer, UserRole, UserAccount } from '../types';
import {
  Printer,
  Check,
  X,
  ArrowRight,
  ArrowLeftRight,
  Download,
  CheckCircle2,
  Clock,
  AlertCircle,
  FileText,
  Building,
  User,
  Package,
} from 'lucide-react';
import { Logo } from './Logo';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface TransferReceiptModalProps {
  transfer: StockTransfer;
  currentUser?: UserAccount | null;
  currentRole: UserRole;
  activeBranchId?: string;
  onClose: () => void;
  onAcceptTransfer?: (transferId: string, receivedBy: string) => void;
  onRejectTransfer?: (transferId: string, reason: string) => void;
}

export const TransferReceiptModal: React.FC<TransferReceiptModalProps> = ({
  transfer,
  currentUser,
  currentRole,
  activeBranchId,
  onClose,
  onAcceptTransfer,
  onRejectTransfer,
}) => {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const printableAreaRef = useRef<HTMLDivElement>(null);

  const isPending = transfer.status === 'En tránsito';
  const isTargetBranch = activeBranchId === transfer.targetBranchId;
  const canAccept = isPending && (currentRole === 'Admin' || isTargetBranch || currentRole === 'Gerente');

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!printableAreaRef.current) return;
    setIsGeneratingPDF(true);

    try {
      const element = printableAreaRef.current;
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 190;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 10;

      pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 10, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`Orden_Traslado_${transfer.folio}.pdf`);
    } catch (err) {
      console.error('Error generando PDF:', err);
      // Fallback to print
      window.print();
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleAccept = () => {
    if (!onAcceptTransfer) return;
    const receiverName = currentUser?.name
      ? `${currentUser.name} (${currentUser.role})`
      : currentRole === 'Admin'
      ? 'Emilio (Admin)'
      : 'Gerente Receptor';

    onAcceptTransfer(transfer.id, receiverName);
  };

  const handleConfirmReject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      alert('Ingresa el motivo del rechazo.');
      return;
    }
    if (onRejectTransfer) {
      onRejectTransfer(transfer.id, rejectReason.trim());
    }
    setShowRejectForm(false);
  };

  return (
    <div
      id="transfer-receipt-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200"
    >
      <div
        id="printable-transfer-ticket"
        className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col my-auto max-h-[95vh]"
      >
        {/* Top Header - Screen Only */}
        <div className="print:hidden bg-[#0F172A] p-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-pink-500/20 text-[#E6007E] flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm sm:text-base font-black">Orden de Traslado Oficial</h3>
                <span className="font-mono text-xs text-pink-300 font-bold bg-white/10 px-2 py-0.5 rounded">
                  {transfer.folio}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Documento de remisión y control de inventario intersucursales
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Receipt Body */}
        <div className="overflow-y-auto p-4 sm:p-6 space-y-4">
          {/* Printable Document Area */}
          <div
            ref={printableAreaRef}
            className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 text-slate-800 space-y-4"
          >
            {/* Header Brand */}
            <div className="text-center pb-3 border-b border-slate-200">
              <div className="flex justify-center mb-1">
                <Logo size="sm" showSubtitle={false} />
              </div>
              <h2 className="font-black text-base text-[#0F172A] tracking-tight">
                PALACIO DE BELLEZA
              </h2>
              <p className="text-xs font-bold text-[#E6007E]">
                Mobiliario y Cosmética Profesional
              </p>
              <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-[#0F172A] font-bold text-xs font-mono">
                <span>ORDEN DE TRASLADO INTERSUCURSAL:</span>
                <span className="text-[#E6007E]">{transfer.folio}</span>
              </div>
            </div>

            {/* Stepper Status Banner */}
            <div className="p-3.5 rounded-2xl border text-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-slate-500 uppercase tracking-wider text-[10px]">
                  Estado del Traslado:
                </span>
                <span
                  className={`font-black text-xs px-2.5 py-0.5 rounded-full flex items-center gap-1 ${
                    transfer.status === 'Recibido'
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : transfer.status === 'Rechazado'
                      ? 'bg-rose-100 text-rose-800 border border-rose-300'
                      : 'bg-amber-100 text-amber-800 border border-amber-300'
                  }`}
                >
                  {transfer.status === 'Recibido' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {transfer.status === 'En tránsito' && <Clock className="w-3.5 h-3.5" />}
                  {transfer.status === 'Rechazado' && <AlertCircle className="w-3.5 h-3.5" />}
                  <span>{transfer.status}</span>
                </span>
              </div>

              {/* Progress Line */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-[11px]">
                <div>
                  <span className="text-slate-400 block text-[10px]">1. Envío (Origen):</span>
                  <span className="font-bold text-slate-800 block">{transfer.performedBy}</span>
                  <span className="text-slate-400 text-[10px]">
                    {new Date(transfer.date).toLocaleString('es-MX')}
                  </span>
                </div>
                <div className="border-l border-slate-200 pl-2">
                  <span className="text-slate-400 block text-[10px]">2. Recepción (Destino):</span>
                  <span className="font-bold text-slate-800 block">
                    {transfer.receivedBy || 'Pendiente de aceptar'}
                  </span>
                  <span className="text-slate-400 text-[10px]">
                    {transfer.receivedDate
                      ? new Date(transfer.receivedDate).toLocaleString('es-MX')
                      : 'En camino'}
                  </span>
                </div>
              </div>
            </div>

            {/* Route Box */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Ruta del Traslado
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-rose-700 block uppercase">Tienda Origen (Salida)</span>
                  <p className="font-extrabold text-slate-900">{transfer.sourceBranchName}</p>
                </div>
                <div className="bg-white p-2.5 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-emerald-700 block uppercase">Tienda Destino (Entrada)</span>
                  <p className="font-extrabold text-slate-900">{transfer.targetBranchName}</p>
                </div>
              </div>
            </div>

            {/* Product Item Details */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Mercancía en Traspaso
              </span>
              <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  {transfer.productImage && (
                    <img
                      src={transfer.productImage}
                      alt={transfer.productName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                    />
                  )}
                  <div>
                    <h4 className="font-black text-sm text-[#0F172A] leading-tight">
                      {transfer.productName}
                    </h4>
                    <span className="text-xs font-mono text-slate-500 font-bold block mt-0.5">
                      SKU: {transfer.productSku}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">Cantidad</span>
                  <span className="text-base font-black text-[#E6007E] font-mono">
                    {transfer.quantity} pzas
                  </span>
                </div>
              </div>
            </div>

            {/* Reason / Notes */}
            {transfer.reason && (
              <div className="text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-600 block mb-0.5">Motivo del Traslado:</span>
                <p className="text-slate-800">{transfer.reason}</p>
              </div>
            )}

            {transfer.notes && (
              <div className="text-xs bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                <span className="font-bold text-purple-900 block mb-0.5">Observaciones de Entrega:</span>
                <p className="text-purple-800">{transfer.notes}</p>
              </div>
            )}

            {transfer.rejectionReason && (
              <div className="text-xs bg-rose-50 p-3 rounded-xl border border-rose-200">
                <span className="font-bold text-rose-900 block mb-0.5">Motivo del Rechazo:</span>
                <p className="text-rose-800">{transfer.rejectionReason}</p>
              </div>
            )}

            {/* Signatures Area for PDF and Paper */}
            <div className="pt-6 grid grid-cols-2 gap-6 text-center text-xs">
              <div className="border-t border-slate-300 pt-2">
                <p className="font-black text-slate-800 text-[11px]">Entregó (Sucursal Origen)</p>
                <p className="text-[10px] text-slate-600 font-semibold">{transfer.performedBy}</p>
                <div className="h-8"></div>
                <p className="text-[9px] text-slate-400 border-t border-dashed border-slate-200 pt-1">
                  Firma de Despacho
                </p>
              </div>

              <div className="border-t border-slate-300 pt-2">
                <p className="font-black text-slate-800 text-[11px]">Recibió (Sucursal Destino)</p>
                <p className="text-[10px] text-slate-600 font-semibold">
                  {transfer.receivedBy || 'Pendiente de aceptación'}
                </p>
                <div className="h-8"></div>
                <p className="text-[9px] text-slate-400 border-t border-dashed border-slate-200 pt-1">
                  Firma de Conformidad
                </p>
              </div>
            </div>

            <div className="text-center text-[10px] text-slate-400 pt-2 border-t border-slate-100 font-mono">
              Sistema Multisucursal Oficial • Palacio de Belleza
            </div>
          </div>

          {/* Workflow Action Bar: ACEPTAR TRASLADO */}
          {canAccept && (
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-3 animate-in fade-in">
              <div className="flex items-center gap-2 text-amber-900">
                <Clock className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <h4 className="font-black text-xs sm:text-sm">
                    Mercancía en camino para {transfer.targetBranchName}
                  </h4>
                  <p className="text-[11px] text-amber-800 mt-0.5">
                    Como gerente o administrador de la sucursal receptora, verifica el producto físico y acepta el ingreso al almacén.
                  </p>
                </div>
              </div>

              {!showRejectForm ? (
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleAccept}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Aceptar y Recibir Traslado ({transfer.quantity} pzas)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowRejectForm(true)}
                    className="py-2.5 px-3 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs transition cursor-pointer"
                  >
                    Rechazar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleConfirmReject} className="space-y-2 pt-2 border-t border-amber-200">
                  <label className="block text-xs font-bold text-rose-900">
                    Motivo del rechazo o anomalía encontrada:
                  </label>
                  <input
                    type="text"
                    required
                    value={rejectReason}
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="Ej. Producto dañado en tránsito, faltante..."
                    className="w-full px-3 py-2 rounded-xl border border-rose-300 text-xs bg-white focus:outline-none focus:border-rose-600"
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowRejectForm(false)}
                      className="px-3 py-1.5 rounded-lg bg-slate-200 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold cursor-pointer"
                    >
                      Confirmar Rechazo
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bottom Actions - Screen Only */}
        <div className="print:hidden p-4 bg-slate-50 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 shrink-0">
          <button
            onClick={onClose}
            className="py-2.5 px-4 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-white transition cursor-pointer"
          >
            Cerrar
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="py-2.5 px-3.5 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-95 cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir</span>
            </button>

            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="py-2.5 px-4 bg-[#E6007E] hover:bg-[#D60072] text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-1.5 shadow-md transition active:scale-95 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isGeneratingPDF ? 'Generando PDF...' : 'Descargar en PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
