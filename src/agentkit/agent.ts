/**
 * AGENTE PARALEGAL 3D PIXEL PERFECTION - MIGRADO A AGENTKIT
 * 
 * Migración completa del agente conversacional manteniendo toda la lógica especializada:
 * - Clasificación inteligente de documentos (5 tipos)
 * - Extracción de 125 campos específicos del negocio
 * - Generación de PDFs profesionales con pdfmake
 * - Flujo conversacional natural para recopilar información faltante
 */

import { z } from 'zod';
import { openai } from '@ai-sdk/openai';
import { AgentKit } from 'agentkit';
import { DocumentType, DocumentSchemasReal, ExtractedDataReal } from '../schemas-real';
import { generatePDF } from '../pdf-generator';
import { runGuardrails } from '../guardrails';
import { classifyDocumentReal, extractPlaceholdersReal, findMissingCriticalFields, generateFollowUpQuestions } from '../classification-real';

// Configuración del agente
const agent = new AgentKit({
  name: '3D Pixel Perfection Paralegal Agent',
  description: 'Agente especializado en generar documentos legales para el negocio de renders 3D de eventos',
  model: openai('gpt-4o'),
  maxSteps: 10,
});

// Estado del agente para cada conversación
interface AgentState {
  sessionId: string;
  documentType?: DocumentType;
  extractedData: Partial<ExtractedDataReal>;
  missingFields: string[];
  conversationStep: 'classification' | 'data_gathering' | 'follow_up' | 'ready_to_generate' | 'completed';
  pdfGenerated?: boolean;
  pdfData?: {
    base64: string;
    fileName: string;
    size: number;
  };
}

// Herramienta para clasificar tipo de documento
const classifyDocumentTool = {
  name: 'classify_document',
  description: 'Clasifica qué tipo de documento necesita el cliente según su transcripción',
  parameters: z.object({
    transcription: z.string().describe('Transcripción de la conversación con el cliente'),
  }),
  execute: async ({ transcription }: { transcription: string }) => {
    try {
      const documentType = await classifyDocumentReal(transcription);
      return {
        success: true,
        documentType,
        message: `He identificado que necesitas generar un ${documentType.replace('_', ' ').toUpperCase()}`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al clasificar documento',
        fallback: 'contrato_base'
      };
    }
  },
};

// Herramienta para extraer datos de transcripciones
const extractDataTool = {
  name: 'extract_data',
  description: 'Extrae datos específicos del negocio de eventos y renders 3D de una transcripción',
  parameters: z.object({
    transcription: z.string().describe('Transcripción a procesar'),
    documentType: z.enum(['contrato_base', 'anexo_a', 'anexo_b', 'anexo_c', 'anexo_d']).describe('Tipo de documento'),
  }),
  execute: async ({ transcription, documentType }: { transcription: string; documentType: DocumentType }) => {
    try {
      const extractedData = await extractPlaceholdersReal(transcription, documentType);
      const missingFields = findMissingCriticalFields(extractedData, documentType);
      
      return {
        success: true,
        extractedData,
        missingFields,
        completionRate: Math.round(((Object.keys(extractedData).length - missingFields.length) / Object.keys(extractedData).length) * 100),
        message: missingFields.length > 0 
          ? `He extraído ${Object.keys(extractedData).length - missingFields.length} datos. Faltan ${missingFields.length} campos críticos.`
          : 'Todos los datos necesarios han sido extraídos correctamente.'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al extraer datos'
      };
    }
  },
};

