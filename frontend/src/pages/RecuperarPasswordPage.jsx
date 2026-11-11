import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  RotateCcw
} from 'lucide-react';

export const RecuperarPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Paso actual: 1 = Pedir email/DNI, 2 = Ingresar código, 3 = Nueva contraseña, 4 = Éxito
  const [step, setStep] = useState(1);

  // Campos de formulario
  const [identifier, setIdentifier] = useState('');
  const [code, setCode] = useState('');
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Estados de interfaz
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [workerName, setWorkerName] = useState('');

  // Si llega por URL con token y/o code
  useEffect(() => {
    const urlToken = searchParams.get('token');
    const urlCode = searchParams.get('code');

    if (urlToken || urlCode) {
      if (urlToken) setToken(urlToken);
      if (urlCode) setCode(urlCode);

      // Si viene con código, verificarlo automáticamente
      if (urlCode) {
        verifyCodeAutomatic(urlCode, urlToken);
      } else {
        setStep(2);
      }
    }
  }, [searchParams]);

  const verifyCodeAutomatic = async (codeToVerify, tokenToVerify) => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.post(ENDPOINTS.VERIFY_RESET_CODE, {
        code: codeToVerify,
        token: tokenToVerify || undefined
      });
      if (res.data?.success) {
        setWorkerName(res.data.data?.worker || '');
        if (res.data.data?.token) setToken(res.data.data.token);
        setStep(3);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'El enlace o código es inválido o ha expirado.');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  // Paso 1: Enviar solicitud de código
  const handleRequestCode = async (e) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Por favor ingresa tu correo institucional o DNI.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post(ENDPOINTS.FORGOT_PASSWORD, {
        emailOrDni: identifier.trim()
      });

      if (res.data?.success) {
        setMaskedEmail(res.data.data?.maskedEmail || '');
        if (res.data.data?.token) setToken(res.data.data.token);
        setSuccessMsg('Hemos enviado un código de seguridad de 6 dígitos a tu correo.');
        setStep(2);
      } else {
        setError(res.data?.message || 'No se pudo procesar la solicitud.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al comunicarse con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Paso 2: Verificar código de 6 dígitos
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    if (!code.trim() || code.trim().length !== 6) {
      setError('Por favor ingresa el código de 6 dígitos que recibiste.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post(ENDPOINTS.VERIFY_RESET_CODE, {
        code: code.trim(),
        token: token || undefined
      });

      if (res.data?.success) {
        setWorkerName(res.data.data?.worker || '');
        if (res.data.data?.token) setToken(res.data.data.token);
        setStep(3);
      } else {
        setError(res.data?.message || 'Código incorrecto o expirado.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Código incorrecto o expirado.');
    } finally {
      setLoading(false);
    }
  };

  // Paso 3: Restablecer contraseña
  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError('La contraseña debe tener un mínimo de 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden. Verifícalas e inténtalo nuevamente.');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const res = await apiClient.post(ENDPOINTS.RESET_PASSWORD, {
        token: token || undefined,
        code: code || undefined,
        newPassword,
        confirmPassword
      });

      if (res.data?.success) {
        setStep(4);
      } else {
        setError(res.data?.message || 'No se pudo restablecer la contraseña.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error al actualizar la contraseña.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0C0D22] text-[#F5F4FF] flex flex-col justify-between selection:bg-[#6C3AED] selection:text-white overflow-x-hidden">
      {/* Luces y degradados ambientales de fondo */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#6C3AED]/20 via-[#2FAAF7]/10 to-transparent rounded-full blur-3xl pointer-events-none -translate-y-1/2" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-tl from-[#FFC36C]/10 via-[#6C3AED]/15 to-transparent rounded-full blur-3xl pointer-events-none translate-y-1/3" />

      {/* CABECERA INSTITUCIONAL */}
      <header className="relative z-20 w-full px-6 lg:px-12 py-4 flex items-center justify-between border-b border-[#373351]/40 backdrop-blur-md bg-[#0C0D22]/60">
        <Link to="/login" className="flex items-center space-x-3 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#6C3AED] to-[#2FAAF7] p-0.5 shadow-md shadow-[#6C3AED]/30">
            <div className="w-full h-full bg-[#15132A] rounded-[10px] flex items-center justify-center">
              <img src="/images/demuna-icon.png" alt="Logo DEMUNA" className="w-5 h-5 object-contain" />
            </div>
          </div>
          <span className="font-bold text-white text-base tracking-tight group-hover:text-[#2FAAF7] transition-colors">
            DEMUNA <span className="text-[#FFC36C]">ZAPILLICA</span>
          </span>
        </Link>

        <Link
          to="/login"
          className="flex items-center space-x-1.5 text-xs font-semibold text-[#B8B7D0] hover:text-white transition-colors bg-[#191731] border border-[#373351] px-3 py-1.5 rounded-xl hover:border-[#6C3AED]/50"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Volver al Login</span>
        </Link>
      </header>

      {/* CUERPO CENTRAL */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[480px] bg-[#191731]/90 backdrop-blur-xl border border-[#373351] rounded-[24px] p-6 sm:p-9 shadow-[0_0_50px_-10px_rgba(108,58,237,0.35),0_20px_40px_-15px_rgba(2,3,14,0.7)] relative">
          
          {/* Acento luminoso en borde superior */}
          <div className="absolute -top-px left-1/4 right-1/4 h-[2px] bg-gradient-to-r from-transparent via-[#6C3AED] to-transparent" />

          {/* Icono central de seguridad */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="relative mb-3">
              <div className="absolute inset-0 bg-[#6C3AED] rounded-2xl blur-md opacity-40 animate-pulse" />
              <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-[#211F3D] to-[#15132A] border border-[#6C3AED]/60 shadow-[0_0_20px_rgba(108,58,237,0.5)] flex items-center justify-center">
                {step === 4 ? (
                  <CheckCircle2 className="w-7 h-7 text-[#38D7A7]" />
                ) : (
                  <KeyRound className="w-6 h-6 text-[#2FAAF7] drop-shadow-[0_0_6px_rgba(47,170,247,0.8)]" />
                )}
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Recuperar Contraseña
            </h1>
            <p className="text-xs text-[#B8B7D0] mt-1 max-w-xs font-normal">
              {step === 1 && 'Ingresa tu correo institucional o DNI registrado para recibir tu código de acceso.'}
              {step === 2 && 'Ingresa el código de 6 dígitos que enviamos a tu bandeja de entrada.'}
              {step === 3 && 'Establece tu nueva contraseña segura para ingresar a la plataforma.'}
              {step === 4 && 'Tu contraseña ha sido actualizada con éxito.'}
            </p>
          </div>

          {/* Alerta de Error */}
          {error && (
            <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl flex items-center space-x-2 text-red-200 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{error}</span>
            </div>
          )}

          {/* ================= PASO 1: SOLICITAR CÓDIGO ================= */}
          {step === 1 && (
            <form onSubmit={handleRequestCode} className="space-y-4">
              <div>
                <label className="flex items-center space-x-2 text-xs font-semibold text-[#F5F4FF] mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#2FAAF7]" />
                  <span>Correo institucional o DNI</span>
                </label>
                <input
                  type="text"
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="ej. 33333333 o trabajador@demuna.gob.pe"
                  className="w-full px-3.5 py-2.5 bg-[#15132A] border border-[#373351] hover:border-[#4B4269] focus:border-[#6C3AED] focus:ring-2 focus:ring-[#6C3AED]/30 rounded-xl text-sm text-white placeholder-[#918CA9] outline-none transition-all duration-200"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#814EFF] via-[#6C3AED] to-[#5228B8] hover:from-[#9264FF] hover:via-[#814EFF] hover:to-[#6C3AED] text-white font-bold text-sm rounded-xl shadow-[0_10px_25px_-5px_rgba(108,58,237,0.5)] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Enviar código de seguridad</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= PASO 2: INGRESAR CÓDIGO ================= */}
          {step === 2 && (
            <form onSubmit={handleVerifyCode} className="space-y-4">
              {maskedEmail && (
                <div className="p-3 bg-[#15132A] border border-[#373351] rounded-xl text-xs text-[#B8B7D0] text-center">
                  Código enviado a: <strong className="text-[#FFC36C] font-mono">{maskedEmail}</strong>
                </div>
              )}

              <div>
                <label className="flex items-center justify-center space-x-2 text-xs font-semibold text-[#F5F4FF] mb-2">
                  <KeyRound className="w-3.5 h-3.5 text-[#2FAAF7]" />
                  <span>Código de 6 dígitos</span>
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  autoFocus
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="w-full text-center tracking-[12px] font-mono text-2xl py-3 bg-[#15132A] border border-[#6C3AED]/60 focus:border-[#2FAAF7] focus:ring-2 focus:ring-[#2FAAF7]/30 rounded-xl text-[#FFC36C] placeholder-[#918CA9]/40 outline-none transition-all"
                />
                <p className="text-[11px] text-[#918CA9] text-center mt-1.5">
                  El código tiene una validez de 15 minutos.
                </p>
              </div>

              <button
                type="submit"
                disabled={loading || code.length !== 6}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#814EFF] via-[#6C3AED] to-[#5228B8] text-white font-bold text-sm rounded-xl shadow-[0_10px_25px_-5px_rgba(108,58,237,0.5)] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Verificar código</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-[#B8B7D0] hover:text-white flex items-center space-x-1"
                >
                  <ArrowLeft className="w-3 h-3" />
                  <span>Cambiar correo o DNI</span>
                </button>

                <button
                  type="button"
                  disabled={loading}
                  onClick={handleRequestCode}
                  className="text-xs text-[#2FAAF7] hover:underline flex items-center space-x-1"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Reenviar código</span>
                </button>
              </div>
            </form>
          )}

          {/* ================= PASO 3: NUEVA CONTRASEÑA ================= */}
          {step === 3 && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              {workerName && (
                <div className="p-3 bg-[#15132A] border border-[#373351] rounded-xl text-xs text-[#B8B7D0] text-center">
                  Restableciendo contraseña para: <strong className="text-white">{workerName}</strong>
                </div>
              )}

              <div>
                <label className="flex items-center space-x-2 text-xs font-semibold text-[#F5F4FF] mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#2FAAF7]" />
                  <span>Nueva contraseña</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#15132A] border border-[#373351] hover:border-[#4B4269] focus:border-[#6C3AED] focus:ring-2 focus:ring-[#6C3AED]/30 rounded-xl text-sm text-white placeholder-[#918CA9] outline-none transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#918CA9] hover:text-[#F5F4FF]"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="flex items-center space-x-2 text-xs font-semibold text-[#F5F4FF] mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#2FAAF7]" />
                  <span>Confirmar nueva contraseña</span>
                </label>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  minLength={6}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  className="w-full px-3.5 py-2.5 bg-[#15132A] border border-[#373351] hover:border-[#4B4269] focus:border-[#6C3AED] focus:ring-2 focus:ring-[#6C3AED]/30 rounded-xl text-sm text-white placeholder-[#918CA9] outline-none transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#814EFF] via-[#6C3AED] to-[#5228B8] text-white font-bold text-sm rounded-xl shadow-[0_10px_25px_-5px_rgba(108,58,237,0.5)] transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Actualizar contraseña</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= PASO 4: ÉXITO ================= */}
          {step === 4 && (
            <div className="text-center space-y-5 py-4">
              <div className="w-16 h-16 bg-[#38D7A7]/20 border border-[#38D7A7]/40 text-[#38D7A7] rounded-full flex items-center justify-center mx-auto shadow-lg shadow-[#38D7A7]/20">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-white">¡Contraseña actualizada!</h3>
                <p className="text-xs text-[#B8B7D0] mt-1.5 leading-relaxed">
                  Tu nueva contraseña ha sido guardada de forma segura. Ya puedes ingresar a DEMUNA ZAPILLICA con tus nuevas credenciales.
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/login')}
                className="w-full py-3 px-4 bg-gradient-to-r from-[#814EFF] via-[#6C3AED] to-[#5228B8] text-white font-bold text-sm rounded-xl shadow-[0_10px_25px_-5px_rgba(108,58,237,0.5)] transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>Ir al Inicio de Sesión</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* Footer de la tarjeta */}
          <div className="mt-6 pt-4 border-t border-[#373351]/50 text-center flex items-center justify-center space-x-1.5 text-xs text-[#918CA9]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2FAAF7]" />
            <span>Proceso encriptado con seguridad institucional SSL</span>
          </div>

        </div>
      </main>

      {/* PIE INSTITUCIONAL */}
      <footer className="relative z-10 w-full py-3 px-6 text-center text-xs text-[#918CA9] border-t border-[#373351]/30">
        <p>DEMUNA ZAPILLICA — Desarrollado para la Municipalidad Distrital de Zapillica &bull; MIMP &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
};

