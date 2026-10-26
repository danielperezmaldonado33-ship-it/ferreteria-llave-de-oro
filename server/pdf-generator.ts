/**
 * Generador de comprobantes de venta
 * Crea comprobantes en formato texto e HTML
 */

/**
 * Generar comprobante de venta en formato texto
 */
export function generarComprobanteTexto(venta: any, detalles: any[], cliente?: any): string {
  const fecha = new Date(venta.fecha_venta).toLocaleDateString('es-MX');
  const hora = new Date(venta.fecha_venta).toLocaleTimeString('es-MX');
  
  let comprobante = '';
  comprobante += '═══════════════════════════════════════════════════════\n';
  comprobante += '           EL GALLO FERRETERÍA\n';
  comprobante += '           COMPROBANTE DE VENTA\n';
  comprobante += '═══════════════════════════════════════════════════════\n\n';
  
  comprobante += `Número de Comprobante: ${venta.numero_comprobante || 'N/A'}\n`;
  comprobante += `Fecha: ${fecha}\n`;
  comprobante += `Hora: ${hora}\n\n`;
  
  if (cliente) {
    comprobante += `Cliente: ${cliente.nombre} ${cliente.apellido_paterno}\n`;
    if (cliente.email) comprobante += `Email: ${cliente.email}\n`;
    if (cliente.telefono) comprobante += `Teléfono: ${cliente.telefono}\n`;
  } else {
    comprobante += 'Cliente: MOSTRADOR\n';
  }
  
  comprobante += '\n───────────────────────────────────────────────────────\n';
  comprobante += 'CONCEPTO                          CANTIDAD    P.UNITARIO    TOTAL\n';
  comprobante += '───────────────────────────────────────────────────────\n';
  
  detalles.forEach((detalle: any) => {
    const cantidad = detalle.cantidad.toString().padEnd(10);
    const precio = `$${detalle.precio_unitario.toFixed(2)}`.padEnd(15);
    const subtotal = `$${(detalle.cantidad * detalle.precio_unitario).toFixed(2)}`;
    comprobante += `${detalle.producto_nombre.substring(0, 28).padEnd(28)} ${cantidad} ${precio} ${subtotal}\n`;
  });
  
  comprobante += '───────────────────────────────────────────────────────\n';
  comprobante += `Subtotal:                                    $${venta.subtotal?.toFixed(2) || '0.00'}\n`;
  comprobante += `IVA (${((venta.iva / venta.subtotal) * 100).toFixed(0)}%):                                       $${venta.iva?.toFixed(2) || '0.00'}\n`;
  if (venta.descuento) {
    comprobante += `Descuento:                                   -$${venta.descuento.toFixed(2)}\n`;
  }
  comprobante += '═══════════════════════════════════════════════════════\n';
  comprobante += `TOTAL:                                       $${venta.total?.toFixed(2) || '0.00'}\n`;
  comprobante += '═══════════════════════════════════════════════════════\n\n';
  
  comprobante += `Método de Pago: ${venta.metodo_pago || 'No especificado'}\n`;
  comprobante += `Estado: ${venta.estado}\n\n`;
  
  comprobante += '───────────────────────────────────────────────────────\n';
  comprobante += '¡Gracias por su compra!\n';
  comprobante += 'El Gallo Ferretería - Todos los derechos reservados\n';
  comprobante += `Generado: ${new Date().toLocaleString('es-MX')}\n`;
  comprobante += '═══════════════════════════════════════════════════════\n';
  
  return comprobante;
}

/**
 * Generar comprobante en formato HTML para impresión
 */
