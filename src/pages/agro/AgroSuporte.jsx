import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import PageHeader from '../../components/PageHeader';

const FAQ = [
  ['Como vinculo um produtor a uma propriedade?', 'Cadastre o produtor em "Produtores" e informe o nome da propriedade. A propriedade também pode indicar o produtor responsável.'],
  ['Como funciona o nível de dependência química?', 'É o percentual informado no diagnóstico: acima de 60% é Alto, entre 35% e 59% é Médio e abaixo de 35% é Baixo.'],
  ['Onde vejo as propriedades no mapa?', 'Informe latitude e longitude no cadastro da propriedade e acesse "Mapa das Propriedades".'],
  ['Como exporto relatórios?', 'Em "Relatórios", escolha período e propriedade e clique em um dos modelos. O arquivo sai em CSV.']
];
const TUTORIALS = [
  ['Primeiros passos na área do agrônomo', 'Cadastre propriedades, produtores e o primeiro diagnóstico.'],
  ['Registrando laudos de solo e água', 'Solicite análises e atualize o resultado quando o laudo chegar.'],
  ['Controle de equipamentos', 'Registre manutenções e o histórico de uso de cada máquina.']
];
const SUBJECTS = ['Dúvida sobre o sistema', 'Problema técnico', 'Sugestão', 'Diagnóstico e recomendações', 'Outro'];

export default function AgroSuporte() {
  const nav = useNavigate();
  const [open, setOpen] = useState('');
  const [subject, setSubject] = useState('');
  const [desc, setDesc] = useState('');
  const [status, setStatus] = useState(null);

  async function send(e) {
    e.preventDefault();
    setStatus(null);
    try {
      // O chamado vai para a mesma caixa de mensagens do suporte (suporte_mensagens).
      await api.sendMessage(`[Chamado: ${subject}] ${desc}`);
      setSubject('');
      setDesc('');
      setStatus({ ok: true, text: 'Chamado enviado! Nossa equipe responderá pelo chat do suporte.' });
    } catch (err) {
      setStatus({ ok: false, text: err.message });
    }
  }

  const items = [
    ['faq', 'bi-question-circle', 'Perguntas frequentes'],
    ['tutoriais', 'bi-journal-text', 'Tutoriais e manuais'],
    ['especialista', 'bi-person-video3', 'Fale com um especialista']
  ];

  return (
    <>
      <PageHeader title="Suporte Técnico" subtitle="Tire suas dúvidas e entre em contato com nossa equipe." />
      <div className="ag-grid-2">
        <div className="raify-card p-4">
          <h3>Central de ajuda</h3>
          {items.map(([k, icon, label]) => (
            <div key={k}>
              <button
                className="ag-help-item"
                onClick={() => (k === 'especialista' ? nav('/agro/chat') : setOpen(open === k ? '' : k))}
              >
                <span className="ag-ico">
                  <i className={`bi ${icon}`} />
                </span>
                <span>{label}</span>
                <i className={`bi bi-chevron-${open === k ? 'up' : 'right'}`} />
              </button>
              {open === k && (
                <div className="faq-list ag-help-body">
                  {(k === 'faq' ? FAQ : TUTORIALS).map(([q, a]) => (
                    <details className="raify-card" key={q}>
                      <summary>{q}</summary>
                      <p className="mb-0">{a}</p>
                    </details>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <form className="raify-card p-4" onSubmit={send}>
          <h3>Abrir chamado</h3>
          <label className="mt-2">Assunto</label>
          <select className="form-select" required value={subject} onChange={(e) => setSubject(e.target.value)}>
            <option value="">Selecione o assunto</option>
            {SUBJECTS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
          <label className="mt-3">Descrição</label>
          <textarea
            className="form-control"
            rows="5"
            required
            placeholder="Descreva sua dúvida ou problema..."
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
          />
          {status && (
            <div className={`alert mt-3 mb-0 ${status.ok ? 'alert-success' : 'alert-warning'}`}>{status.text}</div>
          )}
          <button className="btn btn-raify w-100 mt-3">
            <i className="bi bi-send" /> Enviar
          </button>
        </form>
      </div>
    </>
  );
}
