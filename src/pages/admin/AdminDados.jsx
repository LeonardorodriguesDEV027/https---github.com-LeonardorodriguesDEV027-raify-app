import React from 'react';
import { StatusPill, fmtMoney, fmtNum } from '../agro/shared';
import { AdminDataPage, fmtAny } from './adminShared';

// Telas de consulta do administrador: juntam os registros de TODOS os
// agricultores e agrônomos de cada assunto. "origem" indica de qual área veio.
const A = 'Agricultor';
const G = 'Agrônomo';
const pill = (k) => (it) => <StatusPill value={it[k]} />;
const first = (...keys) => (it) => fmtAny(keys.map((k) => it[k]).find((v) => v !== undefined && v !== ''));

export const AdminPropriedades = () => (
  <AdminDataPage
    title="Propriedades"
    subtitle="Todas as propriedades cadastradas por agricultores e agrônomos."
    sources={[
      { module: 'properties', origem: A },
      { module: 'agroProperties', origem: G }
    ]}
    searchKeys={['nome', 'municipio', 'uf', 'produtor']}
    columns={[
      { label: 'Propriedade', key: 'nome' },
      { label: 'Município', render: (it) => [it.municipio, it.uf].filter(Boolean).join(' - ') || '—', csv: (it) => [it.municipio, it.uf].filter(Boolean).join(' - ') },
      { label: 'Área (ha)', render: (it) => fmtNum(it.areaTotal ?? it.area), csv: (it) => it.areaTotal ?? it.area ?? '' },
      { label: 'Status', render: pill('status'), csv: (it) => it.status || '' }
    ]}
  />
);

export const AdminAreas = () => (
  <AdminDataPage
    title="Áreas e Talhões"
    subtitle="Áreas e talhões de todas as propriedades."
    sources={[{ module: 'areas', origem: A }]}
    searchKeys={['nome', 'cultura']}
    columns={[
      { label: 'Área / Talhão', key: 'nome' },
      { label: 'Cultura', key: 'cultura' },
      { label: 'Área (ha)', key: 'areaHa' }
    ]}
  />
);

export const AdminDiagnosticos = () => (
  <AdminDataPage
    title="Diagnósticos"
    subtitle="Diagnósticos iniciais dos agricultores e diagnósticos de agrotóxicos dos agrônomos."
    sources={[
      { module: 'diagnostics', origem: A },
      { module: 'agroDiagnostics', origem: G }
    ]}
    searchKeys={['propriedade', 'areaNome', 'cultura', 'cultivos']}
    filterKey="status"
    filterLabel="Todos os status"
    columns={[
      { label: 'Propriedade / área', render: first('propriedade', 'areaNome'), csv: first('propriedade', 'areaNome') },
      { label: 'Cultura', render: first('cultura', 'cultivos'), csv: first('cultura', 'cultivos') },
      { label: 'Dependência', render: (it) => (typeof it.dependencia === 'number' ? `${it.dependencia}%` : fmtAny(it.dependencia)), csv: (it) => it.dependencia ?? '' },
      { label: 'Status', render: pill('status'), csv: (it) => it.status || '' }
    ]}
  />
);

export const AdminPlanos = () => (
  <AdminDataPage
    title="Planos de Transição"
    subtitle="Metas, prazos e ações de transição de todos os agricultores."
    sources={[{ module: 'plans', origem: A }]}
    searchKeys={['propriedade', 'cultura', 'acao', 'responsavel']}
    filterKey="status"
    filterLabel="Todos os status"
    columns={[
      { label: 'Propriedade', key: 'propriedade' },
      { label: 'Cultura', key: 'cultura' },
      { label: 'Meta', render: (it) => (it.metaPercentual ? `${it.metaPercentual}%` : fmtAny(it.metaAtual)), csv: (it) => it.metaPercentual ?? it.metaAtual ?? '' },
      { label: 'Prazo', key: 'prazo' },
      { label: 'Status', render: pill('status'), csv: (it) => it.status || '' }
    ]}
  />
);

export const AdminManejo = () => (
  <AdminDataPage
    title="Aplicações e Manejo"
    subtitle="Aplicações, manejos alternativos e monitoramentos registrados."
    sources={[
      { module: 'applications', origem: 'Aplicação' },
      { module: 'alternatives', origem: 'Manejo alternativo' },
      { module: 'monitoring', origem: 'Monitoramento' }
    ]}
    searchKeys={['propriedade', 'areaNome', 'produto', 'pratica', 'ocorrencia']}
    columns={[
      { label: 'Data', render: first('data', 'dataInicio'), csv: first('data', 'dataInicio') },
      { label: 'Local', render: first('propriedade', 'areaNome'), csv: first('propriedade', 'areaNome') },
      { label: 'Descrição', render: first('produto', 'pratica', 'ocorrencia'), csv: first('produto', 'pratica', 'ocorrencia') },
      { label: 'Tipo', render: first('tipo', 'categoria', 'nivel'), csv: first('tipo', 'categoria', 'nivel') }
    ]}
  />
);

