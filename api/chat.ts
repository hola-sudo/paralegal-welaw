import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processUserMessage, initializeConversation, ConversationState } from '../src/agent-real';
import { DocumentType } from '../src/schemas-real';

// Simple in-memory storage para demo (en producción usar Redis/Database)
const conversations = new Map<string, ConversationState>();

const MCP_ENDPOINT = process.env.MCP_ENDPOINT as string;
const MCP_API_KEY = process.env.MCP_API_KEY as string;
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID as string;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { sessionId, message, documentType, action } = req.body as {
      sessionId?: string;
      message?: string;
      documentType?: DocumentType;
      action?: 'start' | 'continue' | 'generate';
    };

    // Validación básica
    if (!sessionId) {
      return res.status(400).json({ 
        error: "sessionId es requerido" 
      });
    }

    // Inicializar nueva conversación
    if (action === 'start' || !conversations.has(sessionId)) {
      const newConversation = initializeConversation(sessionId);
      conversations.set(sessionId, newConversation);
      
      return res.status(200).json({
        sessionId,
        message: `¡Hola! Soy tu asistente para documentos de 3D Pixel Perfection. 🎨

¿Qué documento necesitas generar hoy?

📄 **Contrato Base** - Para nuevos eventos
📋 **Anexo A** - Especificaciones de montaje y decoración  
🎨 **Anexo B** - Renders y temas visuales
✏️ **Anexo C** - Control de cambios y revisiones
✅ **Anexo D** - Entrega final y autorización

Puedes decirme directamente qué necesitas (ej: "Necesito un contrato para una boda") o seleccionar un tipo específico.`,
        step: 'document_type_selection',
        complete: false,
        options: ['contrato_base', 'anexo_a', 'anexo_b', 'anexo_c', 'anexo_d']
      });
    }

    // Obtener estado de conversación
    const currentState = conversations.get(sessionId);
    if (!currentState) {
      return res.status(404).json({ 
        error: "Sesión no encontrada. Inicia una nueva conversación." 
      });
    }

    // Acción de generar documento
    if (action === 'generate') {
      if (currentState.step !== 'ready_to_generate' && currentState.step !== 'follow_up_questions') {
        return res.status(400).json({
          error: "No hay suficiente información para generar el documento"
        });
      }

      return await generateDocument(res, currentState, sessionId);
    }

    // Continuar conversación
    if (!message) {
      return res.status(400).json({ 
        error: "message es requerido para continuar la conversación" 
      });
    }

    const result = await processUserMessage(currentState, message, documentType);
    
    // Actualizar estado en memoria
    conversations.set(sessionId, result.updatedState);

    // Si está listo para generar, generar automáticamente
    if (result.nextAction === 'generate_document') {
      return await generateDocument(res, result.updatedState, sessionId);
    }

    return res.status(200).json({
      sessionId,
      message: result.response,
      step: result.updatedState.step,
      documentType: result.updatedState.documentType,
      progress: result.progress,
      complete: result.updatedState.isComplete,
      extractedData: result.updatedState.extractedData,
      missingFields: result.updatedState.missingFields
    });

  } catch (error: any) {
    console.error('Error en api/chat:', error);
    return res.status(500).json({ 
      error: error.message || 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Genera el documento usando MCP y actualiza el estado
 */
async function generateDocument(
  res: VercelResponse, 
  state: ConversationState, 
  sessionId: string
): Promise<void> {
  try {
    if (!state.documentType || !state.extractedData) {
      throw new Error('Estado incompleto para generar documento');
    }

    // Preparar datos para MCP
    const templateName = getTemplateNameForMCP(state.documentType);
    const replacements = flattenDataForMCP(state.extractedData);

    // Llamada a MCP
    const mcpResponse = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream", 
        "Authorization": `Bearer ${MCP_API_KEY}` 
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "notifications/list",
        params: {
          action: "create_document_from_template", 
          template_file_id: templateName,
          destination_folder_id: DRIVE_FOLDER_ID,
          field_values: replacements
        },
        id: 1
      })
    });

    const mcpResult = await mcpResponse.json() as { nuevo_doc_url?: string; error?: string };

    if (mcpResult.error) {
      throw new Error(`Error de MCP: ${mcpResult.error}`);
    }

    // Actualizar estado como completado
    const updatedState: ConversationState = {
      ...state,
      step: 'document_generated',
      isComplete: true,
      documentUrl: mcpResult.nuevo_doc_url
    };

    conversations.set(sessionId, updatedState);

    res.status(200).json({
      sessionId,
      complete: true,
      success: true,
      message: `🎉 ¡Documento ${state.documentType} generado exitosamente!

📄 **Tipo:** ${state.documentType}
🔗 **Documento:** ${mcpResult.nuevo_doc_url || 'Creado en Google Drive'}
⏰ **Generado:** ${new Date().toLocaleString('es-MX')}

¿Necesitas generar algún otro documento para este proyecto?`,
      documentUrl: mcpResult.nuevo_doc_url,
      documentType: state.documentType,
      extractedData: state.extractedData
    });

  } catch (error: any) {
    console.error('Error generando documento:', error);
    res.status(500).json({
      error: `Error al generar documento: ${error.message}`
    });
  }
}

/**
 * Mapea tipo de documento a nombre de plantilla en Google Drive
 */
function getTemplateNameForMCP(documentType: DocumentType): string {
  const templateNames = {
    contrato_base: "Contrato Base 3D Pixel Perfection - Plantilla",
    anexo_a: "ANEXO A - Plantilla",
    anexo_b: "ANEXO B - Plantilla", 
    anexo_c: "ANEXO C - Plantilla",
    anexo_d: "ANEXO D - Plantilla"
  };
  
  return templateNames[documentType];
}

/**
 * Convierte datos estructurados a formato plano para MCP
 */
function flattenDataForMCP(data: any): Record<string, string> {
  const flattened: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) {
      flattened[key] = '';
    } else if (Array.isArray(value)) {
      flattened[key] = value.join(', ');
    } else if (typeof value === 'object') {
      // Para objetos anidados, los aplanamos con underscore
      for (const [subKey, subValue] of Object.entries(value)) {
        flattened[`${key}_${subKey}`] = String(subValue || '');
      }
    } else {
      flattened[key] = String(value);
    }
  }
  
  return flattened;
}