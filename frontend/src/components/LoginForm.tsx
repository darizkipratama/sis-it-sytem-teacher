import React, { useState } from 'react';
import {
  GraduationCap,
  User,
  Lock,
  Eye,
  EyeOff,
  LogIn,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  Sparkles,
  Loader2
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface LoginFormProps {
  onLoginSuccess?: (user: any) => void;
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { login, isLoading: authLoading } = useAuth();
  const [nipOrEmail, setNipOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [infoMsg, setInfoMsg] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setInfoMsg('');

    if (!nipOrEmail.trim()) {
      setErrorMsg('Masukkan NIP atau Email Guru Anda.');
      return;
    }

    if (!password) {
      setErrorMsg('Masukkan kata sandi / Password.');
      return;
    }

    if (password.length < 4) {
      setErrorMsg('Kata sandi minimal 4 karakter.');
      return;
    }

    setIsLoading(true);

    const success = await login(nipOrEmail, password);
    setIsLoading(false);

    if (!success) {
      setErrorMsg('NIP/Email atau kata sandi salah. Silakan coba lagi.');
    } else if (onLoginSuccess) {
      onLoginSuccess(true);
    }
  };

  const handleQuickDemoLogin = async () => {
    setErrorMsg('');
    setInfoMsg('');
    setNipOrEmail('198804122015031002');
    setPassword('guru123');
    setIsLoading(true);

    const success = await login('198804122015031002', 'guru123');
    setIsLoading(false);

    if (!success) {
      setErrorMsg('Demo login gagal. Pastikan backend berjalan di port 8080.');
    } else if (onLoginSuccess) {
      onLoginSuccess(true);
    }
  };

  const handleForgotPassword = () => {
    setInfoMsg('Untuk reset kata sandi, silakan hubungi tim Admin IT Sekolah (Ext. 104 / IT Support).');
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-900 text-slate-100 min-h-0 overflow-y-auto">
      {/* Top Banner Header */}
      <div className="px-6 pt-8 pb-6 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-900 border-b border-slate-800 relative overflow-hidden">
        {/* Glow backdrop effects */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-56 h-56 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Logo Badge */}
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-indigo-500 to-indigo-700 p-0.5 shadow-xl shadow-indigo-950/80 mb-4 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[22px] flex items-center justify-center border border-indigo-500/20">
              <GraduationCap className="w-9 h-9 text-indigo-400" />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-xl font-bold tracking-tight text-white">SEKOLAH IHSAN CLOUD</h1>
            <span className="text-[10px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-semibold">
              v2.5
            </span>
          </div>

          <p className="text-xs text-indigo-300 font-semibold tracking-wide uppercase mb-2">
            Portal Guru & Tenaga Pendidik
          </p>

          <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
            Sistem Informasi Sekolah terintegrasi untuk Jurnal Mengajar, Absensi, dan Assessment.
          </p>
        </div>
      </div>

      {/* Main Login Form Body */}
      <div className="flex-1 px-6 py-6 flex flex-col justify-center max-w-sm mx-auto w-full">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex items-start gap-2.5 text-rose-300 text-xs animate-fadeIn">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold">{errorMsg}</p>
            </div>
          </div>
        )}

        {/* Info Alert */}
        {infoMsg && (
          <div className="mb-4 p-3 bg-indigo-500/10 border border-indigo-500/30 rounded-2xl flex items-start gap-2.5 text-indigo-300 text-xs">
            <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p>{infoMsg}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          {/* NIP / Username / Email Field */}
          <div>
            <label htmlFor="nip-input" className="block text-xs font-semibold text-slate-300 mb-1.5">
              NIP / Username / Email Guru
            </label>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400 pointer-events-none">
                <User className="w-4 h-4" />
              </div>
              <input
                id="nip-input"
                type="text"
                value={nipOrEmail}
                onChange={(e) => setNipOrEmail(e.target.value)}
                placeholder="NIP: 19880412... atau email"
                autoComplete="username"
                inputMode="text"
                className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-4 py-3 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner"
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="password-input" className="block text-xs font-semibold text-slate-300">
                Kata Sandi / Password
              </label>
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-[11px] font-medium text-indigo-400 hover:text-indigo-300 transition cursor-pointer"
              >
                Lupa Password?
              </button>
            </div>
            <div className="relative flex items-center">
              <div className="absolute left-3 text-slate-400 pointer-events-none">
                <Lock className="w-4 h-4" />
              </div>
              <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full bg-slate-950 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-10 py-3 border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 text-slate-400 hover:text-slate-200 transition cursor-pointer"
                title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me Checkbox */}
          <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500/50 accent-indigo-600 cursor-pointer"
              />
              <span className="text-slate-300 font-medium">Ingat saya di perangkat ini</span>
            </label>

            <span className="text-[11px] text-slate-500">TA 2025/2026</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading || authLoading}
            className="w-full bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-500 hover:to-indigo-600 text-white font-semibold text-xs py-3 px-4 rounded-xl shadow-lg shadow-indigo-600/30 hover:shadow-indigo-600/50 flex items-center justify-center gap-2 transition active:scale-[0.99] disabled:opacity-60 cursor-pointer"
          >
            {(isLoading || authLoading) ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>Memverifikasi Akses...</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-white" />
                <span>Masuk Portal Guru</span>
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider text-slate-500">
            <span className="bg-slate-900 px-3 text-slate-400">Atau Gunakan Akses Uji Coba</span>
          </div>
        </div>

        {/* Quick Demo Fill Button */}
        <button
          type="button"
          onClick={handleQuickDemoLogin}
          disabled={isLoading || authLoading}
          className="w-full bg-slate-800/90 hover:bg-slate-800 border border-slate-700 hover:border-indigo-500/50 text-slate-200 hover:text-white font-medium text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-2 transition cursor-pointer group shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span>Masuk sebagai <strong>Pak Ihsan Cloud</strong> (Demo)</span>
        </button>
      </div>

      {/* Footer Security Badge */}
      <div className="px-6 py-4 bg-slate-950 border-t border-slate-800/80 text-center">
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
          <span>Sistem Informasi Terenkripsi</span>
          <span className="text-slate-600">•</span>
          <span className="text-slate-400">Supabase & RabbitMQ Ready</span>
        </div>
      </div>
    </div>
  );
};
