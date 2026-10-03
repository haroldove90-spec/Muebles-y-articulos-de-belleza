import React, { useState, useRef, useEffect } from 'react';
import { UserRole, Sale, UserAccount } from '../types';
import { SupabaseService } from '../lib/supabase';
import {
  User,
  ShieldCheck,
  Building,
  Phone,
  Mail,
  Camera,
  UploadCloud,
  CheckCircle2,
  Calendar,
  Briefcase,
  Store,
  Sparkles,
  FileText,
  LogOut,
  Save,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface ProfileModuleProps {
  currentRole: UserRole;
  currentUser?: UserAccount | null;
  sales: Sale[];
  onLogout: () => void;
  onUpdateAccount?: (account: UserAccount) => void;
}

// Generate a random secure password
const generateSecurePassword = (): string => {
  const letters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz';
  const numbers = '23456789';
  const symbols = '!@#$%&*';
  let pass = '';
  for (let i = 0; i < 6; i++) pass += letters[Math.floor(Math.random() * letters.length)];
  for (let i = 0; i < 3; i++) pass += numbers[Math.floor(Math.random() * numbers.length)];
  for (let i = 0; i < 2; i++) pass += symbols[Math.floor(Math.random() * symbols.length)];
  return pass;
};

export const ProfileModule: React.FC<ProfileModuleProps> = ({
  currentRole,
  currentUser,
  sales,
  onLogout,
  onUpdateAccount,
}) => {
  // Use account ID or fallback to currentRole for unique profile storage
  const accountKey = currentUser?.id || `user-role-${currentRole}`;

  const [account, setAccount] = useState<UserAccount>(() => {
    const saved = localStorage.getItem(`pb_user_acc_${accountKey}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    if (currentUser) return currentUser;

    return {
      id: accountKey,
      username: currentRole === 'Admin' ? 'emilio' : currentRole.toLowerCase().replace(/[^a-z0-9]/g, '_'),
      password: 'Password2026!',
      name: currentRole === 'Admin' ? 'Emilio' : currentRole === 'Gerente' ? 'Harold Anguiano' : 'Sofía Morales',
      role: currentRole,
      branchId: 'branch-1',
      branchName: 'Sucursal 1 - Matriz (Principal)',
      email: currentRole === 'Admin' ? 'emilio@palaciodebelleza.mx' : `${currentRole.toLowerCase()}@palaciodebelleza.mx`,
      phone: '55-4123-9870',
      position: currentRole === 'Admin' ? 'Director General & Administrador' : currentRole === 'Gerente' ? 'Gerente Operativo' : 'Ejecutiva de Mostrador & Cajera POS',
      bio: 'Control operativo de sucursales, existencias y punto de venta.',
      photoUrl: currentRole === 'Admin'
        ? 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=350'
        : currentRole === 'Gerente'
        ? 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=350'
        : 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=350',
      createdAt: new Date().toISOString(),
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync if currentUser prop changes
  useEffect(() => {
    if (currentUser) {
      setAccount((prev) => ({
        ...currentUser,
        photoUrl: prev.id === currentUser.id ? (prev.photoUrl || currentUser.photoUrl) : currentUser.photoUrl,
      }));
    }
  }, [currentUser]);

  // Role Statistics Calculation
  const roleSales = sales.filter((s) => s.cashierRole === currentRole || currentRole === 'Admin');
  const completedSales = roleSales.filter((s) => s.status === 'Completada');
  const totalVolume = completedSales.reduce((acc, s) => acc + s.total, 0);

  // Process and optimize uploaded image to Base64 via Canvas
  const processImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen no debe superar los 8 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      if (!rawResult) return;

      const img = new Image();
      img.onload = () => {
        const maxDim = 500;
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
          const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          // Update ONLY this user's photo!
          setAccount((prev) => ({ ...prev, photoUrl: optimizedBase64 }));
        }
      };
      img.src = rawResult;
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processImage(file);
    }
  };

  const handleGeneratePassword = () => {
    const newPass = generateSecurePassword();
    setAccount((prev) => ({ ...prev, password: newPass }));
    setShowPassword(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account.name.trim()) {
      alert('El nombre es obligatorio.');
      return;
    }
    if (!account.username.trim()) {
      alert('El nombre de usuario es obligatorio.');
      return;
    }
    if (!account.password || account.password.length < 6) {
      alert('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsSaving(true);
    setSaveSuccess(false);

    try {
      const updatedAccount: UserAccount = {
        ...account,
        name: account.name.trim(),
        username: account.username.trim().toLowerCase(),
        password: account.password.trim(),
        email: account.email?.trim() || '',
        phone: account.phone?.trim() || '',
      };

      // 1. Guardar en LocalStorage con clave de usuario único
      localStorage.setItem(`pb_user_acc_${account.id}`, JSON.stringify(updatedAccount));

      // 2. Sincronizar en Supabase
      await SupabaseService.upsertUserAccount(updatedAccount);

      if (onUpdateAccount) {
        onUpdateAccount(updatedAccount);
      }

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error guardando perfil:', err);
      alert('Error al guardar el perfil.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleColors = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return {
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          accent: 'from-pink-600 to-[#E6007E]',
          pill: 'bg-[#E6007E] text-white',
        };
      case 'Gerente':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          accent: 'from-purple-600 to-indigo-700',
          pill: 'bg-purple-600 text-white',
        };
      case 'Pos: ventas':
      default:
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          accent: 'from-emerald-600 to-teal-700',
          pill: 'bg-emerald-600 text-white',
        };
    }
  };

  const colors = getRoleColors(account.role || currentRole);

  return (
    <div id="user-profile-module" className="flex-1 flex flex-col overflow-y-auto bg-slate-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <User className="w-6 h-6 text-[#E6007E]" />
              <span>Mi Perfil & Credenciales de Usuario</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Administra tu nombre, usuario, contraseña segura y fotografía personal independiente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 font-bold text-xs sm:text-sm text-slate-800 shadow-xs transition active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <Sparkles className="w-4 h-4 text-[#E6007E]" />
                <span>Editar Perfil & Clave</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 font-bold text-xs text-slate-700 transition cursor-pointer"
              >
                Cancelar
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 font-bold text-xs transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert if saved */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">¡Credenciales y perfil actualizados con éxito!</p>
              <p className="text-xs text-emerald-700">Tus cambios se guardaron de manera segura y exclusiva para tu usuario.</p>
            </div>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className={`h-28 sm:h-36 bg-gradient-to-r ${colors.accent} relative px-6 flex items-end pb-3`}>
            <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold">
              Palacio de Belleza OS
            </div>
          </div>

          {/* Profile Details Container */}
          <div className="px-5 sm:px-8 pb-8 pt-0 relative">
            {/* Avatar & Photo Upload */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100 shrink-0">
                    {account.photoUrl ? (
                      <img
                        src={account.photoUrl}
                        alt={account.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                        <User className="w-12 h-12" />
                      </div>
                    )}
                  </div>

                  {/* Photo Upload Trigger Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    title="Subir o cambiar foto de perfil"
                    className="absolute -bottom-1 -right-1 p-2 rounded-xl bg-[#0F172A] text-white hover:bg-[#E6007E] transition shadow-md cursor-pointer"
                  >
                    <Camera className="w-4 h-4" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h2 className="text-xl sm:text-2xl font-black text-[#0F172A] truncate">
                      {account.name}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors.badge}`}>
                      {account.role}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 truncate">
                    {account.position || 'Colaborador Oficial'}
                  </p>
                  <p className="text-xs font-bold text-pink-600 mt-0.5 flex items-center gap-1 truncate">
                    <Store className="w-3.5 h-3.5 shrink-0" />
                    <span>{account.branchName || 'Sucursal Matriz'}</span>
                  </p>
                </div>
              </div>

              {/* Quick Summary Pill */}
              <div className="bg-slate-50 border border-slate-200/90 rounded-2xl p-3 flex items-center gap-4 text-left shrink-0">
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Caja / Ventas</p>
                  <p className="text-base font-black text-slate-800">{completedSales.length} tickets</p>
                </div>
                <div className="h-7 w-px bg-slate-200" />
                <div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Monto Total</p>
                  <p className="text-base font-black text-[#E6007E]">
                    ${totalVolume.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Info Form */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* Photo Drag & Drop Zone (visible when editing) */}
              {isEditing && (
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-4 sm:p-6 text-center cursor-pointer transition ${
                    isDragging
                      ? 'border-[#E6007E] bg-pink-50/50'
                      : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
                  }`}
                >
                  <UploadCloud className="w-8 h-8 text-[#E6007E] mx-auto mb-2" />
                  <p className="text-xs sm:text-sm font-bold text-slate-700">
                    Haz clic para cambiar tu fotografía personal exclusiva
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Se guarda únicamente en tu usuario ({account.username}). No afecta a otros colaboradores.
                  </p>
                </div>
              )}

              {/* SECTION: CREDENTIALS (Usuario & Contraseña) */}
              <div className="bg-pink-50/50 border border-pink-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <KeyRound className="w-5 h-5 text-[#E6007E]" />
                  <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wide">
                    Credenciales de Acceso al Sistema
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Campo de Usuario */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nombre de Usuario *</span>
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        required
                        value={account.username}
                        onChange={(e) => setAccount({ ...account, username: e.target.value.toLowerCase().replace(/\s+/g, '') })}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-mono font-bold bg-white"
                        placeholder="Ej: emilio, harold"
                      />
                    ) : (
                      <div className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-mono font-bold text-slate-800">
                        {account.username}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Nombre de usuario para iniciar sesión.
                    </span>
                  </div>

                  {/* Campo de Contraseña Segura */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Contraseña Segura *</span>
                      </label>
                      {isEditing && (
                        <button
                          type="button"
                          onClick={handleGeneratePassword}
                          className="text-[11px] font-bold text-[#E6007E] hover:underline flex items-center gap-1 cursor-pointer"
                        >
                          <RefreshCw className="w-3 h-3" />
                          <span>Generar Segura</span>
                        </button>
                      )}
                    </div>

                    {isEditing ? (
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={account.password || ''}
                          onChange={(e) => setAccount({ ...account, password: e.target.value })}
                          className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-mono font-bold bg-white"
                          placeholder="Mínimo 6 caracteres"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    ) : (
                      <div className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-mono font-bold text-slate-800 flex items-center justify-between">
                        <span>{showPassword ? account.password : '••••••••••••'}</span>
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="text-slate-400 hover:text-slate-600 cursor-pointer text-xs"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Protege tu cuenta con letras mayúsculas, números y símbolos.
                    </span>
                  </div>
                </div>
              </div>

              {/* Personal Data Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Nombre */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>Nombre Completo *</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={account.name}
                      onChange={(e) => setAccount({ ...account, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium"
                      placeholder="Ej. Emilio"
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                      {account.name}
                    </div>
                  )}
                </div>

                {/* Cargo / Puesto */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cargo o Puesto *</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      required
                      value={account.position || ''}
                      onChange={(e) => setAccount({ ...account, position: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium"
                      placeholder="Ej. Gerente de Sucursal"
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                      {account.position || 'Colaborador Oficial'}
                    </div>
                  )}
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Correo Electrónico de Contacto *</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      required
                      value={account.email}
                      onChange={(e) => setAccount({ ...account, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium"
                      placeholder="correo@palaciodebelleza.mx"
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                      {account.email || 'No registrado'}
                    </div>
                  )}
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Teléfono Móvil / WhatsApp *</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      required
                      value={account.phone}
                      onChange={(e) => setAccount({ ...account, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium"
                      placeholder="55-1234-5678"
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                      {account.phone || 'No registrado'}
                    </div>
                  )}
                </div>

                {/* Sucursal Asignada */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sucursal Asignada al Usuario</span>
                  </label>
                  <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-bold text-[#0F172A] flex items-center justify-between">
                    <span>{account.branchName || 'Sucursal 1 - Matriz (Principal)'}</span>
                    <span className="text-[11px] font-semibold text-slate-400 font-mono">
                      ID: {account.branchId || 'branch-1'}
                    </span>
                  </div>
                </div>

                {/* Biografía / Notas */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Notas de Turno / Descripción del Perfil</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={account.bio || ''}
                      onChange={(e) => setAccount({ ...account, bio: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium resize-none"
                      placeholder="Notas del puesto, responsabilidades..."
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed min-h-[3.5rem]">
                      {account.bio || 'Sin notas registradas.'}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons when editing */}
              {isEditing && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition cursor-pointer"
                  >
                    Descartar Cambios
                  </button>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-[#16A34A] hover:bg-[#15803D] text-white font-extrabold text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Guardando...' : 'Guardar Información'}</span>
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
