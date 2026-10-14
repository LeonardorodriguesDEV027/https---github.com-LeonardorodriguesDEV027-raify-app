import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { SearchBox, StatusPill, exportCsv, fmtDate } from '../agro/shared';

// ---------- Formatação ----------
// Datas do Firestore chegam como Timestamp (toDate) ou texto "AAAA-MM-DD".
export function fmtAny(v) {
  if (v === null || v === undefined || v === '') return '—';
  if (typeof v?.toDate === 'function') return v.toDate().toLocaleDateString('pt-BR');
  if (v?.seconds) return new Date(v.seconds * 1000).toLocaleDateString('pt-BR');
  if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}/.test(v)) return fmtDate(v);
  if (Array.isArray(v))
    return v.map((x) => (typeof x === 'object' ? Object.values(x).join(' / ') : x)).join('; ');
  if (typeof v === 'object') return Object.values(v).join(' / ');
  if (typeof v === 'boolean') return v ? 'Sim' : 'Não';
  return String(v);
}
const tsValue = (v) =>
  typeof v?.toMillis === 'function' ? v.toMillis() : v?.seconds ? v.seconds * 1000 : 0;
export const byNewest = (a, b) => tsValue(b.criadoEm) - tsValue(a.criadoEm);

export const PERFIL_LABEL = { produtor: 'Agricultor', agronomo: 'Agrônomo', admin: 'Administrador' };
export function userStatus(u) {
  if (u.status === 'BLOQUEADO') return 'Bloqueado';
  if (u.tipoUsuario === 'agronomo' && u.aprovado === false) return 'Aguardando aprovação';
  return 'Ativo';
}
export function UserStatusPill({ u }) {
  const s = userStatus(u);
  const tone = s === 'Ativo' ? 'ok' : s === 'Bloqueado' ? 'danger' : 'warn';
  return <span className={`ag-pill ${tone}`}>{s}</span>;
}

