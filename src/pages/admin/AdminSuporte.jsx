import React, { useEffect, useMemo, useState } from 'react';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { SearchBox, initials } from '../agro/shared';
import { PERFIL_LABEL, useUsers } from './adminShared';

const ms = (v) => (typeof v?.toMillis === 'function' ? v.toMillis() : v?.seconds ? v.seconds * 1000 : Date.now());
const hora = (v) =>
  new Date(ms(v)).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });

// Caixa de entrada do suporte: todas as conversas do Chat e os chamados
// abertos na área do agrônomo. A resposta aparece no Chat do usuário.
export default function AdminSuporte() {
  const { byId } = useUsers();
  const [msgs, setMsgs] = useState(null);
  const [error, setError] = useState('');
  const [sel, setSel] = useState('');
  const [q, setQ] = useState('');
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);

  const load = () =>
    api
      .adminListAll('supportMessages', 1000)
      .then(setMsgs)
      .catch((e) => {
        setMsgs([]);
        setError(e.message);
      });
  useEffect(() => {
    load();
  }, []);

  // Agrupa por usuário; a conversa "aguarda resposta" se a última
  // mensagem foi do usuário.
  const threads = useMemo(() => {
    const g = {};
    (msgs || []).forEach((m) => (g[m.usuarioUid] = [...(g[m.usuarioUid] || []), m]));
    return Object.entries(g)
      .map(([uid, list]) => {
        const sorted = list.sort((a, b) => ms(a.criadoEm) - ms(b.criadoEm));
        const last = sorted[sorted.length - 1];
        return { uid, list: sorted, last, pending: last.autor === 'usuario' };
      })
      .sort((a, b) => ms(b.last.criadoEm) - ms(a.last.criadoEm));
  }, [msgs]);

  const name = (uid) => byId[uid]?.nomeCompleto || byId[uid]?.email || 'Usuário';
  const visible = threads.filter((t) => !q || name(t.uid).toLowerCase().includes(q.toLowerCase()));
  const current = threads.find((t) => t.uid === sel);

  async function reply() {
    if (!text.trim() || !sel) return;
    setSending(true);
    try {
      await api.adminReply(sel, text);
      setText('');
      await load();
    } catch (e) {
      setError(e.message);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <PageHeader title="Suporte" subtitle="Responda as mensagens e chamados de agricultores e agrônomos." />
      {error && <div className="alert alert-warning">{error}</div>}
      <div className="adm-inbox">
        <div className="raify-card p-3 adm-threads">
          <SearchBox value={q} onChange={setQ} placeholder="Buscar usuário..." />
          {msgs === null && <p className="ag-muted mt-3">Carregando...</p>}
          {msgs && visible.length === 0 && <p className="ag-muted mt-3">Nenhuma conversa.</p>}
          {visible.map((t) => (
            <button key={t.uid} className={sel === t.uid ? 'active' : ''} onClick={() => setSel(t.uid)}>
              <span className="avatar-small">{initials(name(t.uid))}</span>
              <span>
                <b>{name(t.uid)}</b>
                <small>{t.last.texto}</small>
              </span>
              {t.pending && <span className="ag-pill warn">Aguardando</span>}
            </button>
          ))}
        </div>
        <div className="raify-card chat-box">
          {!current ? (
            <p className="ag-muted p-4 mb-0">Selecione uma conversa para ver as mensagens.</p>
          ) : (
            <>
              <div className="chat-person">
                <div className="avatar-small">{initials(name(current.uid))}</div>
                <div>
                  <b>{name(current.uid)}</b>
                  <span>
                    {PERFIL_LABEL[byId[current.uid]?.tipoUsuario] || ''} • {byId[current.uid]?.email}
                  </span>
                </div>
              </div>
              <div className="chat-messages">
                {current.list.map((m) => (
                  <div className={`message ${m.autor === 'usuario' ? '' : 'mine'}`} key={m.id}>
                    {m.texto}
                    <small className="d-block opacity-75 mt-1">{hora(m.criadoEm)}</small>
                  </div>
                ))}
              </div>
              <div className="chat-input">
                <input
                  placeholder="Escreva a resposta do suporte..."
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && reply()}
                />
                <button onClick={reply} disabled={sending}>
                  <i className="bi bi-send-fill" />
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
