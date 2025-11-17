/**
 * Generador de PDFs para documentos legales
 * 
 * Este módulo convierte los datos extraídos en PDFs profesionales
 * listos para descarga y procesamiento por agentes externos.
 */

import puppeteer from 'puppeteer-core';
import chromium from '@sparticuz/chromium';
import { DocumentType } from './schemas-real';

// Tipo flexible para datos extraídos (acepta cualquier estructura)
type ExtractedData = Record<string, any>;

export interface PDFGeneratorOptions {
  templateType: DocumentType;
  extractedData: ExtractedData;
  documentName: string;
  includeMetadata: boolean;
}

export interface PDFGenerationResult {
  success: boolean;
  pdfBuffer?: Buffer;
  fileName?: string;
  downloadUrl?: string;
  error?: string;
}

/**
 * Templates HTML por tipo de documento
 */
const htmlTemplates = {
  contrato_base: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Contrato Base - 3D Pixel Perfection</title>
  <style>
    body { 
      font-family: 'Times New Roman', serif; 
      margin: 2cm; 
      line-height: 1.4;
      color: #333;
    }
    .header { 
      text-align: center; 
      border-bottom: 2px solid #333; 
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .section { 
      margin: 25px 0; 
      page-break-inside: avoid;
    }
    .field { 
      margin: 12px 0; 
      padding: 8px 0;
      border-bottom: 1px dotted #ccc;
    }
    .field strong {
      display: inline-block;
      width: 150px;
      font-weight: bold;
    }
    .signature { 
      margin-top: 60px; 
      page-break-inside: avoid;
    }
    .signature-table {
      width: 100%;
      margin-top: 40px;
    }
    .signature-table td {
      text-align: center;
      vertical-align: bottom;
      height: 80px;
    }
    h1 { color: #2c5aa0; font-size: 24px; margin: 0; }
    h2 { color: #666; font-size: 18px; margin: 10px 0 0 0; }
    h3 { color: #2c5aa0; font-size: 16px; border-bottom: 1px solid #2c5aa0; padding-bottom: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>CONTRATO DE PRESTACIÓN DE SERVICIOS</h1>
    <h2>3D PIXEL PERFECTION</h2>
  </div>
  
  <div class="section">
    <h3>DATOS DEL CLIENTE</h3>
    <div class="field"><strong>Nombre:</strong> ${data.NOMBRE_CLIENTE || 'No especificado'}</div>
    <div class="field"><strong>RFC:</strong> ${data.RFC_cliente || 'No especificado'}</div>
    <div class="field"><strong>Dirección:</strong> ${data.DIRECCION_CLIENTE || 'No especificada'}</div>
    <div class="field"><strong>Teléfono:</strong> ${data.TELEFONO_CLIENTE || 'No especificado'}</div>
  </div>
  
  <div class="section">
    <h3>DATOS DEL EVENTO</h3>
    <div class="field"><strong>Nombre del Evento:</strong> ${data.NOMBRE_EVENTO || 'No especificado'}</div>
    <div class="field"><strong>Tipo de Evento:</strong> ${data.EVENTO || 'No especificado'}</div>
    <div class="field"><strong>Fecha:</strong> ${data.FECHA_EVENTO || 'No especificada'}</div>
    <div class="field"><strong>Hora:</strong> ${data.HORA_EVENTO || data['HH:MM'] || 'No especificada'}</div>
    <div class="field"><strong>Ubicación:</strong> ${data.UBICACION || 'No especificada'}</div>
    <div class="field"><strong>Duración:</strong> ${data.DURACION_EVENTO || 'No especificada'}</div>
  </div>
  
  <div class="section">
    <h3>TÉRMINOS ECONÓMICOS</h3>
    <div class="field"><strong>Monto Total:</strong> ${data.MONTO_TOTAL || 'No especificado'}</div>
    <div class="field"><strong>Anticipo:</strong> ${data.ANTICIPO || 'No especificado'}</div>
    <div class="field"><strong>Forma de Pago:</strong> ${data.FORMA_PAGO || 'No especificada'}</div>
  </div>

  <div class="signature">
    <div class="field"><strong>Fecha del Contrato:</strong> ${data.FECHA_CONTRATO || data['DD/MM/AAAA'] || new Date().toLocaleDateString('es-ES')}</div>
    
    <table class="signature-table">
      <tr>
        <td width="50%">
          _________________________<br>
          <strong>Firma del Cliente</strong><br>
          ${data.NOMBRE_CLIENTE || ''}
        </td>
        <td width="50%">
          _________________________<br>
          <strong>3D Pixel Perfection</strong><br>
          Representante Legal
        </td>
      </tr>
    </table>
  </div>
</body>
</html>`,

  anexo_a: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Anexo A - Especificaciones del Salón</title>
  <style>
    body { 
      font-family: 'Times New Roman', serif; 
      margin: 2cm; 
      line-height: 1.4;
      color: #333;
    }
    .header { 
      text-align: center; 
      border-bottom: 2px solid #333; 
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .section { 
      margin: 25px 0; 
      page-break-inside: avoid;
    }
    .field { 
      margin: 12px 0; 
      padding: 8px 0;
      border-bottom: 1px dotted #ccc;
    }
    .field strong {
      display: inline-block;
      width: 180px;
      font-weight: bold;
    }
    h1 { color: #2c5aa0; font-size: 24px; margin: 0; }
    h2 { color: #666; font-size: 18px; margin: 10px 0 0 0; }
    h3 { color: #2c5aa0; font-size: 16px; border-bottom: 1px solid #2c5aa0; padding-bottom: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ANEXO A</h1>
    <h2>ESPECIFICACIONES DEL SALÓN</h2>
  </div>
  
  <div class="section">
    <h3>DIMENSIONES DEL SALÓN</h3>
    <div class="field"><strong>Largo:</strong> ${data.MEDIDA_LARGO_SALON || 'No especificado'} metros</div>
    <div class="field"><strong>Ancho:</strong> ${data.MEDIDA_ANCHO_SALON || 'No especificado'} metros</div>
    <div class="field"><strong>Alto:</strong> ${data.MEDIDA_ALTO_SALON || 'No especificado'} metros</div>
  </div>

  <div class="section">
    <h3>ESPECIFICACIONES DE MONTAJE</h3>
    <div class="field"><strong>Tipo de Montaje:</strong> ${data.TIPO_MONTAJE || 'No especificado'}</div>
    <div class="field"><strong>Decoración Principal:</strong> ${data.DECORACION_PRINCIPAL || 'No especificada'}</div>
    <div class="field"><strong>Colores Temáticos:</strong> ${data.COLORES_TEMATICOS || 'No especificados'}</div>
    <div class="field"><strong>Elementos Especiales:</strong> ${data.ELEMENTOS_ESPECIALES || 'No especificados'}</div>
  </div>

  <div class="section">
    <h3>SERVICIOS ADICIONALES</h3>
    <div class="field"><strong>Iluminación:</strong> ${data.ILUMINACION || 'Estándar'}</div>
    <div class="field"><strong>Sonido:</strong> ${data.SONIDO || 'No especificado'}</div>
    <div class="field"><strong>Mobiliario:</strong> ${data.MOBILIARIO || 'No especificado'}</div>
  </div>
</body>
</html>`,

  anexo_b: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Anexo B - Servicios de Fotografía y Video</title>
  <style>
    body { 
      font-family: 'Times New Roman', serif; 
      margin: 2cm; 
      line-height: 1.4;
      color: #333;
    }
    .header { 
      text-align: center; 
      border-bottom: 2px solid #333; 
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .section { 
      margin: 25px 0; 
      page-break-inside: avoid;
    }
    .field { 
      margin: 12px 0; 
      padding: 8px 0;
      border-bottom: 1px dotted #ccc;
    }
    .field strong {
      display: inline-block;
      width: 180px;
      font-weight: bold;
    }
    h1 { color: #2c5aa0; font-size: 24px; margin: 0; }
    h2 { color: #666; font-size: 18px; margin: 10px 0 0 0; }
    h3 { color: #2c5aa0; font-size: 16px; border-bottom: 1px solid #2c5aa0; padding-bottom: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ANEXO B</h1>
    <h2>SERVICIOS DE FOTOGRAFÍA Y VIDEO</h2>
  </div>
  
  <div class="section">
    <h3>SERVICIOS DE FOTOGRAFÍA</h3>
    <div class="field"><strong>Tipo de Fotografía:</strong> ${data.TIPO_FOTOGRAFIA || 'No especificado'}</div>
    <div class="field"><strong>Cantidad de Horas:</strong> ${data.HORAS_FOTOGRAFIA || 'No especificadas'}</div>
    <div class="field"><strong>Número de Fotógrafos:</strong> ${data.NUMERO_FOTOGRAFOS || 'No especificado'}</div>
    <div class="field"><strong>Estilo Fotográfico:</strong> ${data.ESTILO_FOTOGRAFICO || 'No especificado'}</div>
  </div>

  <div class="section">
    <h3>SERVICIOS DE VIDEO</h3>
    <div class="field"><strong>Tipo de Video:</strong> ${data.TIPO_VIDEO || 'No especificado'}</div>
    <div class="field"><strong>Duración de Grabación:</strong> ${data.DURACION_VIDEO || 'No especificada'}</div>
    <div class="field"><strong>Número de Camarógrafos:</strong> ${data.NUMERO_CAMAROGRAFOS || 'No especificado'}</div>
    <div class="field"><strong>Edición Incluida:</strong> ${data.EDICION_VIDEO || 'No especificada'}</div>
  </div>

  <div class="section">
    <h3>ENTREGABLES</h3>
    <div class="field"><strong>Formato de Entrega:</strong> ${data.FORMATO_ENTREGA || 'No especificado'}</div>
    <div class="field"><strong>Tiempo de Entrega:</strong> ${data.TIEMPO_ENTREGA || 'No especificado'}</div>
    <div class="field"><strong>Cantidad de Fotos:</strong> ${data.CANTIDAD_FOTOS || 'No especificada'}</div>
    <div class="field"><strong>Duración Video Final:</strong> ${data.DURACION_VIDEO_FINAL || 'No especificada'}</div>
  </div>
</body>
</html>`,

  anexo_c: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Anexo C - Catering y Servicios Gastronómicos</title>
  <style>
    body { 
      font-family: 'Times New Roman', serif; 
      margin: 2cm; 
      line-height: 1.4;
      color: #333;
    }
    .header { 
      text-align: center; 
      border-bottom: 2px solid #333; 
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .section { 
      margin: 25px 0; 
      page-break-inside: avoid;
    }
    .field { 
      margin: 12px 0; 
      padding: 8px 0;
      border-bottom: 1px dotted #ccc;
    }
    .field strong {
      display: inline-block;
      width: 180px;
      font-weight: bold;
    }
    h1 { color: #2c5aa0; font-size: 24px; margin: 0; }
    h2 { color: #666; font-size: 18px; margin: 10px 0 0 0; }
    h3 { color: #2c5aa0; font-size: 16px; border-bottom: 1px solid #2c5aa0; padding-bottom: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ANEXO C</h1>
    <h2>CATERING Y SERVICIOS GASTRONÓMICOS</h2>
  </div>
  
  <div class="section">
    <h3>INFORMACIÓN GENERAL</h3>
    <div class="field"><strong>Número de Invitados:</strong> ${data.NUMERO_INVITADOS || 'No especificado'}</div>
    <div class="field"><strong>Tipo de Servicio:</strong> ${data.TIPO_SERVICIO_CATERING || 'No especificado'}</div>
    <div class="field"><strong>Hora del Servicio:</strong> ${data.HORA_SERVICIO || 'No especificada'}</div>
  </div>

  <div class="section">
    <h3>MENÚ Y ALIMENTOS</h3>
    <div class="field"><strong>Tipo de Menú:</strong> ${data.TIPO_MENU || 'No especificado'}</div>
    <div class="field"><strong>Entrada:</strong> ${data.ENTRADA || 'No especificada'}</div>
    <div class="field"><strong>Plato Principal:</strong> ${data.PLATO_PRINCIPAL || 'No especificado'}</div>
    <div class="field"><strong>Postre:</strong> ${data.POSTRE || 'No especificado'}</div>
    <div class="field"><strong>Bebidas:</strong> ${data.BEBIDAS || 'No especificadas'}</div>
  </div>

  <div class="section">
    <h3>SERVICIOS ADICIONALES</h3>
    <div class="field"><strong>Personal de Servicio:</strong> ${data.PERSONAL_SERVICIO || 'No especificado'}</div>
    <div class="field"><strong>Mobiliario Catering:</strong> ${data.MOBILIARIO_CATERING || 'No especificado'}</div>
    <div class="field"><strong>Restricciones Dietéticas:</strong> ${data.RESTRICCIONES_DIETETICAS || 'Ninguna'}</div>
  </div>
</body>
</html>`,

  anexo_d: (data: any) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Anexo D - Servicios Técnicos Adicionales</title>
  <style>
    body { 
      font-family: 'Times New Roman', serif; 
      margin: 2cm; 
      line-height: 1.4;
      color: #333;
    }
    .header { 
      text-align: center; 
      border-bottom: 2px solid #333; 
      padding-bottom: 20px;
      margin-bottom: 30px;
    }
    .section { 
      margin: 25px 0; 
      page-break-inside: avoid;
    }
    .field { 
      margin: 12px 0; 
      padding: 8px 0;
      border-bottom: 1px dotted #ccc;
    }
    .field strong {
      display: inline-block;
      width: 180px;
      font-weight: bold;
    }
    h1 { color: #2c5aa0; font-size: 24px; margin: 0; }
    h2 { color: #666; font-size: 18px; margin: 10px 0 0 0; }
    h3 { color: #2c5aa0; font-size: 16px; border-bottom: 1px solid #2c5aa0; padding-bottom: 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>ANEXO D</h1>
    <h2>SERVICIOS TÉCNICOS ADICIONALES</h2>
  </div>
  
  <div class="section">
    <h3>EQUIPAMIENTO AUDIOVISUAL</h3>
    <div class="field"><strong>Sistema de Sonido:</strong> ${data.SISTEMA_SONIDO || 'No especificado'}</div>
    <div class="field"><strong>Equipo de Iluminación:</strong> ${data.EQUIPO_ILUMINACION || 'No especificado'}</div>
    <div class="field"><strong>Proyección/Pantallas:</strong> ${data.PROYECCION || 'No especificado'}</div>
    <div class="field"><strong>Micrófonos:</strong> ${data.MICROFONOS || 'No especificados'}</div>
  </div>

  <div class="section">
    <h3>SERVICIOS DE ENTRETENIMIENTO</h3>
    <div class="field"><strong>DJ/Música:</strong> ${data.DJ_MUSICA || 'No especificado'}</div>
    <div class="field"><strong>Animación:</strong> ${data.ANIMACION || 'No especificada'}</div>
    <div class="field"><strong>Shows Especiales:</strong> ${data.SHOWS_ESPECIALES || 'No especificados'}</div>
    <div class="field"><strong>Duración del Entretenimiento:</strong> ${data.DURACION_ENTRETENIMIENTO || 'No especificada'}</div>
  </div>

  <div class="section">
    <h3>SERVICIOS LOGÍSTICOS</h3>
    <div class="field"><strong>Transporte:</strong> ${data.TRANSPORTE || 'No especificado'}</div>
    <div class="field"><strong>Montaje/Desmontaje:</strong> ${data.MONTAJE_DESMONTAJE || 'No especificado'}</div>
    <div class="field"><strong>Personal Técnico:</strong> ${data.PERSONAL_TECNICO || 'No especificado'}</div>
    <div class="field"><strong>Coordinación Evento:</strong> ${data.COORDINACION_EVENTO || 'No especificada'}</div>
  </div>
</body>
</html>`
};

/**
 * Genera un PDF a partir de los datos extraídos
 */
export async function generatePDF(options: PDFGeneratorOptions): Promise<PDFGenerationResult> {
  try {
    // Validar inputs
    if (!options.templateType || !options.extractedData) {
      return {
        success: false,
        error: 'Template type y extracted data son requeridos'
      };
    }

    // Obtener el template HTML correspondiente
    const templateFunction = htmlTemplates[options.templateType];
    if (!templateFunction) {
      return {
        success: false,
        error: `Template no encontrado para tipo: ${options.templateType}`
      };
    }

    // Generar HTML con los datos
    const htmlContent = templateFunction(options.extractedData);

    // Configurar puppeteer para entorno serverless (Vercel con @sparticuz/chromium)
    let executablePath: string;
    
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      // En Vercel/producción, usar chromium
      executablePath = await chromium.executablePath();
    } else {
      // En desarrollo local, usar Chrome del sistema
      executablePath = process.platform === 'darwin' 
        ? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'
        : '/usr/bin/chromium-browser';
    }
    
    const browser = await puppeteer.launch({
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--single-process',
        '--no-zygote',
        '--disable-extensions',
        '--disable-background-timer-throttling',
        '--disable-backgrounding-occluded-windows',
        '--disable-renderer-backgrounding',
        '--disable-features=TranslateUI',
        '--disable-ipc-flooding-protection',
        '--memory-pressure-off'
      ],
      defaultViewport: { width: 1280, height: 720 },
      executablePath,
      headless: true,
      ignoreHTTPSErrors: true,
      timeout: 30000
    });

    const page = await browser.newPage();
    
    // Cargar el HTML
    await page.setContent(htmlContent, { 
      waitUntil: 'networkidle0',
      timeout: 30000 
    });

    // Generar PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: {
        top: '1cm',
        right: '1cm', 
        bottom: '1cm',
        left: '1cm'
      },
      printBackground: true,
      preferCSSPageSize: true
    });

    await browser.close();

    // Generar nombre de archivo único
    const timestamp = Date.now();
    const fileName = `${options.documentName}_${timestamp}.pdf`;

    return {
      success: true,
      pdfBuffer,
      fileName,
      downloadUrl: `/api/download/${fileName}` // URL del endpoint de descarga
    };

  } catch (error) {
    console.error('Error generando PDF:', error);
    return {
      success: false,
      error: `Error generando PDF: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}

/**
 * Genera PDF con template de error para casos donde faltan datos críticos
 */
export async function generateErrorPDF(
  errorMessage: string,
  templateType: DocumentType,
  partialData?: any
): Promise<PDFGenerationResult> {
  
  const errorHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Error en Procesamiento - ${templateType}</title>
  <style>
    body { 
      font-family: 'Times New Roman', serif; 
      margin: 2cm; 
      line-height: 1.6;
      color: #333;
    }
    .error-header {
      background: #f8d7da;
      border: 1px solid #f5c6cb;
      color: #721c24;
      padding: 20px;
      border-radius: 5px;
      margin-bottom: 30px;
    }
    .partial-data {
      background: #fff3cd;
      border: 1px solid #ffeaa7;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
  </style>
</head>
<body>
  <div class="error-header">
    <h1>⚠️ Error en Procesamiento del Documento</h1>
    <p><strong>Tipo de documento:</strong> ${templateType}</p>
    <p><strong>Error:</strong> ${errorMessage}</p>
    <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
  </div>

  <div class="partial-data">
    <h3>📋 Datos Parciales Extraídos</h3>
    <pre>${JSON.stringify(partialData || {}, null, 2)}</pre>
  </div>

  <div>
    <h3>🔧 Acciones Recomendadas</h3>
    <ul>
      <li>Verificar que la transcripción esté completa</li>
      <li>Asegurar que contenga todos los campos requeridos para ${templateType}</li>
      <li>Revisar la calidad del audio original</li>
      <li>Contactar soporte técnico si el problema persiste</li>
    </ul>
  </div>
</body>
</html>`;

  try {
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(errorHtml, { waitUntil: 'networkidle0' });
    
    const pdfBuffer = await page.pdf({
      format: 'A4',
      margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' }
    });

    await browser.close();

    const fileName = `error_${templateType}_${Date.now()}.pdf`;

    return {
      success: true,
      pdfBuffer,
      fileName,
      downloadUrl: `/api/download/${fileName}`
    };

  } catch (error) {
    return {
      success: false,
      error: `Error generando PDF de error: ${error instanceof Error ? error.message : 'Error desconocido'}`
    };
  }
}