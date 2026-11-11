import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../api/axios';
import { ENDPOINTS } from '../api/endpoints';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { DollarSign, CheckCircle2, AlertTriangle, ArrowRight, Search, Clock } from 'lucide-react';

export const PensionesPage = () => {
  const [pagos, setPagos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  const fetchPagos = async () => {
    try {
      const res = await apiClient.get(ENDPOINTS.PAGOS);
      if (res.data?.success) {
        setPagos(res.data.data);
      }
    } catch (err) {
      console.error("Error al cargar pagos", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPagos();
  }, []);

  const handlePay = async (id) => {
    try {
      await apiClient.post(ENDPOINTS.PAGO_PAY(id), {});
      fetchPagos();
    } catch (err) {
      alert("Error al registrar abono");
    }
  };

  const handleRevert = async (id) => {
    if (!confirm("¿Deseas revertir este abono?")) return;
    try {
      await apiClient.post(ENDPOINTS.PAGO_REVERT(id), {});
      fetchPagos();
    } catch (err) {
      alert("Error al revertir abono");
    }
  };

  const filtered = pagos.filter(p => {
    if (filter === 'paid') return p.status === 'Pagado';
    if (filter === 'pending') return p.status !== 'Pagado';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">Control de Pensiones Alimenticias</h1>
          <p className="text-xs text-slate-500 font-medium">Seguimiento semáforo de cuotas y acuerdos conciliatorios de alimentos</p>
        </div>

        <div className="flex space-x-2">
          {['all', 'pending', 'paid'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-all ${
                filter === f
                  ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              {f === 'all' ? 'Todos' : f === 'pending' ? 'Por Cobrar' : 'Pagados'}
            </button>
          ))}
        </div>
      </div>

      <Card>
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-sky-600 border-t-transparent"></div>
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-12">No hay cuotas de pensión registradas con este filtro.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-100 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3 px-4">Expediente</th>
                  <th className="py-3 px-4">Obligado / Deudor</th>
                  <th className="py-3 px-4 text-center">Cuota</th>
                  <th className="py-3 px-4">Monto</th>
                  <th className="py-3 px-4">Fecha Vencimiento</th>
                  <th className="py-3 px-4 text-center">Estado</th>
                  <th className="py-3 px-4 text-right">Acción</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filtered.map((p) => {
                  const isPaid = p.status === 'Pagado';
                  const isNext = p.status === 'Próximo Pago';

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <Link to={`/expedientes/${p.expedienteId}`} className="font-mono font-bold text-sky-700 hover:underline">
                          {p.expedienteCode}
                        </Link>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-bold text-slate-800">{p.debtorName}</p>
                        <span className="text-[10px] text-slate-400">DNI: {p.debtorDni || '-'}</span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold">
                        #{p.paymentNumber}
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-slate-800 text-sm">
                        S/ {parseFloat(p.amount).toFixed(2)}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {p.dueDate}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isPaid ? 'bg-emerald-100 text-emerald-800' :
                          isNext ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {isPaid ? (
                          <button
                            onClick={() => handleRevert(p.id)}
                            className="text-[11px] text-slate-400 hover:text-red-600 hover:underline"
                          >
                            Revertir
                          </button>
                        ) : (
                          <Button size="sm" onClick={() => handlePay(p.id)}>
                            Abonar
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};

