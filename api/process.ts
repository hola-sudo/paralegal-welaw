/**
 * API Endpoint para Vercel
 * 
 * Este es el endpoint que Vercel usará para procesar transcripciones.
 * Acepta POST requests con una transcripción y retorna los datos estructurados.
 * 
 * Ruta: /api/process
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processTranscript } from '../src/agent';

/**
 * Maneja las requests POST al endpoint /api/process
 * 
 * Body esperado:
 * {
 *   "transcript": "texto de la transcripción aquí..."
 * }
 * 
 * Respuesta exitosa (200):
 * {
 *   "success": true,
 *   "data": {
 *     "tipo_documento": "contrato_base",
 *     "datos": { ... },
 *     "guardrails": { ... },
 *     "metadata": { ... }
 *   }
 * }
 * 
 * Respuesta de error (400/500):
 * {
 *   "success": false,
 *   "error": "mensaje de error"
 * }
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Solo permitimos métodos POST
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Método no permitido. Use POST.',
    });
  }

  try {
    // Validamos que tengamos la API key de OpenAI
    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        success: false,
        error: 'OPENAI_API_KEY no está configurada. Por favor, configura la variable de entorno.',
      });
    }

    // Obtenemos la transcripción del body
    const { transcript } = req.body;

    // Validamos que la transcripción esté presente
    if (!transcript || typeof transcript !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Se requiere el campo "transcript" en el body de la request.',
      });
    }

    // Validamos que la transcripción no esté vacía
    if (transcript.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: 'La transcripción no puede estar vacía.',
      });
    }

    // Procesamos la transcripción usando nuestro agente
    const result = await processTranscript(transcript);

    // Retornamos el resultado exitoso
    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    // Manejo de errores
    console.error('Error al procesar transcripción:', error);
    
    // Si es un error conocido (bloqueado por guardrails, etc.), retornamos 400
    if (error instanceof Error && error.message.includes('bloqueado')) {
      return res.status(400).json({
        success: false,
        error: error.message,
      });
    }

    // Para otros errores, retornamos 500
    return res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Error desconocido al procesar la transcripción',
    });
  }
}

