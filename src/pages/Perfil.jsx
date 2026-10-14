import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
export default function Perfil() {
  const { user, logout } = useAuth();
  const [f, setF] = useState(user || {});
  const [edit, setEdit] = useState(false);
  const [senha, setSenha] = useState(null);
  const [senhaMsg, setSenhaMsg] = useState(null);
  async function trocarSenha(e) {
    e.preventDefault();
    setSenhaMsg(null);
    if (senha.nova.length < 6) return setSenhaMsg({ ok: false, text: 'A nova senha precisa ter pelo menos 6 caracteres.' });
    if (senha.nova !== senha.confirma) return setSenhaMsg({ ok: false, text: 'A confirmação não confere com a nova senha.' });
    try {
      await api.changePassword(senha.atual, senha.nova);
      setSenhaMsg({ ok: true, text: 'Senha alterada com sucesso!' });
      setSenha({ atual: '', nova: '', confirma: '' });
    } catch (err) {
      const c = String(err?.code || err?.message || '');
      setSenhaMsg({
        ok: false,
        text:
          c.includes('invalid-credential') || c.includes('wrong-password')
            ? 'Senha atual incorreta.'
            : c.includes('too-many-requests')
              ? 'Muitas tentativas. Aguarde alguns minutos e tente de novo.'
              : 'Não foi possível alterar a senha.'
      });
    }
  }
  async function save() {
    await api.updateProfile(f);
    setEdit(false);
    alert('Perfil atualizado. Entre novamente para atualizar toda a sessão.');
  }
  return (
    <>
      <PageHeader title="Meu Perfil" subtitle="Gerencie seus dados pessoais e preferências." />
      <div className="profile-wrap">
        <div className="profile-head">
          <div className="avatar-large">
            <i className="bi bi-person" />
          </div>
          <h2>{user?.nomeCompleto}</h2>
          <div className="profile-contact">
            <span>
              <i className="bi bi-envelope" /> {user?.email}
            </span>
            <span>
              <i className="bi bi-telephone" /> {user?.telefone || 'Não informado'}
            </span>
          </div>
        </div>
        <div className="profile-options">
          {[
            ['bi-person-gear', 'Opções do perfil', 'Atualize nome, telefone e outras informações.'],
            ['bi-key', 'Alterar senha', 'Troque a senha de acesso à sua conta.'],
            ['bi-sliders', 'Configurações do App', 'Notificações, aparência e preferências.'],
            [
              'bi-shield-check',
              'Política de privacidade',
              'Consulte como seus dados são tratados.'
            ],
            ['bi-stars', 'Assinatura RAIFY', 'Gerencie seu plano e assinatura.']
          ].map(([ic, t, d]) => (
            <button
              key={t}
              onClick={() => {
                if (t === 'Opções do perfil') setEdit(true);
                if (t === 'Alterar senha') {
                  setSenhaMsg(null);
                  setSenha({ atual: '', nova: '', confirma: '' });
                }
              }}
            >
              <i className={`bi ${ic}`} />
              <span>
                <b>{t}</b>
                <small>{d}</small>
              </span>
              <i className="bi bi-chevron-right" />
            </button>
          ))}
        </div>
        <button className="btn btn-outline-danger w-100 mt-3 profile-logout" onClick={logout}>
          <i className="bi bi-box-arrow-right" /> Sair da conta
        </button>
      </div>
      {senha && (
        <div className="modal d-block modal-bg">
          <div className="modal-dialog modal-dialog-centered">
            <form className="modal-content p-4" onSubmit={trocarSenha}>
              <h3>Alterar senha</h3>
              {[
                ['atual', 'Senha atual', 'current-password'],
                ['nova', 'Nova senha (mínimo 6 caracteres)', 'new-password'],
                ['confirma', 'Confirmar nova senha', 'new-password']
              ].map(([k, l, ac]) => (
                <div key={k}>
                  <label className="mt-3">{l}</label>
                  <input
                    className="form-control"
                    type="password"
                    autoComplete={ac}
                    required
                    value={senha[k]}
                    onChange={(e) => setSenha({ ...senha, [k]: e.target.value })}
                  />
                </div>
              ))}
              {senhaMsg && (
                <div className={`alert mt-3 mb-0 ${senhaMsg.ok ? 'alert-success' : 'alert-warning'}`}>{senhaMsg.text}</div>
              )}
              <div className="mt-4 d-flex gap-2 justify-content-end">
                <button type="button" className="btn btn-soft" onClick={() => setSenha(null)}>
                  Fechar
                </button>
                <button className="btn btn-raify">Salvar nova senha</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {edit && (
        <div className="modal d-block modal-bg">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content p-4">
              <h3>Editar perfil</h3>
              <label>Nome</label>
              <input
                className="form-control"
                value={f.nomeCompleto || ''}
                onChange={(e) => setF({ ...f, nomeCompleto: e.target.value })}
              />
              <label className="mt-3">Telefone</label>
              <input
                className="form-control"
                value={f.telefone || ''}
                onChange={(e) => setF({ ...f, telefone: e.target.value })}
              />
              <div className="mt-4 d-flex gap-2 justify-content-end">
                <button className="btn btn-soft" onClick={() => setEdit(false)}>
                  Cancelar
                </button>
                <button className="btn btn-raify" onClick={save}>
                  Salvar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
