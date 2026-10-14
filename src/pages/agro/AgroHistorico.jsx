import React, { useCallback, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AgroListPage, StatusPill, fmtDate } from './shared';
import { demoActivities } from './demoData';

export default function AgroHistorico() {
  const [params] = useSearchParams();
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const byDate = useCallback(
    (a) => (!from || String(a.data) >= from) && (!to || String(a.data) <= to),
    [from, to]
  );
  return (
    <AgroListPage
      key={params.get('propriedade') || ''}
      title="Histórico de Atividades"
      subtitle="Acompanhe todas as ações realizadas no sistema."
      module="agroActivities"
      demo={demoActivities}
      what="a primeira atividade"
      actionLabel="Nova atividade"
      initialForm={{ status: 'Pendente' }}
      searchKeys={['atividade', 'propriedade', 'responsavel']}
      searchPlaceholder="Buscar atividade..."
      initialFilters={{ propriedade: params.get('propriedade') || '' }}
      filters={[
        { key: 'propriedade', label: 'Todas as propriedades' },
        { key: 'status', label: 'Todos os status' }
      ]}
      extraFilter={byDate}
      toolbarExtra={
        <div className="ag-daterange">
          <i className="bi bi-calendar3" />
          <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          <span>–</span>
          <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        </div>
      }
      pageSize={5}
      sortBy="data"
      fields={[
        { key: 'data', label: 'Data', type: 'date', required: true },
        { key: 'hora', label: 'Hora', type: 'time' },
        { key: 'atividade', label: 'Atividade', required: true },
        { key: 'propriedade', label: 'Propriedade' },
        { key: 'responsavel', label: 'Responsável' },
        {
          key: 'status',
          label: 'Status',
          type: 'select',
          options: ['Pendente', 'Em andamento', 'Concluída']
        },
        { key: 'observacoes', label: 'Observações', type: 'textarea', full: true }
      ]}
      columns={[
        {
          label: 'Data',
          render: (a) => (
            <span className="ag-person">
              <i className="bi bi-clock-history ag-muted" /> {fmtDate(a.data)}
            </span>
          )
        },
        { label: 'Atividade', key: 'atividade' },
        { label: 'Propriedade', key: 'propriedade' },
        { label: 'Status', render: (a) => <StatusPill value={a.status} /> }
      ]}
    />
  );
}
