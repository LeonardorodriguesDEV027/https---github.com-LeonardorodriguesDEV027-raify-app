import React from 'react';
import { AgroListPage, StatusPill, fmtNum, initials } from './shared';
import { demoProducers } from './demoData';

const STATUS = ['Iniciada', 'Em andamento', 'Em transição', 'Concluída'];

export default function AgroProdutores() {
  return (
    <AgroListPage
      title="Produtores"
      subtitle="Cadastre e acompanhe os produtores das propriedades."
      module="agroProducers"
      demo={demoProducers}
      what="o primeiro produtor"
      actionLabel="Novo produtor"
      initialForm={{ status: 'Iniciada' }}
      searchKeys={['nome', 'propriedade', 'email']}
      searchPlaceholder="Buscar produtor..."
      fields={[
        { key: 'nome', label: 'Nome', required: true },
        { key: 'propriedade', label: 'Propriedade' },
        { key: 'area', label: 'Área (ha)', type: 'number', min: 0 },
        { key: 'status', label: 'Status', type: 'select', options: STATUS },
        { key: 'email', label: 'E-mail', type: 'email' },
        { key: 'telefone', label: 'Telefone' },
        { key: 'observacoes', label: 'Observações', type: 'textarea', full: true }
      ]}
      columns={[
        {
          label: 'Nome',
          render: (p) => (
            <span className="ag-person">
              <span className="avatar-small">{initials(p.nome)}</span>
              {p.nome}
            </span>
          )
        },
        { label: 'Propriedade', key: 'propriedade' },
        { label: 'Área (ha)', render: (p) => fmtNum(p.area) },
        { label: 'Status', render: (p) => <StatusPill value={p.status} /> }
      ]}
    />
  );
}
