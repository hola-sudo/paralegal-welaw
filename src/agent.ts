/**
 * Agente principal para procesar transcripciones de documentos legales
 * 
 * Este agente coordina todo el flujo de trabajo:
 * 1. Verifica guardrails (PII y moderación)
 * 2. Clasifica el tipo de documento
 * 3. Extrae los placeholders específicos
 * 4. Retorna un JSON estructurado con los datos
 */

import { classifyDocument, extractPlaceholders } from './classification';
import { runGuardrails } from './guardrails';
import { DocumentType, ExtractedData } from './schemas';

/**
 * Resultado del procesamiento de una transcripción
 */
export interface ProcessingResult {
  // Tipo de documento identificado
  tipo_documento: DocumentType;
  
  // Datos extraídos según el schema correspondiente
  datos: ExtractedData;
  
  // Información sobre los guardrails ejecutados
  guardrails: {
    pii: {
      passed: boolean;
      warnings: string[];
    };
    moderation: {
      passed: boolean;
      warnings: string[];
    };
    overall_passed: boolean;
  };
  
  // Metadatos del procesamiento
  metadata: {
    processed_at: string;
    model_used: string;
  };
}

/**
 * Procesa una transcripción de texto completo
 * 
 * Esta es la función principal que ejecuta todo el flujo:
 * 1. Verifica guardrails de seguridad
 * 2. Clasifica el documento
 * 3. Extrae los datos estructurados
 * 4. Retorna el resultado completo
 * 
 * @param transcript - El texto de la transcripción a procesar
 * @returns Resultado completo del procesamiento con datos estructurados
 * @throws Error si los guardrails bloquean el contenido o hay errores en el procesamiento
 */
export async function processTranscript(transcript: string): Promise<ProcessingResult> {
  // Validamos que tengamos una transcripción
  if (!transcript || transcript.trim().length === 0) {
    throw new Error('La transcripción no puede estar vacía');
  }

  // PASO 1: Ejecutamos los guardrails de seguridad
  // Esto verifica PII y moderación antes de procesar el contenido
  const guardrailResults = await runGuardrails(transcript);
  
  // Si los guardrails bloquean el contenido, lanzamos un error
  if (guardrailResults.overall.blocked) {
    throw new Error(
      `El contenido fue bloqueado por los guardrails de seguridad. ` +
      `Razón: ${guardrailResults.overall.warnings.join('; ')}`
    );
  }

  // PASO 2: Clasificamos el tipo de documento
  // Usa GPT-4o para determinar si es contrato_base, anexo_a, anexo_b, anexo_c o anexo_d
  const documentType = await classifyDocument(transcript);
  
  // PASO 3: Extraemos los placeholders específicos según el tipo
  // Usa GPT-4o con structured outputs para extraer datos validados con Zod
  const extractedData = await extractPlaceholders(transcript, documentType);

  // PASO 4: Construimos el resultado final
  const result: ProcessingResult = {
    tipo_documento: documentType,
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
  };

  return result;
}

/**
 * Versión simplificada que solo retorna los datos esenciales
 * 
 * Útil cuando solo necesitas el tipo y los datos, sin información de guardrails
 */
export async function processTranscriptSimple(transcript: string): Promise<{
  tipo_documento: DocumentType;
  datos: ExtractedData;
}> {
  const result = await processTranscript(transcript);
  return {
    tipo_documento: result.tipo_documento,
    datos: result.datos,
  };
}

