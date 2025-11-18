import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processTranscriptConversational } from '../src/agent-real';
import { DocumentType } from '../src/schemas-real';
import { generatePDF } from '../src/pdf-generator';

// Validar variables de entorno requeridas (solo OpenAI para PDFs nativos)
// VERSIÓN: 2.0 - Con pdfmake profesional (NO Puppeteer)
const requiredEnvVars = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY
};

// Verificar que todas las variables estén definidas
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing environment variables:', missingVars.join(', '));
}

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
    // Verificar variables de entorno al momento del request
    if (missingVars.length > 0) {
      return res.status(500).json({ 
        error: "Configuración del servidor incompleta", 
        missing_vars: missingVars 
      });
    }

    const { transcripcion } = req.body as { transcripcion?: string };
    
    if (!transcripcion) {
      return res.status(400).json({ error: "Falta transcripción en el cuerpo de la petición" });
    }

    // Usamos la implementación conversacional real
    const result = await processTranscriptConversational(transcripcion);
    
    // Si los guardrails bloquearon el contenido, retornamos error
    if (!result.guardrails.overall_passed) {
      return res.status(400).json({
        error: "Contenido bloqueado por medidas de seguridad",
        warnings: result.guardrails.pii.warnings.concat(result.guardrails.moderation.warnings),
        blocked: true
      });
    }

    // Si necesita seguimiento, retornamos las preguntas
    if (result.needsFollowUp && result.followUpQuestions) {
      return res.status(200).json({
        success: false,
        needsFollowUp: true,
        tipo_documento: result.tipo_documento,
        datos_parciales: result.datos,
        preguntas_faltantes: result.followUpQuestions,
        mensaje: `He extraído información parcial. Para completar el ${result.tipo_documento}, necesito que me proporciones:\n\n${result.followUpQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}\n\nPuedes responder con la información faltante o usar /api/chat para una experiencia conversacional completa.`
      });
    }

    // Generar PDF con los datos extraídos
    console.log('🚀 Generando PDF con datos extraídos...');
    console.log('📄 Tipo de documento:', result.tipo_documento);
    console.log('📋 Datos:', Object.keys(result.datos).length, 'campos extraídos');

    const pdfResult = await generatePDF({
      templateType: result.tipo_documento,
      extractedData: result.datos as any, // Conversión temporal para compatibilidad
      documentName: `${result.tipo_documento}_${Date.now()}`,
      includeMetadata: true
    });

    if (!pdfResult.success) {
      return res.status(500).json({
        error: `Error al generar PDF: ${pdfResult.error}`,
        details: {
          tipo_documento: result.tipo_documento,
          datos_extraidos: Object.keys(result.datos).length
        }
      });
    }

    // SOLUCIÓN PROFESIONAL: PDF directo como base64 (arquitectura correcta para Vercel Serverless)
    const pdfBase64 = pdfResult.pdfBuffer?.toString('base64') || '';

    return res.status(200).json({
      success: true,
      tipo_documento: result.tipo_documento,
      file_name: pdfResult.fileName,
      // PDF directo para descarga inmediata
      pdf_direct: {
        base64: pdfBase64,
        size: pdfResult.pdfBuffer?.length || 0,
        ready_for_download: true
      },
      datos_extraidos: result.datos,
      guardrails: {
        pii_warnings: result.guardrails.pii.warnings,
        moderation_passed: result.guardrails.moderation.passed
      },
      metadata: result.metadata,
      pdf_generation: {
        generated_at: new Date().toISOString(),
        file_size: pdfResult.pdfBuffer?.length || 0,
        expires_in_minutes: 5
      },
      resumen: `¡PDF ${result.tipo_documento} generado exitosamente! Descarga disponible por 5 minutos.`
    });

  } catch (error: any) {
    console.error('Error en api/process:', error);
    return res.status(500).json({ 
      error: error.message || 'Error interno del servidor',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Convierte el tipo de documento al nombre de plantilla en Google Drive
 */
function getTemplateName(tipo: DocumentType): string {
  const templateNames = {
    contrato_base: "Contrato Base 3D Pixel Perfection - Plantilla",
    anexo_a: "ANEXO A - Plantilla",
    anexo_b: "ANEXO B - Plantilla", 
    anexo_c: "ANEXO C - Plantilla",
    anexo_d: "ANEXO D - Plantilla"
  };
  
  return templateNames[tipo];
}

/**
 * Convierte los datos estructurados en un objeto plano para Google Drive
 */
function flattenDataForGoogleDrive(datos: any): Record<string, string> {
  const flattened: Record<string, string> = {};
  
  function flatten(obj: any, prefix = ''): void {
    for (const [key, value] of Object.entries(obj)) {
      const newKey = prefix ? `${prefix}_${key}` : key;
      
      if (value === null || value === undefined) {
        flattened[newKey] = '';
      } else if (Array.isArray(value)) {
        // Arrays se convierten a strings separados por comas
        flattened[newKey] = value.join(', ');
      } else if (typeof value === 'object') {
        // Objetos se aplanan recursivamente
        flatten(value, newKey);
      } else {
        flattened[newKey] = String(value);
      }
    }
  }
  
  flatten(datos);
  return flattened;
}
