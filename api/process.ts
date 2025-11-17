import type { VercelRequest, VercelResponse } from '@vercel/node';
import { processTranscriptConversational } from '../src/agent-real';
import { DocumentType } from '../src/schemas-real';

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

    // Preparamos los datos para MCP según el tipo de documento
    const templateName = getTemplateName(result.tipo_documento);
    const replacements = flattenDataForMCP(result.datos);

    // Llamada a MCP para crear documento en Drive
    const mcpResponse = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream", 
        "Authorization": `Bearer ${MCP_API_KEY}` 
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: "tools/call",
        params: {
          name: "google_docs_create_document_from_template",
          arguments: {
            instructions: `Create a new document from template "${templateName}" with the following field replacements: ${JSON.stringify(replacements)}. Save the document to folder ID ${DRIVE_FOLDER_ID}.`,
            title: `${result.tipo_documento}_${new Date().getFullYear()}_${Date.now()}`,
            empty_fields_preference: "leave_blank"
          }
        },
        id: 1
      })
    });

    // Manejar Server-Sent Events (SSE) de MCP
    let mcpResult: any = {};
    
    if (mcpResponse.headers.get('content-type')?.includes('text/event-stream')) {
      // Procesar event stream
      const responseText = await mcpResponse.text();
      console.log('MCP SSE Response:', responseText);
      
      // Parsear eventos SSE
      const events = responseText.split('\n\n').filter(Boolean);
      for (const event of events) {
        const lines = event.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6)); // Remover "data: "
              console.log('Parsed SSE data:', eventData);
              
              if (eventData.result) {
                mcpResult = eventData.result;
              } else if (eventData.error) {
                mcpResult = { error: eventData.error };
              } else {
                mcpResult = eventData;
              }
            } catch (parseError) {
              console.log('Could not parse SSE line:', line);
            }
          }
        }
      }
    } else {
      // Respuesta JSON normal
      mcpResult = await mcpResponse.json();
    }

    // Logging detallado para debugging
    console.log('MCP Response Status:', mcpResponse.status);
    console.log('MCP Response Headers:', Object.fromEntries(mcpResponse.headers.entries()));
    console.log('MCP Final Result:', JSON.stringify(mcpResult, null, 2));

    if (!mcpResponse.ok) {
      return res.status(500).json({
        error: `Error al crear documento en Google Drive: HTTP ${mcpResponse.status}`,
        details: mcpResult,
        mcp_response: await mcpResponse.text().catch(() => 'Could not read response text')
      });
    }

    if (mcpResult.error) {
      return res.status(500).json({
        error: `Error al crear documento en Google Drive: ${JSON.stringify(mcpResult.error)}`,
        full_response: mcpResult
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
