import React from 'react';
import AppShell from '../../components/AppShell';

// Menu da área do administrador — independente das áreas do agricultor e
// do agrônomo. O componente da barra lateral é o mesmo do app.
const adminNav = [
  ['/admin', 'bi-speedometer2', 'Painel'],
  ['/admin/aprovacoes', 'bi-person-check', 'Aprovação de Agrônomos'],
  ['/admin/usuarios', 'bi-people', 'Usuários'],
  ['/admin/agricultores', 'bi-flower1', 'Agricultores'],
  ['/admin/agronomos', 'bi-person-badge', 'Agrônomos'],
  ['/admin/propriedades', 'bi-house-heart', 'Propriedades'],
  ['/admin/areas', 'bi-map', 'Áreas e Talhões'],
  ['/admin/diagnosticos', 'bi-clipboard-data', 'Diagnósticos'],
  ['/admin/planos', 'bi-list-check', 'Planos de Transição'],
  ['/admin/manejo', 'bi-droplet', 'Aplicações e Manejo'],
  ['/admin/laudos', 'bi-clipboard2-pulse', 'Análises e Laudos'],
  ['/admin/atividades', 'bi-calendar3', 'Atividades e Calendário'],
  ['/admin/produtores', 'bi-person-lines-fill', 'Produtores Vinculados'],
  ['/admin/equipamentos', 'bi-truck-front', 'Equipamentos'],
  ['/admin/producao', 'bi-basket2', 'Safras, Insumos e Equipe'],
  ['/admin/certificacao', 'bi-patch-check', 'Certificação e Documentos'],
  ['/admin/financeiro', 'bi-cash-coin', 'Financeiro'],
  ['/admin/suporte', 'bi-headset', 'Suporte'],
  ['/admin/relatorios', 'bi-bar-chart', 'Relatórios'],
  ['/admin/perfil', 'bi-person-circle', 'Perfil']
];
const adminBottom = [
  ['/admin', 'bi-speedometer2', 'Painel'],
  ['/admin/aprovacoes', 'bi-person-check', 'Aprovações'],
  ['/admin/usuarios', 'bi-people', 'Usuários'],
  ['/admin/suporte', 'bi-headset', 'Suporte']
];

export default function AdminShell() {
  return <AppShell items={adminNav} bottomItems={adminBottom} home="/admin" profilePath="/admin/perfil" theme="admin" />;
}
