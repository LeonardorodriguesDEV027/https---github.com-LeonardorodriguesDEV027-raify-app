import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import { initials } from '../agro/shared';
import { PERFIL_LABEL, UserStatusPill, byNewest, fmtAny, useUsers, userStatus } from './adminShared';

export default function AdminDashboard() {
  const { user } = useAuth();
  const { users, error, setError, patch } = useUsers();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.adminStats().then(setStats).catch(() => setStats(null));
  }, []);

  const count = (p) => users.filter((u) => u.tipoUsuario === p).length;
  const pendentes = users.filter((u) => userStatus(u) === 'Aguardando aprovação');
  const bloqueados = users.filter((u) => u.status === 'BLOQUEADO').length;
  const recentes = [...users].sort(byNewest).slice(0, 6);

  async function aprovar(u) {
    try {
      await api.updateUser(u.id, { aprovado: true });
      patch(u.id, { aprovado: true });
    } catch (e) {
      setError(e.message);
    }
  }

  const kpis = [
    ['bi-people', users.length, 'Usuários'],
    ['bi-flower1', count('produtor'), 'Agricultores'],
    ['bi-person-badge', count('agronomo'), 'Agrônomos'],
    ['bi-hourglass-split', pendentes.length, 'Aprovações pendentes']
  ];
  const secondary = [
    ['bi-house-heart', stats ? stats.propriedades + stats.propriedadesAgro : '—', 'Propriedades', '/admin/propriedades'],
    ['bi-clipboard-data', stats?.diagnosticos ?? '—', 'Diagnósticos', '/admin/diagnosticos'],
    ['bi-list-check', stats?.planosAtivos ?? '—', 'Planos de transição', '/admin/planos'],
    ['bi-chat-dots', stats?.mensagens ?? '—', 'Mensagens de suporte', '/admin/suporte'],
    ['bi-slash-circle', bloqueados, 'Usuários bloqueados', '/admin/usuarios']
  ];

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Painel do Administrador</h1>
          <p>Olá, {(user?.nomeCompleto || 'Admin').split(' ')[0]}! Visão geral de todo o RAIFY.</p>
        </div>
      </div>
      {error && <div className="alert alert-warning">{error}</div>}

      <div className="ag-hero">
        {kpis.map(([icon, v, l]) => (
          <div className="ag-hero-kpi" key={l}>
            <i className={`bi ${icon}`} />
            <div>
              <b>{v}</b>
              <span>{l}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="adm-stats mt-3">
        {secondary.map(([icon, v, l, to]) => (
          <Link className="raify-card adm-stat" to={to} key={l}>
            <span className="ag-ico">
              <i className={`bi ${icon}`} />
            </span>
            <span>
              <b>{v}</b>
              <small>{l}</small>
            </span>
          </Link>
        ))}
      </div>

      <div className="ag-grid-2 adm-grid-2 mt-3">
        <div className="raify-card p-4">
          <div className="card-title-row">
            <h3>Agrônomos aguardando aprovação</h3>
            <Link to="/admin/aprovacoes">Ver todos</Link>
          </div>
          {pendentes.length === 0 ? (
            <p className="ag-muted mb-0 mt-2">Nenhuma aprovação pendente.</p>
          ) : (
            pendentes.slice(0, 5).map((u) => (
              <div className="adm-row" key={u.id}>
                <span className="avatar-small">{initials(u.nomeCompleto)}</span>
                <span>
                  <b>{u.nomeCompleto}</b>
                  <small>
                    {u.email} • CREA {u.crea || '—'}
                  </small>
                </span>
                <button className="btn btn-sm btn-raify" onClick={() => aprovar(u)}>
                  <i className="bi bi-check2" /> Aprovar
                </button>
              </div>
            ))
          )}
        </div>
        <div className="raify-card p-4">
          <div className="card-title-row">
            <h3>Cadastros recentes</h3>
            <Link to="/admin/usuarios">Ver usuários</Link>
          </div>
          {recentes.map((u) => (
            <div className="adm-row" key={u.id}>
              <span className="avatar-small">{initials(u.nomeCompleto || u.email)}</span>
              <span>
                <b>{u.nomeCompleto || u.email}</b>
                <small>
                  {PERFIL_LABEL[u.tipoUsuario] || u.tipoUsuario} • {fmtAny(u.criadoEm)}
                </small>
              </span>
              <UserStatusPill u={u} />
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
