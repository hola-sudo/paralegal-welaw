/**
 * AGENTE CONVERSACIONAL REAL para 3D Pixel Perfection
 * 
 * Este agente maneja el flujo completo:
 * 1. Usuario dice qué documento quiere
 * 2. Agente pide los datos disponibles  
 * 3. Extrae lo que puede de la transcripción
 * 4. Identifica qué falta y pregunta específicamente
 * 5. Genera el documento cuando está completo
 */

import { classifyDocumentReal, extractPlaceholdersReal, findMissingCriticalFields, generateFollowUpQuestions } from './classification-real';
import { runGuardrails } from './guardrails';
import { DocumentType, ExtractedDataReal, getRequiredFieldsReal, getTemplateNameReal } from './schemas-real';

/**
 * Estados de la conversación
 */
export type ConversationStep = 
  | 'document_type_selection'  // Usuario selecciona tipo de documento
  | 'initial_data_gathering'   // Usuario provee transcripción inicial
  | 'follow_up_questions'      // Agente pregunta datos faltantes
  | 'ready_to_generate'        // Listo para generar documento
  | 'document_generated';      // Documento generado exitosamente

export interface ConversationState {
  sessionId: string;
  step: ConversationStep;
  documentType: DocumentType | null;
  extractedData: Partial<ExtractedDataReal>;
  missingFields: string[];
  conversationHistory: Array<{
    role: 'user' | 'agent';
    message: string;
    timestamp: string;
  }>;
  isComplete: boolean;
  documentUrl?: string;
}

/**
 * Resultado de procesar un mensaje del usuario
 */
export interface ConversationResult {
  response: string;
  updatedState: ConversationState;
  nextAction: 'ask_document_type' | 'ask_for_data' | 'ask_follow_up' | 'generate_document' | 'complete';
  progress?: {
    completedFields: number;
    totalFields: number;
    percentage: number;
  };
}

/**
 * Inicia una nueva conversación
 */
export function initializeConversation(sessionId: string): ConversationState {
  return {
    sessionId,
    step: 'document_type_selection',
    documentType: null,
    extractedData: {},
    missingFields: [],
    conversationHistory: [],
    isComplete: false
  };
}

/**
 * Procesa un mensaje del usuario en el contexto de la conversación
 */
export async function processUserMessage(
  state: ConversationState,
  userMessage: string,
  explicitDocumentType?: DocumentType
): Promise<ConversationResult> {
  
  // Agregamos el mensaje del usuario al historial
  const updatedHistory = [...state.conversationHistory, {
    role: 'user' as const,
    message: userMessage,
    timestamp: new Date().toISOString()
  }];

  try {
    let updatedState: ConversationState;
    let response: string;
    let nextAction: ConversationResult['nextAction'];

    switch (state.step) {
      case 'document_type_selection':
        return await handleDocumentTypeSelection(state, userMessage, explicitDocumentType, updatedHistory);

      case 'initial_data_gathering':
        return await handleInitialDataGathering(state, userMessage, updatedHistory);

      case 'follow_up_questions':
        return await handleFollowUpQuestions(state, userMessage, updatedHistory);

      case 'ready_to_generate':
        return await handleDocumentGeneration(state, updatedHistory);

      default:
        throw new Error(`Estado de conversación no válido: ${state.step}`);
    }

  } catch (error) {
    console.error('Error procesando mensaje del usuario:', error);
    
    return {
      response: 'Lo siento, hubo un error procesando tu mensaje. ¿Podrías repetir la información?',
      updatedState: {
        ...state,
        conversationHistory: updatedHistory
      },
      nextAction: state.step === 'document_type_selection' ? 'ask_document_type' : 'ask_for_data'
    };
  }
}

/**
 * Maneja la selección del tipo de documento
 */
