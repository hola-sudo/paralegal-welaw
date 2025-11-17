import type { VercelRequest, VercelResponse } from '@vercel/node';

const MCP_ENDPOINT = process.env.MCP_ENDPOINT as string;
const MCP_API_KEY = process.env.MCP_API_KEY as string;

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed. Use POST.' });
  }

  try {
    const { method = "tools/list", params = {} } = req.body as any;

    console.log('Testing MCP with method:', method);

    const mcpResponse = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream", 
        "Authorization": `Bearer ${MCP_API_KEY}` 
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        method: method,
        params: params,
        id: 1
      })
    });

    // Manejar SSE o JSON
    let mcpResult: any = {};
    
    if (mcpResponse.headers.get('content-type')?.includes('text/event-stream')) {
      const responseText = await mcpResponse.text();
      console.log('MCP SSE Response:', responseText);
      
      const events = responseText.split('\n\n').filter(Boolean);
      for (const event of events) {
        const lines = event.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const eventData = JSON.parse(line.slice(6));
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
      mcpResult = await mcpResponse.json();
    }

    console.log('MCP Test Result:', JSON.stringify(mcpResult, null, 2));

    return res.status(200).json({
      success: true,
      method_tested: method,
      mcp_response_status: mcpResponse.status,
      result: mcpResult
    });

  } catch (error: any) {
    console.error('Error testing MCP:', error);
    return res.status(500).json({ 
      error: error.message,
      details: error.stack
    });
  }
}