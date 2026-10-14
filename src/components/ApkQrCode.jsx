import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Capacitor } from '@capacitor/core';

// QR code para baixar o APK Android. O arquivo fica em public/download/RAIFY.apk
// e é servido pelo próprio site. VITE_APK_URL (opcional) troca o endereço.
export default function ApkQrCode() {
  // Dentro do app instalado não faz sentido oferecer o download.
  if (Capacitor.isNativePlatform()) return null;
  const url = import.meta.env.VITE_APK_URL || `${window.location.origin}/download/RAIFY.apk`;
  const local = /localhost|127\.0\.0\.1/.test(url);
  return (
    <div className="apk-qr">
      <QRCodeSVG value={url} size={112} fgColor="#1E2C26" marginSize={1} />
      <div>
        <b>
          <i className="bi bi-android2" /> Baixe o app RAIFY
        </b>
        <small>Aponte a câmera do celular para o QR code ou</small>
        <a href={url} download>
          baixe o APK aqui
        </a>
        {local && (
          <small className="apk-qr-warn">
            Endereço "localhost" não abre no celular: publique o site ou acesse pelo IP da rede.
          </small>
        )}
      </div>
    </div>
  );
}
