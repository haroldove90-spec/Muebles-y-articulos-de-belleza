import React, { useState } from 'react';
import { Branch, Product, Sale, UserRole, StockTransfer, UserAccount, ActiveModule } from '../types';
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
  KeyRound,
  Share2,
  Copy,
  Check,
  RefreshCw,
  Send,
  Eye,
  EyeOff,
  Compass,
} from 'lucide-react';
import { TransferReceiptModal } from './TransferReceiptModal';

const SYSTEM_ACCESS_LINK = 'https://muebles-y-articulos-de-belleza.vercel.app/';

const generateSecurePassword = (prefix: string = 'Pb'): string => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*';
  let pass = prefix;
  for (let i = 0; i < 4; i++) pass += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 2; i++) pass += numbers[Math.floor(Math.random() * numbers.length)];
  pass += symbols[Math.floor(Math.random() * symbols.length)];
  return pass;
};

interface BranchesModuleProps {
  branches: Branch[];
  activeBranchId: string;
  userAccounts?: UserAccount[];
  products?: Product[];
  sales?: Sale[];
  transfers?: StockTransfer[];
  currentRole: UserRole;
  onSelectActiveBranch?: (branchId: string) => void;
  onSelectBranch?: (branchId: string) => void;
  onAddBranch: (branch: Branch, initialUsers?: UserAccount[]) => void;
  onUpdateBranch: (branch: Branch) => void;
  onDeleteBranch: (branchId: string) => void;
  onToggleBlockBranch?: (branchId: string) => void;
  onPerformTransfer?: (transfer: StockTransfer) => void;
  onAddUserAccount?: (account: UserAccount) => void;
  onUpdateUserAccount?: (account: UserAccount) => void;
  onDeleteUserAccount?: (accountId: string) => void;
  onNavigateToModule?: (module: ActiveModule) => void;
}

