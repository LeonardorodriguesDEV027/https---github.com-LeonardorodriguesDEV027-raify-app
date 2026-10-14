import React, { useEffect, useState } from 'react';
import { Capacitor } from '@capacitor/core';
import { Directory, Filesystem } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
import { api } from '../services/api';
import PageHeader from '../components/PageHeader';
export default function Documentos() {
  const [it, setIt] = useState([]);
  const [file, setFile] = useState(null);
  const [cat, setCat] = useState('Análise');
  const [uploading, setUploading] = useState(false);
  const [erro, setErro] = useState('');
  const [abrindo, setAbrindo] = useState(null);
  const [preview, setPreview] = useState(null);
  const load = () =>
    api
      .list('documents')
      .then(setIt)
      .catch(() => {});
  useEffect(() => {
    load();
  }, []);
  async function upload() {
    if (!file) return;
    setUploading(true);
    setErro('');
    try {
      const up = await api.upload(file);
      await api.create('documents', {
        nome: file.name,
        categoria: cat,
        data: new Date().toISOString().slice(0, 10),
        arquivoId: up.arquivoId,
        status: 'Válido'
      });
      setFile(null);
      load();
    } catch (e) {
      const msg = e?.message || '';
      if (msg.startsWith('ARQUIVO_GRANDE:')) {
        setErro(
          `Arquivo muito grande: ${msg.slice(15).trim()} Fotos são reduzidas automaticamente; para PDFs, use uma versão compactada.`
        );
      } else {
        setErro('Não foi possível enviar o arquivo. Tente novamente.');
      }
    } finally {
      setUploading(false);
    }
  }
  async function abrir(d) {
    // Registros antigos (da época do Storage) têm só a url.
    if (!d.arquivoId) {
      if (d.url) window.open(d.url, '_blank');
      return;
    }
    setAbrindo(d.id);
    setErro('');
    try {
      const arq = await api.getFile(d.arquivoId);
      if (arq.tipo.startsWith('image/')) {
        setPreview(arq);
      } else if (Capacitor.isNativePlatform()) {
        // No celular: salva no cache e abre o menu "Abrir com / Compartilhar".
        const nome = arq.nome.replace(/[^\w.\-]+/g, '_');
        const salvo = await Filesystem.writeFile({
          path: nome,
          data: arq.dados.slice(arq.dados.indexOf(',') + 1),
          directory: Directory.Cache
        });
        await Share.share({ title: arq.nome, url: salvo.uri });
      } else {
        const blob = await (await fetch(arq.dados)).blob();
        window.open(URL.createObjectURL(blob), '_blank');
      }
    } catch (e) {
      if (!String(e?.message || '').toLowerCase().includes('cancel'))
        setErro('Não foi possível abrir o arquivo.');
    } finally {
      setAbrindo(null);
    }
  }
  return (
    <>
      <PageHeader
        title="Documentos e Evidências"
        subtitle="Armazene laudos, análises, planos, fotos e documentos da certificação."
      />
      <div className="raify-card upload-box">
        <div>
          <h3>Enviar documento</h3>
          <p>
            O arquivo fica guardado no Firestore. Fotos são reduzidas automaticamente; outros
            arquivos (PDF etc.) podem ter até {Math.round(api.MAX_FILE_BYTES / 1024)} KB.
          </p>
        </div>
        {erro && <div className="alert alert-warning">{erro}</div>}
        <select className="form-select" value={cat} onChange={(e) => setCat(e.target.value)}>
          {[
            'Análise',
            'Plano',
            'Visita',
            'Receituário',
            'Certificação',
            'Foto/Evidência',
            'Outro'
          ].map((x) => (
            <option key={x}>{x}</option>
          ))}
        </select>
        <input type="file" className="form-control" onChange={(e) => setFile(e.target.files[0])} />
        <button className="btn btn-raify" disabled={!file || uploading} onClick={upload}>
          {uploading ? 'Enviando...' : 'Enviar'}
        </button>
      </div>
      <div className="report-grid mt-3">
        {it.map((d) => (
          <div className="raify-card report-card" key={d.id}>
            <i className="bi bi-file-earmark-text" />
            <div>
              <h3>{d.nome}</h3>
              <p>
                {d.categoria} • {d.data}
              </p>
            </div>
            <button className="btn btn-soft" disabled={abrindo === d.id} onClick={() => abrir(d)}>
              {abrindo === d.id ? 'Abrindo...' : 'Abrir'}
            </button>
          </div>
        ))}
      </div>
      {preview && (
        <div
          onClick={() => setPreview(null)}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 2000,
            background: 'rgba(0,0,0,.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16
          }}
        >
          <img
            src={preview.dados}
            alt={preview.nome}
            style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain' }}
          />
          <p style={{ color: '#fff', marginTop: 12 }}>{preview.nome} — toque para fechar</p>
        </div>
      )}
    </>
  );
}
