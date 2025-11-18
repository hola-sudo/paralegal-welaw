/**
 * Agente Paralegal V2.0 - 3D PIXEL PERFECTION
 * 
 * Punto de entrada principal para el agente especializado en decoración de eventos.
 * Sistema completamente actualizado con pdfmake nativo y templates exactos.
 * 
 * Para usar como API en Vercel: /api/process.ts
 * Para uso directo en código: importa las funciones desde aquí.
 */

// Exportamos las funciones principales del agente (V2.0)
export { processTranscriptConversational } from './src/agent-real';
export type { ConversationState, ConversationResult } from './src/agent-real';

// Exportamos los tipos y schemas actualizados
export { DocumentTypeSchema, DocumentSchemasReal } from './src/schemas-real';
export type { DocumentType, ExtractedDataReal } from './src/schemas-real';

// Exportamos las funciones de guardrails (sin cambios)
export { checkPII, checkModeration, runGuardrails } from './src/guardrails';
export type { GuardrailResult } from './src/guardrails';

// Exportamos las funciones de clasificación actualizadas
export { classifyDocumentReal, extractPlaceholdersReal } from './src/classification-real';

// Exportamos el generador de PDFs
export { generatePDF } from './src/pdf-generator';
export type { PDFGeneratorOptions, PDFGenerationResult } from './src/pdf-generator';

/**
 * Ejemplo de uso V2.0:
 * 
 * import { processTranscriptConversational, generatePDF } from './paralegal-agent';
 * 
 * // Procesar transcripción de evento
 * const transcript = "Hola, soy María González, quiero decoración para mi boda...";
 * const result = await processTranscriptConversational(transcript);
 * 
 * if (!result.needsFollowUp) {
 *   // Generar PDF directamente
 *   const pdfResult = await generatePDF({
 *     templateType: result.tipo_documento,
 *     extractedData: result.datos,
 *     documentName: `${result.tipo_documento}_${Date.now()}`,
 *     includeMetadata: true
 *   });
 *   
 *   console.log('PDF generado:', pdfResult.fileName);
 * } else {
 *   console.log('Preguntas de seguimiento:', result.followUpQuestions);
 * }
 */
