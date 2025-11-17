import type { VercelRequest, VercelResponse } from '@vercel/node';
import { testGoogleDriveConnection } from '../src/google-drive';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  try {
    // Verificar variables de entorno
    const envCheck = {
      GOOGLE_SERVICE_ACCOUNT_KEY_EXISTS: !!process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      GOOGLE_SERVICE_ACCOUNT_KEY_LENGTH: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.length || 0,
      DRIVE_FOLDER_ID: process.env.DRIVE_FOLDER_ID,
      OPENAI_API_KEY_EXISTS: !!process.env.OPENAI_API_KEY
    };

    // Intentar parsear el service account
    let serviceAccountInfo = null;
    let parseError = null;
    try {
      if (process.env.GOOGLE_SERVICE_ACCOUNT_KEY) {
        const parsed = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY);
        serviceAccountInfo = {
          type: parsed.type,
          project_id: parsed.project_id,
          client_email: parsed.client_email,
          client_id: parsed.client_id
        };
      }
    } catch (error: any) {
      parseError = error.message;
    }

    // Probar conexión a Google Drive
    const driveTest = await testGoogleDriveConnection();

    return res.status(200).json({
      success: true,
      environment_check: envCheck,
      service_account_info: serviceAccountInfo,
      parse_error: parseError,
      google_drive_test: driveTest,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error testing Google Drive:', error);
    return res.status(500).json({ 
      error: error.message,
      details: error.stack,
      timestamp: new Date().toISOString()
    });
  }
}