/**
 * ENDPOINT AGENTKIT CHAT - 3D PIXEL PERFECTION
 * 
 * Endpoint optimizado para AgentKit que mantiene conversaciones
 * naturales y maneja el flujo completo de generación de documentos.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processMessage, ChatMessage } from '../src/agentkit/chat-interface';

// Validar variables de entorno
const requiredEnvVars = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
};

const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Manejar preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Solo permitimos POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    // Verificar variables de entorno
    if (missingVars.length > 0) {
      return res.status(500).json({ 
        error: "Configuración del servidor incompleta", 
        missing_vars: missingVars 
      });
    }

    const { message, conversationId } = req.body as { 
      message?: string; 
      conversationId?: string;
    };
    
    if (!message) {
      return res.status(400).json({ 
        error: "Falta 'message' en el cuerpo de la petición" 
      });
    }

    // Procesar el mensaje con AgentKit
    console.log('🤖 Procesando mensaje con AgentKit:', { message, conversationId });
    
    const response = await processMessage(message, conversationId);
    
    console.log('✅ Respuesta generada:', {
      conversationId: response.conversationId,
      documentType: response.documentType,
      step: response.progress?.step,
      completionRate: response.progress?.completionRate,
      pdfGenerated: response.pdfGenerated
    });

    // Respuesta exitosa
    return res.status(200).json({
      success: true,
      response: response.response,
      conversationId: response.conversationId,
      documentType: response.documentType,
      progress: response.progress,
      pdfGenerated: response.pdfGenerated,
      pdfData: response.pdfData,
      needsInput: response.needsInput,
      metadata: {
        timestamp: new Date().toISOString(),
        agentVersion: 'AgentKit-v1.0',
        processingTime: 'Sub-5-seconds'
      }
    });

  } catch (error: any) {
    console.error('❌ Error en agentkit-chat:', error);
    
    return res.status(500).json({ 
      error: 'Error interno del agente',
      message: error.message || 'Error desconocido',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      suggestions: [
        'Verifica que tu mensaje esté relacionado con eventos y renders 3D',
        'Intenta ser más específico sobre el tipo de documento que necesitas',
        'Si el error persiste, contacta al administrador del sistema'
      ]
    });
  }
}

/**
 * Endpoint de estado de conversación (opcional)
 */
export async function getConversationStatus(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  const { conversationId } = req.query;
  
  if (!conversationId || typeof conversationId !== 'string') {
    return res.status(400).json({ error: 'Missing conversationId parameter' });
  }

  try {
    const { getConversationState } = await import('../src/agentkit/chat-interface');
    const state = getConversationState(conversationId);
    
    if (!state) {
      return res.status(404).json({ error: 'Conversation not found' });
    }

    return res.status(200).json({
      conversationId,
      step: state.conversationStep,
      documentType: state.documentType,
      progress: {
        extractedFields: Object.keys(state.extractedData).length,
        missingFields: state.missingFields.length,
        completionRate: Math.round(
          ((Object.keys(state.extractedData).length - state.missingFields.length) / 
           Object.keys(state.extractedData).length) * 100
        )
      },
      pdfGenerated: state.pdfGenerated
    });

  } catch (error: any) {
    console.error('Error getting conversation status:', error);
    return res.status(500).json({ error: 'Error retrieving conversation status' });
  }
}