import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Headphones,
  Users,
  HeartHandshake,
  Scale,
  Landmark,
  AlertCircle,
  HelpCircle,
  Check
} from 'lucide-react';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  // Form states
  const [identifier, setIdentifier] = useState('33333333');
  const [password, setPassword] = useState('password123');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [selectedRoleHint, setSelectedRoleHint] = useState('3'); // 3: Trabajador, 2: Admin, 1: Dev

  const handleRoleQuickSelect = (role, defaultId) => {
    setSelectedRoleHint(role);
    setIdentifier(defaultId);
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await login(identifier, password, selectedRoleHint ? parseInt(selectedRoleHint, 10) : null);
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Credenciales incorrectas o usuario no registrado');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error de conexión con el servidor API');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-[#0C0D22] text-[#F5F4FF] overflow-x-hidden flex flex-col justify-between selection:bg-[#6C3AED] selection:text-white">
      {/* Luces y degradados ambientales de fondo */}
      <div className="absolute top-0 left-0 w-[550px] h-[550px] bg-gradient-to-br from-[#6C3AED]/20 via-[#2FAAF7]/10 to-transparent rounded-full blur-3xl pointer-events-none -translate-x-1/3 -translate-y-1/3" />
      <div className="absolute top-1/4 right-0 w-[600px] h-[600px] bg-gradient-to-bl from-[#FFC36C]/10 via-[#6C3AED]/15 to-transparent rounded-full blur-3xl pointer-events-none translate-x-1/4" />
      <div className="absolute bottom-0 left-1/3 w-[800px] h-[400px] bg-gradient-to-t from-[#6C3AED]/15 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* CABECERA INSTITUCIONAL */}
      <header className="relative z-20 w-full px-6 lg:px-12 py-4 flex items-center justify-between border-b border-[#373351]/40 backdrop-blur-md bg-[#0C0D22]/60">
        <div className="flex items-center space-x-4">
          {/* Logo Banderín Perú */}
          <div className="flex items-center space-x-2 bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white px-2.5 py-1 rounded-md shadow-sm border border-red-500/40">
            <span className="font-extrabold text-xs tracking-wider uppercase">PERÚ</span>
            <span className="text-[11px] font-medium text-red-100 hidden sm:inline">Gobierno del Perú</span>
          </div>

          <span className="text-[#373351] font-light text-lg">|</span>

          {/* Municipalidad */}
          <div className="flex items-center space-x-2 text-[#F5F4FF]">
            <Landmark className="w-4 h-4 text-[#2FAAF7]" />
            <span className="text-xs sm:text-sm font-semibold tracking-wide text-slate-200">
              Municipalidad Distrital de Zapillica <span className="text-[#FFC36C] font-bold">&bull; DEMUNA ZAPILLICA</span>
            </span>
          </div>
        </div>

        {/* Indicador de Plataforma Segura */}
        <div className="flex items-center space-x-2 text-xs font-medium text-[#2FAAF7] bg-[#2FAAF7]/10 border border-[#2FAAF7]/20 px-3 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-[#2FAAF7]" />
          <span className="hidden sm:inline text-[#E8E6FC]">Plataforma Institucional Segura</span>
          <span className="sm:hidden text-[#E8E6FC]">Segura</span>
        </div>
      </header>

      {/* CUERPO PRINCIPAL (2 COLUMNAS: 58% y 42%) */}
      <main className="relative z-10 flex-1 grid grid-cols-1 lg:grid-cols-12 w-full max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12 py-6 lg:py-8 gap-8 lg:gap-12 items-center">
        
        {/* ================= PANEL IZQUIERDO (~58% de ancho, lg:col-span-7) ================= */}
        <section className="flex flex-col justify-between h-full lg:col-span-7 space-y-6 pt-2">
          
          <div className="space-y-6">
            {/* Identidad Visual DEMUNA */}
            <div className="flex items-center space-x-4">
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 shrink-0 rounded-2xl p-1 bg-gradient-to-tr from-[#6C3AED] via-[#2FAAF7] to-[#FFC36C] shadow-lg shadow-[#6C3AED]/30">
                <div className="w-full h-full bg-[#15132A] rounded-xl flex items-center justify-center p-1.5 overflow-hidden">
                  <img
                    src="/images/demuna-icon.png"
                    alt="Logo DEMUNA Perú"
                    className="w-full h-full object-contain filter drop-shadow-[0_0_8px_rgba(47,170,247,0.6)]"
                    onError={(e) => {
                      // Fallback si la imagen no cargara
                      e.target.style.display = 'none';
                    }}
                  />
                </div>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white flex items-center space-x-2">
                  <span>DEMUNA</span>
                  <span className="text-[#FFC36C]">ZAPILLICA</span>
                </h1>
                <p className="text-xs sm:text-sm font-medium text-[#B8B7D0] tracking-wide mt-0.5">
                  Defensoría Municipal del Niño, Niña y Adolescente de Zapillica
                </p>
                {/* Línea luminosa decorativa */}
                <div className="h-1 w-24 sm:w-32 bg-gradient-to-r from-[#2FAAF7] via-[#6C3AED] to-transparent rounded-full mt-2" />
              </div>
            </div>

            {/* Frase / Slogan Institucional con barra dorada */}
            <div className="border-l-4 border-[#FFC36C] pl-4 sm:pl-5 space-y-2 py-1">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-white leading-snug tracking-tight">
                Protección, orientación y defensa de los derechos de la niñez y la adolescencia
              </h2>
              <p className="text-xs sm:text-sm text-[#B8B7D0] leading-relaxed max-w-2xl font-normal">
                Atención municipal especializada, cercana y con enfoque de derechos para niñas, niños, adolescentes y sus familias.
              </p>
            </div>

            {/* 4 Servicios Representados Mediante Iconos */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {/* Servicio 1 */}
              <div className="bg-[#191731]/70 border border-[#373351]/80 hover:border-[#6C3AED]/60 transition-all duration-200 rounded-xl p-3 flex flex-col items-center text-center space-y-2 backdrop-blur-sm group hover:bg-[#211F3D]">
                <div className="w-10 h-10 rounded-lg bg-[#6C3AED]/20 border border-[#6C3AED]/30 flex items-center justify-center text-[#814EFF] group-hover:scale-105 transition-transform">
                  <Users className="w-5 h-5 text-[#814EFF]" />
                </div>
                <span className="text-xs font-semibold text-[#F5F4FF] tracking-tight">
                  Protección integral
                </span>
              </div>

              {/* Servicio 2 */}
              <div className="bg-[#191731]/70 border border-[#373351]/80 hover:border-[#2FAAF7]/60 transition-all duration-200 rounded-xl p-3 flex flex-col items-center text-center space-y-2 backdrop-blur-sm group hover:bg-[#211F3D]">
                <div className="w-10 h-10 rounded-lg bg-[#2FAAF7]/20 border border-[#2FAAF7]/30 flex items-center justify-center text-[#2FAAF7] group-hover:scale-105 transition-transform">
                  <HeartHandshake className="w-5 h-5 text-[#2FAAF7]" />
                </div>
                <span className="text-xs font-semibold text-[#F5F4FF] tracking-tight">
                  Apoyo comunitario
                </span>
              </div>

              {/* Servicio 3 */}
              <div className="bg-[#191731]/70 border border-[#373351]/80 hover:border-[#FFC36C]/60 transition-all duration-200 rounded-xl p-3 flex flex-col items-center text-center space-y-2 backdrop-blur-sm group hover:bg-[#211F3D]">
                <div className="w-10 h-10 rounded-lg bg-[#FFC36C]/20 border border-[#FFC36C]/30 flex items-center justify-center text-[#FFC36C] group-hover:scale-105 transition-transform">
                  <Scale className="w-5 h-5 text-[#FFC36C]" />
                </div>
                <span className="text-xs font-semibold text-[#F5F4FF] tracking-tight">
                  Orientación y justicia
                </span>
              </div>

              {/* Servicio 4 */}
              <div className="bg-[#191731]/70 border border-[#373351]/80 hover:border-[#814EFF]/60 transition-all duration-200 rounded-xl p-3 flex flex-col items-center text-center space-y-2 backdrop-blur-sm group hover:bg-[#211F3D]">
                <div className="w-10 h-10 rounded-lg bg-[#6C3AED]/20 border border-[#6C3AED]/30 flex items-center justify-center text-[#814EFF] group-hover:scale-105 transition-transform">
                  <Landmark className="w-5 h-5 text-[#814EFF]" />
                </div>
                <span className="text-xs font-semibold text-[#F5F4FF] tracking-tight">
                  Atención municipal
                </span>
              </div>
            </div>
          </div>

          {/* Ilustración familiar con paisaje peruano en la parte inferior */}
          <div className="relative w-full rounded-2xl overflow-hidden border border-[#373351]/40 shadow-2xl mt-4 group">
            <div className="absolute inset-0 bg-gradient-to-t from-[#0C0D22]/80 via-transparent to-[#0C0D22]/20 z-10 pointer-events-none" />
            <img
              src="/images/family-landscape-pure.jpg"
              alt="Familia peruana en atardecer andino DEMUNA"
              className="w-full h-44 sm:h-52 lg:h-60 object-cover object-center transform group-hover:scale-[1.02] transition-transform duration-700"
            />
            {/* Línea luminosa inferior violeta y dorada */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-gradient-to-r from-[#6C3AED] via-[#2FAAF7] to-[#FFC36C] z-20" />
          </div>

        </section>


        {/* ================= PANEL DERECHO (~42% de ancho, lg:col-span-5) ================= */}
        <section className="w-full lg:col-span-5 flex justify-center py-2">
          
          {/* TARJETA AZUL ÍNDIGO SEMITRANSPARENTE (rounded-24px, borde luminoso) */}
          <div className="relative w-full max-w-[460px] bg-[#191731]/85 backdrop-blur-xl border border-[#373351] hover:border-[#6C3AED]/60 rounded-[24px] p-6 sm:p-8 shadow-[0_0_50px_-10px_rgba(108,58,237,0.35),0_20px_40px_-15px_rgba(2,3,14,0.7)] transition-all duration-300">
            
            {/* Detalle luminoso superior derecho */}
            <div className="absolute -top-px right-12 w-32 h-[2px] bg-gradient-to-r from-transparent via-[#FFC36C] to-transparent opacity-80" />
            <div className="absolute -top-12 -right-12 w-36 h-36 bg-[#FFC36C]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Escudo de Seguridad en la parte superior con candado */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="relative mb-3">
                {/* Halo de resplandor violeta */}
                <div className="absolute inset-0 bg-[#6C3AED] rounded-2xl blur-md opacity-50 animate-pulse" />
                <div className="relative w-14 h-14 rounded-2xl bg-gradient-to-b from-[#211F3D] to-[#15132A] border border-[#6C3AED]/60 shadow-[0_0_20px_rgba(108,58,237,0.5)] flex items-center justify-center">
                  <Lock className="w-6 h-6 text-[#2FAAF7] drop-shadow-[0_0_6px_rgba(47,170,247,0.8)]" />
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[#B8B7D0] text-xs uppercase tracking-wider font-semibold mb-1">
                <span className="w-6 h-px bg-[#373351]" />
                <span>Bienvenido al</span>
                <span className="w-6 h-px bg-[#373351]" />
              </div>

              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                DEMUNA <span className="text-[#FFC36C]">ZAPILLICA</span>
              </h2>
              <p className="text-xs text-[#B8B7D0] mt-1 max-w-xs font-normal">
                Accede a la plataforma institucional de la DEMUNA ZAPILLICA.
              </p>

              {/* Selector Rápido de Rol / Usuario para pruebas */}
              <div className="mt-4 flex items-center justify-center space-x-1.5 p-1 bg-[#15132A] border border-[#373351] rounded-xl text-[11px]">
                <button
                  type="button"
                  onClick={() => handleRoleQuickSelect('3', '33333333')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedRoleHint === '3'
                      ? 'bg-[#6C3AED] text-white shadow-sm'
                      : 'text-[#B8B7D0] hover:text-white'
                  }`}
                >
                  Trabajador
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleQuickSelect('2', '22222222')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedRoleHint === '2'
                      ? 'bg-[#6C3AED] text-white shadow-sm'
                      : 'text-[#B8B7D0] hover:text-white'
                  }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => handleRoleQuickSelect('1', '11111111')}
                  className={`px-2.5 py-1 rounded-lg font-medium transition-all ${
                    selectedRoleHint === '1'
                      ? 'bg-[#6C3AED] text-white shadow-sm'
                      : 'text-[#B8B7D0] hover:text-white'
                  }`}
                >
                  Desarrollador
                </button>
              </div>
            </div>

            {/* Mensaje de Error */}
            {error && (
              <div className="mb-5 p-3.5 bg-red-950/60 border border-red-500/50 rounded-xl flex items-center space-x-2 text-red-200 text-xs animate-shake">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span>{error}</span>
              </div>
            )}

            {/* FORMULARIO DE ACCESO */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Campo: Correo Institucional / DNI */}
              <div>
                <label className="flex items-center space-x-2 text-xs font-semibold text-[#F5F4FF] mb-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#2FAAF7]" />
                  <span>Correo institucional o DNI</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="Ingresa tu correo institucional o DNI"
                    className="w-full px-3.5 py-2.5 bg-[#15132A] border border-[#373351] hover:border-[#4B4269] focus:border-[#6C3AED] focus:ring-2 focus:ring-[#6C3AED]/30 rounded-xl text-sm text-white placeholder-[#918CA9] outline-none transition-all duration-200 font-normal"
                  />
                </div>
              </div>

              {/* Campo: Contraseña */}
              <div>
                <label className="flex items-center space-x-2 text-xs font-semibold text-[#F5F4FF] mb-1.5">
                  <Lock className="w-3.5 h-3.5 text-[#2FAAF7]" />
                  <span>Contraseña</span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Ingresa tu contraseña"
                    className="w-full pl-3.5 pr-10 py-2.5 bg-[#15132A] border border-[#373351] hover:border-[#4B4269] focus:border-[#6C3AED] focus:ring-2 focus:ring-[#6C3AED]/30 rounded-xl text-sm text-white placeholder-[#918CA9] outline-none transition-all duration-200 font-normal"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-[#918CA9] hover:text-[#F5F4FF] transition-colors focus:outline-none"
                    aria-label={showPassword ? 'Ocultar contraseña' : 'Ver contraseña'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Fila: Recordarme y ¿Olvidaste tu contraseña? */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center space-x-2 cursor-pointer select-none group">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded bg-[#15132A] border-[#373351] text-[#6C3AED] focus:ring-0 focus:ring-offset-0 cursor-pointer accent-[#6C3AED]"
                  />
                  <span className="text-[#B8B7D0] group-hover:text-white transition-colors">
                    Recordarme
                  </span>
                </label>

                <Link
                  to="/recuperar-password"
                  className="text-[#2FAAF7] hover:text-[#814EFF] transition-colors font-medium hover:underline"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>

              {/* Botón Principal: Iniciar sesión */}
              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-gradient-to-r from-[#814EFF] via-[#6C3AED] to-[#5228B8] hover:from-[#9264FF] hover:via-[#814EFF] hover:to-[#6C3AED] text-white font-bold text-sm rounded-xl shadow-[0_10px_25px_-5px_rgba(108,58,237,0.5)] hover:shadow-[0_12px_28px_-4px_rgba(108,58,237,0.65)] active:scale-[0.99] transition-all duration-200 flex items-center justify-center space-x-2 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
              >
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Iniciar sesión</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {/* Aviso de Confidencialidad y Seguridad */}
              <div className="pt-2 text-center space-y-1">
                <div className="flex items-center justify-center space-x-1.5 text-xs text-[#2FAAF7]">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="font-semibold text-[#E8E6FC]">Acceso seguro y confidencial</span>
                </div>
                <p className="text-[11px] text-[#918CA9]">
                  Tu información está protegida y es de uso institucional.
                </p>
              </div>

              {/* Botón: Mesa de Ayuda */}
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setShowHelpModal(true)}
                  className="w-full py-2.5 px-3 bg-[#15132A] hover:bg-[#211F3D] border border-[#373351] hover:border-[#6C3AED]/50 rounded-xl text-xs font-semibold text-[#F5F4FF] transition-all flex items-center justify-center space-x-2 group"
                >
                  <Headphones className="w-4 h-4 text-[#2FAAF7] group-hover:scale-110 transition-transform" />
                  <span>Mesa de ayuda</span>
                </button>
              </div>
            </form>
          </div>

        </section>

      </main>

      {/* PIE INSTITUCIONAL */}
      <footer className="relative z-10 w-full py-3 px-6 text-center text-xs text-[#918CA9] border-t border-[#373351]/30">
        <p>DEMUNA ZAPILLICA — Desarrollado para la Municipalidad Distrital de Zapillica &bull; MIMP Perú &copy; {new Date().getFullYear()}</p>
      </footer>

      {/* MODAL MESA DE AYUDA */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-[#191731] border border-[#373351] rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <h3 className="text-lg font-bold text-white flex items-center space-x-2 mb-2">
              <Headphones className="w-5 h-5 text-[#2FAAF7]" />
              <span>Mesa de Ayuda Institucional</span>
            </h3>
            <p className="text-xs text-[#B8B7D0] mb-4">
              Si tienes problemas para acceder a DEMUNA ZAPILLICA o necesitas restablecer tu contraseña:
            </p>

            <div className="space-y-3 text-xs bg-[#15132A] p-3.5 rounded-xl border border-[#373351] mb-5">
              <div className="flex justify-between">
                <span className="text-[#918CA9]">Área encargada:</span>
                <span className="text-white font-medium">Subgerencia de TI / DEMUNA Zapillica</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#918CA9]">Correo de soporte:</span>
                <span className="text-[#2FAAF7] font-medium">soporte.demuna@gob.pe</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#918CA9]">Teléfono / Central:</span>
                <span className="text-[#FFC36C] font-medium">(073) 371-234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#918CA9]">Horario de atención:</span>
                <span className="text-white font-medium">Lunes a Viernes 8:00 AM - 5:00 PM</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full py-2.5 bg-[#6C3AED] hover:bg-[#814EFF] text-white text-xs font-bold rounded-xl transition-all"
            >
              Entendido / Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
