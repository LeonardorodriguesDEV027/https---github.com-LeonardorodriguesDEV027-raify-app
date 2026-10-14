// Dados de exemplo mostrados enquanto o agrônomo ainda não cadastrou nada
// (mesmo padrão das telas do agricultor). Somem assim que existir o
// primeiro registro real na coleção correspondente.
export const demoProperties = [
  { id: 'd1', nome: 'Fazenda Boa Esperança', produtor: 'João Pereira', area: 324, produtores: 3, transicao: 72, status: 'Em transição', municipio: 'Venda Nova do Imigrante', uf: 'ES', latitude: -20.327, longitude: -41.135, cultivos: 'Café, Milho, Feijão, Hortaliças' },
  { id: 'd2', nome: 'Sítio Verde', produtor: 'Maria Silva', area: 120, produtores: 2, transicao: 45, status: 'Em andamento', municipio: 'Domingos Martins', uf: 'ES', latitude: -20.363, longitude: -40.659, cultivos: 'Hortaliças, Banana' },
  { id: 'd3', nome: 'Chácara do Sol', produtor: 'Carlos Almeida', area: 88, produtores: 1, transicao: 28, status: 'Iniciada', municipio: 'Afonso Cláudio', uf: 'ES', latitude: -20.074, longitude: -41.123, cultivos: 'Café, Morango' },
  { id: 'd4', nome: 'Fazenda Nova', produtor: 'Lucas Ferreira', area: 210, produtores: 2, transicao: 61, status: 'Em transição', municipio: 'Castelo', uf: 'ES', latitude: -20.603, longitude: -41.2, cultivos: 'Milho, Feijão' },
  { id: 'd5', nome: 'Sítio Esperança', produtor: 'Ana Souza', area: 134, produtores: 1, transicao: 38, status: 'Em andamento', municipio: 'Santa Teresa', uf: 'ES', latitude: -19.936, longitude: -40.6, cultivos: 'Café, Hortaliças' }
];

export const demoProducers = [
  { id: 'd1', nome: 'João Pereira', propriedade: 'Fazenda Boa Esperança', area: 120, status: 'Em transição' },
  { id: 'd2', nome: 'Maria Silva', propriedade: 'Sítio Verde', area: 80, status: 'Em andamento' },
  { id: 'd3', nome: 'Carlos Almeida', propriedade: 'Chácara do Sol', area: 50, status: 'Iniciada' },
  { id: 'd4', nome: 'Lucas Ferreira', propriedade: 'Fazenda Nova', area: 140, status: 'Em transição' },
  { id: 'd5', nome: 'Ana Souza', propriedade: 'Sítio Esperança', area: 90, status: 'Em andamento' }
];

export const demoDiagnostics = [
  { id: 'd1', propriedade: 'Fazenda Boa Esperança', dependencia: 72, status: 'Em andamento', data: '2025-08-21', cultivos: 'Café, Milho, Feijão, Hortaliças', recomendacoes: 'Aumentar o uso de biofertilizantes|Alta\nImplementar rotação de culturas|Média\nReduzir aplicação de herbicidas|Média' },
  { id: 'd2', propriedade: 'Sítio Verde', dependencia: 47, status: 'Em andamento', data: '2025-08-16', cultivos: 'Hortaliças, Banana', recomendacoes: 'Introduzir adubação verde|Média\nMonitorar pragas semanalmente|Baixa' },
  { id: 'd3', propriedade: 'Chácara do Sol', dependencia: 28, status: 'Pendente', data: '2025-08-14', cultivos: 'Café, Morango', recomendacoes: 'Substituir fungicida por calda bordalesa|Média' },
  { id: 'd4', propriedade: 'Fazenda Nova', dependencia: 61, status: 'Em transição', data: '2025-08-10', cultivos: 'Milho, Feijão', recomendacoes: 'Aplicar controle biológico|Alta\nAumentar cobertura do solo|Média' },
  { id: 'd5', propriedade: 'Sítio Esperança', dependencia: 38, status: 'Concluído', data: '2025-08-05', cultivos: 'Café, Hortaliças', recomendacoes: 'Manter compostagem mensal|Baixa' }
];

export const demoActivities = [
  { id: 'd1', data: '2025-08-21', hora: '08:30', atividade: 'Coleta de solo', propriedade: 'Fazenda Boa Esperança', status: 'Concluída' },
  { id: 'd2', data: '2025-08-18', hora: '10:15', atividade: 'Aplicação de biofertilizante', propriedade: 'Sítio Verde', status: 'Em andamento' },
  { id: 'd3', data: '2025-08-14', hora: '14:20', atividade: 'Reunião com produtor', propriedade: 'Chácara do Sol', status: 'Concluída' },
  { id: 'd4', data: '2025-08-10', hora: '09:00', atividade: 'Coleta de solo', propriedade: 'Fazenda Nova', status: 'Pendente' },
  { id: 'd5', data: '2025-08-05', hora: '16:00', atividade: 'Aplicação de compostagem', propriedade: 'Sítio Esperança', status: 'Concluída' },
  { id: 'd6', data: '2025-08-02', hora: '08:00', atividade: 'Visita técnica', propriedade: 'Fazenda Boa Esperança', status: 'Concluída' },
  { id: 'd7', data: '2025-07-28', hora: '11:00', atividade: 'Instalação de armadilhas', propriedade: 'Sítio Verde', status: 'Concluída' }
];

