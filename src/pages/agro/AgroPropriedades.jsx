import React, { useMemo, useState } from 'react';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { DemoNotice, FormModal, SearchBox, StatusPill, fmtNum, useAgroList } from './shared';
import { demoProperties } from './demoData';

export const propertyFields = [
  { key: 'nome', label: 'Nome da propriedade', required: true },
  { key: 'produtor', label: 'Produtor responsável' },
  { key: 'area', label: 'Área (ha)', type: 'number', min: 0 },
  { key: 'produtores', label: 'Nº de produtores', type: 'number', min: 0 },
  { key: 'municipio', label: 'Município' },
  { key: 'uf', label: 'UF' },
  { key: 'transicao', label: 'Progresso da transição (%)', type: 'number', min: 0, max: 100 },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: ['Iniciada', 'Em andamento', 'Em transição', 'Concluída']
  },
  { key: 'cultivos', label: 'Principais cultivos', placeholder: 'Café, Milho, Feijão', full: true },
  { key: 'latitude', label: 'Latitude', type: 'number', help: 'Usada no Mapa das Propriedades.' },
  { key: 'longitude', label: 'Longitude', type: 'number' }
];

export default function AgroPropriedades() {
  const list = useAgroList('agroProperties', demoProperties);
  const [q, setQ] = useState('');
  const [form, setForm] = useState(null);

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return list.items.filter(
      (p) => !t || `${p.nome} ${p.produtor} ${p.municipio}`.toLowerCase().includes(t)
    );
  }, [list.items, q]);

  async function save() {
    try {
      const { id, ...body } = form;
      if (id) {
        const u = await api.update('agroProperties', id, body);
        list.setItems((prev) => prev.map((p) => (p.id === id ? u : p)));
      } else {
        const c = await api.create('agroProperties', body);
        list.setItems((prev) => [c, ...prev]);
      }
      setForm(null);
    } catch (e) {
      list.setError(e.message);
    }
  }
  async function del() {
    if (!confirm('Excluir esta propriedade?')) return;
    try {
      await api.remove('agroProperties', form.id);
      list.setItems((prev) => prev.filter((p) => p.id !== form.id));
      setForm(null);
    } catch (e) {
      list.setError(e.message);
    }
  }

  return (
    <>
      <PageHeader
        title="Propriedades"
        subtitle="Gerencie as propriedades e acompanhe o progresso de cada uma."
        action={
          <button className="btn btn-raify" onClick={() => setForm({ status: 'Iniciada' })}>
            + Nova propriedade
          </button>
        }
      />
      {list.error && <div className="alert alert-warning">{list.error}</div>}
      <DemoNotice show={list.isDemo} what="a primeira propriedade" />
      <div className="mb-3">
        <SearchBox value={q} onChange={setQ} placeholder="Buscar propriedade..." />
      </div>
      <div className="ag-prop-list">
        {rows.map((p) => {
          const pct = Math.max(0, Math.min(100, Number(p.transicao) || 0));
          return (
            <button
              className="raify-card ag-prop"
              key={p.id}
              onClick={() => !list.isDemo && setForm(p)}
            >
              <div className="ag-prop-photo" />
              <div className="ag-prop-info">
                <h3>{p.nome}</h3>
                <span>{p.produtor || '—'}</span>
                <span>
                  {fmtNum(p.area)} ha • {p.produtores || 0} produtor
                  {Number(p.produtores) === 1 ? '' : 'es'}
                </span>
              </div>
              <div className="ag-prop-progress">
                <div className="progress">
                  <div className="progress-bar" style={{ width: `${pct}%` }} />
                </div>
                <div className="ag-prop-meta">
                  <b>{pct}%</b>
                  <StatusPill value={p.status} />
                </div>
              </div>
              <i className="bi bi-chevron-right ag-chevron" />
            </button>
          );
        })}
        {!list.loading && rows.length === 0 && (
          <div className="raify-card empty-table">Nenhuma propriedade encontrada.</div>
        )}
      </div>
      {form && (
        <FormModal
          title={form.id ? 'Editar propriedade' : 'Nova propriedade'}
          fields={propertyFields}
          value={form}
          onChange={setForm}
          onSubmit={save}
          onClose={() => setForm(null)}
          onDelete={form.id ? del : undefined}
        />
      )}
    </>
  );
}
