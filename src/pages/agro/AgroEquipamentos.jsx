import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AgroListPage, StatusPill, fmtDate } from './shared';
import { demoEquipment } from './demoData';

export const EQUIP_TYPES = ['Trator', 'Pulverizador', 'Semeadeira', 'Carreta', 'Grade', 'Colheitadeira', 'Outro'];
export const equipIcon = (tipo) =>
  ({ Trator: 'bi-truck-front', Pulverizador: 'bi-droplet-half', Semeadeira: 'bi-grid-3x3-gap', Carreta: 'bi-truck', Grade: 'bi-grip-horizontal', Colheitadeira: 'bi-basket' })[tipo] ||
  'bi-tools';

export const equipmentFields = [
  { key: 'nome', label: 'Equipamento', required: true },
  { key: 'tipo', label: 'Tipo', type: 'select', options: EQUIP_TYPES },
  { key: 'status', label: 'Status', type: 'select', options: ['Em uso', 'Em manutenção', 'Inativo'] },
  { key: 'ultimaManutencao', label: 'Última manutenção', type: 'date' },
  { key: 'modelo', label: 'Modelo' },
  { key: 'ano', label: 'Ano', type: 'number' },
  { key: 'horas', label: 'Horas de uso', type: 'number', min: 0 },
  { key: 'capacidade', label: 'Capacidade', placeholder: '75 cv' }
];

export default function AgroEquipamentos() {
  const nav = useNavigate();
  return (
    <AgroListPage
      title="Equipamentos"
      subtitle="Gerencie e acompanhe o uso dos equipamentos da propriedade."
      module="agroEquipment"
      demo={demoEquipment}
      what="o primeiro equipamento"
      actionLabel="Novo equipamento"
      initialForm={{ status: 'Em uso', manutencoes: [], usos: [] }}
      fields={equipmentFields}
      searchKeys={['nome', 'tipo', 'modelo']}
      searchPlaceholder="Buscar equipamento..."
      filters={[
        { key: 'tipo', label: 'Todos os tipos' },
        { key: 'status', label: 'Todos os status' }
      ]}
      onRowClick={(e, isDemo) => nav(`/agro/equipamentos/${e.id}`, { state: isDemo ? e : null })}
      columns={[
        {
          label: 'Equipamento',
          render: (e) => (
            <span className="ag-person">
              <span className="ag-ico">
                <i className={`bi ${equipIcon(e.tipo)}`} />
              </span>
              {e.nome}
            </span>
          )
        },
        { label: 'Tipo', key: 'tipo' },
        { label: 'Status', render: (e) => <StatusPill value={e.status} /> },
        { label: 'Última manutenção', render: (e) => fmtDate(e.ultimaManutencao) }
      ]}
    />
  );
}
