/**
 * INTERFAZ DE CHAT PARA AGENTKIT - 3D PIXEL PERFECTION
 * 
 * Maneja las conversaciones de manera natural y eficiente,
 * manteniendo estado entre mensajes y guiando al usuario
 * hacia la generación exitosa de documentos.
 */

import { agent, ParalegalAgentState, SYSTEM_PROMPT } from './agent';
import { DocumentType } from '../schemas-real';

// Almacén temporal de estados de conversación (en producción usar Redis/DB)
const conversationStates = new Map<string, ParalegalAgentState>();

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface ChatResponse {
  response: string;
  conversationId: string;
  documentType?: DocumentType;
  progress?: {
    step: string;
    completionRate?: number;
    missingFields?: number;
  };
  pdfGenerated?: boolean;
  pdfData?: {
    base64: string;
    fileName: string;
    size: number;
  };
  needsInput?: {
    type: 'missing_data';
    questions: string[];
  };
}

/**
 * Procesa un mensaje del usuario usando AgentKit
 */
export async function processMessage(
  userMessage: string,
  conversationId: string = generateConversationId()
): Promise<ChatResponse> {
  try {
    // Obtener o crear estado de conversación
    let state = conversationStates.get(conversationId) || {
      sessionId: conversationId,
      extractedData: {},
      missingFields: [],
      conversationStep: 'classification'
    };

    // Contexto especializado basado en el paso actual
    const stepContext = getStepContext(state);
    
    // Ejecutar el agente con contexto especializado
    const result = await agent.run(
      `${SYSTEM_PROMPT}

${stepContext}

ESTADO ACTUAL:
- Paso: ${state.conversationStep}
- Tipo de documento: ${state.documentType || 'Sin determinar'}
- Datos extraídos: ${Object.keys(state.extractedData).length} campos
- Campos faltantes: ${state.missingFields.length}

MENSAJE DEL USUARIO: "${userMessage}"

INSTRUCCIONES ESPECÍFICAS:
${getStepInstructions(state)}`,
      { conversationId }
    );

    // Actualizar estado basado en la respuesta del agente
    state = await updateStateFromResult(state, result, userMessage);
    conversationStates.set(conversationId, state);

    // Construir respuesta
    return {
      response: result.response,
      conversationId,
      documentType: state.documentType,
      progress: {
        step: getStepDisplayName(state.conversationStep),
        completionRate: calculateCompletionRate(state),
        missingFields: state.missingFields.length
      },
      pdfGenerated: state.pdfGenerated,
      pdfData: state.pdfData,
      needsInput: state.missingFields.length > 0 && state.conversationStep === 'follow_up' 
        ? {
            type: 'missing_data',
            questions: state.missingFields.slice(0, 3) // Máximo 3 preguntas por vez
          }
        : undefined
    };

  } catch (error) {
    console.error('Error processing message:', error);
    return {
      response: `Lo siento, hubo un error procesando tu mensaje. ¿Podrías intentar reformular tu consulta sobre el evento?`,
      conversationId,
      progress: { step: 'Error', completionRate: 0, missingFields: 0 }
    };
  }
}

/**
 * Obtiene el contexto específico para cada paso de la conversación
 */
function getStepContext(state: ParalegalAgentState): string {
  switch (state.conversationStep) {
    case 'classification':
      return `El usuario va a describir un evento o solicitar un documento. 
      Tu trabajo es clasificar qué tipo de documento necesita usando la herramienta classify_document.`;
      
    case 'data_gathering':
      return `Ya sabes que tipo de documento necesita: ${state.documentType}. 
      Ahora extrae todos los datos posibles usando extract_data.`;
      
    case 'follow_up':
      return `Tienes datos parciales pero faltan ${state.missingFields.length} campos críticos.
      Haz preguntas específicas y naturales para obtener la información faltante.`;
      
    case 'ready_to_generate':
      return `Tienes todos los datos necesarios. Genera el PDF usando generate_pdf.`;
      
    case 'completed':
      return `El documento ya fue generado. Ayuda al usuario con nuevas consultas o modificaciones.`;
      
    default:
      return 'Determina qué paso seguir basado en el contexto de la conversación.';
  }
}

