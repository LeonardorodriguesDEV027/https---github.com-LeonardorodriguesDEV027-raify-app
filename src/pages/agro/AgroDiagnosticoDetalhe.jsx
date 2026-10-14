import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom';
import { api } from '../../services/api';
import { Donut, FormModal, StatusPill, exportCsv, fmtDate } from './shared';
import { dependencyLevel, diagnosticFields } from './AgroDiagnostico';

const CROP_ICONS = { café: 'bi-cup-hot', milho: 'bi-flower2', feijão: 'bi-circle', hortaliças: 'bi-flower1' };
const LEVEL_TEXT = {
  Alto: 'É recomendado intensificar as ações de transição para reduzir o uso de químicos.',
  Médio: 'A propriedade está no caminho certo. Mantenha as práticas alternativas e monitore.',
  Baixo: 'Baixa dependência química. Continue consolidando o manejo agroecológico.'
};

// "Texto da recomendação|Prioridade" em cada linha.
const parseRecs = (txt = '') =>
  String(txt)
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const [texto, prioridade = 'Média'] = l.split('|').map((s) => s.trim());
      return { texto, prioridade };
    });

export default function AgroDiagnosticoDetalhe() {
  const { id } = useParams();
  const { state } = useLocation();
  const nav = useNavigate();
  const [d, setD] = useState(state || null);
  const [error, setError] = useState('');
  const [form, setForm] = useState(null);

  useEffect(() => {
    if (state) return;
    api
      .get('agroDiagnostics', id)
      .then(setD)
      .catch((e) => setError(e.message));
  }, [id]);

  if (error)
    return (
      <div className="alert alert-warning">
        {error} — <Link to="/agro/diagnostico">voltar</Link>
      </div>
    );
  if (!d) return <p className="ag-muted">Carregando...</p>;

  const level = dependencyLevel(Number(d.dependencia) || 0);
  const recs = parseRecs(d.recomendacoes);
  const cultivos = String(d.cultivos || '')
    .split(',')
    .map((c) => c.trim())
    .filter(Boolean);
  const isDemo = !!state;

  async function save() {
    const { id: _id, ...body } = form;
    const u = await api.update('agroDiagnostics', id, body);
    setD(u);
    setForm(null);
  }

  return (
    <>
      <button className="ag-back" onClick={() => nav('/agro/diagnostico')}>
        <i className="bi bi-chevron-left" /> Voltar
      </button>
      <div className="page-heading">
        <div>
          <h1>Diagnóstico – {d.propriedade}</h1>
          <p>Última análise: {fmtDate(d.data)}</p>
        </div>
        {!isDemo && (
          <button className="btn btn-soft" onClick={() => setForm(d)}>
            <i className="bi bi-pencil" /> Editar
          </button>
        )}
      </div>

      <div className="ag-grid-2">
        <div className="raify-card p-4">
          <h3>Nível de dependência química</h3>
          <div className="ag-level-box">
            <Donut value={d.dependencia} size={130} />
            <div>
              <b className={`ag-level-title ${level.toLowerCase()}`}>{level}</b>
              <p className="ag-muted mb-2">{LEVEL_TEXT[level]}</p>
              <StatusPill value={d.status} />
            </div>
          </div>
        </div>
        <div className="raify-card p-4">
          <h3>Principais cultivos</h3>
          <ul className="ag-crops">
            {cultivos.length ? (
              cultivos.map((c) => (
                <li key={c}>
                  <i className={`bi ${CROP_ICONS[c.toLowerCase()] || 'bi-flower3'}`} /> {c}
                </li>
              ))
            ) : (
              <li className="ag-muted">Nenhum cultivo informado.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="raify-card p-4 mt-3">
        <h3>Recomendações</h3>
        {recs.length ? (
          recs.map((r) => (
            <div className="ag-rec" key={r.texto}>
              <i className="bi bi-check2-circle" />
              <span>{r.texto}</span>
              <StatusPill value={r.prioridade} />
            </div>
          ))
        ) : (
          <p className="ag-muted mb-0">Nenhuma recomendação cadastrada.</p>
        )}
      </div>

      <div className="d-flex flex-wrap gap-2 mt-3">
        <button
          className="btn btn-raify"
          onClick={() =>
            exportCsv(`diagnostico-${d.propriedade}.csv`.replace(/\s+/g, '_'), [
              {
                Propriedade: d.propriedade,
                'Data da análise': fmtDate(d.data),
                'Dependência (%)': d.dependencia,
                Nível: level,
                Status: d.status,
                Cultivos: cultivos.join(', '),
                Recomendações: recs.map((r) => `${r.texto} (${r.prioridade})`).join(' | ')
              }
            ])
          }
        >
          Gerar relatório completo
        </button>
        <button
          className="btn btn-soft"
          onClick={() => nav(`/agro/historico?propriedade=${encodeURIComponent(d.propriedade)}`)}
        >
          Ver histórico da propriedade
        </button>
      </div>

      {form && (
        <FormModal
          title="Editar diagnóstico"
          fields={diagnosticFields}
          value={form}
          onChange={setForm}
          onSubmit={save}
          onClose={() => setForm(null)}
        />
      )}
    </>
  );
}
