import React, { useMemo, useState } from 'react';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { DemoNotice, FormModal, MultiDonut, SERIES, fmtDate, fmtMoney, useAgroList } from './shared';
import { demoFinance } from './demoData';

const CATEGORIES = ['Insumos', 'Equipamentos', 'Mão de obra', 'Transporte', 'Vendas', 'Serviços', 'Outros'];
const fields = [
  { key: 'descricao', label: 'Descrição', required: true },
  { key: 'tipo', label: 'Tipo', type: 'select', options: ['Receita', 'Despesa'], required: true },
  { key: 'categoria', label: 'Categoria', type: 'select', options: CATEGORIES },
  { key: 'valor', label: 'Valor (R$)', type: 'number', min: 0, required: true },
  { key: 'data', label: 'Data', type: 'date', required: true },
  {
    key: 'origem',
    label: 'Origem do insumo',
    type: 'select',
    options: ['Orgânico', 'Químico', 'Não se aplica'],
    help: 'Usado na aba Sustentabilidade.'
  }
];
const TABS = ['Resumo', 'Custos', 'Sustentabilidade', 'Fluxo de caixa'];
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];

export default function AgroFinanceiro() {
  // Mesma coleção "financeiro" do app; cada usuário vê só os seus lançamentos.
  const list = useAgroList('finance', demoFinance);
  const [tab, setTab] = useState('Resumo');
  const [form, setForm] = useState(null);

  const all = useMemo(
    () => [...list.items].sort((a, b) => String(b.data).localeCompare(String(a.data))),
    [list.items]
  );
  const sum = (arr) => arr.reduce((s, x) => s + Number(x.valor || 0), 0);
  const receitas = all.filter((x) => x.tipo === 'Receita');
  const despesas = all.filter((x) => x.tipo === 'Despesa');
  const rec = sum(receitas);
  const desp = sum(despesas);

  const byCat = Object.entries(
    despesas.reduce((m, d) => ({ ...m, [d.categoria || 'Outros']: (m[d.categoria || 'Outros'] || 0) + Number(d.valor || 0) }), {})
  )
    .map(([label, value]) => ({ label, value }))
    .sort((a, b) => b.value - a.value);

  const months = useMemo(() => {
    const m = {};
    all.forEach((x) => {
      const k = String(x.data || '').slice(0, 7);
      if (!k) return;
      m[k] = m[k] || { r: 0, d: 0 };
      m[k][x.tipo === 'Receita' ? 'r' : 'd'] += Number(x.valor || 0);
    });
    return Object.entries(m)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6);
  }, [all]);
  const maxMonth = Math.max(1, ...months.flatMap(([, v]) => [v.r, v.d]));

  const organico = sum(despesas.filter((d) => d.origem === 'Orgânico'));
  const quimico = sum(despesas.filter((d) => d.origem === 'Químico'));

  async function save() {
    try {
      const { id, ...body } = { ...form, valor: Number(form.valor || 0) };
      if (id) {
        const u = await api.update('finance', id, body);
        list.setItems((prev) => prev.map((x) => (x.id === id ? u : x)));
      } else {
        const c = await api.create('finance', body);
        list.setItems((prev) => [c, ...prev]);
      }
      setForm(null);
    } catch (e) {
      list.setError(e.message);
    }
  }
  async function del() {
    if (!confirm('Excluir este lançamento?')) return;
    await api.remove('finance', form.id);
    list.setItems((prev) => prev.filter((x) => x.id !== form.id));
    setForm(null);
  }

  const Lancamentos = ({ rows }) => (
    <div className="ag-entries">
      {rows.map((x) => (
        <button key={x.id} onClick={() => !list.isDemo && setForm(x)}>
          <span className="ag-muted">{fmtDate(x.data).slice(0, 5)}</span>
          <span>{x.descricao}</span>
          <b className={x.tipo === 'Receita' ? 'text-success' : ''}>
            {x.tipo === 'Receita' ? '+' : '-'} {fmtMoney(x.valor)}
          </b>
        </button>
      ))}
      {!rows.length && <p className="ag-muted mb-0">Nenhum lançamento.</p>}
    </div>
  );

  return (
    <>
      <PageHeader
        title="Financeiro"
        subtitle="Controle seus custos e receitas."
        action={
          <button
            className="btn btn-raify"
            onClick={() => setForm({ tipo: 'Despesa', data: new Date().toISOString().slice(0, 10) })}
          >
            + Lançamento
          </button>
        }
      />
      {list.error && <div className="alert alert-warning">{list.error}</div>}
      <DemoNotice show={list.isDemo} what="o primeiro lançamento" />
      <div className="tabs-raify ag-tabs">
        {TABS.map((t) => (
          <button key={t} className={tab === t ? 'active' : ''} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div className="ag-kpis">
        <div className="raify-card">
          <span>Receita total</span>
          <b>{fmtMoney(rec)}</b>
          <small className="ok">{receitas.length} lançamento(s)</small>
        </div>
        <div className="raify-card">
          <span>Custos</span>
          <b>{fmtMoney(desp)}</b>
          <small className="danger">{despesas.length} lançamento(s)</small>
        </div>
        <div className="raify-card">
          <span>Saldo</span>
          <b className={rec - desp < 0 ? 'text-danger' : ''}>{fmtMoney(rec - desp)}</b>
          <small className={rec - desp < 0 ? 'danger' : 'ok'}>
            {rec ? `${Math.round(((rec - desp) / rec) * 100)}% da receita` : '—'}
          </small>
        </div>
      </div>

      {tab === 'Resumo' && (
        <div className="ag-grid-2 mt-3">
          <div className="raify-card p-4">
            <h3>Despesas por categoria</h3>
            <div className="ag-donut-row">
              <MultiDonut parts={byCat} center={fmtMoney(desp).replace(',00', '')} />
              <ul className="ag-legend">
                {byCat.map((c, i) => (
                  <li key={c.label}>
                    <i style={{ background: SERIES[i % SERIES.length] }} />
                    <span>{c.label}</span>
                    <b>{desp ? Math.round((c.value / desp) * 100) : 0}%</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="raify-card p-4">
            <h3>Últimos lançamentos</h3>
            <Lancamentos rows={all.slice(0, 6)} />
          </div>
        </div>
      )}

      {tab === 'Custos' && (
        <div className="raify-card p-4 mt-3">
          <h3>Todas as despesas</h3>
          <Lancamentos rows={despesas} />
        </div>
      )}

      {tab === 'Sustentabilidade' && (
        <div className="raify-card p-4 mt-3">
          <h3>Gastos com insumos: orgânicos x químicos</h3>
          {organico + quimico === 0 ? (
            <p className="ag-muted mb-0">
              Informe a "Origem do insumo" nos lançamentos de despesa para acompanhar este indicador.
            </p>
          ) : (
            <>
              {[
                ['Orgânicos', organico],
                ['Químicos', quimico]
              ].map(([n, v]) => (
                <div className="npk-row" key={n}>
                  <span>{n}</span>
                  <div className="progress">
                    <div className="progress-bar" style={{ width: `${(v / (organico + quimico)) * 100}%` }} />
                  </div>
                  <b>{Math.round((v / (organico + quimico)) * 100)}%</b>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      {tab === 'Fluxo de caixa' && (
        <div className="raify-card p-4 mt-3">
          <h3>Receitas x despesas por mês</h3>
          <div className="finance-chart">
            {months.map(([k, v]) => (
              <div className="fin-month" key={k}>
                <div className="fin-bars">
                  <i style={{ height: `${(v.r / maxMonth) * 100}%` }} title={fmtMoney(v.r)} />
                  <b style={{ height: `${(v.d / maxMonth) * 100}%` }} title={fmtMoney(v.d)} />
                </div>
                <span>{MONTHS[Number(k.slice(5, 7)) - 1]}</span>
              </div>
            ))}
          </div>
          <div className="legend">
            <span>
              <i className="dot org" /> Receitas
            </span>
            <span>
              <i className="dot chem" /> Despesas
            </span>
          </div>
        </div>
      )}

      {form && (
        <FormModal
          title={form.id ? 'Editar lançamento' : 'Novo lançamento'}
          fields={fields}
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
