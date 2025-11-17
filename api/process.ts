import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processTranscriptConversational } from '../src/agent-real';
import { DocumentType } from '../src/schemas-real';
import { createDocumentFromTemplate } from '../src/google-drive';

// Validar variables de entorno requeridas
const requiredEnvVars = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  GOOGLE_SERVICE_ACCOUNT_KEY: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
  DRIVE_FOLDER_ID: process.env.DRIVE_FOLDER_ID
};

// Verificar que todas las variables estén definidas
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing environment variables:', missingVars.join(', '));
}

const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID as string;

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

    // Preparamos los datos para Google Drive API directo
    const templateName = getTemplateName(result.tipo_documento);
    const replacements = flattenDataForGoogleDrive(result.datos);

    // Llamada a Google Drive API directo
    console.log('🚀 Creando documento con Google Drive API directo...');
    console.log('📄 Plantilla:', templateName);
    console.log('📋 Reemplazos:', Object.keys(replacements).length, 'campos');

    const googleDriveResult = await createDocumentFromTemplate(
      templateName,
      replacements,
      "", // Sin folder_id para crear en raíz del service account
      `${result.tipo_documento}_${new Date().toISOString().split('T')[0]}_${Date.now()}`
    );

    if (!googleDriveResult.success) {
      return res.status(500).json({
        error: `Error al crear documento en Google Drive: ${googleDriveResult.error}`,
        details: {
          template: templateName,
          folder_id: DRIVE_FOLDER_ID,
          replacements_count: Object.keys(replacements).length
        }
      });
    }

    return res.status(200).json({
      success: true,
      tipo_documento: result.tipo_documento,
      documento_creado: googleDriveResult.documentUrl || `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`,
      documento_id: googleDriveResult.documentId,
      datos_extraidos: result.datos,
      guardrails: {
        pii_warnings: result.guardrails.pii.warnings,
        moderation_passed: result.guardrails.moderation.passed
      },
      metadata: result.metadata,
      google_drive: {
        template_used: templateName,
        folder_id: DRIVE_FOLDER_ID,
        document_created: new Date().toISOString()
      },
      resumen: `¡Documento ${result.tipo_documento} creado exitosamente con Google Drive API directo!`
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