// Herramienta para verificar guardrails de seguridad
const checkSecurityTool = {
  name: 'check_security',
  description: 'Verifica que el contenido sea seguro y apropiado usando guardrails',
  parameters: z.object({
    content: z.string().describe('Contenido a verificar'),
  }),
  execute: async ({ content }: { content: string }) => {
    try {
      const result = await runGuardrails(content);
      return {
        success: result.overall.passed,
        blocked: result.overall.blocked,
        warnings: result.overall.warnings,
        piiDetected: result.pii.warnings.length > 0,
        moderationPassed: result.moderation.passed,
        message: result.overall.blocked 
          ? `⚠️ Contenido bloqueado: ${result.overall.warnings.join(', ')}`
          : result.overall.warnings.length > 0
          ? `✅ Contenido aprobado con advertencias: ${result.overall.warnings.join(', ')}`
          : '✅ Contenido aprobado sin problemas de seguridad'
      };
    } catch (error) {
      return {
        success: true, // No bloqueamos en caso de error de guardrails
        error: error instanceof Error ? error.message : 'Error al verificar seguridad',
        warnings: ['No se pudieron verificar los guardrails de seguridad']
      };
    }
  },
};

// Herramienta para generar PDF final
const generatePDFTool = {
  name: 'generate_pdf',
  description: 'Genera el PDF profesional con los datos extraídos',
  parameters: z.object({
    documentType: z.enum(['contrato_base', 'anexo_a', 'anexo_b', 'anexo_c', 'anexo_d']).describe('Tipo de documento'),
    extractedData: z.record(z.any()).describe('Datos extraídos del cliente'),
  }),
  execute: async ({ documentType, extractedData }: { documentType: DocumentType; extractedData: Record<string, any> }) => {
    try {
      const result = await generatePDF({
        templateType: documentType,
        extractedData,
        documentName: `${documentType}_${Date.now()}`,
        includeMetadata: true
      });

      if (!result.success) {
        return {
          success: false,
          error: result.error || 'Error al generar PDF'
        };
      }

      const pdfBase64 = result.pdfBuffer?.toString('base64') || '';
      
      return {
        success: true,
        pdfData: {
          base64: pdfBase64,
          fileName: result.fileName || `${documentType}.pdf`,
          size: result.pdfBuffer?.length || 0
        },
        message: `✅ PDF generado exitosamente: ${Math.round((result.pdfBuffer?.length || 0) / 1024)}KB`
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al generar PDF'
      };
    }
  },
};

// Registrar herramientas en el agente
agent.use(classifyDocumentTool);
agent.use(extractDataTool);
agent.use(checkSecurityTool);
agent.use(generatePDFTool);

// Prompt del sistema especializado
const SYSTEM_PROMPT = `Eres el asistente paralegal especializado de 3D Pixel Perfection, empresa líder en renders 3D para eventos.

TU MISIÓN:
Ayudar a crear documentos legales profesionales para eventos como bodas, XV años, y eventos corporativos.

TIPOS DE DOCUMENTOS QUE MANEJAS:
1. 📄 CONTRATO_BASE - Contrato inicial del evento (información básica)
2. 🏗️ ANEXO_A - Especificaciones de montaje y decoración (58 campos técnicos)
3. 🎨 ANEXO_B - Renders y temas visuales (12 campos creativos)
4. 🔄 ANEXO_C - Control de cambios y revisiones (24 campos de seguimiento)
5. 📋 ANEXO_D - Entrega final y autorización de pago (23 campos de cierre)

TU FLUJO DE TRABAJO:
1. 🔍 ANALIZAR: Clasificar qué documento necesita el cliente
2. 🛡️ VERIFICAR: Aplicar guardrails de seguridad al contenido
3. 📊 EXTRAER: Obtener datos específicos del negocio de renders 3D
4. ❓ PREGUNTAR: Si faltan datos críticos, hacer preguntas específicas y naturales
5. 📄 GENERAR: Crear el PDF profesional cuando tengas información suficiente

CONTEXTO DEL NEGOCIO:
- Renders fotorrealistas para eventos especiales
- Clientes hablan de: salones, decoración, ambientación, montaje, temas visuales
- Información crítica: nombre del cliente, tipo de evento, fecha, ubicación, especificaciones técnicas

ESTILO DE COMUNICACIÓN:
- Profesional pero amigable
- Especializado en eventos y renders 3D
- Preguntas específicas y claras cuando falten datos
- Siempre enfocado en completar el documento correctamente`;

export { agent, AgentState, SYSTEM_PROMPT };
export type { AgentState as ParalegalAgentState };