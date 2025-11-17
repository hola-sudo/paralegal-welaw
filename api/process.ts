import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processTranscript } from '../src/agent';
import { DocumentType } from '../src/schemas';

// Validar variables de entorno requeridas
const requiredEnvVars = {
  OPENAI_API_KEY: process.env.OPENAI_API_KEY,
  MCP_ENDPOINT: process.env.MCP_ENDPOINT,
  MCP_API_KEY: process.env.MCP_API_KEY,
  DRIVE_FOLDER_ID: process.env.DRIVE_FOLDER_ID
};

// Verificar que todas las variables estén definidas
const missingVars = Object.entries(requiredEnvVars)
  .filter(([key, value]) => !value)
  .map(([key]) => key);

if (missingVars.length > 0) {
  console.error('Missing environment variables:', missingVars.join(', '));
}

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

    // Usamos la implementación robusta con schemas y guardrails
    const result = await processTranscript(transcripcion);
    
    // Si los guardrails bloquearon el contenido, retornamos error
    if (!result.guardrails.overall_passed) {
      return res.status(400).json({
        error: "Contenido bloqueado por medidas de seguridad",
        warnings: result.guardrails.pii.warnings.concat(result.guardrails.moderation.warnings),
        blocked: true
      });
    }

    // Preparamos los datos para MCP según el tipo de documento
    const templateName = getTemplateName(result.tipo_documento);
    const replacements = flattenDataForMCP(result.datos);

    // Llamada a MCP para crear documento en Drive
    const mcpResponse = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Authorization": `Bearer ${MCP_API_KEY}` 
      },
      body: JSON.stringify({
        accion: "guardar",
        template_name: templateName,
        folder_id: DRIVE_FOLDER_ID,
        replacements: replacements
      })
    });

    const mcpResult = await mcpResponse.json() as { nuevo_doc_url?: string; error?: string };

    if (mcpResult.error) {
      return res.status(500).json({
        error: `Error al crear documento en Google Drive: ${mcpResult.error}`
      });
    }

    return res.status(200).json({
      success: true,
      tipo_documento: result.tipo_documento,
      documento_creado: mcpResult.nuevo_doc_url || `https://drive.google.com/drive/folders/${DRIVE_FOLDER_ID}`,
      datos_extraidos: result.datos,
      guardrails: {
        pii_warnings: result.guardrails.pii.warnings,
        moderation_passed: result.guardrails.moderation.passed
      },
      metadata: result.metadata,
      resumen: `¡Documento ${result.tipo_documento} procesado y creado exitosamente en Google Drive!`
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
 * Convierte los datos estructurados en un objeto plano para MCP
 */
function flattenDataForMCP(datos: any): Record<string, string> {
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