export const BranchesModule: React.FC<BranchesModuleProps> = ({
  branches,
  activeBranchId,
  userAccounts = [],
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
  onAddUserAccount,
  onUpdateUserAccount,
  onDeleteUserAccount,
  onNavigateToModule,
}) => {
  const [activeTab, setActiveTab] = useState<'branches' | 'credentials' | 'transfers'>('branches');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'Todas' | 'Activas' | 'Bloqueadas'>('Todas');
  const [showModal, setShowModal] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Success Notification / Share Modal after creating a branch
  const [createdBranchInfo, setCreatedBranchInfo] = useState<{
    branch: Branch;
    gerente: UserAccount;
    vendedor: UserAccount;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // New Branch Form State (Including Automatic Independent Roles: Gerente & Pos Ventas)
  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    address: string;
    phone: string;
    isMain: boolean;
    isActive: boolean;
    // Gerente
    gerenteName: string;
    gerenteUsername: string;
    gerentePassword: string;
    gerentePhone: string;
    // Vendedor
    vendedorName: string;
    vendedorUsername: string;
    vendedorPassword: string;
    vendedorPhone: string;
  }>({
    name: '',
    code: '',
    address: '',
    phone: '',
    isMain: false,
    isActive: true,
    gerenteName: '',
    gerenteUsername: '',
    gerentePassword: '',
    gerentePhone: '',
    vendedorName: '',
    vendedorUsername: '',
    vendedorPassword: '',
    vendedorPhone: '',
  });

  // Transfer State
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferSourceId, setTransferSourceId] = useState<string>(branches[0]?.id || '');
  const [transferTargetId, setTransferTargetId] = useState<string>(branches[1]?.id || branches[0]?.id || '');
  const [transferProductId, setTransferProductId] = useState<string>(products[0]?.id || '');
  const [transferQuantity, setTransferQuantity] = useState<number>(1);
  const [transferReason, setTransferReason] = useState<string>('Reabastecimiento de piso de venta');
  const [transferPerformedBy, setTransferPerformedBy] = useState<string>(currentRole);
  const [viewingTransferReceipt, setViewingTransferReceipt] = useState<StockTransfer | null>(null);

  // Add extra seller modal state
  const [showAddSellerModal, setShowAddSellerModal] = useState(false);
  const [extraSellerBranchId, setExtraSellerBranchId] = useState<string>(branches[0]?.id || '');
  const [extraSellerName, setExtraSellerName] = useState('');
  const [extraSellerUsername, setExtraSellerUsername] = useState('');
  const [extraSellerPassword, setExtraSellerPassword] = useState('');
  const [extraSellerPhone, setExtraSellerPhone] = useState('');

  const handleSelectBranch = (id: string) => {
    if (onSelectActiveBranch) onSelectActiveBranch(id);
    else if (onSelectBranch) onSelectBranch(id);
  };

  const handleOpenCreate = () => {
    setEditingBranch(null);
    const nextNum = branches.length + 1;
    const code = `SUC-0${nextNum}`;
    const cleanCode = `suc${nextNum}`;

    setFormData({
      name: `Sucursal ${nextNum}`,
      code: code,
      address: '',
      phone: '',
      isMain: branches.length === 0,
      isActive: true,
      // Automatic Gerente defaults
      gerenteName: `Gerente ${nextNum}`,
      gerenteUsername: `gerente_${cleanCode}`,
      gerentePassword: generateSecurePassword('Ger'),
      gerentePhone: '',
      // Automatic Vendedor defaults
      vendedorName: `Vendedor 1 - Suc ${nextNum}`,
      vendedorUsername: `ventas_${cleanCode}`,
      vendedorPassword: generateSecurePassword('Ven'),
      vendedorPhone: '',
    });
    setShowModal(true);
  };

  const handleOpenEdit = (b: Branch) => {
    setEditingBranch(b);
    setFormData({
      name: b.name,
      code: b.code,
      address: b.address,
      phone: b.phone,
      isMain: b.isMain,
      isActive: b.isActive,
      gerenteName: b.managerName || '',
      gerenteUsername: '',
      gerentePassword: '',
      gerentePhone: '',
      vendedorName: '',
      vendedorUsername: '',
      vendedorPassword: '',
      vendedorPhone: '',
    });
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
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        address: formData.address?.trim() || '',
        phone: formData.phone?.trim() || '',
        managerName: formData.gerenteName?.trim() || editingBranch.managerName,
        isMain: formData.isMain ?? editingBranch.isMain,
        isActive: formData.isActive ?? true,
      });
      setShowModal(false);
    } else {
      const branchId = `branch-${Date.now()}`;
      const newBranch: Branch = {
        id: branchId,
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        address: formData.address?.trim() || '',
        phone: formData.phone?.trim() || '',
        managerName: formData.gerenteName?.trim() || undefined,
        isMain: formData.isMain ?? false,
        isActive: formData.isActive ?? true,
        createdAt: new Date().toISOString(),
      };

      // Automatically create the independent Gerente account
      const gerenteAccount: UserAccount = {
        id: `user-gerente-${Date.now()}`,
        name: formData.gerenteName.trim() || `Gerente ${newBranch.name}`,
        username: formData.gerenteUsername.trim().toLowerCase() || `gerente_${newBranch.code.toLowerCase()}`,
        password: formData.gerentePassword.trim() || generateSecurePassword('Ger'),
        role: 'Gerente',
        branchId: branchId,
        branchName: newBranch.name,
        email: `${formData.gerenteUsername.trim().toLowerCase() || 'gerente'}@palaciodebelleza.mx`,
        phone: formData.gerentePhone.trim() || formData.phone.trim(),
        position: `Gerente de ${newBranch.name}`,
        bio: `Administrador de piso, existencias y ventas para ${newBranch.name}.`,
        photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=350',
        createdAt: new Date().toISOString(),
      };

      // Automatically create the independent Pos: ventas account
      const vendedorAccount: UserAccount = {
        id: `user-vendedor-${Date.now() + 1}`,
        name: formData.vendedorName.trim() || `Vendedor ${newBranch.name}`,
        username: formData.vendedorUsername.trim().toLowerCase() || `ventas_${newBranch.code.toLowerCase()}`,
        password: formData.vendedorPassword.trim() || generateSecurePassword('Ven'),
        role: 'Pos: ventas',
        branchId: branchId,
        branchName: newBranch.name,
        email: `${formData.vendedorUsername.trim().toLowerCase() || 'ventas'}@palaciodebelleza.mx`,
        phone: formData.vendedorPhone.trim() || formData.phone.trim(),
        position: `Cajero & Vendedor POS - ${newBranch.name}`,
        bio: `Atención a mostrador, emisión de tickets y cobro táctil en ${newBranch.name}.`,
        photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=350',
        createdAt: new Date().toISOString(),
      };

      onAddBranch(newBranch, [gerenteAccount, vendedorAccount]);

      setShowModal(false);
      setCreatedBranchInfo({
        branch: newBranch,
        gerente: gerenteAccount,
        vendedor: vendedorAccount,
      });
    }
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

  // WhatsApp Share Generator
  const shareCredentialsViaWhatsApp = (acc: UserAccount, branch: Branch) => {
    const text = `👋 *¡Hola ${acc.name}! Te damos la bienvenida a Palacio de Belleza.*%0A%0A` +
      `Has sido dado de alta en el sistema para la *${branch.name}* (${branch.code}).%0A%0A` +
      `*Tus Credenciales Oficiales de Acceso:*%0A` +
      `🏪 *Sucursal:* ${branch.name}%0A` +
      `👤 *Rol de Acceso:* ${acc.role}%0A` +
      `🔑 *Usuario:* \`${acc.username}\`%0A` +
      `🔒 *Contraseña:* \`${acc.password}\`%0A%0A` +
      `🌐 *Link directo para entrar al sistema:*%0A` +
      `${SYSTEM_ACCESS_LINK}%0A%0A` +
      `_Por favor inicia sesión y cambia tu contraseña en tu perfil si lo deseas. ¡Mucho éxito en tus ventas!_`;

    const cleanPhone = acc.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone ? `https://wa.me/${cleanPhone}?text=${text}` : `https://api.whatsapp.com/send?text=${text}`;
    window.open(url, '_blank');
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Handle Add Extra Seller
  const handleConfirmAddSeller = (e: React.FormEvent) => {
    e.preventDefault();
    if (!extraSellerName.trim() || !extraSellerUsername.trim() || !extraSellerPassword.trim()) {
      alert('Completa los campos obligatorios del vendedor.');
      return;
    }
    const targetBranch = branches.find((b) => b.id === extraSellerBranchId);
    const newSeller: UserAccount = {
      id: `user-seller-${Date.now()}`,
      name: extraSellerName.trim(),
      username: extraSellerUsername.trim().toLowerCase(),
      password: extraSellerPassword.trim(),
      role: 'Pos: ventas',
      branchId: extraSellerBranchId,
      branchName: targetBranch?.name || 'Sucursal',
      email: `${extraSellerUsername.trim().toLowerCase()}@palaciodebelleza.mx`,
      phone: extraSellerPhone.trim(),
      position: `Vendedor de Mostrador - ${targetBranch?.name || ''}`,
      bio: 'Atención a mostrador y cobros en punto de venta.',
      photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=350',
      createdAt: new Date().toISOString(),
    };

    if (onAddUserAccount) {
      onAddUserAccount(newSeller);
    }
    setShowAddSellerModal(false);
    setExtraSellerName('');
    setExtraSellerUsername('');
    setExtraSellerPassword('');
    setExtraSellerPhone('');
    alert(`Vendedor "${newSeller.name}" agregado con éxito para ${targetBranch?.name}.`);
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
      alert(`Stock insuficiente en origen. La sucursal solo cuenta con ${currentSourceStock} piezas disponibles.`);
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

  const getBranchStats = (branchId: string) => {
    const branchStockCount = products.reduce((acc, p) => {
      const count = p.branchStocks?.[branchId] ?? 0;
      return acc + count;
    }, 0);

    const branchSales = sales.filter((s) => s.branchId === branchId);
    const branchSalesTotal = branchSales.reduce((acc, s) => acc + s.total, 0);
    const branchEmployees = userAccounts.filter((u) => u.branchId === branchId);

    return {
      stock: branchStockCount,
      salesCount: branchSales.length,
      salesTotal: branchSalesTotal,
      employeesCount: branchEmployees.length,
    };
  };

  const activeBranch = branches.find((b) => b.id === activeBranchId) || branches[0];

  return (
    <div id="branches-module" className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 bg-[#F4F5F7]">
      {/* Header & New Branch / Transfer CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2">
              <Store className="w-6 h-6 text-[#E6007E]" />
              <span>Gestión Multisucursales</span>
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-pink-100 text-[#E6007E] border border-pink-200">
              {branches.length} {branches.length === 1 ? 'Sucursal' : 'Sucursales'}
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Administra tus tiendas, crea roles automáticos para nuevos gerentes y vendedores, comparte accesos y visita sucursales.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          {branches.length >= 2 && (
            <button
              id="btn-new-transfer"
              onClick={() => handleOpenTransferModal()}
              className="flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs sm:text-sm shadow-sm transition active:scale-95 cursor-pointer"
            >
              <ArrowLeftRight className="w-4 h-4 stroke-[2.5]" />
              <span>Nuevo Traspaso</span>
            </button>
          )}

          {currentRole === 'Admin' && (
            <button
              id="btn-new-branch"
              onClick={handleOpenCreate}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#E6007E] hover:bg-[#D60072] text-white font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span>Agregar Sucursal</span>
            </button>
          )}
        </div>
      </div>

      {/* Active Branch Notice Banner */}
      {activeBranch && (
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 text-white p-4 rounded-2xl shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-pink-600/40 border border-pink-400/40 flex items-center justify-center text-white shrink-0">
              <Compass className="w-5 h-5 text-pink-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-pink-300">
                  Sucursal Actualmente Activa en tu Sesión:
                </span>
                <span className="text-[10px] font-mono px-2 py-0.2 rounded bg-white/20 text-white">
                  {activeBranch.code}
                </span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-white">{activeBranch.name}</h3>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto text-xs">
            {onNavigateToModule && (
              <>
                <button
                  type="button"
                  onClick={() => onNavigateToModule('pos')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <ShoppingBag className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Abrir POS</span>
                </button>
                <button
                  type="button"
                  onClick={() => onNavigateToModule('products')}
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Package className="w-3.5 h-3.5 text-pink-400" />
                  <span>Inventario</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab('branches')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'branches'
              ? 'bg-[#0F172A] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Ver Sucursales ({branches.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('credentials')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'credentials'
              ? 'bg-[#E6007E] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <KeyRound className="w-4 h-4" />
          <span>Credenciales & Roles ({userAccounts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('transfers')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer whitespace-nowrap ${
            activeTab === 'transfers'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <ArrowLeftRight className="w-4 h-4" />
          <span>Traspasos de Inventario ({transfers.length})</span>
        </button>
      </div>

      {/* TAB 1: SUCURSALES (Ver, Visitar, Gestionar) */}
      {activeTab === 'branches' && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Sucursales</p>
                <p className="text-2xl font-black text-[#0F172A] mt-1">{branches.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-pink-50 flex items-center justify-center text-[#E6007E]">
                <Store className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Sucursales Operativas</p>
                <p className="text-2xl font-black text-emerald-600 mt-1">
                  {branches.filter((b) => b.isActive).length}
                </p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Personal Registrado</p>
                <p className="text-2xl font-black text-purple-700 mt-1">{userAccounts.length}</p>
              </div>
              <div className="w-11 h-11 rounded-xl bg-purple-50 flex items-center justify-center text-purple-600">
                <User className="w-6 h-6" />
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
              const branchStaff = userAccounts.filter((u) => u.branchId === branch.id);

              return (
                <div
                  key={branch.id}
                  className={`bg-white rounded-2xl border transition-all duration-200 shadow-2xs overflow-hidden flex flex-col justify-between ${
                    isCurrentActive
                      ? 'border-[#E6007E] ring-2 ring-pink-100 shadow-md'
                      : 'border-slate-200 hover:border-slate-300'
                  } ${!branch.isActive ? 'bg-slate-50/80 opacity-90' : ''}`}
                >
                  {/* Card Top */}
                  <div className="p-4 sm:p-5 border-b border-slate-100">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {branch.code}
                        </span>
                        {branch.isMain && (
                          <span className="flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-pink-100 text-[#E6007E] border border-pink-200">
                            <ShieldCheck className="w-3 h-3" />
                            <span>Matriz</span>
                          </span>
                        )}
                        {isCurrentActive && (
                          <span className="flex items-center gap-1 text-[11px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 animate-pulse">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Activa Ahora</span>
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

                    {/* Contact & Manager */}
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
                        <div className="flex items-center gap-2 text-slate-600 font-semibold">
                          <User className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="truncate">Gerente: {branch.managerName}</span>
                        </div>
                      )}
                    </div>

                    {/* Employees quick pill */}
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>Personal ({branchStaff.length}):</span>
                      <div className="flex items-center gap-1 font-semibold text-slate-700">
                        {branchStaff.slice(0, 2).map((s) => (
                          <span key={s.id} className="px-1.5 py-0.5 rounded bg-slate-100">
                            {s.name.split(' ')[0]} ({s.role === 'Gerente' ? 'Ger.' : 'Ven.'})
                          </span>
                        ))}
                        {branchStaff.length > 2 && (
                          <span className="px-1 py-0.5 rounded bg-slate-100 font-bold">
                            +{branchStaff.length - 2}
                          </span>
                        )}
                      </div>
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

                  {/* Actions Footer: Visitar Sucursal + Admin Tools */}
                  <div className="p-3 sm:p-4 bg-white flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectBranch(branch.id)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition active:scale-95 cursor-pointer ${
                        isCurrentActive
                          ? 'bg-pink-50 text-[#E6007E] border border-pink-200'
                          : 'bg-[#0F172A] hover:bg-slate-800 text-white shadow-2xs'
                      }`}
                    >
                      <Compass className="w-3.5 h-3.5" />
                      <span>{isCurrentActive ? 'Estás en esta Sucursal' : 'Visitar Sucursal'}</span>
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

                        {/* Delete */}
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

      {/* TAB 2: CREDENCIALES & ROLES INDEPENDIENTES (Gerente y Pos Ventas) */}
      {activeTab === 'credentials' && (
        <div className="space-y-6">
          <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-black text-[#0F172A] text-base sm:text-lg flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#E6007E]" />
                <span>Credenciales de Empleados por Sucursal</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Comparte el link del sistema y credenciales por WhatsApp a cada nuevo gerente y vendedor.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setExtraSellerBranchId(branches[0]?.id || '');
                  setExtraSellerPassword(generateSecurePassword('Ven'));
                  setShowAddSellerModal(true);
                }}
                className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Agregar Vendedor a Sucursal</span>
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(SYSTEM_ACCESS_LINK, 'system-link')}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="Copiar enlace oficial de acceso"
              >
                {copiedKey === 'system-link' ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copiedKey === 'system-link' ? '¡Link Copiado!' : 'Copiar Link del Sistema'}</span>
              </button>
            </div>
          </div>

          {/* Grouped by Branch */}
          <div className="space-y-6">
            {branches.map((b) => {
              const staff = userAccounts.filter((u) => u.branchId === b.id);

              return (
                <div key={b.id} className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <Store className="w-4 h-4 text-[#E6007E]" />
                      <h4 className="font-extrabold text-[#0F172A] text-sm sm:text-base">
                        {b.name} <span className="font-mono text-xs text-slate-500 font-normal">({b.code})</span>
                      </h4>
                      {b.isMain && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-pink-100 text-[#E6007E]">
                          Matriz
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-500 font-semibold">
                      {staff.length} {staff.length === 1 ? 'Empleado con acceso' : 'Empleados con acceso'}
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100">
                    {staff.length === 0 ? (
                      <div className="p-6 text-center text-xs text-slate-400">
                        No hay credenciales registradas aún para esta sucursal.
                      </div>
                    ) : (
                      staff.map((employee) => (
                        <div
                          key={employee.id}
                          className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition"
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${
                                employee.role === 'Admin'
                                  ? 'bg-pink-100 text-[#E6007E]'
                                  : employee.role === 'Gerente'
                                  ? 'bg-purple-100 text-purple-700'
                                  : 'bg-emerald-100 text-emerald-700'
                              }`}
                            >
                              {employee.role === 'Gerente' ? 'GER' : employee.role === 'Pos: ventas' ? 'POS' : 'ADM'}
                            </div>

                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-sm text-[#0F172A]">{employee.name}</span>
                                <span
                                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                                    employee.role === 'Gerente'
                                      ? 'bg-purple-50 text-purple-700 border border-purple-200'
                                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                  }`}
                                >
                                  {employee.role}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 mt-1 text-xs text-slate-500 font-mono">
                                <span>
                                  Usuario: <strong className="text-slate-800">{employee.username}</strong>
                                </span>
                                <span>•</span>
                                <span>
                                  Contraseña: <strong className="text-slate-800">{employee.password || '••••••'}</strong>
                                </span>
                                {employee.phone && (
                                  <>
                                    <span>•</span>
                                    <span>Tel: {employee.phone}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                            {/* Compartir por WhatsApp */}
                            <button
                              type="button"
                              onClick={() => shareCredentialsViaWhatsApp(employee, b)}
                              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-2xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                              title="Compartir credenciales por WhatsApp"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Enviar por WhatsApp</span>
                            </button>

                            {/* Copiar Credenciales */}
                            <button
                              type="button"
                              onClick={() => {
                                const text = `Palacio de Belleza\nSucursal: ${b.name}\nRol: ${employee.role}\nUsuario: ${employee.username}\nContraseña: ${employee.password}\nLink: ${SYSTEM_ACCESS_LINK}`;
                                copyToClipboard(text, employee.id);
                              }}
                              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition cursor-pointer"
                              title="Copiar credenciales completas"
                            >
                              {copiedKey === employee.id ? (
                                <Check className="w-4 h-4 text-emerald-600" />
                              ) : (
                                <Copy className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: TRASPASOS DE INVENTARIO */}
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
                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5 self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Traspaso</span>
                </button>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 border-b border-slate-200">
                    <th className="py-3 px-4 font-bold">Folio / Fecha</th>
                    <th className="py-3 px-4 font-bold">Origen &rarr; Destino</th>
                    <th className="py-3 px-4 font-bold">Producto Movido</th>
                    <th className="py-3 px-4 font-bold text-center">Cantidad</th>
                    <th className="py-3 px-4 font-bold">Motivo / Operador</th>
                    <th className="py-3 px-4 font-bold text-right">Comprobante</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transfers.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400 font-medium">
                        No hay traspasos registrados aún en el sistema.
                      </td>
                    </tr>
                  ) : (
                    transfers.map((t) => (
                      <tr key={t.id} className="hover:bg-purple-50/30 transition">
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-purple-700 block">{t.folio}</span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(t.date).toLocaleDateString('es-MX', {
                              day: '2-digit',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-800">{t.sourceBranchName}</span>
                            <ArrowRight className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                            <span className="font-bold text-slate-800">{t.targetBranchName}</span>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p className="font-bold text-slate-900 leading-tight">{t.productName}</p>
                          <span className="font-mono text-[11px] text-slate-400">{t.productSku}</span>
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="inline-block px-2.5 py-1 rounded-full bg-purple-100 text-purple-800 font-black text-xs font-mono">
                            {t.quantity} pzas
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <p className="text-slate-700 truncate max-w-xs">{t.reason || 'Sin motivo'}</p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">Por: {t.performedBy}</span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => setViewingTransferReceipt(t)}
                            className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-100 text-purple-700 font-bold transition flex items-center gap-1 ml-auto cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Vale</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODAL: NEW BRANCH & GENERATED CREDENTIALS */}
      {createdBranchInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto space-y-6">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F172A]">
                ¡Sucursal y Credenciales Creadas con Éxito!
              </h2>
              <p className="text-xs sm:text-sm text-slate-500">
                Se ha registrado <strong>{createdBranchInfo.branch.name}</strong> y se generaron automáticamente sus roles independientes para entrar al sistema.
              </p>
            </div>

            {/* Link del sistema */}
            <div className="p-3.5 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Link Oficial de Acceso:</p>
                <p className="text-xs font-mono font-bold text-slate-800 truncate">{SYSTEM_ACCESS_LINK}</p>
              </div>
              <button
                type="button"
                onClick={() => copyToClipboard(SYSTEM_ACCESS_LINK, 'popup-system-link')}
                className="px-3 py-1.5 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 shrink-0 transition cursor-pointer flex items-center gap-1"
              >
                {copiedKey === 'popup-system-link' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copiar Link</span>
              </button>
            </div>

            {/* Gerente Credentials Card */}
            <div className="p-4 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-purple-600 text-white">
                    Rol: Gerente
                  </span>
                  <span className="font-bold text-sm text-[#0F172A]">{createdBranchInfo.gerente.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => shareCredentialsViaWhatsApp(createdBranchInfo.gerente, createdBranchInfo.branch)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar WhatsApp</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-3 rounded-xl border border-purple-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Usuario:</span>
                  <span className="font-bold text-slate-800">{createdBranchInfo.gerente.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Contraseña:</span>
                  <span className="font-bold text-slate-800">{createdBranchInfo.gerente.password}</span>
                </div>
              </div>
            </div>

            {/* Vendedor Credentials Card */}
            <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-emerald-600 text-white">
                    Rol: Pos: ventas
                  </span>
                  <span className="font-bold text-sm text-[#0F172A]">{createdBranchInfo.vendedor.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => shareCredentialsViaWhatsApp(createdBranchInfo.vendedor, createdBranchInfo.branch)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Enviar WhatsApp</span>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs font-mono bg-white p-3 rounded-xl border border-emerald-100">
                <div>
                  <span className="text-slate-400 block text-[10px]">Usuario:</span>
                  <span className="font-bold text-slate-800">{createdBranchInfo.vendedor.username}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Contraseña:</span>
                  <span className="font-bold text-slate-800">{createdBranchInfo.vendedor.password}</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setCreatedBranchInfo(null)}
              className="w-full py-3 rounded-xl bg-[#0F172A] hover:bg-slate-800 text-white font-bold text-sm transition cursor-pointer"
            >
              Entendido y Cerrar
            </button>
          </div>
        </div>
      )}

      {/* MODAL: REGISTRAR O EDITAR SUCURSAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-100 overflow-y-auto max-h-[92vh]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-lg sm:text-xl font-black text-[#0F172A]">
                  {editingBranch ? 'Editar Sucursal' : 'Registrar Nueva Sucursal'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {!editingBranch
                    ? 'Al guardar se crearán automáticamente los accesos independientes para su Gerente y Vendedor.'
                    : 'Modifica los datos de la sucursal existente.'}
                </p>
              </div>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="mt-5 space-y-5 text-xs">
              {/* Sección 1: Datos de la Tienda */}
              <div className="space-y-4">
                <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#E6007E]" />
                  <span>1. Datos Físicos de la Sucursal</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Nombre de la Sucursal *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: Sucursal 4 - Plaza Galerías"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Código Identificador *</label>
                    <input
                      type="text"
                      required
                      placeholder="Ej: SUC-04"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:outline-none focus:border-[#E6007E]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Dirección / Ubicación Física</label>
                    <input
                      type="text"
                      placeholder="Ej: Av. Juárez 100, Col. Centro"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-slate-700 block mb-1">Teléfono Directo de Tienda</label>
                    <input
                      type="text"
                      placeholder="Ej: 55 1234 5678"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#E6007E]"
                    />
                  </div>
                </div>
              </div>

              {/* Sección 2: Creación Automática de Roles y Credenciales (Solo en registro nuevo) */}
              {!editingBranch && (
                <div className="space-y-4 pt-3 border-t border-slate-200">
                  <h4 className="font-black text-slate-800 text-xs uppercase tracking-wider flex items-center gap-1.5">
                    <KeyRound className="w-4 h-4 text-purple-600" />
                    <span>2. Creación Automática de Roles y Credenciales</span>
                  </h4>

                  {/* Gerente Automático */}
                  <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                        <User className="w-3.5 h-3.5 text-purple-600" />
                        <span>Rol: Gerente de la Sucursal</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            gerentePassword: generateSecurePassword('Ger'),
                          })
                        }
                        className="text-[11px] font-bold text-purple-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Regenerar Clave</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Nombre Completo del Gerente *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Lic. Carlos Almonte"
                          value={formData.gerenteName}
                          onChange={(e) => setFormData({ ...formData, gerenteName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-purple-600"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Teléfono / WhatsApp Gerente</label>
                        <input
                          type="text"
                          placeholder="Ej: 55 9988 7766"
                          value={formData.gerentePhone}
                          onChange={(e) => setFormData({ ...formData, gerentePhone: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-purple-600"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Usuario de Acceso *</label>
                        <input
                          type="text"
                          required
                          value={formData.gerenteUsername}
                          onChange={(e) => setFormData({ ...formData, gerenteUsername: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white focus:outline-none focus:border-purple-600"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Contraseña Segura *</label>
                        <input
                          type="text"
                          required
                          value={formData.gerentePassword}
                          onChange={(e) => setFormData({ ...formData, gerentePassword: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white focus:outline-none focus:border-purple-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Vendedor Automático */}
                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Rol: Pos: ventas (Vendedor / Cajero)</span>
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            vendedorPassword: generateSecurePassword('Ven'),
                          })
                        }
                        className="text-[11px] font-bold text-emerald-700 hover:underline flex items-center gap-1 cursor-pointer"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Regenerar Clave</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Nombre del Vendedor *</label>
                        <input
                          type="text"
                          required
                          placeholder="Ej: Sofia Gómez"
                          value={formData.vendedorName}
                          onChange={(e) => setFormData({ ...formData, vendedorName: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Teléfono / WhatsApp Vendedor</label>
                        <input
                          type="text"
                          placeholder="Ej: 55 1122 3344"
                          value={formData.vendedorPhone}
                          onChange={(e) => setFormData({ ...formData, vendedorPhone: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Usuario de Acceso *</label>
                        <input
                          type="text"
                          required
                          value={formData.vendedorUsername}
                          onChange={(e) => setFormData({ ...formData, vendedorUsername: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>

                      <div>
                        <label className="font-bold text-slate-700 block mb-1">Contraseña Segura *</label>
                        <input
                          type="text"
                          required
                          value={formData.vendedorPassword}
                          onChange={(e) => setFormData({ ...formData, vendedorPassword: e.target.value })}
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold bg-white focus:outline-none focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Opciones adicionales */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
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
                      checked={formData.isMain}
                      onChange={(e) => setFormData({ ...formData, isMain: e.target.checked })}
                      className="w-4 h-4 rounded text-[#E6007E] focus:ring-[#E6007E]"
                    />
                    <span className="font-bold text-slate-800">
                      Establecer como Sucursal Principal / Matriz
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
                  className="px-5 py-2.5 rounded-xl bg-[#E6007E] hover:bg-[#D60072] text-white font-extrabold shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>{editingBranch ? 'Guardar Cambios' : 'Registrar Sucursal & Generar Accesos'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: AGREGAR VENDEDOR EXTRA A SUCURSAL */}
      {showAddSellerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-[#0F172A] flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-600" />
                <span>Agregar Vendedor a Sucursal</span>
              </h3>
              <button
                onClick={() => setShowAddSellerModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleConfirmAddSeller} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Sucursal Asignada *</label>
                <select
                  value={extraSellerBranchId}
                  onChange={(e) => setExtraSellerBranchId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-emerald-600"
                >
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nombre Completo del Vendedor *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: María Hernández"
                  value={extraSellerName}
                  onChange={(e) => setExtraSellerName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Usuario *</label>
                  <input
                    type="text"
                    required
                    placeholder="maria_suc"
                    value={extraSellerUsername}
                    onChange={(e) => setExtraSellerUsername(e.target.value.toLowerCase().replace(/\s+/g, ''))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Contraseña Segura *</label>
                  <input
                    type="text"
                    required
                    value={extraSellerPassword}
                    onChange={(e) => setExtraSellerPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono font-bold focus:outline-none focus:border-emerald-600"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">WhatsApp / Teléfono</label>
                <input
                  type="text"
                  placeholder="55 1234 5678"
                  value={extraSellerPhone}
                  onChange={(e) => setExtraSellerPhone(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:border-emerald-600"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddSellerModal(false)}
                  className="px-3.5 py-2 rounded-xl border border-slate-300 font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Crear Acceso</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL TRASPASO DE INVENTARIO */}
      {showTransferModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 overflow-y-auto max-h-[90vh]">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <ArrowLeftRight className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-black text-[#0F172A]">Nuevo Traspaso entre Sucursales</h3>
                  <p className="text-xs text-slate-400">Transfiere existencias de una tienda a otra.</p>
                </div>
              </div>
              <button
                onClick={() => setShowTransferModal(false)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmTransfer} className="mt-4 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sucursal Origen (Sale stock) *</label>
                  <select
                    value={transferSourceId}
                    onChange={(e) => setTransferSourceId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-purple-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} disabled={b.id === transferTargetId}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Sucursal Destino (Entra stock) *</label>
                  <select
                    value={transferTargetId}
                    onChange={(e) => setTransferTargetId(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-bold focus:outline-none focus:border-purple-500"
                  >
                    {branches.map((b) => (
                      <option key={b.id} value={b.id} disabled={b.id === transferSourceId}>
                        {b.name} ({b.code})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Producto a Traspasar *</label>
                <select
                  value={transferProductId}
                  onChange={(e) => setTransferProductId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-slate-300 text-xs font-medium focus:outline-none focus:border-purple-500"
                >
                  {products.map((p) => {
                    const srcStock = p.branchStocks?.[transferSourceId] ?? 0;
                    return (
                      <option key={p.id} value={p.id}>
                        {p.name} [{p.sku}] - (Disp. en origen: {srcStock} pzas)
                      </option>
                    );
                  })}
                </select>
              </div>

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
    </div>
  );
};