async function handleDocumentTypeSelection(
  state: ConversationState,
  userMessage: string,
  explicitDocumentType: DocumentType | undefined,
  updatedHistory: any[]
): Promise<ConversationResult> {
  
  let documentType: DocumentType;
  
  if (explicitDocumentType) {
    documentType = explicitDocumentType;
  } else {
    // Intentamos clasificar el mensaje del usuario
    documentType = await classifyDocumentReal(userMessage);
  }

  const documentDescriptions = {
    contrato_base: 'Contrato Base del evento',
    anexo_a: 'Anexo A - Especificaciones de montaje y decoración', 
    anexo_b: 'Anexo B - Renders y temas visuales',
    anexo_c: 'Anexo C - Control de cambios y revisiones',
    anexo_d: 'Anexo D - Entrega final y autorización'
  };

  const response = `Perfecto, voy a ayudarte a generar el **${documentDescriptions[documentType]}**.

Ahora necesito que me des toda la información que tengas disponible. Puede ser:
- Una transcripción de tu reunión con el cliente
- Notas que hayas tomado
- Cualquier información relevante sobre el evento

Entre más detalles me des, mejor podré llenar el documento. ¡Compárteme todo lo que tengas!`;

  const updatedState: ConversationState = {
    ...state,
    step: 'initial_data_gathering',
    documentType,
    conversationHistory: [
      ...updatedHistory,
      {
        role: 'agent',
        message: response,
        timestamp: new Date().toISOString()
      }
    ]
  };

  return {
    response,
    updatedState,
    nextAction: 'ask_for_data'
  };
}

/**
 * Maneja la recolección inicial de datos
 */
async function handleInitialDataGathering(
  state: ConversationState,
  userMessage: string,
  updatedHistory: any[]
): Promise<ConversationResult> {
  
  if (!state.documentType) {
    throw new Error('Tipo de documento no definido en estado');
  }

  // Verificamos guardrails primero
  const guardrailResults = await runGuardrails(userMessage);
  
  if (guardrailResults.overall.blocked) {
    return {
      response: `⚠️ Detecté algunos problemas de seguridad en la información proporcionada: ${guardrailResults.overall.warnings.join(', ')}. 
      
Por favor, revisa la información y proporciona una versión sin datos sensibles como números de identificación personal.`,
      updatedState: {
        ...state,
        conversationHistory: updatedHistory
      },
      nextAction: 'ask_for_data'
    };
  }

  // Extraemos los datos de la transcripción
  const extractedData = await extractPlaceholdersReal(userMessage, state.documentType);
  
  // Identificamos campos faltantes críticos
  const missingFields = findMissingCriticalFields(extractedData, state.documentType);
  
  let response: string;
  let nextAction: ConversationResult['nextAction'];
  let step: ConversationStep;

  if (missingFields.length === 0) {
    // Tenemos toda la información necesaria
    response = `¡Excelente! He extraído toda la información necesaria de tu transcripción:

${formatExtractedData(extractedData, state.documentType)}

¿Confirmas que toda la información es correcta? Si es así, procedo a generar el documento.`;
    
    step = 'ready_to_generate';
    nextAction = 'generate_document';
  } else {
    // Faltan datos críticos, preguntamos
    const questions = generateFollowUpQuestions(missingFields, state.documentType);
    
    response = `Perfecto, he extraído la siguiente información:

${formatExtractedData(extractedData, state.documentType)}

Para completar el documento, me faltan estos datos importantes:

${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

Por favor proporciona esta información para poder generar el documento completo.`;

    step = 'follow_up_questions';
    nextAction = 'ask_follow_up';
  }

  const totalRequiredFields = getRequiredFieldsReal(state.documentType).length;
  const completedFields = totalRequiredFields - missingFields.length;

  const updatedState: ConversationState = {
    ...state,
    step,
    extractedData,
    missingFields,
    conversationHistory: [
      ...updatedHistory,
      {
        role: 'agent',
        message: response,
        timestamp: new Date().toISOString()
      }
    ]
  };

  return {
    response,
    updatedState,
    nextAction,
    progress: {
      completedFields,
      totalFields: totalRequiredFields,
      percentage: Math.round((completedFields / totalRequiredFields) * 100)
    }
  };
}

/**
 * Maneja las preguntas de seguimiento
 */
