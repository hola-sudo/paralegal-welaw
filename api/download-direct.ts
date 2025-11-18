/**
 * Endpoint para descargas directas de PDF (solución al problema de Vercel)
 * 
 * Recibe base64 del PDF y lo sirve para descarga
 */

import { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Método no permitido' });
    }

    const { pdf_base64, file_name } = req.body;
    
    if (!pdf_base64 || !file_name) {
      return res.status(400).json({ error: 'Faltan datos del PDF' });
    }

    // Convertir base64 a buffer
    const pdfBuffer = Buffer.from(pdf_base64, 'base64');

    // Configurar headers para descarga
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${file_name}"`);
    res.setHeader('Content-Length', pdfBuffer.length);
    res.setHeader('Cache-Control', 'no-cache');
    
    // Enviar PDF
    return res.send(pdfBuffer);

  } catch (error) {
    console.error('Error en descarga directa:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor' 
    });
  }
}