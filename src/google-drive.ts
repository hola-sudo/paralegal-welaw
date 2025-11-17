/**
 * Integración directa con Google Drive API para 3D Pixel Perfection
 * Reemplaza MCP con API nativa de Google
 */

import { google, drive_v3, docs_v1 } from 'googleapis';
import { Document, Packer, Paragraph, TextRun } from 'docx';

interface ServiceAccountKey {
  type: string;
  project_id: string;
  private_key_id: string;
  private_key: string;
  client_email: string;
  client_id: string;
  auth_uri: string;
  token_uri: string;
  auth_provider_x509_cert_url: string;
  client_x509_cert_url: string;
}

/**
 * Crear cliente autenticado de Google Drive
 */
function createDriveClient(): drive_v3.Drive {
  // Limpiar el JSON de variables de entorno que pueden tener caracteres extra
  let serviceAccountJSON = process.env.GOOGLE_SERVICE_ACCOUNT_KEY as string;
  
  // Remover saltos de línea y caracteres extra que Vercel puede agregar
  serviceAccountJSON = serviceAccountJSON.trim().replace(/\r?\n|\r/g, '');
  
  const serviceAccount: ServiceAccountKey = JSON.parse(serviceAccountJSON);

  const auth = new google.auth.GoogleAuth({
    credentials: serviceAccount,
    scopes: [
      'https://www.googleapis.com/auth/drive',
      'https://www.googleapis.com/auth/documents',
    ],
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * Buscar plantilla por nombre en la carpeta especificada
 */
async function findTemplateByName(templateName: string, folderId: string): Promise<string | null> {
  const drive = createDriveClient();

  try {
    const response = await drive.files.list({
      q: `name='${templateName}' and parents in '${folderId}' and mimeType='application/vnd.openxmlformats-officedocument.wordprocessingml.document'`,
      fields: 'files(id, name)',
    });

    const files = response.data.files;
    if (files && files.length > 0) {
      return files[0].id!;
    }
    return null;
  } catch (error) {
    console.error('Error buscando plantilla:', error);
    throw new Error(`Error buscando plantilla "${templateName}": ${error}`);
  }
}

/**
 * Crear una copia de la plantilla con nuevo nombre
 */
async function copyTemplate(templateId: string, newName: string, folderId: string): Promise<string> {
  const drive = createDriveClient();

  try {
    const response = await drive.files.copy({
      fileId: templateId,
      requestBody: {
        name: newName,
        parents: [folderId],
      },
    });

    if (!response.data.id) {
      throw new Error('No se pudo crear la copia del documento');
    }

    return response.data.id;
  } catch (error) {
    console.error('Error copiando plantilla:', error);
    throw new Error(`Error copiando plantilla: ${error}`);
  }
}

/**
 * Descargar contenido de un documento de Google Drive
 */
async function downloadDocument(fileId: string): Promise<Buffer> {
  const drive = createDriveClient();

  try {
    const response = await drive.files.export({
      fileId: fileId,
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    }, { responseType: 'arraybuffer' });

    return Buffer.from(response.data as ArrayBuffer);
  } catch (error) {
    console.error('Error descargando documento:', error);
    throw new Error(`Error descargando documento: ${error}`);
  }
}

/**
 * Reemplazar placeholders en contenido de documento Word
 */
function replaceTextInDocument(content: Buffer, replacements: Record<string, string>): Buffer {
  try {
    // Convertir a string para hacer reemplazos
    let docText = content.toString('utf-8');

    // Reemplazar cada placeholder
    for (const [key, value] of Object.entries(replacements)) {
      if (value && value !== '') {
        // Reemplazar {{KEY}} y {KEY}
        const regex1 = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
        const regex2 = new RegExp(`\\{${key}\\}`, 'g');
        docText = docText.replace(regex1, value);
        docText = docText.replace(regex2, value);
      }
    }

    return Buffer.from(docText, 'utf-8');
  } catch (error) {
    console.error('Error reemplazando placeholders:', error);
    // Si falla el reemplazo, retornar contenido original
    return content;
  }
}

/**
 * Subir documento modificado de vuelta a Google Drive
 */
async function uploadModifiedDocument(
  fileId: string, 
  content: Buffer, 
  mimeType: string = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
): Promise<void> {
  const drive = createDriveClient();

  try {
    await drive.files.update({
      fileId: fileId,
      media: {
        mimeType: mimeType,
        body: content,
      },
    });
  } catch (error) {
    console.error('Error subiendo documento modificado:', error);
    throw new Error(`Error subiendo documento: ${error}`);
  }
}

/**
 * Función principal: Crear documento directamente con reemplazos (sin plantillas)
 */
export async function createDocumentFromTemplate(
  templateName: string,
  replacements: Record<string, string>,
  folderId: string,
  newDocumentName?: string
): Promise<{
  success: boolean;
  documentId?: string;
  documentUrl?: string;
  error?: string;
}> {
  try {
    console.log('🚀 Creando documento directo (sin plantilla):', templateName);
    console.log('📋 Reemplazos:', Object.keys(replacements).length, 'campos');

    // 1. Crear nombre del nuevo documento
    const docName = newDocumentName || `${templateName.replace(' - Plantilla', '')} - ${new Date().toISOString().split('T')[0]} - ${Date.now()}`;

    // 2. Crear documento vacío directamente
    const drive = createDriveClient();
    
    const documentMetadata = {
      name: docName,
      mimeType: 'application/vnd.google-apps.document',
      // Crear en la raíz del service account (sin parents para evitar problemas de permisos)
    };

    const createResponse = await drive.files.create({
      requestBody: documentMetadata,
      fields: 'id',
    });

    const newDocumentId = createResponse.data.id!;
    console.log('✅ Documento creado, ID:', newDocumentId);

    // 3. Crear contenido del documento con reemplazos
    const documentContent = createDocumentContent(templateName, replacements);
    
    // 4. Usar Google Docs API para agregar contenido
    const docs = google.docs({ version: 'v1', auth: drive.context._options.auth });
    
    await docs.documents.batchUpdate({
      documentId: newDocumentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: documentContent,
            },
          },
        ],
      },
    });

    console.log('✅ Contenido agregado al documento');

    // 5. Generar URL del documento
    const documentUrl = `https://docs.google.com/document/d/${newDocumentId}/edit`;

    return {
      success: true,
      documentId: newDocumentId,
      documentUrl: documentUrl,
    };

  } catch (error: any) {
    console.error('❌ Error en createDocumentFromTemplate:', error);
    return {
      success: false,
      error: error.message || 'Error desconocido al crear documento',
    };
  }
}