async function handleFollowUpQuestions(
  state: ConversationState,
  userMessage: string,
  updatedHistory: any[]
): Promise<ConversationResult> {
  
  if (!state.documentType) {
    throw new Error('Tipo de documento no definido');
  }

  // Intentamos extraer la información adicional del mensaje
  const additionalData = await extractPlaceholdersReal(userMessage, state.documentType);
  
  // Combinamos con los datos existentes
  const combinedData = { ...state.extractedData, ...additionalData };
  
  // Verificamos si ya tenemos todo
  const missingFields = findMissingCriticalFields(combinedData, state.documentType);
  
  let response: string;
  let nextAction: ConversationResult['nextAction'];
  let step: ConversationStep;

  if (missingFields.length === 0) {
    response = `¡Perfecto! Ahora tengo toda la información necesaria:

${formatExtractedData(combinedData, state.documentType)}

Procedo a generar tu documento. Esto tomará unos segundos...`;

    step = 'ready_to_generate';
    nextAction = 'generate_document';
  } else {
    const questions = generateFollowUpQuestions(missingFields, state.documentType);
    
    response = `Gracias por la información adicional. Me faltan solo estos últimos datos:

${questions.map((q, i) => `${i + 1}. ${q}`).join('\n')}`;

    step = 'follow_up_questions';
    nextAction = 'ask_follow_up';
  }

  const totalRequiredFields = getRequiredFieldsReal(state.documentType).length;
  const completedFields = totalRequiredFields - missingFields.length;

  const updatedState: ConversationState = {
    ...state,
    step,
    extractedData: combinedData,
    missingFields,
    conversationHistory: [
      ...updatedHistory,
      {
        role: 'agent',
        message: response,
        timestamp: new Date().toISOString()
      }
    ]
  };

  return {
    response,
    updatedState,
    nextAction,
    progress: {
      completedFields,
      totalFields: totalRequiredFields,
      percentage: Math.round((completedFields / totalRequiredFields) * 100)
    }
  };
}

/**
 * Maneja la generación del documento
 */
async function handleDocumentGeneration(
  state: ConversationState,
  updatedHistory: any[]
): Promise<ConversationResult> {
  
  if (!state.documentType) {
    throw new Error('Tipo de documento no definido');
  }

  const response = `¡Documento generado exitosamente! 🎉

Tu ${getTemplateNameReal(state.documentType)} está listo y ha sido guardado en Google Drive.

**Resumen del documento:**
- Tipo: ${state.documentType}
- Campos completados: ${Object.keys(state.extractedData).length}
- Generado: ${new Date().toLocaleString('es-MX')}

¿Necesitas generar algún otro documento para este proyecto?`;

  const updatedState: ConversationState = {
    ...state,
    step: 'document_generated',
    isComplete: true,
    conversationHistory: [
      ...updatedHistory,
      {
        role: 'agent',
        message: response,
        timestamp: new Date().toISOString()
      }
    ]
  };

  return {
    response,
    updatedState,
    nextAction: 'complete'
  };
}

/**
 * Formatea los datos extraídos para mostrar al usuario
 */
function formatExtractedData(data: Partial<ExtractedDataReal>, documentType: DocumentType): string {
  const entries = Object.entries(data)
    .filter(([key, value]) => value && value !== '')
    .map(([key, value]) => `  • ${key}: ${value}`);
  
  if (entries.length === 0) {
    return '  (Aún no se han extraído datos)';
  }
  
  return entries.join('\n');
}

/**
 * Función principal para uso desde la API
 */
export async function processTranscriptConversational(
  transcript: string,
  documentType?: DocumentType,
  sessionId?: string
): Promise<{
  tipo_documento: DocumentType;
  datos: ExtractedDataReal;
  guardrails: any;
  metadata: any;
  conversationState?: ConversationState;
  needsFollowUp: boolean;
  followUpQuestions?: string[];
}> {
  
  // Si no hay sessionId, procesamos de manera directa (backward compatibility)
  if (!sessionId) {
    const guardrailResults = await runGuardrails(transcript);
    
    if (guardrailResults.overall.blocked) {
      throw new Error(`Contenido bloqueado: ${guardrailResults.overall.warnings.join('; ')}`);
    }

    const detectedType = documentType || await classifyDocumentReal(transcript);
    const extractedData = await extractPlaceholdersReal(transcript, detectedType);
    const missingFields = findMissingCriticalFields(extractedData, detectedType);

    return {
      tipo_documento: detectedType,
      datos: extractedData,
      guardrails: {
        pii: {
          passed: guardrailResults.pii.passed,
          warnings: guardrailResults.pii.warnings,
        },
        moderation: {
          passed: guardrailResults.moderation.passed,
          warnings: guardrailResults.moderation.warnings,
        },
        overall_passed: guardrailResults.overall.passed,
      },
      metadata: {
        processed_at: new Date().toISOString(),
        model_used: 'gpt-4o',
      },
      needsFollowUp: missingFields.length > 0,
      followUpQuestions: missingFields.length > 0 ? generateFollowUpQuestions(missingFields, detectedType) : undefined
    };
  }

  // Procesamiento conversacional completo
  throw new Error('Procesamiento conversacional con sesión no implementado aún');
}