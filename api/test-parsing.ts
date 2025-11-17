import type { VercelRequest, VercelResponse } from '@vercel/node';
import { google } from 'googleapis';

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
    const serviceAccountKey = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccountKey) {
      return res.status(500).json({ error: 'GOOGLE_SERVICE_ACCOUNT_KEY no configurada' });
    }

    // Análisis detallado del string
    const analysis = {
      length: serviceAccountKey.length,
      firstChar: serviceAccountKey.charCodeAt(0),
      char19: serviceAccountKey.charCodeAt(18),
      char20: serviceAccountKey.charCodeAt(19),
      first30: serviceAccountKey.substring(0, 30),
      around19: serviceAccountKey.substring(15, 25),
      hasNewlines: serviceAccountKey.includes('\n'),
      hasReturns: serviceAccountKey.includes('\r'),
      startsWithBrace: serviceAccountKey.trim().startsWith('{'),
      endsWithBrace: serviceAccountKey.trim().endsWith('}')
    };

    // Intentar diferentes métodos de limpieza
    let cleanedKey = serviceAccountKey;
    
    // Método 1: Trim básico
    cleanedKey = serviceAccountKey.trim();
    
    // Método 2: Remover todos los saltos de línea
    cleanedKey = cleanedKey.replace(/\r?\n|\r/g, '');
    
    // Método 3: Remover espacios extra
    cleanedKey = cleanedKey.replace(/\s+/g, ' ');

    let parseAttempts = [];
    let serviceAccount = null;

    // Intento 1: JSON original
    try {
      serviceAccount = JSON.parse(serviceAccountKey);
      parseAttempts.push({ method: 'original', success: true });
    } catch (e: any) {
      parseAttempts.push({ method: 'original', success: false, error: e.message });
    }

    // Intento 2: JSON limpio
    if (!serviceAccount) {
      try {
        serviceAccount = JSON.parse(cleanedKey);
        parseAttempts.push({ method: 'cleaned', success: true });
      } catch (e: any) {
        parseAttempts.push({ method: 'cleaned', success: false, error: e.message });
      }
    }

    // Intento 3: Manualmente corregir problema en posición 19
    if (!serviceAccount && analysis.char19 === 10) { // 10 = \n
      try {
        const manuallyFixed = serviceAccountKey.replace(/\n/g, '');
        serviceAccount = JSON.parse(manuallyFixed);
        parseAttempts.push({ method: 'manually_fixed', success: true });
      } catch (e: any) {
        parseAttempts.push({ method: 'manually_fixed', success: false, error: e.message });
      }
    }

    // Si logramos parsear, probar Google Drive
    let driveTest = null;
    if (serviceAccount) {
      try {
        const auth = new google.auth.GoogleAuth({
          credentials: serviceAccount,
          scopes: ['https://www.googleapis.com/auth/drive'],
        });

        const drive = google.drive({ version: 'v3', auth });
        const driveResponse = await drive.files.list({
          q: `parents in '${process.env.DRIVE_FOLDER_ID}'`,
          fields: 'files(id, name)',
          pageSize: 5,
        });

        driveTest = {
          success: true,
          files_found: driveResponse.data.files?.length || 0,
          files: driveResponse.data.files?.map(f => ({ id: f.id, name: f.name }))
        };
      } catch (e: any) {
        driveTest = {
          success: false,
          error: e.message
        };
      }
    }

    return res.status(200).json({
      success: !!serviceAccount,
      analysis,
      parseAttempts,
      serviceAccountParsed: !!serviceAccount,
      serviceAccountInfo: serviceAccount ? {
        type: serviceAccount.type,
        project_id: serviceAccount.project_id,
        client_email: serviceAccount.client_email
      } : null,
      driveTest,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    return res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
}