/**
 * Crear contenido del documento con los datos reemplazados
 */
function createDocumentContent(templateName: string, replacements: Record<string, string>): string {
  const documentTemplates = {
    'Contrato Base 3D Pixel Perfection - Plantilla': `
CONTRATO DE PRESTACIÓN DE SERVICIOS
3D PIXEL PERFECTION

DATOS DEL CLIENTE:
- Nombre: ${replacements.NOMBRE_CLIENTE || '[NOMBRE_CLIENTE]'}
- RFC: ${replacements.RFC_cliente || '[RFC_CLIENTE]'}

DATOS DEL EVENTO:
- Evento: ${replacements.NOMBRE_EVENTO || '[NOMBRE_EVENTO]'}
- Tipo: ${replacements.EVENTO || '[TIPO_EVENTO]'}
- Fecha del evento: ${replacements.FECHA_EVENTO || '[FECHA_EVENTO]'}
- Hora: ${replacements['HH:MM'] || '[HORA]'}
- Ubicación: ${replacements.UBICACION || '[UBICACION]'}

DATOS DEL CONTRATO:
- Fecha de firma: ${replacements['DD/MM/AAAA'] || '[FECHA_CONTRATO]'}

SERVICIOS:
3D Pixel Perfection se compromete a proporcionar servicios de renderizado 3D 
y visualización para el evento especificado, incluyendo diseño, modelado y 
presentación de espacios y decoraciones.

---
Documento generado automáticamente el ${new Date().toLocaleString('es-MX')}
`,
    
    'ANEXO A - Plantilla': `
ANEXO A - ESPECIFICACIONES TÉCNICAS DE MONTAJE
3D PIXEL PERFECTION

EVENTO: ${replacements.NOMBRE_EVENTO || '[NOMBRE_EVENTO]'}
CLIENTE: ${replacements.NOMBRE_CLIENTE || '[NOMBRE_CLIENTE]'}
FECHA: ${replacements.FECHA_EVENTO || '[FECHA_EVENTO]'}

ESPECIFICACIONES DEL SALÓN:
- Largo: ${replacements.MEDIDA_LARGO_SALON || '[LARGO]'} metros
- Ancho: ${replacements.MEDIDA_ANCHO_SALON || '[ANCHO]'} metros  
- Alto: ${replacements.MEDIDA_ALTO_SALON || '[ALTO]'} metros

MOBILIARIO:
- Formato de mesas: ${replacements.FORMATO_MESA || '[FORMATO_MESA]'}
- Cantidad de sillas: ${replacements.CANTIDAD_SILLAS || '[CANTIDAD_SILLAS]'}
- Tipo de sillas: ${replacements.TIPO_SILLA || '[TIPO_SILLA]'}

DECORACIÓN:
- Centro de mesa: ${replacements.DESCRIPCION_CENTRO_MESA || '[CENTRO_MESA]'}
- Flores: ${replacements.FLORES_CENTRO_MESA || '[FLORES]'}
- Elementos decorativos: ${replacements.DESCRIPCION_ELEMENTO_DECORATIVO || '[ELEMENTOS]'}

---
Documento generado automáticamente el ${new Date().toLocaleString('es-MX')}
`,

    'ANEXO B - Plantilla': `
ANEXO B - RENDERS Y TEMAS VISUALES
3D PIXEL PERFECTION

CLIENTE: ${replacements.CLIENTE || '[CLIENTE]'}
EVENTO: ${replacements.NOMBRE_EVENTO || '[NOMBRE_EVENTO]'}
FECHA: ${replacements.FECHA_EVENTO || '[FECHA_EVENTO]'}

TEMAS SOLICITADOS:
- Tema 1: ${replacements.TEMA_1 || '[TEMA_1]'}
- Tema 2: ${replacements.TEMA_2 || '[TEMA_2]'}

ESTADO DE RENDERS:
- Confirmado Tema 1: ${replacements.CONFIRMADO_1 || '[PENDIENTE]'}
- Confirmado Tema 2: ${replacements.CONFIRMADO_2 || '[PENDIENTE]'}
- En render Tema 1: ${replacements.EN_RENDERS_1 || '[PENDIENTE]'}
- En render Tema 2: ${replacements.EN_RENDERS_2 || '[PENDIENTE]'}

REPRESENTANTE: ${replacements.PIXEL_REPRESENTANTE || '[REPRESENTANTE]'}

---
Documento generado automáticamente el ${new Date().toLocaleString('es-MX')}
`
  };

  return documentTemplates[templateName as keyof typeof documentTemplates] || `
DOCUMENTO: ${templateName}

DATOS PROPORCIONADOS:
${Object.entries(replacements)
  .map(([key, value]) => `- ${key}: ${value || '[NO PROPORCIONADO]'}`)
  .join('\n')}

---
Documento generado automáticamente el ${new Date().toLocaleString('es-MX')}
  `;
}

/**
 * Función de prueba para verificar conectividad
 */
export async function testGoogleDriveConnection(): Promise<{
  success: boolean;
  message: string;
  folderContents?: any[];
}> {
  try {
    // Usar la misma función que ya limpia el JSON
    const drive = createDriveClient();
    const folderId = process.env.DRIVE_FOLDER_ID as string;

    const response = await drive.files.list({
      q: `parents in '${folderId}'`,
      fields: 'files(id, name, mimeType)',
      pageSize: 10,
    });

    return {
      success: true,
      message: 'Conexión exitosa con Google Drive',
      folderContents: response.data.files,
    };
  } catch (error: any) {
    return {
      success: false,
      message: `Error de conexión: ${error.message}`,
    };
  }
}