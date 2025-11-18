/**
 * AGENTE CONVERSACIONAL SIMPLE - 3D PIXEL PERFECTION
 * 
 * Implementación directa con OpenAI manteniendo toda la lógica especializada
 * del negocio de renders 3D, sin dependencias complejas de AgentKit.
 */

import OpenAI from 'openai';
import { DocumentType, ExtractedDataReal } from '../schemas-real';
import { generatePDF } from '../pdf-generator';
import { runGuardrails } from '../guardrails';
import { classifyDocumentReal, extractPlaceholdersReal, findMissingCriticalFields, generateFollowUpQuestions } from '../classification-real';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Estado de la conversación
export interface ConversationState {
  sessionId: string;
  step: 'classification' | 'data_gathering' | 'follow_up' | 'ready_to_generate' | 'completed';
  documentType?: DocumentType;
  extractedData: Partial<ExtractedDataReal>;
  missingFields: string[];
  conversationHistory: Array<{
    role: 'user' | 'assistant';
    message: string;
    timestamp: string;
  }>;
  pdfGenerated?: boolean;
  pdfData?: {
    base64: string;
    fileName: string;
    size: number;
  };
}

// Respuesta del agente
export interface AgentResponse {
  response: string;
  conversationId: string;
  documentType?: DocumentType;
  progress: {
    step: string;
    completionRate: number;
    missingFields: number;
  };
  pdfGenerated?: boolean;
  pdfData?: {
    base64: string;
    fileName: string;
    size: number;
  };
  needsInput?: boolean;
}

// Almacén temporal de conversaciones
const conversations = new Map<string, ConversationState>();

/**
 * Procesa un mensaje del usuario con flujo conversacional inteligente
 */
export async function processConversationalMessage(
  userMessage: string,
  conversationId?: string
): Promise<AgentResponse> {
  // Obtener o crear conversación
  const id = conversationId || generateSessionId();
  let state = conversations.get(id) || {
    sessionId: id,
    step: 'classification',
    extractedData: {},
    missingFields: [],
    conversationHistory: []
  };

  // Agregar mensaje del usuario al historial
  state.conversationHistory.push({
    role: 'user',
    message: userMessage,
    timestamp: new Date().toISOString()
  });

  try {
    let response: string;
    let newState = { ...state };

    // Verificar guardrails primero
    const guardrails = await runGuardrails(userMessage);
    if (guardrails.overall.blocked) {
      return {
        response: `⚠️ Lo siento, no puedo procesar este contenido por medidas de seguridad: ${guardrails.overall.warnings.join(', ')}`,
        conversationId: id,
        progress: { step: 'Error de seguridad', completionRate: 0, missingFields: 0 }
      };
    }

    // Flujo conversacional basado en el paso actual
    switch (state.step) {
      case 'classification':
        const classificationResult = await handleClassification(userMessage, state);
        response = classificationResult.response;
        newState = classificationResult.newState;
        break;

      case 'data_gathering':
        const gatheringResult = await handleDataGathering(userMessage, state);
        response = gatheringResult.response;
        newState = gatheringResult.newState;
        break;

      case 'follow_up':
        const followUpResult = await handleFollowUp(userMessage, state);
        response = followUpResult.response;
        newState = followUpResult.newState;
        break;

      case 'ready_to_generate':
        const generateResult = await handleGeneration(state);
        response = generateResult.response;
        newState = generateResult.newState;
        break;

      case 'completed':
        response = await handleCompleted(userMessage, state);
        break;

      default:
        response = "Lo siento, algo salió mal. Empecemos de nuevo: ¿qué tipo de documento necesitas para tu evento?";
        newState.step = 'classification';
    }

    // Agregar respuesta al historial
    newState.conversationHistory.push({
      role: 'assistant',
      message: response,
      timestamp: new Date().toISOString()
    });

    // Actualizar estado en memoria
    conversations.set(id, newState);

    return {
      response,
      conversationId: id,
      documentType: newState.documentType,
      progress: {
        step: getStepDisplayName(newState.step),
        completionRate: calculateCompletionRate(newState),
        missingFields: newState.missingFields.length
      },
      pdfGenerated: newState.pdfGenerated,
      pdfData: newState.pdfData,
      needsInput: newState.missingFields.length > 0
    };

  } catch (error) {
    console.error('Error processing message:', error);
    return {
      response: 'Lo siento, hubo un error procesando tu mensaje. ¿Podrías intentar de nuevo describiendo qué tipo de documento necesitas?',
      conversationId: id,
      progress: { step: 'Error', completionRate: 0, missingFields: 0 }
    };
  }
}

