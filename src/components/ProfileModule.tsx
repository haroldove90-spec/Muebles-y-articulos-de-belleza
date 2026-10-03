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
  Database,
  ExternalLink,
  Loader2,
} from 'lucide-react';

interface ProfileModuleProps {
  currentRole: UserRole;
  currentUser?: UserAccount | null;
  sales: Sale[];
  onLogout: () => void;
  onUpdateAccount?: (account: UserAccount) => void;
  onOpenSupabaseModal?: () => void;
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
  onOpenSupabaseModal,
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

  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);
  const [saveErrorMessage, setSaveErrorMessage] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
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

  // Process and optimize uploaded image to Base64 via Canvas and AUTO-SAVE to Supabase
  const processImage = (file: File) => {
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona un archivo de imagen válido (PNG, JPG, WEBP).');
      return;
    }
    if (file.size > 8 * 1024 * 1024) {
      alert('La imagen no debe superar los 8 MB.');
      return;
    }

    setIsUploadingPhoto(true);
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      const rawResult = e.target?.result as string;
      if (!rawResult) {
        setIsUploadingPhoto(false);
        return;
      }

      const img = new Image();
      img.onload = async () => {
        const maxDim = 400;
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
          const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.80);

          const updatedAccount: UserAccount = {
            ...account,
            photoUrl: optimizedBase64,
          };

          setAccount(updatedAccount);

          // 1. Guardar localmente
          localStorage.setItem(`pb_user_acc_${updatedAccount.id}`, JSON.stringify(updatedAccount));
          localStorage.setItem('pb_current_user', JSON.stringify(updatedAccount));

          // 2. Guardar inmediatamente en Supabase
          try {
            const res = await SupabaseService.upsertUserAccount(updatedAccount);
            if (onUpdateAccount) {
              onUpdateAccount(updatedAccount);
            }

            if (res.success) {
              setSaveSuccessMessage('¡Fotografía de perfil actualizada y guardada con éxito en Supabase!');
              setTimeout(() => setSaveSuccessMessage(null), 5000);
            } else {
              setSaveErrorMessage(
                `Foto cargada localmente. Aviso de Supabase: ${res.error || 'Verifica la conexión'}. Pulsa "Guardar Cambios" para reintentar.`
              );
            }
          } catch (err: any) {
            console.error('Error auto-guardando foto en Supabase:', err);
            setSaveErrorMessage('Error al sincronizar foto en Supabase: ' + (err?.message || 'Error de red'));
          } finally {
            setIsUploadingPhoto(false);
          }
        } else {
          setIsUploadingPhoto(false);
        }
      };
      img.onerror = () => {
        setIsUploadingPhoto(false);
        alert('No se pudo procesar la imagen seleccionada.');
      };
      img.src = rawResult;
    };
    reader.onerror = () => {
      setIsUploadingPhoto(false);
      alert('Error al leer el archivo de imagen.');
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
    setHasUnsavedChanges(true);
  };

  const handleSaveProfile = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!account.name.trim()) {
      alert('El nombre completo es obligatorio.');
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
    setSaveSuccessMessage(null);
    setSaveErrorMessage(null);

    try {
      const updatedAccount: UserAccount = {
        ...account,
        name: account.name.trim(),
        username: account.username.trim().toLowerCase(),
        password: account.password.trim(),
        email: account.email?.trim() || '',
        phone: account.phone?.trim() || '',
        position: account.position?.trim() || '',
        bio: account.bio?.trim() || '',
      };

      // 1. Guardar en LocalStorage con clave de usuario único
      localStorage.setItem(`pb_user_acc_${updatedAccount.id}`, JSON.stringify(updatedAccount));
      localStorage.setItem('pb_current_user', JSON.stringify(updatedAccount));

      // 2. Sincronizar en Supabase
      const res = await SupabaseService.upsertUserAccount(updatedAccount);

      // 3. Sincronizar en App State
      if (onUpdateAccount) {
        onUpdateAccount(updatedAccount);
      }

      setHasUnsavedChanges(false);

      if (res.success) {
        setSaveSuccessMessage('¡Información de perfil, fotografía y credenciales guardadas exitosamente en Supabase!');
        setTimeout(() => setSaveSuccessMessage(null), 5000);
      } else {
        setSaveErrorMessage(
          `Guardado localmente. Supabase retornó: ${res.error}. Asegúrate de ejecutar el script SQL en el panel de Supabase.`
        );
      }
    } catch (err: any) {
      console.error('Error guardando perfil:', err);
      setSaveErrorMessage('Error al guardar en Supabase: ' + (err?.message || 'Error de conexión'));
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
    <div id="user-profile-module" className="flex-1 flex flex-col overflow-y-auto bg-slate-50 p-3 sm:p-6 lg:p-8 pb-28">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Module Header with ALWAYS VISIBLE SAVE BUTTON */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <User className="w-6 h-6 text-[#E6007E]" />
              <span>Mi Perfil & Credenciales</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Administra tu nombre, credenciales, contraseña y fotografía de perfil en Supabase.
            </p>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* BOTÓN PROMINENTE SIEMPRE VISIBLE PARA GUARDAR CAMBIOS */}
            <button
              id="btn-save-profile-top"
              type="button"
              onClick={() => handleSaveProfile()}
              disabled={isSaving}
              className={`px-5 py-2.5 rounded-xl font-black text-xs sm:text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center gap-2 ${
                hasUnsavedChanges
                  ? 'bg-pink-600 hover:bg-pink-700 text-white ring-2 ring-pink-400 ring-offset-2 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Guardando en Supabase...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar Cambios</span>
                </>
              )}
            </button>

            {onOpenSupabaseModal && (
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                className="px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-700 hover:bg-slate-100 font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
                title="Ver estado de conexión y script SQL de Supabase"
              >
                <Database className="w-4 h-4 text-pink-600" />
                <span className="hidden sm:inline">SQL Supabase</span>
              </button>
            )}

            <button
              type="button"
              onClick={onLogout}
              className="px-3.5 py-2.5 rounded-xl bg-white border border-rose-200 text-rose-700 hover:bg-rose-50 font-bold text-xs sm:text-sm transition active:scale-95 cursor-pointer flex items-center gap-1.5"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert if saved */}
        {saveSuccessMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-black">{saveSuccessMessage}</p>
              <p className="text-xs text-emerald-800">
                Los datos y fotografía quedaron sincronizados de manera permanente en Supabase.
              </p>
            </div>
          </div>
        )}

        {/* Feedback Alert if error */}
        {saveErrorMessage && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 flex items-start justify-between gap-3 animate-in fade-in duration-200 shadow-xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-black">Información de Sincronización</p>
                <p className="text-xs text-amber-900 mt-0.5">{saveErrorMessage}</p>
              </div>
            </div>
            {onOpenSupabaseModal && (
              <button
                type="button"
                onClick={onOpenSupabaseModal}
                className="px-3 py-1.5 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700 shrink-0 cursor-pointer shadow-xs"
              >
                Abrir SQL
              </button>
            )}
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className={`h-28 sm:h-36 bg-gradient-to-r ${colors.accent} relative px-6 flex items-end pb-3`}>
            <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-pink-300" />
              <span>Sincronizado con Supabase</span>
            </div>
          </div>

          {/* Profile Details Container */}
          <div className="px-5 sm:px-8 pb-8 pt-0 relative">
            {/* Avatar & Photo Upload */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100 shrink-0 relative">
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

                    {isUploadingPhoto && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center text-white text-[10px] font-bold p-1 text-center">
                        <Loader2 className="w-5 h-5 animate-spin mb-1 text-pink-400" />
                        <span>Guardando...</span>
                      </div>
                    )}
                  </div>

                  {/* Photo Upload Trigger Button */}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploadingPhoto}
                    title="Subir o cambiar foto de perfil (Se guarda automáticamente en Supabase)"
                    className="absolute -bottom-1 -right-1 p-2.5 rounded-xl bg-[#0F172A] text-white hover:bg-[#E6007E] transition shadow-md cursor-pointer flex items-center gap-1 active:scale-95 disabled:opacity-50"
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

              {/* Quick Action Button for Direct Photo Upload & Save */}
              <div className="flex items-center gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 rounded-xl bg-white border border-slate-300 hover:border-pink-400 text-xs font-bold text-slate-700 hover:text-pink-600 shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <UploadCloud className="w-4 h-4 text-pink-600" />
                  <span>Subir Foto</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveProfile()}
                  disabled={isSaving}
                  className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-xs font-black text-white shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>Guardar Perfil</span>
                </button>
              </div>
            </div>

            {/* Drag & Drop Photo Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`mb-6 border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-[#E6007E] bg-pink-50/50'
                  : 'border-slate-300 hover:border-pink-300 bg-slate-50/50 hover:bg-pink-50/20'
              }`}
            >
              <div className="flex items-center justify-center gap-2 text-slate-700">
                <UploadCloud className="w-5 h-5 text-[#E6007E]" />
                <span className="text-xs sm:text-sm font-bold">
                  {isUploadingPhoto
                    ? 'Procesando y guardando imagen en Supabase...'
                    : 'Haz clic aquí o arrastra una fotografía para actualizar tu foto de perfil'}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Al subirla, se optimiza y se guarda inmediatamente en Supabase vinculada a tu usuario.
              </p>
            </div>

            {/* Profile Info Form - ALWAYS DIRECTLY EDITABLE */}
            <form onSubmit={handleSaveProfile} className="space-y-6">
              {/* SECTION: CREDENTIALS (Usuario & Contraseña) */}
              <div className="bg-pink-50/50 border border-pink-200/80 rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-5 h-5 text-[#E6007E]" />
                    <h3 className="text-sm font-black text-[#0F172A] uppercase tracking-wide">
                      Credenciales de Acceso al Sistema
                    </h3>
                  </div>
                  <span className="text-[11px] font-bold text-pink-600 bg-pink-100 px-2.5 py-0.5 rounded-full">
                    Sincronizadas con Supabase
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Campo de Usuario */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>Nombre de Usuario *</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={account.username}
                      onChange={(e) => {
                        setAccount({ ...account, username: e.target.value.toLowerCase().replace(/\s+/g, '') });
                        setHasUnsavedChanges(true);
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-mono font-bold bg-white"
                      placeholder="usuario"
                    />
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Nombre único para iniciar sesión.
                    </span>
                  </div>

                  {/* Campo de Contraseña */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Contraseña Segura *</span>
                      </label>
                      <button
                        type="button"
                        onClick={handleGeneratePassword}
                        className="text-[11px] font-bold text-[#E6007E] hover:underline flex items-center gap-1 cursor-pointer"
                        title="Generar contraseña segura automática"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Generar Clave</span>
                      </button>
                    </div>

                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        minLength={6}
                        value={account.password || ''}
                        onChange={(e) => {
                          setAccount({ ...account, password: e.target.value });
                          setHasUnsavedChanges(true);
                        }}
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-mono font-bold bg-white"
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 mt-1 block">
                      Mínimo 6 caracteres.
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
                  <input
                    type="text"
                    required
                    value={account.name}
                    onChange={(e) => {
                      setAccount({ ...account, name: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium bg-white"
                    placeholder="Ej. Emilio"
                  />
                </div>

                {/* Cargo / Puesto */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    <span>Cargo o Puesto *</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={account.position || ''}
                    onChange={(e) => {
                      setAccount({ ...account, position: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium bg-white"
                    placeholder="Ej. Director General & Administrador"
                  />
                </div>

                {/* Correo Electrónico */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span>Correo Electrónico de Contacto *</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={account.email}
                    onChange={(e) => {
                      setAccount({ ...account, email: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium bg-white"
                    placeholder="correo@palaciodebelleza.mx"
                  />
                </div>

                {/* Teléfono / WhatsApp */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>Teléfono Móvil / WhatsApp *</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={account.phone}
                    onChange={(e) => {
                      setAccount({ ...account, phone: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium bg-white"
                    placeholder="55-1234-5678"
                  />
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
                  <textarea
                    rows={2}
                    value={account.bio || ''}
                    onChange={(e) => {
                      setAccount({ ...account, bio: e.target.value });
                      setHasUnsavedChanges(true);
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium resize-none bg-white"
                    placeholder="Notas del puesto, responsabilidades..."
                  />
                </div>
              </div>

              {/* Action Buttons: ALWAYS VISIBLE AT BOTTOM */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-5 border-t border-slate-200">
                <span className="text-xs text-slate-500 text-center sm:text-left">
                  Los cambios se guardan de forma permanente e independiente en Supabase.
                </span>

                <button
                  id="btn-save-profile-bottom"
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow-md transition active:scale-95 cursor-pointer flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Guardando en Supabase...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4" />
                      <span>Guardar Información en Supabase</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Floating Sticky Save Bar (Guarantees user always sees the save button no matter the scroll position) */}
      <div className="fixed bottom-14 sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-lg bg-slate-900/90 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700/80 flex items-center justify-between gap-3 animate-in slide-in-from-bottom duration-300">
        <div className="flex items-center gap-2 min-w-0">
          <Database className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="text-xs font-bold truncate">
            {hasUnsavedChanges ? '⚠️ Cambios pendientes de guardar' : 'Perfil sincronizado con Supabase'}
          </span>
        </div>

        <button
          type="button"
          onClick={() => handleSaveProfile()}
          disabled={isSaving}
          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md transition active:scale-95 cursor-pointer flex items-center gap-1.5 shrink-0"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Guardando...</span>
            </>
          ) : (
            <>
              <Save className="w-3.5 h-3.5" />
              <span>Guardar en Supabase</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};
