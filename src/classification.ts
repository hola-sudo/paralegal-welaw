/**
 * Funciones para clasificar documentos y extraer datos usando GPT-4o
 * 
 * Estas funciones usan el modelo GPT-4o de OpenAI para:
 * 1. Clasificar el tipo de documento
 * 2. Extraer los placeholders específicos según el tipo
 */

import OpenAI from 'openai';
import { DocumentType, DocumentTypeSchema, DocumentSchemas, ExtractedData } from './schemas';

// Inicializamos el cliente de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY as string,
});

/**
 * Clasifica una transcripción de texto en uno de los 5 tipos de documentos
 * 
 * Usa GPT-4o para analizar el contenido y determinar el tipo de documento.
 * 
 * @param transcript - El texto de la transcripción a clasificar
 * @returns El tipo de documento identificado
 */
export async function classifyDocument(transcript: string): Promise<DocumentType> {
  const systemPrompt = `Eres un experto paralegal que clasifica documentos legales.

Analiza el siguiente texto y determina a qué tipo de documento pertenece:

TIPOS DE DOCUMENTOS:
- contrato_base: Contrato principal con información de partes, fechas, términos generales
- anexo_a: Anexo con términos y condiciones adicionales, cláusulas modificatorias
- anexo_b: Anexo con especificaciones técnicas, productos, servicios o entregables
- anexo_c: Anexo con términos financieros, condiciones de pago, métodos de pago
- anexo_d: Anexo con información de contacto, direcciones, procedimientos de comunicación

Responde ÚNICAMENTE con uno de estos tipos: contrato_base, anexo_a, anexo_b, anexo_c, o anexo_d.`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: transcript },
      ],
      temperature: 0.1, // Baja temperatura para respuestas más consistentes
      max_tokens: 50,
    });

    const classification = response.choices[0]?.message?.content?.trim().toLowerCase();
    
    if (!classification) {
      throw new Error('No se pudo obtener una clasificación del documento');
    }

    // Validamos que la respuesta sea uno de los tipos válidos
    const parsed = DocumentTypeSchema.safeParse(classification);
    
    if (!parsed.success) {
      // Si la respuesta no es exacta, intentamos extraer el tipo de la respuesta
      const lowerTranscript = transcript.toLowerCase();
      
      if (lowerTranscript.includes('anexo a') || lowerTranscript.includes('anexo_a')) {
        return 'anexo_a';
      }
      if (lowerTranscript.includes('anexo b') || lowerTranscript.includes('anexo_b')) {
        return 'anexo_b';
      }
      if (lowerTranscript.includes('anexo c') || lowerTranscript.includes('anexo_c')) {
        return 'anexo_c';
      }
      if (lowerTranscript.includes('anexo d') || lowerTranscript.includes('anexo_d')) {
        return 'anexo_d';
      }
      
      // Por defecto, asumimos que es un contrato base
      return 'contrato_base';
    }

    return parsed.data;
  } catch (error) {
    console.error('Error al clasificar documento:', error);
    // En caso de error, retornamos contrato_base como valor por defecto
    return 'contrato_base';
  }
}

/**
 * Extrae los placeholders específicos según el tipo de documento
 * 
 * Usa GPT-4o con structured outputs (Zod) para extraer datos estructurados.
 * 
 * @param transcript - El texto de la transcripción
 * @param documentType - El tipo de documento ya clasificado
 * @returns Los datos extraídos y validados según el schema correspondiente
 */
export async function extractPlaceholders(
  transcript: string,
  documentType: DocumentType
): Promise<ExtractedData> {
  // Obtenemos el schema correspondiente al tipo de documento
  const schema = DocumentSchemas[documentType];
  
  // Creamos el prompt específico según el tipo de documento
  const typeDescriptions = {
    contrato_base: 'un contrato base con información de partes, fechas, términos y condiciones generales',
    anexo_a: 'un anexo A con términos adicionales, cláusulas modificatorias y condiciones especiales',
    anexo_b: 'un anexo B con especificaciones técnicas, productos, servicios y entregables',
    anexo_c: 'un anexo C con términos financieros, condiciones de pago y métodos de pago',
    anexo_d: 'un anexo D con información de contacto, direcciones y procedimientos de comunicación',
  };

  const systemPrompt = `Eres un experto paralegal que extrae información estructurada de documentos legales.

Analiza el siguiente texto que corresponde a ${typeDescriptions[documentType]}.

Extrae TODA la información relevante según los campos definidos en el schema.
- Si un campo no está presente en el texto, usa null o una cadena vacía según corresponda
- Para fechas, usa el formato DD/MM/YYYY
- Para montos, incluye el símbolo de moneda si está disponible
- Sé preciso y extrae exactamente lo que dice el documento, sin inventar información
- Si hay múltiples valores (como múltiples contactos), inclúyelos todos en arrays`;

  try {
    // Usamos chat.completions con response_format json_object y luego validamos con Zod
    const response = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt + '\n\nResponde ÚNICAMENTE con un JSON válido que contenga todos los campos del schema.' },
        { role: 'user', content: transcript },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    });

    const jsonContent = response.choices[0]?.message?.content;
    
    if (!jsonContent) {
      throw new Error('No se pudieron extraer los datos del documento');
    }

    // Parseamos el JSON y validamos con Zod
    const parsed = JSON.parse(jsonContent);
    return schema.parse(parsed);
  } catch (error) {
    console.error('Error al extraer placeholders:', error);
    
    // Si hay un error de parsing, intentamos con una llamada normal y luego validamos
    try {
      const fallbackResponse = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: systemPrompt + '\n\nResponde ÚNICAMENTE con un JSON válido que siga el schema proporcionado.' },
          { role: 'user', content: transcript },
        ],
        temperature: 0.1,
        response_format: { type: 'json_object' },
      });

      const jsonContent = fallbackResponse.choices[0]?.message?.content;
      if (jsonContent) {
        const parsed = JSON.parse(jsonContent);
        return schema.parse(parsed);
      }
    } catch (fallbackError) {
      console.error('Error en fallback de extracción:', fallbackError);
    }
    
    throw new Error(`Error al extraer datos del documento tipo ${documentType}: ${error}`);
  }
}

