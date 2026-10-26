import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const WEB_DIR = path.join(__dirname, 'web');

console.log(`📁 Sirviendo archivos desde: ${WEB_DIR}`);

const server = http.createServer((req, res) => {
  // Ruta por defecto
  let filePath = path.join(WEB_DIR, req.url === '/' ? 'index.html' : req.url);
  
  // Prevenir acceso fuera del directorio web
  if (!filePath.startsWith(WEB_DIR)) {
    res.writeHead(403);
    res.end('Acceso denegado');
    return;
  }
  
  // Obtener extensión del archivo
  const extname = String(path.extname(filePath)).toLowerCase();
  
  // Tipos MIME
  const mimeTypes = {
    '.html': 'text/html; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
    '.woff': 'application/font-woff',
    '.woff2': 'application/font-woff2',
    '.ttf': 'application/font-ttf',
    '.eot': 'application/vnd.ms-fontobject',
    '.otf': 'application/font-otf'
  };
  
  const contentType = mimeTypes[extname] || 'application/octet-stream';
  
  fs.readFile(filePath, (error, content) => {
    if (error) {
      if (error.code === 'ENOENT') {
        // Si no encuentra el archivo, sirve index.html (para SPA)
        fs.readFile(path.join(WEB_DIR, 'index.html'), (err, content) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end('<h1>404 - Archivo no encontrado</h1><p>No se encontró index.html</p>');
          } else {
            res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
            res.end(content, 'utf-8');
          }
        });
      } else {
        res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end('<h1>500 - Error del servidor</h1><p>' + error.code + '</p>');
      }
    } else {
      res.writeHead(200, { 'Content-Type': contentType });
      res.end(content, 'utf-8');
    }
  });
});

server.listen(PORT, () => {
  console.log(`✅ Servidor ejecutándose en: http://localhost:${PORT}/`);
  console.log(`📂 Directorio: ${WEB_DIR}`);
  console.log(`💡 Presiona Ctrl+C para detener el servidor`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ El puerto ${PORT} ya está en uso`);
    console.error(`Intenta cerrar otras aplicaciones o usa otro puerto`);
  } else {
    console.error('Error del servidor:', err);
  }
});
