/**
 * Endpoint para servir archivos PDF generados
 * 
 * Este endpoint maneja la descarga de PDFs generados temporalmente
 * Los archivos se sirven con headers correctos para descarga automática
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

// Store temporal en memoria para PDFs (en producción podría usar Vercel Blob)
const pdfStore = new Map<string, { buffer: Buffer; fileName: string; createdAt: number }>();

// Cleanup automático de archivos antiguos (5 minutos)
const CLEANUP_TIMEOUT = 5 * 60 * 1000; // 5 minutos
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pdfStore.entries()) {
    if (now - value.createdAt > CLEANUP_TIMEOUT) {
      pdfStore.delete(key);
    }
  }
}, 60000); // Ejecuta cada minuto

/**
 * Almacena un PDF en el store temporal
 */
export function storePDF(fileId: string, pdfBuffer: Buffer, fileName: string): void {
  pdfStore.set(fileId, {
    buffer: pdfBuffer,
    fileName,
    createdAt: Date.now()
  });
}

/**
 * Handler principal del endpoint de descarga
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // Solo permitimos GET requests
    if (req.method !== 'GET') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { fileId } = req.query;
    
    // Validar fileId
    if (!fileId || typeof fileId !== 'string') {
      return res.status(400).json({ error: 'File ID requerido' });
    }

    // Buscar el archivo en el store
    const pdfData = pdfStore.get(fileId);
    
    if (!pdfData) {
      return res.status(404).json({ 
        error: 'Archivo no encontrado o ha expirado',
        message: 'Los archivos PDF son válidos por 5 minutos después de ser generados'
      });
    }

    // Configurar headers para descarga de PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${pdfData.fileName}"`);
    res.setHeader('Content-Length', pdfData.buffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Enviar el PDF
    return res.send(pdfData.buffer);

  } catch (error) {
    console.error('Error en endpoint de descarga:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: 'No se pudo procesar la descarga del archivo'
    });
  }
}