export function generarComprobanteHTML(venta: any, detalles: any[], cliente?: any): string {
  const fecha = new Date(venta.fecha_venta).toLocaleDateString('es-MX');
  const hora = new Date(venta.fecha_venta).toLocaleTimeString('es-MX');
  
  const filasProductos = detalles.map((d: any) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${d.producto_nombre}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: center;">${d.cantidad}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${d.precio_unitario.toFixed(2)}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee; text-align: right;">$${(d.cantidad * d.precio_unitario).toFixed(2)}</td>
    </tr>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Comprobante de Venta</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
          background: #f5f5f5;
        }
        .comprobante {
          background: white;
          padding: 30px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          border-bottom: 2px solid #333;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        .header h1 {
          margin: 0;
          font-size: 24px;
          color: #333;
        }
        .header p {
          margin: 5px 0;
          color: #666;
          font-size: 12px;
        }
        .info-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 20px;
          padding: 15px;
          background: #f9f9f9;
          border-radius: 4px;
        }
        .info-group {
          font-size: 12px;
        }
        .info-label {
          font-weight: bold;
          color: #333;
          margin-bottom: 3px;
        }
        .info-value {
          color: #666;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 20px 0;
        }
        th {
          background: #f0f0f0;
          padding: 10px;
          text-align: left;
          font-weight: bold;
          border-bottom: 2px solid #333;
          font-size: 12px;
        }
        .totales {
          margin-top: 20px;
          padding-top: 15px;
          border-top: 2px solid #333;
          text-align: right;
        }
        .total-row {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 8px;
          font-size: 13px;
        }
        .total-label {
          font-weight: bold;
          margin-right: 20px;
          min-width: 120px;
        }
        .total-value {
          min-width: 100px;
          text-align: right;
        }
        .total-final {
          font-size: 16px;
          font-weight: bold;
          color: #333;
          border-top: 1px solid #333;
          padding-top: 10px;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          font-size: 11px;
          color: #999;
        }
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .comprobante {
            box-shadow: none;
            border-radius: 0;
          }
        }
      </style>
    </head>
    <body>
      <div class="comprobante">
        <div class="header">
          <h1>EL GALLO FERRETERÍA</h1>
          <p>COMPROBANTE DE VENTA</p>
        </div>
        
        <div class="info-section">
          <div class="info-group">
            <div class="info-label">Comprobante:</div>
            <div class="info-value">${venta.numero_comprobante || 'N/A'}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Fecha y Hora:</div>
            <div class="info-value">${fecha} ${hora}</div>
          </div>
          ${cliente ? `
            <div class="info-group">
              <div class="info-label">Cliente:</div>
              <div class="info-value">${cliente.nombre} ${cliente.apellido_paterno}</div>
            </div>
            ${cliente.email ? `
              <div class="info-group">
                <div class="info-label">Email:</div>
                <div class="info-value">${cliente.email}</div>
              </div>
            ` : ''}
          ` : `
            <div class="info-group">
              <div class="info-label">Cliente:</div>
              <div class="info-value">MOSTRADOR</div>
            </div>
          `}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>Producto</th>
              <th style="text-align: center;">Cantidad</th>
              <th style="text-align: right;">P. Unitario</th>
              <th style="text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${filasProductos}
          </tbody>
        </table>
        
        <div class="totales">
          <div class="total-row">
            <div class="total-label">Subtotal:</div>
            <div class="total-value">$${venta.subtotal?.toFixed(2) || '0.00'}</div>
          </div>
          <div class="total-row">
            <div class="total-label">IVA:</div>
            <div class="total-value">$${venta.iva?.toFixed(2) || '0.00'}</div>
          </div>
          ${venta.descuento ? `
            <div class="total-row">
              <div class="total-label">Descuento:</div>
              <div class="total-value">-$${venta.descuento.toFixed(2)}</div>
            </div>
          ` : ''}
          <div class="total-row total-final">
            <div class="total-label">TOTAL:</div>
            <div class="total-value">$${venta.total?.toFixed(2) || '0.00'}</div>
          </div>
        </div>
        
        <div class="info-section" style="margin-top: 20px;">
          <div class="info-group">
            <div class="info-label">Método de Pago:</div>
            <div class="info-value">${venta.metodo_pago || 'No especificado'}</div>
          </div>
          <div class="info-group">
            <div class="info-label">Estado:</div>
            <div class="info-value">${venta.estado}</div>
          </div>
        </div>
        
        <div class="footer">
          <p>¡Gracias por su compra!</p>
          <p>El Gallo Ferretería - Todos los derechos reservados</p>
          <p>Generado: ${new Date().toLocaleString('es-MX')}</p>
        </div>
      </div>
    </body>
    </html>
  `;
}
