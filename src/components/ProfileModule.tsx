import React, { useState, useRef, useEffect } from 'react';
import { UserProfile, UserRole, Sale } from '../types';
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
  RotateCcw,
  LogOut,
  Save,
} from 'lucide-react';

interface ProfileModuleProps {
  currentRole: UserRole;
  sales: Sale[];
  onLogout: () => void;
  onProfileUpdated?: (profile: UserProfile) => void;
}

const DEFAULT_PROFILES: Record<UserRole, UserProfile> = {
  Admin: {
    id: 'user-admin',
    role: 'Admin',
    name: 'Lic. Mariana Valdez',
    email: 'administracion@palaciodebelleza.mx',
    phone: '55-4123-9870',
    storeName: 'Palacio de Belleza - Matriz Insurgentes',
    position: 'Directora General & Administradora',
    bio: 'Supervisión ejecutiva, control financiero y configuración integral del inventario de muebles y cosmética.',
    photoUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=350',
    joinedDate: '2023-01-15',
  },
  Gerente: {
    id: 'user-gerente',
    role: 'Gerente',
    name: 'Carlos Mendoza Ríos',
    email: 'gerencia@palaciodebelleza.mx',
    phone: '55-7890-1234',
    storeName: 'Palacio de Belleza - Sucursal Centro',
    position: 'Gerente Operativo & Compras',
    bio: 'Gestión de clientes mayoristas, abastecimiento con fabricantes de mobiliario y auditoría de existencias.',
    photoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=350',
    joinedDate: '2023-06-10',
  },
  'Pos: ventas': {
    id: 'user-cajero',
    role: 'Pos: ventas',
    name: 'Sofía Morales Peña',
    email: 'caja1@palaciodebelleza.mx',
    phone: '55-8765-4321',
    storeName: 'Palacio de Belleza - Showroom Principal',
    position: 'Ejecutiva de Mostrador & Cajera POS',
    bio: 'Atención personalizada al cliente, facturación rápida, cobros con tarjeta y emisión de tickets de venta.',
    photoUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=350',
    joinedDate: '2024-02-01',
  },
  Supervisor: {
    id: 'user-supervisor',
    role: 'Supervisor',
    name: 'Alejandro Cruz',
    email: 'supervisor@palaciodebelleza.mx',
    phone: '55-3344-5566',
    storeName: 'Palacio de Belleza - Matriz',
    position: 'Auditor de Mostrador',
    bio: 'Supervisión y control de cortes de caja diarios.',
    photoUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=350',
    joinedDate: '2024-01-10',
  },
};

