import React from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { homeFor } from '../components/roleHome';
import Brand from '../components/Brand';
export default function Splash() {
  const nav = useNavigate();
  const { authenticated, loading, user } = useAuth();
  if (!loading && authenticated) return <Navigate to={homeFor(user?.tipoUsuario)} replace />;
  return (
    <div className="splash-page">
      <div className="splash-photo" />
      <div className="splash-overlay" />
      <div className="splash-brand">
        <Brand />
      </div>
      <div className="splash-content">
        <h1>Seja bem-vindo</h1>
        <p>Seu Sistema de Apoio à Transição Orgânica</p>
        <button className="btn splash-primary" onClick={() => nav('/login')}>
          Login
        </button>
        <button className="btn splash-secondary" onClick={() => nav('/caminho')}>
          Cadastrar
        </button>
      </div>
    </div>
  );
}
