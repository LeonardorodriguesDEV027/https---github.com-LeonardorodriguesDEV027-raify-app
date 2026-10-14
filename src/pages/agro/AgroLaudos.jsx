import React, { useCallback, useState } from 'react';
import { AgroListPage, StatusPill, fmtDate } from './shared';
import { demoReports } from './demoData';

const CATS = ['Solo', 'Água', 'Produtos'];
const ICON = { Solo: 'bi-moisture', Água: 'bi-droplet', Produtos: 'bi-basket2' };

export default function AgroLaudos() {
  const [tab, setTab] = useState('Solo');
  const byTab = useCallback((l) => (l.categoria || 'Solo') === tab, [tab]);
  return (
    <AgroListPage
      title="Análises e Laudos"
      subtitle="Visualize e gerencie os resultados das análises de solo, água e produtos."
      module="agroReports"
      demo={demoReports}
      what="a primeira análise"
      actionLabel="Solicitar análise"
      initialForm={{ categoria: tab, resultado: 'Aguardando', data: '' }}
      header={
        <div className="tabs-raify ag-tabs">
          {CATS.map((c) => (
            <button key={c} className={tab === c ? 'active' : ''} onClick={() => setTab(c)}>
              {c}
            </button>
          ))}
        </div>
      }
      extraFilter={byTab}
      sortBy="data"
      searchKeys={['propriedade', 'tipo']}
      searchPlaceholder="Buscar propriedade ou tipo..."
      filters={[{ key: 'resultado', label: 'Todos os resultados' }]}
      fields={[
        { key: 'propriedade', label: 'Propriedade', required: true },
        { key: 'categoria', label: 'Categoria', type: 'select', options: CATS, required: true },
        { key: 'tipo', label: 'Tipo de análise', placeholder: 'Química completa' },
        { key: 'laboratorio', label: 'Laboratório' },
        { key: 'data', label: 'Data da análise', type: 'date' },
        {
          key: 'resultado',
          label: 'Resultado',
          type: 'select',
          options: ['Aguardando', 'Dentro do padrão', 'Fora do padrão']
        },
        { key: 'observacoes', label: 'Observações / parâmetros', type: 'textarea', full: true }
      ]}
      columns={[
        {
          label: 'Propriedade',
          render: (l) => (
            <span className="ag-person">
              <span className="ag-ico">
                <i className={`bi ${ICON[l.categoria] || 'bi-clipboard2-pulse'}`} />
              </span>
              {l.propriedade}
            </span>
          )
        },
        { label: 'Tipo', key: 'tipo' },
        { label: 'Resultado', render: (l) => <StatusPill value={l.resultado} /> },
        { label: 'Data da análise', render: (l) => fmtDate(l.data) }
      ]}
    />
  );
}
