import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AgroListPage, StatusPill, fmtDate } from './shared';
import { demoDiagnostics } from './demoData';

export const diagnosticFields = [
  { key: 'propriedade', label: 'Propriedade', required: true },
  { key: 'data', label: 'Data da análise', type: 'date', required: true },
  {
    key: 'dependencia',
    label: 'Nível de dependência química (%)',
    type: 'number',
    min: 0,
    max: 100,
    required: true
  },
  {
    key: 'status',
    label: 'Status',
    type: 'select',
    options: ['Pendente', 'Em andamento', 'Em transição', 'Concluído']
  },
  { key: 'cultivos', label: 'Principais cultivos', placeholder: 'Café, Milho, Feijão', full: true },
  {
    key: 'recomendacoes',
    label: 'Recomendações (uma por linha)',
    type: 'textarea',
    full: true,
    placeholder: 'Aumentar o uso de biofertilizantes|Alta\nImplementar rotação de culturas|Média',
    help: 'Opcional: adicione "|Alta", "|Média" ou "|Baixa" no fim da linha para indicar a prioridade.'
  }
];

export const dependencyLevel = (v) => (v >= 60 ? 'Alto' : v >= 35 ? 'Médio' : 'Baixo');

export default function AgroDiagnostico() {
  const nav = useNavigate();
  return (
    <AgroListPage
      title="Diagnóstico de Uso de Agrotóxicos"
      subtitle="Identifique o nível de dependência química e receba recomendações personalizadas."
      module="agroDiagnostics"
      demo={demoDiagnostics}
      what="o primeiro diagnóstico"
      actionLabel="Novo diagnóstico"
      initialForm={{ status: 'Pendente' }}
      fields={diagnosticFields}
      searchKeys={['propriedade']}
      searchPlaceholder="Buscar propriedade..."
      filters={[
        { key: 'propriedade', label: 'Todas as propriedades' },
        { key: 'status', label: 'Todos os status' }
      ]}
      onRowClick={(d, isDemo) => nav(`/agro/diagnostico/${d.id}`, { state: isDemo ? d : null })}
      columns={[
        {
          label: 'Propriedade',
          render: (d) => (
            <span className="ag-person">
              <span className="ag-ico">
                <i className="bi bi-house-heart" />
              </span>
              {d.propriedade}
            </span>
          )
        },
        {
          label: 'Nível de dependência',
          render: (d) => (
            <span className={`ag-level ${dependencyLevel(d.dependencia).toLowerCase()}`}>
              {d.dependencia}%
            </span>
          )
        },
        { label: 'Status', render: (d) => <StatusPill value={d.status} /> },
        { label: 'Última análise', render: (d) => fmtDate(d.data) }
      ]}
    />
  );
}
