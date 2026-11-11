import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../api/endpoints';
import {
  FileText,
  Download,
  Printer,
  BarChart2,
  CheckCircle2,
  Calendar,
  Shield,
  Scale,
  Users,
  DollarSign,
  ClipboardList,
  Eye,
  RefreshCw,
  Search,
  Filter,
  Folder,
  ExternalLink,
  Check,
  Sparkles,
  X,
  Building2,
  BookOpen,
  Award,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  User,
  Clock,
  ChevronRight,
  ShieldCheck,
  Send
} from 'lucide-react';

export const ReportesPage = () => {
  // State
  const [activeTab, setActiveTab] = useState('mimp'); // 'mimp' | 'generator' | 'history' | 'normativa'
  const [year, setYear] = useState(new Date().getFullYear());
  const [quarter, setQuarter] = useState('all'); // 'all', '1', '2', '3', '4'
  const [mimpData, setMimpData] = useState(null);
  const [loadingMimp, setLoadingMimp] = useState(true);

  // Document history state
  const [actasHistory, setActasHistory] = useState([]);
  const [loadingActas, setLoadingActas] = useState(false);
  const [historySearch, setHistorySearch] = useState('');
  const [historyFilter, setHistoryFilter] = useState('all');

  // Expedientes for PDF generation
  const [expedientesList, setExpedientesList] = useState([]);
  const [selectedExpedienteId, setSelectedExpedienteId] = useState('');

  // PDF Preview & Generation Modal
  const [showDocModal, setShowDocModal] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [docFormData, setDocFormData] = useState({
    docNumber: '001-2026',
    date: new Date().toISOString().split('T')[0],
    city: 'Zapillica',
    solicitante: '',
    invitado: '',
    nna: '',
    defensor: 'Defensor Responsable DEMUNA Zapillica',
    materia: 'Pensión de Alimentos y Régimen de Visitas',
    acuerdo: 'Las partes acuerdan fijar una pensión de alimentos mensual y voluntaria por la suma de S/ 450.00 (Cuatrocientos cincuenta con 00/100 soles), a depositarse los primeros cinco días de cada mes.',
    observaciones: 'El presente documento se emite con arreglo al Código de los Niños y Adolescentes y la normativa vigente del MIMP.'
  });

  // Toast feedback
  const [toastMessage, setToastMessage] = useState(null);
  const [savingMimp, setSavingMimp] = useState(false);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3800);
  };

  // 1. Fetch MIMP Report Data
  const fetchMimpReport = async () => {
    setLoadingMimp(true);
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const params = { year };
      if (quarter !== 'all') params.quarter = quarter;

      const res = await axios.get(`${API_BASE_URL}${ENDPOINTS.MIMP_REPORT}`, { headers, params });
      if (res.data?.data) {
        setMimpData(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching MIMP report data:', err);
      showToast('Error al cargar datos estadísticos del MIMP');
    } finally {
      setLoadingMimp(false);
    }
  };

  // 2. Fetch Issued Actas / Documents History
  const fetchActasHistory = async () => {
    setLoadingActas(true);
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}${ENDPOINTS.ACTAS}?category=all`, { headers });
      if (res.data?.data) {
        setActasHistory(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching actas history:', err);
    } finally {
      setLoadingActas(false);
    }
  };

  // 3. Fetch Expedientes for Document Generator
  const fetchExpedientes = async () => {
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await axios.get(`${API_BASE_URL}${ENDPOINTS.EXPEDIENTES}`, { headers });
      if (res.data?.data) {
        setExpedientesList(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching expedientes:', err);
    }
  };

  useEffect(() => {
    fetchMimpReport();
  }, [year, quarter]);

  useEffect(() => {
    fetchExpedientes();
    fetchActasHistory();
  }, []);

  // Templates catalog (15 Official MIMP formats)
  const templatesCatalog = [
    {
      id: 'f9a',
      code: 'FORMATO F-09A',
      title: 'Acta de Conciliación con Acuerdo Total',
      category: 'conciliacion',
      icon: Scale,
      color: 'from-[#6c3aed] to-[#8b59f6]',
      description: 'Documento resolutivo con valor de título ejecutivo sobre pensión de alimentos, tenencia y régimen de visitas.',
      defaultMateria: 'Pensión de Alimentos, Tenencia y Régimen de Visitas',
      defaultAcuerdo: 'PRIMERO: Don(ña) [Invitado] se compromete a abonar la suma mensual de S/ 400.00 por concepto de pensión de alimentos en favor de su menor hijo(a).\nSEGUNDO: La tenencia y custodia legal permanecerá a cargo de la madre.\nTERCERO: Se fija régimen de visitas abierto y coordinado los fines de semana.'
    },
    {
      id: 'f10',
      code: 'FORMATO F-10',
      title: 'Acta de Compromiso Familiar',
      category: 'compromiso',
      icon: Users,
      color: 'from-[#ffc36c] to-[#f59e0b]',
      description: 'Acuerdo de convivencia pacífica, normas de conducta parental y protección integral del entorno del NNA.',
      defaultMateria: 'Normas de Conducta y Convivencia Familiar',
      defaultAcuerdo: 'Las partes asumen el compromiso formal de mantener un trato respetuoso, abstenerse de conductas que afecten el bienestar emocional del menor y garantizar su asistencia escolar ininterrumpida.'
    },
    {
      id: 'f4',
      code: 'FORMATO F-04',
      title: 'Primera Invitación a Conciliar',
      category: 'invitacion',
      icon: Calendar,
      color: 'from-[#2faaf7] to-[#0284c7]',
      description: 'Cédula formal de citación a audiencia conciliatoria en la sede de la DEMUNA con apercibimiento de ley.',
      defaultMateria: 'Audiencia de Conciliación Extrajudicial',
      defaultAcuerdo: 'Se le cita formalmente a la audiencia extrajudicial que tendrá lugar el día fijado en el local institucional de la DEMUNA ZAPILLICA, a fin de tratar materias relativas al bienestar de su menor hijo(a).'
    },
    {
      id: 'f5',
      code: 'FORMATO F-05',
      title: 'Segunda Invitación a Conciliar',
      category: 'invitacion',
      icon: Calendar,
      color: 'from-[#3b82f6] to-[#1d4ed8]',
      description: 'Reiteración de citación tras primera inasistencia, con advertencia de conclusión por falta de acuerdo o derivación judicial.',
      defaultMateria: 'Segunda Citación con Apercibimiento Legal',
      defaultAcuerdo: 'Por segunda y última vez, se le convoca a la audiencia de conciliación. De no concurrir, se expedirá el acta de inasistencia respectiva dejando a salvo el derecho de la parte solicitante de acudir a la vía judicial.'
    },
    {
      id: 'f8c',
      code: 'FORMATO F-08C',
      title: 'Acta de Inasistencia de Ambas Partes',
      category: 'inasistencia',
      icon: AlertCircle,
      color: 'from-[#ef4444] to-[#dc2626]',
      description: 'Constancia oficial de frustración del trámite conciliatorio por no apersonamiento de las partes citadas.',
      defaultMateria: 'Conclusión de Audiencia por Inasistencia',
      defaultAcuerdo: 'Habiendo transcurrido el plazo de tolerancia reglamentaria sin que se hayan apersonado ni el solicitante ni la parte invitada, se da por concluido el procedimiento conciliatorio.'
    },
    {
      id: 'f1',
      code: 'FORMATO F-01',
      title: 'Ficha de Recepción de Caso',
      category: 'fichas',
      icon: ClipboardList,
      color: 'from-[#10b981] to-[#059669]',
      description: 'Registro inicial de apertura de caso, datos del informante/solicitante y presunta afectación detectada.',
      defaultMateria: 'Apertura y Calificación del Caso',
      defaultAcuerdo: 'Se recepciona formalmente la solicitud y se dispone la apertura del expediente de atención tutelar, derivándose a las áreas de psicología y trabajo social.'
    },
    {
      id: 'f2',
      code: 'FORMATO F-02',
      title: 'Ficha de Entrevista Psicológica y Social',
      category: 'fichas',
      icon: User,
      color: 'from-[#8b5cf6] to-[#6d28d9]',
      description: 'Evaluación técnica del estado socioemocional del menor de edad y dinámica del núcleo familiar.',
      defaultMateria: 'Evaluación Psicológica del NNA',
      defaultAcuerdo: 'Se concluye que el NNA presenta un entorno afectivo estable pero requiere fortalecimiento en la comunicación parental y pautas de crianza positiva.'
    },
    {
      id: 'f3',
      code: 'FORMATO F-03',
      title: 'Ficha de Visita Domiciliaria',
      category: 'fichas',
      icon: MapPin,
      color: 'from-[#06b6d4] to-[#0891b2]',
      description: 'Acta de inspección ocular en el domicilio del menor para verificar condiciones de habitabilidad y seguridad.',
      defaultMateria: 'Constatación Domiciliaria de Entorno',
      defaultAcuerdo: 'Constituidos en el domicilio señalado, se constata que el menor cuenta con espacio propio, servicios básicos y cuidado regular por parte de su progenitora.'
    },
    {
      id: 'f11',
      code: 'FORMATO F-11',
      title: 'Ficha de Seguimiento y Monitoreo del NNA',
      category: 'fichas',
      icon: CheckCircle2,
      color: 'from-[#14b8a6] to-[#0f766e]',
      description: 'Verificación del cumplimiento de los acuerdos de pensión, tenencia y escolaridad asumidos en acta.',
      defaultMateria: 'Monitoreo Semestral del Acuerdo',
      defaultAcuerdo: 'Se corrobora el cumplimiento puntual de la pensión convenida y la adecuada asistencia escolar y médica del menor tutelado.'
    },
    {
      id: 'f7',
      code: 'FORMATO F-07',
      title: 'Oficio de Derivación a Fiscalía / Juzgado',
      category: 'derivacion',
      icon: Send,
      color: 'from-[#f97316] to-[#ea580c]',
      description: 'Remisión de expediente a Fiscalía de Familia, Juzgado Mixto o Centro Emergencia Mujer (CEM).',
      defaultMateria: 'Derivación por Competencia Legal Exclusiva',
      defaultAcuerdo: 'Por existir presuntos hechos que configuran riesgo de desprotección o violencia, se remiten los actuados originales a la Fiscalía Provincial Civil y de Familia.'
    },
    {
      id: 'caratula',
      code: 'CARÁTULA EXP',
      title: 'Carátula Oficial 360° del Expediente',
      category: 'expediente',
      icon: Folder,
      color: 'from-[#6366f1] to-[#4338ca]',
      description: 'Hoja de portada institucional para legajo físico con código único, partes, materia y control de folios.',
      defaultMateria: 'Expediente Tutelar Completo',
      defaultAcuerdo: 'Legajo oficial foliado y custodiado en el Archivo Central de la DEMUNA ZAPILLICA conforme al Reglamento de la Ley N° 27337.'
    }
  ];

  // When selecting an expediente in the PDF modal, auto-fill form data
  const handleSelectExpediente = (expId) => {
    setSelectedExpedienteId(expId);
    if (!expId) return;

    const found = expedientesList.find(e => String(e.id || e.IdExpediente) === String(expId));
    if (found) {
      setDocFormData(prev => ({
        ...prev,
        docNumber: `${found.code || found.NombreExpediente || 'EXP-2026'}-ACT`,
        solicitante: found.applicantName || found.Solicitante || prev.solicitante,
        invitado: found.suspectName || found.Invitado || prev.invitado,
        nna: found.childName || found.NNA || prev.nna,
        materia: found.subject || found.Descripcion || prev.materia
      }));
    }
  };

  // Open Document Generator Modal
  const handleOpenDocModal = (tmpl) => {
    setSelectedTemplate(tmpl);
    setDocFormData({
      docNumber: `001-2026-DEMUNA/MDZ`,
      date: new Date().toISOString().split('T')[0],
      city: 'Zapillica',
      solicitante: 'María Luisa Jiménez Castillo',
      invitado: 'José Alberto Ruiz Benítez',
      nna: 'Carlos Daniel Ruiz Jiménez (8 años)',
      defensor: 'Abog. Coordinador Responsable DEMUNA Zapillica',
      materia: tmpl.defaultMateria,
      acuerdo: tmpl.defaultAcuerdo,
      observaciones: 'El presente acto se celebra de forma libre, voluntaria y con arreglo a la Directiva N° 001-2022-MIMP sobre Conciliación Extrajudicial en DEMUNA.'
    });
    setSelectedExpedienteId('');
    setShowDocModal(true);
  };

  // Print Document (Opens browser print with CSS media print rules)
  const handlePrintDocument = () => {
    window.print();
  };

  // Save MIMP Consolidated Report to Database
  const handleSaveMimpConsolidated = async () => {
    if (!mimpData) return;
    setSavingMimp(true);
    try {
      const token = localStorage.getItem('demuna_token') || localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};

      const payload = {
        year,
        telefono_dna: '073-371018',
        email_dna: 'demuna@munizapillica.gob.pe',
        ubicacion: 'Zapillica - Ayabaca - Piura',
        reportData: mimpData
      };

      await axios.post(`${API_BASE_URL}${ENDPOINTS.MIMP_REPORT_SAVE}`, payload, { headers });
      showToast(`Consolidado Estadístico MIMP del año ${year} archivado con éxito en la base de datos.`);
    } catch (err) {
      console.error(err);
      showToast('Error al archivar consolidado');
    } finally {
      setSavingMimp(false);
    }
  };

  // Export MIMP CSV
  const handleExportMimpCSV = () => {
    if (!mimpData) return;

    const rows = [
      ['SECCIÓN', 'INDICADOR MIMP', 'VALOR'],
      ['Capítulo I: Casos', 'Total Casos Nuevos Ingresados', mimpData.casos.received],
      ['Capítulo I: Casos', 'Casos Concluidos con Acuerdo Extrajudicial', mimpData.casos.concludedAcuerdo],
      ['Capítulo I: Casos', 'Casos Derivados a Fiscalía / Juzgados', mimpData.casos.concludedDerivado],
      ['Capítulo I: Casos', 'Casos en Trámite / Activos', mimpData.casos.inProcess],
      ['Capítulo I: Casos', 'Casos Desistidos / Archivados', mimpData.casos.dropped],
      ['Capítulo II: Materias', 'Pensión de Alimentos', mimpData.materias.alimentos],
      ['Capítulo II: Materias', 'Tenencia y Custodia', mimpData.materias.tenencia],
      ['Capítulo II: Materias', 'Régimen de Visitas', mimpData.materias.visitas],
      ['Capítulo II: Materias', 'Reconocimiento Voluntario de Filiación', mimpData.materias.reconocimiento],
      ['Capítulo II: Materias', 'Normas de Conducta y Convivencia', mimpData.materias.normasConducta],
      ['Capítulo II: Materias', 'Riesgo o Presunta Vulneración de Derechos', mimpData.materias.vulneracion],
      ['Capítulo III: Beneficiarios NNA', 'Total Niñas, Niños y Adolescentes Tutelados', mimpData.poblacion.total],
      ['Capítulo III: Beneficiarios NNA', 'Niñas (Femenino)', mimpData.poblacion.ninas],
      ['Capítulo III: Beneficiarios NNA', 'Niños (Masculino)', mimpData.poblacion.ninos],
      ['Capítulo III: Beneficiarios NNA', 'Primera Infancia (0 a 5 años)', mimpData.poblacion.age0_5],
      ['Capítulo III: Beneficiarios NNA', 'Niñez (6 a 11 años)', mimpData.poblacion.age6_11],
      ['Capítulo III: Beneficiarios NNA', 'Adolescencia (12 a 17 años)', mimpData.poblacion.age12_17],
      ['Capítulo IV: Pensiones', 'Monto Total Recaudado en Pensiones (S/)', mimpData.pensiones.totalCollected],
      ['Capítulo IV: Pensiones', 'Cantidad de Recibos / Pagos Realizados', mimpData.pensiones.countPayments],
      ['Capítulo V: Actuaciones', 'Total Actas y Documentos Suscritos', mimpData.actuaciones.totalActas],
      ['Capítulo V: Actuaciones', 'Actas de Conciliación con Acuerdo (F9A)', mimpData.actuaciones.conciliaciones],
      ['Capítulo V: Actuaciones', 'Actas de Compromiso Familiar (F10)', mimpData.actuaciones.compromisos],
      ['Capítulo V: Actuaciones', 'Cédulas de Invitación Emitidas (F4/F5)', mimpData.actuaciones.invitaciones],
      ['Capítulo V: Actuaciones', 'Actas de Inasistencia (F8)', mimpData.actuaciones.inasistencias],
      ['Capítulo V: Actuaciones', 'Fichas de Recepción de Caso (F1)', mimpData.actuaciones.recepcionF1],
      ['Capítulo V: Actuaciones', 'Fichas de Entrevista Psicológica (F2)', mimpData.actuaciones.entrevistasF2],
      ['Capítulo V: Actuaciones', 'Fichas de Visita Domiciliaria (F3)', mimpData.actuaciones.visitasF3],
      ['Capítulo V: Actuaciones', 'Fichas de Seguimiento y Monitoreo (F11)', mimpData.actuaciones.seguimientoF11],
    ];

    const csvContent = '\uFEFF' + rows.map(r => r.join(';')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `DEMUNA_MIMP_Ficha_Estadistica_${year}_${quarter}.csv`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 500);
    showToast('Ficha Estadística MIMP descargada en CSV.');
  };

  // Filtered actas history
  const filteredActasHistory = useMemo(() => {
    return actasHistory.filter(act => {
      if (historyFilter !== 'all' && String(act.typeId) !== String(historyFilter)) return false;
      if (historySearch.trim()) {
        const q = historySearch.toLowerCase();
        const inTitle = (act.title || '').toLowerCase().includes(q);
        const inType = (act.typeName || '').toLowerCase().includes(q);
        const inExp = (act.expedienteCode || '').toLowerCase().includes(q);
        const inNum = String(act.actNumber || '').includes(q);
        const inApplicant = (act.applicantName || '').toLowerCase().includes(q);
        if (!inTitle && !inType && !inExp && !inNum && !inApplicant) return false;
      }
      return true;
    });
  }, [actasHistory, historyFilter, historySearch]);

  return (
    <div className="p-6 md:p-8 lg:p-9 max-w-[1700px] mx-auto space-y-6 animate-in fade-in duration-200">
      
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1f1b3e] border border-[#6c3aed] text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm animate-in slide-in-from-bottom-5">
          <Sparkles className="w-5 h-5 text-[#ffc36c] shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Top Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#191731] via-[#211d47] to-[#121029] border border-[#323859]/60 p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#6c3aed]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#6c3aed]/20 border border-[#8b59f6]/30 text-[#b79bff] text-xs font-bold uppercase tracking-wider">
              <Building2 className="w-3.5 h-3.5" />
              <span>Ministerio de la Mujer y Poblaciones Vulnerables (MIMP)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Documentos PDF e Informe Estadístico MIMP
            </h1>
            <p className="text-sm text-[#9ea7cb] leading-relaxed">
              Emisión de las 15 plantillas y formatos oficiales de actas y cédulas, y consolidación de la Ficha Estadística Anual para la Dirección de Sistemas Locales y Defensorías.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {activeTab === 'mimp' && (
              <>
                <button
                  type="button"
                  onClick={handleExportMimpCSV}
                  className="px-3.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-[#323859] text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm hover:border-[#2faaf7]"
                  title="Descargar datos en formato CSV"
                >
                  <Download className="w-4 h-4 text-[#2faaf7]" />
                  <span className="hidden sm:inline">Exportar CSV</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="px-4 py-2.5 rounded-xl bg-[#2faaf7]/20 hover:bg-[#2faaf7]/30 border border-[#2faaf7]/40 text-[#84d0ff] hover:text-white text-xs font-bold transition-all flex items-center space-x-2 cursor-pointer"
                  title="Imprimir Ficha Oficial MIMP"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir Ficha MIMP</span>
                </button>

                <button
                  type="button"
                  onClick={handleSaveMimpConsolidated}
                  disabled={savingMimp}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] text-white text-xs font-extrabold hover:opacity-90 transition-all flex items-center space-x-2 shadow-lg shadow-[#6c3aed]/30 cursor-pointer disabled:opacity-50"
                  title="Archivar en Base de Datos"
                >
                  {savingMimp ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Award className="w-4 h-4" />}
                  <span>Archivar Consolidado</span>
                </button>
              </>
            )}

            {activeTab === 'generator' && (
              <div className="text-xs text-[var(--muted)] flex items-center space-x-2 bg-white/5 px-3 py-2 rounded-xl border border-white/10">
                <CheckCircle2 className="w-4 h-4 text-[#10b981]" />
                <span>15 Formatos MIMP homologados</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center space-x-2 border-b border-[var(--line)] pb-3 overflow-x-auto no-scrollbar">
        {[
          { id: 'mimp', label: 'Ficha Estadística Anual MIMP', icon: BarChart2, badge: 'Oficial' },
          { id: 'generator', label: 'Emisión de Documentos PDF', icon: FileText, badge: '15 Formatos' },
          { id: 'history', label: 'Registro de Documentos Emitidos', icon: ClipboardList, badge: actasHistory.length },
          { id: 'normativa', label: 'Guía Técnica & Normativa DEMUNA', icon: BookOpen }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`
                px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 cursor-pointer
                ${isActive
                  ? 'bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] text-white shadow-md shadow-[#6c3aed]/25'
                  : 'text-[var(--muted)] hover:text-white hover:bg-white/5'
                }
              `}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-full ${isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-[var(--muted)]'}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ================= PESTAÑA 1: INFORME ESTADÍSTICO ANUAL MIMP ================= */}
      {activeTab === 'mimp' && (
        <div className="space-y-6">
          
          {/* Controls Bar: Year & Quarter selectors */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--line)] shadow-lg">
            <div className="flex items-center space-x-3">
              <span className="text-xs font-bold text-[var(--text)]">Período Fiscal:</span>
              <select
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value, 10))}
                className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl px-3.5 py-2 text-xs font-extrabold text-[var(--text)] focus:outline-none focus:border-[#6c3aed] cursor-pointer"
              >
                {[2026, 2025, 2024, 2023].map((y) => (
                  <option key={y} value={y}>Año {y}</option>
                ))}
              </select>

              <select
                value={quarter}
                onChange={(e) => setQuarter(e.target.value)}
                className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl px-3.5 py-2 text-xs font-bold text-[var(--text)] focus:outline-none focus:border-[#6c3aed] cursor-pointer"
              >
                <option value="all">Todo el Año (Consolidado)</option>
                <option value="1">I Trimestre (Ene - Mar)</option>
                <option value="2">II Trimestre (Abr - Jun)</option>
                <option value="3">III Trimestre (Jul - Set)</option>
                <option value="4">IV Trimestre (Oct - Dic)</option>
              </select>
            </div>

            <div className="text-[11px] text-[var(--muted)] flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
              <span>Sincronizado con Base de Datos DEMUNA ZAPILLICA</span>
            </div>
          </div>

          {loadingMimp ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#8b59f6] animate-spin mx-auto" />
              <p className="text-xs text-[var(--muted)] font-medium">Consolidando Ficha Anual MIMP...</p>
            </div>
          ) : !mimpData ? (
            <div className="py-16 text-center text-xs text-[var(--muted)]">No se pudieron cargar los datos del reporte.</div>
          ) : (
            <div className="space-y-6">
              
              {/* Mini-KPIs Bar */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
                  <div>
                    <span className="text-[11px] font-bold text-[var(--muted)] uppercase tracking-wider">Casos Ingresados</span>
                    <h3 className="text-2xl font-black text-white mt-1">{mimpData.casos.received}</h3>
                    <span className="text-[10px] text-[#9ea7cb]">{mimpData.periodLabel}</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#6c3aed]/15 border border-[#8b59f6]/30 text-[#8b59f6] flex items-center justify-center shrink-0">
                    <Folder className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
                  <div>
                    <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Casos Concluidos</span>
                    <h3 className="text-2xl font-black text-emerald-300 mt-1">{mimpData.casos.concludedTotal}</h3>
                    <span className="text-[10px] text-[var(--muted)]">Acuerdos & Derivaciones</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
                  <div>
                    <span className="text-[11px] font-bold text-[#2faaf7] uppercase tracking-wider">NNA Tutelados</span>
                    <h3 className="text-2xl font-black text-[#84d0ff] mt-1">{mimpData.poblacion.total}</h3>
                    <span className="text-[10px] text-[var(--muted)]">Niñas, Niños y Adolescentes</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-[#2faaf7]/15 border border-[#2faaf7]/30 text-[#2faaf7] flex items-center justify-center shrink-0">
                    <Users className="w-6 h-6" />
                  </div>
                </div>

                <div className="bg-[var(--surface)] border border-[var(--line)] rounded-2xl p-5 flex items-center justify-between shadow-lg overflow-hidden">
                  <div>
                    <span className="text-[11px] font-bold text-amber-400 uppercase tracking-wider">Recaudación Pensiones</span>
                    <h3 className="text-2xl font-black text-amber-300 mt-1">S/ {mimpData.pensiones.totalCollected.toFixed(2)}</h3>
                    <span className="text-[10px] text-[var(--muted)]">{mimpData.pensiones.countPayments} consignaciones</span>
                  </div>
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center justify-center shrink-0">
                    <DollarSign className="w-6 h-6" />
                  </div>
                </div>

              </div>

              {/* Ficha Oficial MIMP: Tablas Detalladas por Capítulos */}
              <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-7">
                
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--line)] pb-5">
                  <div>
                    <h3 className="text-lg font-black text-white tracking-tight flex items-center space-x-2">
                      <Award className="w-5 h-5 text-[#ffc36c]" />
                      <span>Ficha Estadística Anual MIMP — {mimpData.periodLabel}</span>
                    </h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">
                      Dirección de Sistemas Locales y Defensorías &bull; Código DEMUNA: {mimpData.dnaCode} &bull; {mimpData.municipio}
                    </p>
                  </div>
                </div>

                {/* Capítulo I: Movimiento General de Expedientes */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#b79bff]">
                    <span className="w-6 h-6 rounded-lg bg-[#6c3aed]/20 text-[#b79bff] flex items-center justify-center text-[11px]">I</span>
                    <span>Capítulo I: Registro y Movimiento de Expedientes</span>
                  </div>

                  <div className="overflow-x-auto rounded-2xl border border-[var(--line)]">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-[var(--surface-2)] text-[var(--muted)] border-b border-[var(--line)]">
                          <th className="py-2.5 px-4 font-bold">Estado / Situación Procedimental</th>
                          <th className="py-2.5 px-4 font-bold text-center">Definición Operacional MIMP</th>
                          <th className="py-2.5 px-4 font-bold text-right">Cantidad de Casos</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--line)] text-slate-300">
                        <tr>
                          <td className="py-3 px-4 font-extrabold text-white">1.1. Total de Casos Nuevos Ingresados en el Período</td>
                          <td className="py-3 px-4 text-center text-[var(--muted)]">Solicitudes recepcionadas y admitidas a trámite</td>
                          <td className="py-3 px-4 text-right font-black text-white font-mono text-sm">{mimpData.casos.received}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-emerald-300">1.2. Casos Concluidos con Acuerdo Conciliatorio (F9A)</td>
                          <td className="py-3 px-4 text-center text-[var(--muted)]">Acuerdo total o parcial con acta suscrita</td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-400 font-mono text-sm">{mimpData.casos.concludedAcuerdo}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-blue-300">1.3. Casos Derivados a Fiscalía / Juzgado / CEM (F7)</td>
                          <td className="py-3 px-4 text-center text-[var(--muted)]">Remisión por no conciliable o riesgo grave</td>
                          <td className="py-3 px-4 text-right font-bold text-blue-400 font-mono text-sm">{mimpData.casos.concludedDerivado}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-amber-300">1.4. Casos Activos / En Trámite</td>
                          <td className="py-3 px-4 text-center text-[var(--muted)]">En fase de audiencias, visitas o entrevistas</td>
                          <td className="py-3 px-4 text-right font-bold text-amber-400 font-mono text-sm">{mimpData.casos.inProcess}</td>
                        </tr>
                        <tr>
                          <td className="py-3 px-4 font-semibold text-slate-400">1.5. Casos Desistidos o Archivados por Inasistencia (F8)</td>
                          <td className="py-3 px-4 text-center text-[var(--muted)]">Inasistencia injustificada reiterada o desistimiento</td>
                          <td className="py-3 px-4 text-right font-bold text-slate-400 font-mono text-sm">{mimpData.casos.dropped}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Capítulo II: Clasificación por Materia */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-[#2faaf7]">
                    <span className="w-6 h-6 rounded-lg bg-[#2faaf7]/20 text-[#2faaf7] flex items-center justify-center text-[11px]">II</span>
                    <span>Capítulo II: Clasificación por Materia de Atención</span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {[
                      { name: 'Pensión de Alimentos', count: mimpData.materias.alimentos, color: 'from-[#6c3aed] to-[#8b59f6]', pct: Math.round((mimpData.materias.alimentos / (mimpData.materias.total || 1)) * 100) },
                      { name: 'Tenencia y Custodia', count: mimpData.materias.tenencia, color: 'from-[#2faaf7] to-[#0284c7]', pct: Math.round((mimpData.materias.tenencia / (mimpData.materias.total || 1)) * 100) },
                      { name: 'Régimen de Visitas', count: mimpData.materias.visitas, color: 'from-[#10b981] to-[#059669]', pct: Math.round((mimpData.materias.visitas / (mimpData.materias.total || 1)) * 100) },
                      { name: 'Reconocimiento Voluntario', count: mimpData.materias.reconocimiento, color: 'from-[#ffc36c] to-[#f59e0b]', pct: Math.round((mimpData.materias.reconocimiento / (mimpData.materias.total || 1)) * 100) },
                      { name: 'Normas de Conducta Parental', count: mimpData.materias.normasConducta, color: 'from-[#ec4899] to-[#be185d]', pct: Math.round((mimpData.materias.normasConducta / (mimpData.materias.total || 1)) * 100) },
                      { name: 'Riesgo / Presunta Vulneración', count: mimpData.materias.vulneracion, color: 'from-[#f97316] to-[#c2410c]', pct: Math.round((mimpData.materias.vulneracion / (mimpData.materias.total || 1)) * 100) }
                    ].map((mat, idx) => (
                      <div key={idx} className="bg-[#0c0d22] border border-[#323859]/60 rounded-2xl p-4 flex flex-col justify-between space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-white truncate">{mat.name}</span>
                          <strong className="text-sm font-black text-white font-mono">{mat.count}</strong>
                        </div>
                        <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full bg-gradient-to-r ${mat.color}`} style={{ width: `${Math.max(5, mat.pct)}%` }} />
                        </div>
                        <div className="flex justify-between text-[10px] text-[var(--muted)]">
                          <span>Participación</span>
                          <span className="font-bold text-[#b79bff]">{mat.pct}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Capítulo III & IV Grid: Población NNA y Pensiones */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Capítulo III: Población Beneficiaria NNA */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-emerald-400">
                      <span className="w-6 h-6 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-[11px]">III</span>
                      <span>Capítulo III: Beneficiarios NNA Tutelados</span>
                    </div>

                    <div className="bg-[#0c0d22] border border-[#323859]/60 rounded-2xl p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[var(--muted)]">Total Niñas, Niños y Adolescentes</span>
                        <strong className="text-base font-black text-white">{mimpData.poblacion.total}</strong>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-[#121029] p-2.5 rounded-xl border border-white/5">
                          <span className="text-[10px] text-pink-400 font-bold block">Niñas (Femenino)</span>
                          <strong className="text-sm font-black text-white">{mimpData.poblacion.ninas}</strong>
                        </div>
                        <div className="bg-[#121029] p-2.5 rounded-xl border border-white/5">
                          <span className="text-[10px] text-blue-400 font-bold block">Niños (Masculino)</span>
                          <strong className="text-sm font-black text-white">{mimpData.poblacion.ninos}</strong>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[10.5px] text-[var(--muted)] font-semibold block">Distribución por Etapas de Desarrollo:</span>
                        <div className="flex items-center justify-between text-[11px] py-1 border-t border-white/5">
                          <span>Primera Infancia (0 a 5 años)</span>
                          <strong className="font-mono text-white">{mimpData.poblacion.age0_5}</strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px] py-1 border-t border-white/5">
                          <span>Niñez (6 a 11 años)</span>
                          <strong className="font-mono text-white">{mimpData.poblacion.age6_11}</strong>
                        </div>
                        <div className="flex items-center justify-between text-[11px] py-1 border-t border-white/5">
                          <span>Adolescencia (12 a 17 años)</span>
                          <strong className="font-mono text-white">{mimpData.poblacion.age12_17}</strong>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Capítulo IV: Pensiones y Consignaciones */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-amber-400">
                      <span className="w-6 h-6 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center text-[11px]">IV</span>
                      <span>Capítulo IV: Pensiones Económicas</span>
                    </div>

                    <div className="bg-[#0c0d22] border border-[#323859]/60 rounded-2xl p-4 space-y-3 text-xs">
                      <div className="flex items-center justify-between border-b border-white/5 pb-2">
                        <span className="text-[var(--muted)]">Total Recaudado en el Período</span>
                        <strong className="text-base font-black text-amber-300">S/ {mimpData.pensiones.totalCollected.toFixed(2)}</strong>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-center">
                        <div className="bg-[#121029] p-2.5 rounded-xl border border-white/5">
                          <span className="text-[10px] text-[var(--muted)] font-bold block">Recibos Emitidos</span>
                          <strong className="text-sm font-black text-white">{mimpData.pensiones.countPayments}</strong>
                        </div>
                        <div className="bg-[#121029] p-2.5 rounded-xl border border-white/5">
                          <span className="text-[10px] text-[var(--muted)] font-bold block">Monto Promedio</span>
                          <strong className="text-sm font-black text-white">S/ {mimpData.pensiones.avgPayment.toFixed(2)}</strong>
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-200 leading-relaxed">
                        El 100% de los fondos son transferidos directamente a la cuenta de ahorros de la parte tutora sin comisiones ni intermediación de terceros.
                      </div>
                    </div>
                  </div>

                </div>

                {/* Capítulo V: Actuaciones Extrajudiciales y Fichas */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-black uppercase tracking-wider text-purple-400">
                    <span className="w-6 h-6 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center text-[11px]">V</span>
                    <span>Capítulo V: Actuaciones y Fichas Oficiales Suscritas</span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-[#0c0d22] border border-[#323859]/60 rounded-2xl p-3.5">
                      <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">F1 Recepción</span>
                      <strong className="text-lg font-black text-white mt-1 block">{mimpData.actuaciones.recepcionF1}</strong>
                    </div>
                    <div className="bg-[#0c0d22] border border-[#323859]/60 rounded-2xl p-3.5">
                      <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">F2 Entrevistas</span>
                      <strong className="text-lg font-black text-white mt-1 block">{mimpData.actuaciones.entrevistasF2}</strong>
                    </div>
                    <div className="bg-[#0c0d22] border border-[#323859]/60 rounded-2xl p-3.5">
                      <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">F3 Visitas</span>
                      <strong className="text-lg font-black text-white mt-1 block">{mimpData.actuaciones.visitasF3}</strong>
                    </div>
                    <div className="bg-[#0c0d22] border border-[#323859]/60 rounded-2xl p-3.5">
                      <span className="text-[10px] text-[var(--muted)] font-bold uppercase block">F11 Seguimiento</span>
                      <strong className="text-lg font-black text-white mt-1 block">{mimpData.actuaciones.seguimientoF11}</strong>
                    </div>
                  </div>
                </div>

                {/* Footer Signature Blocks for Print */}
                <div className="pt-8 border-t border-[var(--line)] flex flex-col sm:flex-row items-center justify-between text-xs text-[var(--muted)] gap-4">
                  <div className="text-center sm:text-left">
                    <span className="font-bold text-white block">DEMUNA ZAPILLICA &bull; Municipalidad Distrital de Zapillica</span>
                    <span>Acreditada ante la Dirección de Sistemas Locales y Defensorías (DSLD - MIMP)</span>
                  </div>

                  <div className="text-center sm:text-right">
                    <span className="text-[10px] text-slate-500 block">Sello y Firma Digital del Responsable DEMUNA</span>
                    <strong className="text-white">Abog. Personal Acreditado</strong>
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>
      )}

      {/* ================= PESTAÑA 2: CENTRO DE EMISIÓN DE DOCUMENTOS PDF ================= */}
      {activeTab === 'generator' && (
        <div className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--surface)] p-4 rounded-2xl border border-[var(--line)]">
            <div>
              <h3 className="text-sm font-extrabold text-white">Catálogo de Plantillas y Formatos Oficiales</h3>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                Seleccione el documento a expedir para autocompletar con los datos de cualquier caso registrado.
              </p>
            </div>
            <span className="px-3 py-1 rounded-full bg-[#6c3aed]/20 text-[#c5b3ff] text-xs font-bold border border-[#8b59f6]/30">
              15 Formatos Disponibles
            </span>
          </div>

          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {templatesCatalog.map((tmpl) => {
              const Icon = tmpl.icon;

              return (
                <div
                  key={tmpl.id}
                  className="bg-gradient-to-br from-[#191731] via-[#16132f] to-[#100e24] border border-[#323859]/70 hover:border-[#6c3aed] rounded-2xl p-5 shadow-lg flex flex-col justify-between transition-all duration-200 group"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-white/5 text-[#c5b3ff] border border-white/10">
                        {tmpl.code}
                      </span>
                      <div className={`w-8 h-8 rounded-xl bg-gradient-to-tr ${tmpl.color} text-white flex items-center justify-center shadow-md`}>
                        <Icon className="w-4 h-4" />
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-white group-hover:text-[#b79bff] transition-colors">
                      {tmpl.title}
                    </h4>

                    <p className="text-xs text-[#aeb4d4] leading-relaxed line-clamp-2">
                      {tmpl.description}
                    </p>
                  </div>

                  <div className="pt-4 mt-3 border-t border-white/5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold text-[var(--muted)] uppercase">
                      {tmpl.category}
                    </span>

                    <button
                      type="button"
                      onClick={() => handleOpenDocModal(tmpl)}
                      className="px-3.5 py-1.5 rounded-xl bg-[#6c3aed]/20 hover:bg-[#6c3aed]/30 border border-[#8b59f6]/40 text-[#c5b3ff] hover:text-white text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer shadow-sm"
                    >
                      <span>Emitir Documento</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* ================= PESTAÑA 3: REGISTRO HISTÓRICO DE DOCUMENTOS ================= */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          
          {/* Search and Filter */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-[var(--surface)] p-3 rounded-2xl border border-[var(--line)]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                placeholder="Buscar por número de acta, expediente, solicitante o tipo..."
                className="w-full bg-[var(--surface-2)] border border-[var(--line)] rounded-xl pl-10 pr-4 py-2 text-xs text-[var(--text)] placeholder-[var(--muted)] focus:outline-none focus:border-[#6c3aed]"
              />
            </div>

            <select
              value={historyFilter}
              onChange={(e) => setHistoryFilter(e.target.value)}
              className="bg-[var(--surface-2)] border border-[var(--line)] rounded-xl px-3 py-2 text-xs text-[var(--text)] focus:outline-none focus:border-[#6c3aed] cursor-pointer shrink-0"
            >
              <option value="all">Todos los tipos de actas</option>
              <option value="12">Actas de Conciliación (F9A)</option>
              <option value="16">Actas de Compromiso (F10)</option>
              <option value="4">Invitaciones a Audiencia (F4/F5)</option>
              <option value="8">Oficios de Derivación (F7)</option>
              <option value="11">Actas de Inasistencia (F8)</option>
            </select>

            <button
              type="button"
              onClick={fetchActasHistory}
              className="p-2 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] text-[var(--muted)] hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 ${loadingActas ? 'animate-spin text-[#8b59f6]' : ''}`} />
            </button>
          </div>

          {/* Table */}
          {loadingActas ? (
            <div className="py-20 text-center space-y-3">
              <RefreshCw className="w-8 h-8 text-[#8b59f6] animate-spin mx-auto" />
              <p className="text-xs text-[var(--muted)]">Cargando archivo documental...</p>
            </div>
          ) : filteredActasHistory.length === 0 ? (
            <div className="py-16 text-center space-y-3 bg-[var(--surface)] rounded-2xl border border-[var(--line)] p-8">
              <FileText className="w-8 h-8 text-[var(--muted)] mx-auto" />
              <h4 className="text-base font-bold text-white">No hay documentos registrados</h4>
              <p className="text-xs text-[var(--muted)]">No se encontraron actas o documentos emitidos con los filtros actuales.</p>
            </div>
          ) : (
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl overflow-hidden shadow-2xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[var(--surface-2)] text-[var(--muted)] border-b border-[var(--line)]">
                      <th className="py-3 px-4 font-bold">N° Acta / Código</th>
                      <th className="py-3 px-4 font-bold">Tipo de Documento</th>
                      <th className="py-3 px-4 font-bold">Expediente Asociado</th>
                      <th className="py-3 px-4 font-bold">Partes Involucradas</th>
                      <th className="py-3 px-4 font-bold">Fecha de Emisión</th>
                      <th className="py-3 px-4 font-bold text-right">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--line)] text-slate-300">
                    {filteredActasHistory.map((act) => (
                      <tr key={act.id} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-white">
                          ACTA N° {act.actNumber || act.id}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-[#c5b3ff] block">{act.typeName}</span>
                          <span className="text-[10px] text-[var(--muted)]">{act.title}</span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-mono text-xs font-bold text-[#2faaf7]">{act.expedienteCode}</span>
                        </td>
                        <td className="py-3 px-4 text-[11px] text-[var(--muted)]">
                          <div>Solicitante: <strong className="text-white">{act.applicantName || 'Registrado'}</strong></div>
                          <div>Citado: <strong className="text-slate-400">{act.suspectName || 'Registrado'}</strong></div>
                        </td>
                        <td className="py-3 px-4 text-xs font-mono text-slate-400">
                          {act.date}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedTemplate({
                                id: `act-${act.id}`,
                                code: act.typeName,
                                title: act.title,
                                defaultMateria: act.f9aMaterias || act.f10Materias || 'Materia Legal DEMUNA',
                                defaultAcuerdo: act.f9aTermyCond || act.f10Compromisos || 'Acuerdo legal formalizado en el acta.'
                              });
                              setDocFormData({
                                docNumber: `ACTA N° ${act.actNumber || act.id}-${act.date ? act.date.substring(0,4) : '2026'}`,
                                date: act.date || new Date().toISOString().split('T')[0],
                                city: 'Zapillica',
                                solicitante: act.applicantName || 'Parte Solicitante',
                                invitado: act.suspectName || 'Parte Invitada',
                                nna: act.childName || 'Menor Tutelado',
                                defensor: act.workerName || 'Defensor Responsable DEMUNA Zapillica',
                                materia: act.f9aMaterias || act.f10Materias || act.title,
                                acuerdo: act.f9aTermyCond || act.f10Compromisos || 'Términos y condiciones suscritos según ley.',
                                observaciones: 'Documento original extraído del archivo oficial de actas.'
                              });
                              setShowDocModal(true);
                            }}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#6c3aed]/20 border border-[var(--line)] text-[#c5b3ff] text-xs font-bold transition-all inline-flex items-center space-x-1 cursor-pointer"
                          >
                            <Printer className="w-3.5 h-3.5" />
                            <span>Ver PDF</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ================= PESTAÑA 4: GUÍA TÉCNICA & NORMATIVA MIMP ================= */}
      {activeTab === 'normativa' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            
            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-[#6c3aed]/20 text-[#c5b3ff] flex items-center justify-center">
                <BookOpen className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">Directiva N° 001-2022-MIMP: Conciliación Extrajudicial</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Establece los lineamientos y formalidades vinculantes para las audiencias celebradas en las Defensorías Municipales. Las Actas con Acuerdo Total (F9A) constituyen <strong>título ejecutivo</strong> con mérito de ejecución inmediata ante el Poder Judicial en caso de incumplimiento.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-medium">
                <li>El plazo máximo entre la recepción y la primera invitación es de 3 días hábiles.</li>
                <li>Tolerancia máxima para el inicio de la audiencia: 15 minutos.</li>
                <li>Si una parte no asiste, se expide la segunda invitación en un plazo no mayor a 3 días.</li>
              </ul>
            </div>

            <div className="bg-[var(--surface)] border border-[var(--line)] rounded-3xl p-6 space-y-4 shadow-xl">
              <div className="w-10 h-10 rounded-2xl bg-[#2faaf7]/20 text-[#2faaf7] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-extrabold text-white">Decreto Legislativo N° 1297 & Código del Niño</h3>
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                Regula el principio del Interés Superior del Niño y la protección de niñas, niños y adolescentes en situación de riesgo.
              </p>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4 font-medium">
                <li>No son materias conciliables: los delitos y faltas penales, violencia física grave o abuso sexual.</li>
                <li>Ante cualquier sospecha de violencia, el caso debe derivarse inmediatamente mediante Oficio F7 a la Fiscalía de Familia o CEM.</li>
                <li>Toda la documentación goza de carácter reservado y confidencial bajo responsabilidad legal.</li>
              </ul>
            </div>

          </div>
        </div>
      )}

      {/* ================= MODAL: VISOR Y GENERADOR DE DOCUMENTO PDF ================= */}
      {showDocModal && selectedTemplate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0a0e20]/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#191731] border border-[#323859] rounded-3xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl animate-in zoom-in-95 overflow-hidden">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-[#323859]/60 shrink-0 bg-gradient-to-r from-[#201c44] to-[#191731]">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-[#6c3aed]/20 text-[#c5b3ff] flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {selectedTemplate.title}
                  </h3>
                  <p className="text-[11px] text-[#9ea7cb]">{selectedTemplate.code} &bull; Emisión Oficial DEMUNA</p>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  type="button"
                  onClick={handlePrintDocument}
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#6c3aed] to-[#8b59f6] text-white text-xs font-black transition-all flex items-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Imprimir / Guardar PDF</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowDocModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body with Two Columns: Form Editor & Live Printable Sheet */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 min-h-0 bg-[#0c0d22]">
              
              {/* Quick Case Autofill Selector */}
              <div className="bg-[#191731] border border-[#323859] rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-2">
                  <Folder className="w-4 h-4 text-[#2faaf7]" />
                  <span className="text-xs font-bold text-white">Autocompletar con Caso:</span>
                </div>
                <select
                  value={selectedExpedienteId}
                  onChange={(e) => handleSelectExpediente(e.target.value)}
                  className="bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#6c3aed] flex-1 max-w-md cursor-pointer"
                >
                  <option value="">-- Seleccionar Expediente de la Lista --</option>
                  {expedientesList.map(exp => (
                    <option key={exp.id || exp.IdExpediente} value={exp.id || exp.IdExpediente}>
                      {exp.code || exp.NombreExpediente} - {exp.subject || exp.Descripcion || 'Caso DEMUNA'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Input Fields for Document Customization */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-[#191731] border border-[#323859] rounded-2xl p-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] mb-1">N° de Documento</label>
                  <input
                    type="text"
                    value={docFormData.docNumber}
                    onChange={(e) => setDocFormData({ ...docFormData, docNumber: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-1.5 text-xs text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] mb-1">Fecha del Acto</label>
                  <input
                    type="date"
                    value={docFormData.date}
                    onChange={(e) => setDocFormData({ ...docFormData, date: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] mb-1">Localidad / Distrito</label>
                  <input
                    type="text"
                    value={docFormData.city}
                    onChange={(e) => setDocFormData({ ...docFormData, city: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] mb-1">Parte Solicitante</label>
                  <input
                    type="text"
                    value={docFormData.solicitante}
                    onChange={(e) => setDocFormData({ ...docFormData, solicitante: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] mb-1">Parte Invitada / Obligada</label>
                  <input
                    type="text"
                    value={docFormData.invitado}
                    onChange={(e) => setDocFormData({ ...docFormData, invitado: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-[var(--muted)] mb-1">NNA Beneficiario(a)</label>
                  <input
                    type="text"
                    value={docFormData.nna}
                    onChange={(e) => setDocFormData({ ...docFormData, nna: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl px-3 py-1.5 text-xs text-white"
                  />
                </div>
                <div className="sm:col-span-3">
                  <label className="block text-[11px] font-bold text-[var(--muted)] mb-1">Acuerdos & Cláusulas Legales</label>
                  <textarea
                    rows={3}
                    value={docFormData.acuerdo}
                    onChange={(e) => setDocFormData({ ...docFormData, acuerdo: e.target.value })}
                    className="w-full bg-[#0c0d22] border border-[#323859] rounded-xl p-2.5 text-xs text-white font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* LIVE PRINTABLE DOCUMENT SHEET (WHITE FORMAL A4 SHEET) */}
              <div className="bg-white text-slate-900 rounded-2xl shadow-2xl p-8 sm:p-12 space-y-6 max-w-3xl mx-auto border border-slate-300 font-serif leading-relaxed">
                
                {/* Official Letterhead */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block">
                    REPÚBLICA DEL PERÚ &bull; MINISTERIO DE LA MUJER Y POBLACIONES VULNERABLES
                  </span>
                  <h2 className="text-sm sm:text-base font-black text-slate-900 uppercase">
                    MUNICIPALIDAD DISTRITAL DE ZAPILLICA &bull; PROVINCIA DE AYABACA &bull; PIURA
                  </h2>
                  <span className="text-[11px] font-bold text-slate-700 block">
                    DEFENSORÍA MUNICIPAL DEL NIÑO, NIÑA Y ADOLESCENTE — DEMUNA ZAPILLICA
                  </span>
                  <span className="text-[9.5px] text-slate-500 italic block">
                    Acreditada con Código N° DNA-PIU-042 ante la Dirección de Sistemas Locales (MIMP)
                  </span>
                </div>

                {/* Document Title & Number */}
                <div className="text-center py-2">
                  <h1 className="text-base sm:text-lg font-black uppercase tracking-wide underline underline-offset-4">
                    {selectedTemplate.title}
                  </h1>
                  <span className="text-xs font-black font-mono text-slate-700 block mt-1">
                    N° {docFormData.docNumber}
                  </span>
                </div>

                {/* Narrative Legal Text */}
                <div className="text-xs space-y-3.5 text-justify text-slate-800 leading-relaxed font-sans">
                  <p>
                    En el distrito de <strong>{docFormData.city}</strong>, a los <strong>{docFormData.date}</strong>, siendo las horas señaladas, en el local de la Defensoría Municipal del Niño, Niña y Adolescente (DEMUNA), ante la presencia del(la) Defensor(a) Responsable <strong>{docFormData.defensor}</strong>, se hicieron presentes don(ña) <strong>{docFormData.solicitante}</strong>, en calidad de <strong>SOLICITANTE</strong>; y don(ña) <strong>{docFormData.invitado}</strong>, en calidad de <strong>INVITADO(A)</strong>, con el objeto de resolver de manera pacífica y extrajudicial controversias relativas a los derechos fundamentales de su menor hijo(a) <strong>{docFormData.nna}</strong>.
                  </p>

                  <p>
                    Habiendo sido informadas las partes sobre la naturaleza, fines y efectos legales del presente procedimiento extrajudicial tutelar conforme a la <strong>Ley N° 27337 (Código de los Niños y Adolescentes)</strong>, manifiestan de común acuerdo adoptar las siguientes determinaciones:
                  </p>

                  {/* Cláusulas / Acuerdos */}
                  <div className="p-4 bg-slate-50 border border-slate-300 rounded-xl space-y-2">
                    <span className="text-[11px] font-black uppercase tracking-wider text-slate-900 block underline">
                      MATERIA CONVENIDA & DETERMINACIONES FORMALES:
                    </span>
                    <p className="whitespace-pre-line text-xs font-medium text-slate-800">
                      {docFormData.acuerdo}
                    </p>
                  </div>

                  <p>
                    Las partes expresan su total conformidad con los acuerdos convenidos, comprometiéndose a su fiel e íntegro cumplimiento. Leído que fue el presente documento en señal de aceptación y ratificación, lo suscriben conjuntamente con el Defensor acreditado.
                  </p>
                </div>

                {/* Official Signatures Blocks */}
                <div className="pt-12 grid grid-cols-3 gap-6 text-center text-[10.5px] font-sans text-slate-800 border-t border-slate-300 mt-8">
                  <div className="space-y-1">
                    <div className="border-t border-slate-900 pt-1 font-bold">
                      {docFormData.solicitante}
                    </div>
                    <span className="text-slate-500 block text-[9.5px]">PARTE SOLICITANTE</span>
                  </div>

                  <div className="space-y-1">
                    <div className="border-t border-slate-900 pt-1 font-bold">
                      {docFormData.defensor}
                    </div>
                    <span className="text-slate-500 block text-[9.5px]">DEFENSOR(A) DEMUNA</span>
                  </div>

                  <div className="space-y-1">
                    <div className="border-t border-slate-900 pt-1 font-bold">
                      {docFormData.invitado}
                    </div>
                    <span className="text-slate-500 block text-[9.5px]">PARTE INVITADA</span>
                  </div>
                </div>

                {/* Seal / Footer */}
                <div className="text-[9px] text-slate-400 text-center pt-4 border-t border-slate-200">
                  Documento emitido válidamente por DEMUNA ZAPILLICA &bull; {docFormData.city}, Perú.
                </div>

              </div>

            </div>

          </div>
        </div>
      )}

    </div>
  );
};
