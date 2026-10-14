import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LineChart, StatusPill, fmtMoney, fmtNum, loadPrefs, useAgroList } from './shared';
import { demoActivities, demoFinance, demoProducers, demoProperties } from './demoData';

const avg = (arr, k) =>
  arr.length ? Math.round(arr.reduce((s, x) => s + Number(x[k] || 0), 0) / arr.length) : 0;

export default function AgroDashboard() {
  const { user } = useAuth();
  const [open, setOpen] = useState(() => !loadPrefs().heroCollapsed);
  const props = useAgroList('agroProperties', demoProperties);
  const producers = useAgroList('agroProducers', demoProducers);
  const acts = useAgroList('agroActivities', demoActivities);
  const fin = useAgroList('finance', demoFinance);

  const area = props.items.reduce((s, p) => s + Number(p.area || 0), 0);
  const transicao = avg(props.items, 'transicao');
  const custos = fin.items
    .filter((f) => f.tipo === 'Despesa')
    .reduce((s, f) => s + Number(f.valor || 0), 0);
  const recentes = [...acts.items].sort((a, b) => String(b.data).localeCompare(a.data)).slice(0, 3);
  const nome = (user?.nomeCompleto || 'Agrônomo').split(' ')[0];

  const kpis = [
    ['bi-house-heart', props.items.length, 'Propriedades ativas'],
    ['bi-people', producers.items.length, 'Produtores cadastrados'],
    ['bi-bounding-box', `${fmtNum(area)} ha`, 'Área total monitorada'],
    ['bi-bullseye', `${transicao}%`, 'Meta de transição', true]
  ];

  return (
    <>
      <div className="page-heading">
        <div>
          <h1>Bem-vindo, {nome}!</h1>
          <p>Aqui está um resumo das suas propriedades e da sua produção.</p>
        </div>
      </div>

      <div className={`ag-hero ${open ? '' : 'collapsed'}`}>
        {kpis.map(([icon, v, l, bar]) => (
          <div className="ag-hero-kpi" key={l}>
            <i className={`bi ${icon}`} />
            <div>
              <b>{v}</b>
              <span>{l}</span>
              {bar && (
                <div className="ag-hero-bar">
                  <i style={{ width: `${transicao}%` }} />
                </div>
              )}
            </div>
          </div>
        ))}
        <button className="ag-hero-toggle" onClick={() => setOpen(!open)} aria-label="Recolher">
          <i className={`bi bi-chevron-${open ? 'up' : 'down'}`} />
        </button>
      </div>

      <div className="ag-grid-2 mt-3">
        <div className="raify-card p-4">
          <div className="card-title-row">
            <h3>Progresso da Transição Agroecológica</h3>
            <b className="ag-accent">{transicao}%</b>
          </div>
          <div className="progress progress-lg">
            <div className="progress-bar" style={{ width: `${transicao}%` }} />
          </div>
          <p className="ag-muted mt-2 mb-0">
            Você está avançando bem! Continue registrando as boas práticas e acompanhando as
            recomendações.
          </p>
        </div>
        <div className="raify-card cost-card">
          <div className="cost-icon">R$</div>
          <div>
            <span>Custos totais</span>
            <strong>{fmtMoney(custos)}</strong>
            <small>Lançamentos de despesas no financeiro</small>
          </div>
        </div>
      </div>

      <div className="ag-grid-2 mt-3">
        <div className="raify-card p-4">
          <div className="card-title-row">
            <h3>Uso de Insumos e Dependência Química</h3>
            <Link to="/agro/diagnostico">Ver detalhes</Link>
          </div>
          {[
            ['Defensivos químicos', 34],
            ['Fertilizantes químicos', 47],
            ['Adubação orgânica', 72]
          ].map(([n, v]) => (
            <div className="npk-row" key={n}>
              <span>{n}</span>
              <div className="progress">
                <div className="progress-bar" style={{ width: `${v}%` }} />
              </div>
              <b>{v}%</b>
            </div>
          ))}
        </div>
        <div className="raify-card p-4">
          <div className="card-title-row">
            <h3>Atividades recentes</h3>
            <Link to="/agro/historico">Ver todas</Link>
          </div>
          {recentes.map((a) => (
            <div className="activity-row" key={a.id}>
              <div className="activity-time">{a.hora || '—'}</div>
              <div className="activity-name">
                {a.atividade}
                <small className="d-block ag-muted">{a.propriedade}</small>
              </div>
              <StatusPill value={a.status} />
            </div>
          ))}
        </div>
      </div>

      <div className="ag-grid-3 mt-3">
        <div className="raify-card p-4">
          <h3>Evolução da Produtividade (kg/ha)</h3>
          <LineChart
            points={[2100, 2350, 2300, 2620, 2780, 3050]}
            labels={['Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago']}
          />
        </div>
        <div className="raify-card p-4">
          <h3>Insumos orgânicos x químicos</h3>
          <div className="bars-compare">
            {[
              ['Mar', 42, 58],
              ['Abr', 48, 52],
              ['Mai', 57, 43],
              ['Jun', 64, 36],
              ['Jul', 71, 29],
              ['Ago', 76, 24]
            ].map(([m, o, q]) => (
              <div className="bar-month" key={m}>
                <div className="bar-stack">
                  <i style={{ height: `${o}%` }} />
                  <b style={{ height: `${q}%` }} />
                </div>
                <span>{m}</span>
              </div>
            ))}
          </div>
          <div className="legend">
            <span>
              <i className="dot org" /> Orgânicos
            </span>
            <span>
              <i className="dot chem" /> Químicos
            </span>
          </div>
        </div>
        <div className="raify-card p-4">
          <h3>Progresso da transição</h3>
          <div className="ag-timeline">
            {recentes.map((a) => (
              <div key={a.id}>
                <span>{a.hora || '—'}</span>
                <p>{a.atividade}</p>
                <StatusPill value={a.status} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