// ---------- Usuários (cache simples compartilhado entre as telas) ----------
let usersCache = null;
export function useUsers() {
  const [users, setUsers] = useState(usersCache || []);
  const [loading, setLoading] = useState(!usersCache);
  const [error, setError] = useState('');
  const reload = () =>
    api
      .users()
      .then((u) => {
        usersCache = u;
        setUsers(u);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  useEffect(() => {
    reload();
  }, []);
  const byId = useMemo(() => Object.fromEntries(users.map((u) => [u.id, u])), [users]);
  // Atualiza um usuário na lista local sem recarregar tudo.
  const patch = (id, body) => {
    const next = users.map((u) => (u.id === id ? { ...u, ...body } : u));
    usersCache = next;
    setUsers(next);
  };
  return { users, byId, loading, error, setError, reload, patch };
}

// ---------- Modal com todos os campos de um registro ----------
const HIDDEN = new Set(['id', 'usuarioUid', 'dados', '_modulo', '_origem']);
export function DetailModal({ title, item, onClose, extra }) {
  const entries = Object.entries(item).filter(([k]) => !HIDDEN.has(k));
  return (
    <div className="modal d-block modal-bg" onClick={onClose}>
      <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content p-4">
          <div className="d-flex justify-content-between">
            <h3>{title}</h3>
            <button type="button" className="btn-close" onClick={onClose} />
          </div>
          <div className="mt-3">
            {entries.map(([k, v]) => (
              <div className="ag-kv" key={k}>
                <span>{k.replace(/([A-Z])/g, ' $1').replace(/^./, (c) => c.toUpperCase())}</span>
                <b className="text-end">{fmtAny(v)}</b>
              </div>
            ))}
          </div>
          {extra}
        </div>
      </div>
    </div>
  );
}

// ---------- Tela genérica: registros de TODOS os usuários ----------
// sources: [{ module, origem, title?(it) }] — uma ou mais coleções juntas.
// columns: [{ label, render(it) }]
export function AdminDataPage({ title, subtitle, sources, columns, searchKeys, filterKey, filterLabel }) {
  const { byId } = useUsers();
  const [items, setItems] = useState(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [origem, setOrigem] = useState('');
  const [fv, setFv] = useState('');
  const [sel, setSel] = useState(null);

  useEffect(() => {
    Promise.all(
      sources.map((s) =>
        api.adminListAll(s.module).then((rows) => rows.map((r) => ({ ...r, _modulo: s.module, _origem: s.origem })))
      )
    )
      .then((all) => setItems(all.flat().sort(byNewest)))
      .catch((e) => {
        setItems([]);
        setError(e.message);
      });
  }, []);

  const owner = (it) => byId[it.usuarioUid]?.nomeCompleto || byId[it.usuarioUid]?.email || '—';
  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return (items || []).filter(
      (it) =>
        (!origem || it._origem === origem) &&
        (!fv || String(it[filterKey]) === fv) &&
        (!t || [...searchKeys.map((k) => it[k]), owner(it)].some((v) => String(v ?? '').toLowerCase().includes(t)))
    );
  }, [items, q, origem, fv, byId]);

  async function del(it) {
    if (!confirm('Excluir este registro definitivamente?')) return;
    try {
      await api.adminRemove(it._modulo, it.id);
      setItems((prev) => prev.filter((x) => !(x.id === it.id && x._modulo === it._modulo)));
      setSel(null);
    } catch (e) {
      setError(e.message);
    }
  }

  function exportar() {
    exportCsv(
      `${title.toLowerCase().replace(/\s+/g, '-')}.csv`,
      filtered.map((it) => ({
        Origem: it._origem,
        Responsável: owner(it),
        ...Object.fromEntries(columns.map((c) => [c.label, c.csv ? c.csv(it) : fmtAny(c.key ? it[c.key] : '')]))
      }))
    );
  }

  const origens = [...new Set(sources.map((s) => s.origem))];
  const filterOptions = filterKey ? [...new Set((items || []).map((it) => it[filterKey]).filter(Boolean))] : [];

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <button className="btn btn-soft" onClick={exportar}>
            <i className="bi bi-download" /> Exportar CSV
          </button>
        }
      />
      {error && <div className="alert alert-warning">{error}</div>}
      <div className="raify-card ag-table-card">
        <div className="ag-toolbar">
          <SearchBox value={q} onChange={setQ} placeholder="Buscar..." />
          {origens.length > 1 && (
            <select className="form-select ag-filter" value={origem} onChange={(e) => setOrigem(e.target.value)}>
              <option value="">Todas as origens</option>
              {origens.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          )}
          {filterKey && (
            <select className="form-select ag-filter" value={fv} onChange={(e) => setFv(e.target.value)}>
              <option value="">{filterLabel}</option>
              {filterOptions.map((o) => (
                <option key={o}>{o}</option>
              ))}
            </select>
          )}
          <span className="ms-auto align-self-center ag-muted small">
            {filtered.length} registro(s)
          </span>
        </div>
        <div className="table-responsive">
          <table className="table ag-table">
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.label}>{c.label}</th>
                ))}
                <th>Responsável</th>
                {origens.length > 1 && <th>Origem</th>}
                <th />
              </tr>
            </thead>
            <tbody>
              {items === null ? (
                <tr>
                  <td colSpan={columns.length + 3} className="empty-table">
                    Carregando...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 3} className="empty-table">
                    Nenhum registro encontrado.
                  </td>
                </tr>
              ) : (
                filtered.map((it) => (
                  <tr key={`${it._modulo}-${it.id}`} className="clickable" onClick={() => setSel(it)}>
                    {columns.map((c) => (
                      <td key={c.label}>{c.render ? c.render(it) : fmtAny(it[c.key])}</td>
                    ))}
                    <td>{owner(it)}</td>
                    {origens.length > 1 && (
                      <td>
                        <span className="ag-pill muted">{it._origem}</span>
                      </td>
                    )}
                    <td className="text-end ag-row-actions" onClick={(e) => e.stopPropagation()}>
                      <button className="ag-icon-btn" title="Ver detalhes" onClick={() => setSel(it)}>
                        <i className="bi bi-eye" />
                      </button>
                      <button className="ag-icon-btn danger" title="Excluir" onClick={() => del(it)}>
                        <i className="bi bi-trash" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      {sel && (
        <DetailModal
          title={`${title} — detalhes`}
          item={{ responsavel: owner(sel), origem: sel._origem, ...sel }}
          onClose={() => setSel(null)}
          extra={
            <div className="d-flex justify-content-end mt-3">
              <button className="btn btn-outline-danger" onClick={() => del(sel)}>
                <i className="bi bi-trash" /> Excluir registro
              </button>
            </div>
          }
        />
      )}
    </>
  );
}

export { StatusPill };