export const ProfileModule: React.FC<ProfileModuleProps> = ({
  currentRole,
  sales,
  onLogout,
  onProfileUpdated,
}) => {
  const [profile, setProfile] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(`pb_profile_${currentRole}`);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        // fallback
      }
    }
    return DEFAULT_PROFILES[currentRole] || DEFAULT_PROFILES.Admin;
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync profile when role changes or on mount
  useEffect(() => {
    let isMounted = true;
    async function loadCloudProfile() {
      const cloud = await SupabaseService.fetchProfile(currentRole);
      if (isMounted && cloud) {
        setProfile(cloud);
        localStorage.setItem(`pb_profile_${currentRole}`, JSON.stringify(cloud));
      }
    }
    loadCloudProfile();
    return () => {
      isMounted = false;
    };
  }, [currentRole]);

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
          setProfile((prev) => ({ ...prev, photoUrl: optimizedBase64 }));
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

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      // 1. Guardar en LocalStorage
      localStorage.setItem(`pb_profile_${currentRole}`, JSON.stringify(profile));

      // 2. Sincronizar en Supabase
      await SupabaseService.upsertProfile(profile);

      if (onProfileUpdated) {
        onProfileUpdated(profile);
      }

      setSaveSuccess(true);
      setIsEditing(false);
      setTimeout(() => setSaveSuccess(false), 4000);
    } catch (err) {
      console.error('Error guardando perfil:', err);
      alert('Error al guardar el perfil en el servidor.');
    } finally {
      setIsSaving(false);
    }
  };

  const getRoleColors = (role: UserRole) => {
    switch (role) {
      case 'Admin':
        return {
          badge: 'bg-purple-100 text-purple-800 border-purple-200',
          accent: 'from-purple-600 to-indigo-700',
          pill: 'bg-purple-600 text-white',
        };
      case 'Gerente':
        return {
          badge: 'bg-blue-100 text-blue-800 border-blue-200',
          accent: 'from-blue-600 to-cyan-700',
          pill: 'bg-blue-600 text-white',
        };
      case 'Pos: ventas':
      default:
        return {
          badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          accent: 'from-pink-600 to-[#E6007E]',
          pill: 'bg-[#E6007E] text-white',
        };
    }
  };

  const colors = getRoleColors(currentRole);

  return (
    <div id="user-profile-module" className="flex-1 flex flex-col overflow-y-auto bg-slate-50 p-3 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto w-full space-y-6">
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight flex items-center gap-2.5">
              <User className="w-6 h-6 text-[#E6007E]" />
              <span>Mi Perfil & Datos de Cuenta</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Administra tu información personal, foto de perfil y credenciales de acceso al sistema.
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
                <span>Editar Información</span>
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
              title="Cerrar sesión o cambiar de rol"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Cambiar Rol</span>
            </button>
          </div>
        </div>

        {/* Feedback Alert if saved */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3 animate-in fade-in duration-200 shadow-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div>
              <p className="text-sm font-bold">¡Datos actualizados exitosamente!</p>
              <p className="text-xs text-emerald-700">Tus cambios se guardaron tanto en tu dispositivo como en Supabase.</p>
            </div>
          </div>
        )}

        {/* Main Profile Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm overflow-hidden">
          {/* Banner */}
          <div className={`h-28 sm:h-36 bg-gradient-to-r ${colors.accent} relative px-6 flex items-end pb-3`}>
            <div className="absolute top-3 right-3 bg-black/30 backdrop-blur-md px-3 py-1 rounded-full text-white text-[11px] font-bold">
              Palacio de Belleza OS v2.4
            </div>
          </div>

          {/* Profile Details Container */}
          <div className="px-5 sm:px-8 pb-8 pt-0 relative">
            {/* Avatar & Photo Upload */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 -mt-14 sm:-mt-16 mb-6">
              <div className="flex items-end gap-4">
                <div className="relative group">
                  <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-white shadow-lg overflow-hidden bg-slate-100 shrink-0">
                    {profile.photoUrl ? (
                      <img
                        src={profile.photoUrl}
                        alt={profile.name}
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
                      {profile.name}
                    </h2>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${colors.badge}`}>
                      {currentRole}
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-500 mt-0.5 truncate">
                    {profile.position || 'Colaborador Oficial'}
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

            {/* Profile Info Form / Display */}
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
                    Arrastra aquí tu nueva foto o haz clic para seleccionarla desde tu dispositivo
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    PNG, JPG o WEBP (se optimiza y comprime automáticamente para máxima velocidad)
                  </p>
                </div>
              )}

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
                      value={profile.name}
                      onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium"
                      placeholder="Ej. Sofía Morales"
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                      {profile.name}
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
                      value={profile.position || ''}
                      onChange={(e) => setProfile({ ...profile, position: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium"
                      placeholder="Ej. Cajero Principal / Mostrador"
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                      {profile.position || 'No especificado'}
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
                      value={profile.email}
                      onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium"
                      placeholder="correo@palaciodebelleza.mx"
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                      {profile.email}
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
                      value={profile.phone}
                      onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium"
                      placeholder="55-1234-5678"
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                      {profile.phone}
                    </div>
                  )}
                </div>

                {/* Sucursal / Salón */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <Store className="w-3.5 h-3.5 text-slate-400" />
                    <span>Sucursal Asignada / Showroom</span>
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.storeName || ''}
                      onChange={(e) => setProfile({ ...profile, storeName: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium"
                      placeholder="Ej. Palacio de Belleza - Matriz"
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-800">
                      {profile.storeName || 'Palacio de Belleza - Principal'}
                    </div>
                  )}
                </div>

                {/* Notas personales / Biografía de turno */}
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Notas de Turno / Descripción del Perfil</span>
                  </label>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={profile.bio || ''}
                      onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:border-[#E6007E] text-xs sm:text-sm font-medium resize-none"
                      placeholder="Notas del puesto, responsabilidades o perfil del colaborador..."
                    />
                  ) : (
                    <div className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-700 leading-relaxed min-h-[4rem]">
                      {profile.bio || 'Sin notas registradas.'}
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

        {/* Roles & System Access Card */}
        <div className="bg-white rounded-3xl border border-slate-200/90 p-5 sm:p-6 shadow-sm">
          <h3 className="text-sm sm:text-base font-bold text-[#0F172A] mb-3 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Permisos & Accesos del Rol {currentRole}</span>
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Módulos Asignados:</span>
              <p className="text-slate-600">
                {currentRole === 'Admin'
                  ? 'Acceso total: Métricas, Inventario, Clientes, Ventas, Proveedores, Borrado Global.'
                  : currentRole === 'Gerente'
                  ? 'Operación completa: Inventario, Clientes, Ventas, Proveedores, Altas y Bajas.'
                  : 'Caja comercial rápida: Punto de Venta (POS), Cobros, Tickets del Día y Perfil.'}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Sincronización:</span>
              <p className="text-slate-600">
                Base de datos en la nube con Supabase y respaldo local seguro en navegador.
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="font-bold text-slate-800 block mb-1">Seguridad:</span>
              <p className="text-slate-600">
                Acceso restringido por rol y control de sesiones activas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