/**
 * Maneja la clasificación del tipo de documento
 */
async function handleClassification(
  userMessage: string, 
  state: ConversationState
): Promise<{ response: string; newState: ConversationState }> {
  try {
    const documentType = await classifyDocumentReal(userMessage);
    const newState = { 
      ...state, 
      documentType, 
      step: 'data_gathering' as const 
    };

    const documentNames = {
      'contrato_base': 'CONTRATO BASE',
      'anexo_a': 'ANEXO A - Especificaciones de Montaje',
      'anexo_b': 'ANEXO B - Renders y Temas Visuales',
      'anexo_c': 'ANEXO C - Control de Cambios',
      'anexo_d': 'ANEXO D - Entrega Final'
    };

    const response = `✅ **${documentNames[documentType]}**

Perfecto, he identificado que necesitas generar un **${documentNames[documentType]}** para tu evento.

Ahora necesito recopilar algunos datos específicos. Por favor, compárteme toda la información que tengas disponible sobre:

${getDataRequirementsMessage(documentType)}`;

    return { response, newState };
  } catch (error) {
    const response = `No pude determinar exactamente qué tipo de documento necesitas. ¿Podrías especificar si necesitas:

📄 **Contrato base** - Para un nuevo evento
🏗️ **Especificaciones de montaje** - Detalles técnicos del salón y decoración  
🎨 **Renders y temas** - Estilos visuales y confirmación de renders
🔄 **Control de cambios** - Modificaciones a renders existentes
📋 **Entrega final** - Autorización y entrega del proyecto`;

    return { response, newState: state };
  }
}

/**
 * Maneja la recopilación inicial de datos
 */
async function handleDataGathering(
  userMessage: string,
  state: ConversationState
): Promise<{ response: string; newState: ConversationState }> {
  try {
    const extractedData = await extractPlaceholdersReal(userMessage, state.documentType!);
    const missingFields = findMissingCriticalFields(extractedData, state.documentType!);

    const newState = {
      ...state,
      extractedData: { ...state.extractedData, ...extractedData },
      missingFields,
      step: missingFields.length > 0 ? 'follow_up' as const : 'ready_to_generate' as const
    };

    let response: string;
    if (missingFields.length > 0) {
      const questions = generateFollowUpQuestions(missingFields, state.documentType!);
      response = `📊 **Información recibida correctamente**

He extraído ${Object.keys(extractedData).length} datos de tu mensaje. Sin embargo, necesito algunos datos adicionales para completar el documento:

${questions.slice(0, 3).map((q, i) => `${i + 1}. ${q}`).join('\n')}

Por favor, proporciona esta información para continuar.`;
    } else {
      response = `🎉 **¡Excelente!**

He recopilado toda la información necesaria para generar tu documento. Proceeding a generar el PDF...`;
    }

    return { response, newState };
  } catch (error) {
    const response = `No pude extraer todos los datos de tu mensaje. ¿Podrías proporcionarme la información de manera más estructurada?

Por ejemplo:
- Nombre del cliente
- Tipo de evento
- Fecha y hora  
- Ubicación
- Detalles específicos según el tipo de documento`;

    return { response, newState: state };
  }
}

/**
 * Maneja las preguntas de seguimiento
 */
