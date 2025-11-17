/**
 * Integración directa con Google Drive API para 3D Pixel Perfection
 * Reemplaza MCP con API nativa de Google
 */

import { google, drive_v3 } from 'googleapis';
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
 * Función principal: Crear documento desde plantilla con reemplazos
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
    console.log('🔍 Buscando plantilla:', templateName);

    // 1. Buscar plantilla por nombre
    const templateId = await findTemplateByName(templateName, folderId);
    if (!templateId) {
      return {
        success: false,
        error: `Plantilla "${templateName}" no encontrada en la carpeta especificada`,
      };
    }

    console.log('✅ Plantilla encontrada, ID:', templateId);

    // 2. Crear nombre del nuevo documento
    const docName = newDocumentName || `${templateName.replace(' - Plantilla', '')} - ${new Date().toISOString().split('T')[0]} - ${Date.now()}`;

    // 3. Crear copia de la plantilla
    const newDocumentId = await copyTemplate(templateId, docName, folderId);
    console.log('✅ Copia creada, ID:', newDocumentId);

    // 4. Descargar contenido
    const documentContent = await downloadDocument(newDocumentId);
    console.log('✅ Contenido descargado');

    // 5. Reemplazar placeholders
    const modifiedContent = replaceTextInDocument(documentContent, replacements);
    console.log('✅ Placeholders reemplazados:', Object.keys(replacements).length);

    // 6. Subir documento modificado
    await uploadModifiedDocument(newDocumentId, modifiedContent);
    console.log('✅ Documento modificado subido');

    // 7. Generar URL del documento
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