import React, { useState } from 'react';
import { UserRole, UserAccount, Branch } from '../types';
import { ShieldCheck, UserCheck, ShoppingBag, Lock, User, Eye, EyeOff, LogIn, ArrowRight, Store, CheckCircle2, AlertCircle } from 'lucide-react';
import { LOGO_URL } from './Logo';

interface RoleSelectorProps {
  onSelectRole: (role: UserRole, account?: UserAccount) => void;
  userAccounts?: UserAccount[];
  branches?: Branch[];
}

export const RoleSelector: React.FC<RoleSelectorProps> = ({
  onSelectRole,
  userAccounts = [],
  branches = [],
}) => {
  const [accessMode, setAccessMode] = useState<'credentials' | 'roles'>('credentials');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Handle Credentials Login
  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanUser = username.trim().toLowerCase();
    const cleanPass = password.trim();

    if (!cleanUser || !cleanPass) {
      setErrorMsg('Por favor ingresa tu usuario y contraseña.');
      return;
    }

    // Match account
    const matchedAccount = userAccounts.find(
      (acc) =>
        (acc.username.toLowerCase() === cleanUser || acc.email?.toLowerCase() === cleanUser) &&
        acc.password === cleanPass
    );

    if (!matchedAccount) {
      setErrorMsg('Credenciales inválidas. Verifica tu usuario y contraseña proporcionados por tu sucursal.');
      return;
    }

    onSelectRole(matchedAccount.role, matchedAccount);
  };

  // Quick fill helper
  const handleQuickFill = (acc: UserAccount) => {
    setUsername(acc.username);
    setPassword(acc.password || '');
    setErrorMsg(null);
  };

  const rolesList: {
    role: UserRole;
    icon: React.ReactNode;
    title: string;
    desc: string;
    accentBorder: string;
    badgeBg: string;
  }[] = [
    {
      role: 'Admin',
      icon: <ShieldCheck className="w-8 h-8 text-[#E6007E]" />,
      title: 'Administrador (Emilio)',
      desc: 'Acceso total, multisucursales, inventario y métricas generales.',
      accentBorder: 'hover:border-[#E6007E] focus:border-[#E6007E]',
      badgeBg: 'bg-pink-50 text-[#E6007E]',
    },
    {
      role: 'Gerente',
      icon: <UserCheck className="w-8 h-8 text-purple-600" />,
      title: 'Gerente de Sucursal',
      desc: 'Inventario de tienda, auditoría de ventas, clientes y catálogo.',
      accentBorder: 'hover:border-purple-600 focus:border-purple-600',
      badgeBg: 'bg-purple-50 text-purple-700',
    },
    {
      role: 'Pos: ventas',
      icon: <ShoppingBag className="w-8 h-8 text-emerald-600" />,
      title: 'Ventas y Punto de Venta (POS)',
      desc: 'Terminal rápida de cobro, tickets del día y arqueo de caja.',
      accentBorder: 'hover:border-emerald-600 focus:border-emerald-600',
      badgeBg: 'bg-emerald-50 text-emerald-700',
    },
  ];

  return (
    <div
      id="role-selector-screen"
      className="min-h-screen bg-[#F4F5F7] flex flex-col items-center justify-center p-4 sm:p-6 md:p-8"
    >
      <div className="w-full max-w-xl mx-auto flex flex-col items-center">
        {/* Logotipo Oficial */}
        <div className="mb-6 flex flex-col items-center text-center">
          <img
            src={LOGO_URL}
            alt="Palacio de Belleza"
            className="h-24 sm:h-28 md:h-32 w-auto max-w-full object-contain select-none drop-shadow-sm mb-2"
            loading="eager"
          />
          <h1 className="text-xl sm:text-2xl font-black text-[#0F172A] tracking-tight">
            Acceso al Sistema Palacio de Belleza
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-md">
            Ingresa con tus credenciales de empleado para acceder a tu sucursal correspondiente.
          </p>
        </div>

        {/* Tab Toggle: Credenciales vs Acceso Rápido */}
        <div className="w-full bg-slate-200/80 p-1 rounded-2xl flex items-center mb-6">
          <button
            type="button"
            onClick={() => {
              setAccessMode('credentials');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
              accessMode === 'credentials'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Lock className="w-4 h-4 text-[#E6007E]" />
            <span>Iniciar con Credenciales</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setAccessMode('roles');
              setErrorMsg(null);
            }}
            className={`flex-1 py-2 px-3 rounded-xl font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 ${
              accessMode === 'roles'
                ? 'bg-white text-[#0F172A] shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Acceso Rápido por Rol</span>
          </button>
        </div>

        {/* CREDENTIALS LOGIN TAB */}
        {accessMode === 'credentials' && (
          <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-sm p-6 sm:p-8 space-y-6">
            {errorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Usuario o Correo Institucional</span>
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ej: emilio, harold, ventas_matriz"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-[#E6007E] focus:ring-2 focus:ring-pink-100 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Contraseña Segura</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-xs font-bold text-[#E6007E] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    <span>{showPassword ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-medium focus:outline-none focus:border-[#E6007E] focus:ring-2 focus:ring-pink-100 transition"
                  />
                </div>
              </div>

              <button
                type="submit"
                id="btn-login-credentials"
                className="w-full py-3.5 px-4 rounded-xl bg-[#E6007E] hover:bg-[#D60072] text-white font-extrabold text-sm shadow-md transition active:scale-98 cursor-pointer flex items-center justify-center gap-2"
              >
                <LogIn className="w-4 h-4" />
                <span>Ingresar al Sistema</span>
              </button>
            </form>

            {/* Quick Helper Credentials from Registered Accounts */}
            {userAccounts.length > 0 && (
              <div className="pt-4 border-t border-slate-100">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  Cuentas Registradas en el Sistema (Clic para autorrellenar):
                </p>
                <div className="flex flex-wrap gap-2">
                  {userAccounts.map((acc) => (
                    <button
                      key={acc.id}
                      type="button"
                      onClick={() => handleQuickFill(acc)}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-pink-50 hover:text-[#E6007E] border border-slate-200 text-xs font-semibold text-slate-700 transition cursor-pointer flex items-center gap-1.5"
                      title={`Rol: ${acc.role} - Sucursal: ${acc.branchName || 'General'}`}
                    >
                      <span className="font-bold">{acc.name}</span>
                      <span className="text-[10px] text-slate-400 font-mono">({acc.username})</span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ROLES SELECTOR TAB */}
        {accessMode === 'roles' && (
          <div className="w-full space-y-3">
            {rolesList.map((item) => {
              const matchedAcc = userAccounts.find((a) => a.role === item.role);
              return (
                <button
                  key={item.role}
                  id={`role-btn-${item.role.toLowerCase().replace(/[^a-z0-9]/g, '-')}`}
                  onClick={() => onSelectRole(item.role, matchedAcc)}
                  className={`w-full group p-4 sm:p-5 bg-white rounded-2xl border-2 border-slate-200/90 shadow-2xs hover:shadow-md transition-all duration-200 cursor-pointer active:scale-98 flex items-center justify-between text-left ${item.accentBorder}`}
                >
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${item.badgeBg}`}
                    >
                      {item.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-base sm:text-lg font-black text-[#0F172A] tracking-tight">
                          {item.title}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{item.desc}</p>
                      {matchedAcc && (
                        <p className="text-[11px] font-bold text-emerald-700 mt-1 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Usuario asignado: {matchedAcc.name} ({matchedAcc.branchName || 'Matriz'})</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <ArrowRight className="w-5 h-5 text-slate-400 group-hover:text-[#E6007E] transition shrink-0 ml-2" />
                </button>
              );
            })}
          </div>
        )}

        {/* Public Access Link Note */}
        <div className="mt-6 text-center text-xs text-slate-400">
          <span>Enlace institucional de acceso: </span>
          <span className="font-mono text-slate-600 font-bold select-all">
            https://muebles-y-articulos-de-belleza.vercel.app/
          </span>
        </div>
      </div>
    </div>
  );
};
