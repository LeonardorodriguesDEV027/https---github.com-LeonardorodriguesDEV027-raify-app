import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { HOME } from './roleHome';

// "roles" (opcional) restringe a rota a alguns tipos de usuário; quem não
// tiver o tipo certo vai para a área dele.
export default function ProtectedRoute({ children, roles }) {
  const { authenticated, loading, user, logout } = useAuth();

  // Enquanto o Firebase ainda está checando se existe uma sessão salva,
  // não redireciona para lugar nenhum — só espera. Sem isso, um usuário
  // já logado seria jogado de volta ao login por uma fração de segundo
  // toda vez que abrisse o app.
  if (loading) {
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh' }}>
        <span>Carregando...</span>
      </div>
    );
  }

  if (!authenticated) return <Navigate to="/login" replace />;
  // Mesmo com sessão aberta, bloqueado ou agrônomo sem aprovação não entra.
  const barrado =
    user?.status === 'BLOQUEADO'
      ? 'Seu usuário está bloqueado. Fale com o administrador.'
      : user?.tipoUsuario === 'agronomo' && user?.aprovado === false
        ? 'Seu cadastro de agrônomo está aguardando aprovação do administrador.'
        : '';
  if (barrado)
    return (
      <div style={{ display: 'grid', placeItems: 'center', height: '100vh', padding: 24, textAlign: 'center' }}>
        <div>
          <p>{barrado}</p>
          <button className="btn btn-raify" onClick={logout}>
            Voltar ao login
          </button>
        </div>
      </div>
    );
  if (roles && !roles.includes(user?.tipoUsuario)) {
    // Tipo desconhecido (ex.: digitado errado no Console): avisa em vez de
    // ficar redirecionando sem parar.
    if (!HOME[user?.tipoUsuario])
      return (
        <div style={{ display: 'grid', placeItems: 'center', height: '100vh', padding: 24, textAlign: 'center' }}>
          <span>
            Perfil de usuário inválido ("{user?.tipoUsuario || 'vazio'}"). Use produtor, agronomo ou admin no
            campo tipoUsuario.
          </span>
        </div>
      );
    return <Navigate to={HOME[user.tipoUsuario]} replace />;
  }
  return children;
}