export const demoEquipment = [
  {
    id: 'd1', nome: 'Trator John Deere 5075E', tipo: 'Trator', status: 'Em uso', ultimaManutencao: '2025-08-12', modelo: 'John Deere 5075E', ano: 2020, horas: 1250, capacidade: '75 cv',
    manutencoes: [
      { data: '2025-08-12', descricao: 'Troca de óleo', status: 'Concluída' },
      { data: '2025-05-15', descricao: 'Filtro de ar', status: 'Concluída' },
      { data: '2024-11-20', descricao: 'Revisão geral', status: 'Concluída' }
    ],
    usos: [
      { data: '2025-08-10', atividade: 'Pulverização', propriedade: 'Fazenda Boa Esperança', operador: 'João Pereira' },
      { data: '2025-08-05', atividade: 'Preparo do solo', propriedade: 'Fazenda Nova', operador: 'Carlos Almeida' },
      { data: '2025-07-22', atividade: 'Plantio', propriedade: 'Chácara do Sol', operador: 'Maria Silva' }
    ]
  },
  { id: 'd2', nome: 'Pulverizador Jacto 2000', tipo: 'Pulverizador', status: 'Em manutenção', ultimaManutencao: '2025-04-08', manutencoes: [], usos: [] },
  { id: 'd3', nome: 'Semeadeira Tatu', tipo: 'Semeadeira', status: 'Em uso', ultimaManutencao: '2025-06-16', manutencoes: [], usos: [] },
  { id: 'd4', nome: 'Carreta agrícola', tipo: 'Carreta', status: 'Em uso', ultimaManutencao: '2025-05-10', manutencoes: [], usos: [] },
  { id: 'd5', nome: 'Grade niveladora', tipo: 'Grade', status: 'Em uso', ultimaManutencao: '2025-03-22', manutencoes: [], usos: [] }
];

export const demoReports = [
  { id: 'd1', propriedade: 'Fazenda Boa Esperança', categoria: 'Solo', tipo: 'Química completa', resultado: 'Dentro do padrão', data: '2025-08-12' },
  { id: 'd2', propriedade: 'Sítio Verde', categoria: 'Solo', tipo: 'Micronutrientes', resultado: 'Fora do padrão', data: '2025-04-08' },
  { id: 'd3', propriedade: 'Chácara do Sol', categoria: 'Água', tipo: 'Potabilidade', resultado: 'Dentro do padrão', data: '2025-06-16' },
  { id: 'd4', propriedade: 'Fazenda Nova', categoria: 'Produtos', tipo: 'Resíduos de agrotóxicos', resultado: 'Dentro do padrão', data: '2025-05-10' },
  { id: 'd5', propriedade: 'Sítio Esperança', categoria: 'Solo', tipo: 'Matéria orgânica', resultado: 'Dentro do padrão', data: '2025-03-22' }
];

// Datas relativas a hoje, para o calendário de exemplo sempre ter
// atividades no mês que está aberto.
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};
export const demoCalendar = [
  { id: 'd1', data: inDays(-6), hora: '08:00', titulo: 'Visita técnica', propriedade: 'Fazenda Nova', status: 'Concluída' },
  { id: 'd2', data: inDays(0), hora: '08:00', titulo: 'Coleta de solo', propriedade: 'Fazenda Boa Esperança', status: 'Pendente' },
  { id: 'd3', data: inDays(2), hora: '10:30', titulo: 'Aplicação de biofertilizante', propriedade: 'Sítio Verde', status: 'Pendente' },
  { id: 'd4', data: inDays(3), hora: '14:00', titulo: 'Reunião com produtor', propriedade: 'Chácara do Sol', status: 'Pendente' },
  { id: 'd5', data: inDays(7), hora: '09:00', titulo: 'Visita técnica', propriedade: 'Fazenda Nova', status: 'Pendente' }
];

export const demoFinance = [
  { id: 'd1', data: '2025-08-20', descricao: 'Venda de café', tipo: 'Receita', categoria: 'Vendas', valor: 42000 },
  { id: 'd2', data: '2025-08-18', descricao: 'Venda de hortaliças', tipo: 'Receita', categoria: 'Vendas', valor: 24420 },
  { id: 'd3', data: '2025-08-15', descricao: 'Compra de adubo', tipo: 'Despesa', categoria: 'Insumos', valor: 3500 },
  { id: 'd4', data: '2025-08-10', descricao: 'Combustível', tipo: 'Despesa', categoria: 'Transporte', valor: 480 },
  { id: 'd5', data: '2025-08-08', descricao: 'Manutenção trator', tipo: 'Despesa', categoria: 'Equipamentos', valor: 1200 },
  { id: 'd6', data: '2025-08-05', descricao: 'Insumos agrícolas', tipo: 'Despesa', categoria: 'Insumos', valor: 22680 },
  { id: 'd7', data: '2025-08-02', descricao: 'Diárias de colheita', tipo: 'Despesa', categoria: 'Mão de obra', valor: 9500 },
  { id: 'd8', data: '2025-07-28', descricao: 'Aluguel de galpão', tipo: 'Despesa', categoria: 'Outros', valor: 3200 }
];
