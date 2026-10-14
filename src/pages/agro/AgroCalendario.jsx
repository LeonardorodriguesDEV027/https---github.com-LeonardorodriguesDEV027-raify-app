import React, { useMemo, useState } from 'react';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { DemoNotice, FormModal, StatusPill, fmtDate, useAgroList } from './shared';
import { demoCalendar } from './demoData';

const WEEK = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
const fields = [
  { key: 'titulo', label: 'Atividade', required: true },
  { key: 'propriedade', label: 'Propriedade' },
  { key: 'data', label: 'Data', type: 'date', required: true },
  { key: 'hora', label: 'Hora', type: 'time' },
  { key: 'status', label: 'Status', type: 'select', options: ['Pendente', 'Em andamento', 'Concluída'] },
  { key: 'descricao', label: 'Descrição', type: 'textarea', full: true }
];

export default function AgroCalendario() {
  // O calendário do agrônomo usa a mesma coleção "calendario" do app,
  // cada usuário vê só os próprios eventos (regras do Firestore).
  const list = useAgroList('calendar', demoCalendar);
  const today = iso(new Date());
  const [cursor, setCursor] = useState(new Date());
  const [view, setView] = useState('Mês');
  const [selected, setSelected] = useState(today);
  const [form, setForm] = useState(null);
  const [showAll, setShowAll] = useState(false);

  const byDay = useMemo(() => {
    const m = {};
    list.items.forEach((e) => (m[e.data] = [...(m[e.data] || []), e]));
    Object.values(m).forEach((arr) => arr.sort((a, b) => String(a.hora).localeCompare(b.hora)));
    return m;
  }, [list.items]);

  // Dias exibidos na grade conforme a visão escolhida.
  const days = useMemo(() => {
    const out = [];
    if (view === 'Mês') {
      const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
      const start = new Date(first);
      start.setDate(1 - first.getDay());
      for (let i = 0; i < 42; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        out.push(d);
      }
    } else if (view === 'Semana') {
      const start = new Date(cursor);
      start.setDate(cursor.getDate() - cursor.getDay());
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        out.push(d);
      }
    }
    return out;
  }, [cursor, view]);

  function move(dir) {
    const d = new Date(cursor);
    if (view === 'Mês') d.setMonth(d.getMonth() + dir, 1);
    else d.setDate(d.getDate() + (view === 'Semana' ? 7 : 1) * dir);
    setCursor(d);
    if (view === 'Dia') setSelected(iso(d));
  }

  const upcoming = list.items
    .filter((e) => e.data >= today)
    .sort((a, b) => `${a.data}${a.hora}`.localeCompare(`${b.data}${b.hora}`));
  const dayEvents = byDay[selected] || [];

  async function save() {
    try {
      const { id, ...body } = form;
      if (id) {
        const u = await api.update('calendar', id, body);
        list.setItems((prev) => prev.map((x) => (x.id === id ? u : x)));
      } else {
        const c = await api.create('calendar', body);
        list.setItems((prev) => [c, ...prev]);
      }
      setForm(null);
    } catch (e) {
      list.setError(e.message);
    }
  }
  async function del() {
    if (!confirm('Excluir esta atividade?')) return;
    await api.remove('calendar', form.id);
    list.setItems((prev) => prev.filter((x) => x.id !== form.id));
    setForm(null);
  }
  const openEvent = (e) => !list.isDemo && setForm(e);

  const title =
    view === 'Dia' ? fmtDate(iso(cursor)) : `${MONTHS[cursor.getMonth()]} ${cursor.getFullYear()}`;

  return (
    <>
      <PageHeader
        title="Calendário"
        subtitle="Organize suas atividades e não perca nenhum compromisso."
        action={
          <button className="btn btn-raify" onClick={() => setForm({ data: selected, status: 'Pendente' })}>
            + Nova atividade
          </button>
        }
      />
      {list.error && <div className="alert alert-warning">{list.error}</div>}
      <DemoNotice show={list.isDemo} what="a primeira atividade" />
      <div className="calendar-layout">
        <div className="raify-card calendar-card">
          <div className="ag-cal-head">
            <div className="ag-cal-nav">
              <button onClick={() => move(-1)} aria-label="Anterior">
                <i className="bi bi-chevron-left" />
              </button>
              <b>{title}</b>
              <button onClick={() => move(1)} aria-label="Próximo">
                <i className="bi bi-chevron-right" />
              </button>
            </div>
            <div className="ag-seg">
              {['Mês', 'Semana', 'Dia'].map((v) => (
                <button
                  key={v}
                  className={view === v ? 'active' : ''}
                  onClick={() => {
                    setView(v);
                    if (v === 'Dia') setCursor(new Date(`${selected}T12:00:00`));
                  }}
                >
                  {v}
                </button>
              ))}
            </div>
          </div>

          {view === 'Dia' ? (
            <div className="ag-day-list">
              {(byDay[iso(cursor)] || []).length ? (
                byDay[iso(cursor)].map((e) => (
                  <button className="agenda-item" key={e.id} onClick={() => openEvent(e)}>
                    <span>
                      <b>{e.hora || '—'}</b> {e.titulo}
                      <small className="d-block ag-muted">{e.propriedade}</small>
                    </span>
                    <StatusPill value={e.status} />
                  </button>
                ))
              ) : (
                <p className="ag-muted p-3 mb-0">Nenhuma atividade neste dia.</p>
              )}
            </div>
          ) : (
            <div className="calendar-grid ag-cal-grid">
              {WEEK.map((d) => (
                <b key={d}>{d}</b>
              ))}
              {days.map((d) => {
                const k = iso(d);
                const evs = byDay[k] || [];
                const out = view === 'Mês' && d.getMonth() !== cursor.getMonth();
                return (
                  <button
                    key={k}
                    className={`${out ? 'out' : ''} ${k === today ? 'is-today' : ''} ${k === selected ? 'is-selected' : ''}`}
                    onClick={() => setSelected(k)}
                  >
                    <span>{d.getDate()}</span>
                    <span className="ag-cal-dots">
                      {evs.slice(0, 3).map((e) => (
                        <i key={e.id} className={toneDot(e.status)} />
                      ))}
                    </span>
                    {view === 'Semana' &&
                      evs.map((e) => (
                        <small key={e.id} className="ag-cal-ev">
                          {e.hora} {e.titulo}
                        </small>
                      ))}
                  </button>
                );
              })}
            </div>
          )}
          {view !== 'Dia' && (
            <div className="mt-3">
              <b>{fmtDate(selected)}</b>
              {dayEvents.length ? (
                dayEvents.map((e) => (
                  <button className="agenda-item" key={e.id} onClick={() => openEvent(e)}>
                    <span>
                      <b>{e.hora || '—'}</b> {e.titulo}
                      <small className="d-block ag-muted">{e.propriedade}</small>
                    </span>
                    <StatusPill value={e.status} />
                  </button>
                ))
              ) : (
                <p className="ag-muted mb-0">Nenhuma atividade neste dia.</p>
              )}
            </div>
          )}
        </div>

        <div className="raify-card p-4">
          <h3>Próximas atividades</h3>
          {upcoming.length === 0 && <p className="ag-muted">Nenhuma atividade agendada.</p>}
          {(showAll ? upcoming : upcoming.slice(0, 4)).map((e) => (
            <button className="ag-upcoming" key={e.id} onClick={() => openEvent(e)}>
              <span className="ag-upcoming-date">{fmtDate(e.data).slice(0, 5)}</span>
              <span>
                <b>
                  {e.hora} {e.titulo}
                </b>
                <small>{e.propriedade}</small>
              </span>
            </button>
          ))}
          {upcoming.length > 4 && (
            <button className="btn btn-raify w-100 mt-3" onClick={() => setShowAll(!showAll)}>
              {showAll ? 'Mostrar menos' : 'Ver todas as atividades'}
            </button>
          )}
        </div>
      </div>
      {form && (
        <FormModal
          title={form.id ? 'Editar atividade' : 'Nova atividade'}
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

function toneDot(status) {
  const s = String(status || '').toLowerCase();
  return s.startsWith('conclu') ? 'ok' : s === 'em andamento' ? 'info' : 'warn';
}
