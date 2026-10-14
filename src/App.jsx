import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import AppShell from './components/AppShell';
import Splash from './pages/Splash';
import Login from './pages/Login';
import Cadastro from './pages/Cadastro';
import Recuperar from './pages/Recuperar';
import Caminho from './pages/Caminho';
import Dashboard from './pages/Dashboard';
import Propriedades from './pages/Propriedades';
import CadastroPropriedade from './pages/CadastroPropriedade';
import Perfil from './pages/Perfil';
import Calendario from './pages/Calendario';
import Safras from './pages/Safras';
import Funcionarios from './pages/Funcionarios';
import Solo from './pages/Solo';
import Educacao from './pages/Educacao';
import Certificacao from './pages/Certificacao';
import Insumos from './pages/Insumos';
import Suporte from './pages/Suporte';
import Financeiro from './pages/Financeiro';
import Plano from './pages/Plano';
import Aplicacoes from './pages/Aplicacoes';
import Documentos from './pages/Documentos';
import Areas from './pages/Areas';
import Diagnostico from './pages/Diagnostico';
import Monitoramento from './pages/Monitoramento';
import Relatorios from './pages/Relatorios';
import Tecnico from './pages/Tecnico';
import Alternativas from './pages/Alternativas';
import Chat from './pages/Chat';
import AdminShell from './pages/admin/AdminShell';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsuarios from './pages/admin/AdminUsuarios';
import AdminSuporte from './pages/admin/AdminSuporte';
import AdminRelatorios from './pages/admin/AdminRelatorios';
import {
  AdminAreas,
  AdminAtividades,
  AdminCertificacao,
  AdminDiagnosticos,
  AdminEquipamentos,
  AdminFinanceiro,
  AdminLaudos,
  AdminManejo,
  AdminPlanos,
  AdminProducao,
  AdminProdutores,
  AdminPropriedades
} from './pages/admin/AdminDados';
import AgroShell from './pages/agro/AgroShell';
import AgroDashboard from './pages/agro/AgroDashboard';
import AgroPropriedades from './pages/agro/AgroPropriedades';
import AgroProdutores from './pages/agro/AgroProdutores';
import AgroDiagnostico from './pages/agro/AgroDiagnostico';
import AgroDiagnosticoDetalhe from './pages/agro/AgroDiagnosticoDetalhe';
import AgroHistorico from './pages/agro/AgroHistorico';
import AgroMapa from './pages/agro/AgroMapa';
import AgroEquipamentos from './pages/agro/AgroEquipamentos';
import AgroEquipamentoDetalhe from './pages/agro/AgroEquipamentoDetalhe';
import AgroCalendario from './pages/agro/AgroCalendario';
import AgroLaudos from './pages/agro/AgroLaudos';
import AgroFinanceiro from './pages/agro/AgroFinanceiro';
import AgroRelatorios from './pages/agro/AgroRelatorios';
import AgroSuporte from './pages/agro/AgroSuporte';
import AgroConfiguracoes from './pages/agro/AgroConfiguracoes';
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Splash />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/recuperar" element={<Recuperar />} />
        <Route
          path="/caminho"
          element={<Caminho />}
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute roles={['produtor']}>
              <AppShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<Dashboard />} />
          <Route path="propriedades" element={<Propriedades />} />
          <Route path="propriedades/nova" element={<CadastroPropriedade />} />
          <Route path="perfil" element={<Perfil />} />
          <Route path="calendario" element={<Calendario />} />
          <Route path="safras" element={<Safras />} />
          <Route path="funcionarios" element={<Funcionarios />} />
          <Route path="solo" element={<Solo />} />
          <Route path="educacao" element={<Educacao />} />
          <Route path="certificacao" element={<Certificacao />} />
          <Route path="insumos" element={<Insumos />} />
          <Route path="suporte" element={<Suporte />} />
          <Route path="financeiro" element={<Financeiro />} />
          <Route path="plano" element={<Plano />} />
          <Route path="aplicacoes" element={<Aplicacoes />} />
          <Route path="documentos" element={<Documentos />} />
          <Route path="admin" element={<Navigate to="/admin" replace />} />
          <Route path="areas" element={<Areas />} />
          <Route path="diagnostico" element={<Diagnostico />} />
          <Route path="monitoramento" element={<Monitoramento />} />
          <Route path="relatorios" element={<Relatorios />} />
          <Route path="tecnico" element={<Tecnico />} />
          <Route path="alternativas" element={<Alternativas />} />
          <Route path="chat" element={<Chat />} />
        </Route>
        {/* Área do agrônomo: mesmo layout/barra lateral, telas próprias. */}
        <Route
          path="/agro"
          element={
            <ProtectedRoute roles={['agronomo']}>
              <AgroShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<AgroDashboard />} />
          <Route path="propriedades" element={<AgroPropriedades />} />
          <Route path="produtores" element={<AgroProdutores />} />
          <Route path="diagnostico" element={<AgroDiagnostico />} />
          <Route path="diagnostico/:id" element={<AgroDiagnosticoDetalhe />} />
          <Route path="historico" element={<AgroHistorico />} />
          <Route path="mapa" element={<AgroMapa />} />
          <Route path="equipamentos" element={<AgroEquipamentos />} />
          <Route path="equipamentos/:id" element={<AgroEquipamentoDetalhe />} />
          <Route path="calendario" element={<AgroCalendario />} />
          <Route path="laudos" element={<AgroLaudos />} />
          <Route path="financeiro" element={<AgroFinanceiro />} />
          <Route path="relatorios" element={<AgroRelatorios />} />
          <Route path="suporte" element={<AgroSuporte />} />
          <Route path="configuracoes" element={<AgroConfiguracoes />} />
          {/* Perfil é a mesma tela do agricultor. */}
          <Route path="perfil" element={<Perfil />} />
          <Route path="chat" element={<Chat />} />
        </Route>
        {/* Área do administrador: independente das outras duas. */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute roles={['admin']}>
              <AdminShell />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route
            path="aprovacoes"
            element={
              <AdminUsuarios
                key="aprovacoes"
                pendingOnly
                title="Aprovação de Agrônomos"
                subtitle="Agrônomos cadastrados que aguardam liberação para acessar o sistema."
              />
            }
          />
          <Route
            path="usuarios"
            element={<AdminUsuarios key="usuarios" subtitle="Todos os cadastros: aprove, bloqueie ou altere o perfil." />}
          />
          <Route
            path="agricultores"
            element={<AdminUsuarios key="agricultores" perfil="produtor" title="Agricultores" subtitle="Usuários com perfil de agricultor." />}
          />
          <Route
            path="agronomos"
            element={<AdminUsuarios key="agronomos" perfil="agronomo" title="Agrônomos" subtitle="Usuários com perfil de agrônomo." />}
          />
          <Route path="propriedades" element={<AdminPropriedades />} />
          <Route path="areas" element={<AdminAreas />} />
          <Route path="diagnosticos" element={<AdminDiagnosticos />} />
          <Route path="planos" element={<AdminPlanos />} />
          <Route path="manejo" element={<AdminManejo />} />
          <Route path="laudos" element={<AdminLaudos />} />
          <Route path="atividades" element={<AdminAtividades />} />
          <Route path="produtores" element={<AdminProdutores />} />
          <Route path="equipamentos" element={<AdminEquipamentos />} />
          <Route path="producao" element={<AdminProducao />} />
          <Route path="certificacao" element={<AdminCertificacao />} />
          <Route path="financeiro" element={<AdminFinanceiro />} />
          <Route path="suporte" element={<AdminSuporte />} />
          <Route path="relatorios" element={<AdminRelatorios />} />
          <Route path="perfil" element={<Perfil />} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
