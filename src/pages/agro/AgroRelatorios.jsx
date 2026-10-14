import React, { useState } from 'react';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { exportCsv, fmtDate, useAgroList } from './shared';
import { demoProperties } from './demoData';

// Cada relatório lê uma coleção e transforma os registros em linhas do CSV.
const REPORTS = {
  producao: {
    label: 'Relatório de produção',
    icon: 'bi-basket2',
    module: 'agroProperties',
    dateKey: null,
    row: (p) => ({ Propriedade: p.nome, Produtor: p.produtor, 'Área (ha)': p.area, Cultivos: p.cultivos, 'Transição (%)': p.transicao, Status: p.status })
  },
  financeiro: {
    label: 'Relatório financeiro',
    icon: 'bi-cash-coin',
    module: 'finance',
    dateKey: 'data',
    row: (f) => ({ Data: fmtDate(f.data), Descrição: f.descricao, Tipo: f.tipo, Categoria: f.categoria, Valor: Number(f.valor || 0).toFixed(2).replace('.', ',') })
  },
  insumos: {
    label: 'Relatório de insumos',
    icon: 'bi-box-seam',
    module: 'agroDiagnostics',
    dateKey: 'data',
    row: (d) => ({ Propriedade: d.propriedade, Data: fmtDate(d.data), 'Dependência química (%)': d.dependencia, Status: d.status })
  },
  sustentabilidade: {
    label: 'Relatório de sustentabilidade',
    icon: 'bi-recycle',
    module: 'agroActivities',
    dateKey: 'data',
    row: (a) => ({ Data: fmtDate(a.data), Atividade: a.atividade, Propriedade: a.propriedade, Status: a.status })
  }
};
const TABS = [
  ['Produção', ['producao', 'insumos']],
  ['Financeiro', ['financeiro']],
  ['Sustentabilidade', ['sustentabilidade', 'insumos']],
  ['Personalizado', Object.keys(REPORTS)]
];

export default function AgroRelatorios() {
  const props = useAgroList('agroProperties', demoProperties);
  const [tab, setTab] = useState('Produção');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [prop, setProp] = useState('');
  const [busy, setBusy] = useState('');
  const available = TABS.find(([t]) => t === tab)[1];

  async function generate(key) {
    const r = REPORTS[key];
    setBusy(key);
    try {
      const items = await api.list(r.module);
      const rows = items
        .filter((it) => !prop || [it.nome, it.propriedade].includes(prop))
        .filter((it) => !r.dateKey || ((!from || String(it[r.dateKey]) >= from) && (!to || String(it[r.dateKey]) <= to)))
        .map(r.row);
      await exportCsv(`${key}-${new Date().toISOString().slice(0, 10)}.csv`, rows);
    } catch (e) {
      alert(e.message);
    } finally {
      setBusy('');
    }
  }

  return (
    <>
      <PageHeader title="Relatórios" subtitle="Gere relatórios e acompanhe o desempenho da sua produção." />
      <div className="tabs-raify ag-tabs">
        {TABS.map(([t]) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>
      <div className="raify-card p-4">
        <div className="ag-report-filters">
          <div>
            <label>Período</label>
            <div className="ag-daterange">
              <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
              <span>–</span>
              <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
            </div>
          </div>
          <div>
            <label>Propriedade</label>
            <select className="form-select" value={prop} onChange={(e) => setProp(e.target.value)}>
              <option value="">Todas</option>
              {props.realItems.map((p) => (
                <option key={p.id}>{p.nome}</option>
              ))}
            </select>
          </div>
          <button className="btn btn-raify" disabled={!!busy} onClick={() => generate(available[0])}>
            <i className="bi bi-file-earmark-arrow-down" /> Gerar relatório
          </button>
        </div>
        <div className="ag-report-cards">
          {available.map((k) => (
            <button key={k} className="ag-report-card" disabled={!!busy} onClick={() => generate(k)}>
              <i className={`bi ${REPORTS[k].icon}`} />
              <span>{busy === k ? 'Gerando...' : REPORTS[k].label}</span>
            </button>
          ))}
        </div>
        <p className="ag-muted small mb-0 mt-3">
          Os relatórios são exportados em CSV (abre no Excel ou Google Planilhas) com os dados cadastrados
          no período e na propriedade escolhidos.
        </p>
      </div>
    </>
  );
}
