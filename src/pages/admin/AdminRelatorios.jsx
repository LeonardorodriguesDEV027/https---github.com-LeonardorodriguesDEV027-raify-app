import React, { useState } from 'react';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { exportCsv } from '../agro/shared';
import { fmtAny } from './adminShared';

// Exporta coleções inteiras (todos os usuários) em CSV, com o nome do dono.
const REPORTS = [
  ['bi-people', 'Usuários', 'users'],
  ['bi-house-heart', 'Propriedades (agricultores)', 'properties'],
  ['bi-house-gear', 'Propriedades (agrônomos)', 'agroProperties'],
  ['bi-clipboard-data', 'Diagnósticos iniciais', 'diagnostics'],
  ['bi-clipboard2-pulse', 'Diagnósticos de agrotóxicos', 'agroDiagnostics'],
  ['bi-list-check', 'Planos de transição', 'plans'],
  ['bi-moisture', 'Análises de solo', 'soilAnalyses'],
  ['bi-file-earmark-medical', 'Laudos (agrônomos)', 'agroReports'],
  ['bi-droplet', 'Aplicações e manejo', 'applications'],
  ['bi-person-lines-fill', 'Produtores vinculados', 'agroProducers'],
  ['bi-truck-front', 'Equipamentos', 'agroEquipment'],
  ['bi-cash-coin', 'Financeiro', 'finance'],
  ['bi-chat-dots', 'Mensagens de suporte', 'supportMessages']
];
const SKIP = new Set(['usuarioUid', 'dados', 'manutencoes', 'usos']);

export default function AdminRelatorios() {
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');

  async function gerar(label, module) {
    setBusy(module);
    setError('');
    try {
      const [rows, users] = await Promise.all([
        module === 'users' ? api.users() : api.adminListAll(module, 5000),
        api.users()
      ]);
      const byId = Object.fromEntries(users.map((u) => [u.id, u]));
      const cols = [...new Set(rows.flatMap((r) => Object.keys(r)))].filter((c) => !SKIP.has(c));
      await exportCsv(
        `${label.toLowerCase().replace(/[^\wÀ-ú]+/g, '-')}.csv`,
        rows.map((r) => ({
          ...(module === 'users' ? {} : { Responsável: byId[r.usuarioUid]?.nomeCompleto || r.usuarioUid || '' }),
          ...Object.fromEntries(cols.map((c) => [c, fmtAny(r[c]) === '—' ? '' : fmtAny(r[c])]))
        }))
      );
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      <PageHeader title="Relatórios" subtitle="Exporte os dados de todo o sistema em CSV (Excel / Google Planilhas)." />
      {error && <div className="alert alert-warning">{error}</div>}
      <div className="ag-report-cards adm-reports">
        {REPORTS.map(([icon, label, module]) => (
          <button key={module} className="ag-report-card raify-card" disabled={!!busy} onClick={() => gerar(label, module)}>
            <i className={`bi ${icon}`} />
            <span>{busy === module ? 'Gerando...' : label}</span>
          </button>
        ))}
      </div>
    </>
  );
}
