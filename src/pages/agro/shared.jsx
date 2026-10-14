import React, { useEffect, useMemo, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Directory, Encoding, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';

// ---------- Formatação ----------
export const fmtDate = (v) => {
  if (!v) return '—';
  const [y, m, d] = String(v).slice(0, 10).split('-');
  return d ? `${d}/${m}/${y}` : String(v);
};
export const fmtMoney = (v) =>
  Number(v || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
export const fmtNum = (v) => Number(v || 0).toLocaleString('pt-BR');
export const initials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('') || '?';

// ---------- Pílula de status (cores iguais às da referência) ----------
const TONES = {
  ok: ['em transição', 'concluída', 'concluído', 'em uso', 'dentro do padrão', 'baixa', 'ativo'],
  info: ['em andamento', 'média', 'planejado', 'agendada'],
  warn: ['iniciada', 'pendente', 'aguardando'],
  danger: ['alta', 'alto', 'em manutenção', 'fora do padrão', 'atrasada', 'inativo']
};
export function toneOf(value) {
  const v = String(value || '').toLowerCase();
  return Object.keys(TONES).find((t) => TONES[t].includes(v)) || 'muted';
}
export function StatusPill({ value }) {
  if (!value) return <span className="ag-pill muted">—</span>;
  return <span className={`ag-pill ${toneOf(value)}`}>{value}</span>;
}

// ---------- Preferências (Configurações), guardadas só neste aparelho ----------
export const PREFS_KEY = 'raify.agro.prefs';
export const loadPrefs = () => {
  try {
    return JSON.parse(localStorage.getItem(PREFS_KEY)) || {};
  } catch {
    return {};
  }
};

// ---------- Carregamento com fallback de exemplo ----------
// Enquanto a coleção estiver vazia, mostra os dados de exemplo (isDemo).
export function useAgroList(module, demo = []) {
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const reload = () =>
    api
      .list(module)
      .then(setItems)
      .catch((e) => {
        setItems([]);
        setError(e.message);
      });
  useEffect(() => {
    reload();
  }, [module]);
  const showDemo = loadPrefs().demo !== false;
  const isDemo = showDemo && items !== null && items.length === 0;
  return {
    items: items === null ? [] : isDemo ? demo : items,
    realItems: items || [],
    loading: items === null,
    isDemo,
    error,
    setError,
    setItems,
    reload
  };
}

export function DemoNotice({ show, what = 'o primeiro registro' }) {
  if (!show) return null;
  return (
    <div className="ag-demo">
      <i className="bi bi-info-circle" /> Dados de exemplo. Cadastre {what} para ver as suas
      informações aqui.
    </div>
  );
}

// ---------- Campo de busca ----------
export function SearchBox({ value, onChange, placeholder }) {
  return (
    <label className="ag-search">
      <i className="bi bi-search" />
      <input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
    </label>
  );
}

// ---------- Modal de formulário ----------
export function FormModal({
  title,
  fields,
  value,
  onChange,
  onSubmit,
  onClose,
  onDelete,
  submitLabel
}) {
  const set = (k, v) => onChange({ ...value, [k]: v });
  return (
    <div className="modal d-block modal-bg">
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
        <form
          className="modal-content p-4"
          onSubmit={(e) => {
            e.preventDefault();
            onSubmit();
          }}
        >
          <div className="d-flex justify-content-between">
            <h3>{title}</h3>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="form-grid mt-3">
            {fields.map((f) => (
              <div className={f.full ? 'full' : ''} key={f.key}>
                <label>{f.label}</label>
                {f.type === 'select' ? (
                  <select
                    className="form-select"
                    required={f.required}
                    value={value[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                  >
                    <option value="">Selecione</option>
                    {(f.options || []).map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                ) : f.type === 'textarea' ? (
                  <textarea
                    rows="4"
                    className="form-control"
                    placeholder={f.placeholder}
                    value={value[f.key] ?? ''}
                    onChange={(e) => set(f.key, e.target.value)}
                  />
                ) : (
                  <input
                    className="form-control"
                    type={f.type || 'text'}
                    step={f.type === 'number' ? 'any' : undefined}
                    min={f.min}
                    max={f.max}
                    required={f.required}
                    placeholder={f.placeholder}
                    value={value[f.key] ?? ''}
                    onChange={(e) =>
                      set(f.key, f.type === 'number' && e.target.value !== '' ? Number(e.target.value) : e.target.value)
                    }
                  />
                )}
                {f.help && <small className="helper mt-1">{f.help}</small>}
              </div>
            ))}
          </div>
          <div className="d-flex justify-content-end gap-2 mt-4">
            {onDelete && (
              <button type="button" className="btn btn-outline-danger me-auto" onClick={onDelete}>
                <i className="bi bi-trash" /> Excluir
              </button>
            )}
            <button type="button" className="btn btn-soft" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-raify">{submitLabel || 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------- Lista genérica (tabela + busca + filtros + cadastro) ----------
// Usada pelas telas de Produtores, Diagnóstico, Histórico, Equipamentos e Laudos.
export function AgroListPage({
  title,
  subtitle,
  module,
  demo,
  fields,
  columns,
  actionLabel,
  searchKeys,
  searchPlaceholder = 'Buscar...',
  filters = [],
  extraFilter,
  toolbarExtra,
  onRowClick,
  pageSize = 0,
  what,
  header,
  initialForm = {},
  initialFilters = {},
  sortBy
}) {
  const list = useAgroList(module, demo);
  const [q, setQ] = useState('');
  const [fv, setFv] = useState(initialFilters);
  const [form, setForm] = useState(null);
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    const out = list.items.filter(
      (it) =>
        (!term || searchKeys.some((k) => String(it[k] ?? '').toLowerCase().includes(term))) &&
        filters.every((f) => !fv[f.key] || String(it[f.key]) === fv[f.key]) &&
        (!extraFilter || extraFilter(it))
    );
    // Ordena por um campo (ex.: data), do maior para o menor.
    return sortBy ? out.sort((a, b) => String(b[sortBy] ?? '').localeCompare(String(a[sortBy] ?? ''))) : out;
  }, [list.items, q, fv, extraFilter, sortBy]);
  useEffect(() => setPage(1), [q, fv, extraFilter]);

  const pages = pageSize ? Math.max(1, Math.ceil(filtered.length / pageSize)) : 1;
  const rows = pageSize ? filtered.slice((page - 1) * pageSize, page * pageSize) : filtered;

  async function save() {
    try {
      const { id, ...body } = form;
      if (id) {
        const updated = await api.update(module, id, body);
        list.setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
      } else {
        const created = await api.create(module, body);
        list.setItems((prev) => [created, ...(prev || [])]);
      }
      setForm(null);
    } catch (e) {
      list.setError(e.message);
    }
  }
  async function del(id) {
    if (!confirm('Excluir este registro?')) return;
    try {
      await api.remove(module, id);
      list.setItems((prev) => prev.filter((it) => it.id !== id));
    } catch (e) {
      list.setError(e.message);
    }
  }

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          fields && (
            <button className="btn btn-raify" onClick={() => setForm({ ...initialForm })}>
              + {actionLabel}
            </button>
          )
        }
      />
      {header}
      {list.error && <div className="alert alert-warning">{list.error}</div>}
      <DemoNotice show={list.isDemo} what={what} />
      <div className="raify-card ag-table-card">
        <div className="ag-toolbar">
          <SearchBox value={q} onChange={setQ} placeholder={searchPlaceholder} />
          {filters.map((f) => (
            <select
              key={f.key}
              className="form-select ag-filter"
              value={fv[f.key] || ''}
              onChange={(e) => setFv({ ...fv, [f.key]: e.target.value })}
            >
              <option value="">{f.label}</option>
              {(f.options || [...new Set(list.items.map((it) => it[f.key]).filter(Boolean))]).map(
                (o) => (
                  <option key={o}>{o}</option>
                )
              )}
            </select>
          ))}
          {toolbarExtra}
        </div>
        <div className="table-responsive">
          <table className="table ag-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.label}>{c.label}</th>
                ))}
                <th />
              </tr>
            </thead>
            <tbody>
              {list.loading ? (
                <tr>
                  <td colSpan={columns.length + 1} className="empty-table">
                    Carregando...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 1} className="empty-table">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                rows.map((it) => (
                  <tr
                    key={it.id}
                    className={onRowClick ? 'clickable' : ''}
                    onClick={() => onRowClick?.(it, list.isDemo)}
                  >
                    {columns.map((c) => (
                      <td key={c.label}>{c.render ? c.render(it) : it[c.key] ?? '—'}</td>
                    ))}
                    <td className="text-end ag-row-actions" onClick={(e) => e.stopPropagation()}>
                      {!list.isDemo && fields && (
                        <>
                          <button className="ag-icon-btn" title="Editar" onClick={() => setForm(it)}>
                            <i className="bi bi-pencil" />
                          </button>
                          <button className="ag-icon-btn danger" title="Excluir" onClick={() => del(it.id)}>
                            <i className="bi bi-trash" />
                          </button>
                        </>
                      )}
                      {onRowClick && (
                        <button className="ag-icon-btn" onClick={() => onRowClick(it, list.isDemo)}>
                          <i className="bi bi-chevron-right" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        {pageSize > 0 && pages > 1 && (
          <div className="ag-pagination">
            <button disabled={page === 1} onClick={() => setPage(page - 1)}>
              <i className="bi bi-chevron-left" />
            </button>
            {Array.from({ length: pages }, (_, i) => (
              <button key={i} className={page === i + 1 ? 'active' : ''} onClick={() => setPage(i + 1)}>
                {i + 1}
              </button>
            ))}
            <button disabled={page === pages} onClick={() => setPage(page + 1)}>
              <i className="bi bi-chevron-right" />
            </button>
          </div>
        )}
      </div>
      {form && fields && (
        <FormModal
          title={`${form.id ? 'Editar' : actionLabel}`}
          fields={fields}
          value={form}
          onChange={setForm}
          onSubmit={save}
          onClose={() => setForm(null)}
        />
      )}
    </>
  );
}

// ---------- Gráficos simples em SVG ----------
export function Donut({ value = 0, size = 120, stroke = 14, label, color = 'var(--raify-primary)' }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.max(0, Math.min(100, Number(value) || 0));
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ag-donut">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--raify-soft)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(v / 100) * c} ${c}`}
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="ag-donut-label">
        {label ?? `${Math.round(v)}%`}
      </text>
    </svg>
  );
}

// Rosca com várias fatias (ex.: despesas por categoria).
export const SERIES = ['#5B3FD9', '#8B72EC', '#B7A6F4', '#3FA7D6', '#F2A541', '#D6455D'];
export function MultiDonut({ parts, size = 170, stroke = 26, center }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="ag-donut">
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--raify-soft)" strokeWidth={stroke} />
      {parts.map((p, i) => {
        const len = (p.value / total) * c;
        const el = (
          <circle
            key={p.label}
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={SERIES[i % SERIES.length]}
            strokeWidth={stroke}
            strokeDasharray={`${Math.max(0, len - 2)} ${c}`}
            strokeDashoffset={-acc}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        );
        acc += len;
        return el;
      })}
      <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" className="ag-donut-label small">
        {center}
      </text>
    </svg>
  );
}

export function LineChart({ points, labels, height = 170 }) {
  const w = 520;
  const max = Math.max(...points) * 1.15 || 1;
  const min = Math.min(...points) * 0.85;
  const xy = points.map((p, i) => [
    20 + (i * (w - 40)) / Math.max(1, points.length - 1),
    height - 20 - ((p - min) / (max - min || 1)) * (height - 40)
  ]);
  const line = xy.map((p) => p.join(',')).join(' ');
  const area = `20,${height - 10} ${line} ${w - 20},${height - 10}`;
  return (
    <>
      <svg viewBox={`0 0 ${w} ${height}`} className="ag-line" preserveAspectRatio="none">
        <defs>
          <linearGradient id="agLineFill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" style={{ stopColor: 'var(--raify-primary)', stopOpacity: 0.22 }} />
            <stop offset="100%" style={{ stopColor: 'var(--raify-primary)', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <polygon points={area} fill="url(#agLineFill)" />
        <polyline points={line} fill="none" style={{ stroke: 'var(--raify-primary)' }} strokeWidth="3" />
        {xy.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="5" fill="#fff" style={{ stroke: 'var(--raify-primary)' }} strokeWidth="3" />
        ))}
      </svg>
      <div className="chart-labels">
        {labels.map((l) => (
          <span key={l}>{l}</span>
        ))}
      </div>
    </>
  );
}

// ---------- Exportar CSV (navegador e celular) ----------
export async function exportCsv(filename, rows) {
  if (!rows.length) {
    alert('Não há dados para exportar neste período.');
    return;
  }
  const cols = Object.keys(rows[0]);
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = '﻿' + [cols.map(esc).join(';'), ...rows.map((r) => cols.map((c) => esc(r[c])).join(';'))].join('\n');
  if (Capacitor.isNativePlatform()) {
    const salvo = await Filesystem.writeFile({
      path: filename,
      data: csv,
      directory: Directory.Cache,
      encoding: Encoding.UTF8
    });
    await Share.share({ title: filename, url: salvo.uri });
  } else {
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = filename;
    a.click();
    URL.revokeObjectURL(a.href);
  }
}
