import React, { useEffect, useMemo, useState } from 'react';
import { CircleMarker, MapContainer, Popup, TileLayer, useMap } from 'react-leaflet';
import PageHeader from '../../components/PageHeader';
import { DemoNotice, StatusPill, fmtNum, useAgroList } from './shared';
import { demoProperties } from './demoData';

// Move o mapa até a propriedade selecionada na lista.
function FlyTo({ target }) {
  const map = useMap();
  useEffect(() => {
    if (target) map.flyTo(target, 12, { duration: 0.6 });
  }, [target]);
  return null;
}

export default function AgroMapa() {
  const list = useAgroList('agroProperties', demoProperties);
  const [sel, setSel] = useState(null);
  const pts = useMemo(
    () =>
      list.items.filter(
        (p) => Number.isFinite(Number(p.latitude)) && Number.isFinite(Number(p.longitude)) && p.latitude !== '' && p.longitude !== ''
      ),
    [list.items]
  );
  const center = pts.length
    ? [
        pts.reduce((s, p) => s + Number(p.latitude), 0) / pts.length,
        pts.reduce((s, p) => s + Number(p.longitude), 0) / pts.length
      ]
    : [-20.327, -41.135];

  return (
    <>
      <PageHeader
        title="Mapa das Propriedades"
        subtitle="Visualize a localização e o status de transição de cada propriedade."
      />
      <DemoNotice show={list.isDemo} what="propriedades com latitude e longitude" />
      <div className="ag-map-layout">
        <div className="raify-card ag-map">
          {!list.loading && (
            <MapContainer center={center} zoom={pts.length > 1 ? 8 : 12}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <FlyTo target={sel} />
              {pts.map((p) => (
                <CircleMarker
                  key={p.id}
                  center={[Number(p.latitude), Number(p.longitude)]}
                  radius={11}
                  pathOptions={{ color: '#fff', weight: 3, fillColor: '#5B3FD9', fillOpacity: 0.95 }}
                >
                  <Popup>
                    <b>{p.nome}</b>
                    <br />
                    {p.produtor} • {fmtNum(p.area)} ha
                    <br />
                    Transição: {p.transicao || 0}%
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>
          )}
        </div>
        <div className="raify-card p-3 ag-map-list">
          <h3 className="px-2">Propriedades ({list.items.length})</h3>
          {list.items.map((p) => {
            const has = pts.includes(p);
            return (
              <button
                key={p.id}
                disabled={!has}
                onClick={() => setSel([Number(p.latitude), Number(p.longitude)])}
              >
                <i className="bi bi-geo-alt-fill" />
                <span>
                  <b>{p.nome}</b>
                  <small>
                    {has ? `${p.municipio || ''}${p.uf ? ` - ${p.uf}` : ''}` : 'Sem coordenadas'}
                  </small>
                </span>
                <StatusPill value={p.status} />
              </button>
            );
          })}
        </div>
      </div>
    </>
  );
}
