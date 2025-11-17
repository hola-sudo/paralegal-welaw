/**
 * Agente Paralegal - Punto de entrada principal
 * 
 * Este archivo exporta las funciones principales del agente para uso directo
 * o para importar en otros módulos.
 * 
 * Para usar como API en Vercel, ve a /api/process.ts
 * Para usar directamente en código, importa las funciones desde aquí.
 */

// Exportamos las funciones principales del agente
export { processTranscript, processTranscriptSimple } from './src/agent';
export type { ProcessingResult } from './src/agent';

// Exportamos los tipos y schemas
export { DocumentTypeSchema, DocumentSchemas } from './src/schemas';
export type { DocumentType, ExtractedData } from './src/schemas';

// Exportamos las funciones de guardrails (por si las necesitas usar directamente)
export { checkPII, checkModeration, runGuardrails } from './src/guardrails';
export type { GuardrailResult } from './src/guardrails';

// Exportamos las funciones de clasificación (por si las necesitas usar directamente)
export { classifyDocument, extractPlaceholders } from './src/classification';

/**
 * Ejemplo de uso directo (no necesario si usas la API):
 * 
 * import { processTranscript } from './paralegal-agent';
 * 
 * const transcript = "Texto de la transcripción aquí...";
 * const result = await processTranscript(transcript);
 * console.log(result);
 */
