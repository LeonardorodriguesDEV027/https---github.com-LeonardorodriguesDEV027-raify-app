import React from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Brand from '../components/Brand';
import { homeFor } from '../components/roleHome';

// Primeiro passo do cadastro: a pessoa escolhe o tipo de conta.
export default function Caminho() {
  const nav = useNavigate();
  const { authenticated, loading, user } = useAuth();
  if (!loading && authenticated) return <Navigate to={homeFor(user?.tipoUsuario)} replace />;
  return (
    <div className="path-page">
      <div className="path-card">
        <Brand />
        <h1>Como deseja se cadastrar?</h1>
        <p>Escolha o tipo de conta mais adequado ao seu perfil.</p>
        <div className="path-grid">
          <button onClick={() => nav('/cadastro?tipo=produtor')}>
            <i className="bi bi-flower1" />
            <b>Sou Agricultor</b>
            <span>Propriedade, safra, transição, solo, custos e certificação.</span>
          </button>
          <button onClick={() => nav('/cadastro?tipo=agronomo')}>
            <i className="bi bi-person-badge" />
            <b>Sou Agrônomo</b>
            <span>Acompanhamento técnico, recomendações e produtores vinculados. Requer aprovação.</span>
          </button>
        </div>
        <p className="mt-4">
          Já tem uma conta? <Link to="/login">Entrar</Link>
        </p>
      </div>
    </div>
  );
}
