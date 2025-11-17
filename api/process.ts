import { NextRequest, NextResponse } from 'next/server';

import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY as string });
const MCP_ENDPOINT = process.env.MCP_ENDPOINT as string;
const MCP_API_KEY = process.env.MCP_API_KEY as string;
const DRIVE_FOLDER_ID = process.env.DRIVE_FOLDER_ID as string;

export const POST = async (req: NextRequest) => {
  try {
    const body = await req.json() as { transcripcion?: string };
    const { transcripcion } = body;
    if (!transcripcion) return NextResponse.json({ error: "Falta transcripción" }, { status: 400 });

    // Clasificación
    const tipoRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: "Clasifica solo con una palabra: contrato_base, anexo_a, anexo_b, anexo_c o anexo_d" }, { role: "user", content: transcripcion }],
      temperature: 0
    });
    const tipo = tipoRes.choices[0].message.content?.trim().toLowerCase() || "contrato_base";

    // Extracción simple
    const extractRes = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "system", content: `Extrae JSON plano con todos los placeholders que encuentres. Incluye NOMBRE_CLIENTE, RFC_cliente, FECHA_EVENTO, etc. Si no hay, pon null.` }, { role: "user", content: transcripcion }]
    });
    const campos = JSON.parse(extractRes.choices[0].message.content || "{}");

    // Llamada a MCP para crear documento en Drive
    const mcpResponse = await fetch(MCP_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Authorization": `Bearer ${MCP_API_KEY}` },
      body: JSON.stringify({
        accion: "guardar",
        template_name: tipo === "contrato_base" ? "Contrato Base 3D Pixel Perfection - Plantilla" : `ANEXO ${tipo.replace("anexo_", "").toUpperCase()} - Plantilla`,
        folder_id: DRIVE_FOLDER_ID,
        replacements: campos
      })
    });

    const mcpResult = await mcpResponse.json() as { nuevo_doc_url?: string };

    return NextResponse.json({
      success: true,
      tipo,
      documento_creado: mcpResult.nuevo_doc_url || "https://drive.google.com/drive/folders/" + DRIVE_FOLDER_ID,
      resumen: `¡Documento ${tipo} creado exitosamente en Google Drive!`
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
};

export const config = { api: { bodyParser: true } };
