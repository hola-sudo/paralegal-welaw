/**
 * Ejemplo de uso del Agente Paralegal
 * 
 * Este archivo muestra cómo usar el agente directamente en código TypeScript.
 * Para usar como API, ve a /api/process.ts
 * 
 * Para ejecutar este ejemplo:
 * 1. Asegúrate de tener OPENAI_API_KEY en tu .env
 * 2. Compila: npm run build
 * 3. Ejecuta: node dist/example.js
 */

import { processTranscript } from './paralegal-agent';

// Ejemplo de transcripción de un contrato base
const ejemploContratoBase = `
CONTRATO DE PRESTACIÓN DE SERVICIOS

Entre los suscritos:
- PARTE 1: Empresa ABC S.A. de C.V., representada por Juan Pérez
- PARTE 2: Consultoría XYZ S.C., representada por María González

FECHA DE FIRMA: 15/03/2024
FECHA DE INICIO: 01/04/2024
FECHA DE VENCIMIENTO: 31/12/2024

OBJETO DEL CONTRATO: Prestación de servicios de consultoría en tecnología
MONTO TOTAL: $500,000.00 MXN
CONDICIONES DE PAGO: Pago mensual de $41,666.67 MXN
JURISDICCIÓN: Ciudad de México
LEY APLICABLE: Leyes de los Estados Unidos Mexicanos
`;

// Ejemplo de transcripción de un anexo A
const ejemploAnexoA = `
ANEXO A - TÉRMINOS Y CONDICIONES ADICIONALES

ID DEL ANEXO: ANX-A-2024-001
REFERENCIA AL CONTRATO: CON-2024-ABC-XYZ-001
FECHA DEL ANEXO: 20/03/2024

DESCRIPCIÓN: Este anexo establece términos adicionales sobre confidencialidad y propiedad intelectual.

CLÁUSULAS ADICIONALES:
- Las partes se comprometen a mantener confidencialidad sobre los términos del contrato
- Toda propiedad intelectual generada será propiedad de la PARTE 1
- Se establece un período de vigencia de 2 años adicionales al contrato base

VIGENCIA: Hasta el 31/12/2026
FIRMANTES: Juan Pérez, María González
`;

async function ejemplo() {
  console.log('🚀 Ejemplo de uso del Agente Paralegal\n');
  
  try {
    // Procesamos el contrato base
    console.log('📄 Procesando contrato base...\n');
    const resultado1 = await processTranscript(ejemploContratoBase);
    
    console.log('✅ Resultado del contrato base:');
    console.log('Tipo de documento:', resultado1.tipo_documento);
    console.log('Datos extraídos:', JSON.stringify(resultado1.datos, null, 2));
    console.log('Guardrails PII:', resultado1.guardrails.pii.passed ? '✅ Pasó' : '❌ Bloqueado');
    console.log('Guardrails Moderación:', resultado1.guardrails.moderation.passed ? '✅ Pasó' : '❌ Bloqueado');
    console.log('\n---\n');
    
    // Procesamos el anexo A
    console.log('📄 Procesando anexo A...\n');
    const resultado2 = await processTranscript(ejemploAnexoA);
    
    console.log('✅ Resultado del anexo A:');
    console.log('Tipo de documento:', resultado2.tipo_documento);
    console.log('Datos extraídos:', JSON.stringify(resultado2.datos, null, 2));
    console.log('Guardrails PII:', resultado2.guardrails.pii.passed ? '✅ Pasó' : '❌ Bloqueado');
    console.log('Guardrails Moderación:', resultado2.guardrails.moderation.passed ? '✅ Pasó' : '❌ Bloqueado');
    
  } catch (error) {
    console.error('❌ Error al procesar:', error);
  }
}

// Ejecutamos el ejemplo si este archivo se ejecuta directamente
if (require.main === module) {
  ejemplo().catch(console.error);
}

export { ejemplo };

