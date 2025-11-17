import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Configurar CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed. Use GET.' });
  }

  // Verificar variables de entorno críticas
  const envVars = {
    OPENAI_API_KEY: !!process.env.OPENAI_API_KEY,
    MCP_ENDPOINT: !!process.env.MCP_ENDPOINT,
    MCP_API_KEY: !!process.env.MCP_API_KEY,
    DRIVE_FOLDER_ID: !!process.env.DRIVE_FOLDER_ID
  };

  const allConfigured = Object.values(envVars).every(Boolean);

  return res.status(200).json({
    status: 'ok',
    service: 'Agente Paralegal API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    uptime: process.uptime(),
    configuration: {
      all_env_vars_configured: allConfigured,
      details: envVars,
      mcp_endpoint_configured: !!process.env.MCP_ENDPOINT,
      drive_integration_ready: !!(process.env.MCP_API_KEY && process.env.DRIVE_FOLDER_ID)
    },
    endpoints: {
      health: {
        method: 'GET',
        path: '/api/health',
        description: 'Health check and configuration status'
      },
      process: {
        method: 'POST',
        path: '/api/process',
        description: 'Process legal document transcription',
        required_fields: ['transcripcion'],
        response_time_avg: '5-15 seconds',
        max_duration: '30 seconds'
      }
    },
    limits: {
      max_request_size: '1MB',
      max_response_time: '30 seconds',
      rate_limiting: 'None (configure in production)'
    },
    integrations: {
      openai: {
        configured: !!process.env.OPENAI_API_KEY,
        models_used: ['gpt-4o']
      },
      mcp_google_drive: {
        configured: allConfigured,
        endpoint: process.env.MCP_ENDPOINT ? 'Configured' : 'Missing'
      }
    }
  });
}