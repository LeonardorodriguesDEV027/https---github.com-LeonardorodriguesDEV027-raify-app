import React from 'react';
import AppShell from '../../components/AppShell';

// Menu da área do agrônomo (itens da tela de referência). O componente da
// barra lateral é o mesmo do agricultor.
const agroNav = [
  ['/agro', 'bi-grid-1x2', 'Dashboard'],
  ['/agro/propriedades', 'bi-house-heart', 'Propriedades'],
  ['/agro/produtores', 'bi-people', 'Produtores'],
  ['/agro/diagnostico', 'bi-clipboard-data', 'Diagnóstico de Uso de Agrotóxicos'],
  ['/agro/historico', 'bi-clock-history', 'Histórico de Atividades'],
  ['/agro/mapa', 'bi-map', 'Mapa das Propriedades'],
  ['/agro/equipamentos', 'bi-truck-front', 'Equipamentos'],
  ['/agro/calendario', 'bi-calendar3', 'Calendário'],
  ['/agro/laudos', 'bi-clipboard2-pulse', 'Análises e Laudos'],
  ['/agro/financeiro', 'bi-cash-coin', 'Financeiro'],
  ['/agro/relatorios', 'bi-bar-chart', 'Relatórios'],
  ['/agro/suporte', 'bi-headset', 'Suporte Técnico'],
  ['/agro/configuracoes', 'bi-gear', 'Configurações'],
  ['/agro/perfil', 'bi-person-circle', 'Perfil']
];
const agroBottom = [
  ['/agro', 'bi-grid-1x2', 'Início'],
  ['/agro/propriedades', 'bi-house-heart', 'Propriedades'],
  ['/agro/produtores', 'bi-people', 'Produtores'],
  ['/agro/calendario', 'bi-calendar3', 'Agenda']
];

export default function AgroShell() {
  return <AppShell items={agroNav} bottomItems={agroBottom} home="/agro" profilePath="/agro/perfil" theme="agro" />;
}
