/**
 * ENDPOINT AGENTKIT CHAT - 3D PIXEL PERFECTION
 * 
 * Endpoint optimizado para AgentKit que mantiene conversaciones
 * naturales y maneja el flujo completo de generación de documentos.
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { classifyDocumentReal, extractPlaceholdersReal, findMissingCriticalFields, generateFollowUpQuestions } from '../src/classification-real';
import { generatePDF } from '../src/pdf-generator';
import { runGuardrails } from '../src/guardrails';

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

    // Procesar el mensaje con agente conversacional simple  
    console.log('🤖 Procesando mensaje:', { message, conversationId });
    
    // Procesamiento simple directo
    const guardrails = await runGuardrails(message);
    if (guardrails.overall.blocked) {
      return res.status(400).json({
        success: false,
        error: "Contenido bloqueado por medidas de seguridad",
        warnings: guardrails.overall.warnings
      });
    }

    const documentType = await classifyDocumentReal(message);
    const extractedData = await extractPlaceholdersReal(message, documentType);
    const missingFields = findMissingCriticalFields(extractedData, documentType);
    
    let pdfData = null;
    let pdfGenerated = false;
    
    if (missingFields.length === 0) {
      const pdfResult = await generatePDF({
        templateType: documentType,
        extractedData,
        documentName: `${documentType}_${Date.now()}`,
        includeMetadata: true
      });
      
      if (pdfResult.success && pdfResult.pdfBuffer) {
        pdfData = {
          base64: pdfResult.pdfBuffer.toString('base64'),
          fileName: pdfResult.fileName || `${documentType}.pdf`,
          size: pdfResult.pdfBuffer.length
        };
        pdfGenerated = true;
      }
    }
    
    const response = {
      response: pdfGenerated 
        ? `¡PDF ${documentType.toUpperCase()} generado exitosamente! Descarga disponible.`
        : `He identificado que necesitas un ${documentType.toUpperCase()}. ${missingFields.length > 0 ? `Faltan ${missingFields.length} campos críticos.` : 'Procesando...'}`,
      conversationId: conversationId || `conv_${Date.now()}`,
      documentType,
      progress: {
        step: pdfGenerated ? 'Documento generado exitosamente' : 'Recopilando información',
        completionRate: Math.round(((Object.keys(extractedData).length - missingFields.length) / Object.keys(extractedData).length) * 100),
        missingFields: missingFields.length
      },
      pdfGenerated,
      pdfData,
      needsInput: missingFields.length > 0
    };
    
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
        agentVersion: 'SimpleAgent-v1.0',
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
    return res.status(200).json({
      conversationId,
      step: 'active',
      documentType: null,
      progress: {
        extractedFields: 0,
        missingFields: 0,
        completionRate: 0
      },
      pdfGenerated: false,
      message: 'Estado simplificado - usa el endpoint principal para conversaciones'
    });

  } catch (error: any) {
    console.error('Error getting conversation status:', error);
    return res.status(500).json({ error: 'Error retrieving conversation status' });
  }
}