export const AdminLaudos = () => (
  <AdminDataPage
    title="Análises e Laudos"
    subtitle="Análises de solo dos agricultores e laudos dos agrônomos."
    sources={[
      { module: 'soilAnalyses', origem: A },
      { module: 'agroReports', origem: G }
    ]}
    searchKeys={['propriedade', 'local', 'empresa', 'tipo', 'laboratorio']}
    columns={[
      { label: 'Data', key: 'data' },
      { label: 'Local / propriedade', render: first('propriedade', 'local'), csv: first('propriedade', 'local') },
      { label: 'Tipo', render: (it) => it.tipo || (it.ph ? `pH ${it.ph} • MO ${it.mo || '—'}%` : '—'), csv: (it) => it.tipo || (it.ph ? `pH ${it.ph}` : '') },
      { label: 'Resultado', render: (it) => (it.resultado ? <StatusPill value={it.resultado} /> : it.qualidade ? `${it.qualidade}%` : '—'), csv: (it) => it.resultado || it.qualidade || '' }
    ]}
  />
);

export const AdminAtividades = () => (
  <AdminDataPage
    title="Atividades e Calendário"
    subtitle="Eventos do calendário, histórico de atividades e acompanhamento técnico."
    sources={[
      { module: 'calendar', origem: 'Calendário' },
      { module: 'agroActivities', origem: 'Histórico (agrônomo)' },
      { module: 'technical', origem: 'Acompanhamento técnico' }
    ]}
    searchKeys={['titulo', 'atividade', 'propriedade', 'tecnico', 'areaNome']}
    filterKey="status"
    filterLabel="Todos os status"
    columns={[
      { label: 'Data', key: 'data' },
      { label: 'Atividade', render: first('titulo', 'atividade', 'tipo'), csv: first('titulo', 'atividade', 'tipo') },
      { label: 'Local', render: first('propriedade', 'areaNome'), csv: first('propriedade', 'areaNome') },
      { label: 'Status', render: pill('status'), csv: (it) => it.status || '' }
    ]}
  />
);

export const AdminProdutores = () => (
  <AdminDataPage
    title="Produtores vinculados"
    subtitle="Produtores cadastrados pelos agrônomos em suas carteiras."
    sources={[{ module: 'agroProducers', origem: G }]}
    searchKeys={['nome', 'propriedade', 'email']}
    filterKey="status"
    filterLabel="Todos os status"
    columns={[
      { label: 'Produtor', key: 'nome' },
      { label: 'Propriedade', key: 'propriedade' },
      { label: 'Área (ha)', key: 'area' },
      { label: 'Status', render: pill('status'), csv: (it) => it.status || '' }
    ]}
  />
);

export const AdminEquipamentos = () => (
  <AdminDataPage
    title="Equipamentos"
    subtitle="Equipamentos cadastrados pelos agrônomos."
    sources={[{ module: 'agroEquipment', origem: G }]}
    searchKeys={['nome', 'tipo', 'modelo']}
    filterKey="status"
    filterLabel="Todos os status"
    columns={[
      { label: 'Equipamento', key: 'nome' },
      { label: 'Tipo', key: 'tipo' },
      { label: 'Última manutenção', key: 'ultimaManutencao' },
      { label: 'Status', render: pill('status'), csv: (it) => it.status || '' }
    ]}
  />
);

export const AdminProducao = () => (
  <AdminDataPage
    title="Safras, Insumos e Equipe"
    subtitle="Safras, estoque de insumos e funcionários dos agricultores."
    sources={[
      { module: 'harvests', origem: 'Safra' },
      { module: 'inputs', origem: 'Insumo' },
      { module: 'employees', origem: 'Funcionário' }
    ]}
    searchKeys={['nome', 'cultura', 'propriedade', 'fornecedor', 'funcao']}
    columns={[
      { label: 'Nome', key: 'nome' },
      { label: 'Detalhe', render: first('cultura', 'tipo', 'funcao'), csv: first('cultura', 'tipo', 'funcao') },
      { label: 'Quantidade', render: (it) => (it.estoque !== undefined ? `${it.estoque} ${it.unidade || ''}` : fmtAny(it.areaHa ?? it.producaoPrevista)), csv: (it) => it.estoque ?? it.areaHa ?? '' },
      { label: 'Status', render: pill('status'), csv: (it) => it.status || '' }
    ]}
  />
);

export const AdminCertificacao = () => (
  <AdminDataPage
    title="Certificação e Documentos"
    subtitle="Registros de certificação orgânica e documentos enviados."
    sources={[
      { module: 'certification', origem: 'Certificação' },
      { module: 'documents', origem: 'Documento' }
    ]}
    searchKeys={['nome', 'tipo', 'titulo', 'etapa', 'categoria']}
    columns={[
      { label: 'Registro', render: first('nome', 'titulo', 'etapa'), csv: first('nome', 'titulo', 'etapa') },
      { label: 'Tipo', render: first('tipo', 'categoria'), csv: first('tipo', 'categoria') },
      { label: 'Data', render: first('data', 'criadoEm'), csv: first('data', 'criadoEm') },
      { label: 'Status', render: pill('status'), csv: (it) => it.status || '' }
    ]}
  />
);

export const AdminFinanceiro = () => (
  <AdminDataPage
    title="Financeiro"
    subtitle="Lançamentos financeiros de todos os usuários."
    sources={[{ module: 'finance', origem: 'Financeiro' }]}
    searchKeys={['descricao', 'categoria', 'tipo']}
    filterKey="tipo"
    filterLabel="Receitas e despesas"
    columns={[
      { label: 'Data', key: 'data' },
      { label: 'Descrição', key: 'descricao' },
      { label: 'Tipo', key: 'tipo' },
      { label: 'Categoria', key: 'categoria' },
      { label: 'Valor', render: (it) => fmtMoney(it.valor), csv: (it) => Number(it.valor || 0).toFixed(2).replace('.', ',') }
    ]}
  />
);
