import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Serve o .apk com o tipo certo. Sem isso o Vite manda o arquivo sem
// Content-Type e o celular salva como "RAIFY.apk.zip".
const apkMime = (req, res, next) => {
  if (req.url && /\.apk(\?|$)/i.test(req.url)) {
    // O servidor de arquivos estáticos define os cabeçalhos no writeHead
    // (e mandaria Content-Type vazio); por isso forçamos ali.
    const writeHead = res.writeHead.bind(res);
    res.writeHead = (status, ...rest) => {
      res.setHeader('Content-Type', 'application/vnd.android.package-archive');
      res.setHeader('Content-Disposition', 'attachment; filename="RAIFY.apk"');
      const headers = rest.find((r) => r && typeof r === 'object');
      if (headers) {
        delete headers['Content-Type'];
        delete headers['content-type'];
      }
      return writeHead(status, ...rest);
    };
  }
  next();
};
const apkDownload = {
  name: 'apk-download',
  // Sem "return": se o hook devolver uma função, o Vite a executa depois.
  configureServer(server) {
    server.middlewares.use(apkMime);
  },
  configurePreviewServer(server) {
    server.middlewares.use(apkMime);
  }
};

export default defineConfig({ plugins: [react(), apkDownload], server: { port: 5173 }, build: { outDir: 'dist' } });