async function handleFollowUp(
  userMessage: string,
  state: ConversationState
): Promise<{ response: string; newState: ConversationState }> {
  // Extraer datos adicionales de la respuesta del usuario
  const additionalData = await extractPlaceholdersReal(userMessage, state.documentType!);
  const updatedData = { ...state.extractedData, ...additionalData };
  const missingFields = findMissingCriticalFields(updatedData, state.documentType!);

  const newState = {
    ...state,
    extractedData: updatedData,
    missingFields,
    step: missingFields.length > 0 ? 'follow_up' as const : 'ready_to_generate' as const
  };

  let response: string;
  if (missingFields.length > 0) {
    const questions = generateFollowUpQuestions(missingFields, state.documentType!);
    response = `👍 **Información actualizada**

Solo necesito algunos datos más:

${questions.slice(0, 2).map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
  } else {
    response = `✅ **¡Información completa!**

Perfecto, ya tengo todos los datos necesarios. Generando tu documento PDF...`;
  }

  return { response, newState };
}

/**
 * Maneja la generación del PDF
 */
async function handleGeneration(
  state: ConversationState
): Promise<{ response: string; newState: ConversationState }> {
  try {
    const pdfResult = await generatePDF({
      templateType: state.documentType!,
      extractedData: state.extractedData as any,
      documentName: `${state.documentType}_${Date.now()}`,
      includeMetadata: true
    });

    if (!pdfResult.success) {
      throw new Error(pdfResult.error || 'Error generando PDF');
    }

    const pdfBase64 = pdfResult.pdfBuffer?.toString('base64') || '';
    const pdfData = {
      base64: pdfBase64,
      fileName: pdfResult.fileName || `${state.documentType}.pdf`,
      size: pdfResult.pdfBuffer?.length || 0
    };

    const newState = {
      ...state,
      step: 'completed' as const,
      pdfGenerated: true,
      pdfData
    };

    const response = `🎉 **¡Documento generado exitosamente!**

📄 **Archivo:** ${pdfData.fileName}
📊 **Tamaño:** ${Math.round(pdfData.size / 1024)} KB
📋 **Tipo:** ${state.documentType?.replace('_', ' ').toUpperCase()}

Tu documento está listo para descargar. El PDF contiene toda la información proporcionada con formato profesional.

¿Necesitas generar algún otro documento o hacer alguna modificación?`;

    return { response, newState };
  } catch (error) {
    const response = `❌ **Error al generar PDF**

Hubo un problema generando el documento: ${error instanceof Error ? error.message : 'Error desconocido'}

¿Podrías verificar si toda la información está correcta e intentar nuevamente?`;

    return { response, newState: { ...state, step: 'follow_up' } };
  }
}

/**
 * Maneja conversaciones después de completar un documento
 */
async function handleCompleted(
  userMessage: string,
  state: ConversationState
): Promise<string> {
  const lowerMessage = userMessage.toLowerCase();
  
  if (lowerMessage.includes('nuevo') || lowerMessage.includes('otro documento')) {
    // Reiniciar para un nuevo documento
    const newState: ConversationState = {
      sessionId: state.sessionId,
      step: 'classification',
      extractedData: {},
      missingFields: [],
      conversationHistory: state.conversationHistory
    };
    conversations.set(state.sessionId, newState);
    
    return `🆕 **Nuevo documento**

Perfecto, vamos a crear un nuevo documento. ¿Qué tipo de documento necesitas esta vez?`;
  }
  
  return `👋 **Documento completado**

Tu documento ya fue generado exitosamente. Si necesitas:
- 🆕 **Crear un nuevo documento** - Solo dime qué tipo necesitas
- 🔄 **Modificar el actual** - Especifica qué cambios requieres  
- ❓ **Ayuda** - Pregúntame sobre el proceso

¿En qué más puedo ayudarte?`;
}

/**
 * Obtiene mensaje de requerimientos según el tipo de documento
 */
function getDataRequirementsMessage(documentType: DocumentType): string {
  const requirements = {
    'contrato_base': '• Nombre completo del cliente\n• RFC (opcional)\n• Tipo de evento (boda, XV años, etc.)\n• Fecha y hora del evento\n• Ubicación del evento',
    'anexo_a': '• Información del cliente y evento\n• Medidas del salón (largo, ancho, alto)\n• Detalles de decoración y montaje\n• Tipo y cantidad de mobiliario\n• Elementos decorativos específicos',
    'anexo_b': '• Información del evento\n• Temas o estilos visuales deseados\n• Preferencias de renders\n• Representante asignado',
    'anexo_c': '• Nombre del evento\n• Ronda de revisión\n• Cambios específicos solicitados\n• Estados actuales y deseados',
    'anexo_d': '• Información del evento\n• Fecha de entrega\n• Cantidad de renders\n• Costo total\n• Autorización de pago'
  };

  return requirements[documentType] || 'Información general del evento y cliente';
}

/**
 * Calcula el porcentaje de completitud
 */
function calculateCompletionRate(state: ConversationState): number {
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
 * Genera un ID único para la sesión
 */
function generateSessionId(): string {
  return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Limpia conversaciones antiguas
 */
export function cleanupOldConversations(maxAgeHours: number = 24): void {
  const maxAge = Date.now() - (maxAgeHours * 60 * 60 * 1000);
  
  for (const [id, state] of conversations.entries()) {
    const timestamp = parseInt(id.split('_')[1]);
    if (timestamp < maxAge) {
      conversations.delete(id);
    }
  }
}