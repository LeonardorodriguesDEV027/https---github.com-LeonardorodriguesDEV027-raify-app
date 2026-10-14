import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { FormModal, StatusPill, fmtDate, fmtNum } from './shared';
import { equipIcon, equipmentFields } from './AgroEquipamentos';

const maintFields = [
  { key: 'data', label: 'Data', type: 'date', required: true },
  { key: 'descricao', label: 'Serviço realizado', required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Agendada', 'Concluída'] }
];
const useFields = [
  { key: 'data', label: 'Data', type: 'date', required: true },
  { key: 'atividade', label: 'Atividade', required: true },
  { key: 'propriedade', label: 'Propriedade' },
  { key: 'operador', label: 'Operador' }
];

export default function AgroEquipamentoDetalhe() {
  const { id } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();
  const [e, setE] = useState(state || null);
  const [error, setError] = useState('');
  // modal: { kind: 'edit' | 'maint' | 'use', value }
  const [modal, setModal] = useState(null);
  const isDemo = !!state;

  useEffect(() => {
    if (state) return;
    api
      .get('agroEquipment', id)
      .then(setE)
      .catch((err) => setError(err.message));
  }, [id]);

  if (error)
    return (
      <div className="alert alert-warning">
        {error} — <Link to="/agro/equipamentos">voltar</Link>
      </div>
    );
  if (!e) return <p className="ag-muted">Carregando...</p>;

  const manutencoes = [...(e.manutencoes || [])].sort((a, b) => String(b.data).localeCompare(a.data));
  const usos = [...(e.usos || [])].sort((a, b) => String(b.data).localeCompare(a.data));

  async function save() {
    try {
      let body;
      if (modal.kind === 'edit') {
        const { id: _id, ...rest } = modal.value;
        body = rest;
      } else if (modal.kind === 'maint') {
        const list = [...(e.manutencoes || []), modal.value];
        const last = list.filter((m) => m.status !== 'Agendada').map((m) => m.data).sort().pop();
        body = { manutencoes: list, ...(last ? { ultimaManutencao: last } : {}) };
      } else {
        body = { usos: [...(e.usos || []), modal.value] };
      }
      setE(await api.update('agroEquipment', id, body));
      setModal(null);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <>
      <button className="ag-back" onClick={() => nav('/agro/equipamentos')}>
        <i className="bi bi-chevron-left" /> Voltar
      </button>
      <div className="page-heading">
        <div>
          <h1>{e.nome}</h1>
          <p>Equipamento utilizado nas operações de campo e manutenções registradas.</p>
        </div>
        {!isDemo && (
          <button className="btn btn-soft" onClick={() => setModal({ kind: 'edit', value: e })}>
            <i className="bi bi-pencil" /> Editar
          </button>
        )}
      </div>

      <div className="ag-equip-top">
        <div className="raify-card ag-equip-photo">
          <i className={`bi ${equipIcon(e.tipo)}`} />
        </div>
        <div className="raify-card p-4">
          <h3>Informações</h3>
          {[
            ['Modelo', e.modelo],
            ['Tipo', e.tipo],
            ['Ano', e.ano],
            ['Horas de uso', e.horas ? `${fmtNum(e.horas)} h` : null],
            ['Capacidade', e.capacidade]
          ].map(([k, v]) => (
            <div className="ag-kv" key={k}>
              <span>{k}</span>
              <b>{v || '—'}</b>
            </div>
          ))}
          <div className="ag-kv">
            <span>Status</span>
            <StatusPill value={e.status} />
          </div>
        </div>
        <div className="raify-card p-4">
          <div className="card-title-row">
            <h3>Manutenções</h3>
            {!isDemo && (
              <button className="ag-link" onClick={() => setModal({ kind: 'maint', value: { status: 'Concluída' } })}>
                + Registrar
              </button>
            )}
          </div>
          {manutencoes.length ? (
            manutencoes.map((m, i) => (
              <div className="ag-maint" key={i}>
                <i className="bi bi-wrench-adjustable" />
                <span>{fmtDate(m.data)}</span>
                <span>{m.descricao}</span>
                <StatusPill value={m.status} />
              </div>
            ))
          ) : (
            <p className="ag-muted mb-0">Nenhuma manutenção registrada.</p>
          )}
        </div>
      </div>

      <div className="raify-card ag-table-card mt-3">
        <div className="card-title-row p-3 pb-0">
          <h3>Histórico de uso</h3>
          {!isDemo && (
            <button className="ag-link" onClick={() => setModal({ kind: 'use', value: {} })}>
              + Registrar uso
            </button>
          )}
        </div>
        <div className="table-responsive">
          <table className="table ag-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Atividade</th>
                <th>Propriedade</th>
                <th>Operador</th>
              </tr>
            </thead>
            <tbody>
              {usos.length ? (
                usos.map((u, i) => (
                  <tr key={i}>
                    <td>{fmtDate(u.data)}</td>
                    <td>{u.atividade}</td>
                    <td>{u.propriedade || '—'}</td>
                    <td>{u.operador || '—'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="empty-table">
                    Nenhum uso registrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modal && (
        <FormModal
          title={
            modal.kind === 'edit' ? 'Editar equipamento' : modal.kind === 'maint' ? 'Registrar manutenção' : 'Registrar uso'
          }
          fields={modal.kind === 'edit' ? equipmentFields : modal.kind === 'maint' ? maintFields : useFields}
          value={modal.value}
          onChange={(value) => setModal({ ...modal, value })}
          onSubmit={save}
          onClose={() => setModal(null)}
        />
      )}
    </>
  );
}