/**
 * Obtiene instrucciones específicas para cada paso
 */
function getStepInstructions(state: ParalegalAgentState): string {
  switch (state.conversationStep) {
    case 'classification':
      return `1. Usa classify_document con la transcripción del usuario
      2. Verifica seguridad con check_security si es necesario
      3. Explica qué tipo de documento identificaste y por qué`;
      
    case 'data_gathering':
      return `1. Usa extract_data para procesar toda la información disponible
      2. Identifica qué datos críticos faltan
      3. Si faltan datos, pasa a follow_up; si no, pasa a ready_to_generate`;
      
    case 'follow_up':
      return `1. Haz máximo 3 preguntas específicas sobre datos faltantes
      2. Cuando el usuario responda, usa extract_data nuevamente
      3. Repite hasta tener información suficiente`;
      
    case 'ready_to_generate':
      return `1. Usa generate_pdf con todos los datos extraídos
      2. Presenta el PDF generado al usuario
      3. Ofrece opciones de descarga o modificaciones`;
      
    default:
      return 'Analiza la situación y decide el mejor curso de acción.';
  }
}

/**
 * Actualiza el estado basado en el resultado del agente
 */
async function updateStateFromResult(
  state: ParalegalAgentState,
  result: any,
  userMessage: string
): Promise<ParalegalAgentState> {
  const updatedState = { ...state };
  
  // Analizar las herramientas ejecutadas por el agente
  if (result.toolCalls) {
    for (const toolCall of result.toolCalls) {
      switch (toolCall.toolName) {
        case 'classify_document':
          if (toolCall.result.success) {
            updatedState.documentType = toolCall.result.documentType;
            updatedState.conversationStep = 'data_gathering';
          }
          break;
          
        case 'extract_data':
          if (toolCall.result.success) {
            updatedState.extractedData = { ...updatedState.extractedData, ...toolCall.result.extractedData };
            updatedState.missingFields = toolCall.result.missingFields || [];
            updatedState.conversationStep = updatedState.missingFields.length > 0 ? 'follow_up' : 'ready_to_generate';
          }
          break;
          
        case 'generate_pdf':
          if (toolCall.result.success) {
            updatedState.pdfGenerated = true;
            updatedState.pdfData = toolCall.result.pdfData;
            updatedState.conversationStep = 'completed';
          }
          break;
      }
    }
  }
  
  return updatedState;
}

/**
 * Calcula el porcentaje de completitud basado en datos extraídos
 */
function calculateCompletionRate(state: ParalegalAgentState): number {
  const totalFields = Object.keys(state.extractedData).length;
  const missingFields = state.missingFields.length;
  
  if (totalFields === 0) return 0;
  return Math.round(((totalFields - missingFields) / totalFields) * 100);
}

/**
 * Convierte el paso técnico a nombre amigable
 */
function getStepDisplayName(step: string): string {
  const stepNames = {
    'classification': 'Identificando tipo de documento',
    'data_gathering': 'Recopilando información',
    'follow_up': 'Solicitando datos faltantes',
    'ready_to_generate': 'Listo para generar documento',
    'completed': 'Documento generado exitosamente'
  };
  
  return stepNames[step as keyof typeof stepNames] || 'Procesando';
}

/**
 * Genera un ID único para la conversación
 */
function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Obtiene el estado de una conversación
 */
export function getConversationState(conversationId: string): ParalegalAgentState | undefined {
  return conversationStates.get(conversationId);
}

/**
 * Limpia conversaciones antiguas (llamar periódicamente)
 */
export function cleanupOldConversations(maxAgeHours: number = 24): void {
  const maxAge = Date.now() - (maxAgeHours * 60 * 60 * 1000);
  
  for (const [id, state] of conversationStates.entries()) {
    const timestamp = parseInt(id.split('_')[1]);
    if (timestamp < maxAge) {
      conversationStates.delete(id);
    }
  }
}