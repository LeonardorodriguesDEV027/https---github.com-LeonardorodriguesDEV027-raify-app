import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';
import { PREFS_KEY, initials, loadPrefs } from './shared';

const SECTIONS = [
  ['conta', 'bi-person', 'Conta'],
  ['notificacoes', 'bi-bell', 'Notificações'],
  ['preferencias', 'bi-sliders', 'Preferências'],
  ['seguranca', 'bi-shield-lock', 'Segurança'],
  ['integracoes', 'bi-plug', 'Integrações']
];

function Toggle({ label, desc, checked, onChange }) {
  return (
    <label className="ag-toggle">
      <span>
        <b>{label}</b>
        <small>{desc}</small>
      </span>
      <input type="checkbox" className="form-check-input" checked={!!checked} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

export default function AgroConfiguracoes() {
  const { user } = useAuth();
  const [sec, setSec] = useState('conta');
  const [edit, setEdit] = useState(false);
  const [f, setF] = useState({ nomeCompleto: user?.nomeCompleto || '', telefone: user?.telefone || '' });
  const [prefs, setPrefs] = useState(loadPrefs);
  const [msg, setMsg] = useState(null);

  const setPref = (k, v) => {
    const next = { ...prefs, [k]: v };
    setPrefs(next);
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(next));
    } catch {
      /* armazenamento indisponível: mantém só na sessão */
    }
  };

  async function saveAccount() {
    try {
      await api.updateProfile(f);
      setEdit(false);
      setMsg({ ok: true, text: 'Dados atualizados. Entre novamente para atualizar toda a sessão.' });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    }
  }
  async function resetPassword() {
    try {
      await api.forgot(user?.email);
      setMsg({ ok: true, text: `Enviamos um link para redefinir a senha para ${user?.email}.` });
    } catch (e) {
      setMsg({ ok: false, text: e.message });
    }
  }

  return (
    <>
      <PageHeader title="Configurações" subtitle="Personalize o sistema de acordo com suas necessidades." />
      <div className="ag-settings">
        <nav className="raify-card p-2">
          {SECTIONS.map(([k, icon, l]) => (
            <button
              key={k}
              className={sec === k ? 'active' : ''}
              onClick={() => {
                setSec(k);
                setMsg(null);
              }}
            >
              <i className={`bi ${icon}`} /> {l}
            </button>
          ))}
        </nav>
        <div className="raify-card p-4">
          {msg && <div className={`alert ${msg.ok ? 'alert-success' : 'alert-warning'}`}>{msg.text}</div>}

          {sec === 'conta' && (
            <>
              <div className="card-title-row">
                <h3>Dados da conta</h3>
                {!edit && (
                  <button className="ag-link" onClick={() => setEdit(true)}>
                    Editar
                  </button>
                )}
              </div>
              <div className="ag-account">
                <span className="ag-avatar">{initials(user?.nomeCompleto)}</span>
                <span>
                  <b>{user?.nomeCompleto}</b>
                  <small>{user?.email}</small>
                </span>
              </div>
              <div className="form-grid">
                <div>
                  <label>Nome</label>
                  <input className="form-control" disabled={!edit} value={f.nomeCompleto} onChange={(e) => setF({ ...f, nomeCompleto: e.target.value })} />
                </div>
                <div>
                  <label>E-mail</label>
                  <input className="form-control" disabled value={user?.email || ''} />
                </div>
                <div>
                  <label>Telefone</label>
                  <input className="form-control" disabled={!edit} value={f.telefone} onChange={(e) => setF({ ...f, telefone: e.target.value })} />
                </div>
                <div>
                  <label>Idioma</label>
                  <select className="form-select" value={prefs.idioma || 'pt-BR'} onChange={(e) => setPref('idioma', e.target.value)}>
                    <option value="pt-BR">Português (BR)</option>
                  </select>
                </div>
              </div>
              {edit && (
                <div className="d-flex justify-content-end gap-2 mt-3">
                  <button className="btn btn-soft" onClick={() => setEdit(false)}>
                    Cancelar
                  </button>
                  <button className="btn btn-raify" onClick={saveAccount}>
                    Salvar alterações
                  </button>
                </div>
              )}
            </>
          )}

          {sec === 'notificacoes' && (
            <>
              <h3>Notificações</h3>
              <p className="ag-muted small">
                O envio de notificações ainda não está ativo. Suas escolhas ficam salvas neste aparelho
                para quando o recurso for liberado.
              </p>
              <Toggle label="Lembretes de atividades" desc="Avisar sobre atividades do calendário." checked={prefs.notifAtividades ?? true} onChange={(v) => setPref('notifAtividades', v)} />
              <Toggle label="Novos laudos" desc="Avisar quando um resultado de análise for registrado." checked={prefs.notifLaudos ?? true} onChange={(v) => setPref('notifLaudos', v)} />
              <Toggle label="Manutenção de equipamentos" desc="Lembrar de manutenções agendadas." checked={prefs.notifEquip} onChange={(v) => setPref('notifEquip', v)} />
            </>
          )}

          {sec === 'preferencias' && (
            <>
              <h3>Preferências</h3>
              <Toggle label="Mostrar dados de exemplo" desc="Exibir exemplos nas telas enquanto não houver cadastros." checked={prefs.demo ?? true} onChange={(v) => setPref('demo', v)} />
              <Toggle label="Recolher resumo do dashboard" desc="Abrir o dashboard com o painel roxo recolhido." checked={prefs.heroCollapsed} onChange={(v) => setPref('heroCollapsed', v)} />
            </>
          )}

          {sec === 'seguranca' && (
            <>
              <h3>Segurança</h3>
              <p className="ag-muted">Para trocar sua senha, enviaremos um link seguro para o seu e-mail.</p>
              <button className="btn btn-raify" onClick={resetPassword}>
                <i className="bi bi-key" /> Enviar link de redefinição de senha
              </button>
            </>
          )}

          {sec === 'integracoes' && (
            <>
              <h3>Integrações</h3>
              {[
                ['bi-cloud-sun', 'Previsão do tempo', 'Ativa no dashboard do agricultor.', true],
                ['bi-geo-alt', 'OpenStreetMap', 'Usado no Mapa das Propriedades.', true],
                ['bi-file-earmark-spreadsheet', 'Exportação CSV', 'Relatórios compatíveis com Excel.', true]
              ].map(([icon, n, d, on]) => (
                <div className="ag-integration" key={n}>
                  <span className="ag-ico">
                    <i className={`bi ${icon}`} />
                  </span>
                  <span>
                    <b>{n}</b>
                    <small>{d}</small>
                  </span>
                  <span className={`ag-pill ${on ? 'ok' : 'muted'}`}>{on ? 'Ativa' : 'Inativa'}</span>
                </div>
              ))}
            </>
          )}
        </div>
      </div>
    </>
  );
}
