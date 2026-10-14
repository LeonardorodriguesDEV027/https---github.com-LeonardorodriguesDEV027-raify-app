import React, { useMemo, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { SearchBox, exportCsv, initials } from '../agro/shared';
import { DetailModal, PERFIL_LABEL, UserStatusPill, byNewest, fmtAny, useUsers, userStatus } from './adminShared';

// Uma tela para todos os cadastros. As variações (Agricultores, Agrônomos,
// Aprovações) só mudam o filtro fixo e os textos.
export default function AdminUsuarios({ perfil = '', pendingOnly = false, title = 'Usuários', subtitle }) {
  const { user: me } = useAuth();
  const { users, loading, error, setError, patch } = useUsers();
  const [q, setQ] = useState('');
  const [fPerfil, setFPerfil] = useState('');
  const [fStatus, setFStatus] = useState('');
  const [sel, setSel] = useState(null);
  const [busy, setBusy] = useState('');

  const rows = useMemo(() => {
    const t = q.trim().toLowerCase();
    return [...users]
      .filter((u) => (!perfil || u.tipoUsuario === perfil) && (!fPerfil || u.tipoUsuario === fPerfil))
      .filter((u) => !pendingOnly || userStatus(u) === 'Aguardando aprovação')
      .filter((u) => !fStatus || userStatus(u) === fStatus)
      .filter(
        (u) =>
          !t ||
          [u.nomeCompleto, u.email, u.telefone, u.cpf, u.crea].some((v) => String(v ?? '').toLowerCase().includes(t))
      )
      .sort(byNewest);
  }, [users, q, fPerfil, fStatus, perfil, pendingOnly]);

  async function change(u, body, label) {
    if (label && !confirm(`${label} ${u.nomeCompleto || u.email}?`)) return;
    setBusy(u.id);
    try {
      await api.updateUser(u.id, body);
      patch(u.id, body);
      if (sel?.id === u.id) setSel({ ...sel, ...body });
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  }

  const isMe = (u) => u.id === me?.uid;

  function Actions({ u }) {
    const blocked = u.status === 'BLOQUEADO';
    return (
      <>
        {u.tipoUsuario === 'agronomo' &&
          (u.aprovado === false ? (
            <button className="btn btn-sm btn-raify" disabled={busy === u.id} onClick={() => change(u, { aprovado: true })}>
              <i className="bi bi-check2" /> Aprovar
            </button>
          ) : (
            <button className="btn btn-sm btn-soft" disabled={busy === u.id} onClick={() => change(u, { aprovado: false }, 'Suspender a aprovação de')}>
              Suspender
            </button>
          ))}
        {!isMe(u) && (
          <button
            className={`btn btn-sm ${blocked ? 'btn-soft' : 'btn-outline-danger'}`}
            disabled={busy === u.id}
            onClick={() =>
              change(u, { status: blocked ? 'ATIVO' : 'BLOQUEADO' }, blocked ? 'Desbloquear' : 'Bloquear')
            }
          >
            {blocked ? 'Desbloquear' : 'Bloquear'}
          </button>
        )}
      </>
    );
  }

  const pendentes = users.filter((u) => userStatus(u) === 'Aguardando aprovação').length;

  return (
    <>
      <PageHeader
        title={title}
        subtitle={subtitle}
        action={
          <button
            className="btn btn-soft"
            onClick={() =>
              exportCsv(
                `${title.toLowerCase()}.csv`,
                rows.map((u) => ({
                  Nome: u.nomeCompleto,
                  'E-mail': u.email,
                  Telefone: u.telefone,
                  Perfil: PERFIL_LABEL[u.tipoUsuario] || u.tipoUsuario,
                  CPF: u.cpf,
                  CREA: u.crea,
                  Status: userStatus(u),
                  'Cadastrado em': fmtAny(u.criadoEm)
                }))
              )
            }
          >
            <i className="bi bi-download" /> Exportar CSV
          </button>
        }
      />
      {error && <div className="alert alert-warning">{error}</div>}
      {!pendingOnly && pendentes > 0 && perfil !== 'produtor' && (
        <div className="ag-demo">
          <i className="bi bi-hourglass-split" /> {pendentes} agrônomo(s) aguardando aprovação.
        </div>
      )}
      <div className="raify-card ag-table-card">
        <div className="ag-toolbar">
          <SearchBox value={q} onChange={setQ} placeholder="Buscar por nome, e-mail, telefone, CPF ou CREA" />
          {!perfil && !pendingOnly && (
            <select className="form-select ag-filter" value={fPerfil} onChange={(e) => setFPerfil(e.target.value)}>
              <option value="">Todos os perfis</option>
              {Object.entries(PERFIL_LABEL).map(([k, l]) => (
                <option key={k} value={k}>
                  {l}
                </option>
              ))}
            </select>
          )}
          {!pendingOnly && (
            <select className="form-select ag-filter" value={fStatus} onChange={(e) => setFStatus(e.target.value)}>
              <option value="">Todos os status</option>
              <option>Ativo</option>
              <option>Aguardando aprovação</option>
              <option>Bloqueado</option>
            </select>
          )}
          <span className="ms-auto align-self-center ag-muted small">{rows.length} usuário(s)</span>
        </div>
        <div className="table-responsive">
          <table className="table ag-table">
            <thead>
              <tr>
                <th>Nome</th>
                <th>Contato</th>
                <th>Documento</th>
                <th>Perfil</th>
                <th>Status</th>
                <th>Cadastro</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    Carregando...
                  </td>
                </tr>
              ) : rows.length === 0 ? (
                <tr>
                  <td colSpan="7" className="empty-table">
                    {pendingOnly ? 'Nenhum agrônomo aguardando aprovação.' : 'Nenhum usuário encontrado.'}
                  </td>
                </tr>
              ) : (
                rows.map((u) => (
                  <tr key={u.id} className="clickable" onClick={() => setSel(u)}>
                    <td>
                      <span className="ag-person">
                        <span className="avatar-small">{initials(u.nomeCompleto || u.email)}</span>
                        {u.nomeCompleto || '—'}
                        {isMe(u) && <span className="ag-pill info">você</span>}
                      </span>
                    </td>
                    <td>
                      <div>{u.email || '—'}</div>
                      {u.telefone && <small className="ag-muted">{u.telefone}</small>}
                    </td>
                    <td className="text-nowrap">{u.tipoUsuario === 'agronomo' ? `CREA: ${u.crea || '—'}` : `CPF: ${u.cpf || '—'}`}</td>
                    <td>{PERFIL_LABEL[u.tipoUsuario] || u.tipoUsuario}</td>
                    <td>
                      <UserStatusPill u={u} />
                    </td>
                    <td>{fmtAny(u.criadoEm)}</td>
                    <td className="text-end ag-row-actions" onClick={(e) => e.stopPropagation()}>
                      <div className="d-inline-flex gap-1">
                        <Actions u={u} />
                      </div>
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
          title={sel.nomeCompleto || sel.email}
          item={{
            perfil: PERFIL_LABEL[sel.tipoUsuario],
            situacao: userStatus(sel),
            nomeCompleto: sel.nomeCompleto,
            email: sel.email,
            telefone: sel.telefone,
            cpf: sel.cpf,
            crea: sel.crea,
            criadoEm: sel.criadoEm,
            atualizadoEm: sel.atualizadoEm
          }}
          onClose={() => setSel(null)}
          extra={
            <div className="mt-3">
              {!isMe(sel) && (
                <>
                  <label>Alterar perfil</label>
                  <select
                    className="form-select mb-3"
                    value={sel.tipoUsuario}
                    onChange={(e) =>
                      change(
                        sel,
                        { tipoUsuario: e.target.value, ...(e.target.value === 'agronomo' ? {} : { aprovado: true }) },
                        `Mudar para ${PERFIL_LABEL[e.target.value]} o usuário`
                      )
                    }
                  >
                    {Object.entries(PERFIL_LABEL).map(([k, l]) => (
                      <option key={k} value={k}>
                        {l}
                      </option>
                    ))}
                  </select>
                </>
              )}
              <div className="d-flex flex-wrap gap-2 justify-content-end">
                <Actions u={sel} />
              </div>
            </div>
          }
        />
      )}
    </>
  );
}
